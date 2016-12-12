<?php

namespace FunPro\CoreBundle\RPC;

use FunPro\CoreBundle\Exception\ActiveGameException;
use FunPro\CoreBundle\Exception\NotInvitedException;
use FunPro\CoreBundle\Manager\GameManager;
use FunPro\CoreBundle\Model\Game;
use FunPro\UserBundle\Client\ClientHelper;
use FunPro\UserBundle\Manager\FriendManager;
use FunPro\UserBundle\Manager\UserManager;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\RPC\RpcInterface;
use Ratchet\ConnectionInterface;

class GameService implements RpcInterface
{
    /**
     * @var ClientHelper
     */
    private $clientHelper;

    /**
     * @var GameManager
     */
    private $gameManager;

    /**
     * @var FriendManager
     */
    private $friendManager;

    /**
     * @var UserManager
     */
    private $userManager;

    public function __construct(
        ClientHelper $clientHelper,
        GameManager $gameManager,
        FriendManager $friendManager,
        UserManager $userManager
    ) {
        $this->clientHelper = $clientHelper;
        $this->gameManager = $gameManager;
        $this->friendManager = $friendManager;
        $this->userManager = $userManager;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'game.create';
    }

    public function getActiveGame(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $game = $this->gameManager->getActiveGame($user);

        if (!$game) {
            return array(
                'status' => array('message' => 'You have not active game', 'code' => -1),
                'data' => array(),
            );
        }
        $valid = time() - 300;
        if ($game['game']['status'] === Game::STATUS_PAUSED
            and array_key_exists('nextTurnAt', $game['game']) and $game['game']['nextTurnAt'] < $valid
        ) {
            $this->gameManager->removeGame($game['id']);
            return array(
                'status' => array('message' => 'You have not active game', 'code' => -1),
                'data' => array(),
            );
        } elseif ($game['game']['status'] === Game::STATUS_WAITING) {
            $game['invitations'] = $this->gameManager->getGameInvitations($game['id']);
            $game['ttl'] = $this->gameManager->getGameTtl($game['id']);
        }

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => $game,
        );
    }

    public function inviteToGame(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $owner = $this->clientHelper->getCurrentUser($connection);
        $gameName = isset($params['gameName']) ? $params['gameName'] : Game::SEVEN;
        $friendUsername = $params['username'];
        $turnTime = array_key_exists('turnTime', $params) ? $params['turnTime'] : 10;
        $turnTime = max(min($turnTime, 15), 3);
        $point = array_key_exists('point', $params) ? $params['point'] : 100;
        $point = max(min($point, 1000), 30);

        if (!$this->friendManager->isFriend($owner->getUsername(), $friendUsername)) {
            return array(
                'status' => array('message' => 'You can only invite your friends', 'code' => -1),
                'data' => array(),
            );
        }

        try {
            $game = $this->gameManager->createPrivateGame($owner->getUsername(), $gameName, $turnTime, $point);
        } catch (ActiveGameException $e) {
            return array(
                'status' => array('message' => $e->getMessage(), 'code' => $e->getCode()),
                'data' => array(),
            );
        }

        $friendConnection = $this->clientHelper->getConnection($friendUsername);

        if (!$friendConnection) {
            return array(
                'status' => array('message' => 'User is not online', 'code' => -2),
                'data' => array(),
            );
        }

        if ($userGame = $this->gameManager->getActiveGame($friendUsername)) {
            $message = $userGame['id'] === $game['id'] ?
                'User accept previous invitation' : 'User playing now in other game';
            return array(
                'status' => array('message' => $message, 'code' => -3),
                'data' => array()
            );
        }

        try {
            $answer = $this->gameManager->getUserAnswer($game['id'], $friendUsername);
            if ($answer !== 'waiting') {
                return array(
                    'status' => array('message' => "User $answer your request", 'code' => -3),
                    'data' => array('answer' => $answer),
                );
            }
        } catch (NotInvitedException $e) {
        }

        $this->gameManager->saveUserInvitation($game['id'], $friendUsername);

        $invitation = array(
            'type' => 'game_invitation',
            'from' => $owner->getUsername(),
            'gameId' => $game['id'],
            'gameName' => $gameName,
            'sendAt' => time(),
            'status' => 'new',
            'turnTime' => $turnTime,
            'point' => $point,
        );

        $this->clientHelper->getPublicTopic()->broadcast(
            $invitation,
            array(),
            array($friendConnection->WAMP->sessionId)
        );

        return array(
            'status' => array('message' => 'Your invitation send to ' . $friendUsername, 'code' => 1),
            'data' => array('gameId' => $game['id']),
        );
    }

    public function removeInvitation(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $friendUsername = $params['username'];

        $game = $this->gameManager->getActiveGameCreatedBy($user->getUsername());

        if ($game === null) {
            return array(
                'status' => array('message' => 'Your game expired, please create another game again', 'code' => -1),
                'data' => array(),
            );
        }

        if ($game['game']['status'] !== Game::STATUS_WAITING) {
            $message = 'Your game started/closed, You can not remove invitation after game start';
            return array(
                'status' => array('message' => $message, 'code' => -2),
                'data' => array(),
            );
        }

        $invitedUsers = $this->gameManager->getInvitedUsers($game['id']);
        if (!in_array($friendUsername, $invitedUsers)) {
            return array(
                'status' => array('message' => 'User invitation is not exists', 'code' => -3),
                'data' => array(),
            );
        }

        $friendConn = $this->clientHelper->getConnection($friendUsername);
        if ($friendConn) {
            $data = array(
                'type' => 'game_invitation',
                'from' => $user->getUsername(),
                'gameId' => $game['id'],
                'status' => 'canceled',
            );
            $this->clientHelper->getPublicTopic()->broadcast($data, array(), array($friendConn->WAMP->sessionId));
        }

        $temp = array_diff($invitedUsers, array($friendUsername));
        $players = array_keys(array_filter(
            $temp,
            function ($value) {
                return $value == 'accept';
            }
        ));
        $players[] = $user->getUsername();
        $this->clientHelper->getPublicTopic()->broadcast(
            array('type' => 'game_status', 'status' => 'update_players', 'gameId' => $game['id'], 'players' => $players),
            array(),
            $this->clientHelper->getUsersSessionId($players)
        );

        if (count($invitedUsers) < 2) {
            $code = 1;
            $message = 'Your game was removed';
            $this->gameManager->removeGame($game['id']);
        } else {
            $code = 2;
            $message = 'User invitation canceled';
            $this->gameManager->removeUserInvitation($game['id'], $friendUsername);
        }

        return array(
            'status' => array('message' => $message, 'code' => $code),
            'data' => array(),
        );
    }

    public function removeInvitations(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $game = $this->gameManager->getActiveGameCreatedBy($user->getUsername());

        if ($game === null) {
            return array(
                'status' => array('message' => 'Your game expired, please create another game again', 'code' => -1),
                'data' => array(),
            );
        }

        if ($game['game']['status'] !== Game::STATUS_WAITING) {
            $message = 'Your game started/closed, You can not remove invitation after game start';
            return array(
                'status' => array('message' => $message, 'code' => -2),
                'data' => array(),
            );
        }

        $sessions = $this->clientHelper->getUsersSessionId($this->gameManager->getInvitedUsers($game['id']));
        if ($sessions) {
            $data = array(
                'type' => 'game_invitation',
                'from' => $user->getUsername(),
                'gameId' => $game['id'],
                'status' => 'canceled',
            );
            $this->clientHelper->getPublicTopic()->broadcast($data, array(), $sessions);
        }
//
//        $temp = array_diff($invitedUsers, array($friendUsername));
//        $players = array_keys(array_filter(
//            $temp,
//            function ($value) {
//                return $value == 'accept';
//            }
//        ));
//        $players[] = $user->getUsername();
//        $this->clientHelper->getPublicTopic()->broadcast(
//            array('type' => 'game_status', 'status' => 'update_players', 'gameId' => $game['id'], 'players' => $players),
//            array(),
//            $this->clientHelper->getUsersSessionId($players)
//        );

        $this->gameManager->removeGame($game['id']);

        return array(
            'status' => array('message' => 'Your game was removed', 'code' => 1),
            'data' => array(),
        );
    }

    public function getMyInvitations(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);

        $invitations = $this->gameManager->getUserInvitations($user->getUsername());
        $invitationsInfo = array();
        foreach ($invitations as $gameId) {
            $game = $this->gameManager->getGame($gameId);
            if ($game and $game['status'] == Game::STATUS_WAITING) {
                $invitationsInfo[$gameId] = $game;
            }
        }

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => array('invitations' => $invitationsInfo),
        );
    }

    public function answerToGameInvitation(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $username = $user->getUsername();

        if (!array_key_exists('answer', $params) or !array_key_exists('gameId', $params)) {
            return;
        }

        $gameId = $params['gameId'];
        $answer = $params['answer'];

        if ($userGame = $this->gameManager->getActiveGame($username)) {
            if ($userGame['id'] != $gameId) {
                return array(
                    'status' => array('message' => 'You have active game, please first previous game', 'code' => -2),
                    'data' => array(),
                );
            }
        }

        $invitations = $this->gameManager->getGameInvitations($gameId);
        if (!array_key_exists($username, $invitations)) {
            return array(
                'status' => array('message' => 'You have not invitation or Your invitation removed', 'code' => -3),
                'data' => array(),
            );
        }

        $game = $this->gameManager->getGame($gameId);
        if (!$game or $game['status'] !== Game::STATUS_WAITING) {
            return array(
                'status' => array('message' => 'You can not join to game, game was started or removed', 'code' => -4),
                'data' => array(),
            );
        }

        if ($answer === 'reject') {
            $this->gameManager->setAnswer($gameId, $username, $answer);
            $msg = array('type' => 'answer_to_game_invitation', 'from' => $username, 'answer' => $answer);
            $ownerConnection = $this->clientHelper->getConnection($game['owner']);
            if ($ownerConnection) {
                $this->clientHelper->getPublicTopic()->broadcast($msg, array(), array($ownerConnection->WAMP->sessionId));
            }
            return array(
                'status' => array('message' => 'You are removed from list', 'code' => 2),
                'data' => array(),
            );
        } else {
            $invitations[$username] = $answer;
            $accepted = array_keys(array_filter(
                $invitations,
                function ($value) {
                    return $value == 'accept';
                }
            ));

            //owner is not in this list
            if (count($accepted) >= 4) {
                return array(
                    'status' => array('message' => 'Sorry, Game is full and will start as soon', 'code' => -6),
                    'data' => array(),
                );
            }

            $this->gameManager->setAnswer($gameId, $username, $answer);
        }

        $gameOwnerUsername = $game['owner'];
        $accepted[] = $gameOwnerUsername;
        $sessions = $this->clientHelper->getUsersSessionId(array_keys($accepted));

        $msg = array('type' => 'answer_to_game_invitation', 'from' => $username, 'answer' => $answer);
        $ownerConnection = $this->clientHelper->getConnection($game['owner']);
        if ($ownerConnection) {
            $this->clientHelper->getPublicTopic()->broadcast($msg, array(), array($ownerConnection->WAMP->sessionId));
        }

        if (count($accepted) === 4) {
            $this->gameManager->prepareGame($gameId);
            $message = array('type' => 'game_status', 'status' => 'started', 'gameId' => $gameId);
            $this->clientHelper->getPublicTopic()->broadcast($message, array(), $sessions);
        } else {
            $this->clientHelper->getPublicTopic()->broadcast(
                array('type' => 'game_status', 'status' => 'update_players', 'gameId' => $gameId, 'players' => $accepted),
                array(),
                $sessions
            );
        }

        return array(
            'status' => array('message' => 'You accept invitation, please wait till game start', 'code' => 1),
            'data' => array(),
        );
    }

    public function start(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $game = $this->gameManager->getActiveGameCreatedBy($user->getUsername());

        if (!$game or $game['game']['status'] !== Game::STATUS_WAITING) {
            return array(
                'status' => array('message' => 'Your game started or is not exists', 'code' => -1),
                'data' => array(),
            );
        }

        $invitations = $this->gameManager->getGameInvitations($game['id']);
        $accepted = array_keys(array_filter(
            $invitations,
            function ($value) {
                return $value == 'accept';
            }
        ));

        if (count($accepted) < 1) {
            return array(
                'status' => array('message' => 'You must add at least one friend', 'code' => -2),
                'data' => array(),
            );
        }

        $this->gameManager->prepareGame($game['id']);
        $accepted[] = $user->getUsername();
        $message = array('type' => 'game_status', 'status' => 'prepare', 'game' => $game);
        $this->clientHelper->getPublicTopic()->broadcast($message, array(), $this->clientHelper->getUsersSessionId($accepted));

        return array(
            'status' => array('message' => 'Game started', 'code' => 1),
            'data' => array(),
        );
    }
}

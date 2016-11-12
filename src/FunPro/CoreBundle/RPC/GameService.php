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

        if ($game['game']['status'] === Game::STATUS_WAITING) {
            $game['invitations'] = $this->gameManager->getGameInvitations($game['id']);
            $game['ttl'] = $this->gameManager->getGameTtl($game['id']);
        } else {
            // retrive game players and other information.
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

        if (!$this->friendManager->isFriend($owner->getUsername(), $friendUsername)) {
            return array(
                'status' => array('message' => 'You can only invite your friends', 'code' => -1),
                'data' => array(),
            );
        }

        try {
            $game = $this->gameManager->createPrivateGame($owner->getUsername(), $gameName);
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
            $message = 'Your game started/closed, You can remove invitation after game start';
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
}

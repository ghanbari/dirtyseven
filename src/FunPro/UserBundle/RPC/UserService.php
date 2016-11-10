<?php

namespace FunPro\UserBundle\RPC;

use Doctrine\Bundle\DoctrineBundle\Registry;
use FunPro\UserBundle\Client\ClientHelper;
use FunPro\UserBundle\Manager\CommunicationManager;
use Gos\Bundle\WebSocketBundle\Client\ClientManipulator;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\RPC\RpcInterface;
use Predis\Client;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\TopicManager;
use Symfony\Component\Security\Core\User\UserInterface;

class UserService implements RpcInterface
{
    /**
     * @var TopicManager
     */
    private $topicManager;

    /**
     * @var ClientHelper
     */
    private $clientHelper;

    /**
     * @var CommunicationManager
     */
    private $comManager;

    public function __construct(
        TopicManager $topicManager,
        ClientHelper $clientHelper,
        CommunicationManager $comManager
    ) {
        $this->topicManager = $topicManager;
        $this->clientHelper = $clientHelper;
        $this->comManager = $comManager;
    }

    public function getChatMessage(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $page = min(max(0, $params['page']), 5);
        $user = $this->clientHelper->getCurrentUser($connection);
        $messages = $this->comManager->getLastMessage($user->getUsername(), $params['username'], $page);

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => array('messages' => $messages),
        );
    }

//    private function createGame(UserInterface $owner, $type='public', $gameName='7')
//    {
//        $game = array(
//            'type' => $type,
//            'gameName' => $gameName,
//            'status' => 'waiting',
//            'owner' => $owner->getUsername(),
//        );
//
//        do {
//            $gameId = time() . random_int(11111, 99999) . '0';
//        } while ($this->redis->exists("Games:$gameId"));
//
//        $this->redis->hset('Users:Games', $owner->getUsername(), $gameId);
//        $this->redis->hmset("Games:$gameId", $game);
//
//        $this->redis->expire("Games:$gameId", 3600);
//
//        return array(
//            'id' => $gameId,
//            'game' => $game
//        );
//    }
//
//
//    /**
//     * @param UserInterface $owner
//     *
//     * @return array
//     *
//     * @throws \RuntimeException
//     */
//    private function getNotStartedGame(UserInterface $owner)
//    {
//        $gameId = $this->redis->hget('Users:Games', $owner->getUsername());
//        if (is_null($gameId)) {
//            return $this->createGame($owner, 'private');
//        }
//
//        $game = $this->redis->hgetall("Games:$gameId");
//        if (!$game or $game['status'] == 'closed') {
//            return $this->createGame($owner, 'private');
//        } elseif ($game['status'] == 'waiting'
//            and $game['type'] == 'private'
//            and $game['owner'] == $owner->getUsername()
//        ) {
//            return array(
//                'id' => $gameId,
//                'game' => $game,
//            );
//        }
//
//        if ($game['status'] == 'playing') {
//            throw new \RuntimeException('You have active game');
//        } else {
//            throw new \RuntimeException('You can not invite users to this game');
//        }
//    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'user.rpc';
    }

//    public function status(ConnectionInterface $connection, WampRequest $request, $params)
//    {
//        $user = $this->clientManipulator->getClient($connection);
//        $status = $this->redis->hget('users_status', $user->getId());
//
//        if (is_null($status)) {
//            $status = 'free';
//            $this->redis->hset('users_status', $user->getId(), 'free');
//        }
//
//        return array(
//            'status' => array('message' => 'success', 'code' => 200),
//            'data' => array('status' => $status),
//        );
//    }

//    public function invitedToGame(ConnectionInterface $connection, WampRequest $request, $params)
//    {
//        $owner = $this->clientManipulator->getClient($connection);
//        $gameId = $this->redis->hget('Users:Games', $owner->getUsername());
//        if (is_null($gameId) or !($game = $this->redis->hgetall("Games:$gameId"))) {
//            if ($gameId) {
//                $this->redis->hdel('Users:Games', $owner->getUsername());
//            }
//
//            return array(
//                'status' => array('message' => 'You have not active game', 'code' => 400),
//                'data' => array('status' => 'free'),
//            );
//        }
//
//        if ($game['status'] == 'waiting') {
//            $users = $this->redis->hgetall("PrivateGames:$gameId:invitations");
//            return array(
//                'status' => array('message' => 'success', 'code' => 200),
//                'data' => array('users' => $users, 'status' => 'waiting'),
//            );
//        }
//
//        return array(
//            'status' => array('message' => 'You are not in queue', 'code' => 400),
//            'data' => array('status' => $game['status']),
//        );
//    }
//
//    public function inviteToGame(ConnectionInterface $connection, WampRequest $request, $params)
//    {
//        $owner = $this->clientManipulator->getClient($connection);
//        try {
//            $game = $this->getNotStartedGame($owner);
//        } catch (\RuntimeException $e) {
//            return array(
//                'status' => array('message' => $e->getMessage(), 'code' => 400),
//                'data' => array(),
//            );
//        }
//
//        if ($owner->getUsername() == $params['username']) {
//            return array(
//                'status' => array('message' => 'You can not invite yourself to game', 'code' => 400),
//                'data' => array(),
//            );
//        }
//
//        $publicTopic = $this->topicManager->getTopic('chat/public');
//        $user = $this->clientManipulator->findByUsername($publicTopic, $params['username']);
//
//        if (!$user) {
//            $isExists = $this->doctrine->getRepository('FunProUserBundle:User')->findOneByUsername($params['username']);
//            $message = $isExists ? 'User is not online' : 'User is not exists';
//            return array(
//                'status' => array('message' => $message, 'code' => 404),
//                'data' => array(),
//            );
//        }
//
//        $userConnection = $user['connection'];
//        $user = $user['client'];
//
//        if ($userGame = $this->redis->hget('Users:Games', $user->getUsername())) {
//            $message = $userGame == $game['id'] ? 'User accept previous invitation' : 'User playing now in other game';
//            return array(
//                'status' => array('message' => $message, 'code' => 400),
//                'data' => array()
//            );
//        }
//
//        $invitation = $this->redis->hget("PrivateGames:{$game['id']}:invitations", $user->getUsername());
//        if ($invitation and $invitation != 'waiting') {
//            return array(
//                'status' => array('message' => "User $invitation your request", 'code' => 400),
//                'data' => array()
//            );
//        }
//
//        $invitation = array(
//            'type' => 'invite_to_game',
//            'from' => $owner->getUsername(),
//            'gameId' => $game['id'],
//            'gameType' => 7,
//            'sendAt' => time(),
//        );
//
//        $this->redis->hset("PrivateGames:{$game['id']}:invitations", $user->getUsername(), 'waiting');
//        $this->redis->expire("PrivateGames:{$game['id']}:invitations", $this->redis->ttl('Games:' . $game['id']) + 1);
//        $this->redis->zadd('GameInvitation:' . $user->getUsername(), array(serialize($invitation) => $game['id']));
//        $this->redis->zremrangebyscore('GameInvitation:' . $user->getUsername(), 0, (time() - 3600) . '999990');
//
//        $publicTopic->broadcast(
//            $invitation,
//            array(),
//            array($userConnection->WAMP->sessionId)
//        );
//
//        return array(
//            'status' => array('message' => 'Your invitation send to ' . $params['username'], 'code' => 200),
//            'data' => array(),
//        );
//    }
//
//    public function answerToGameInvite(ConnectionInterface $connection, WampRequest $request, $params)
//    {
//        $user = $this->clientManipulator->getClient($connection);
//        $gameId = $this->redis->hget('Users:Games', $user->getUsername());
//        if ($gameId) {
//            $game = $this->redis->hgetall("Games:$gameId");
//            if ($gameId == $params['gameId']) {
//                if (!$game or $game['status'] != 'waiting') {
//                    return array(
//                        'status' => array('message' => 'Your invitation expired', 'code' => -1),
//                        'data' => array(),
//                    );
//                }
//            } else {
//                if ($game and $game['status'] != 'closed') {
//                    return array(
//                        'status' => array('message' => 'You are in game and can not play another game', 'code' => -2),
//                        'data' => array(),
//                    );
//                }
//            }
//        }
//
//        $invitations = $this->redis->hgetall("PrivateGames:{$params['gameId']}:invitations");
//        if (!array_key_exists($user->getUsername(), $invitations)) {
//            return array(
//                'status' => array('message' => 'Your invitation was deleted', 'code' => -3),
//                'data' => array(),
//            );
//        }
//
//        #TODO: replace 5 with max players for given game
//        // owner is not in the list
//        $accepted = array_keys(array_filter(
//            $invitations,
//            function ($value) {
//                return $value == 'accept';
//            }
//        ));
//
//        if (count($accepted) >= 4) {
//            return array(
//                'status' => array('message' => 'Sorry, Game is full and will start as soon', 'code' => -4),
//                'data' => array(),
//            );
//        }
//
//        $this->redis->hset("PrivateGames:{$params['gameId']}:invitations", $user->getUsername(), $params['answer']);
//        $this->redis->hset('Users:Games', $user->getUsername(), $params['gameId']);
//
//        $publicTopic = $this->topicManager->getTopic('chat/public');
//        $message = $params['answer'] ? 'I accept invitation and will play with you' : 'Sorry, I can not play now';
//
//        $sessions = array();
//        $gameOwnerUsername = $this->redis->hget("Games:{$params['gameId']}", 'owner');
//        $accepted[] = $gameOwnerUsername;
//        foreach ($accepted as $playerUsername) {
//            $player = $this->clientManipulator->findByUsername($publicTopic, $playerUsername);
//            if ($player) {
//                $sessions[] = $player['connection']->WAMP->sessionId;
//            }
//        }
//
//        $publicTopic->broadcast(
//            array('type' => 'notify', 'from' => $user->getUsername(), 'message' => $message),
//            array(),
//            $sessions
//        );
//
//        if (count($accepted) == 4) {
//            $message = array('type' => 'notify', 'from' => 'Bot', 'message' => 'Game if full, please start game');
//
//            $this->redis->lpush("Inbox:$gameOwnerUsername", array(serialize($message)));
//            $this->redis->lpush("Logs:{$params['gameId']}", array(serialize($message)));
//            $this->redis->expire("Logs:{$params['gameId']}", 86400);
//
//            $gameOwner = $this->clientManipulator->findByUsername($publicTopic, $gameOwnerUsername);
//            if ($gameOwner) {
//                $publicTopic->broadcast($message, array(), $gameOwner['connection']->WAMP->sessionId);
//            }
//        }
//
//        return array(
//            'status' => array('message' => 'You are joined to game', 'code' => 1),
//            'data' => array(),
//        );
//    }
}

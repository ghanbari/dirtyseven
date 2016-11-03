<?php

namespace FunPro\UserBundle\RPC;

use Doctrine\Bundle\DoctrineBundle\Registry;
use FunPro\UserBundle\Persistence\Blacklist;
use FunPro\UserBundle\Persistence\Friend;
use Gos\Bundle\WebSocketBundle\Client\ClientManipulator;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\RPC\RpcInterface;
use Predis\Client;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\TopicManager;

class FriendService implements RpcInterface
{
    /**
     * @var ClientManipulator
     */
    private $clientManipulator;

    /**
     * @var TopicManager
     */
    private $topicManager;

    /**
     * @var Client
     */
    private $redis;

    /**
     * @var Registry
     */
    private $doctrine;

    /**
     * @var Friend
     */
    private $friendService;

    /**
     * @var Blacklist
     */
    private $blacklist;

    public function __construct(
        TopicManager $topicManager,
        ClientManipulator $clientManipulator,
        Client $redis,
        Registry $doctrine,
        Friend $friendService,
        Blacklist $blacklist
    ) {
        $this->clientManipulator = $clientManipulator;
        $this->topicManager = $topicManager;
        $this->redis = $redis;
        $this->doctrine = $doctrine;
        $this->friendService = $friendService;
        $this->blacklist = $blacklist;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'friend.rpc';
    }

    public function sendFriendRequestToUsername(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $friendUsername = $params['username'];
        $user = $this->clientManipulator->getClient($connection);

        if ($user->getUsername() == $friendUsername) {
            return array(
                'status' => array('message' => 'You can not send request to your.', 'code' => -1),
                'data' => array(),
            );
        }

        $friend = $this->doctrine->getRepository('FunProUserBundle:User')->findOneByUsername($friendUsername);
        if (!$friend) {
            return array(
                'status' => array('message' => 'User is not exists.', 'code' => -2),
                'data' => array(),
            );
        }

        if ($this->blacklist->isBlocked($user->getUsername(), $friendUsername)) {
            return array(
                'status' => array('message' => 'You are blocked by user or you blocked his', 'code' => -3),
                'data' => array(),
            );
        }

        if ($this->friendService->isFriend($user->getUsername(), $friendUsername)) {
            return array(
                'status' => array('message' => 'You are friends', 'code' => -4),
                'data' => array(),
            );
        }

        if ($this->friendService->hasRequestFrom($user->getUsername(), $friendUsername)) {
            return $this->addFriend($user->getUsername(), $friendUsername, true);
        }

        if ($this->friendService->hasRequestFrom($friendUsername, $user->getUsername())) {
            return array(
                'status' => array('message' => 'You send request in the past', 'code' => -5),
                'data' => array(),
            );
        }

        $countOfRequest = $this->friendService->countOfSentRequest($user->getUsername());
        if ($countOfRequest > 50) {
            return array(
                'status' => array('message' => 'You can only send 50 friend request.', 'code' => -6),
                'data' => array(),
            );
        }

        $this->friendService->sendRequest($user->getUsername(), $friendUsername);

        $publicTopic = $this->topicManager->getTopic('chat/public');
        $friendConnection = $this->clientManipulator->findByUsername($publicTopic, $friendUsername);
        if ($friendConnection) {
            $message = array(
                'from' => $user->getUsername(),
                'message' => 'I would like add you to friend list',
                'type' => 'friend_request',
            );
            $publicTopic->broadcast(
                $message,
                array(),
                array($friendConnection['connection']->WAMP->sessionId)
            );
        }

        return array(
            'status' => array('message' => 'Your request send to user', 'code' => 1),
            'data' => array('count' => $countOfRequest + 1),
        );
    }

    public function cancelFriendRequest(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientManipulator->getClient($connection);
        $friendUsername = $params['username'];

        if (!$this->redis->sismember('FriendRequestFrom:' . $user->getUsername(), $friendUsername)) {
            return array(
                'status' => array('message' => 'You did removed this request before', 'code' => -1),
                'data' => array(),
            );
        }

        $this->redis->srem('FriendRequestFrom:' . $user->getUsername(), $friendUsername);
        $this->redis->srem('FriendRequestTo:' . $friendUsername, $user->getUsername());

        return array(
            'status' => array('message' => 'You remove friend request to '.$friendUsername, 'code' => 1),
            'data' => array(),
        );
    }

    public function friendRequests(ConnectionInterface $connection, WampRequest $request, $params)
    {

    }

    private function addFriend($username, $friendUsername, $answer=true)
    {
        if ($answer) {
            $this->redis->sadd('Friends:' . $friendUsername, $username);
            $this->redis->sadd('Friends:' . $username, $friendUsername);
        }

        $this->redis->srem('FriendRequestTo:' . $username, $friendUsername);
        $this->redis->srem('FriendRequestFrom:' . $friendUsername, $username);

        $publicTopic = $this->topicManager->getTopic('chat/public');
        $friendConnection = $this->clientManipulator->findByUsername($publicTopic, $friendUsername);
        if ($friendConnection) {
            $message = array(
                'from' => $username,
                'answer' => $answer,
                'type' => 'answer_to_friend_request',
                'message' => $answer ? 'I accept your request' : 'Sorry, I can not accept your request',
            );
            $publicTopic->broadcast(
                $message,
                array(),
                array($friendConnection['connection']->WAMP->sessionId)
            );
        } else {
            //TODO: save in inbox
        }

        $message = $answer ? "You are friend with $friendUsername" : 'You reject this request.';
        return array(
            'status' => array('message' => $message, 'code' => 10),
            'data' => array('username' => $friendUsername),
        );
    }

    public function answerToFriendRequest(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientManipulator->getClient($connection);
        $friendUsername = $params['username'];

        if (!$this->redis->sismember('FriendRequestTo:' . $user->getUsername(), $friendUsername)) {
            return array(
                'status' => array('message' => 'Your invitation was removed by ' . $friendUsername, 'code' => -1),
                'data' => array(),
            );
        }

        if (!isset($params['answer'])) {
            return;
        }

        if ($params['answer']) {
            return $this->addFriend($user->getUsername(), $friendUsername);
        } else {
            $this->redis->srem('FriendRequestTo:' . $user->getUsername(), $friendUsername);
            $this->redis->srem('FriendRequestFrom:' . $friendUsername, $user->getUsername());
            return array(
                'status' => array('message' => 'You reject this request.', 'code' => 1),
                'data' => array('username' => $friendUsername),
            );
        }
    }

    public function friends(ConnectionInterface $connection, WampRequest $request, $params)
    {

    }

    public function removeFriend(ConnectionInterface $connection, WampRequest $request, $params)
    {

    }
}

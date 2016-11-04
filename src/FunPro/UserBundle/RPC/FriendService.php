<?php

namespace FunPro\UserBundle\RPC;

use FunPro\UserBundle\Persistence\Blacklist;
use FunPro\UserBundle\Persistence\Friend;
use FunPro\UserBundle\Persistence\Inbox;
use FunPro\UserBundle\Persistence\User as UserHelper;
use FunPro\UserBundle\Security\Core\User\UserManager;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\RPC\RpcInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\TopicManager;

class FriendService implements RpcInterface
{
    /**
     * @var TopicManager
     */
    private $topicManager;

    /**
     * @var Friend
     */
    private $friendService;

    /**
     * @var Blacklist
     */
    private $blacklist;

    /**
     * @var Inbox
     */
    private $inbox;

    /**
     * @var UserHelper
     */
    private $user;

    /**
     * @var UserManager
     */
    private $userManager;

    /**
     * @param TopicManager $topicManager
     * @param Friend       $friendService
     * @param Blacklist    $blacklist
     * @param Inbox        $inbox
     * @param UserHelper   $user
     * @param UserManager  $userManager
     */
    public function __construct(
        TopicManager $topicManager,
        Friend $friendService,
        Blacklist $blacklist,
        Inbox $inbox,
        UserHelper $user,
        UserManager $userManager
    ) {
        $this->topicManager = $topicManager;
        $this->friendService = $friendService;
        $this->blacklist = $blacklist;
        $this->inbox = $inbox;
        $this->user = $user;
        $this->userManager = $userManager;
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
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        if ($user->getUsername() == $friendUsername) {
            return array(
                'status' => array('message' => 'You can not send request to your.', 'code' => -1),
                'data' => array(),
            );
        }

        $friend = $this->user->findUser($friendUsername);
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

        $countOfRequest = $this->friendService->countOfRequests($user->getUsername());
        if ($countOfRequest > 50) {
            return array(
                'status' => array('message' => 'You can only send 50 friend request.', 'code' => -6),
                'data' => array(),
            );
        }

        $this->friendService->saveRequest($user->getUsername(), $friendUsername);

        $publicTopic = $this->topicManager->getTopic('chat/public');
        $friendConnection = $this->userManager->getConnection($friendUsername);
        if ($friendConnection) {
            $message = array(
                'from' => $user->getUsername(),
                'message' => 'I would like add you to friend list',
                'type' => 'friend_invitation',
                'status' => 'new',
            );
            $publicTopic->broadcast(
                $message,
                array(),
                array($friendConnection->WAMP->sessionId)
            );
        } else {
            $this->inbox->add($friendUsername, $user->getUsername(), 'I would like add you to friend list');
        }

        return array(
            'status' => array('message' => 'Your request send to user', 'code' => 1),
            'data' => array('count' => $countOfRequest + 1),
        );
    }

    public function cancelFriendRequest(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $friendUsername = $params['username'];
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        if (!$this->friendService->hasRequestFrom($friendUsername, $user->getUsername())) {
            return array(
                'status' => array('message' => 'You did removed this request before', 'code' => -1),
                'data' => array(),
            );
        }

        $this->friendService->removeRequest($user->getUsername(), $friendUsername);

        $publicTopic = $this->topicManager->getTopic('chat/public');
        $friendConnection = $this->userManager->getConnection($friendUsername);
        if ($friendConnection) {
            $message = array(
                'from' => $user->getUsername(),
                'message' => 'Sorry, I write wrong username.',
                'type' => 'friend_invitation',
                'status' => 'canceled',
            );
            $publicTopic->broadcast(
                $message,
                array(),
                array($friendConnection->WAMP->sessionId)
            );
        } else {
            $this->inbox->add($friendUsername, $user->getUsername(), 'Sorry, I write wrong username.');
        }

        return array(
            'status' => array('message' => 'You remove friend request to '.$friendUsername, 'code' => 1),
            'data' => array(),
        );
    }

    private function addFriend($username, $friendUsername, $answer=true)
    {
        if ($answer) {
            $this->friendService->addFriend($username, $friendUsername);
        }

        $this->friendService->removeRequest($friendUsername, $username);

        $publicTopic = $this->topicManager->getTopic('chat/public');
        $friendConnection = $this->userManager->getConnection($friendUsername);
        if ($friendConnection) {
            $message = array(
                'from' => $username,
                'answer' => $answer,
                'type' => 'answer_to_friend_invitation',
                'message' => $answer ? 'I accept your request' : 'Sorry, I can not accept your request',
            );
            $publicTopic->broadcast(
                $message,
                array(),
                array($friendConnection->WAMP->sessionId)
            );
        } else {
            if ($answer) {
                $this->inbox->add($friendUsername, $username, 'I accept your request');
            }
        }

        $message = $answer ? "You are friend with $friendUsername" : 'You reject this request.';
        return array(
            'status' => array('message' => $message, 'code' => 10),
            'data' => array('username' => $friendUsername),
        );
    }

    public function answerToFriendRequest(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $friendUsername = $params['username'];
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        if (!$this->friendService->hasRequestFrom($user->getUsername(), $friendUsername)) {
            return array(
                'status' => array('message' => 'Your invitation was removed by ' . $friendUsername, 'code' => -1),
                'data' => array(),
            );
        }

        if (!isset($params['answer'])) {
            return;
        }

        return $this->addFriend($user->getUsername(), $friendUsername, $params['answer']);
    }

    public function removeFriend(ConnectionInterface $connection, WampRequest $request, $params)
    {
        if (!isset($params['username'])) {
            return;
        }

        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        if (!$this->friendService->isFriend($user->getUsername(), $params['username'])) {
            return array(
                'status' => array('message' => 'You are not friends', 'code' => -1),
                'data' => array(),
            );
        }

        $this->friendService->removeFriend($user->getUsername(), $params['username']);

        $publicTopic = $this->topicManager->getTopic('chat/public');
        $friendConnection = $this->userManager->getConnection($params['username']);
        if ($friendConnection) {
            $message = array(
                'from' => $user->getUsername(),
                'message' => 'Sorry, I remove you from your friend list',
                'type' => 'remove_friend',
            );
            $publicTopic->broadcast(
                $message,
                array(),
                array($friendConnection->WAMP->sessionId)
            );
        } else {
            $this->inbox->add($params['username'], $user->getUsername(), 'Sorry, I remove you from your friend list');
        }

        return array(
            'status' => array('message' => "You remove {$params['username']} from friend list", 'code' => 1),
            'data' => array(),
        );
    }

    public function friendRequests(ConnectionInterface $connection, WampRequest $request, $params)
    {
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        $requests = $this->friendService->getRequests($user->getUsername());

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => array('requests' => $requests),
        );
    }

    public function friendSuggests(ConnectionInterface $connection, WampRequest $request, $params)
    {
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        $suggests = $this->friendService->getSuggests($user->getUsername());

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => array('suggests' => $suggests),
        );
    }

    public function friends(ConnectionInterface $connection, WampRequest $request, $params)
    {
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        $friends = $this->friendService->getFriends($user->getUsername());

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => array('friends' => $friends),
        );
    }

    public function friendsAndInvitations(ConnectionInterface $connection, WampRequest $request, $params)
    {
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        $requests = $this->friendService->getRequests($user->getUsername());
        $suggests = $this->friendService->getSuggests($user->getUsername());
        $friends = $this->friendService->getFriends($user->getUsername());

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => array('friends' => $friends, 'suggests' => $suggests, 'requests' => $requests),
        );
    }
}

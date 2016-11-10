<?php

namespace FunPro\UserBundle\Manager;

use Doctrine\Bundle\DoctrineBundle\Registry;
use FunPro\UserBundle\Entity\User;
use Predis\Client;
use Symfony\Component\Security\Core\User\UserInterface;

class FriendManager
{
    /**
     * @var Client
     */
    private $redis;

    /**
     * @var Registry
     */
    private $doctrine;

    public function __construct(Client $redis, Registry $doctrine)
    {
        $this->redis = $redis;
        $this->doctrine = $doctrine;
    }

    public function hasRequestFrom($username, $fromUsername)
    {
        return $this->redis->sismember('FriendRequestTo:' . $username, $fromUsername)
            or $this->redis->sismember('FriendRequestFrom:' . $fromUsername, $username);
    }

    public function countOfRequests($username)
    {
        return $this->redis->scard('FriendRequestFrom:' . $username);
    }

    public function saveRequest($fromUsername, $toUsername)
    {
        return $this->redis->sadd('FriendRequestFrom:' . $fromUsername, array($toUsername)) +
        $this->redis->sadd('FriendRequestTo:' . $toUsername, array($fromUsername));
    }

    public function removeRequest($username, $friendUsername)
    {
        return $this->redis->srem('FriendRequestFrom:' . $username, $friendUsername) +
        $this->redis->srem('FriendRequestTo:' . $friendUsername, $username);
    }

    public function getRequests($username)
    {
        return $this->redis->smembers("FriendRequestFrom:$username");
    }

    public function getSuggests($username)
    {
        return $this->redis->smembers("FriendRequestTo:$username");
    }

    public function addFriend($username, $friendUsername)
    {
        return $this->redis->sadd('Friends:' . $friendUsername, $username) +
        $this->redis->sadd('Friends:' . $username, $friendUsername);
    }

    public function removeFriend($username, $friendUsername)
    {
        return $this->redis->srem('Friends:' . $username, $friendUsername) +
        $this->redis->srem('Friends:' . $friendUsername, $username);
    }

    public function getFriends($username)
    {
        return $this->redis->smembers("Friends:$username");
    }

    public function getFriendsStatus($username)
    {
        $friends = $this->getFriends($username);

        if (empty($friends)) {
            return;
        }

        $status = $this->redis->hmget('Users:Status', $friends);
        $result = array();
        for ($i = 0; $i < count($friends); $i++) {
            $result[$friends[$i]] = $status[$i] ?: User::STATUS_OFFLINE;
        }
        return $result;
    }

    public function isFriend($username, $otherUsername)
    {
        return $this->redis->sismember('Friends:' . $username, $otherUsername)
        and $this->redis->sismember('Friends:' . $otherUsername, $username);
    }
}

<?php

namespace FunPro\UserBundle\Persistence;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Predis\Client;
use Symfony\Component\Security\Core\User\UserInterface;

class Friend
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

    public function isFriend($username, $otherUsername)
    {
        return $this->redis->sismember('Friends:' . $username, $otherUsername)
            and $this->redis->sismember('Friends:' . $otherUsername, $username);
    }

    public function countOfSentRequest($username)
    {
        return $this->redis->scard('FriendRequestFrom:' . $username);
    }

    public function sendRequest($fromUsername, $toUsername)
    {
        $this->redis->sadd('FriendRequestFrom:' . $fromUsername, array($toUsername));
        $this->redis->sadd('FriendRequestTo:' . $toUsername, array($fromUsername));
    }
}

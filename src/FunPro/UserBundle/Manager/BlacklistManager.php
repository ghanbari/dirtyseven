<?php

namespace FunPro\UserBundle\Manager;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Predis\Client;
use Symfony\Component\Security\Core\User\UserInterface;

class BlacklistManager
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

    public function addToBlacklist($username, $blockedUsername)
    {
        return $this->redis->sadd('Blacklist:' . $username, $blockedUsername);
    }

    public function isBlocked($username, $otherUsername)
    {
        return $this->redis->sismember('Blacklist:' . $username, $otherUsername)
        or $this->redis->sismember('Blacklist:' . $otherUsername, $username);
    }
}

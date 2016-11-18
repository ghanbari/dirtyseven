<?php

namespace FunPro\UserBundle\Manager;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Predis\Client;
use Symfony\Component\Security\Core\User\UserInterface;

class UserManager
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

    public function findUser($username)
    {
        return $this->doctrine->getRepository('FunProUserBundle:User')->findOneByUsernameCanonical($username);
    }

    public function updateStatus($username, $status)
    {
        return $this->redis->hset('Users:Status', $username, $status);
    }
}

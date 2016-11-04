<?php

namespace FunPro\UserBundle\Persistence;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Predis\Client;
use Symfony\Component\Security\Core\User\UserInterface;

class User
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
        return $this->doctrine->getRepository('FunProUserBundle:User')->findOneByUsername($username);
    }
}

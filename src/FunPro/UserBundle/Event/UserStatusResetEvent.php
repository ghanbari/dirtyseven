<?php

namespace FunPro\UserBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class UserStatusResetEvent extends Event
{
    /**
     * @var
     */
    private $username;

    public function __construct($username)
    {
        $this->username = $username;
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->username;
    }
}

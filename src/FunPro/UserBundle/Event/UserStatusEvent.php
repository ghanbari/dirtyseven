<?php

namespace FunPro\UserBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class UserStatusEvent extends Event
{
    /**
     * @var
     */
    private $username;

    /**
     * @var
     */
    private $status;

    public function __construct($username, $status)
    {
        $this->username = $username;
        $this->status = $status;
    }

    /**
     * @return mixed
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @return mixed
     */
    public function getUsername()
    {
        return $this->username;
    }
}

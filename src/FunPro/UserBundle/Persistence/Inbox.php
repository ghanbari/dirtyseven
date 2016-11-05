<?php

namespace FunPro\UserBundle\Persistence;

use Predis\Client;

class Inbox
{
    /**
     * @var Client
     */
    private $redis;

    public function __construct(Client $redis)
    {
        $this->redis = $redis;
    }

    /**
     * @param $to String username
     * @param $from String username
     * @param $message
     *
     * @return int
     */
    public function add($to, $from, $message)
    {
        $serializedMessage = serialize(array('from' => $from, 'message' => $message, 'type' => 'notification'));
        $res = $this->redis->lpush("Inbox:$to", $serializedMessage);
        $this->redis->ltrim("Inbox:$to", 0, 100);
        return $res;
    }

    public function getAll($username, $doPop=true)
    {
        $result = $this->redis->lrange("Inbox:$username", 0, -1);
        if ($doPop) {
            $this->redis->ltrim("Inbox:$username", 1, 0);
        }

        $result = $result ? array_reverse($result) : $result;

        return $result;
    }
}

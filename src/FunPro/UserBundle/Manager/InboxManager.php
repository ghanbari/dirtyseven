<?php

namespace FunPro\UserBundle\Manager;

use Predis\Client;

class InboxManager
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

    public function addLog($gameId, $message)
    {
        $this->redis->lpush("Logs:$gameId", $message);
        $this->redis->ltrim("Logs:$gameId", 0, 300);
    }

    public function getLogs($gameId)
    {
        return $this->redis->lrange("Logs:$gameId", 0, -1);
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

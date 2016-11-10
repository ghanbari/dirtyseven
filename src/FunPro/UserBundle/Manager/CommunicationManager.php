<?php

namespace FunPro\UserBundle\Manager;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Predis\Client;

class CommunicationManager
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

    public function getChatRoomName($username, $friendUsername)
    {
        $room = $this->redis->hget("Chats:$username", $friendUsername);

        if (is_null($room)) {
            $room = "Chats:$username:$friendUsername";
            $this->redis->hset("Chats:$username", $friendUsername, $room);
            $this->redis->hset("Chats:$friendUsername", $username, $room);
        }

        return $room;
    }

    public function saveChatMessage($fromUsername, $toUsername, $message)
    {
        $key = $this->getChatRoomName($fromUsername, $toUsername);
        $data = array(
            'from' => $fromUsername,
            'time' => time(),
            'message' => substr($message, 0, 500),
        );
        if ($this->redis->lpush($key, serialize($data))) {
            $this->redis->ltrim($key, 0, 500);
            return $data;
        }
    }

    public function getLastMessage($username, $friendUsername, $page)
    {
        $page -= 1;
        $key = $this->getChatRoomName($username, $friendUsername);
        $messages = $this->redis->lrange($key, $page * 100, ($page + 1) * 100);
        return $messages;
    }
}

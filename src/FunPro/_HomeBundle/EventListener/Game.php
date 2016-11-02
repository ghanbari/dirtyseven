<?php

namespace FunPro\HomeBundle\EventListener;

use FOS\UserBundle\Model\UserInterface;
use Gos\Bundle\WebSocketBundle\Client\ClientManipulatorInterface;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\RPC\RpcInterface;
use Predis\Client;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\TopicManager;

class Game implements RpcInterface
{
    /**
     * @var Client
     */
    private $redis;

    /**
     * @var ClientManipulatorInterface
     */
    private $clientManipulator;

    /**
     * @var TopicManager
     */
    private $topicManager;

    public function __construct(Client $redis, ClientManipulatorInterface $clientManipulator, TopicManager $topicManager)
    {
        $this->redis = $redis;
        $this->clientManipulator = $clientManipulator;
        $this->topicManager = $topicManager;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'game';
    }

    /**
     * @param ConnectionInterface $connection
     * @param WampRequest         $request
     * @param                     $params [game_id]
     */
    public function cards(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $game_room = $params['room'];
        if (!$this->redis->exists("cards:$game_room")) {
            $users = $this->redis->smembers('queue');
            $cards = $this->createCards($users);
            foreach ($cards as $owner => $part) {
                $this->redis->hset("cards:$game_room", $owner, serialize($part));
            }
        }

        $cards = array();
        $user = $this->clientManipulator->getClient($connection);
        $cards['your'] = unserialize($this->redis->hget("cards:$game_room", $user->getUsername()));
        $cards['free'] = unserialize($this->redis->hget("cards:$game_room", 'free'));

        return $cards;
    }

    private function createCards($users)
    {
        $cards = array(
            's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 'sj', 'sq', 'sk', 'sA',
            'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'hj', 'hq', 'hk', 'hA',
            'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'dj', 'dq', 'dk', 'dA',
            'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'cj', 'cq', 'ck', 'cA',
        );

        $userCards = array();
        shuffle($cards);
        shuffle($cards);
        shuffle($cards);
        foreach ($users as $user) {
            for ($j = 0; $j < 7; $j++) {
                $userCards[$user][] = array_pop($cards);
            }
        }

        $userCards['free'] = $cards;
        return $userCards;
    }

    public function start(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientManipulator->getClient($connection);

        if (!$user instanceof UserInterface) {
            return 'not login';
        }

        if (!$this->redis->sismember('queue', $user->getUsername())) {
            $this->redis->sadd('queue', array($user->getUsername()));
            return 'add to queue';
        }

        if ($this->redis->scard('queue') > 1) {
            $gameRoom = 'room_' . rand(1111, 9999);
            $members = $this->redis->smembers('queue');
            $users = array();
            $topic = $this->topicManager->getTopic('chat/public');
            foreach ($members as $member) {
                $u = $this->clientManipulator->findByUsername($topic, $member);
                $users[] = $u['connection']->WAMP->sessionId;
            }

            $topic->broadcast(array('room'=>$gameRoom, 'type'=>'new'), [], $users);

            return 'game_started';
        }
    }
}

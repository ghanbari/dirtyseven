<?php

namespace FunPro\HomeBundle\EventListener;

use Gos\Bundle\WebSocketBundle\Client\ClientManipulatorInterface;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\Topic\TopicInterface;
use Gos\Bundle\WebSocketBundle\Topic\TopicPeriodicTimerInterface;
use Gos\Bundle\WebSocketBundle\Topic\TopicPeriodicTimerTrait;
use Predis\Client;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\Topic;
use Ratchet\Wamp\TopicManager;

class GameTopic implements TopicInterface, TopicPeriodicTimerInterface
{
    use TopicPeriodicTimerTrait;

    /**
     * @var ClientManipulatorInterface
     */
    private $clientManipulator;

    /**
     * @var TopicManager
     */
    private $topicManager;

    /**
     * @var Client
     */
    private $redis;

    private $topic;

    public function __construct(ClientManipulatorInterface $clientManipulator, TopicManager $topicManager, Client $redis)
    {
        $this->clientManipulator = $clientManipulator;
        $this->topicManager = $topicManager;
        $this->redis = $redis;
    }

    /**
     * @param Topic $topic
     *
     * @return mixed
     */
    public function registerPeriodicTimer(Topic $topic)
    {
        $this->topic = $topic;
        $this->periodicTimer->addPeriodicTimer($this, 'hello', 10, array($this, 'checkQueue'));
    }

    public function checkQueue()
    {
        $user = $this->redis->lpop('queue2');
        $this->redis->rpush('queue2', $user);
        $this->topic->broadcast($user);
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {

    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onUnSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        // TODO: Implement onUnSubscribe() method.
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     * @param                      $event
     * @param  array               $exclude
     * @param  array               $eligible
     */
    public function onPublish(ConnectionInterface $connection, Topic $topic, WampRequest $request, $event, array $exclude, array $eligible)
    {
        $user = $this->clientManipulator->getClient($connection);

        if ($user->getUsername() !== 'ghanbari') {
            $topic->broadcast('you are not allowed', [], [$connection->WAMP->sessionId]);
            return;
        }

        $topic->broadcast($event, array($connection->WAMP->sessionId));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'game.topic';
    }
}

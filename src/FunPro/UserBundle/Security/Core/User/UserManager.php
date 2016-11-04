<?php

namespace FunPro\UserBundle\Security\Core\User;

use Gos\Bundle\WebSocketBundle\Client\ClientManipulator;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\TopicManager;
use Symfony\Component\Security\Core\User\UserInterface;

class UserManager
{
    /**
     * @var ClientManipulator
     */
    private $clientManipulator;

    /**
     * @var TopicManager
     */
    private $topicManager;

    /**
     * @param ClientManipulator $clientManipulator
     * @param TopicManager      $topicManager
     */
    public function __construct(ClientManipulator $clientManipulator, TopicManager $topicManager)
    {
        $this->clientManipulator = $clientManipulator;
        $this->topicManager = $topicManager;
    }

    public function getCurrentUser(ConnectionInterface $connection)
    {
        $publicTopic = $this->topicManager->getTopic('chat/public');
        $user = $this->clientManipulator->getClient($connection);

        if (!$user instanceof UserInterface) {
            $publicTopic->broadcast(
                array('type' => 'session'),
                [],
                [$connection->WAMP->sessionId]
            );

            return;
        }

        return $user;
    }

    public function getUser($username)
    {
        $publicTopic = $this->topicManager->getTopic('chat/public');
        $user = $this->clientManipulator->findByUsername($publicTopic, $username);

        return $user;
    }

    public function getClient($username)
    {
        $publicTopic = $this->topicManager->getTopic('chat/public');
        $user = $this->clientManipulator->findByUsername($publicTopic, $username);

        return $user ? $user['client'] : null;
    }

    public function getConnection($username)
    {
        $publicTopic = $this->topicManager->getTopic('chat/public');
        $user = $this->clientManipulator->findByUsername($publicTopic, $username);

        return $user ? $user['connection'] : null;
    }
}

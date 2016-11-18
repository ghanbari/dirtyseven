<?php

namespace FunPro\UserBundle\Client;

use Gos\Bundle\WebSocketBundle\Client\ClientManipulator;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\TopicManager;
use React\Socket\ConnectionException;
use Symfony\Component\Security\Core\User\UserInterface;

class ClientHelper
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

    public  function getPublicTopic()
    {
        return $this->topicManager->getTopic('chat/public');
    }

    public function getCurrentUser(ConnectionInterface $connection)
    {
        $user = $this->clientManipulator->getClient($connection);
        if (!$user instanceof UserInterface) {
            $this->getPublicTopic()->broadcast(
                array('type' => 'session'),
                [],
                [$connection->WAMP->sessionId]
            );

            $connection->close();
            throw new ConnectionException();
        }

        return $user;
    }

    public function getUser($username)
    {
        return $this->clientManipulator->findByUsername($this->getPublicTopic(), $username);
    }

    public function getUsers(array $usernames)
    {
        $users = array();
        foreach ($usernames as $username) {
            $user = $this->getUser($username);
            if ($user) {
                $users[] = $user;
            }
        }

        return $users;
    }

    public function getUsersSessionId(array $usernames)
    {
        $sessionIds = array();
        foreach ($usernames as $username) {
            if ($userConnection = $this->getConnection($username)) {
                $sessionIds[] = $userConnection->WAMP->sessionId;
            }
        }
        return $sessionIds;
    }

    public function getClient($username)
    {
        $user = $this->getUser($username);

        return $user ? $user['client'] : null;
    }

    public function getConnection($username)
    {
        $user = $this->getUser($username);

        return $user ? $user['connection'] : null;
    }

    public function getConnections($usernames)
    {
        $connections = array();
        foreach ($usernames as $username) {
            $connection = $this->getConnection($username);
            if ($connection) {
                $connections[$username] = $connection;
            }
        }

        return $connections;
    }
}

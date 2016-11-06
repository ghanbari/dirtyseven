<?php

namespace FunPro\UserBundle\Listener;

use FunPro\UserBundle\Client\ClientHelper;
use FunPro\UserBundle\Entity\User;
use FunPro\UserBundle\Manager\FriendManager;
use FunPro\UserBundle\Manager\UserManager;
use Gos\Bundle\WebSocketBundle\Event\ClientEvent;
use Gos\Bundle\WebSocketBundle\Event\ClientErrorEvent;
use Gos\Bundle\WebSocketBundle\Event\ServerEvent;
use Gos\Bundle\WebSocketBundle\Event\ClientRejectedEvent;
use Ratchet\Wamp\TopicManager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Class UserStatusListener
 *
 * @package FunPro\UserBundle\Listener
 */
class UserStatusListener implements EventSubscriberInterface
{
    /**
     * @var TopicManager
     */
    private $topicManager;

    /**
     * @var FriendManager
     */
    private $friendManager;

    /**
     * @var UserManager
     */
    private $userManager;

    /**
     * @var ClientHelper
     */
    private $clientHelper;

    public function __construct(
        TopicManager $topicManager,
        ClientHelper $clientHelper,
        FriendManager $friend,
        UserManager $user
    ) {
        $this->topicManager = $topicManager;
        $this->friendManager = $friend;
        $this->userManager = $user;
        $this->clientHelper = $clientHelper;
    }

    public static function getSubscribedEvents()
    {
        return array(
            'gos_web_socket.client_connected' => 'changeStatus',
            'gos_web_socket.client_disconnected' => 'changeStatus',
            'gos_web_socket.client_error' => 'onClientError',
            'gos_web_socket.client_rejected' => 'onClientRejected',
        );
    }

    public function changeStatus(ClientEvent $event)
    {
        $connection = $event->getConnection();
        $publicTopic = $this->topicManager->getTopic('chat/public');
        $user = $this->clientHelper->getCurrentUser($connection);

        if ($event->getType() == ClientEvent::CONNECTED and !$user instanceof UserInterface) {
            $publicTopic->broadcast(array('type' => 'session'), array(), array($connection->WAMP->sessionId));
            $connection->close();
            return;
        }

        $status = $event->getType() === ClientEvent::CONNECTED ? User::STATUS_ONLINE : User::STATUS_OFFLINE;
        $this->userManager->updateStatus($user->getUsername(), $status);

        $friendsUsername = $this->friendManager->getFriends($user->getUsername());
        $sessionIds = $this->clientHelper->getUsersSessionId($friendsUsername);

        $message = array('type' => 'friend_status', 'username' => $user->getUsername(), 'status' => $status);
        $publicTopic->broadcast($message, array(), $sessionIds);
    }

    /**
     * Called whenever a client errors
     *
     * @param ClientErrorEvent $event
     */
    public function onClientError(ClientErrorEvent $event)
    {
        $e = $event->getException();
        echo "connection error occurred: " . $e->getMessage() . PHP_EOL;
    }

    /**
     * Called whenever server start
     *
     * @param ServerEvent $event
     */
    public function onServerStart(ServerEvent $event)
    {
        echo 'Server was successfully started !'. PHP_EOL;
    }

    /**
     * Called whenever client is rejected by application
     *
     * @param ClientRejectedEvent $event
     */
    public function onClientRejected(ClientRejectedEvent $event)
    {
        $origin = $event->getOrigin;

        echo 'connection rejected from '. $origin . PHP_EOL;
    }
}

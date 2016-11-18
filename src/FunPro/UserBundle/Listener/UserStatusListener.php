<?php

namespace FunPro\UserBundle\Listener;

use FunPro\CoreBundle\Manager\GameManager;
use FunPro\CoreBundle\Model\Game;
use FunPro\UserBundle\Client\ClientHelper;
use FunPro\UserBundle\Entity\User;
use FunPro\UserBundle\Event\UserStatusEvent;
use FunPro\UserBundle\Event\UserStatusResetEvent;
use FunPro\UserBundle\Events;
use FunPro\UserBundle\Manager\FriendManager;
use FunPro\UserBundle\Manager\UserManager;
use Gos\Bundle\WebSocketBundle\Event\ClientEvent;
use Gos\Bundle\WebSocketBundle\Event\ClientErrorEvent;
use Gos\Bundle\WebSocketBundle\Event\ServerEvent;
use Gos\Bundle\WebSocketBundle\Event\ClientRejectedEvent;
use React\Socket\ConnectionException;
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

    /**
     * @var GameManager
     */
    private $gameManager;

    public function __construct(
        ClientHelper $clientHelper,
        FriendManager $friend,
        GameManager $gameManager,
        UserManager $user
    ) {
        $this->friendManager = $friend;
        $this->userManager = $user;
        $this->clientHelper = $clientHelper;
        $this->gameManager = $gameManager;
    }

    public static function getSubscribedEvents()
    {
        return array(
            'gos_web_socket.client_connected' => 'onClientConnect',
            'gos_web_socket.client_disconnected' => 'onClientDisconnect',
            'gos_web_socket.client_error' => 'onClientError',
            'gos_web_socket.client_rejected' => 'onClientRejected',
            Events::CHANGE_USER_STATUS => 'onStatusChanged',
            Events::RESET_USER_STATUS => 'onStatusReset',
        );
    }

    private function changeStatus($username, $status)
    {
        $this->userManager->updateStatus($username, $status);

        $friendsUsername = $this->friendManager->getFriends($username);
        $sessionIds = $this->clientHelper->getUsersSessionId(array_merge($friendsUsername, array($username)));

        if (!empty($sessionIds)) {
            $message = array('type' => 'friend_status', 'username' => $username, 'status' => $status);
            $this->clientHelper->getPublicTopic()->broadcast($message, array(), $sessionIds);
        }
    }

    private function getGameStatus($username)
    {
        $game = $this->gameManager->getActiveGame($username);

        if (!$game or $game['game']['status'] == Game::STATUS_FINISHED) {
            $status = User::STATUS_ONLINE;
        } elseif ($game['game']['status'] == Game::STATUS_PLAYING) {
            $status = User::STATUS_PLAYING;
        } else {
            $status = $game['game']['owner'] == $username ? User::STATUS_INVITING : User::STATUS_INVITED;
        }

        return $status;
    }

    public function onStatusReset(UserStatusResetEvent $event)
    {
        $username = $event->getUsername();
        $isOnline = $this->clientHelper->getConnection($username);

        if ($isOnline) {
            $status = $this->getGameStatus($username);
        } else {
            $status = User::STATUS_OFFLINE;
        }

        $this->changeStatus($username, $status);
    }

    public function onStatusChanged(UserStatusEvent $event)
    {
        $this->changeStatus($event->getUsername(), $event->getStatus());
    }

    public function onClientConnect(ClientEvent $event)
    {
        $connection = $event->getConnection();
        $publicTopic = $this->clientHelper->getPublicTopic();
        $user = $this->clientHelper->getCurrentUser($connection);

        if ((!$user or !$user instanceof UserInterface)) {
            $publicTopic->broadcast(array('type' => 'session'), array(), array($connection->WAMP->sessionId));
            $connection->close();
            throw new ConnectionException();
        }

        $status = $this->getGameStatus($user->getUsername());
        $this->changeStatus($user->getUsername(), $status);
    }

    public function onClientDisconnect(ClientEvent $event)
    {
        $user = $this->clientHelper->getCurrentUser($event->getConnection());
        $this->changeStatus($user->getUsername(), User::STATUS_OFFLINE);
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

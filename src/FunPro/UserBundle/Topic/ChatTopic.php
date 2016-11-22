<?php

namespace FunPro\UserBundle\Topic;

use FunPro\UserBundle\Client\ClientHelper;
use FunPro\UserBundle\Manager\CommunicationManager;
use FunPro\UserBundle\Manager\FriendManager;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\Topic\TopicInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\Topic;

class ChatTopic implements TopicInterface
{
    /**
     * @var ClientHelper
     */
    private $clientHelper;

    /**
     * @var FriendManager
     */
    private $friendManager;

    /**
     * @var CommunicationManager
     */
    private $comManager;

    public function __construct(ClientHelper $clientHelper, FriendManager $friendManager, CommunicationManager $comManager)
    {
        $this->clientHelper = $clientHelper;
        $this->friendManager = $friendManager;
        $this->comManager = $comManager;
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $username = $user->getUsername();

        if ($username != $request->getAttributes()->get('username')) {
            $error = array(
                'message' => 'You not allowed to subscribe in this room',
                'type' => 'notification',
                'from' => 'Bot',
                'channel' => $request->getAttributes()->get('username'),
                'username' => $username,
            );
            $this->clientHelper->getPublicTopic()->broadcast($error);
            $topic->remove($connection);
            return;
        }
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onUnSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $message = array(
            'from' => 'Bot',
            'message' => 'You are disconnected from chatroom.',
            'type' => 'notification',
        );
        $this->clientHelper->getPublicTopic()->broadcast($message, array(), array($connection->WAMP->sessionId));
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
        if (!is_scalar($event) or preg_match('/^\s*$/', $event)) {
            $error = array(
                'message' => 'Your message is not valid',
                'type' => 'notification',
                'from' => 'Bot'
            );
            $this->clientHelper->getPublicTopic()->broadcast($error);
            return;
        }

        $friendUsername = $request->getAttributes()->get('username');
        $user = $this->clientHelper->getCurrentUser($connection);
        $username = $user->getUsername();

        if (!$this->friendManager->isFriend($username, $friendUsername)) {
            $error = array(
                'message' => 'You can only send message to your friends',
                'type' => 'notification',
                'from' => 'Bot'
            );
            $this->clientHelper->getPublicTopic()->broadcast($error);
            $topic->remove($connection);
            return;
        }

        $message = $this->comManager->saveChatMessage($username, $friendUsername, $event);
        $topic->broadcast($message);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'chat.private';
    }
}

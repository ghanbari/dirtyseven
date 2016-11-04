<?php

namespace FunPro\UserBundle\Topic;

use FunPro\UserBundle\Persistence\Inbox;
use FunPro\UserBundle\Security\Core\User\UserManager;
use Gos\Bundle\WebSocketBundle\Client\ClientManipulatorInterface;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\Topic\TopicInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\Topic;
use Ratchet\Wamp\TopicManager;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Use only for system notification & message.
 *
 * Class PublicTopic
 *
 * @package FunPro\UserBundle\Topic
 */
class PublicTopic implements TopicInterface
{
    /**
     * @var TopicManager
     */
    private $topicManager;

    /**
     * @var ClientManipulatorInterface
     */
    private $clientManipulator;

    /**
     * @var Inbox
     */
    private $inbox;

    /**
     * @var UserManager
     */
    private $userManager;

    /**
     * @param TopicManager               $topicManager
     * @param ClientManipulatorInterface $clientManipulator
     * @param Inbox                      $inbox
     * @param UserManager                $userManager
     */
    public function __construct(
        TopicManager $topicManager,
        ClientManipulatorInterface $clientManipulator,
        Inbox $inbox,
        UserManager $userManager
    ) {
        $this->topicManager = $topicManager;
        $this->clientManipulator = $clientManipulator;
        $this->inbox = $inbox;
        $this->userManager = $userManager;
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        if (!$user = $this->userManager->getCurrentUser($connection)) {
            return;
        }

        $notifications = $this->inbox->getAll($user->getUsername());
        $topic->broadcast(
            array('from' => 'Bot', 'type' => 'notification', 'message' => 'Welcome to game.'),
            [],
            [$connection->WAMP->sessionId]
        );

        if ($notifications) {
            $messages = array();
            foreach ($notifications as $notification) {
                $messages[] = unserialize($notification);
            }
            $topic->broadcast($messages, [], [$connection->WAMP->sessionId]);
        }

//        if ($data = $this->hasActiveGame($user)) {
//            $message = array('gameId' => $data['id'], 'type' => 'resume', 'gameStatus' => $data['game']['status']);
//            $topic->broadcast($message, [], [$connection->WAMP->sessionId]);
//        }
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onUnSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $topic->broadcast('You can not receive public message.', [], [$connection->WAMP->sessionId]);
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
        // TODO: Implement onPublish() method.
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'chat.public';
    }

//    private function hasActiveGame(UserInterface $user)
//    {
//        $gameId = $this->redis->hget('Users:Games', $user->getUsername());
//
//        if (!$gameId) {
//            return;
//        }
//
//        $game = $this->redis->hgetall("Games:$gameId");
//
//        if (!$game or $game['status'] == 'closed') {
//            $this->redis->hdel('Users:Games', $user->getUsername());
//            return;
//        }
//
//        $gameTopic = $this->topicManager->getTopic("games/$gameId");
//        if (!$gameTopic->count()) {
//            return array(
//                'id' => $gameId,
//                'game' => $game,
//            );
//        }
//    }
}

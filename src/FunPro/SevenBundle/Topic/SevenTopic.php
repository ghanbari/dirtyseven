<?php

namespace FunPro\SevenBundle\Topic;

use FunPro\CoreBundle\Manager\GameManager;
use FunPro\CoreBundle\Model\Game;
use FunPro\UserBundle\Client\ClientHelper;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\Topic\TopicInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\Topic;

class SevenTopic implements TopicInterface
{
    /**
     * @var GameManager
     */
    private $gameManager;
    /**
     * @var ClientHelper
     */
    private $clientHelper;

    public function __construct(GameManager $gameManager, ClientHelper $clientHelper)
    {
        $this->gameManager = $gameManager;
        $this->clientHelper = $clientHelper;
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $gameId = $request->getAttributes()->get('gameId');

        $game = $this->gameManager->getUserGame($user->getUsername());
        if (!$game or $game['id'] != $gameId or $game['game']['status'] !== Game::STATUS_WAITING) {
            $topic->remove($connection);
        }
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onUnSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $gameId = $request->getAttributes()->get('gameId');
        $game = $this->gameManager->getGame($gameId);

        if (!$game or $game['game']['status'] != Game::STATUS_PLAYING or !isset($game['game']['startedAt'])) {
            return;
        }

        $players = $this->gameManager->getPlayers($gameId);

        if (($game['game']['startedAt'] + 300) < time() and $topic->count() < 2) {
            $this->gameManager->finishGame($gameId);
        }

        $message = array('type' => 'game_status', 'status' => 'finished', 'gameId' => $gameId);
        $this->clientHelper->getPublicTopic()->broadcast($message, array(), $this->clientHelper->getUsersSessionId($players));
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

    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'game.seven.topic';
    }
}

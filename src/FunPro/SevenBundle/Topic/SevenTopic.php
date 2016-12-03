<?php

namespace FunPro\SevenBundle\Topic;

use FunPro\CoreBundle\Manager\GameManager;
use FunPro\CoreBundle\Model\Game;
use FunPro\UserBundle\Client\ClientHelper;
use FunPro\UserBundle\Manager\InboxManager;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\Topic\TopicInterface;
use Gos\Bundle\WebSocketBundle\Topic\TopicPeriodicTimerInterface;
use Gos\Bundle\WebSocketBundle\Topic\TopicPeriodicTimerTrait;
use Ratchet\ConnectionInterface;
use Ratchet\Wamp\Topic;

class SevenTopic implements TopicInterface, TopicPeriodicTimerInterface
{
    use TopicPeriodicTimerTrait;

    /**
     * @var GameManager
     */
    private $gameManager;

    /**
     * @var ClientHelper
     */
    private $clientHelper;

    /**
     * @var InboxManager
     */
    private $inboxManager;

    public function __construct(GameManager $gameManager, ClientHelper $clientHelper, InboxManager $inboxManager)
    {
        $this->gameManager = $gameManager;
        $this->clientHelper = $clientHelper;
        $this->inboxManager = $inboxManager;
    }

    /**
     * @param Topic $topic
     *
     * @return mixed
     */
    public function registerPeriodicTimer(Topic $topic)
    {
    }

    public function addPeriodicTimmer(Topic $topic, $gameId, $forUser)
    {
        $goNextTurn = function () use ($topic, $gameId, $forUser) {
            //give yellow card if player not played

            $nextTurn = $this->gameManager->nextTurn($gameId, $forUser);
            if (!$nextTurn) {
                return;
            }

            $penalties = $this->gameManager->getPenalty($gameId, $forUser);

            $message = sprintf('%s get %d card as penalty', $forUser, count($penalties));
            $this->inboxManager->addLog($gameId, $message);
            $userSession = $this->clientHelper->getConnection($forUser);
            if ($userSession) {
                $topic->broadcast(
                    array('type' => 'penalty', 'cards' => $penalties),
                    array(),
                    array($userSession->WAMP->sessionId)
                );
            }
            $topic->broadcast(array(
                'type' => 'playing',
                'nextTurn' => $nextTurn,
                'player' => $forUser,
                'cards' => array($forUser => $this->gameManager->getCountOfUserCards($gameId, $forUser))
            ));

            $this->removePeriodicTimer();
            $this->addPeriodicTimmer($topic, $gameId, $nextTurn);
        };

        if (!$this->periodicTimer->isPeriodicTimerActive($this, 'turn')) {
            $this->periodicTimer->addPeriodicTimer($this, 'turn', 10, $goNextTurn);
        } else {
            echo 'timer is active, can not register new timer';
        }
    }

    public function removePeriodicTimer()
    {
        $this->periodicTimer->cancelPeriodicTimer($this, 'turn');
        return $this;
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
        if (!$game or $game['id'] != $gameId or $game['game']['status'] == Game::STATUS_FINISHED) {
            $topic->remove($connection);
        }

        $message = $user->getUsername() . ' joined to game.';
        $topic->broadcast(['type' => 'notification', 'message' => $message]);
        $this->inboxManager->addLog($gameId, $message);

        $players = $this->gameManager->getPlayers($gameId);
        if ($topic->count() == count($players)
            and in_array($game['game']['status'], array(Game::STATUS_PREPARE, Game::STATUS_PAUSED))
        ) {
            if ($game['game']['status'] == Game::STATUS_PREPARE) {
                $this->gameManager->startGame($gameId);
                $message = 'Game started';
            } else {
                $this->gameManager->resumeGame($gameId);
                $message = 'Game resumed';

                $logs = $this->inboxManager->getLogs($gameId);
                $topic->broadcast(array('type' => 'notification', 'message' => $logs));
            }

            $this->inboxManager->addLog($gameId, $message);
            $topic->broadcast(['type' => 'notification', 'message' => $message]);

            $turn = $this->gameManager->getTurn($game['id']);
            $topic->broadcast(array('type' => 'playing', 'nextTurn' => $turn));

            $this->addPeriodicTimmer($topic, $gameId, $turn);
        }
    }

    /**
     * @param  ConnectionInterface $connection
     * @param  Topic               $topic
     * @param WampRequest          $request
     */
    public function onUnSubscribe(ConnectionInterface $connection, Topic $topic, WampRequest $request)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $gameId = $request->getAttributes()->get('gameId');
        $game = $this->gameManager->getGame($gameId);

        if (!$game or $game['status'] != Game::STATUS_PLAYING) {
            return;
        }

        $message = $user->getUsername() . ' leave the game.';
        $topic->broadcast(['type' => 'notification', 'message' => $message]);
        $this->inboxManager->addLog($gameId, $message);

        if ($topic->count() == 1) {
            $this->removePeriodicTimer();
            $this->gameManager->pauseGame($gameId);
        }
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
        $topic->remove($connection);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'game.seven.topic';
    }
}

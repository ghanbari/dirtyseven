<?php

namespace FunPro\SevenBundle\Topic;

use FunPro\CoreBundle\Manager\GameManager;
use FunPro\CoreBundle\Model\Game;
use FunPro\UserBundle\Client\ClientHelper;
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

    public function __construct(GameManager $gameManager, ClientHelper $clientHelper)
    {
        $this->gameManager = $gameManager;
        $this->clientHelper = $clientHelper;
    }

    /**
     * @param Topic $topic
     *
     * @return mixed
     */
    public function registerPeriodicTimer(Topic $topic)
    {
    }

    public function addPeriodicTimmer(Topic $topic, $gameId)
    {
        $goNextTurn = function () use ($topic, $gameId) {
            //give yellow card if player not played

            //must use transaction
            $data = $this->gameManager->nextTurnAndPenalty($gameId);

            $userSession = $this->clientHelper->getConnection($data['turn']);
            if ($userSession) {
                $topic->broadcast(
                    array('type' => 'penalty', 'cards' => array($data['penalty'])),
                    array(),
                    array($userSession->WAMP->sessionId)
                );
            }
            $topic->broadcast(array(
                'type' => 'playing',
                'turn' => $data['nextTurn'],
                'previousTurn' => $data['turn'],
                'cards' => array($data['turn'] => $this->gameManager->getCountOfUserCards($gameId, $data['turn']))
            ));
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

        $players = $this->gameManager->getPlayers($gameId);
        if ($topic->count() == count($players)
            and in_array($game['game']['status'], array(Game::STATUS_PREPARE, Game::STATUS_PAUSED))
        ) {
            if ($game['game']['status'] == Game::STATUS_PREPARE) {
                $this->gameManager->startGame($gameId);
            } else {
                $this->gameManager->resumeGame($gameId);
            }

            $turn = $this->gameManager->getTurn($game['id']);
            $topic->broadcast(array('type' => 'playing', 'turn' => $turn));

            $this->addPeriodicTimmer($topic, $gameId);
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

        if (!$game or $game['status'] != Game::STATUS_PLAYING) {
            return;
        }

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

    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'game.seven.topic';
    }
}

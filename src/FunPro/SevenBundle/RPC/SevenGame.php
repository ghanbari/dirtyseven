<?php

namespace FunPro\SevenBundle\RPC;

use FunPro\CoreBundle\Exception\WrongCardException;
use FunPro\CoreBundle\Manager\GameManager;
use FunPro\CoreBundle\Model\Game;
use FunPro\SevenBundle\Topic\SevenTopic;
use FunPro\UserBundle\Client\ClientHelper;
use Gos\Bundle\WebSocketBundle\Router\WampRequest;
use Gos\Bundle\WebSocketBundle\RPC\RpcInterface;
use Ratchet\ConnectionInterface;

class SevenGame implements RpcInterface
{
    /**
     * @var GameManager
     */
    private $gameManager;
    /**
     * @var ClientHelper
     */
    private $clientHelper;

    /**
     * @var SevenTopic
     */
    private $sevenTopic;

    public function __construct(GameManager $gameManager, ClientHelper $clientHelper, SevenTopic $sevenTopic)
    {
        $this->gameManager = $gameManager;
        $this->clientHelper = $clientHelper;
        $this->sevenTopic = $sevenTopic;
    }

    public function getGame(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $game = $this->gameManager->getActiveGame($user->getUsername());

        $validStatus = array(Game::STATUS_PLAYING, Game::STATUS_PREPARE, Game::STATUS_PAUSED);
        if (!$game or !in_array($game['game']['status'], $validStatus)) {
            return array(
                'status' => array('message' => 'Game is not exists', 'code' => -1),
                'data' => array(),
            );
        }

        $data = $game['game'];
        $data['cards']['owner'] = $this->gameManager->getUserCards($game['id'], $user->getUsername());
        $data['cards']['users'] = $this->gameManager->getCountOfUsersCards($game['id'], unserialize($data['seats']));
        $data['turn'] = $this->gameManager->getTurn($game['id']);

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => $data,
        );
    }

    public function play(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $game = $this->gameManager->getActiveGame($user->getUsername());
        $gameTopic = $this->clientHelper->getGameTopic($game['game']['name'], $game['id']);

        if (!$game or $game['game']['status'] !== Game::STATUS_PLAYING) {
            return array(
                'status' => array('message' => 'Game is not exists', 'code' => -1),
                'data' => array(),
            );
        }

        //always must in the first begin, remove timer
        $this->sevenTopic->removePeriodicTimer();
        if (!$this->gameManager->canPlay($game['id'], $user->getUsername())) {
            $this->sevenTopic->addPeriodicTimmer($gameTopic, $game['id']);
            return array(
                'status' => array('message' => 'You can not play', 'code' => -2),
                'data' => array(),
            );
        }

        $playedCard = $params['card'];
        try {
            $this->gameManager->isCorrect($game['id'], $user->getUsername(), $playedCard);
            $this->sevenTopic->addPeriodicTimmer($gameTopic, $game['id']);
        } catch (WrongCardException $e) {

        }

        return array(
            'status' => array('message' => 'Ok', 'code' => 1),
            'data' => array(),
        );
    }

    public function getCard(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $game = $this->gameManager->getActiveGame($user->getUsername());
        $gameTopic = $this->clientHelper->getGameTopic($game['game']['name'], $game['id']);

        if (!$game or $game['game']['status'] !== Game::STATUS_PLAYING) {
            return array(
                'status' => array('message' => 'Game is not exists', 'code' => -1),
                'data' => array(),
            );
        }

        //always must in the first begin, remove timer
        $this->sevenTopic->removePeriodicTimer();
        if (!$this->gameManager->canPlay($game['id'], $user->getUsername())) {
            $this->sevenTopic->addPeriodicTimmer($gameTopic, $game['id']);
            return array(
                'status' => array('message' => 'You can not play', 'code' => -2),
                'data' => array(),
            );
        }

        $card = $this->gameManager->getPenalty($game['id'], $user->getUsername(), 1);
        $this->gameManager->nextTurn($game['id']);
        $this->sevenTopic->addPeriodicTimmer($gameTopic, $game['id']);

        $userCards = $this->gameManager->getCountOfUserCards($game['id'], $user->getUsername());
        $gameTopic->broadcast(array('username' => $user->getUsername(), 'count' => $userCards, 'type' => 'played'));

        return array(
            'status' => array('message' => 'Ok', 'code' => 1),
            'data' => array('card' => $card[0]),
        );
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'game.seven.rpc';
    }
}

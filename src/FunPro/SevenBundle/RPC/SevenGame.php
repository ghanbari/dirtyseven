<?php

namespace FunPro\SevenBundle\RPC;

use FunPro\CoreBundle\Exception\WrongCardException;
use FunPro\CoreBundle\Manager\GameManager;
use FunPro\CoreBundle\Model\Game;
use FunPro\SevenBundle\Topic\SevenTopic;
use FunPro\UserBundle\Client\ClientHelper;
use FunPro\UserBundle\Manager\InboxManager;
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

    /**
     * @var InboxManager
     */
    private $inboxManager;

    public function __construct(GameManager $gameManager, ClientHelper $clientHelper, SevenTopic $sevenTopic, InboxManager $inboxManager)
    {
        $this->gameManager = $gameManager;
        $this->clientHelper = $clientHelper;
        $this->sevenTopic = $sevenTopic;
        $this->inboxManager = $inboxManager;
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
        $data['nextTurn'] = $this->gameManager->getTurn($game['id']);

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
        $playedCard = $params['card'];
        $extra = array_key_exists('extra', $params) ? $params['extra'] : array();

        if (!$game or $game['game']['status'] !== Game::STATUS_PLAYING) {
            return array(
                'status' => array('message' => 'Game is not exists', 'code' => -1),
                'data' => array(),
            );
        }

        #FIXME: user must get penalty?, user can play when is not her turn
        if (!$this->gameManager->canPlay($game['id'], $user->getUsername())) {
//            $penalty = $this->gameManager->getPenalty($game['id'], $user->getUsername(), false);
//
//            $message = sprintf(
//                '%s play %s card that was not turn of user and get %d card as penalty',
//                $user->getUsername(),
//                $playedCard,
//                count($penalty)
//            );
//            $this->inboxManager->addLog($game['id'], $message);
//
//            $gameTopic->broadcast(array(
//                'type' => 'playing',
//                'player' => $user->getUsername(),
//                'cards' => $this->gameManager->getCountOfUsersCards($game['id']),
//                'wrongCard' => $playedCard,
//            ));
//
//            //FIXME
//            return array(
//                'status' => array('message' => 'Ok', 'code' => -2),
//                'data' => array('penalties' => $penalty),
//            );


            return array(
                'status' => array('message' => 'Ok', 'code' => -2),
                'data' => array(),
            );
        }

        try {
            //always must in the first begin, remove timer
            $this->sevenTopic->removeNextTurnTimer($game['id']);
            $result = $this->gameManager->isCorrect($game['id'], $user->getUsername(), $playedCard, $extra);

            if ($this->gameManager->getCountOfUserCards($game['id'], $user->getUsername()) == 0) {
                $previousScore = $this->gameManager->getUsersScore($game['id']);
                $roundScore = $this->gameManager->finishRound($game['id']);
                $finalScore = $this->gameManager->getUsersScore($game['id']);

                $message = array(
                    'type' => 'finish_round',
                    'roundScore' => $roundScore,
                    'previousScore' => $previousScore,
                    'finalScore' => $finalScore,
                );

                if (max($finalScore) >= $game['game']['point']) {
                    $this->gameManager->finishGame($game['id']);
                    $message['finished'] = true;
                } else {
                    $this->sevenTopic->startNextRoundTimer($gameTopic, $game['id']);
                }

                $gameTopic->broadcast($message);
            } else {
                $this->sevenTopic->startNextTurnTimer($gameTopic, $game['id'], $this->gameManager->getTurn($game['id']));

                $message = sprintf(
                    '%s play %s',
                    $user->getUsername(),
                    $playedCard
                );
                $this->inboxManager->addLog($game['id'], $message);

                if (array_key_exists('penalty', $result) and is_array($extra) and array_key_exists('target', $extra)) {
                    $userConnection = $this->clientHelper->getConnection($extra['target']);

                    $message = sprintf(
                        '%s give %d card to %s',
                        $user->getUsername(),
                        count($result['penalty']),
                        $extra['target']
                    );
                    $this->inboxManager->addLog($game['id'], $message);

                    if ($userConnection) {
                        $gameTopic->broadcast(
                            array('type' => 'penalty', 'cards' => $result['penalty']),
                            array(),
                            array($userConnection->WAMP->sessionId)
                        );
                    }
                }

                $gameTopic->broadcast(array(
                    'type' => 'playing',
                    'nextTurn' => $this->gameManager->getTurn($game['id']),
                    'player' => $user->getUsername(),
                    'topCard' => $result['topCard'],
                    'cards' => $this->gameManager->getCountOfUsersCards($game['id'])
                ));
            }
        } catch (WrongCardException $e) {
            $this->sevenTopic->startNextTurnTimer($gameTopic, $game['id'], $this->gameManager->getTurn($game['id']));

            $message = sprintf(
                '%s play %s card that was wrong and get %d card as penalty',
                $user->getUsername(),
                $playedCard,
                count($e->getPenalties())
            );
            $this->inboxManager->addLog($game['id'], $message);

            $gameTopic->broadcast(array(
                'type' => 'playing',
                'nextTurn' => $this->gameManager->getTurn($game['id']),
                'player' => $user->getUsername(),
                'cards' => $this->gameManager->getCountOfUsersCards($game['id']),
                'wrongCard' => $playedCard,
            ));

            return array(
                'status' => array('message' => 'Ok', 'code' => -3),
                'data' => array('penalties' => $e->getPenalties()),
            );
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

        if (!$this->gameManager->canPlay($game['id'], $user->getUsername()) or $game['game']['pickedCard']) {
            return array(
                'status' => array('message' => 'You can not pick card', 'code' => -2),
                'data' => array(),
            );
        }

        //always must in the first begin, remove timer
        $this->sevenTopic->removeNextTurnTimer($game['id']);

        #when top card is 7, user pick only 2 penalty and [can play card] or [pick other penalty and play card]
        $cards = $this->gameManager->pickCard($game['id'], $user->getUsername());

        /*
         * if we do nextTurn, picked card change to false
         * $nextTurn = $this->gameManager->nextTurn($game['id'], $user->getUsername());
         */

        /*
         * if user pick 7's penalties, it can play or get another penalty
         */
        $this->sevenTopic->startNextTurnTimer($gameTopic, $game['id'], $user->getUsername(), count($cards) > 1);

        $message = sprintf(
            '%s pick %d card',
            $user->getUsername(),
            count($cards)
        );
        $this->inboxManager->addLog($game['id'], $message);

        $userCards = $this->gameManager->getCountOfUserCards($game['id'], $user->getUsername());
        $payload = array(
            'type' => 'playing',
            'cards' => array($user->getUsername() => $userCards),
            'player' => $user->getUsername(),
            'nextTurn' => $user->getUsername(),
        );

        $gameTopic->broadcast($payload);

        return array(
            'status' => array('message' => 'Ok', 'code' => 1),
            'data' => array('cards' => $cards),
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

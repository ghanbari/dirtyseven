<?php

namespace FunPro\CoreBundle\Manager;

use Doctrine\Bundle\DoctrineBundle\Registry;
use FunPro\CoreBundle\Exception\ActiveGameException;
use FunPro\CoreBundle\Exception\NotInvitedException;
use FunPro\CoreBundle\Exception\WrongCardException;
use FunPro\CoreBundle\Model\Game;
use FunPro\UserBundle\Entity\User;
use FunPro\UserBundle\Event\UserStatusEvent;
use FunPro\UserBundle\Event\UserStatusResetEvent;
use FunPro\UserBundle\Events;
use Predis\Client;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class GameManager
{
    /**
     * @var Client
     */
    private $redis;

    /**
     * @var Registry
     */
    private $doctrine;

    /**
     * @var EventDispatcherInterface
     */
    private $eventDispatcher;

    public function __construct(Client $redis, Registry $doctrine, EventDispatcherInterface $eventDispatcher)
    {
        $this->redis = $redis;
        $this->doctrine = $doctrine;
        $this->eventDispatcher = $eventDispatcher;
    }

    /**
     * @param      $name
     * @param      $scope
     * @param null $ownerUsername
     *
     * @return array (id, game)
     * @throws \Error
     * @throws \Exception
     * @throws \TypeError
     */
    public function createGame($name, $scope, $ownerUsername = null)
    {
        $game = array(
            'scope' => $scope,
            'name' => $name,
            'status' => 'waiting',
        );

        if ($scope == Game::SCOPE_PRIVATE) {
            $game['owner'] = $ownerUsername;
        }

        do {
            $gameId = time() . random_int(11111, 99999) . ($scope == Game::SCOPE_PRIVATE ? '0' : '1');
        } while ($this->redis->exists("Games:$gameId"));

        $this->redis->hset('Users:Games', $ownerUsername, $gameId);
        $this->redis->hmset("Games:$gameId", $game);

//        $this->redis->expire("Games:$gameId", 3600);
        $this->eventDispatcher->dispatch(Events::CHANGE_USER_STATUS, new UserStatusEvent($ownerUsername, User::STATUS_INVITING));

        return array(
            'id' => $gameId,
            'game' => $game
        );
    }

    /**
     * @param $ownerUsername
     * @param $gameName
     *
     * @throws ActiveGameException
     *
     * @return array (id, game)
     */
    public function createPrivateGame($ownerUsername, $gameName)
    {
        if ($userGame = $this->getUserGame($ownerUsername)) {
            $gameId = $userGame['id'];
            $game   = $userGame['game'];
        } else {
            return $this->createGame($gameName, Game::SCOPE_PRIVATE, $ownerUsername);
        }

        if (!$game or $game['status'] == Game::STATUS_FINISHED) {
            return $this->createGame($gameName, Game::SCOPE_PRIVATE, $ownerUsername);
        } elseif ($game['status'] == Game::STATUS_WAITING
            and $game['scope'] == Game::SCOPE_PRIVATE
            and $game['owner'] == $ownerUsername
            and $game['name'] == $gameName
        ) {
            return array(
                'id' => $gameId,
                'game' => $game,
            );
        }

        throw new ActiveGameException;
    }

    public function removeGame($gameId)
    {
        $game = $this->redis->hgetall("Games:$gameId");
        $this->redis->del("Games:$gameId");
        $this->redis->hdel('Users:Games', $game['owner']);

        $this->removeInvitations($gameId);

        $event = new UserStatusEvent($game['owner'], User::STATUS_ONLINE);
        $this->eventDispatcher->dispatch(Events::CHANGE_USER_STATUS, $event);

        #TODO: if game closed, remove logs, games or private games, Games:$gameId:cards, Games:$gameId:userId:cards
    }

    public function getGameTtl($gameId)
    {
        return $this->redis->ttl("Games:$gameId");
    }

    /**
     * @param $gameId
     *
     * @return array
     */
    public function getGame($gameId)
    {
        $game = $this->redis->hgetall("Games:$gameId");

        return $game;
    }

    /**
     * @param $username
     *
     * @return bool
     */
    public function hasActiveGame($username)
    {
        return ($userGame = $this->getUserGame($username) and $userGame['status'] !== Game::STATUS_FINISHED);
    }

    /**
     * @param $username
     *
     * @return null|array (id, game)
     */
    public function getUserGame($username)
    {
        $gameId = $this->redis->hget('Users:Games', $username);
        if (is_null($gameId)) {
            return;
        }

        $game = $this->redis->hgetall("Games:$gameId");
        return $game ? array('id' => $gameId, 'game' => $game) : null;
    }

    /**
     * @param $username
     *
     * @return null|array (id, game)
     */
    public function getActiveGame($username)
    {
        $gameId = $this->redis->hget('Users:Games', $username);
        if (is_null($gameId)) {
            return;
        }

        $game = $this->redis->hgetall("Games:$gameId");

        if ($game and $game['status'] !== Game::STATUS_FINISHED) {
            return array('id' => $gameId, 'game' => $game);
        }
    }

    public function getActiveGameCreatedBy($username)
    {
        $gameId = $this->redis->hget('Users:Games', $username);
        if (is_null($gameId)) {
            return;
        }

        $game = $this->redis->hgetall("Games:$gameId");

        if (!$game || $game['scope'] === Game::SCOPE_PUBLIC || $game['owner'] !== $username) {
//            $this->redis->hdel('Users:Games', $username);
            return;
        }

        if ($game and $game['status'] !== Game::STATUS_FINISHED) {
            return array('id' => $gameId, 'game' => $game);
        }
    }

    /**
     * @param $gameId
     *
     * @return array [username => answer]
     */
    public function getGameInvitations($gameId)
    {
        return $this->redis->hgetall("PrivateGames:$gameId:invitations");
    }

    public function getUserInvitations($username)
    {
        $this->redis->zremrangebyscore("GameInvitation:$username", 0, time());
        return $this->redis->zrange("GameInvitation:$username", 0, -1);
    }

    /**
     * @param $gameId
     *
     * @return array [username]
     */
    public function getInvitedUsers($gameId)
    {
        return $this->redis->hkeys("PrivateGames:$gameId:invitations");
    }

    /**
     * @param $username
     * @param $gameId
     *
     * @return bool
     */
    public function isInvited($username, $gameId)
    {
        return in_array($username, $this->getInvitedUsers($gameId));
    }

    /**
     * @param $gameId
     * @param $username
     *
     * @throws NotInvitedException
     *
     * @return string
     */
    public function getUserAnswer($gameId, $username)
    {
        if (!$this->redis->hexists("PrivateGames:$gameId:invitations", $username)) {
            throw new NotInvitedException;
        }

        return $this->redis->hget("PrivateGames:$gameId:invitations", $username);
    }

    /**
     * @param $gameId
     * @param $username
     */
    public function saveUserInvitation($gameId, $username)
    {
        $ttl = $this->redis->ttl("Games:$gameId");
        $this->redis->hset("PrivateGames:$gameId:invitations", $username, 'waiting');
//        $this->redis->expire("PrivateGames:$gameId:invitations", $ttl);
        $this->redis->zadd("GameInvitation:$username", array($gameId => time() + $ttl));
        $this->redis->zremrangebyscore("GameInvitation:$username", 0, time());
    }

    /**
     * @param $gameId
     * @param $username
     */
    public function removeUserInvitation($gameId, $username)
    {
        $ttl = $this->redis->ttl("Games:$gameId");
        $this->redis->hdel("PrivateGames:$gameId:invitations", $username);
//        $this->redis->expire("PrivateGames:$gameId:invitations", $ttl);
        $this->redis->zrem("GameInvitation:$username", $gameId);
        if ($this->redis->hget('Users:Games', $username) == $gameId) {
            $this->redis->hdel('Users:Games', $username);
        }
        $this->eventDispatcher->dispatch(Events::RESET_USER_STATUS, new UserStatusResetEvent($username));
    }

    /**
     * @param $gameId
     */
    public function removeInvitations($gameId)
    {
        $invitedUsers = $this->getInvitedUsers($gameId);
        $this->redis->del("PrivateGames:$gameId:invitations");

        foreach ($invitedUsers as $invitedUser) {
            $this->redis->zrem("GameInvitation:$invitedUser", $gameId);
            $this->eventDispatcher->dispatch(Events::RESET_USER_STATUS, new UserStatusResetEvent($invitedUser));
        }
    }

    /**
     * @param $gameId
     * @param $username
     * @param $answer
     */
    public function setAnswer($gameId, $username, $answer)
    {
        $ttl = $this->redis->ttl("Games:$gameId");
        $this->redis->hset("PrivateGames:$gameId:invitations", $username, $answer);
//        $this->redis->expire("PrivateGames:$gameId:invitations", $ttl);
        $this->redis->zrem("GameInvitation:$username", $gameId);

        if ($answer === 'accept') {
            $this->eventDispatcher->dispatch(Events::CHANGE_USER_STATUS, new UserStatusEvent($username, User::STATUS_INVITED));
            $this->redis->hset('Users:Games', $username, $gameId);
        } else {
            if ($this->redis->hget('Users:Games', $username) == $gameId) {
                $this->redis->hdel('Users:Games', $username);
            }
        }
    }

    /**
     * @param $gameId
     * @param $players
     */
    private function divisionCards($gameId, $players)
    {
        $spade = array('s2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 'sj', 'sq', 'sk', 'sA');
        $heart = array('hA', 'hK', 'hQ', 'hJ', 'h10', 'h9', 'h8', 'h7', 'h6', 'h5', 'h4', 'h3', 'h2');
        $diamond = array('d2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'dj', 'dq', 'dk', 'dA');
        $club = array('cA', 'cK', 'cQ', 'cJ', 'c10', 'c9', 'c8', 'c7', 'c6', 'c5', 'c4', 'c3', 'c2');

        shuffle($spade);
        shuffle($heart);
        shuffle($diamond);
        shuffle($club);
        $cards = array_merge($spade, $heart, $diamond, $club);
        shuffle($cards);

        foreach ($players as $player) {
            $userCards = array();
            for ($j = 0; $j < 7; $j++) {
                $userCards[] = array_pop($cards);
            }
            $this->redis->sadd("Games:$gameId:$player:Cards", $userCards);
        }

        $topCard = array_pop($cards);
        $this->redis->sadd("Games:$gameId:UpsetCards", $topCard);
        $this->redis->hset("Games:$gameId", 'topCard', $topCard);
        $this->redis->sadd("Games:$gameId:Cards", $cards);
    }

    /**
     * @param $gameId
     *
     * @return array $players
     */
    public function prepareGame($gameId)
    {
        $game = $this->getGame($gameId);
        $invitations = $this->getGameInvitations($gameId);
        $players = array_keys(array_filter(
            $invitations,
            function ($value) {
                return $value == 'accept';
            }
        ));

        array_push($players, $game['owner']);
        foreach ($players as $player) {
            $this->redis->lpush("Games:$gameId:Players", $player);
        }

        $this->divisionCards($gameId, $players);

        $this->redis->hmset(
            "Games:$gameId",
            array(
                'status' => Game::STATUS_PREPARE,
                'seats' => serialize(array_flip($players)),
            )
        );
        $this->redis->zadd('PrivateGames', array($gameId => time()));

        return $players;
    }

    public function startGame($gameId)
    {
        $this->redis->hmset(
            "Games:$gameId",
            array(
                'status' => Game::STATUS_PLAYING,
                'startedAt' => time(),
                'direction' => 1,
                'penalty' => 0,
            )
        );
    }

    public function resumeGame($gameId)
    {
        $this->redis->hset("Games:$gameId", 'status', Game::STATUS_PLAYING);
    }

    public function getPlayers($gameId)
    {
        return $this->redis->lrange("Games:$gameId:Players", 0, -1);
    }

    public function getTurn($gameId)
    {
        $direction = $this->redis->hget("Games:$gameId", 'direction');

        return $direction > 0 ?
            $this->redis->lindex("Games:$gameId:Players", 0) : $this->redis->lindex("Games:$gameId:Players", -1);
    }

    public function nextTurn($gameId)
    {
        $direction = $this->redis->hget("Games:$gameId", 'direction');
        $this->redis->hset("Games:$gameId", 'nextTurnAt', time() + 10);
        if ($direction > 0) {
            return $this->redis->rpoplpush("Games:$gameId:Players", "Games:$gameId:Players");
        } else {
            $turn = $this->redis->lpop("Games:$gameId:Players");
            $this->redis->rpush("Games:$gameId:Players", $turn);
            return $turn;
        }
    }

    public function clearUpsetCards($gameId)
    {
        $this->redis->watch("Games:$gameId:UpsetCards");
        $this->redis->watch("Games:$gameId");
        $cards = $this->redis->smembers("Games:$gameId:UpsetCards");
        $topCard = $this->redis->hget("Games:$gameId", 'topCard');
        $this->redis->multi();
        $this->redis->srem("Games:$gameId:UpsetCards", $cards);
        $this->redis->sadd("Games:$gameId:Cards", $cards);
        if ($topCard) {
            $this->redis->smove("Games:$gameId:Cards", "Games:$gameId:UpsetCards", $topCard);
        }
        $this->redis->exec();
    }

    public function nextTurnAndPenalty($gameId)
    {
        if ($this->redis->scard("Games:$gameId:UpsetCards") == 0) {
            $this->clearUpsetCards($gameId);
        }

        $turn = $this->getTurn($gameId);
        $this->redis->watch("Games:$gameId:Players");
        $this->redis->watch("Games:$gameId:Cards");
        $this->redis->watch("Games:$gameId:$turn:Cards");
        $direction = $this->redis->hget("Games:$gameId", 'direction');
        $this->redis->multi();
        //penalty
        $this->redis->spop("Games:$gameId:Cards");
        if ($direction > 0) {
            //nextTurn
            $this->redis->rpoplpush("Games:$gameId:Players", "Games:$gameId:Players");
        } else {
            //nextTurn
            $this->redis->lpop("Games:$gameId:Players");
        }
        $this->redis->hset("Games:$gameId", 'nextTurnAt', time() + 10);
        $res = $this->redis->exec();
        $penalty = $res[0];
        $nextTurn = $res[1];
        //penalty
        if ($penalty) {
            $this->redis->sadd("Games:$gameId:$turn:Cards", $penalty);
        }

        //nextTurn
        if ($direction < 0) {
            $this->redis->rpush("Games:$gameId:Players", $nextTurn);
        }

        return array(
            'penalty' => $penalty,
            'nextTurn' => $nextTurn,
            'res' => $res,
            'turn' => $turn,
        );
    }

    public function getPenalty($gameId, $username, $count=1)
    {
        if ($this->redis->scard("Games:$gameId:UpsetCards") == 0) {
            $this->clearUpsetCards($gameId);
        }

        //on redis 3.2
//        $randCards = $this->redis->spop("Games:$gameId:Cards", $count);

        $randCards = array();
        for ($i = 0; $i < $count; $i++) {
            $penalty = $this->redis->spop("Games:$gameId:Cards");
            if ($penalty) {
                $randCards[] = $penalty;
            }
        }

        if ($randCards) {
            $this->redis->sadd("Games:$gameId:$username:Cards", $randCards);
        }

        return $randCards;
    }

    public function canPlay($gameId, $username)
    {
        return $this->getTurn($gameId) === $username;
    }

    public function isCorrect($gameId, $username, $cardName, array $extra = array())
    {
        $result = array();
        $result['top'] = $cardName;
        $result['previousTurn'] = $this->getTurn($gameId);

        $playedCardType = substr($cardName, 0, 1);
        $playedCardNumber = substr($cardName, 1);

        $topCard = $this->redis->hget("Games:$gameId", 'topCard');
        $topCardType = substr($topCard, 0, 1);
        $topCardNumber = substr($topCard, 1);

        if ($playedCardNumber !== $topCardNumber and $playedCardType !== $topCardType and $topCardNumber !== 'j') {
            $penalties = $this->getPenalty($gameId, $username);
            throw (new WrongCardException())->setPenalties($penalties);
        }

        if ($topCardNumber === '7' and $playedCardNumber !== '7') {
            $penaltyCount = $this->redis->hget("Games:$gameId", 'penalty');
            $this->redis->hset("Games:$gameId", 'penalty', 0);
            $penalties = $this->getPenalty($gameId, $username, $penaltyCount);
            throw (new WrongCardException())->setPenalties($penalties);
        }

        switch ($playedCardNumber) {
            case '2':
                $penalty = $this->getPenalty($gameId, $extra['target'], 1);
                $result['penalty'] = array($extra['target'] => $penalty);
                $this->nextTurn($gameId);
                break;
            case '7':
                $this->redis->hincrby("Games:$gameId", 'penalty', 2);
                $this->nextTurn($gameId);
                break;
            case '8':
                // we should not call nextTurn, current user can play again
                break;
            case '10':
                $this->redis->hset("Games:$gameId", 'direction', $this->redis->hget("Games:$gameId", 'direction') * -1);
                // we should not call nextTurn after change direction
                break;
            case 'j':
                // if user select heart, change top card to h1
                $this->redis->hset("Games:$gameId", 'topCard', '1' . $extra['color']);
                $this->nextTurn($gameId);
                $result['top'] = '1' . $extra['color'];
                break;
            case 'a':
                $this->nextTurn($gameId);
                $this->nextTurn($gameId);
                break;
            default:
                $this->nextTurn($gameId);
        }

        $this->redis->hset("Games:$gameId", 'topCard', $cardName);
        $this->redis->smove("Games:$gameId:$username:Cards", "Games:$gameId:UpsetCards", $cardName);

        return $result;
    }

    public function pauseGame($gameId)
    {
        $this->redis->hset("Games:$gameId", 'status', Game::STATUS_PAUSED);
    }

    public function finishGame($gameId)
    {
        $this->removeGame($gameId);
    }

    public function getUserCards($gameId, $username)
    {
        return $this->redis->smembers("Games:$gameId:$username:Cards");
    }

    public function getCountOfUsersCards($gameId, array $users = array())
    {
        if (empty($users)) {
            $users = array_flip($this->getPlayers($gameId));
        }

        $seats = array();
        foreach ($users as $username => $seat) {
            $seats[$username] = $this->redis->scard("Games:$gameId:$username:Cards");
        }
        return $seats;
    }

    public function getCountOfUserCards($gameId, $username)
    {
        return $this->redis->scard("Games:$gameId:$username:Cards");
    }
}

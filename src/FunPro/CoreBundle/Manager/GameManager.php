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
use FunPro\UserBundle\Manager\InboxManager;
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

    /**
     * @var InboxManager
     */
    private $inboxManager;

    public function __construct(Client $redis, Registry $doctrine, EventDispatcherInterface $eventDispatcher, InboxManager $inboxManager)
    {
        $this->redis = $redis;
        $this->doctrine = $doctrine;
        $this->eventDispatcher = $eventDispatcher;
        $this->inboxManager = $inboxManager;
    }

    /**
     * @param      $name
     * @param      $scope
     * @param null $ownerUsername
     * @param null $turnTime
     * @param null $point
     *
     * @throws \Error
     * @throws \Exception
     * @throws \TypeError
     * @return array (id, game)
     */
    public function createGame($name, $scope, $ownerUsername = null, $turnTime = null, $point = null)
    {
        $game = array(
            'scope' => $scope,
            'name' => $name,
            'status' => 'waiting',
        );

        if ($scope == Game::SCOPE_PRIVATE) {
            $game['owner'] = $ownerUsername;
            $game['turnTime'] = $turnTime;
            $game['point'] = $point;
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
     * @param $turnTime
     * @param $point
     *
     * @return array (id, game)
     */
    public function createPrivateGame($ownerUsername, $gameName, $turnTime, $point)
    {
        if ($userGame = $this->getUserGame($ownerUsername)) {
            $gameId = $userGame['id'];
            $game   = $userGame['game'];
        } else {
            return $this->createGame($gameName, Game::SCOPE_PRIVATE, $ownerUsername, $turnTime, $point);
        }

        if (!$game or $game['status'] == Game::STATUS_FINISHED) {
            return $this->createGame($gameName, Game::SCOPE_PRIVATE, $ownerUsername, $turnTime, $point);
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
        $players = $this->getPlayers($gameId);

        $this->redis->del("Games:$gameId");
        $this->redis->del("Games:$gameId:Players");
        $this->redis->del("Logs:$gameId");
        $this->redis->del("Games:$gameId:Scores");

        foreach ($players as $player) {
            if ($this->redis->hget('Users:Games', $player) === $gameId) {
                $this->redis->hdel('Users:Games', $player);
            }
        }

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
//        $this->redis->zremrangebyscore("GameInvitation:$username", 0, time());
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
//        $ttl = $this->redis->ttl("Games:$gameId");
        $this->redis->hset("PrivateGames:$gameId:invitations", $username, 'waiting');
//        $this->redis->expire("PrivateGames:$gameId:invitations", $ttl);
        $this->redis->zadd("GameInvitation:$username", array($gameId => time()));
//        $this->redis->zremrangebyscore("GameInvitation:$username", 0, time());
    }

    /**
     * @param $gameId
     * @param $username
     */
    public function removeUserInvitation($gameId, $username)
    {
//        $ttl = $this->redis->ttl("Games:$gameId");
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
//        $ttl = $this->redis->ttl("Games:$gameId");
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
     */
    private function divisionCards($gameId)
    {
        $spade = array('s2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 'sj', 'sq', 'sk', 'sa');
        $heart = array('ha', 'hk', 'hq', 'hj', 'h10', 'h9', 'h8', 'h7', 'h6', 'h5', 'h4', 'h3', 'h2');
        $diamond = array('d2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'dj', 'dq', 'dk', 'da');
        $club = array('ca', 'ck', 'cq', 'cj', 'c10', 'c9', 'c8', 'c7', 'c6', 'c5', 'c4', 'c3', 'c2');

        shuffle($spade);
        shuffle($heart);
        shuffle($diamond);
        shuffle($club);
        $cards = array_merge($spade, $heart, $diamond, $club);
        shuffle($cards);

        $players = $this->redis->lrange("Games:$gameId:Players", 0, -1);
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

        $this->divisionCards($gameId);

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

    public function nextTurn($gameId, $currentUser = null)
    {
        $this->redis->watch("Games:$gameId");
        $this->redis->watch("Games:$gameId:Players");
        $direction = $this->redis->hget("Games:$gameId", 'direction');
        $turn = $this->getTurn($gameId);
        if ($currentUser and $turn !== $currentUser) {
            echo 'can not go to next turn';
            return;
        }

        $this->redis->multi();
        if ($direction > 0) {
            $this->redis->rpoplpush("Games:$gameId:Players", "Games:$gameId:Players");
            $res = $this->redis->exec();
        } else {
            $this->redis->lpop("Games:$gameId:Players");
            $res = $this->redis->exec();
            $this->redis->rpush("Games:$gameId:Players", $res[0]);
        }

        $this->redis->hset("Games:$gameId", 'nextTurnAt', time() + 10);
        return $res[0];
    }

    public function clearUpsetCards($gameId)
    {
        $this->redis->watch("Games:$gameId:UpsetCards");
        $this->redis->watch("Games:$gameId");
        $cards = $this->redis->smembers("Games:$gameId:UpsetCards");
        if (!$cards) {
            $this->redis->unwatch();
            return;
        }

        $topCard = $this->redis->hget("Games:$gameId", 'topCard');
        $this->redis->multi();
        $this->redis->srem("Games:$gameId:UpsetCards", $cards);
        $this->redis->sadd("Games:$gameId:Cards", $cards);
        if ($topCard) {
            $this->redis->smove("Games:$gameId:Cards", "Games:$gameId:UpsetCards", $topCard);
        }
        $this->redis->exec();
    }

    public function getPenalty($gameId, $username)
    {
        if ($this->redis->scard("Games:$gameId:Cards") == 0) {
            $this->clearUpsetCards($gameId);
        }

        $this->redis->watch("Games:$gameId");
        $count = 1 + $this->redis->hget("Games:$gameId", 'penalty');
        $this->redis->multi();
        for ($i = 0; $i < $count; $i++) {
            $this->redis->spop("Games:$gameId:Cards");
        }
        $this->redis->hset("Games:$gameId", 'penalty', 0);
        $res = $this->redis->exec();

        $randCards = array();
        for ($i = 0; $i < $count; $i++) {
            if ($res[$i]) {
                $randCards[] = $res[$i];
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
        $result['topCard'] = $cardName;

        $playedCardType = strtolower(substr($cardName, 0, 1));
        $playedCardNumber = strtolower(substr($cardName, 1));

        $topCard = $this->redis->hget("Games:$gameId", 'topCard');
        $topCardType = substr($topCard, 0, 1);
        $topCardNumber = substr($topCard, 1);

        #FIXME: if count of players card == 2 and $extra['uno'] is not exists, wrong card exception

        if ($playedCardNumber !== $topCardNumber and $playedCardType !== $topCardType and $playedCardNumber !== 'j') {
            $penalties = $this->getPenalty($gameId, $username);
            $this->nextTurn($gameId, $username);
            throw (new WrongCardException())->setPenalties($penalties);
        }

        if ($this->redis->hget("Games:$gameId", 'penalty') > 0 and $playedCardNumber !== '7') {
            $penalties = $this->getPenalty($gameId, $username);
            $this->nextTurn($gameId, $username);
            throw (new WrongCardException())->setPenalties($penalties);
        }

        switch ($playedCardNumber) {
            case '2':
                if (is_array($extra) and array_key_exists('target', $extra)) {
                    $penalty = $this->getPenalty($gameId, $extra['target']);
                    $result['penalty'] = $penalty;
                }
                $this->nextTurn($gameId, $username);
                break;
            case '7':
                $this->redis->hincrby("Games:$gameId", 'penalty', 2);
                $this->nextTurn($gameId, $username);
                break;
            case '8':
                // we should not call nextTurn, current user can play again
                break;
            case '10':
                $this->redis->hset("Games:$gameId", 'direction', $this->redis->hget("Games:$gameId", 'direction') * -1);
                // we should not call nextTurn after change direction, only in 2 player games
                #FIXME: maybe count of players be 4, but 2 player finished their cards
                if ($this->redis->llen("Games:$gameId:Players") == 2) {
                    $this->nextTurn($gameId);
                }
                break;
            case 'j':
                // if user select heart, change top card to h1
                if (is_array($extra)
                    and array_key_exists('color', $extra)
                    and in_array($extra['color'], array('h', 'd', 'c', 's', true))
                ) {
                    $this->redis->hset("Games:$gameId", 'topCard', $extra['color'] . '1');
                    $result['topCard'] = $extra['color'] . '1';
                }
                $this->nextTurn($gameId, $username);
                break;
            case 'a':
                $this->nextTurn($gameId, $username);
                $this->nextTurn($gameId);
                break;
            default:
                $this->nextTurn($gameId, $username);
        }

        $this->redis->hset("Games:$gameId", 'topCard', $result['topCard']);
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

    public function getTurnTime($gameId)
    {
        return $this->redis->hget("Games:$gameId", 'turnTime');
    }

    public function getMaxPoint($gameId)
    {
        return $this->redis->hget("Games:$gameId", 'point');
    }

    public function getUsersScore($gameId)
    {
        return $this->redis->hgetall("Games:$gameId:Scores");
    }

    public function finishRound($gameId)
    {
        $this->inboxManager->addLog($gameId, 'Finish round');

        $topCard = $this->redis->hget("Games:$gameId", 'topCard');
        $multiply = strpos($topCard, 'j') ? 2 : 1;

        $players = $this->getPlayers($gameId);
        $scores = array();
        foreach ($players as $player) {
            $cards = $this->getUserCards($gameId, $player);
            $score = 0;
            foreach ($cards as $card) {
                $number = substr($card, 1);
                if (is_numeric($number) and $number < 10) {
                    $score += $number;
                } elseif ($number === 'j') {
                    $score += 20;
                } else {
                    $score += 10;
                }
            }
            $scores[$player] = $multiply * $score;
            $this->redis->hincrby("Games:$gameId:Scores", $player, $multiply * $score);

            $this->inboxManager->addLog($gameId, sprintf('%s: %d', $player, $multiply * $score));
            $this->redis->del("Games:$gameId:$player:Cards");
        }

        $this->redis->del("Games:$gameId:UpsetCards");
        $this->redis->del("Games:$gameId:Cards");

        return $scores;
    }

    public function startNewRound($gameId)
    {
//        $game = $this->getGame($gameId);
        $this->divisionCards($gameId);

        $this->redis->hmset(
            "Games:$gameId",
            array(
//                'status' => Game::STATUS_PLAYING,
//                'startedAt' => time(),
                'direction' => 1,
                'penalty' => 0,
            )
        );
    }
}

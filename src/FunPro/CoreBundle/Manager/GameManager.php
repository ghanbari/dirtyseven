<?php

namespace FunPro\CoreBundle\Manager;

use Doctrine\Bundle\DoctrineBundle\Registry;
use FunPro\CoreBundle\Exception\ActiveGameException;
use FunPro\CoreBundle\Exception\GameNotFoundException;
use FunPro\CoreBundle\Exception\InvalidScopeException;
use FunPro\CoreBundle\Exception\NotInvitedException;
use FunPro\CoreBundle\Model\Game;
use Predis\Client;

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

    public function __construct(Client $redis, Registry $doctrine)
    {
        $this->redis = $redis;
        $this->doctrine = $doctrine;
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

        $this->redis->expire("Games:$gameId", 3600);

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
        $this->redis->expire("PrivateGames:$gameId:invitations", $ttl);
        $this->redis->zadd("GameInvitation:$username", array($gameId => time() + $ttl));
        $this->redis->zremrangebyscore("GameInvitation:$username", 0, time());
    }

    public function removeUserInvitation($gameId, $username)
    {
        $ttl = $this->redis->ttl("Games:$gameId");
        $this->redis->hdel("PrivateGames:$gameId:invitations", $username);
        $this->redis->expire("PrivateGames:$gameId:invitations", $ttl);
        $this->redis->zrem("GameInvitation:$username", $gameId);
    }

    public function removeInvitations($gameId)
    {
        $invitedUsers = $this->getInvitedUsers($gameId);
        $this->redis->del("PrivateGames:$gameId:invitations");

        foreach ($invitedUsers as $invitedUser) {
            $this->redis->zrem("GameInvitation:$invitedUser", $gameId);
        }
    }
}

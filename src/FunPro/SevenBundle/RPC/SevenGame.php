<?php

namespace FunPro\SevenBundle\RPC;

use FunPro\CoreBundle\Manager\GameManager;
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

    public function __construct(GameManager $gameManager, ClientHelper $clientHelper)
    {
        $this->gameManager = $gameManager;
        $this->clientHelper = $clientHelper;
    }

    public function getGame(ConnectionInterface $connection, WampRequest $request, $params)
    {
        $user = $this->clientHelper->getCurrentUser($connection);
        $game = $this->gameManager->getActiveGame($user->getUsername());
        $data = $game['game'];
        $data['cards']['owner'] = $this->gameManager->getUserCards($game['id'], $user->getUsername());
        $data['cards']['users'] = $this->gameManager->getCountOfUserCards($game['id'], unserialize($data['seats']));

        return array(
            'status' => array('message' => 'OK', 'code' => 1),
            'data' => $data,
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

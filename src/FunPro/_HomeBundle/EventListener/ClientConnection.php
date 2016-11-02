<?php

namespace FunPro\HomeBundle\EventListener;

use Gos\Bundle\WebSocketBundle\Client\ClientManipulatorInterface;
use Gos\Bundle\WebSocketBundle\Client\ClientStorageInterface;
use Gos\Bundle\WebSocketBundle\Event\ClientErrorEvent;
use Gos\Bundle\WebSocketBundle\Event\ClientEvent;
use Gos\Bundle\WebSocketBundle\Event\ClientRejectedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class ClientConnection implements  EventSubscriberInterface
{
    private $connections;

    /**
     * @var ClientManipulatorInterface
     */
    private $clientManipulator;

    /**
     * @var ClientStorageInterface
     */
    private $clientStorage;

    public function __construct(ClientStorageInterface $clientStorage, ClientManipulatorInterface $clientManipulator)
    {
        $this->connections = array();
        $this->clientManipulator = $clientManipulator;
        $this->clientStorage = $clientStorage;
    }

    public static function getSubscribedEvents()
    {
        return array(
            'gos_web_socket.client_connected' => 'onClientConnect',
            'gos_web_socket.client_disconnected' => 'onClientDisconnect',
            'gos_web_socket.client_error' => 'onClientError',
            'gos_web_socket.client_rejected' => 'onClientRejected',
        );
    }

    public function onClientConnect(ClientEvent $event)
    {
        $connection = $event->getConnection();
    }

    public function onClientDisconnect(ClientEvent $event)
    {

    }

    public function onClientError(ClientErrorEvent $event)
    {

    }

    public function onClientRejected(ClientRejectedEvent $event)
    {

    }
}

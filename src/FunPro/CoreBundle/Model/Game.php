<?php

namespace FunPro\CoreBundle\Model;

class Game
{
    const SCOPE_PRIVATE = 'private';
    const SCOPE_PUBLIC = 'public';

    const STATUS_WAITING = 'waiting';
    const STATUS_PREPARE = 'prepare';
    const STATUS_PAUSED  = 'paused';
    const STATUS_PLAYING = 'playing';
    const STATUS_FINISHED = 'finished';

    const SEVEN = 'seven';
    const SHELEM = 'shelem';
    const SEVEN_JOKER = 'seven joker';
}

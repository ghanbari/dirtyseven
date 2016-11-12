<?php

namespace FunPro\CoreBundle\Exception;

use Exception;

class GameNotFoundException extends \RuntimeException
{
    public function __construct($message = "Game is not exists", $code = -102, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

<?php

namespace FunPro\CoreBundle\Exception;

use Exception;

class ActiveGameException extends \RuntimeException
{
    public function __construct($message = "You have active game", $code = -100, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

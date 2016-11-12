<?php

namespace FunPro\CoreBundle\Exception;

use Exception;

class InvalidScopeException extends \Exception
{
    public function __construct($message = 'Game scope is wrong', $code = -104, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

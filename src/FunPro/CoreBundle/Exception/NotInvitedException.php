<?php

namespace FunPro\CoreBundle\Exception;

use Exception;

class NotInvitedException extends \UnexpectedValueException
{
    public function __construct($message = 'User has not invitation', $code = -101, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

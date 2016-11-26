<?php

namespace FunPro\CoreBundle\Exception;

use Exception;

class WrongCardException extends \RuntimeException
{
    protected $penalties;

    /**
     * @return array
     */
    public function getPenalties()
    {
        return $this->penalties;
    }

    /**
     * @param mixed $penalties
     *
     * @return $this
     */
    public function setPenalties(array $penalties)
    {
        $this->penalties = $penalties;
        return $this;
    }

    public function __construct($message = 'Wrong card played', $code = -105, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

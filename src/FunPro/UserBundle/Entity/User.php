<?php

namespace FunPro\UserBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * User model
 * 
 * @ORM\Table(name="user")
 * @ORM\Entity(repositoryClass="FunPro\UserBundle\Repository\UserRepository")
 */
class User extends BaseUser
{
    /**
     * User id
     * 
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * Google oauth id
     *
     * @var string
     *
     * @ORM\Column(name="google_id", nullable=true)
     */
    protected $googleId;

    /**
     * Google oauth access token
     *
     * @var string
     */
    protected $googleAccessToken;

    /**
     * Yahoo oauth id
     *
     * @var string
     *
     * @ORM\Column(name="yahoo_id", nullable=true)
     */
    protected $yahooId;

    /**
     * Yahoo access token
     *
     * @var string
     */
    protected $yahooAccessToken;

    /**
     * User constructor.
     */
    public function __construct()
    {
        parent::__construct();
        // your own logic
    }

    /**
     * Get google id
     *
     * @return string
     */
    public function getGoogleId()
    {
        return $this->googleId;
    }

    /**
     * Set google id
     *
     * @param string $googleId google id
     *
     * @return $this
     */
    public function setGoogleId($googleId)
    {
        $this->googleId = $googleId;

        return $this;
    }

    /**
     * Set yahooId
     *
     * @param string $yahooId
     *
     * @return User
     */
    public function setYahooId($yahooId)
    {
        $this->yahooId = $yahooId;

        return $this;
    }

    /**
     * Get yahooId
     *
     * @return string
     */
    public function getYahooId()
    {
        return $this->yahooId;
    }
}

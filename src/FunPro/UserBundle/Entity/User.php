<?php

namespace FunPro\UserBundle\Entity;

use FOS\UserBundle\Model\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Vich\UploaderBundle\Mapping as Vich;

/**
 * User model
 * 
 * @ORM\Table(name="user")
 * @ORM\Entity(repositoryClass="FunPro\UserBundle\Repository\UserRepository")
 *
 * @Vich\Annotation\Uploadable()
 */
class User extends BaseUser
{
    const STATUS_OFFLINE    = 'offline';
    const STATUS_ONLINE     = 'online';
    const STATUS_WAITING    = 'waiting';
    const STATUS_PLAYING    = 'playing';

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
     * @var string
     *
     * @ORM\Column(name="status", length=30)
     */
    protected $status;

    /**
     * @var string
     *
     * @ORM\Column()
     */
    protected $avatar;

    /**
     * @var File
     *
     * @Vich\Annotation\UploadableField(mapping="avatar", fileNameProperty="avatar")
     */
    protected $avatarFile;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="created_at", type="datetime")
     */
    protected $createdAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * User constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setStatus(self::STATUS_OFFLINE);
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

    /**
     * @return string
     */
    public function getGoogleAccessToken()
    {
        return $this->googleAccessToken;
    }

    /**
     * @param string $googleAccessToken
     *
     * @return $this
     */
    public function setGoogleAccessToken($googleAccessToken)
    {
        $this->googleAccessToken = $googleAccessToken;
        return $this;
    }

    /**
     * @return string
     */
    public function getYahooAccessToken()
    {
        return $this->yahooAccessToken;
    }

    /**
     * @param string $yahooAccessToken
     *
     * @return $this
     */
    public function setYahooAccessToken($yahooAccessToken)
    {
        $this->yahooAccessToken = $yahooAccessToken;
        return $this;
    }

    /**
     * Set status
     *
     * @param string $status
     *
     * @return User
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set avatar
     *
     * @param string $avatar
     *
     * @return User
     */
    public function setAvatar($avatar)
    {
        $this->avatar = $avatar;

        return $this;
    }

    /**
     * Get avatar
     *
     * @return string
     */
    public function getAvatar()
    {
        return $this->avatar;
    }

    /**
     * @return File
     */
    public function getAvatarFile()
    {
        return $this->avatarFile;
    }

    /**
     * @param File $avatarFile
     *
     * @return $this
     */
    public function setAvatarFile(File $avatarFile)
    {
        if ($avatarFile) {
            $this->avatarFile = $avatarFile;
            $this->setUpdatedAt(new \DateTime());
        }
        return $this;
    }

    /**
     * Set createdAt
     *
     * @param \DateTime $createdAt
     *
     * @return User
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Get createdAt
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Set updatedAt
     *
     * @param \DateTime $updatedAt
     *
     * @return User
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Get updatedAt
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }
}

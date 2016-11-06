<?php

namespace FunPro\UserBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class UserController
 *
 * @package FunPro\UserBundle\Controller
 */
class UserController extends Controller
{
    /**
     * @Security("is_authenticated()")
     */
    public function getAvatarsAction(Request $request)
    {
        $usernames = $request->request->get('usernames');
        $usernames = array_slice($usernames, 0, $this->getParameter('friends.max_count'));

        $users = $this->getDoctrine()->getRepository('FunProUserBundle:User')->findUserByUsername($usernames);

        $avatars = array();
        foreach ($users as $user) {
            $avatars[$user['username']] = md5(strtolower(trim($user['email'])));
        }

        return new JsonResponse($avatars);
    }
}

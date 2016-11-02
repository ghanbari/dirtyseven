<?php

namespace FunPro\HomeBundle\Controller;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations as Rest;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * Homepage controller
 *
 * @package FunPro\HomeBundle\Controller
 
 * @Rest\RouteResource(resource="", pluralize=false)
 * @Rest\NamePrefix("fun_pro_home_api_")
 */
class HomeController extends FOSRestController
{
    /**
     * Homepage
     *
     * @Security("has_role('ROLE_USER')")
     *
     * @Rest\Get(path="/")
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        return $this->render('FunProHomeBundle:Home:index.html.twig');
    }
}

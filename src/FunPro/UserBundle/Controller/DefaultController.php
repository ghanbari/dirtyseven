<?php

namespace FunPro\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('FunProUserBundle:Default:index.html.twig');
    }
}

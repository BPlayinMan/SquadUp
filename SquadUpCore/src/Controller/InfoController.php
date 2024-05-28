<?php
namespace App\Controller;

use App\Util\AllowAnonymous;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class InfoController extends AbstractController
{
    #[Route("/api/info", name: "info", methods: "GET")]
    #[AllowAnonymous]
    public function getInfo(): Response
    {
        return new Response("A wise man speaks because he has something to say, a fool speaks because he has to say something.", 200);
    }
}
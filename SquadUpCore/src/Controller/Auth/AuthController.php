<?php
namespace App\Controller\Auth;

use App\Util\AllowAnonymous;
use App\Util\OAuthUtils;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    //Exchange a Discord Auth code for an access token
    #[AllowAnonymous]
    #[Route("/api/auth/exchange", name: "auth_exchange", methods: ["POST", "OPTIONS"])]
    #[CORSInformation(true)]
    public function exchange(Request $request): Response
    {
        //Get the user code to exchange
        $data = json_decode($request->getContent(), true);
        $code = $data["code"];

        //Exchange the code for a token
        $auth = OAuthUtils::execFullOAuthFlow($code, $_ENV['OAUTH_REDIRECT_URI']);
        //var_dump($auth);

        //Return 401 if auth failed
        if($auth === false)
            return CORSInformation::appendCORS(new Response(status: 401), true);

        //TODO Change CORS policy

        //Return the JWT token
        return CORSInformation::appendCORS(new JsonResponse($auth));
    }
}
<?php
namespace App\Controller\Auth;

use App\Util\AllowAnonymous;
use App\Util\OAuthUtils;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Controller for handling authentication in development
 * Will bypass UI-based authentication and directly perform OAuth2 authentication
 * Will also skip OAuth2 state checks
 */
class DevAuthController extends AbstractController
{
    #[AllowAnonymous]
    #[Route("/api/auth/internal/exchange")]
    public function exchange(Request $request) : Response
    {
        //Completely disable route if DISABLE_DEV_AUTH is set
        if(isset($_ENV["DISABLE_DEV_AUTH"]))
            return new Response(status: 404);

        //Perform full OAuth2 flow
        $auth = OAuthUtils::execFullOAuthFlow($request->query->get('code'));
        if(!$auth)
            return new Response(status: 401);

        //Return the JWT token
        return new Response(
            content: $auth,
            status: 200,
        );
    }
}
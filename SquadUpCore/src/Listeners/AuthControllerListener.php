<?php
namespace App\Listeners;

use App\Exceptions\RequestFailException;
use App\Exceptions\UnknownUserException;
use App\Model\PDOUtils;
use App\Model\UserInfo;
use App\Util\AllowAnonymous;
use App\Util\CORSInformation;
use Firebase\JWT\SignatureInvalidException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use App\Util\JWTUtils;
use UnexpectedValueException;

class AuthControllerListener
{
    public function __invoke(ControllerEvent $event)
    {
        //TODO Should also add check for which part of the API is being queried

        //Completely skip auth checks if anonymous access is allowed (mainly only under routes)
        $attrs = $event->getControllerReflector()->getAttributes(AllowAnonymous::class);
        //var_dump($attrs);
        if(count($attrs) > 0)
            return;

        //Get the incoming request
        $req = $event->getRequest();
        if($req->getMethod() == "OPTIONS")
            return;

        //Get auth header and explode
        $authRaw = $req->headers->get("Authorization");
        $split = explode(" ", $authRaw);

        //If we have no bearer, return 401
        if($split[0] != "Bearer" || count($split) != 2)
        {
            $this->return401($event);
        } else
        {
            //Decode JWT token
            try
            {
                $jwt = JWTUtils::decode($split[1]);

                $db = PDOUtils::getConnection();
                $stmt = $db->prepare("SELECT * FROM userinfo WHERE id = :id");
                $stmt->bindParam(":id", $jwt->id);
                $stmt->execute();

                $res = $stmt->fetchAll();
                if(count($res) == 0)
                {
                    //Return 401 if user is not found
                    $this->return401($event);
                } else
                {
                    $req->attributes->set("jwt", $jwt);
                    $req->attributes->set("token", $res[0]["AccessToken"]);
                    $req->attributes->set("user", new UserInfo($jwt->id, self: true));
                }
            } catch (RequestFailException $e)
            {
                $event->setController(fn() =>
                    CORSInformation::appendCORS(new Response("Failed to get user data", $e->response->getStatusCode()), true)
                );
            } catch (UnknownUserException|UnexpectedValueException $e)
            {
                $this->return401($event);
            }
            //$this->return401($event);
        }
    }

    //Simple function to streamline returning 401
    private function return401(ControllerEvent $event)
    {
        //$event->setController(fn() => new Response(status: 401));
        $event->setController(fn() => CORSInformation::appendCORS(new Response(status: 401), true));
    }
}
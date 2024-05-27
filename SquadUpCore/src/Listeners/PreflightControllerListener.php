<?php
namespace App\Listeners;

use App\Util\CORSInformation;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ControllerEvent;

//Utility to automatically handle preflight requests
class PreflightControllerListener
{
    public function __invoke(ControllerEvent $event)
    {
        $req = $event->getRequest();

        //Get the preflight attributes
        $attrs = $event->getControllerReflector()->getAttributes(CORSInformation::class);
        if(count($attrs) > 0)
        {
            $preflight = $attrs[0]->newInstance();
            $req->attributes->set("cors", $preflight);

            if($req->getMethod() === "OPTIONS")
            {
                //Set the controller to return the preflight headers
                $event->setController(fn() => new Response(status: 200, headers: [
                    "Access-Control-Allow-Origin" => $preflight->origin,
                    "Access-Control-Allow-Methods" => $preflight->methods,
                    "Access-Control-Allow-Headers" => $preflight->headers,
                ]));
            }
        }
    }
}
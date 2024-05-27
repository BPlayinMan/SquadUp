<?php
namespace App\Listeners;

use Symfony\Component\HttpKernel\Event\ResponseEvent;

class CORSControllerListener
{
    public function __invoke(ResponseEvent $event)
    {
        $request = $event->getRequest();
        $response = $event->getResponse();

        if($request->attributes->has("cors"))
        {
            $cors = $request->attributes->get("cors");
            $response->headers->set("Access-Control-Allow-Origin", $cors->origin);
            $response->headers->set("Access-Control-Allow-Methods", $cors->methods);
            $response->headers->set("Access-Control-Allow-Headers", $cors->headers);
        }
    }
}
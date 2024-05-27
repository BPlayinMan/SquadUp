<?php
namespace App\Util;

use Symfony\Component\HttpFoundation\Response;

#[\Attribute(\Attribute::TARGET_CLASS | \Attribute::TARGET_METHOD)]
class CORSInformation
{
    public string $origin;
    public string $methods;
    public string $headers;

    public function __construct(bool $env = false, string $origin = "*", string $methods = "*", string $headers = "*")
    {
        if($env)
        {
            $this->origin = $_ENV["CORS_ORIGIN"];
            $this->methods = $_ENV["CORS_METHODS"];
            $this->headers = $_ENV["CORS_HEADERS"];
            return;
        }

        $this->origin = $origin;
        $this->methods = $methods;
        $this->headers = $headers;
    }

    public static function appendCORS(Response $response, bool $env = false, string $origin = "*", string $methods = "*", string $headers = "*"): Response
    {
        $originNew = $env ? $_ENV["CORS_ORIGIN"] : $origin;
        $methodsNew = $env ? $_ENV["CORS_METHODS"] : $methods;
        $headersNew = $env ? $_ENV["CORS_HEADERS"] : $headers;

        $response->headers->set("Access-Control-Allow-Origin", $originNew);
        $response->headers->set("Access-Control-Allow-Methods", $methodsNew);
        $response->headers->set("Access-Control-Allow-Headers", $headersNew);

        return $response;
    }
}
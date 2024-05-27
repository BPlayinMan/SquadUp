<?php
namespace App\Exceptions;

use Symfony\Contracts\HttpClient\ResponseInterface;

class RequestFailException extends \Exception
{
    public readonly ResponseInterface $response;

    public function __construct(ResponseInterface $response)
    {
        $this->response = $response;
        parent::__construct("Request failed with status code " . $response->getStatusCode());
    }
}
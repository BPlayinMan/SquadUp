<?php
namespace App\Exceptions;

use Exception;

class UnknownUserException extends Exception
{
    public readonly int $uid;

    public function __construct(int $uid)
    {
        parent::__construct("User with ID $uid not found");
        $this->uid = $uid;
    }
}
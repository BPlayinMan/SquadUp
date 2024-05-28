<?php
namespace App\Util;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use stdClass;

class JWTUtils
{
    public static function getJwtKey(): false|Key
    {
        return new Key($_ENV["JWT_PASSPHRASE"], "HS256");
    }

    public static function encode(array $data, int $expire): string
    {
        //Generate the payload, merge with requested data
        $payload = [
            'iat' => time(),
            'exp' => time() + $expire,
            'iss' => $_ENV['JWT_ISSUER'],
            'aud' => $_ENV['JWT_AUDIENCE']
        ];
        $payload = array_merge($payload, $data);

        return JWT::encode($payload, $_ENV["JWT_PASSPHRASE"], 'HS256');
    }

    public static function decode(string $token): stdClass
    {
        return JWT::decode($token, self::getJwtKey());
    }
}
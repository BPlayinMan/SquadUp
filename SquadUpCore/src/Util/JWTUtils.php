<?php
namespace App\Util;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use OpenSSLAsymmetricKey;
use stdClass;

class JWTUtils
{
    public static function getJwtKey(): false|OpenSSLAsymmetricKey
    {
        $pass = $_ENV['JWT_PASSPHRASE'];
        $privKeyFile = $_ENV['JWT_KEY_FILE'];

        return openssl_pkey_get_private("file://$privKeyFile", $pass);
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

        return JWT::encode($payload, JWTUtils::getJwtKey(), 'RS256');
    }

    public static function decode(string $token): stdClass
    {
        $public = openssl_pkey_get_details(JWTUtils::getJwtKey())['key'];
        return JWT::decode($token, new Key($public, 'RS256'));
    }
}
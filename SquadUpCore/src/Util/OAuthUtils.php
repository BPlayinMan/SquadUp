<?php
namespace App\Util;

use App\Model\PDOUtils;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\HttpOptions;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;

class OAuthUtils
{
    public static function exchangeToken(string $code, string $redirect = null): false|array
    {
        $data = [
            "client_id" => $_ENV['OAUTH_CLIENT_ID'],
            "client_secret" => $_ENV['OAUTH_CLIENT_SECRET'],
            "grant_type" => "authorization_code",
            "code" => $code,
            //"scopes" => $_ENV['OAUTH_SCOPES'],
            "redirect_uri" => $redirect ?? $_ENV['DEV_OAUTH_REDIRECT_URI'],
        ];

        //Setup client and send exchange request
        $client = HttpClient::create();
        $exchangeResponse = $client->request("POST", "https://discord.com/api/oauth2/token", [
            "headers" => [
                "Content-Type" => "application/x-www-form-urlencoded",
            ],
            "body" => $data,
        ]);
        //var_dump($exchangeResponse);

        //Return false if we didn't get a 200
        if($exchangeResponse->getStatusCode() != 200)
            return false;

        //Return the JSON response
        return json_decode($exchangeResponse->getContent(), true);
    }

    public static function createOrUpdateUser(array $token): array|false
    {
        //var_dump($token);
        //TODO: Implement user creation or update
        //Create client with access token
        $client = HttpClient::create([
            "auth_bearer" => $token["access_token"],
        ]);
        $response = $client->request("GET", "https://discord.com/api/v10/users/@me");
        if($response->getStatusCode() != 200)
            return false;

        //Get the JSON response
        $content = json_decode($response->getContent(), true);
        $id = $content["id"];
        $username = $content["global_name"] ?? $content["username"];
        //var_dump($content);

        $db = PDOUtils::getConnection();
        //$db->beginTransaction();
        $createQuery = $db->prepare("INSERT INTO userinfo(Id, AccessToken, RefreshToken, Expire) VALUES (:id, :access, :refresh, NULL) ON DUPLICATE KEY UPDATE AccessToken = :access, RefreshToken = :refresh");
        $createQuery->bindParam(":id", $id);
        $createQuery->bindParam(":access", $token["access_token"]);

        //$expire = time() + $token["expires_in"];
        //$createQuery->bindParam(":duration", $token["expires_in"]);
        $createQuery->bindParam(":refresh", $token["refresh_token"]);
        try
        {
            if(!$createQuery->execute())
                return false;
            //$db->commit();
            return [
                "id" => $id,
                "username" => $username,
            ];
        } catch (\PDOException $e)
        {
            return false;
        }
    }

    public static function execFullOAuthFlow(string $code, string $redirect = null): array | false
    {
        //First exchange the token, return false if exchange fails
        $token = OAuthUtils::exchangeToken($code, $redirect);
        //var_dump($token);
        if(!$token)
            return false;

        //Create or update the user
        $create = OAuthUtils::createOrUpdateUser($token);
        //var_dump($create);
        if($create === false)
            return false;

        $jwt = JWTUtils::encode([
            "id" => $create["id"],
            "username" => $create["username"],
        ], time() + 36000);
        return [
            "auth" => $jwt,
            "username" => $create["username"],
        ];
    }
}
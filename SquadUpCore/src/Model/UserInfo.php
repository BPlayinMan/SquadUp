<?php
namespace App\Model;

use App\Exceptions\RequestFailException;
use App\Exceptions\UnknownUserException;
use PDO;
use Symfony\Component\HttpClient\HttpClient;

class UserInfo
{
    public readonly int $id;
    public readonly string $username;
    public readonly string $avatarUrl;

    public readonly string|null $profileBio;

    public function __construct(int $uid, string|null $token = null, bool $self = false)
    {
        $this->id = $uid;

        //echo $uid;

        //Prepare and bind
        $stmt = PDOUtils::getConnection()->prepare("SELECT * FROM userinfo WHERE id = :uid");
        $stmt->bindParam(":uid", $uid, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        //var_dump($result);

        //echo $result["AccessToken"];

        //Throw exception if user is not found
        if(!$result)
            throw new UnknownUserException($uid);

        //Get the token if it's not provided
        $tokFinal = $token ?? $result["AccessToken"];

        //Get the user data
        $this->profileBio = $result["ProfileBio"];

        //Create the HTTP client for connection
        $client = HttpClient::create([
            "auth_bearer" => $tokFinal,
        ]);

        //Get the user data
        $target = $self ? "@me" : $uid;
        $result = $client->request("GET", "https://discord.com/api/v10/users/@me");

        //Throw exception if request fails
        if($result->getStatusCode() != 200)
            throw new RequestFailException($result);

        $data = json_decode($result->getContent(), true);

        $this->username = $data["global_name"] ?? $data["username"];

        if($data["avatar"] != null)
            $this->avatarUrl = "https://cdn.discordapp.com/avatars/$uid/" . $data["avatar"] . ".png";
        else
            $this->avatarUrl = "https://cdn.discordapp.com/embed/avatars/" . ($uid % 5) . ".png";
    }

    public function getScaledAvatar(int $size = 128): string
    {
        return $this->avatarUrl . "?size=$size";
    }
}
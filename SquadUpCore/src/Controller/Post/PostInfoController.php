<?php
namespace App\Controller\Post;

use App\Model\PDOUtils;
use App\Model\UserInfo;
use App\Util\CORSInformation;
use PDO;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class PostInfoController extends AbstractController
{
    #[Route('/api/post', name: 'post', methods: ["GET", "OPTIONS"])]
    #[CORSInformation(false, "*", "GET", "Authorization")]
    public function getAllPosts(Request $request)
    {
        $data = $this->getPostInfo($request->attributes->get("user"));
        if($data === false)
            return $this->json(["error" => "Failed to retrieve post information"], 500);
        return $this->json($data);
    }

    #[Route('/api/post/{id}', name: 'post_id', methods: ["GET", "OPTIONS"])]
    #[CORSInformation(false, "*", "GET", "Authorization")]
    public function getPost(int $id, Request $request)
    {
        $data = $this->getPostInfo($request->attributes->get("user"), $id);
        if(!$data)
            return $this->json(["error" => "Failed to retrieve post information"], 500);
        return $this->json($data);
    }

    public static function getPostInfo(UserInfo $forUser, int $postId = 0): array|false
    {
        $db = PDOUtils::getConnection();

        //Prepare statement based on post id
        $stmt = $db->prepare($postId == 0
            ? "SELECT * FROM post"
            : "SELECT * FROM post WHERE Id = :id"
        );

        if(!$stmt)
            return false;

        // Bind post id if it is not 0
        if($postId != 0)
            $stmt->bindParam(":id", $postId, PDO::PARAM_INT);

        //Return false if statement execution fails
        if(!$stmt->execute())
            return [];

        //Fetch all results
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(!$res || count($res) == 0)
            return [];

        //Map post information to a more readable format
        $mappedPosts = array_map(function($post) use ($db, $forUser) {
            return PostInfoController::getAdvancedPostInfo($db, $post, $forUser);
        }, $res);

        if(!$mappedPosts)
            return false;

        //Return all posts only if no id was specified
        if($postId == 0)
            return $mappedPosts;
        return $mappedPosts[0];
    }

    private static function getAdvancedPostInfo(PDO $db, array $post, UserInfo $forUser): array|false
    {
        $id = $post["Id"];

        //Prepare statement to retrieve post flags
        $flagStmt = $db->prepare("SELECT * FROM flag INNER JOIN postflag p ON flag.Id = p.FlagId WHERE p.PostId = :id");
        if(!$flagStmt)
            return false;

        $flagStmt->bindParam(":id", $id, PDO::PARAM_INT);
        if(!$flagStmt->execute())
            return false;

        $flags = $flagStmt->fetchAll(PDO::FETCH_ASSOC);
        if(!$flags)
            $flags = [];

        $mappedFlags = array_map(function($flag) {
            return [
                "id" => $flag["Id"],
                "name" => $flag["Title"],
                "desc" => $flag["Description"],
            ];
        }, $flags);

        $interestStmt = $db->prepare("SELECT Interest, COUNT(*) AS Count FROM postinterest WHERE PostId = :id GROUP BY Interest");
        if(!$interestStmt)
            return false;

        $interestStmt->bindParam(":id", $id, PDO::PARAM_INT);
        if(!$interestStmt->execute())
            return false;

        $interests = $interestStmt->fetchAll(PDO::FETCH_KEY_PAIR);
        if(!$interests)
            $interests = [];

        $ownInterestStmt = $db->prepare("SELECT Interest FROM postinterest WHERE PostId = :id AND UserId = :user");
        if(!$ownInterestStmt)
            return false;

        $ownInterestStmt->bindParam(":id", $id, PDO::PARAM_INT);
        $ownInterestStmt->bindParam(":user", $post["OwnerId"], PDO::PARAM_INT);
        if(!$ownInterestStmt->execute())
            return false;

        $ownInterest = $ownInterestStmt->fetch(PDO::FETCH_ASSOC);
        if(!$ownInterest)
            $ownInterest = ["Interest" => "None"];

        $mappedInterest = [
            "maybe" => $interests["Maybe"] ?? 0,
            "accept" => $interests["Accept"] ?? 0,
            "own" => $ownInterest["Interest"]
        ];

        $activityStmt = $db->prepare("
            SELECT a.Id, g.Id AS GameId, g.Title AS GameName, a.ActDesc, a.ActType, a.MaxPlayers FROM gameactivity a
                INNER JOIN squadup.game g on a.GameId = g.Id
                WHERE a.Id = :id;
        ");
        if(!$activityStmt)
            return false;

        $activityStmt->bindParam(":id", $post["Activity"], PDO::PARAM_INT);
        if(!$activityStmt->execute())
            return false;

        $activity = $activityStmt->fetch(PDO::FETCH_ASSOC);
        if(!$activity)
            return false;

        return [
            "id" => $id,
            "owner" => "" . $post["OwnerId"],
            "activity" => [
                "id" => $activity["Id"],
                "gameId" => $activity["GameId"],
                "gameName" => $activity["GameName"],
                "desc" => $activity["ActDesc"],
                "type" => $activity["ActType"],
                "details" => $post["ActivityDetails"],
                "maxPlayers" => $activity["MaxPlayers"],
            ],
            "details" => $post["PostDetails"],
            "lang" => $post["PreferredLanguage"],
            "open" => $post["Open"],
            "creationDate" => $post["CreationDate"],
            "flags" => $mappedFlags,
            "interests" => $mappedInterest,
        ];
    }
}
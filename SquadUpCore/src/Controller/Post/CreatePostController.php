<?php
namespace App\Controller\Post;

use App\Model\PDOUtils;
use App\Util\CORSInformation;
use PDO;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class CreatePostController extends AbstractController
{
    #[Route('/api/post/create', name: 'create_post', methods: ['POST', "OPTIONS"])]
    #[CORSInformation(false, "*", "POST", "Authorization")]
    public function create(Request $request)
    {
        $db = PDOUtils::getConnection();
        if(!$db)
            return $this->json(["error" => "Could not connect to the database"], 500);

        //Begin transaction for post insertion
        $db->beginTransaction();

        $stmt = $db->prepare("
            INSERT INTO post(OwnerId, Activity, ActivityDetails, PostDetails, PreferredLanguage, Open, CreationDate)
            VALUES(:owner, :act, :actDetails, :details, :lang, true, NOW())
        ");
        if(!$stmt)
        {
            $db->rollBack();
            return $this->json(["error" => "Failed to prepare statement"], 500);
        }

        //Retrieve request JSON
        $data = json_decode($request->getContent(), true);
        if(!$stmt->execute([
            ":owner" => $request->attributes->get("user")->id,
            ":act" => $data["activity"],
            ":actDetails" => $data["activityDetails"],
            ":details" => $data["postDetails"],
            ":lang" => $data["lang"]
        ]))
        {
            $db->rollBack();
            return $this->json(["error" => "Failed to execute statement"], 500);
        }
        $id = $db->lastInsertId("post");

        $flagStmt = $db->prepare("INSERT INTO postflag(PostId, FlagId) VALUES (:post, :flag)");
        if(!$flagStmt)
        {
            $db->rollBack();
            return $this->json(["error" => "Failed to prepare statement"], 500);
        }
        $flagStmt->bindParam(":post", $id, PDO::PARAM_INT);

        foreach ($data["flags"] as $flag)
        {
            $flagStmt->bindParam(":flag", $flag, PDO::PARAM_INT);
            if(!$flagStmt->execute())
            {
                $db->rollBack();
                return $this->json(["error" => "Failed to execute statement"], 500);
            }
        }

        $interestStmt = $db->prepare("INSERT INTO postinterest(UserId, PostId, Interest) VALUES(:user, :post, 'Accept')");
        if(!$interestStmt)
        {
            $db->rollBack();
            return $this->json(["error" => "Failed to prepare statement"], 500);
        }

        if(!$interestStmt->execute([
            ":user" => $request->attributes->get("user")->id,
            ":post" => $id
        ]))
        {
            $db->rollBack();
            return $this->json(["error" => "Failed to execute statement"], 500);
        }

        //Commit after insertion
        $db->commit();

        return $this->json(["id" => $id]);
    }
}
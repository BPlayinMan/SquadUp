<?php
namespace App\Controller\Post;

use App\Model\PDOUtils;
use App\Model\UserInfo;
use App\Util\CORSInformation;
use PDO;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\HttpOptions;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class StartPostController extends AbstractController
{
    #[Route('/api/post/start/{id}', name: 'start_post', methods: ['POST', "OPTIONS"])]
    #[CORSInformation(false, "*", "POST", "Authorization")]
    public function startActivity(int $id, Request $request)
    {
        /** @var UserInfo $user */
        $user = $request->attributes->get("user");

        $db = PDOUtils::getConnection();
        if(!$db)
            return new Response("Could not connect to the database", 500);

        $stmt = $db->prepare("UPDATE post SET Open = 0 WHERE Id = :id");
        if(!$stmt)
            return new Response("Failed to prepare statement", 500);
        if(!$stmt->execute([":id" => $id]))
            return new Response("Failed to close post", 500);

        //Get post info for this post
        $post = PostInfoController::getPostInfo($user, $id);
        if(!$post)
            return new Response("Failed to retrieve post information", 500);

        $participantsStmt = $db->prepare("SELECT UserId FROM postinterest WHERE PostId = :id AND Interest != 'None' AND UserId != :user");
        if(!$participantsStmt)
            return new Response("Failed to prepare statement", 500);

        if(!$participantsStmt->execute([":id" => $id, ":user" => $user->id]))
            return new Response("Failed to execute statement", 500);

        $participantsId = $participantsStmt->fetchAll(PDO::FETCH_COLUMN);

        $db->beginTransaction();
        $notificationStmt = $db->prepare("INSERT INTO notification(Target, Sender, Scope, Content) VALUES (:target, :sender, 'Post', :content)");
        if(!$notificationStmt)
            return new Response("Failed to prepare statement", 500);

        $data = json_encode([
            "post" => $id,
            "activity" => $post["activity"],
            "user" => "" . $user->id
        ]);

        foreach ($participantsId as $participant)
        {
            $notificationStmt->bindParam(":target", $participant, PDO::PARAM_INT);
            $notificationStmt->bindParam(":sender", $post["owner"], PDO::PARAM_INT);
            $notificationStmt->bindParam(":content", $data, PDO::PARAM_STR);

            if(!$notificationStmt->execute())
            {
                $db->rollBack();
                return new Response("Failed to execute statement", 500);
            }
        }

        $db->commit();

        return new Response();
    }
}
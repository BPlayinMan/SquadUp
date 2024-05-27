<?php
namespace App\Controller\Post;

use App\Model\PDOUtils;
use App\Model\UserInfo;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PostInterestController extends AbstractController
{
    #[Route('/api/post/interest', name: 'post_interest', methods: ["POST", "OPTIONS"])]
    #[CORSInformation(false, "*", "POST", "*")]
    public function declareInterest(Request $request): Response
    {
        /** @var UserInfo $user */
        $user = $request->attributes->get("user");

        $data = json_decode($request->getContent(), true);
        if(!isset($data["postId"]) || !isset($data["interest"]))
            return $this->json(["error" => "Invalid request"], 400);

        $db = PDOUtils::getConnection();
        if(!$db)
            return $this->json([
                "result" => "error",
                "error" => "Could not connect to the database"
            ], 200);

        $stmt = $db->prepare("
            INSERT INTO postinterest(UserId, PostId, Interest) VALUES(:user, :post, :interest)
            ON DUPLICATE KEY UPDATE Interest = :interest
        ");
        if(!$stmt)
            return $this->json([
                "result" => "error",
                "error" => "Failed to prepare statement"
            ], 200);

        if(!$stmt->execute([
            ":user" => $user->id,
            ":post" => $data["postId"],
            ":interest" => $data["interest"]
        ]))
            return $this->json([
                "result" => "error",
                "error" => "Failed to execute statement"
            ], 200);

        //Return the interest
        return $this->json([
            "result" => "success",
            "interest" => $data["interest"]
        ]);
    }
}
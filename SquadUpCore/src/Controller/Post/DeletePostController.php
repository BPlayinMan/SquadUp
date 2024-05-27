<?php
namespace App\Controller\Post;

use App\Model\PDOUtils;
use App\Model\UserInfo;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DeletePostController extends AbstractController
{
    #[Route("/api/post/delete/{post}", name: "delete_post", methods: ["POST", "OPTIONS"])]
    #[CORSInformation(false, "*", "POST", "Authorization")]
    public function deletePost(int $post, Request $request)
    {
        /** @var UserInfo $user */
        $user = $request->attributes->get("user");

        $db = PDOUtils::getConnection();
        if(!$db)
            return new Response("Could not connect to the database", 500);

        $stmt = $db->prepare("DELETE FROM post WHERE Id = :id AND OwnerId = :owner");
        if(!$stmt)
            return new Response("Failed to prepare statement", 500);

        if(!$stmt->execute([":id" => $post, ":owner" => $user->id]))
            return new Response("Failed to execute statement", 500);

        return new Response();
    }
}
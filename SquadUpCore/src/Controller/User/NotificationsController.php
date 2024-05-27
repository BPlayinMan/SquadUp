<?php
namespace App\Controller\User;

use App\Model\PDOUtils;
use App\Model\UserInfo;
use App\Util\CORSInformation;
use PDO;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class NotificationsController extends AbstractController
{
    #[Route('/api/notifications', name: 'get_notifications', methods: ['GET', "OPTIONS"])]
    #[CORSInformation(false, "*", "GET", "Authorization")]
    public function getNotifications(Request $req)
    {
        /** @var UserInfo $user */
        $user = $req->attributes->get("user");

        $db = PDOUtils::getConnection();
        if(!$db)
            return new Response("Could not connect to the database", 500);

        $stmt = $db->prepare("SELECT * FROM notification WHERE Target = :target");
        if(!$stmt)
            return new Response("Failed to prepare statement", 500);

        if(!$stmt->execute([":target" => $user->id]))
            return new Response("Failed to execute statement", 500);

        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if(!$notifications)
            $notifications = [];

        $mapped = [];
        foreach ($notifications as $notification)
        {
            $mapped[] = [
                "id" => $notification["Id"],
                "target" => $notification["Target"],
                "sender" => $notification["Sender"],
                "scope" => $notification["Scope"],
                "content" => json_decode($notification["Content"], true)
            ];
        }

        return $this->json($mapped);
    }
}
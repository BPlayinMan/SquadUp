<?php
namespace App\Controller\Data;

use App\Model\PDOUtils;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ActivityDataController extends AbstractController
{
    #[Route("/api/data/activity/{game}", methods: ["GET", "OPTIONS"])]
    #[CORSInformation(false, "*", "GET", "Authorization")]
    public function get(int $game, Request $request)
    {
        $db = PDOUtils::getConnection();
        if(!$db)
            return $this->json(["error" => "Could not connect to the database"], 500);

        $stmt = $db->prepare("SELECT * FROM gameactivity WHERE GameId = :game");
        if(!$stmt)
            return $this->json(["error" => "Failed to prepare statement"], 500);

        $stmt->execute([":game" => $game]);
        $res = $stmt->fetchAll();

        $data = [];
        foreach ($res as $row)
        {
            $data[] = [
                "id" => $row["Id"],
                "name" => $row["ActType"],
                "desc" => $row["ActDesc"],
                "max" => $row["MaxPlayers"],
            ];
        }

        return $this->json($data);
    }
}
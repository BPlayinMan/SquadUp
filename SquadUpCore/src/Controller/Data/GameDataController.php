<?php
namespace App\Controller\Data;

use App\Model\PDOUtils;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class GameDataController extends AbstractController
{
    #[Route("/api/data/game", name: "api_data_game", methods: ["OPTIONS", "GET"])]
    #[CORSInformation(false, "*", "GET", "Authorization")]
    public function get(Request $request)
    {
        $db = PDOUtils::getConnection();
        if(!$db)
            return $this->json(["error" => "Could not connect to the database"], 500);

        $stmt = $db->prepare("SELECT * FROM game");
        if(!$stmt)
            return $this->json(["error" => "Failed to prepare statement"], 500);

        $stmt->execute();
        $res = $stmt->fetchAll();

        $data = [];
        foreach ($res as $row)
        {
            $data[] = [
                "id" => $row["Id"],
                "name" => $row["Title"],
                "desc" => $row["Description"],
                "web" => $row["Website"],
            ];
        }

        return $this->json($data);
    }
}
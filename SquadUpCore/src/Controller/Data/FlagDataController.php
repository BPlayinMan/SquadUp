<?php
namespace App\Controller\Data;

use App\Model\PDOUtils;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class FlagDataController extends AbstractController
{
    #[Route("/api/data/flags", methods: ["GET", "OPTIONS"])]
    #[CORSInformation(false, "*", "GET", "Authorization")]
    public function get(Request $request)
    {
        $db = PDOUtils::getConnection();
        if(!$db)
            return $this->json(["error" => "Could not connect to the database"], 500);

        $stmt = $db->prepare("SELECT * FROM flag ORDER BY Id");
        if(!$stmt)
            return $this->json(["error" => "Failed to prepare statement"], 500);

        $stmt->execute();
        $res = $stmt->fetchAll();

        $flags = [];
        foreach ($res as $row)
        {
            $flags[] = [
                "id" => $row["Id"],
                "name" => $row["Title"],
                "desc" => $row["Description"],
            ];
        }

        return $this->json($flags);
    }
}
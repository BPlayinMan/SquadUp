<?php
namespace App\Controller\Data;

use App\Model\PDOUtils;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class LangsDataController extends AbstractController
{
    #[Route("/api/data/langs", methods: ["GET", "OPTIONS"])]
    #[CORSInformation(false, "*", "GET", "Authorization")]
    public function get(Request $request)
    {
        $db = PDOUtils::getConnection();
        if(!$db)
            return $this->json(["error" => "Could not connect to the database"], 500);

        $stmt = $db->prepare("SELECT * FROM language");
        if(!$stmt)
            return $this->json(["error" => "Failed to prepare statement"], 500);

        $stmt->execute();
        $res = $stmt->fetchAll();

        $langs = [];
        foreach ($res as $row)
        {
            $langs[] = [
                "code" => $row["LangCode"],
                "name" => $row["LangName"],
            ];
        }

        return $this->json($langs);
    }
}
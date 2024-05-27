<?php
namespace App\Controller\User;

use App\Exceptions\RequestFailException;
use App\Exceptions\UnknownUserException;
use App\Model\UserInfo;
use App\Util\CORSInformation;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class UserDataController extends AbstractController
{
    #[Route("/api/user", name: "user_data_self", methods: ["GET", "OPTIONS"])]
    #[CORSInformation(true)]
    public function getOwnData(Request $request)
    {
        $info = $request->attributes->get("user");
        return CORSInformation::appendCORS(new JsonResponse([
            "id" => $info->id,
            "name" => $info->username,
            "avatar" => $info->getScaledAvatar(256),
            "bio" => $info->profileBio
        ]), true);
    }

    #[Route("/api/user/{id}", name: "user_data", methods: ["GET", "OPTIONS"])]
    #[CORSInformation(true)]
    public function getUserData(int $id, Request $request)
    {
        try {
            $info = new UserInfo($id, null, false);
            return CORSInformation::appendCORS(new JsonResponse([
                "id" => $info->id,
                "name" => $info->username,
                "avatar" => $info->getScaledAvatar(256),
                "bio" => $info->profileBio
            ]), true);
        } catch (RequestFailException $e)
        {
            return CORSInformation::appendCORS(new Response(status: 401));
        } catch (UnknownUserException $e)
        {
            return CORSInformation::appendCORS(new Response(status: 404));
        }
    }
}
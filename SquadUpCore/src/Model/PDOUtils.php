<?php
namespace App\Model;

use PDO;
use PDOException;

class PDOUtils
{
    public static function getConnection(): false | PDO
    {
        $type = $_ENV['DB_TYPE'] ?? "mysql";    //Get DB type, default to MySQL
        $host = $_ENV['DB_HOST'] ?? "localhost";    //Get DB host, default to localhost
        $name = $_ENV['DB_NAME'];    //Get DB name
        $user = $_ENV['DB_USER'];    //Get DB user
        $pass = $_ENV['DB_PASS'];    //Get DB password

        //Return false if connection fails
        try
        {
            $conn = new PDO("$type:host=$host;dbname=$name", $user, $pass);    //Create connection
            $conn->setAttribute(PDO::ERRMODE_EXCEPTION, true);    //Set error mode to exception
            return $conn;
        } catch (PDOException $e)
        {
            //echo "COCK";
            return false;
        }
    }
}
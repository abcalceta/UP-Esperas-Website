<?php

session_start();

function parsePostCommand($reqPath) {
    $arrayResp = array(
        "response" => 501,
        "message" => "Unrecognizable or invalid method"
    );
    $pathExp = array_filter(explode("/", trim($reqPath)));

    if(count($pathExp) == 1 && $pathExp[0] == "login") {
        if(!isset($_POST["uname"]) || !isset($_POST["pass"])) {
            $arrayResp["response"] = 400;
            $arrayResp["message"] = "No username or password sent.";
        }
        else if(isset($_SESSION["username"])) {
            $arrayResp["response"] = 200;
            $arrayResp["message"] = "A user is already logged in";
        }
        else {
            // For data testing only
            // Replace with script with MySQL access
            if($_POST["uname"] == "dizon_cc" && $_POST["pass"] == "porkchop123") {
                $arrayResp["response"] = 200;
                $arrayResp["message"] = "Access granted";

                $_SESSION["username"] = "dizon_cc";
            }
            else {
                $arrayResp["response"] = 403;
                $arrayResp["message"] = "Invalid username or password";
            }
        }
    }

    return $arrayResp;
}

function acceptApiCalls() {
    $cmdRes = array(
		"response" => 501,
		"message" => "Unrecognizable or invalid method"
    );

    if($_SERVER["REQUEST_METHOD"] == "GET") {
		$cmdRes = parseGetCommand($_GET["req"]);
	}
	else if($_SERVER["REQUEST_METHOD"] == "POST") {
		$cmdRes = parsePostCommand($_GET["req"]);
	}

	header("Content-Type: application/json");
	http_response_code($cmdRes["response"]);
	unset($cmdRes["response"]);
	echo json_encode($cmdRes, JSON_PRETTY_PRINT);
}

acceptApiCalls();

?>
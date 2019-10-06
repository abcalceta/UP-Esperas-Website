<?php
session_start();

require_once 'vendor/autoload.php';

$loader = new \Twig\Loader\FileSystemLoader("templates/");
$twig = new \Twig\Environment($loader);

if(!isset($_SESSION['username'])) {
    header("Location: login.php?fwdlnk=index.php");
}
else {
    echo $twig->render("index.twig");
}

?>
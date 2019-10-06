<?php
session_start();

require_once 'vendor/autoload.php';

$loader = new \Twig\Loader\FileSystemLoader("templates/");
$twig = new \Twig\Environment($loader);

if(isset($_SESSION['username'])) {
    header("Location: index.php");
    die();
}

if(isset($_GET['fwdlnk'])) {
    echo $twig->render("login.twig", [
        'has_fwd_link' => true,
        'fwd_url' => $_GET['fwdlnk']
    ]);
}
else{
    echo $twig->render("login.twig");
}

?>
<?php
require_once 'vendor/autoload.php';

$loader = new \Twig\Loader\FileSystemLoader("templates/");
$twig = new \Twig\Environment($loader);

/*
if(isset($_GET['fwdlnk'])) {
    echo $twig->render("index.twig", [
        'has_fwd_link' => true,
        'fwd_url' => $_GET['fwdlnk']
    ]);
}
else{
    echo $twig->render("index.twig");
}*/
echo $twig->render("profile.twig");

?>
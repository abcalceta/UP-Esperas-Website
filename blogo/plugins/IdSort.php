<?php
class IdSort extends AbstractPicoPlugin
{
    public function onTwigRegistration()
    {
        $twig = $this->getPico()->getTwig();
        $twig->addFilter(new \Twig\TwigFilter('sort_by_last_id', array($this, 'sortByLastId')));
    }

    public function sortByLastId($pages)
    {
        usort($pages, function($a, $b) {
            $aExploded = explode('/', $a['id']);
            $bExploded = explode('/', $b['id']);

            $aLast = end($aExploded);
            $bLast = end($bExploded);

            return $aLast < $bLast ? 1 : -1;
        });

        return $pages;
    }
}
?>
<?php
/**
 * @author Carl
 * @license http://opensource.org/licenses/MIT
 */
class Rss extends AbstractPicoPlugin {
    public function onMetaHeaders(&$headers) {
        $headers['generate_rss'] = 'GenerateRss';
        $headers['rss_type'] = 'RssType';
    }

    public function onMetaParsed(&$meta) {
        $this->has_rss = $meta['generate_rss'];
        $this->rss_type = $meta['rss_type'];
    }

    public function onRequestUrl(&$url) {
        if(isset($this->has_rss) && $this->has_rss === TRUE) {
            $url .= '.xml';
        }
	}

    public function onPageRendering(&$templateName, array &$twigVariables) {
        if(isset($this->has_rss) && $this->has_rss === TRUE) {
            $template_url = 'rss_article.twig';

            if(isset($this->rss_type)) {
                if($this->rss_type === "Audio") {
                    $template_url = 'rss_audio.twig';
                }
            }

            $pluginDirUrl = __DIR__;
            
            //header($_SERVER['SERVER_PROTOCOL'].' 200 OK'); // Override 404 header
            header("Content-Type: application/rss+xml; charset=UTF-8");
            header("Content-Disposition: attachment; filename=\"rss.xml\"");
            
			$loader = new Twig_Loader_Filesystem($pluginDirUrl);
            $twig_rss = new Twig_Environment($loader, $twigVariables['config']['twig_config']);
            $folder_dirname = dirname($this->getRequestUrl());

            $newPages = array();
            
            foreach($twigVariables['pages'] as $eachPage) {
                if(strpos($eachPage['id'], $folder_dirname) === 0 && strcasecmp(basename($eachPage['id']), "index") != 0) {
                    array_push($newPages, $eachPage);
                }
            }

            $twigVariables['pages'] = $newPages;

            echo $twig_rss->render($template_url, $twigVariables); // Render rss.html
            
			exit; // Don't continue to render template
        }
    }
}
?>
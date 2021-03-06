<?php
/**
 * Tags plugin for Pico CMS (@see https://github.com/picocms/Pico)
 *
 * Using this plugin, you can use the "Tags" and "Filter" headers in the page meta block
 * in order to modify the "pages" array for certain pages. This creates the possibility
 * to feature index pages which show only posts of a certain type.
 *
 * The "Tags" header accepts a comma-separated list of tags that apply to the current page.
 *
 * The "Filter" header also accepts a comma-separated list of tags, but instead specifies
 * which pages end up in the "pages" array. A page with no "Filter" header will have an
 * unfiltered list of pages, whereas a page that specifies the header "Filter: foo, bar"
 * will receive in its "pages" array only pages having at least one of those two tags.
 *
 * @author Pontus Horn
 * @link https://pontushorn.me
 * @repository https://github.com/PontusHorn/Pico-Tags
 * @license http://opensource.org/licenses/MIT
 */
class PicoTags extends AbstractPicoPlugin
{
    /**
     * All tags used in all pages.
     */
    protected $allTags = [];
    
    /**
     * Register the "Tags" and "Filter" meta header fields.
     *
     * @see    Pico::getMetaHeaders()
     * @param  array<string> &$headers list of known meta header fields
     * @return void
     */
    public function onMetaHeaders(&$headers)
    {
        $headers['tags'] = 'Tags';
        $headers['filter'] = 'Filter';
    }
    /**
     * Parse the current page's tags and/or filters into arrays.
     *
     * @see    Pico::getFileMeta()
     * @param  array &$meta parsed meta data
     * @return void
     */
    public function onMetaParsed(&$meta)
    {
        $meta['tags'] = PicoTags::parseTags($meta['tags']);
        $meta['filter'] = PicoTags::parseTags($meta['filter']);
    }
    /**
     * If the current page has a filter on tags, filter out the $pages array to
     * only contain pages having any of those tags.
     *
     * @see    Pico::getPages()
     * @see    Pico::getCurrentPage()
     * @see    Pico::getPreviousPage()
     * @see    Pico::getNextPage()
     * @param  array &$pages        data of all known pages
     * @param  array &$currentPage  data of the page being served
     * @param  array &$previousPage data of the previous page
     * @param  array &$nextPage     data of the next page
     * @return void
     */
    public function onPagesLoaded(&$pages, &$currentPage, &$previousPage, &$nextPage)
    {
        foreach ($pages as $page) {
            $tags = PicoTags::parseTags($page['meta']['tags']);
            if ($page && !empty($tags)) {
                $this->allTags = array_merge($this->allTags, $tags);
            }
        }

        $this->allTags = array_unique($this->allTags);
    }

    public function applyTagFilter($pages)
    {
        $currentPage = $this->getPico()->getCurrentPage();
        if ($currentPage && !empty($currentPage['meta']['filter'])) {
            $tagsToShow = $currentPage['meta']['filter'];
            $pages = array_filter($pages, function ($page) use ($tagsToShow) {
                $tags = PicoTags::parseTags($page['meta']['tags']);
                return count(array_intersect($tagsToShow, $tags)) > 0;
            });
        }

        return $pages;
    }

    public function onTwigRegistration()
    {
        $twig = $this->getPico()->getTwig();
        $twig->addFunction(new Twig_SimpleFunction('get_all_tags', array($this, 'getAllTags')));
        $twig->addFilter(new \Twig\TwigFilter('apply_tag_filter', array($this, 'applyTagFilter')));
    }

    public function getAllTags()
    {
        return $this->allTags;
    }
    
    /**
     * Get array of tags from metadata string.
     *
     * @param $tags
     * @return array
     */
    private static function parseTags($tags)
    {
        if (is_array($tags)) {
            return $tags;
        }

        if (!is_string($tags) || mb_strlen($tags) <= 0) {
            return array();
        }

        $tags = explode(',', $tags);

        return is_array($tags) ? array_map('trim', $tags) : array();
    }

    // Parsing for tags page
    public function onRequestUrl(&$url) {
        if(preg_match("/^tag?\/(.*)/", $url, $m)) {
            $this->tagForTagsPage = strtolower(urldecode($m[1]));
            $this->tagForTagsPage = str_replace("_", " ", $this->tagForTagsPage);

            $url = 'tag/';
        }
    }

    public function onPageRendering(&$twigEnv, &$twigVars) {
        $pageWithTags = array();

        // Detect tag url
        if($twigVars['current_page']['id'] == "tag/index") {
            if(!isset($this->tagForTagsPage) || empty($this->tagForTagsPage)) {
                // Set tag for tags page as blank
                $this->tagForTagsPage = "";
            }

            // Loop through tags on each page
            foreach($twigVars['pages'] as $page) {
                $pageTags = PicoTags::parseTags($page['meta']['tags']);

                if(in_array($this->tagForTagsPage, $pageTags)) {
                    $pageWithTags[] = array(
                        "id" => $page['id'],
                        "url" => $page['url'],
                        "title" => $page['title'],
                        "date" => $page['date'],
                        "thumb_url" => $page['meta']['thumburl']
                    );
                }
            }

            $twigVars['meta']['pages_with_tag'] = $pageWithTags;
            $twigVars['meta']['title'] = $this->tagForTagsPage." tag";
            $twigVars['meta']['tags'] = $this->tagForTagsPage;
        }
    }
}

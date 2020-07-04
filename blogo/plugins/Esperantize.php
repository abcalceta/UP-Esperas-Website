<?php
/**
 * @author Carl
 * @license http://opensource.org/licenses/MIT
 */
class Esperantize extends AbstractPicoPlugin
{
    const NON_HATTED_STRS = "cghjsuCGHJSU";
    const HATTED_STRS = "ĉĝĥĵŝŭĈĜĤĴŜŬ";

    public function onTwigRegistration()
    {
        $twig = $this->getPico()->getTwig();
        $twig->addFilter(new \Twig\TwigFilter('sistemo_to_hats', array($this, 'fromSistemo')));
    }

    public function fromSistemo($hString, $altGrKey = 'h') {
        if(!is_string($hString)) {
            return $hString;
        }

        $newString = "";

        // Loop through each character
        $splittedStr = str_split($hString);
        $savedHattedCharKey = -1;

        foreach($splittedStr as $eachChar) {
            if($savedHattedCharKey >= 0) {
                if(strtolower($eachChar) == strtolower($altGrKey)) {
                    $newString .= mb_substr(self::HATTED_STRS, $savedHattedCharKey, 1);
                }
                else {
                    $newString .= self::NON_HATTED_STRS[$savedHattedCharKey] . $eachChar;
                }

                $savedHattedCharKey = -1;
            }
            else if(strpos(self::NON_HATTED_STRS, $eachChar) !== FALSE) {
                $savedHattedCharKey = strpos(self::NON_HATTED_STRS, $eachChar);
            }
            else {
                $newString .= $eachChar;
            }
        }

        if($savedHattedCharKey >= 0) {
            $newString .= self::NON_HATTED_STRS[$savedHattedCharKey];
        }

        return $newString;
    }
}

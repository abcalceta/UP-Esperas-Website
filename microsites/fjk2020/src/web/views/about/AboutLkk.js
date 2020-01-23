import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/about_lkk.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class AboutLkkPage extends BasePage {
    constructor() {
        super(
            'en',
            'aboutLkk',
            htmlMain,
            'about/AboutLkk',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        DomScripts.animate("#section-lkk .responsive-img", "fadeInLeft");
        DomScripts.animate("#section-lkk h5", "fadeInRight", true);
    }
}
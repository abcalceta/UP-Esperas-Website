import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/about_fjk.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class AboutFjkPage extends BasePage {
    constructor() {
        super(
            'en',
            'aboutFjk',
            htmlMain,
            'about/AboutFjk',
            heroPath
        );
    }
}
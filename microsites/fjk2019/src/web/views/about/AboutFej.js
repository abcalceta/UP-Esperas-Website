import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/about_fej.html';
import heroPath from '../../img/hero/fej_event_banner.jpg';
import '../../styles/default.css';

export class AboutFejPage extends BasePage {
    constructor() {
        super(
            'en',
            'aboutFej',
            htmlMain,
            'about/AboutFej',
            heroPath
        );
    }
}
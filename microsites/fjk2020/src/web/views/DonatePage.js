import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/donate.html';
import heroPath from '../img/hero/eo_flags_banner.jpg';
import '../styles/default.css';

export class DonatePage extends BasePage {
    constructor() {
        super(
            'en',
            'donate',
            htmlMain,
            'DonatePage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        DomScripts.animate("#section-donation-options .card", "zoomIn");
    }
}
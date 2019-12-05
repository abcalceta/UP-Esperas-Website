import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/main.html';
import heroPath from '../img/hero/banderitas_home_banner.jpg';
import '../styles/default.css';

export class IndexPage extends BasePage {
    constructor() {
        super(
            'en',
            'index',
            htmlMain,
            'IndexPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        DomScripts.animate('#section-how-to-help .card', 'zoomIn', true);
    }
}
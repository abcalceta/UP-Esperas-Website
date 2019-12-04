import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import heroPath from '../img/hero/banderitas_home_banner.jpg';
import '../styles/default.css';

export class IndexPage extends BasePage {
    constructor() {
        super(
            'Home',
            'index',
            '../templates/main.html',
            '../i18n/en/IndexPage.json',
            heroPath
        );
    }

    oncreate() {
        DomScripts.animate('#section-how-to-help .card', 'zoomIn', true);
        super.oncreate();
    }
}
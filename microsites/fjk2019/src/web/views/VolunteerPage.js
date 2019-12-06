import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/volunteer.html';
import heroPath from '../img/hero/banderitas_volcorp_banner.jpg';
import '../styles/default.css';

export class VolunteerPage extends BasePage {
    constructor() {
        super(
            'en',
            'volunteer',
            htmlMain,
            'VolunteerPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        DomScripts.animate("#section-intro .responsive-img", "zoomIn");
        DomScripts.animate(".animate-row-img .col", "zoomIn");
    }
}
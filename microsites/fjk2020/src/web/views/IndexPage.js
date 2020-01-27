import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/main.html';
import heroPath from '../img/hero/banderitas_home_banner.jpg';
import announceImgEn from '../img/hero/fjk_tejo_en.jpg';
import announceImgEo from '../img/hero/fjk_tejo_eo.jpg';

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

        const announceImg = document.getElementById('img-announce');

        if(this.data.locale.lang == 'eo') {
            announceImg.src = announceImgEo;
        }
        else {
            announceImg.src = announceImgEn;
        }

        DomScripts.animate('#img-announce', 'zoomIn');
        DomScripts.animate('#section-how-to-help .card', 'zoomIn', true);
    }
}
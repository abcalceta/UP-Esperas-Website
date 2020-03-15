import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/covid19-advisory.html';
import heroPath from '../../img/hero/covid19_advisory.jpg';
import posterImgEn from '../../img/news/covid19_advisory_en.png';
import posterImgEo from '../../img/news/covid19_advisory_eo.png';

import '../../styles/default.css';

export class Covid19AdvisoryPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoCovid19',
            htmlMain,
            'congress_info/Covid19AdvisoryPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        const posterImg = document.getElementById('img-poster');

        if(this.data.locale.lang == 'eo') {
            posterImg.src = posterImgEo;
        }
        else {
            posterImg.src = posterImgEn;
        }

        DomScripts.animate('#img-poster', 'zoomIn');
    }
}
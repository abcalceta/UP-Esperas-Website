import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/country-city.html';
import heroPath from '../../img/hero/jeep_mono.jpg';
import '../../styles/default.css';

export class CountryCityPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoCountryCity',
            htmlMain,
            'congress_info/CountryCityPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        const dateToday = new Date();
        const localOffset = dateToday.getTimezoneOffset() / 60;
        const tzDiff = -8 - localOffset;

        let tzDiffTxt = this.localeObj.t('infoCountryCity.time.tzOffset.exact');

        if(tzDiff > 0) {
            tzDiffTxt = this.localeObj.t('infoCountryCity.time.tzOffset.early', tzDiff);
        }
        else if(tzDiff < 0) {
            tzDiffTxt = this.localeObj.t('infoCountryCity.time.tzOffset.late', tzDiff);
        }

        document.getElementById('card-ph-time').innerHTML = this.localeObj.t('infoCountryCity.time.timeCard', {
            isoTime: dateToday.toLocaleString([], {
                timeZone: 'Asia/Manila',
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }),
            tzOffsetDesc: tzDiffTxt,
        });
    }
}
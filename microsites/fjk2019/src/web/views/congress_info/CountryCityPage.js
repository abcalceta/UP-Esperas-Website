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
}
import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/lodging.html';
import heroPath from '../../img/hero/jeep_mono.jpg';
import '../../styles/default.css';

export class LodgingPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoLodging',
            htmlMain,
            'congress_info/LodgingPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();
    }
}
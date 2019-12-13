import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/excursion.html';
import heroPath from '../../img/hero/intramuros_wall.jpg';
import '../../styles/default.css';

export class ExcursionPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoExcursion',
            htmlMain,
            'congress_info/Excursion',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        DomScripts.animate('#section-how-to-help .card', 'zoomIn', true);
    }
}
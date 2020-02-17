import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/lodging.html';
import heroPath from '../../img/hero/uhotel_patio.jpg';
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

        DomScripts.animate('#div-hotel-info > div.col:first-child', 'slideInLeft', false, 0.15);
        DomScripts.animate('#div-hotel-info > div.col:nth-child(2)', 'slideInRight', false, 0.15);

        DomScripts.animate('#div-guidelines-changes div.col:first-child', 'slideInLeft');
        DomScripts.animate('#div-guidelines-changes div.col:nth-child(2)', 'slideInRight');

        M.Materialbox.init(document.querySelectorAll('.materialboxed'), {
            onOpenEnd: () => {
                // Reinstate default z-index
                //console.log(document.getElementById('#materialbox-overlay'));
                //document.getElementById('#materialbox-overlay').style.zIndex = 1000;
            },
        });
    }
}
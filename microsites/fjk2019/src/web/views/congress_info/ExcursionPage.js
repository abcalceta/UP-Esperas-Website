import m from 'mithril';
import Materialize from 'materialize-css';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/excursion.html';
import heroPath from '../../img/hero/fort_santiago.jpg';
import '../../styles/default.css';

export class ExcursionPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoExcursion',
            htmlMain,
            'congress_info/ExcursionPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();

        //Materialize.Materialbox.init(document.querySelectorAll('.materialboxed'));
        Materialize.Slider.init(document.querySelectorAll('#section-itinerary .slider'));
        Materialize.Carousel.init(document.querySelector('#section-itinerary .carousel'), {
            //fullWidth: true,
            indicators: true,
            dist: 0,
            //numVisible: 1
        });
    }
}
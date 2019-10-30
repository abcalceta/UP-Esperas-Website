import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/volunteer.html';
import heroPath from '../img/hero/banderitas_volcorp_banner.jpg';
import '../styles/default.css';

export class VolunteersPage extends BasePage {
    constructor() {
        super(
            "Call for Volunteers",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "Call for Volunteers",
                subTexts: [
                    "First Philippine Esperanto Youth Congress"
                ]
            }
        )


        this.componentHolder.main = htmlMain;
    }

    oncreate() {
        DomScripts.animate("#section-intro .responsive-img", "zoomIn");
        DomScripts.animate(".animate-row-img .col", "zoomIn");

        super.oncreate();
    }
}
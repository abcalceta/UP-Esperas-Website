import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/volunteer.html';

export class VolunteersPage extends BasePage {
    constructor() {
        super(
            "Call for Volunteers",
            {
                imgAltText: "Cover Photo",
                imgBgPath: "/img/banderitas_volcorp_banner.jpg",
                headText: "Call for Volunteers",
                subTexts: [
                    "The First Philippine Esperanto Youth Congress"
                ]
            }
        )


        this.componentHolder.main = htmlMain;
    }

    oncreate() {
        DomScripts.animate("#section-intro .responsive-img", "zoomIn");
        DomScripts.animate(".animate-row-img", "fadeInUp slow");

        super.oncreate();
    }
}
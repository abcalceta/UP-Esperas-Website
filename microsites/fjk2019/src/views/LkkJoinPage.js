import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/lkk-join.html';

export class LkkJoinPage extends BasePage {
    constructor() {
        super(
            "Call for Organizers",
            {
                imgAltText: "Cover Photo",
                imgBgPath: "/img/flag_in_backpack.jpg",
                headText: "Call for Organizers",
                subTexts: [
                    "The First Philippine Esperanto Youth Congress"
                ]
            }
        );


        this.componentHolder.main = htmlMain;
    }

    oncreate() {
        DomScripts.animate("#section-intro .responsive-img", "zoomIn");
        DomScripts.animate(".animate-row-img", "fadeInUp slow");

        super.oncreate();
    }
}
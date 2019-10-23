import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/lkk-join.html';
import heroPath from '../img/hero/flag_in_backpack.jpg';
import '../styles/default.css';

export class LkkJoinPage extends BasePage {
    constructor() {
        super(
            "Call for Organizers",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
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
        DomScripts.animate("#section-vacant .collapsible > li", "zoomIn fast")

        super.oncreate();
    }
}
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/donate.html';

export class DonatePage extends BasePage {
    constructor() {
        super(
            "Donate",
            {
                imgAltText: "Cover Photo",
                imgBgPath: "/img/hero/eo_flags_banner.jpg",
                headText: "Donations",
                subTexts: [
                    "The First Philippine Esperanto Youth Congress"
                ]
            }
        );

        this.componentHolder.main = htmlMain;
    }

    oncreate() {
        DomScripts.animate("#section-donation-options .card", "zoomIn");

        super.oncreate();
    }
}
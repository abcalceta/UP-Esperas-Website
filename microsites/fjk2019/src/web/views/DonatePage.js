import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/donate.html';
import heroPath from '../img/hero/eo_flags_banner.jpg';
import '../styles/default.css';

export class DonatePage extends BasePage {
    constructor() {
        super(
            "Donate",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "Donations",
                subTexts: [
                    "First Philippine Esperanto Youth Congress"
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
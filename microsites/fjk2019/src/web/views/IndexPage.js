import m from 'mithril';
import {DomScripts} from '../util/dom';

import {BasePage} from './BasePage';
import htmlMain from '../templates/main.html';
import heroPath from '../img/hero/banderitas_home_banner.jpg';
import '../styles/default.css';

export class IndexPage extends BasePage {
    constructor() {
        super(
            "Home",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "First Philippine Esperanto Youth Congress",
                subTexts: [
                    "April 23-26, 2020",
                    "University of the Philippines",
                    "Diliman, Quezon City",
                    "Philippines"
                ]
            }
        );

        this.componentHolder.main = htmlMain;
    }

    oncreate() {
        DomScripts.animate("#section-how-to-help .card", "zoomIn", true);
        super.oncreate();
    }
}
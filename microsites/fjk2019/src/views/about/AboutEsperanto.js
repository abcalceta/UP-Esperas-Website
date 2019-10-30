import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/about_eo.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class AboutEsperantoPage extends BasePage {
    constructor() {
        super(
            "What is Esperanto?",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "What is Esperanto?",
                subTexts: [
                    "First Philippine Esperanto Youth Congress"
                ]
            }
        );

        this.componentHolder.main = htmlMain;
    }

    oncreate() {
        super.oncreate();
    }
}
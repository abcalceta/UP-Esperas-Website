import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/about_logo.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class AboutLogoPage extends BasePage {
    constructor() {
        super(
            "Congress Emblem",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "Congress Emblem",
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
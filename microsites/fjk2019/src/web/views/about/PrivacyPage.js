import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/privacy.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class PrivacyPage extends BasePage {
    constructor() {
        super(
            "Privacy",
            {
                imgAltText: "Cover Photo",
                imgBgPath: heroPath,
                headText: "Privacy",
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
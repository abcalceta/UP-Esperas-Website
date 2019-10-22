import {BasePage} from './BasePage';
import htmlMain from '../templates/donate.html';

export class DonatePage extends BasePage {
    constructor() {
        super({
            imgAltText: "Cover Photo",
            imgBgPath: "/img/eo_flags_banner.jpg",
            headText: "Donations",
            subTexts: [
                "The First Philippine Esperanto Youth Congress"
            ]
        })

        this.componentHolder.main = htmlMain;
    }
}
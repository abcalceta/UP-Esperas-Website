import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/privacy.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class PrivacyPage extends BasePage {
    constructor() {
        super(
            'en',
            'privacy',
            htmlMain,
            'about/Privacy',
            heroPath
        );
    }
}
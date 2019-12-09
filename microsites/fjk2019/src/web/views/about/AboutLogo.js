import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/about_logo.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class AboutLogoPage extends BasePage {
    constructor() {
        super(
            'en',
            'aboutLogo',
            htmlMain,
            'about/AboutLogo',
            heroPath
        );
    }
}
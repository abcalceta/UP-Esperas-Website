import {BasePage} from '../BasePage';
import htmlMain from '../../templates/about/copyright.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
import '../../styles/default.css';

export class CopyrightPage extends BasePage {
    constructor() {
        super(
            'en',
            'copyright',
            htmlMain,
            'about/Copyright',
            heroPath
        );
    }
}
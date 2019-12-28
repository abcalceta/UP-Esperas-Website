import m from 'mithril';
import Materialize from 'materialize-css';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/register-guidelines.html';
import heroPath from '../../img/hero/register_banner.jpg';
import '../../styles/default.css';

export class RegisterGuidelinesPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoRegistration',
            htmlMain,
            'congress_info/RegisterGuidelinesPage',
            heroPath
        );
    }

    onupdate() {
        super.onupdate();
        console.log(this.localeObj)
    }
}
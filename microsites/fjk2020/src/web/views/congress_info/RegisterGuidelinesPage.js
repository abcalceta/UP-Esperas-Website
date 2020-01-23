import m from 'mithril';
import {RegFormUtils} from '../../util/RegFormUtils';

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

        const regPeriods = ['early', 'regular', 'late'];
        const regPeriodCard = document.getElementById('div-regperiod-notice');
        const regPeriodIdx = RegFormUtils.checkRegistrationPeriod();

        const regPeriodName = this.localeObj.t(`infoRegistration.generalText.${regPeriods[regPeriodIdx]}Reg`).toLowerCase();

        regPeriodCard.innerHTML = this.localeObj.t('infoRegistration.regPeriod.notice', {registerType: regPeriodName});
    }
}
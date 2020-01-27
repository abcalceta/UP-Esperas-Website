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
        const regPeriodInfo = RegFormUtils.checkRegistrationPeriod();
        const regPeriodIdx = regPeriodInfo.regPeriod;

        if(regPeriodIdx >= 4) {
            regPeriodCard.innerHTML = this.localeObj.t('infoRegistration.regPeriod.congressEnded');
            return;
        }
        else if(regPeriodIdx >= 3) {
            regPeriodCard.innerHTML = this.localeObj.t('infoRegistration.regPeriod.congressDay');
            return;
        }

        const regPeriodName = this.localeObj.t(`infoRegistration.generalText.${regPeriods[regPeriodIdx]}Reg`).toLowerCase();

        regPeriodCard.innerHTML = `${this.localeObj.t('infoRegistration.regPeriod.notice', {registerType: regPeriodName})}`;

        if(regPeriodInfo.timeLeft.days <= 7) {
            // Build time string
            let timeStr = '';

            if(regPeriodInfo.timeLeft.days > 0) {
                timeStr += this.localeObj.t('time.day', regPeriodInfo.timeLeft.days);
            }

            timeStr += `${this.localeObj.t(`time.hour`, regPeriodInfo.timeLeft.hours)} ${this.localeObj.t(`time.minute`, regPeriodInfo.timeLeft.minutes)} ${this.localeObj.t(`time.second`, regPeriodInfo.timeLeft.seconds)}`;

            // Change card color to red
            regPeriodCard.classList.remove('theme-green');
            regPeriodCard.classList.add('card-panel', 'theme-red', 'white-text');

            regPeriodCard.innerHTML += `\n<br>${this.localeObj.t('infoRegistration.regPeriod.closeDeadline', {time: timeStr})}\n`;
        }
        else if(regPeriodInfo.timeLeft.days <= 14) {
            const timeStr = this.localeObj.t('time.day', regPeriodInfo.timeLeft.days);

            // Change card color to yellow
            regPeriodCard.classList.remove('theme-green');
            regPeriodCard.classList.add('card-panel', 'theme-yellow', 'white-text');

            regPeriodCard.innerHTML += `\n<br>${this.localeObj.t('infoRegistration.regPeriod.closeDeadline', {time: timeStr})}`;
        }
    }
}
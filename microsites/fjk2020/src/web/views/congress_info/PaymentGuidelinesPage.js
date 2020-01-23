import m from 'mithril';
import {RegFormUtils} from '../../util/RegFormUtils';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/payment-guidelines.html';
import heroPath from '../../img/hero/wallet_banner.jpg';
import '../../styles/default.css';

export class PaymentGuidelinesPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoPayment',
            htmlMain,
            'congress_info/PaymentGuidelinesPage',
            heroPath
        );
    }
}
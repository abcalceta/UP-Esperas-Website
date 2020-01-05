import m from 'mithril';

import {IndexPage} from './views/IndexPage';
import {DonatePage} from './views/DonatePage';
import {NotFoundPage} from './views/NotFoundPage';

// About subpage
import {AboutEsperantoPage} from './views/about/AboutEsperanto';
import {AboutFjkPage} from './views/about/AboutFjk';
import {AboutLkkPage} from './views/about/AboutLkk';
import {AboutLogoPage} from './views/about/AboutLogo';
import {AboutFejPage} from './views/about/AboutFej';
import {PrivacyPage} from './views/about/PrivacyPage';

// Congress info subpage
import {ExcursionPage} from './views/congress_info/ExcursionPage';
import {RegisterGuidelinesPage} from './views/congress_info/RegisterGuidelinesPage';
import {PaymentGuidelinesPage} from './views/congress_info/PaymentGuidelinesPage';

// Participate subpage
import {RegisterPage} from './views/participate/RegisterPage';
import {VolunteerPage} from './views/participate/VolunteerPage';

let root = document.body;

m.route(root, '/', {
    '/': IndexPage,

    // About subpage
    '/about/esperanto': AboutEsperantoPage,
    '/about/fjk': AboutFjkPage,
    '/about/lkk': AboutLkkPage,
    '/about/logo': AboutLogoPage,
    '/about/fej': AboutFejPage,
    '/about/privacy': PrivacyPage,

    // Congress info subpage
    '/congress/excursion': ExcursionPage,
    '/congress/register-guidelines': RegisterGuidelinesPage,
    '/congress/payment-guidelines': PaymentGuidelinesPage,

    // Participate subpage
    '/donate': DonatePage,
    '/participate/volunteer': VolunteerPage,

    // Register page
    '/participate/register': RegisterPage,
    '/participate/register/section-overview': RegisterPage,
    '/participate/register/section-basic': RegisterPage,
    '/participate/register/section-reg': RegisterPage,
    '/participate/register/section-lodging': RegisterPage,
    '/participate/register/section-excursion': RegisterPage,
    '/participate/register/section-food': RegisterPage,
    '/participate/register/section-others': RegisterPage,
    '/participate/register/section-summary': RegisterPage,
    '/participate/register/section-payment': RegisterPage,
    '/participate/register/section-thanks': RegisterPage,

    // Redirects
    '/register': {
        view: () => {
            m.route.set('/participate/register', {}, {
                replace: true
            });
        }
    },

    // Catch-all
    '/:404...': NotFoundPage,
});
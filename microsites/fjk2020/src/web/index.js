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
import {CopyrightPage} from './views/about/CopyrightPage';

// Congress info subpage
import {Covid19AdvisoryPage} from './views/congress_info/Covid19AdvisoryPage';
import {CountryCityPage} from './views/congress_info/CountryCityPage';
import {LodgingPage} from './views/congress_info/LodgingPage';
import {ExcursionPage} from './views/congress_info/ExcursionPage';
import {RegisterGuidelinesPage} from './views/congress_info/RegisterGuidelinesPage';
import {PaymentGuidelinesPage} from './views/congress_info/PaymentGuidelinesPage';
import {ParticipantsPage} from './views/congress_info/ParticipantsPage';

// Participate subpage
import {RegisterPage} from './views/participate/RegisterPage';
import {ProgramPage} from './views/participate/ProgramPage';
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
    '/about/copyright': CopyrightPage,

    // Congress info subpage
    '/congress/covid19-advisory': Covid19AdvisoryPage,
    '/congress/country-city': CountryCityPage,
    '/congress/lodging': LodgingPage,
    '/congress/excursion': ExcursionPage,
    '/congress/register-guidelines': RegisterGuidelinesPage,
    '/congress/payment-guidelines': PaymentGuidelinesPage,
    '/congress/participants': ParticipantsPage,

    // Participate subpage
    '/donate': DonatePage,
    '/participate/program': ProgramPage,
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
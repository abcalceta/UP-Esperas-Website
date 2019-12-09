import m from 'mithril';

import {IndexPage} from './views/IndexPage';
import {LkkJoinPage} from './views/LkkJoinPage';
import {VolunteerPage} from './views/VolunteerPage';
import {DonatePage} from './views/DonatePage';
import {RegisterPage} from './views/RegisterPage';
import {NotFoundPage} from './views/NotFoundPage';

// About page
import {AboutEsperantoPage} from './views/about/AboutEsperanto';
import {AboutFjkPage} from './views/about/AboutFjk';
import {AboutLkkPage} from './views/about/AboutLkk';
import {AboutLogoPage} from './views/about/AboutLogo';
import {AboutFejPage} from './views/about/AboutFej';
import {PrivacyPage} from './views/about/PrivacyPage';

let root = document.body;

m.route(root, '/', {
    '/': IndexPage,
    '/lkk-join': LkkJoinPage,
    '/donate': DonatePage,
    '/volunteer': VolunteerPage,

    // About subpage
    '/about/esperanto': AboutEsperantoPage,
    '/about/fjk': AboutFjkPage,
    '/about/lkk': AboutLkkPage,
    '/about/logo': AboutLogoPage,
    '/about/fej': AboutFejPage,
    '/about/privacy': PrivacyPage,

    // Register page
    '/register': RegisterPage,
    '/register/section-overview': RegisterPage,
    '/register/section-basic': RegisterPage,
    '/register/section-reg': RegisterPage,
    '/register/section-lodging': RegisterPage,
    '/register/section-excursion': RegisterPage,
    '/register/section-food': RegisterPage,
    '/register/section-others': RegisterPage,
    '/register/section-payment': RegisterPage,
    '/register/section-thanks': RegisterPage,

    // Catch-all
    '/:404...': NotFoundPage
});
import m from 'mithril';
import {IndexPage} from './views/IndexPage';
import {LkkJoinPage} from './views/LkkJoinPage';
import {VolunteersPage} from './views/VolunteersPage';
import {DonatePage} from './views/DonatePage';
import {RegisterPage} from './views/RegisterPage';

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
    '/register': RegisterPage,
    '/lkk-join': LkkJoinPage,
    '/donate': DonatePage,
    '/volunteer': VolunteersPage,

    // About subpage
    '/about/esperanto': AboutEsperantoPage,
    '/about/fjk': AboutFjkPage,
    '/about/lkk': AboutLkkPage,
    '/about/logo': AboutLogoPage,
    '/about/fej': AboutFejPage,
    '/about/privacy': PrivacyPage,
});
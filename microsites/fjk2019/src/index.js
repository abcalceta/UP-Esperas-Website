import m from 'mithril';
import {IndexPage} from './views/IndexPage';
import {LkkJoinPage} from './views/LkkJoinPage';
import {VolunteersPage} from './views/VolunteersPage';
import {DonatePage} from './views/DonatePage';

let root = document.body

m.route(root, "/", {
    "/": IndexPage,
    "/lkk-join": LkkJoinPage,
    "/donate": DonatePage,
    "/volunteer": VolunteersPage
})
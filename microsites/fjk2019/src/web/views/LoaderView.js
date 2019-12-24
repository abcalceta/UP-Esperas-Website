import m from 'mithril';
import cssloader from '../styles/cssloader';

export class LoaderView {
    view() {
        return m('div', {class: 'sk-cube-grid'}, [
            m('div', {class: 'sk-cube sk-cube1 theme-red'}),
            m('div', {class: 'sk-cube sk-cube2 theme-yellow'}),
            m('div', {class: 'sk-cube sk-cube3 theme-green'}),
            m('div', {class: 'sk-cube sk-cube4 theme-green'}),
            m('div', {class: 'sk-cube sk-cube5 theme-red'}),
            m('div', {class: 'sk-cube sk-cube6 theme-yellow'}),
            m('div', {class: 'sk-cube sk-cube7 theme-yellow'}),
            m('div', {class: 'sk-cube sk-cube8 theme-green'}),
            m('div', {class: 'sk-cube sk-cube9 theme-red'}),
        ]);
    }
}
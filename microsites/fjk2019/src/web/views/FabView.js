import m from 'mithril';
import M from 'materialize-css';

export class FabView {
    onupdate() {
        M.FloatingActionButton.init(document.getElementById('btn-i18n'));
        const tapTarget = M.TapTarget.init(document.getElementById('div-i18n-hint'));

        tapTarget.open();
    }

    view() {
        return [
            m('div', {id: 'btn-i18n', class: 'fixed-action-btn'}, [
                m('a', {
                    class: 'btn-floating btn-large theme-green tooltipped',
                    'data-position': 'left',
                    'data-tooltip': 'Choose a language'
                }, [
                    m('i', {class: 'material-icons'}, 'translate')
                ]),
                m('ul', [
                    m('li', m('a', {class: 'btn-floating theme-yellow'}, 'EO')),
                    m('li', m('a', {class: 'btn-floating theme-yellow'}, 'EN'))
                ])
            ]),
            m('div', {id: 'div-i18n-hint', class: 'tap-target theme-green', 'data-target': 'btn-i18n'}, [
                m('div', {class: 'tap-target-content'}, [
                    m('h5', {class: 'white-text'}, 'Traduku/Translate!'),
                    m('p', {class: 'grey-text text-lighten-3'}, 'Choose a language by hovering here.'),
                    m('p', {class: 'grey-text text-lighten-3'}, 'Elektu lingvon per musumi tien ĉi.')
                ])
            ])
        ]
    }
}
import m from 'mithril';

import { LoaderView } from './LoaderView';
import '../styles/loadingoverlay.css';

export class LoadingOverlay {
    onupdate(vnode) {
        const preloader = document.querySelector('.preloader');
        const fadeMillis = 600;

        const fadeEffect = setInterval(() => {
            if(!preloader.style.opacity) {
                preloader.style.opacity = 1;
                preloader.classList.remove('hide');
            }

            if(preloader.style.opacity > 0) {
                preloader.style.opacity -= 0.1;
            }
            else {
                clearInterval(fadeEffect);
                preloader.classList.add('hide');
            }
        }, fadeMillis / 10);
    }

    view(vnode) {
        return m('div', {class: 'preloader'}, [
            m(LoaderView, {loadingText: vnode.attrs.loadingText}),
        ]);
    }
}
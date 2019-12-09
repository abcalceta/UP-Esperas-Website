import m from 'mithril';

export class StepsView {
    view(vnode) {
        return m('ul', {class: 'steps-bar browser-default'}, vnode.attrs.pageStatesList.map((v, k) => {
            let activeClass = (k <= vnode.attrs.activeIdx) ? 'active' : '';

            return m('li', {class: activeClass}, [
                m('i', {class: 'steps-icon material-icons'}, v[1]),
                m('span', v[0])
            ]);
        }));
    }

    scrollTimeline(idx) {
        // Scroll to center of current step
        let stepsElm = document.querySelector('#div-steps');
        let currentStepElm = document.querySelector(`#div-steps li:nth-child(${idx + 1})`);

        stepsElm.scrollTo({
            left: currentStepElm.offsetLeft - currentStepElm.offsetWidth - (currentStepElm.querySelector('.steps-icon').offsetWidth / 2),
            behavior: 'smooth'
        });
    }
}
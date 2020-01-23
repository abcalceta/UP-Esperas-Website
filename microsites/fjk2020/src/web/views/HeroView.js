import m from 'mithril';
import smoothscroll from 'smoothscroll-polyfill';

export class HeroView {
    onupdate() {
        smoothscroll.polyfill();

        const scrollClick = document.getElementById('a-main-content');
        if(scrollClick && !scrollClick.dataset.hasClick) {
            scrollClick.addEventListener('click', (e) => {
                e.preventDefault();

                document.getElementById('main-content').scrollIntoView({behavior: 'smooth'});
                scrollClick.dataset.hasClick = true;
            });
        }
    }

    view(vnode) {
        let imgBgPath = vnode.attrs.imgBgPath;
        let imgAltText = vnode.attrs.imgAltText;
        let headText = vnode.attrs.headText;
        let subText = vnode.attrs.subText.split(';'); // Split semicolons into new lines each

        let containerElm = [
            m("h1", {class: 'white-text'}, headText)
        ];

        subText.forEach(element => {
            containerElm.push(
                m("h5", {class: "white-text"}, element)
            );
        });

        return m("header", {class: "parallax-container hero valign-wrapper"}, [
            m("div", {class: "parallax"}, [
                m("img", {alt: imgAltText, src: imgBgPath, width: "1024"})
            ]),
            m("div", {class: "container"}, containerElm),
            m("a", {id: "a-main-content", href: "#main-content", class: "material-icons hero-down-marker animated bounce infinite"}, "expand_more")
        ]);
    }
}
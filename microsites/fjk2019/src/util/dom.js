import Materialize from 'materialize-css';

function animate(targetsQuery, animateClasses, getParents = false, threshold = 0.5) {
    const intersectHandler = function intersectHandler(prevTop) {
        return function(entries) {
            entries.forEach(eachEntry => {
                const classesList = ["animated"];
                classesList.push(...animateClasses.split(" "));

                const nowTop = eachEntry.boundingClientRect.top;
                const nowRatio = eachEntry.intersectionRatio;

                if (eachEntry.isIntersecting && nowTop < prevTop && nowRatio > 0.5) {
                    //console.log(`fadeIn: ${nowTop} ${prevTop} ${nowRatio}`)
                    eachEntry.target.classList.remove("fadeOut", "faster");
                    eachEntry.target.classList.add(...classesList);
                }
                else if (!eachEntry.isIntersecting && nowTop > prevTop && nowRatio < 0.5) {
                    //console.log(`fadeOut: ${nowTop} ${prevTop} ${nowRatio}`)
                    eachEntry.target.classList.remove(...classesList);
                    eachEntry.target.classList.add("animated", "fadeOut", "faster");
                }

                prevTop = nowTop;
            });
        }
    }

    const elmTargets = document.querySelectorAll(targetsQuery);
    elmTargets.forEach(t => {
        const scrollObserver = new IntersectionObserver(
            intersectHandler(0),
            {
                //rootMargin: "0% 0% -50% 0%",
                threshold: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
            });

        if(getParents) {
            scrollObserver.observe(t.parentElement);
        }
        else {
            scrollObserver.observe(t);
        }
    })
}

function initDomScripts() {
    Materialize.Parallax.init(document.querySelectorAll(".parallax"));
    Materialize.Sidenav.init(document.querySelectorAll(".sidenav"));
    Materialize.ScrollSpy.init(document.querySelectorAll('.scrollspy'));
    Materialize.Dropdown.init(document.querySelectorAll(".dropdown-trigger"), {hover: true});
    Materialize.Collapsible.init(document.querySelectorAll(".collapsible"), {});

    document.getElementById('a-main-content').addEventListener('click', e => {
        e.preventDefault();

        document.getElementById('main-content').scrollIntoView({behavior: 'smooth'});
    })
}

export let DomScripts = {
    initDomScripts: initDomScripts,
    animate: animate
};
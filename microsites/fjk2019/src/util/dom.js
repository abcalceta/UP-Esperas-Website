import Materialize from 'materialize-css';

function animate(targetsQuery, animateClasses, getParents = false, threshold = 0.5) {
    const scrollObserver = new IntersectionObserver(entries => {
        entries.forEach(eachEntry => {
            if(eachEntry.isIntersecting) {
                let classesList = ["animated"];
                classesList.push(...animateClasses.split(" "));

                eachEntry.target.classList.remove("fadeOut");
                eachEntry.target.classList.add(...classesList);
            }
            else if(!eachEntry.target.classList.contains("animated")) {
                // Hide element for animation
                eachEntry.target.classList.add("animated", "fadeOut", "faster");
            }
        })
    },
    {
        threshold: threshold
    })

    const elmTargets = document.querySelectorAll(targetsQuery);
    elmTargets.forEach(t => {
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
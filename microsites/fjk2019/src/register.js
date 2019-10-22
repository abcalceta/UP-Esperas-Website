function getCountriesList() {
    let restUrl = "https://restcountries.eu/rest/v2/all?fields=name;alpha2Code"
    return fetch(restUrl)
        .then(res => res.json())
        .catch(console.error)
}

function addCountriesListToDropdown(countriesArr) {
    let selectDom = document.querySelector("#select-countries-list")

    countriesArr.forEach(v => {
        let optionDom = document.createElement("option")
        optionDom.setAttribute("value", v.alpha2Code)
        optionDom.innerHTML = v.name

        selectDom.appendChild(optionDom)
    });
}

let dateToday = new Date(Date.now())

document.addEventListener('DOMContentLoaded', () => {
    // Materialize inits
    M.Parallax.init(document.querySelectorAll(".parallax"));
    M.Datepicker.init(document.querySelectorAll(".datepicker"), {
        yearRange: [1950, dateToday.getFullYear()],
        maxDate: dateToday,
        format: "yyyy-mm-dd",
        autoClose: true,
        i18n: {
            cancel: "Nuligi",
            clear: "Forigi",
            done: "Preta",
            months: [
                "Januaro", "Februaro", "Marto", "Aprilo",
                "Majo", "Junio",  "Julio", "Aŭgusto",
                "Septembro", "Oktobro", "Novembro", "Decembro"
            ],
            monthsShort: [
                "Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
                "Jul", "Aŭg", "Sep", "Okt", "Nov", "Dec"
            ],
            weekdaysShort: [
                "dim", "lun", "mar", "mer",
                "ĵaŭ", "ven", "sab"
            ],
            weekdaysAbbrev: ["di", "lu", "ma", "me", "ĵa", "ve", "sa"]
        }
    })
    //M.ScrollSpy.init(document.querySelectorAll(".scrollspy"), {throttle: 100, scrollOffset: 0})
    //M.Collapsible.init(document.querySelectorAll(".collapsible"), {})
    //M.Sidenav.init(document.querySelector(".sidenav"))

    // Add stuff
    getCountriesList()
        .then(res => addCountriesListToDropdown(res))
        .then(() => {
            M.FormSelect.init(document.querySelectorAll("select"))
        })
})
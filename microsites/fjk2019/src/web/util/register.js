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

function initDatePicker(element, localeObj) {
    let dateToday = new Date(Date.now());
    let elm = element;

    if(typeof element == 'string' || element instanceof String) {
        elm = document.querySelector(element);
    }

    M.Datepicker.init(elm, {
        yearRange: [1940, dateToday.getFullYear()],
        maxDate: dateToday,
        format: "yyyy-mm-dd",
        autoClose: true,
        i18n: {
            cancel: localeObj.cancel,
            clear: localeObj.clear,
            done: localeObj.done,
            months: localeObj.months.full,
            monthsShort: localeObj.months.short,
            weekdaysShort: localeObj.days.short,
            weekdaysAbbrev: localeObj.days.abbrev,
        }
    });
}

function getRegTier(locality, broadCategory, occupation, birthdate) {
    let regCatKey;

    switch(broadCategory) {
        case 'moral':
            regCatKey = 'C';
            break;
        case 'patron':
            regCatKey = 'D';
            break;
        default: {
            // Compute from categories
            switch(occupation) {
                case 'shs': {
                    regCatKey = (locality === 'local') ? 'A1' : 'A';
                    break;
                }
                case 'undergrad': {
                    regCatKey = (locality === 'local') ? 'A2' : 'A';
                    break;
                }
                case 'grad':
                case 'working':
                case 'unemployed': {
                    // Check birthday
                    let age = Math.floor(Math.abs(new Date() - new Date(birthdate)) / (1000 * 60 * 60 * 24 * 365));

                    regCatKey = (age <= 35) ? 'B1' : 'B2';
                }
            }
        }
    }

    return regCatKey;
}

export let RegForm = {
    initDatePicker: initDatePicker,
    getRegTier: getRegTier
};
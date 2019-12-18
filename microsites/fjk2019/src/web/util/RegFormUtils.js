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

function saveFormElements(rootElmId) {
    const inputList = document.querySelector(rootElmId).querySelectorAll('input, select');

    for(let eachInputElm of inputList) {
        if(!eachInputElm.name) {
            continue;
        }

        const savedValue = sessionStorage.getItem(eachInputElm.name);

        if(savedValue == null) {
            continue;
        }

        eachInputElm.value = savedValue;
    }
}

function loadFormElements(rootElmId) {
    const inputList = document.querySelector(rootElmId).querySelectorAll('input, select');

    for(let eachInputElm of inputList) {
        if(!eachInputElm.name) {
            continue;
        }

        if((eachInputElm.type === 'radio' || eachInputElm.type === 'checkbox') && !eachInputElm.checked) {
            continue;
        }

        sessionStorage.setItem(eachInputElm.name, eachInputElm.value);
    }
}

function checkRegistrationPeriod() {
    let earlyBirdDate = new Date('2019-12-31T11:59:59+08:00');
    let regDate = new Date('2020-03-23T11:59:59+08:00');
    let dateToday = new Date();

    if(dateToday <= earlyBirdDate) {
        return 0;
    }
    else if(dateToday <= regDate) {
        return 1;
    }
    else {
        return 2;
    }
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

export let RegFormUtils = {
    initDatePicker: initDatePicker,
    saveFormElements: saveFormElements,
    getRegTier: getRegTier,
    checkRegistrationPeriod: checkRegistrationPeriod
};
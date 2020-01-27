import flatpickr from 'flatpickr';
import {Esperanto as flatpickrEo} from 'flatpickr/dist/l10n/eo';

import 'flatpickr/dist/themes/material_green.css';
import '../styles/datepicker.css';

function initDatePicker(element, locale) {
    let elm = element;

    if(typeof element == 'string' || element instanceof String) {
        elm = document.querySelector(element);
    }

    const datePicker = flatpickr(elm, {
        allowInput: true,
        dateFormat: 'Y-m-d',
        minDate: '1940-01-01',
        maxDate: 'today',
        locale: flatpickrEo,
    });

    const textLabel = elm.parentElement.querySelector('label');

    if(textLabel) {
        textLabel.addEventListener('click', () => {
            datePicker.open();
        });
    }
}

function loadFormElements(rootElmId) {
    const inputList = document.querySelector(rootElmId).querySelectorAll('input, select');

    for(let eachInputElm of inputList) {
        if(!eachInputElm.name) {
            continue;
        }

        const savedValue = sessionStorage.getItem(eachInputElm.name);

        if(savedValue == null) {
            continue;
        }

        if(eachInputElm.type == 'checkbox' || eachInputElm.type == 'radio') {
            const validValsList = savedValue.split(',');

            if(validValsList.length == 1 && validValsList[0] == 'on') {
                eachInputElm.checked = true;
            }
            else if(validValsList.includes(eachInputElm.value)) {
                eachInputElm.checked = true;
            }
        }
        else if(eachInputElm.type == 'radio' && eachInputElm.value == savedValue) {
            eachInputElm.checked = true;
        }
        else {
            eachInputElm.value = savedValue;
        }
    }
}

function getStoredValueWithName(name) {
    return sessionStorage.getItem(name);
}

function clearStoredFormElements() {
    sessionStorage.clear();
}

function saveFormElements(rootElmId) {
    const inputList = document.querySelector(rootElmId).querySelectorAll('input, select');
    let optList = {};

    for(let eachInputElm of inputList) {
        if(!eachInputElm.name) {
            continue;
        }

        if(eachInputElm.type === 'radio' || eachInputElm.type === 'checkbox') {
            if(optList[eachInputElm.name] == undefined) {
                optList[eachInputElm.name] = [];
            }

            if(eachInputElm.checked) {
                optList[eachInputElm.name].push(eachInputElm.value);
            }

            continue;
        }

        sessionStorage.setItem(eachInputElm.name, eachInputElm.value);
    }

    // Save contents of each radio and check box
    for(let eachOptKey of Object.keys(optList)) {
        if(optList[eachOptKey].length < 1) {
            sessionStorage.removeItem(eachOptKey);
        }
        else {
            const valueStr = optList[eachOptKey].join(',');
            sessionStorage.setItem(eachOptKey, valueStr);
        }
    }
}

function treatAsUtc(date) {
    let result = date == null ? new Date() : new Date(date);

    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());

    return result;
}

function msToDms(millis) {
    let secs = Math.floor(Math.abs(millis) * (1 / 1000));
    let mins = Math.floor(secs * (1 / 60));
    let hours = Math.floor(mins * (1 / 60));
    let days = Math.floor(hours * (1 / 24));

    return {
        seconds: secs % 60,
        minutes: mins % 60,
        hours: hours % 24,
        days: days,
    };
}

function checkRegistrationPeriod() {
    const earlyDate = treatAsUtc(new Date('2020-01-27T23:59:59+08:00'));
    const regularDate = treatAsUtc(new Date('2020-03-23T23:59:59+08:00'));
    const lateDate = treatAsUtc(new Date('2020-04-22T23:59:59+08:00'));
    const congresEndDate = treatAsUtc(new Date('2020-04-25T23:59:59+08:00'));
    const dateToday = treatAsUtc(null);

    let regPeriod = 4;
    let timeLeft = msToDms(0);

    if(dateToday <= earlyDate) {
        timeLeft = msToDms(earlyDate - dateToday);
        regPeriod = 0;
    }
    else if(dateToday <= regularDate) {
        timeLeft = msToDms(regularDate - dateToday);
        regPeriod = 1;
    }
    else if(dateToday <= lateDate) {
        timeLeft = msToDms(lateDate - dateToday);
        regPeriod = 2;
    }
    else if(dateToday <= congresEndDate) {
        timeLeft = msToDms(congresEndDate - dateToday);

        regPeriod = 3;
    }

    return {
        regPeriod: regPeriod,
        timeLeft: timeLeft,
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
    loadFormElements: loadFormElements,
    getStoredValueWithName: getStoredValueWithName,
    clearStoredFormElements: clearStoredFormElements,
    getRegTier: getRegTier,
    checkRegistrationPeriod: checkRegistrationPeriod,
};
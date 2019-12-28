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

function checkRegistrationPeriod() {
    let earlyBirdDate = new Date('2020-01-27T23:59:59+08:00');
    let regDate = new Date('2020-03-23T23:59:59+08:00');
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
    loadFormElements: loadFormElements,
    getStoredValueWithName: getStoredValueWithName,
    clearStoredFormElements: clearStoredFormElements,
    getRegTier: getRegTier,
    checkRegistrationPeriod: checkRegistrationPeriod,
};
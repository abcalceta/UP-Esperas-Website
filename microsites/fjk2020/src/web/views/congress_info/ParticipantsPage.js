import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/participants.html';
import heroPath from '../../img/hero/uk_100a.jpg';

import '../../styles/flag_font.css';
import '../../styles/bignumber.css';
import '../../styles/default.css';

export class ParticipantsPage extends BasePage {
    constructor() {
        super(
            'en',
            'infoParticipants',
            htmlMain,
            'congress_info/ParticipantsPage',
            heroPath
        );
    }

    async onupdate() {
        super.onupdate();

        const participantsList = document.getElementById('ul-participants');

        try {
            const res = await fetch(`${this.apiDomain}/name_list`, {
                method: 'GET',
            });

            if(!res.ok) {
                console.error(`Not OK HTTP status on form submit: ${res.json()}`);
                throw err;
            }

            const jsonRes = await res.json();
            let nLocal = 0;
            let nForeign = 0;

            for(let eachName of jsonRes.names) {
                const alpha3Code = DomScripts.htmlEntities(eachName.country);

                // https://github.com/SlavkoPekaric/Country-Flags-Responsive-CSS-Sprite
                const nameItem = document.createElement('li');

                const participantName = document.createElement('span');
                participantName.innerHTML = this.localeObj.t('infoParticipants.nameEntry', {
                    firstName: eachName.firstName === '<hidden>' ? `[${this.localeObj.t('infoParticipants.hiddenName')}]` : DomScripts.htmlEntities(eachName.firstName),
                    lastName: eachName.firstName === '<hidden>' ? '' : DomScripts.htmlEntities(eachName.lastName).toUpperCase(),
                    country: this.countryList[alpha3Code][0],
                });

                const flagIcon = document.createElement('img');
                flagIcon.src = require('../../img/flag_font/flag_placeholder.png');
                flagIcon.alt = alpha3Code;
                flagIcon.title = this.countryList[alpha3Code][0];
                flagIcon.classList.add('flag', `flag-${this.countryList[alpha3Code][1].toLowerCase()}`);

                nameItem.appendChild(flagIcon);
                nameItem.appendChild(participantName);

                participantsList.appendChild(nameItem);

                // Count number of participants
                if(alpha3Code == 'PHL') {
                    nLocal += 1;
                }
                else {
                    nForeign += 1;
                }
            }

            // Display number of participants
            const totalPartSpans = document.getElementById('div-total-participants').getElementsByTagName('SPAN');
            const localPartSpans = document.getElementById('div-local-participants').getElementsByTagName('SPAN');
            const foreignPartSpans = document.getElementById('div-foreign-participants').getElementsByTagName('SPAN');

            totalPartSpans[0].innerHTML = nLocal + nForeign;
            localPartSpans[0].innerHTML = nLocal;
            foreignPartSpans[0].innerHTML = nForeign;

            localPartSpans[1].innerHTML = this.localeObj.t('infoParticipants.summaryNumbers.local', nLocal);
            foreignPartSpans[1].innerHTML = this.localeObj.t('infoParticipants.summaryNumbers.foreign', nForeign);

            DomScripts.animate('#div-total-participants', 'slideInLeft');
            DomScripts.animate('#div-local-participants', 'slideInRight');
            DomScripts.animate('#div-foreign-participants', 'slideInRight');
            DomScripts.animate('#ul-participants li', 'flipInX slow');
        }
        catch(err) {
            console.error(err);

            const errorItem = document.createElement('li');
            errorItem.innerHTML = this.localeObj.t('infoParticipants.listError');

            participantsList.appendChild(errorItem);
        }
    }

    onLocaleChanged() {
        super.onLocaleChanged();

        m.request({
            method: 'GET',
            url: `/i18n/${this.data.locale.lang}/countryList.json`,
            background: true,
        })
        .then((t) => {
            this.countryList = t.map((eachCountry) => {
                return [eachCountry.alpha3Code, eachCountry.name, eachCountry.alpha2Code];
            }).reduce((a, b) => (
                a[b[0]] = [b[1], b[2]], a
            ), {});

            this.isCountryListUpdated = true;
        })
        .catch((err) => {
            console.log(`Failed to load country info: ${err}`);
        });
    }
}
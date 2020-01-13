import m from 'mithril';
import {DomScripts} from '../../util/dom';

import {BasePage} from '../BasePage';
import htmlMain from '../../templates/congress_info/participants.html';
import heroPath from '../../img/hero/eo_flags_banner.jpg';
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

        //this.apiDomain = 'https://fjk.up-esperas.org/api';
        this.apiDomain = '//localhost:6002/api';
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

            for(let eachName of jsonRes.names) {
                const nameItem = document.createElement('li');
                nameItem.innerHTML = this.localeObj.t('infoParticipants.nameEntry', {
                    firstName: eachName.firstName === '<hidden>' ? `[${this.localeObj.t('infoParticipants.hiddenName')}]` : DomScripts.htmlEntities(eachName.firstName),
                    lastName: eachName.firstName === '<hidden>' ? '' : DomScripts.htmlEntities(eachName.lastName),
                    country: DomScripts.htmlEntities(eachName.country),
                });

                participantsList.appendChild(nameItem);
            }
        }
        catch(err) {
            console.error(err);

            const errorItem = document.createElement('li');
            errorItem.innerHTML = this.localeObj.t('infoParticipants.listError');

            participantsList.appendChild(errorItem);
        }
    }
}
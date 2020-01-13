import uuidv4 from 'uuid/v4';

import {RegisterDao} from './RegisterDao';
import {RegisterRepository} from './RegisterRepository';
import {BasicInfoRepository} from './BasicInfoRepository';
import {LodgingRepository} from './LodgingRepository';
import {FoodRepository} from './FoodRepository';
import {AddonsRepository} from './AddonsRepository';
import {PaymentRepository} from './PaymentRepository';

export class DbInterface{
    constructor() {
        this.initDb();
    }

    async initDb() {
        const registerDao = new RegisterDao(process.env.SQLITE_DB_PATH);
        const registerRepo = new RegisterRepository(registerDao);
        const basicInfoRepo = new BasicInfoRepository(registerDao);
        const lodgingRepo = new LodgingRepository(registerDao);
        const foodRepo = new FoodRepository(registerDao);
        const addonsRepo = new AddonsRepository(registerDao);
        const paymentRepo = new PaymentRepository(registerDao);

        try {
            await registerRepo.createTable();
            await basicInfoRepo.createTable();
            await lodgingRepo.createTable();
            await foodRepo.createTable();
            await addonsRepo.createTable();
            await paymentRepo.createTable();
        }
        catch(err) {
            console.error('Failed to create tables from repository');
            console.error(err);
        }

        this.repos = {
            register: registerRepo,
            basic: basicInfoRepo,
            lodging: lodgingRepo,
            food: foodRepo,
            addons: addonsRepo,
            payment: paymentRepo
        };
    }

    async addNewRegistrant(nickname, locale='en') {
        const registrantId = uuidv4();
        const paymentId = uuidv4();

        await this.repos.register.create(
            registrantId,
            paymentId,
            nickname,
            locale,
        );

        return {
            registrantId: registrantId,
            paymentId: paymentId
        };
    }

    async addNewFormAnswers(registrantId, regCategory, formObj) {
        await this.repos.basic.create(
            registrantId,
            {
                lastName: formObj['txt-last-name'],
                firstName: formObj['txt-first-name'],
                middleName: formObj['txt-middle-name'],
                nickName: formObj['txt-nickname'],
                birthday: formObj['txt-bday'],
                sex: formObj['select-sex-list'],
                originCountry: formObj['select-countries-list'],
                email: formObj['txt-email'],
                province: formObj['txt-province'],
                city: formObj['txt-city'],
                mobileNumber: formObj['txt-mobile'],
                sns: formObj['txt-sns'],
                regCategory: regCategory,
                educInst: formObj['txt-reg-educ'],
                gradeStrandYear: formObj['txt-reg-degree'],
                companyName: formObj['txt-reg-company'],
                officePosition: formObj['txt-reg-position'],
                isExcursionInterest: (formObj['cbx-excursion-interest'] == 'on') ? 1 : 0,
                isVerified: (formObj['cbx-attest-true'] == 'on') ? 1 : 0,
                isPrivacy: (formObj['cbx-attest-privacy'] == 'on') ? 1 : 0,
                isPublicity: (formObj['cbx-attest-publicity'] == 'on') ? 1 : 0,
            }
        );

        await this.repos.lodging.create(
            registrantId,
            {
                isLodgingInterest: (formObj['cbx-lodging-interest'] == 'on') ? 1 : 0,
                isLodgingBeyond: (formObj['cbx-lodging-overstay'] == 'on') ? 1 : 0,
                lodgingArriveDate: (formObj['cbx-lodging-interest'] == 'on') ? formObj['select-lodging-arrival']: '',
                lodgingDepartDate: (formObj['cbx-lodging-interest'] == 'on') ? formObj['select-lodging-depart']: '',
            }
        );

        await this.repos.food.create(
            registrantId,
            {
                foodRestrictions: formObj['rbx-food-pref'],
                foodAllergies: (formObj['cbx-food-allerg']) ? formObj['cbx-food-allerg'].join(','): '',
                isAlcohol: (formObj['rbx-food-alcohol-pref'] == 'yes') ? 1 : 0,
            }
        );

        await this.repos.addons.create(
            registrantId,
            {
                isCongressPhoto: (formObj['cbx-others-photo'] == 'on') ? 1 : 0,
                isInvitLetter: (formObj['cbx-others-invitletter'] == 'on') ? 1 : 0,
                invitLetterShipVia: (formObj['cbx-others-invitletter'] == 'on') ? formObj['rbx-others-invitletter-shipvia'] : '',
                isNameInList: (formObj['cbx-others-weblist-noinclude'] == 'on') ? 0 : 1,
                isInDonorList: (formObj['cbx-others-donorlist-noinclude'] == 'on') ? 0 : 1,
                isCongressProgram: (formObj['cbx-others-contrib'] == 'on') ? 1 : 0,
                isVolCorp: (formObj['cbx-others-volcorp'] == 'on') ? 1 : 0,
                isJoinFej: (formObj['cbx-others-fej'] == 'on') ? 1: 0,
                isCertAttend: (formObj['cbx-others-cert'] == 'on') ? 1 : 0,
                isBooklet: (formObj['cbx-others-nobooklet'] == 'on') ? 0 : 1,
                suggest: formObj['txt-others-suggest']
            }
        );

        return registrantId;
    }

    async addNewPaymentEntry(paymentId, formObj) {
        await this.repos.payment.create(
            paymentId,
            {
                paymentType: formObj['rbx-payment-method'],
                currency: formObj['hdn-reg-currency'],
                paypalOrderId: formObj['hdn-paypal-order-id'],
                regFee: Number(formObj['hdn-reg-fee']),
                excursion: Number(formObj['hdn-excursion-fee']),
                invitLetter: Number(formObj['hdn-invitletter-fee']),
                congressFund: Number(formObj['txt-congress-fund']),
                participantFund: Number(formObj['txt-participant-fund']),
                fejFund: Number(formObj['txt-fej-fund']),
            }
        );

        return paymentId;
    }

    async getParticipantList() {
        const nameList = await this.repos.basic.getNamesCountries();
        const isNameInList = await this.repos.addons.getIsNamesInList();

        const nameListHidden = nameList.map((v, i) => {
            let newNameEntry = {
                country: v.originCountry,
            };

            if(isNameInList[v['registrantId']]['isNameInList'] === 1) {
                newNameEntry.lastName = v.lastName;
                newNameEntry.firstName = v.firstName;
            }
            else {
                newNameEntry.lastName = '';
                newNameEntry.firstName = '<hidden>';
            }

            return newNameEntry;
        });

        return nameListHidden;
    }
}
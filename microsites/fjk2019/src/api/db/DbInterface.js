import uuidv4 from 'uuid/v4';

import RegisterDao from './RegisterDao';
import RegisterRepository from './RegisterRepository';
import FormAnswerRepository from './FormAnswerRepository';
import PaymentRepository from './PaymentRepository';

export class DbInterface{
    constructor() {
        this.initDb();
    }

    async initDb() {
        const registerDao = new RegisterDao(process.env.SQLITE_DB_PATH);
        const registerRepo = new RegisterRepository(registerDao);
        const formAnswerRepo = new FormAnswerRepository(registerDao);
        const paymentRepo = new PaymentRepository(registerDao);

        try {
            await registerRepo.createTable();
            await formAnswerRepo.createTable();
            await paymentRepo.createTable();
        }
        catch(err) {
            console.error('Failed to create tables from repository');
            console.error(err);
        }

        this.repos = {
            register: registerRepo,
            formAnswer: formAnswerRepo,
            payment: paymentRepo
        };
    }

    async addNewRegistrant(nickname) {
        const registrantId = uuidv4();
        const paymentId = uuidv4();

        await this.repos.register.create(
            registrantId,
            paymentId,
            nickname
        );

        return {
            registrantId: registrantId,
            paymentId: paymentId
        };
    }

    async addNewFormAnswers(registrantId, regCategory, formObj) {
        await this.repos.formAnswer.create(
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
                sns: formObj['txt-sns'],
                regCategory: regCategory,
                educInst: formObj['txt-reg-educ'],
                gradeStrandYear: formObj['txt-reg-degree'],
                companyName: formObj['txt-reg-company'],
                officePosition: formObj['txt-reg-position'],
                isLodgingInterest: (formObj['cbx-lodging-interest'] == 'on') ? 1 : 0,
                isLodgingBeyond: (formObj['cbx-lodging-overstay'] == 'on') ? 1 : 0,
                lodgingArriveDate: (formObj['cbx-lodging-interest'] == 'on') ? formObj['select-lodging-arrival']: '',
                lodgingDepartDate: (formObj['cbx-lodging-interest'] == 'on') ? formObj['select-lodging-depart']: '',
                isExcursionInterest: (formObj['cbx-excursion-interest'] == 'on') ? 1 : 0,
                foodRestrictions: (formObj['cbx-food-pref']) ? formObj['cbx-food-pref'].join(',') : '',
                foodAllergies: (formObj['cbx-food-allerg']) ? formObj['cbx-food-allerg'].join(','): '',
                isAlcohol: (formObj['cbx-alcohol-pref'] == 'on') ? 1 : 0,
                isCongressPhoto: (formObj['cbx-lodging-interest'] == 'on') ? 1 : 0,
                isInvitLetter: (formObj['cbx-others-invitletter'] == 'on') ? 1 : 0,
                isNameInList: (formObj['cbx-others-name-include'] == 'on') ? 1 : 0,
                isCongressProgram: (formObj['cbx-others-contrib'] == 'on') ? 1 : 0,
                isVolCorp: (formObj['cbx-others-volcorp'] == 'on') ? 1 : 0,
                isCertAttend: (formObj['cbx-others-cert'] == 'on') ? 1 : 0,
                isBooklet: (formObj['cbx-others-nobooklet'] == 'on') ? 0 : 1,
                isVerified: (formObj['cbx-attest-true'] == 'on') ? 1 : 0,
                isPrivacy: (formObj['cbx-attest-privacy'] == 'on') ? 1 : 0,
                isPublicity: (formObj['cbx-attest-publicity'] == 'on') ? 1 : 0,
                isNewsletter: (formObj['cbx-attest-newsletter'] == 'on') ? 1 : 0
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
                regFee: Number(formObj['hdn-reg-fee']),
                invitLetter: Number(formObj['hdn-invitletter-fee']),
                congressFund: Number(formObj['txt-congress-fund']),
                participantFund: Number(formObj['txt-participant-fund']),
                fejFund: Number(formObj['txt-fej-fund'])
            }
        );

        return paymentId;
    }
}
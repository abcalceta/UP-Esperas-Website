const BaseRepository = require('./BaseRepository');

class FormAnswerRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS formAnswers(
            registrantId TEXT PRIMARY KEY NOT NULL,
            lastName TEXT NOT NULL,
            firstName TEXT NOT NULL,
            middleName TEXT,
            nickName TEXT NOT NULL,
            birthday DATE NOT NULL,
            sex TEXT NOT NULL,
            originCountry TEXT NOT NULL,
            email TEXT NOT NULL,
            sns TEXT,
            regCategory TEXT NOT NULL,
            educInst TEXT,
            gradeStrandYear TEXT,
            companyName TEXT,
            officePosition TEXT,
            isLodgingInterest INTEGER,
            isLodgingBeyond INTEGER,
            lodgingArriveDate DATE,
            lodgingDepartDate DATE,
            isExcursionInterest INTEGER,
            foodRestrictions TEXT,
            foodAllergies TEXT,
            isAlcohol INTEGER,
            isCongressPhoto INTEGER,
            isInvitLetter INTEGER,
            isNameInList INTEGER,
            isCongressProgram INTEGER,
            isVolCorp INTEGER,
            isCertAttend INTEGER,
            isBooklet INTEGER,
            isVerified INTEGER NOT NULL,
            isPrivacy INTEGER NOT NULL,
            isPublicity INTEGER NOT NULL,
            isNewsletter INTEGER NOT NULL
        )
        `;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, params) {
        const sqlQuery = `
        INSERT INTO formAnswers(
            registrantId,
            lastName,
            firstName,
            middleName,
            nickName,
            birthday,
            sex,
            originCountry,
            email,
            sns,
            regCategory,
            educInst,
            gradeStrandYear,
            companyName,
            officePosition,
            isLodgingInterest,
            isLodgingBeyond,
            lodgingArriveDate,
            lodgingDepartDate,
            isExcursionInterest,
            foodRestrictions,
            foodAllergies,
            isAlcohol,
            isCongressPhoto,
            isInvitLetter,
            isNameInList,
            isCongressProgram,
            isVolCorp,
            isCertAttend,
            isBooklet,
            isVerified,
            isPrivacy,
            isPublicity,
            isNewsletter
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?)
        `;

        return this.dao.run(
            sqlQuery,
            registrantId,
            params.lastName,
            params.firstName,
            params.middleName,
            params.nickName,
            params.birthday,
            params.sex,
            params.originCountry,
            params.email,
            params.sns,
            params.regCategory,
            params.educInst,
            params.gradeStrandYear,
            params.companyName,
            params.officePosition,
            params.isLodgingInterest,
            params.isLodgingBeyond,
            params.lodgingArriveDate,
            params.lodgingDepartDate,
            params.isExcursionInterest,
            params.foodRestrictions,
            params.foodAllergies,
            params.isAlcohol,
            params.isCongressPhoto,
            params.isInvitLetter,
            params.isNameInList,
            params.isCongressProgram,
            params.isVolCorp,
            params.isCertAttend,
            params.isBooklet,
            params.isVerified,
            params.isPrivacy,
            params.isPublicity,
            params.isNewsletter
        );
    }

    getById(registrantId) {
        return this.dao.get(
            'SELECT * FROM formAnswers WHERE registrantId=?',
            [registrantId]
        );
    }

    getAll() {
        return this.dao.all('SELECT * FROM formAnswers');
    }

    deleteById(registrantId) {
        return this.dao.run(
            'DELETE FROM formAnswers WHERE registrantId = ?',
            [registrantId]
        );
    }
}

module.exports = FormAnswerRepository;
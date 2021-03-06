import {BaseRepository} from './BaseRepository';

export class BasicInfoRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS basicInfo(
            registrantId TEXT PRIMARY KEY NOT NULL,
            lastName TEXT NOT NULL,
            firstName TEXT NOT NULL,
            middleName TEXT,
            nickName TEXT NOT NULL,
            birthday DATE NOT NULL,
            sex TEXT NOT NULL,
            originCountry TEXT NOT NULL,
            email TEXT NOT NULL,
            province TEXT,
            city TEXT,
            mobileNum TEXT,
            sns TEXT,
            regCategory TEXT NOT NULL,
            educInst TEXT,
            gradeStrandYear TEXT,
            companyName TEXT,
            officePosition TEXT,
            isExcursionInterest INTEGER,
            isVerified INTEGER NOT NULL,
            isPrivacy INTEGER NOT NULL,
            isPublicity INTEGER NOT NULL
        )
        `;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, params) {
        const sqlQuery = `
        INSERT INTO basicInfo(
            registrantId,
            lastName,
            firstName,
            middleName,
            nickName,
            birthday,
            sex,
            originCountry,
            email,
            province,
            city,
            mobileNum,
            sns,
            regCategory,
            educInst,
            gradeStrandYear,
            companyName,
            officePosition,
            isExcursionInterest,
            isVerified,
            isPrivacy,
            isPublicity
        )
        VALUES
        (?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?)
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
            params.province,
            params.city,
            params.mobileNumber,
            params.sns,
            params.regCategory,
            params.educInst,
            params.gradeStrandYear,
            params.companyName,
            params.officePosition,
            params.isExcursionInterest,
            params.isVerified,
            params.isPrivacy,
            params.isPublicity,
        );
    }

    getNamesCountries() {
        return this.dao.all(
            'SELECT registrantId, lastName, firstName, originCountry FROM basicInfo'
        );
    }

    getById(registrantId) {
        return this.dao.get(
            'SELECT * FROM basicInfo WHERE registrantId=?',
            [registrantId]
        );
    }

    getAll() {
        return this.dao.all('SELECT * FROM basicInfo');
    }

    deleteById(registrantId) {
        return this.dao.run(
            'DELETE FROM basicInfo WHERE registrantId = ?',
            [registrantId]
        );
    }
}

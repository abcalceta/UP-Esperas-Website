import {BaseRepository} from './BaseRepository';

export class LodgingRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS lodging(
            entryId INTEGER PRIMARY KEY AUTOINCREMENT,
            registrantId TEXT NOT NULL,
            isLodgingInterest INTEGER,
            isLodgingBeyond INTEGER,
            lodgingArriveDate DATE,
            lodgingDepartDate DATE
        )`;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, params) {
        const sqlQuery = `
        INSERT INTO lodging(
            registrantId,
            isLodgingInterest,
            isLodgingBeyond,
            lodgingArriveDate,
            lodgingDepartDate
        )
        VALUES(
            ?, ?, ?, ?, ?
        )`;

        return this.dao.run(
            sqlQuery,
            registrantId,
            params.isLodgingInterest,
            params.isLodgingBeyond,
            params.lodgingArriveDate,
            params.lodgingDepartDate,
        );
    }

    getById(registrantId) {
        return this.dao.get(
            'SELECT * FROM lodging WHERE registrantId=?',
            [registrantId]
        );
    }

    deleteById(registrantId) {
        return this.dao.run(
            'DELETE FROM lodging WHERE registrantId = ?',
            [registrantId]
        );
    }
}

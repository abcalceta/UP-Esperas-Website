import {BaseRepository} from './BaseRepository';

export class RegisterRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS registrants(
            entryId INTEGER PRIMARY KEY AUTOINCREMENT,
            registrantId TEXT NOT NULL,
            paymentId TEXT NOT NULL,
            nickname TEXT NOT NULL,
            locale TEXT
        )
        `;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, paymentId = '', nickname = '', locale='en') {
        return this.dao.run(
            `INSERT INTO registrants (
                registrantId,
                paymentId,
                nickname,
                locale
            )
            VALUES (
                ?, ?, ?, ?
            )`,
            registrantId,
            paymentId,
            nickname,
            locale
        );
    }
}

import {BaseRepository} from './BaseRepository';

export class RegisterRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS registrants(
            entryId INTEGER PRIMARY KEY AUTOINCREMENT,
            createTime TEXT NOT NULL,
            registrantId TEXT NOT NULL,
            paymentId TEXT NOT NULL,
            nickname TEXT NOT NULL,
            locale TEXT,
            isConfirmSent INTEGER DEFAULT 0
        )
        `;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, paymentId = '', nickname = '', locale='en') {
        // Generate timestamp
        const createDateIso = new Date(Date.now()).toISOString();

        return this.dao.run(
            `INSERT INTO registrants (
                createTime,
                registrantId,
                paymentId,
                nickname,
                locale
            )
            VALUES (
                ?, ?, ?, ?, ?
            )`,
            createDateIso,
            registrantId,
            paymentId,
            nickname,
            locale
        );
    }

    writeConfirmedMail(registrantId, isConfirmed = false) {
        return this.dao.run(
            `UPDATE registrants
            SET isConfirmSent = ?
            WHERE registrantId = ?
            `,
            isConfirmed ? 1 : 0,
            registrantId,
        );
    }
}

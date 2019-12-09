import {BaseRepository} from './BaseRepository';

export class AddonsRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS addons(
            entryId INTEGER PRIMARY KEY AUTOINCREMENT,
            registrantId TEXT NOT NULL,
            isCongressPhoto INTEGER,
            isInvitLetter INTEGER,
            isNameInList INTEGER,
            isCongressProgram INTEGER,
            isVolCorp INTEGER,
            isCertAttend INTEGER,
            isBooklet INTEGER
        )`;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, params) {
        const sqlQuery = `
        INSERT INTO addons(
            registrantId,
            isCongressPhoto,
            isInvitLetter,
            isNameInList,
            isCongressProgram,
            isVolCorp,
            isCertAttend,
            isBooklet
        )
        VALUES
        (?, ?, ?, ?, ?,
        ?, ?, ?)
        `;

        return this.dao.run(
            sqlQuery,
            registrantId,
            params.isCongressPhoto,
            params.isInvitLetter,
            params.isNameInList,
            params.isCongressProgram,
            params.isVolCorp,
            params.isCertAttend,
            params.isBooklet,
        );
    }

    getById(registrantId) {
        return this.dao.get(
            'SELECT * FROM addons WHERE registrantId=?',
            [registrantId]
        );
    }

    deleteById(registrantId) {
        return this.dao.run(
            'DELETE FROM addons WHERE registrantId = ?',
            [registrantId]
        );
    }
}
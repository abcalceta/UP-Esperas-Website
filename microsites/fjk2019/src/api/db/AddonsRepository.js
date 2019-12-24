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
            isInDonorList INTEGER,
            isCongressProgram INTEGER,
            isVolCorp INTEGER,
            isCertAttend INTEGER,
            isBooklet INTEGER,
            suggest TEXT
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
            isInDonorList,
            isCongressProgram,
            isVolCorp,
            isCertAttend,
            isBooklet,
            suggest
        )
        VALUES
        (?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?)
        `;

        return this.dao.run(
            sqlQuery,
            registrantId,
            params.isCongressPhoto,
            params.isInvitLetter,
            params.isNameInList,
            params.isInDonorList,
            params.isCongressProgram,
            params.isVolCorp,
            params.isCertAttend,
            params.isBooklet,
            params.suggest,
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
const BaseRepository = require('./BaseRepository');

class RegisterRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS registrants(
            entryId INTEGER PRIMARY KEY AUTOINCREMENT,
            registrantId TEXT NOT NULL,
            paymentId TEXT NOT NULL,
            nickname TEXT NOT NULL
        )
        `;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, paymentId = '', nickname = '') {
        return this.dao.run(
            'INSERT INTO registrants (registrantId, paymentId, nickname) VALUES (?, ?, ?)',
            registrantId, paymentId, nickname
        );
    }
}

module.exports = RegisterRepository;
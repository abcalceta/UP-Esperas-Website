const BaseRepository = require('./BaseRepository');

class PaymentRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS payment(
            paymentId TEXT PRIMARY KEY NOT NULL,
            paymentType TEXT NOT NULL,
            currency TEXT NOT NULL,
            regFee REAL NOT NULL,
            invitLetter REAL,
            congressFund REAL,
            participantFund REAL,
            fejFund REAL
        )
        `;

        return this.dao.run(sqlQuery);
    }

    create(paymentId, params) {
        const sqlQuery = `
        INSERT INTO payment(
            paymentId,
            paymentType,
            currency,
            invitLetter,
            regFee,
            congressFund,
            participantFund,
            fejFund
        )
        VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?
        )
        `;

        return this.dao.run(
            sqlQuery,
            paymentId,
            params.paymentType,
            params.currency,
            params.regFee,
            params.invitLetter,
            params.congressFund,
            params.participantFund,
            params.fejFund
        );
    }

    getById(paymentId) {
        return this.dao.get(
            'SELECT * FROM payment WHERE paymentId = ?',
            paymentId
        );
    }

    getAll() {
        return this.dao.all('SELECT * FROM payment');
    }

    deleteById(paymentId) {
        return this.dao.run(
            'DELETE FROM payment WHERE paymentId = ?',
            paymentId
        );
    }
}

module.exports = PaymentRepository;
import {BaseRepository} from './BaseRepository';

export class PaymentRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
        CREATE TABLE IF NOT EXISTS payment(
            paymentId TEXT PRIMARY KEY NOT NULL,
            paymentType TEXT NOT NULL,
            currency TEXT NOT NULL,
            paypalOrderId TEXT,
            regFee REAL NOT NULL,
            excursion REAL,
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
            paypalOrderId,
            regFee,
            excursion,
            invitLetter,
            congressFund,
            participantFund,
            fejFund
        )
        VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?
        )
        `;

        return this.dao.run(
            sqlQuery,
            paymentId,
            params.paymentType,
            params.currency,
            params.paypalOrderId,
            params.regFee,
            params.excursion,
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

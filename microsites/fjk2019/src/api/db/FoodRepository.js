import {BaseRepository} from './BaseRepository';

export class FoodRepository extends BaseRepository {
    createTable() {
        const sqlQuery = `
            CREATE TABLE IF NOT EXISTS food(
                entryId INTEGER PRIMARY KEY AUTOINCREMENT,
                registrantId TEXT NOT NULL,
                foodRestrictions TEXT,
                foodAllergies TEXT,
                isAlcohol INTEGER
            )
        `;

        return this.dao.run(sqlQuery);
    }

    create(registrantId, params) {
        const sqlQuery = `
        INSERT INTO food(
            registrantId,
            foodRestrictions,
            foodAllergies,
            isAlcohol
        )
        VALUES
        (?, ?, ?, ?)
        `;

        return this.dao.run(
            sqlQuery,
            registrantId,
            params.foodRestrictions,
            params.foodAllergies,
            params.isAlcohol,
        );
    }

    getById(registrantId) {
        return this.dao.get(
            'SELECT * FROM food WHERE registrantId=?',
            [registrantId]
        );
    }

    deleteById(registrantId) {
        return this.dao.run(
            'DELETE FROM food WHERE registrantId = ?',
            [registrantId]
        );
    }
}

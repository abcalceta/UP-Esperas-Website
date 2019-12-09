import sqlite3 from 'sqlite3';

export class RegisterDao {
    constructor(dbFilePath) {
        this.dbObj = new sqlite3.Database(dbFilePath, (err) => {
            if(err) {
                console.error(`Cannot connect to database: ${err}`);
            }
            else {
                console.info('Connected to database successfully!');
            }
        });
    }

    run(sqlQuery, ...params) {
        return new Promise((resolve, reject) => {
            this.dbObj.run(sqlQuery, params, function(err) {
                if(err) {
                    console.error(`Cannot run SQL query: ${err}`);
                    reject(err);
                }
                else {
                    resolve(this.lastID);
                }
            })
        });
    }

    get(sqlQuery, ...params) {
        return new Promise((resolve, reject) => {
            this.dbObj.get(sqlQuery, params, (err, result) => {
                if(err) {
                    console.error(`Cannot GET from SQL: ${err}`);
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    all(sqlQuery, ...params) {
        return new Promise((resolve, reject) => {
            this.dbObj.all(sqlQuery, params, (err, result) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
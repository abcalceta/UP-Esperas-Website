const sqlite3 = require('sqlite3');

class RegisterDao {
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
            this.dbObj.get(sql, params, (err, result) => {
                if(err) {
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

module.exports = RegisterDao;
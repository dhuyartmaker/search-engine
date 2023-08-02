const mongoose = require('mongoose');
const overwriteDefaultConfig = require('../src/config/config.json');
const configDefault = {
}

const config = {
    config: {
        ...configDefault,
        ...overwriteDefaultConfig,
    }
}

const connectString = config.config.db;

class Database {
    async connect() {
        return new Promise((resolve) => {
            if ("dev") {
                mongoose.set("debug", false)
            }
            mongoose.connect(connectString, {
                maxPoolSize: 50
            }).then(res => {
                console.log("Connect Success!!")
                resolve(res)
            })
                .catch(error => console.log("Connect error: ", error));
        })
    }

    static getInstance() {
        if (!this.instance) {
            Database.instance = new Database()
        }
        return this.instance;
    }
}

const instanceMongoDb = Database.getInstance()
module.exports = instanceMongoDb;
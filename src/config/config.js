const overwriteDefaultConfig = require('./config.json');

const configDefault = {
}
const env = process.env.NODE_ENV || "pro";
console.log("=env=", env)
module.exports = {
    config: {
        ...configDefault,
        ...overwriteDefaultConfig,
    }
}
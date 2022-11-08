/** Database setup for BizTime. */

const { Client } = require("pg")
let DB_URL
if (process.env.NODE_ENV === "test") {
    DB_URL = 'postgresql:///biztime_test';
} else { DB_URL = 'postgresql://postgres:postgres@localhost:5432/biztime' }

let db = new Client({
    connectionString: DB_URL
})

db.connect()

module.exports = db
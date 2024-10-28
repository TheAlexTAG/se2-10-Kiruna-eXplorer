import { Database } from "sqlite3";
const sqlite = require("sqlite3");


let env = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : "development"

const dbFilePath = env === "test" ? "./src/db/testdb.db" : "./src/db/db.db"

const db: Database = new sqlite.Database(dbFilePath, (err: Error | null) => {
    if (err) throw err
    db.run("PRAGMA foreign_keys = ON")
})

export default db;

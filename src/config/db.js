const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "database", "app.db");
const schemaPath = path.join(__dirname, "..", "database", "schema.sql");

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, "utf8");
    db.exec(schema);
}

module.exports = db;

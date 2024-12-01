import mariadb from "mariadb"

const db= mariadb.createPool(
    {
        host: 'localhost',
        user: 'root',
        password: "root",
        database: 'kiruna_explorer',
        connectionLimit: 10}
    )

async function testConnection(): Promise<void> {
    let conn;
    try {
        conn = await db.getConnection();
        console.log("MariaDB connected");
    } catch (err: any) {
        console.error("Failed to connect to MariaDB:", err);
    } finally {
        await conn?.release();
    }
}


export default db;
export {testConnection};

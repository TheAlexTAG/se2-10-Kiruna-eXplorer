import mariadb from "mariadb";
import { config } from 'dotenv';
config();
const db= mariadb.createPool(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT? parseInt(process.env.DB_PORT, 10): undefined,
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

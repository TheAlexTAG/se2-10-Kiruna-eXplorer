import mariadb, {Pool} from "mariadb"

const db : {pool: Pool} = {
    pool: mariadb.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'kiruna_explorer',
        port: 3306,
        connectionLimit: 10
    })
}

async function testConnection(): Promise<void> {
    let conn;
    try {
        conn = await db.pool.getConnection();
        console.log("MariaDB connected");
    } catch (err) {
        console.error("Failed to connect to MariaDB:", err);
    } finally {
        if (conn) conn.release();
    }
}


export default db;
export {testConnection};

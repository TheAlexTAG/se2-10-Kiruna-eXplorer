import db from "./db";

async function cleanup(): Promise<void> {
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.query('SET FOREIGN_KEY_CHECKS = 0', []);
        const tables = await conn.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name!= 'user';
          `)
        for (const table of tables) {
            await conn.query(`DELETE FROM \`${table.table_name}\`;`);
        }

        for (const table of tables) {
            await conn.query(`ALTER TABLE \`${table.table_name}\` AUTO_INCREMENT = 1;`);
        }

        await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
        await conn.commit();
        
        return;
    } catch(err: any) {

        await conn?.rollback()
        throw err;
    } finally {
        conn?.release();
    }
}

export {cleanup};
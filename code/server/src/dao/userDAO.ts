import { Role, User } from "../components/user";
import db from "../db/db";
import crypto from "crypto";

/* Sanitize input */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class UserDAO {
    /**
     * Returns a user object from the database based on the id.
     * @param id The id of the user to retrieve
     * @returns A Promise that resolves the information of the requested user
    */
    async getUserById(id: number): Promise<any> {
        let conn;

        try {
            conn = await db.getConnection();
            const sql = "SELECT * FROM user WHERE userID = ?";

            const result = await conn.query(sql, [id]);
            if (!result || result.length === 0){
                return({ error: "User not found."});
            }
            const user = new User(+DOMPurify.sanitize(result[0].userID),DOMPurify.sanitize(result[0].username), DOMPurify.sanitize(result[0].role) as Role);
            return user;
            
        } catch(err: any) {
            console.error(err);
            throw err;
        } finally {
            await conn?.release();
        }
    }

    /**
     * Returns a user object from the database based on the username and password.
     * @param username The username of the user to retrieve
     * @param password The password of the user to retrieve
     * @returns A Promise that resolves the information of the requested user
    */
    async getUser(username: string, password: string): Promise<any> {
        let conn;

        try {
            conn = await db.getConnection();
            const sql = "SELECT * FROM user WHERE username = ?";

            const result = await conn.query(sql, [username]);
            if (!result || result.length === 0) {
                return false;
            }
            const spy= await this.verifyPassword(password, result[0].salt, result[0].password);
            
            return spy ? new User(+DOMPurify.sanitize(result[0].userID), DOMPurify.sanitize(result[0].username), DOMPurify.sanitize(result[0].role) as Role) : false;
        } catch(err: any) {
            throw err;
        } finally {
            await conn?.release();
        }
    };

    verifyPassword(password: string, salt: string, dbPwd: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            crypto.scrypt(password, salt, 32, (err: Error | null, hashedPassword: Buffer) => {
                if (err) {
                    return reject(err);
                }
                if (!crypto.timingSafeEqual(Buffer.from(dbPwd, "hex"), hashedPassword)) {
                    return resolve(false);
                }
                return resolve(true);
            }
          );
        }
      );
    };
}

export { UserDAO };
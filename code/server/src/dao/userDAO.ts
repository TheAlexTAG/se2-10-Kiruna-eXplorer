import { promisify } from "util";
import { User } from "../components/user";
import db from "../db/db";
import { error } from "console";

const crypto = require("crypto");

/* Sanitize input */
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
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
        const sql = "SELECT * FROM user WHERE userID = ?"
        conn = await db.pool.getConnection();
        let result = await conn.query(sql, [id]);
        if (result.length === 0) return({ error: "User not found."});
        const user = new User(DOMPurify.sanitize(result[0].userID),DOMPurify.sanitize(result[0].username),DOMPurify.sanitize(result[0].role))
        return user;
    } catch(err) {
        console.error(error);
        throw err;
    } finally {
        conn?.release();
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
        const sql = "SELECT * FROM user WHERE username = ?";
        conn = await db.pool.getConnection();
        let result = await conn.query(sql, [username]);
        if (result.length === 0) return false;
        const user = new User(DOMPurify.sanitize(result[0].userID),DOMPurify.sanitize(result[0].username),DOMPurify.sanitize(result[0].role))
        const scryptAsync = promisify(crypto.scrypt);
        const hashedPassword = await scryptAsync(password, result[0].salt, 32);
        if (!crypto.timingSafeEqual(Buffer.from(result[0].password, "hex"), hashedPassword)) {
            return false;
        }
        return user;
    } catch(err) {
        throw err;
    } finally {
        conn?.release();
    }
  }
}

export { UserDAO };
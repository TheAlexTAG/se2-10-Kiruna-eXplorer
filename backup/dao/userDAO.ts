import { User } from "../components/user";
import db from "../db/db";

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
  getUserById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM user WHERE userID = ?";
      db.get(sql, [id], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } 
        else if (row === undefined) {
          resolve({ error: "User not found." });
        } 
        else {
          const user = new User(DOMPurify.sanitize(row.userID),DOMPurify.sanitize(row.username),DOMPurify.sanitize(row.role));
          resolve(user);
        }
      });
    });
  }

  /**
   * Returns a user object from the database based on the username and password.
   * @param username The username of the user to retrieve
   * @param password The password of the user to retrieve
   * @returns A Promise that resolves the information of the requested user
   */
  getUser(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM user WHERE username = ?";
      db.get(sql, [username], (err: Error | null, row: any) => {
        if (err) {
          return reject(err);
        } 
        else if (row === undefined) {
          return resolve(false);
        }
        const user = new User(DOMPurify.sanitize(row.userID),DOMPurify.sanitize(row.username),DOMPurify.sanitize(row.role));

        crypto.scrypt(password,row.salt,32,(err: Error | null, hashedPassword: Buffer) => {
            if (err) {
              return reject(err);
            }
            if ( !crypto.timingSafeEqual(Buffer.from(row.password, "hex"), hashedPassword)) {
              return resolve(false);
            }
            return resolve(user);
          }
        );
      });
    });
  }
}

export { UserDAO };

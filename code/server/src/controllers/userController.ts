import { UserDAO } from "../dao/userDAO";

class UserController {
    private dao: UserDAO;

    constructor() {
        this.dao = new UserDAO();
    }

    /**
     * Returns a user object from the database based on the id.
     * @param id The id of the user to retrieve
     * @returns A Promise that resolves the information of the requested user
    */
    async getUserById(id: number): Promise<any> {
        return await this.dao.getUserById(id);
    }

    /**
     * Returns a user object from the database based on the username and password.
     * @param username The username of the user to retrieve
     * @param password The password of the user to retrieve
     * @returns A Promise that resolves the information of the requested user
    */
    async getUser(username: string, password: string): Promise<any> {
        return await this.dao.getUser(username,password);
    }
}

export {UserController};
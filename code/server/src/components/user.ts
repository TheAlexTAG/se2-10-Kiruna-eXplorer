/**
 * Represents a user in the system.
 */
class User {
    id: number
    username: string
    role: Role

    /**
     * Creates a new instance of the User class.
     * @param id - The user ID.
     * @param username - The username of the user. This is unique for each user.
     * @param role - The role of the user. This can be "Manager" or "Officer".
     */
    constructor(id: number, username: string, role: Role) {
        this.id = id;
        this.username = username;
        this.role = role
    }
}

/**
 * Represents the role of a user.
 * The values present in this enum are the only valid values for the role of a user.
 */
enum Role {
    URBAN_PLANNER = "Urban Planner",
    URBAN_DEVELOPER = "Urban Developer",
    ADMIN= "Admin"
}

export { User, Role }
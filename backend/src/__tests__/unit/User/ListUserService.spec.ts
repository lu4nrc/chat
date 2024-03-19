import faker from "jabber";
import User from "../../../models/User";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import ListUsersService from "../../../services/UserServices/ListUsersService";
import { disconnect, truncate } from "../../utils/database";

const Faker = new faker();

describe("User", () => {
    beforeEach(async () => {
        await truncate();
    });

    afterEach(async () => {
        await truncate();
    });

    afterAll(async () => {
        await disconnect();
    });

    it("should be able to list users", async () => {
        await CreateUserService({
            name: Faker.createFullName(),
            email: Faker.createEmail(),
            password: Faker.createWord(10)
        });

        const response = await ListUsersService({
            pageNumber: 1
        });

        expect(response).toHaveProperty("users");
        expect(response.users[0]).toBeInstanceOf(User);
    });
});

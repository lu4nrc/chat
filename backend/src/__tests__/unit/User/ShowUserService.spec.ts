import faker from "jabber";
import AppError from "../../../errors/AppError";
import User from "../../../models/User";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import ShowUserService from "../../../services/UserServices/ShowUserService";
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

    it("should be able to find a user", async () => {
        const newUser = await CreateUserService({
            name: Faker.createFullName(),
            email: Faker.createEmail(),
            password: Faker.createWord(10)
        });

        const user = await ShowUserService(newUser.id);

        expect(user).toHaveProperty("id");
        expect(user).toBeInstanceOf(User);
    });

    it("should not be able to find a inexisting user", async () => {
        expect(ShowUserService(Math.random())).rejects.toBeInstanceOf(
            AppError
        );
    });
});

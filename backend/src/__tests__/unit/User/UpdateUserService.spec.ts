import faker from "jabber";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import UpdateUserService from "../../../services/UserServices/UpdateUserService";
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

        const updatedUser = await UpdateUserService({
            userId: newUser.id,
            userData: {
                name: "New name",
                email: "newmail@email.com"
            }
        });

        expect(updatedUser).toHaveProperty("name", "New name");
        expect(updatedUser).toHaveProperty("email", "newmail@email.com");
    });

    it("should not be able to updated a inexisting user", async () => {
        const userId = Math.random();
        const userData = {
            name: Faker.createFullName(),
            email: Faker.createEmail(),
        };

        expect(UpdateUserService({ userId, userData })).rejects.toBeInstanceOf(
            AppError
        );
    });

    it("should not be able to updated an user with invalid data", async () => {
        const newUser = await CreateUserService({
            name: Faker.createFullName(),
            email: Faker.createEmail(),
            password: Faker.createWord(10)
        });

        const userId = newUser.id;
        const userData = {
            name: Faker.createFullName(),
            email: "test.worgn.email"
        };

        expect(UpdateUserService({ userId, userData })).rejects.toBeInstanceOf(
            AppError
        );
    });
});

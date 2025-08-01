import faker from "jabber";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
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

    it("should be able to create a new user", async () => {
        const user = await CreateUserService({
            name: Faker.createFullName(),
            email: Faker.createEmail(),
            password: Faker.createWord(10)
        });

        expect(user).toHaveProperty("id");
    });

    it("should not be able to create a user with duplicated email", async () => {
        await CreateUserService({
            name: Faker.createFullName(),
            email: "teste@sameemail.com",
            password: Faker.createWord(10)
        });

        try {
            await CreateUserService({
                name: Faker.createFullName(),
                email: "teste@sameemail.com",
                password: Faker.createWord(10)
            });
        } catch (err: any) {
            expect(err).toBeInstanceOf(AppError);
            expect(err.statusCode).toBe(400);
        }
    });
});

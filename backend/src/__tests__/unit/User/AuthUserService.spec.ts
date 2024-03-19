import faker from "jabber";
import AppError from "../../../errors/AppError";
import AuthUserService from "../../../services/UserServices/AuthUserService";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import { disconnect, truncate } from "../../utils/database";

const Faker = new faker();
describe("Auth", () => {
    beforeEach(async () => {
        await truncate();
    });

    afterEach(async () => {
        await truncate();
    });

    afterAll(async () => {
        await disconnect();
    });

    it("should be able to login with an existing user", async () => {
        const password = Faker.createWord(10);
        const email = Faker.createEmail();

        await CreateUserService({
            name: Faker.createFullName(),
            email,
            password
        });

        const response = await AuthUserService({
            email,
            password
        });

        expect(response).toHaveProperty("token");
    });

    it("should not be able to login with not registered email", async () => {
        try {
            await AuthUserService({
                email: Faker.createEmail(),
                password: Faker.createWord(10)
            });

        } catch (err: any) {
            expect(err).toBeInstanceOf(AppError);
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("ERR_INVALID_CREDENTIALS");
        }
    });


    it("should not be able to login with incorret password", async () => {
        await CreateUserService({
            name: Faker.createFullName(),
            email: "mail@test.com",
            password: Faker.createWord(10)
        });

        try {
            await AuthUserService({
                email: "mail@test.com",
                password: Faker.createWord(10)
            });
        } catch (err: any) {
            expect(err).toBeInstanceOf(AppError);
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("ERR_INVALID_CREDENTIALS");
        }
    });
});

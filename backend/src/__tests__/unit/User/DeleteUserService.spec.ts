import faker from "jabber";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import DeleteUserService from "../../../services/UserServices/DeleteUserService";
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

    it("should be delete a existing user", async () => {
        const { id } = await CreateUserService({
            name: Faker.createFullName(),
            email: Faker.createEmail(),
            password: Faker.createWord(10)
        });

        expect(DeleteUserService(id)).resolves.not.toThrow();
    });

    it("to throw an error if tries to delete a non existing user", async () => {
        expect(DeleteUserService(1)).rejects.toBeInstanceOf(
            AppError
        );
    });
});

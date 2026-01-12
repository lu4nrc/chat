import { faker } from "@faker-js/faker";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import UpdateUserService from "../../../services/UserServices/UpdateUserService";
import { disconnect, truncate } from "../../utils/database";

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
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.string.alpha({ length: 10 })
    });

    const updatedUser = await UpdateUserService({
      userId: newUser.id,
      userData: {
        name: "New name",
        email: "newmail@email.com",
        imageUrl: "fix: here"
      }
    });

    expect(updatedUser).toHaveProperty("name", "New name");
    expect(updatedUser).toHaveProperty("email", "newmail@email.com");
  });

  it("should not be able to updated a inexisting user", async () => {
    const userId = Math.random();
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      imageUrl: "fix: here"
    };

    expect(UpdateUserService({ userId, userData })).rejects.toBeInstanceOf(
      AppError
    );
  });

  it("should not be able to updated an user with invalid data", async () => {
    const newUser = await CreateUserService({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.string.alpha({ length: 10 })
    });

    const userId = newUser.id;
    const userData = {
      name: faker.person.fullName(),
      email: "test.worgn.email",
      imageUrl: "fix: here"
    };

    expect(UpdateUserService({ userId, userData })).rejects.toBeInstanceOf(
      AppError
    );
  });
});

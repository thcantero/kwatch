const request = require("supertest");
const app = require("../app");
const { db } = require("../config/db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./common");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /auth/register", function () {
  test("works for new user", async function () {
    const resp = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "new",
        firstName: "New",
        lastName: "User",
        password: "password",
        email: "new@email.com"
      });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body.data).toHaveProperty("token");
    expect(resp.body.data.user.username).toEqual("new");
  });

  test("fails with duplicate username", async function () {
    const resp = await request(app)
      .post("/api/v1/auth/register")
      .send({
        username: "u1", // Already exists from commonBeforeAll
        firstName: "New",
        lastName: "User",
        password: "password",
        email: "dup@email.com"
      });
    expect(resp.statusCode).toEqual(400); // BadRequest
  });
});

describe("POST /auth/login", function () {
  test("works with correct credentials", async function () {
    const resp = await request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "u1",
        password: "password1"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.data).toHaveProperty("token");
  });

  test("unauth with invalid password", async function () {
    const resp = await request(app)
      .post("/api/v1/auth/login")
      .send({
        username: "u1",
        password: "wrongpassword"
      });
    expect(resp.statusCode).toEqual(401);
  });
});
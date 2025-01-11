const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const User = require("../../models/user");
const userRoutes = require("./user");
const auth = require("../../middleware/auth");
const role = require("../../middleware/role");
const { ROLES } = require("../../constants");

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

jest.mock("../../middleware/auth");
jest.mock("../../middleware/role");

describe("User Routes", () => {
  beforeAll(async () => {
    const url = `mongodb://127.0.0.1/user_test_db`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe("GET /search", () => {
    it("should search users", async () => {
      auth.mockImplementation((req, res, next) => {
        req.user = { _id: "testUserId", role: ROLES.Admin };
        next();
      });
      role.check.mockImplementation(() => (req, res, next) => next());

      const res = await request(app)
        .get("/api/users/search")
        .query({ search: "test" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("users");
    });
  });

  describe("GET /", () => {
    it("should fetch users with pagination", async () => {
      auth.mockImplementation((req, res, next) => {
        req.user = { _id: "testUserId" };
        next();
      });

      const res = await request(app)
        .get("/api/users")
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("users");
      expect(res.body).toHaveProperty("totalPages");
      expect(res.body).toHaveProperty("currentPage");
      expect(res.body).toHaveProperty("count");
    });
  });

  describe("GET /me", () => {
    it("should fetch authenticated user profile", async () => {
      auth.mockImplementation((req, res, next) => {
        req.user = { _id: "testUserId" };
        next();
      });

      const res = await request(app).get("/api/users/me");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
    });
  });

  describe("PUT /", () => {
    it("should update authenticated user profile", async () => {
      auth.mockImplementation((req, res, next) => {
        req.user = { _id: "testUserId" };
        next();
      });

      const res = await request(app)
        .put("/api/users")
        .send({ profile: { firstName: "Updated" } });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty(
        "message",
        "Your profile is successfully updated!"
      );
      expect(res.body.user).toHaveProperty("firstName", "Updated");
    });
  });
});

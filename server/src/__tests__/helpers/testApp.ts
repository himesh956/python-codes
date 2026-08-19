/**
 * Test env vars must be set before app.ts (which reads env.ts at
 * import time) is imported anywhere — including transitively via
 * supertest requests in test files. This runs first in every test
 * file that imports it.
 */
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test_jwt_secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test_jwt_refresh_secret";
process.env.MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/test";
process.env.CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

import app from "../../app";

export { app };
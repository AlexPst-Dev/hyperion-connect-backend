// Tests run against a real MySQL database (see README, "Tests").
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "jwt-secret-for-tests-only";
process.env.JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || "reset-secret-for-tests-only";

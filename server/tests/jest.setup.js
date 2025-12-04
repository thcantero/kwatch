// Import the mock file 
jest.mock("../services/tmdb", () => {
    return require("../services/__mocks__/tmdb");
});

// Slightly higher timeout for DB tests (optional but good for safety)
jest.setTimeout(10000);
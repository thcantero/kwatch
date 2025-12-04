// when asking for ../services/tmdb use in __mocks__ instead
jest.mock("../services/tmdb");

// Slightly higher timeout for DB tests (optional but good for safety)
jest.setTimeout(10000);
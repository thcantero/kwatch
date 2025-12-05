const TMDBService = jest.requireActual("../services/tmdb");

// We only run these tests if we explicitly ask for them
// or skip them if we are in a CI environment without keys.
const describeIfKey = process.env.TMDB_API_KEY ? describe : describe.skip;

describeIfKey("TMDB Service (Live Connection)", function () {
    // Increase timeout because real network requests are slow
    jest.setTimeout(30000); 

    test("can fetch popular movies", async function () {
        const data = await TMDBService.getPopularMovies();
        
        // We don't check for specific titles (they change), 
        // but we check the STRUCTURE of the response.
        expect(data).toHaveProperty("results");
        expect(Array.isArray(data.results)).toBe(true);
        expect(data.results.length).toBeGreaterThan(0);
        
        // Verify a real movie structure
        const movie = data.results[0];
        expect(movie).toHaveProperty("id");
        expect(movie).toHaveProperty("title");
    });

    test("can search for 'Glory'", async function () {
        const data = await TMDBService.searchMulti("Glory");
        
        expect(data.results.length).toBeGreaterThan(0);
        // We expect at least one result to actually match the query
        const hasMatch = data.results.some(item => 
            (item.title && item.title.includes("Glory")) || 
            (item.name && item.name.includes("Glory"))
        );
        expect(hasMatch).toBe(true);
    });

    test("handles invalid API key gracefully", async function () {
        // Temporarily break the key to test error handling
        const originalKey = process.env.TMDB_API_KEY;

        try {
            // 1. Just overwrite the key. The service reads it dynamically now.
            process.env.TMDB_API_KEY = "BAD_KEY";

            await TMDBService.getPopularMovies();
            throw new Error("API call succeeded but should have failed");
        } catch (err) {
            // 2. Check for the error YOUR service throws
            expect(err.message).toBe("Failed to fetch from external provider");
            expect(err.statusCode).toBe(400);
        } finally {
            process.env.TMDB_API_KEY = originalKey;
        }
    });
});
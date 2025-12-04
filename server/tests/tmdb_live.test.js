const TMDBService = require("../services/tmdb");

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
        process.env.TMDB_API_KEY = "BAD_KEY";

        try {
            await TMDBService.getPopularMovies();
            fail("Should have thrown an error");
        } catch (err) {
            expect(err.statusCode).toBe(400); // Or whatever your BadRequestResponse code is
        } finally {
            // Restore key so we don't break other tests
            process.env.TMDB_API_KEY = originalKey;
        }
    });
});
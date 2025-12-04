
const { db } = require("./config/db");
const Genre = require("./models/Genre");
const Show = require("./models/Show");
const Actor = require("./models/Actor"); 

const seed = async () => {
    try {
        console.log("🌱 Starting Seed Process...");

        // 1. Genres
        console.log("Checking Genres...");
        const genres = await Genre.getAll();
        console.log(`✅ ${genres.length} Genres ready.`);

        // 2. Shows
        console.log("Checking Shows...");
        const shows = await Show.getPopular(50);
        console.log(`✅ ${shows.length} Shows ready.`);

        // 3. Actors
        console.log("Checking Actors...");
        const actors = await Actor.getPopular(20);
        console.log(`✅ ${actors.length} Actors ready.`);
        
        console.log("🎉 Seeding Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Failed:", err);
        process.exit(1);
    }
};

seed();
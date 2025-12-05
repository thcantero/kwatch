-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- SHOWS (Handle Movies & TV)
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER NOT NULL, 
    media_type VARCHAR(10) CHECK (media_type IN ('movie', 'tv')) NOT NULL, -- 'movie' or 'tv'
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    release_year INTEGER,
    poster_url TEXT,
    origin_country TEXT,
    runtime INTEGER, -- For movies (in minutes)
    total_episodes INTEGER, -- For TV (can be NULL for movies)
    vote_average FLOAT,
    popularity FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tmdb_id, media_type) -- ID + Type must be unique
);

-- ACTORS
CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    photo_url TEXT,
    tmdb_id INTEGER UNIQUE,
    popularity FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- GENRES
CREATE TABLE genres(
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER UNIQUE NOT NULL,
    genre VARCHAR(100) UNIQUE NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SHOWS & ACTORS (Junction)
CREATE TABLE shows_actors(
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
    character_name VARCHAR(255),
    PRIMARY KEY (show_id, actor_id)
);

-- SHOWS & GENRES (Junction)
CREATE TABLE shows_genres(
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, genre_id)
);

-- EPISODES (Only for TV Shows)
CREATE TABLE episodes(
    id SERIAL PRIMARY KEY,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    season_number INTEGER DEFAULT 1, -- Season Number
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    duration INTEGER,
    air_date DATE,
    tmdb_id INTEGER, 
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(show_id, season_number, episode_number) -- Unique per show
);

-- WATCHLIST
CREATE TABLE watchlist(
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN 
                ('watching', 'completed', 'to_watch', 'dropped')),
    current_episode INTEGER DEFAULT 0, -- Relevant for TV only
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    favorite BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, show_id)
);

-- REVIEWS
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    title VARCHAR(255),
    content TEXT,
    contains_spoilers BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, show_id)
);

-- REVIEW LIKES
CREATE TABLE review_likes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, review_id)
);

-- FOLLOWS
CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CHECK (follower_id != followed_id)
);

-- LIKES (Quick "Heart" for shows)
CREATE TABLE likes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, show_id)
);

-- COMMENTS (On Reviews)
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ACTOR_FOLLOWS
CREATE TABLE actor_follows (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, actor_id)
);

-- STREAMING CACHE (New Addition for "Where to Watch")
CREATE TABLE streaming_cache (
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    country_code CHAR(2), -- e.g. 'US'
    provider_name VARCHAR(50), -- e.g. 'Netflix'
    provider_url VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (show_id, country_code, provider_name)
);

-- INDEXES
CREATE INDEX idx_shows_tmdb_combo ON shows(tmdb_id, media_type); -- Critical for lookups
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_show ON watchlist(show_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_show ON reviews(show_id);
CREATE INDEX idx_shows_popularity ON shows(popularity DESC);
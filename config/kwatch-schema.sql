--USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

--SHOWS
CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    release_year INTEGER,
    poster_url TEXT,
    total_episodes INTEGER,
    vote_average FLOAT,
    popularity FLOAT,
    tmdb_id INTEGER UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

--ACTORS
CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    photo_url TEXT,
    tmdb_id INTEGER UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

--GENRES
CREATE TABLE genres(
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER UNIQUE NOT NULL,
    genre VARCHAR(100) UNIQUE NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--SHOWS & ACTORS (junction table many-to-many)
CREATE TABLE shows_actors(
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
    character_name VARCHAR(255),
    PRIMARY KEY (show_id, actor_id)
);

--SHOWS & GENRES (junction table many-to-many)
CREATE TABLE shows_genres(
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, genre_id)
);

--EPISODES
CREATE TABLE episodes(
    id SERIAL PRIMARY KEY,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    duration INTEGER, -- in minutes
    air_date DATE,
    tmdb_id INTEGER UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(show_id, episode_number)
);

--WATCHLIST
CREATE TABLE watchlist(
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN 
                ('watching', 'completed', 'to_watch', 'dropped')),
    current_episode INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    favorite BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, show_id)
);

--REVIEWS
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
    UNIQUE(user_id, show_id) -- Each user can only review a show once
);

-- REVIEW LIKES (for liking reviews)
CREATE TABLE review_likes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, review_id)
);

-- FOLLOWS (user to user follows)
CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, followed_id),
    CHECK (follower_id != followed_id) -- Prevent self-follows
);

-- LIKES (user likes for shows)
CREATE TABLE likes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, show_id)
);

-- COMMENTS (on reviews)
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_show ON watchlist(show_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_show ON reviews(show_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followed ON follows(followed_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_show ON likes(show_id);
CREATE INDEX idx_shows_actors_show ON shows_actors(show_id);
CREATE INDEX idx_shows_actors_actor ON shows_actors(actor_id);
CREATE INDEX idx_episodes_show ON episodes(show_id);
CREATE INDEX idx_shows_genres_show ON shows_genres(show_id);
CREATE INDEX idx_shows_genres_genre ON shows_genres(genre_id);
CREATE INDEX idx_shows_tmdb_id ON shows(tmdb_id);
CREATE INDEX idx_actors_tmdb_id ON actors(tmdb_id);
CREATE INDEX idx_episodes_tmdb_id ON episodes(tmdb_id);
CREATE INDEX idx_shows_popularity ON shows(popularity DESC);
CREATE INDEX idx_shows_release_year ON shows(release_year DESC);
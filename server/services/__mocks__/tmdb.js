const TMDBService = {
  getPopularMovies: jest.fn().mockResolvedValue({
    results: [
      { id: 101, title: "Mock Movie 1", overview: "Test 1", popularity: 100, poster_path: "/img1.jpg", release_date: "2024-01-01" },
      { id: 102, title: "Mock Movie 2", overview: "Test 2", popularity: 90, poster_path: "/img2.jpg", release_date: "2024-01-01" },
      { id: 103, title: "Mock Movie 3", overview: "Test 3", popularity: 80, poster_path: "/img3.jpg", release_date: "2024-01-01" }
    ]
  }),
  getPopularTV: jest.fn().mockResolvedValue({
    results: [
      { id: 201, name: "Mock TV 1", overview: "Test TV 1", popularity: 85, poster_path: "/tv1.jpg", first_air_date: "2024-01-01" },
      { id: 202, name: "Mock TV 2", overview: "Test TV 2", popularity: 75, poster_path: "/tv2.jpg", first_air_date: "2024-01-01" }
    ]
  }),
  getMovieGenres: jest.fn().mockResolvedValue({ genres: [{ id: 1, name: "Action" }] }),
  getTVGenres: jest.fn().mockResolvedValue({ genres: [{ id: 2, name: "Comedy" }] }),
  getPopularPeople: jest.fn().mockResolvedValue({
    results: [
      { id: 303, name: "Mock Actor", popularity: 50, profile_path: "/actor.jpg" }
    ]
  }),
  searchMulti: jest.fn().mockResolvedValue({
    results: [
        { id: 999, media_type: 'movie', title: "The Glory", overview: "Mock Search", popularity: 100, poster_path: "/glory.jpg", release_date: "2022-12-30" }
    ]
  }),

  getCredits: jest.fn().mockResolvedValue({
    cast: [
        { id: 501, name: "Mock Actor 1", popularity: 50, profile_path: "/p1.jpg" }
    ]
  })
};

module.exports = TMDBService;
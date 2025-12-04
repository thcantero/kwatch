
const TMDBService = {
  getPopularMovies: jest.fn().mockResolvedValue({
    results: [
      { id: 101, title: "Mock Movie", overview: "Test overview", popularity: 100, poster_path: "/img.jpg" }
    ]
  }),
  getPopularTV: jest.fn().mockResolvedValue({
    results: [
      { id: 202, name: "Mock TV", overview: "Test TV", popularity: 90, poster_path: "/tv.jpg" }
    ]
  }),
  getMovieGenres: jest.fn().mockResolvedValue({
    genres: [{ id: 1, name: "Action" }]
  }),
  getTVGenres: jest.fn().mockResolvedValue({
    genres: [{ id: 2, name: "Comedy" }]
  }),
  getPopularPeople: jest.fn().mockResolvedValue({
    results: [
      { id: 303, name: "Mock Actor", popularity: 50, profile_path: "/actor.jpg" }
    ]
  }),
  searchMulti: jest.fn().mockResolvedValue({
    results: []
  })
};

module.exports = TMDBService;
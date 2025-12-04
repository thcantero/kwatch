const TMDBService = {
  // Return 3 Movies
  getPopularMovies: jest.fn().mockResolvedValue({
    results: [
      { id: 101, title: "Mock Movie 1", overview: "Test 1", popularity: 100, poster_path: "/img1.jpg", release_date: "2024-01-01" },
      { id: 102, title: "Mock Movie 2", overview: "Test 2", popularity: 90, poster_path: "/img2.jpg", release_date: "2023-05-01" },
      { id: 103, title: "Mock Movie 3", overview: "Test 3", popularity: 80, poster_path: "/img3.jpg", release_date: "2022-10-01" }
    ]
  }),
  // Return 2 TV Shows
  getPopularTV: jest.fn().mockResolvedValue({
    results: [
      { id: 201, name: "Mock TV 1", overview: "Test TV 1", popularity: 85, poster_path: "/tv1.jpg", first_air_date: "2020-01-01" },
      { id: 202, name: "Mock TV 2", overview: "Test TV 2", popularity: 75, poster_path: "/tv2.jpg", first_air_date: "2021-01-01" }
    ]
  }),
  // (Total 3 + 2 = 5 shows, which matches your test expectation)

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
  
  //SearchMulti method
  searchMulti: jest.fn().mockImplementation((query) => {
    console.log(`Mock searchMulti called with: "${query}"`);
    
    if (query === "Glory") {
      return Promise.resolve({
        page: 1,
        results: [
          { 
            id: 123, 
            title: "Glory Road", 
            name: null,
            media_type: "movie",
            overview: "A story of glory",
            popularity: 50,
            poster_path: "/glory.jpg",
            release_date: "2006-01-13"
          }
        ],
        total_pages: 1,
        total_results: 1
      });
    }
    
    // Return empty for other queries (this code is reachable now)
    return Promise.resolve({ 
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    });
  })  
};    


module.exports = TMDBService;
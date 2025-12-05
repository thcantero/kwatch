import { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom'; // URL params hook
import { searchShows } from '../services/showService';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    // Update URL without reloading page (so users can copy/paste the link)
    setSearchParams({ q: query });

    try {
      const data = await searchShows(query);
      setResults(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch search results.');
    } finally {
      setLoading(false);
    }
  };

  // Run search automatically if user lands here with ?q=Something
  useEffect(() => {
    if (initialQuery) {
        handleSearch();
    }
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Search K-Dramas</h2>
      
      {/* Search Bar */}
      <Form onSubmit={handleSearch} className="mb-5">
        <Row>
          <Col md={8} lg={6}>
            <Form.Control
              type="search"
              placeholder="Search by title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control-lg"
            />
          </Col>
          <Col md={4}>
            <button type="submit" className="btn btn-primary btn-lg w-100">
              Search
            </button>
          </Col>
        </Row>
      </Form>

      {/* Loading / Error States */}
      {loading && <Spinner animation="border" className="d-block mx-auto" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Results Grid */}
      {!loading && hasSearched && (
        <>
          <h4 className="mb-3">
            {results.length > 0 
              ? `Found ${results.length} result(s)` 
              : 'No results found.'}
          </h4>
          
          <Row xs={1} md={3} lg={4} className="g-4">
            {results.map((show) => (
              <Col key={show.id}>
                <Card className="h-100 shadow-sm">
                  <Link to={`/shows/${show.id || show.tmdb_id}`}>
                    <Card.Img 
                      variant="top" 
                      src={show.poster_url || "https://via.placeholder.com/500x750"} 
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                  </Link>
                  <Card.Body>
                    <Card.Title className="h6 text-truncate">
                        <Link to={`/shows/${show.id || show.tmdb_id}`} className="text-decoration-none text-dark">
                            {show.title}
                        </Link>
                    </Card.Title>
                    <small className="text-muted">
                        {show.release_year || 'N/A'} • {show.media_type?.toUpperCase()}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default Search;
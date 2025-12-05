import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { getPopularShows } from '../services/showService';
import { Link } from 'react-router-dom';

const Home = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        // This calls your backend: GET /api/v1/shows/popular
        const response = await getPopularShows();
        // Assuming your backend returns data in response.data or directly as an array
        // Adjust 'response.data' based on your exact backend structure
        setShows(response.data || response); 
      } catch (err) {
        console.error("Failed to fetch shows:", err);
        setError("Could not load shows. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

  if (loading) return (
    <Container className="d-flex justify-content-center mt-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
  );

  if (error) return (
    <Container className="mt-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Trending Now</h2>
      <Row xs={1} md={3} lg={4} className="g-4">
        {shows.map((show) => (
          <Col key={show.id}>
            <Card className="h-100 shadow-sm">
              <Link to={`/shows/${show.id}`}>
                <Card.Img 
                  variant="top" 
                  src={show.poster_url || "https://via.placeholder.com/500x750?text=No+Image"} 
                  alt={show.title}
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </Link>
              <Card.Body>
                <Card.Title className="h6 text-truncate">
                  <Link to={`/shows/${show.id}`} className="text-decoration-none text-dark">
                    {show.title}
                  </Link>
                </Card.Title>
                <Card.Text className="small text-muted">
                  {show.release_year} • Rating: {show.vote_average}/10
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;
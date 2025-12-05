import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getWatchlist } from '../services/watchlistService';

const Watchlist = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await getWatchlist();
        setShows(data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  if (shows.length === 0) return (
    <Container className="mt-5 text-center">
        <h3>Your Watchlist is empty</h3>
        <p>Go to the <Link to="/">Home Page</Link> to add some shows!</p>
    </Container>
  );

  return (
    <Container className="mt-4">
      <h2 className="mb-4">My Watchlist</h2>
      <Row xs={1} md={3} lg={4} className="g-4">
        {shows.map((item) => (
          <Col key={item.id}>
            <Card className="h-100 shadow-sm">
              <Link to={`/shows/${item.show_id || item.tmdb_id}`}>
                <Card.Img 
                  variant="top" 
                  src={item.poster_url || "https://via.placeholder.com/500x750"} 
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </Link>
              <Card.Body>
                <Card.Title className="h6 text-truncate">
                    {item.title}
                </Card.Title>
                <div className="d-flex justify-content-between align-items-center">
                    <Badge bg={
                        item.status === 'completed' ? 'success' : 
                        item.status === 'watching' ? 'primary' : 'secondary'
                    }>
                        {item.status}
                    </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Watchlist;
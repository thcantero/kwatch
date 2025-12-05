import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { getActorDetails } from '../services/actorService';

const ActorDetails = () => {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActor = async () => {
      try {
        const data = await getActorDetails(id);
        setActor(data);
      } catch (err) {
        console.error("Failed to load actor", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActor();
  }, [id]);

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (!actor) return <Container className="mt-5 text-center"><h3>Actor not found</h3></Container>;

  return (
    <Container className="mt-5 mb-5">
      <Row>
        {/* Left: Photo & Bio */}
        <Col md={4} className="mb-4">
          <img 
            src={actor.profile_path 
              ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` 
              : "https://via.placeholder.com/300x450"}
            alt={actor.name}
            className="img-fluid rounded shadow mb-3"
          />
          <h2 className="mb-2">{actor.name}</h2>
          <p className="text-muted">
            {actor.birthday && `Born: ${actor.birthday}`}
            {actor.place_of_birth && ` in ${actor.place_of_birth}`}
          </p>
          <p>{actor.biography || "No biography available."}</p>
        </Col>

        {/* Right: Filmography */}
        <Col md={8}>
          <h3 className="mb-4">Known For</h3>
          <Row xs={2} md={3} className="g-3">
            {actor.known_for?.map(show => (
              <Col key={show.id}>
                <Card className="h-100 shadow-sm border-0">
                  <Link to={`/shows/${show.id}`}>
                    <Card.Img 
                      variant="top" 
                      src={show.poster_path 
                        ? `https://image.tmdb.org/t/p/w200${show.poster_path}` 
                        : "https://via.placeholder.com/200x300"}
                      style={{ height: '220px', objectFit: 'cover' }}
                    />
                  </Link>
                  <Card.Body className="p-2">
                    <Card.Title className="h6 text-truncate mb-0">
                      <Link to={`/shows/${show.id}`} className="text-decoration-none text-dark">
                        {show.title || show.name}
                      </Link>
                    </Card.Title>
                    <small className="text-muted">
                        {show.media_type === 'movie' ? 'Movie' : 'TV'}
                        {show.vote_average ? ` • ⭐ ${show.vote_average.toFixed(1)}` : ''}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ActorDetails;
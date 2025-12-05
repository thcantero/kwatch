import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { getActorDetails, followActor, unfollowActor } from '../services/actorService';
import { useAuth } from '../context/AuthContext';

const ActorDetails = () => {
  const { id } = useParams(); // TMDB ID
  const { isAuthenticated } = useAuth();
  
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [localId, setLocalId] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchActor = async () => {
      try {
        const data = await getActorDetails(id);
        setActor(data);
        
        // FIX: Explicitly check and set these values
        if (data.is_following !== undefined) setIsFollowing(data.is_following);
        
        // IMPORTANT: The button needs this ID to work. 
        // If the user is logged in, the backend *should* return this.
        if (data.localId) setLocalId(data.localId);
        
      } catch (err) {
        console.error("Failed to load actor", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActor();
  }, [id]);

  const handleFollowToggle = async () => {
    // If we don't have a local ID yet, we can't follow.
    if (!localId) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Use TMDB ID (id from params) because that's what your route expects: /actors/:id/follow
        await unfollowActor(id); 
        setIsFollowing(false);
      } else {
        await followActor(id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
      alert("Action failed. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (!actor) return <Container className="mt-5 text-center"><h3>Actor not found</h3></Container>;

  return (
    <Container className="mt-5 mb-5">
      <Row>
        <Col md={4} className="mb-4">
          <img 
            src={actor.profile_path 
              ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` 
              : "https://via.placeholder.com/300x450"}
            alt={actor.name}
            className="img-fluid rounded shadow mb-3"
          />
          <h2 className="mb-2">{actor.name}</h2>
          
          {isAuthenticated && (
            <div className="d-grid gap-2 mb-3">
                <Button 
                    variant={isFollowing ? "outline-primary" : "primary"}
                    onClick={handleFollowToggle}
                    // Disable if processing OR if we somehow don't have a local ID yet
                    disabled={followLoading || !localId}
                >
                    {followLoading ? "Processing..." : (isFollowing ? "Unfollow Actor" : "Follow Actor")}
                </Button>
            </div>
          )}

          <p className="text-muted">
            {actor.birthday && `Born: ${actor.birthday}`}
            {actor.place_of_birth && ` in ${actor.place_of_birth}`}
          </p>
          <p>{actor.biography || "No biography available."}</p>
        </Col>

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
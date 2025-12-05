import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // We can create a specific service for this later, but direct call is fine for now
        // Assuming GET /api/v1/users/:id/stats exists or we calculate it
        // Based on your users.js route, let's try getting the user stats
        const response = await api.get(`/users/${user.id}/stats`);
        setStats(response.data.data || response.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfileData();
  }, [user]);

  if (!user) return <div className="text-center mt-5">Please log in.</div>;
  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user.username}&background=random&size=128`} 
                  alt="Profile" 
                  className="rounded-circle shadow"
                />
              </div>
              <h3>{user.username}</h3>
              <p className="text-muted">{user.email}</p>
              
              <hr />

              <div className="d-flex justify-content-around my-4">
                <div className="text-center">
                  <h5>{stats?.watchlist_count || 0}</h5>
                  <span className="text-muted small">Watchlist</span>
                </div>
                <div className="text-center">
                  <h5>{stats?.review_count || 0}</h5>
                  <span className="text-muted small">Reviews</span>
                </div>
                <div className="text-center">
                    <h5>{stats?.follower_count || 0}</h5>
                    <span className="text-muted small">Followers</span>
                </div>
                <div className="text-center">
                    <h5>{stats?.following_count || 0}</h5>
                    <span className="text-muted small">Following</span>
                </div>
                </div>

              <div className="d-grid gap-2">
                <button className="btn btn-outline-danger" onClick={logout}>
                  Log Out
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
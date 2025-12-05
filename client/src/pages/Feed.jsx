import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyFeed, getGlobalFeed } from '../services/feedService';

const Feed = () => {
  const { isAuthenticated } = useAuth();
  
  // State
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('global'); // 'global' or 'following'

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        let data = [];
        if (view === 'following' && isAuthenticated) {
          data = await getMyFeed();
        } else {
          data = await getGlobalFeed();
        }

        console.log("Feed Data:", data);
        
        setActivities(data || []);
      } catch (err) {
        console.error("Failed to load feed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [view, isAuthenticated]);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Community Activity</h2>
        
        {isAuthenticated && (
          <ButtonGroup>
            <Button 
              variant={view === 'global' ? 'primary' : 'outline-primary'}
              onClick={() => setView('global')}
            >
              Global
            </Button>
            <Button 
              variant={view === 'following' ? 'primary' : 'outline-primary'}
              onClick={() => setView('following')}
            >
              Following
            </Button>
          </ButtonGroup>
        )}
      </div>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : activities.length === 0 ? (
        <div className="text-center mt-5 text-muted">
          <h4>Nothing to see here yet!</h4>
          {view === 'following' && <p>Try following more users or switch to Global view.</p>}
        </div>
      ) : (
        <Row xs={1} md={2} className="g-4">
          {activities.map((act) => (
            <Col key={act.id}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <Link to={`/users/${act.user_id}`} className="fw-bold text-decoration-none">
                      {act.username}
                    </Link>
                    <span className="text-muted small ms-2">
                       reviewed 
                       <Link to={`/shows/${act.show_id}`} className="text-decoration-none ms-1">
                         {act.show_title}
                       </Link>
                    </span>
                  </div>
                  <small className="text-muted">{new Date(act.created_at).toLocaleDateString()}</small>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge bg={act.rating >= 8 ? 'success' : act.rating >= 5 ? 'warning' : 'danger'}>
                      Rating: {act.rating}/10
                    </Badge>
                  </div>
                  <Card.Text>"{act.content}"</Card.Text>
                </Card.Body>
                {act.poster_url && (
                    <Card.Footer className="bg-light p-0">
                        {/* Optional: Show a sliver of the poster or keep it text-only */}
                    </Card.Footer>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Feed;
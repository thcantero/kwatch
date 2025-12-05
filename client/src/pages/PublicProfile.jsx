import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, followUser, unfollowUser, getMyFollowing } from '../services/userService';

const PublicProfile = () => {
  const { id } = useParams(); // The ID of the user we are viewing
  const { user: currentUser } = useAuth(); // Me (Logged in user)
  
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await getUserProfile(id);
        setProfile(profileData);

        // Check if I am following this user
        if (currentUser && currentUser.id !== parseInt(id)) {
          const myFollowing = await getMyFollowing(currentUser.id);
          // Assuming myFollowing is an array of users
          const found = myFollowing.find(u => u.id === parseInt(id));
          setIsFollowing(!!found);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    setBtnLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
      } else {
        await followUser(id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
      alert("Action failed. Please try again.");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (!profile) return <Container className="mt-5 text-center"><h3>User not found</h3></Container>;

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm text-center p-4">
             <div className="mb-3">
                <img 
                  src={`https://ui-avatars.com/api/?name=${profile.username}&background=random&size=128`} 
                  alt={profile.username} 
                  className="rounded-circle shadow"
                />
              </div>
            <h2>{profile.username}</h2>
            <p className="text-muted">Member since {new Date(profile.created_at).getFullYear()}</p>
            
            {/* Don't show Follow button if viewing my own profile */}
            {currentUser && currentUser.id !== parseInt(id) && (
              <Button 
                variant={isFollowing ? "outline-secondary" : "primary"}
                onClick={handleFollowToggle}
                disabled={btnLoading}
                className="mb-3"
              >
                {btnLoading ? 'Processing...' : (isFollowing ? 'Unfollow' : 'Follow')}
              </Button>
            )}
            
            <hr />
            
            {/* Optional: Display their simple stats if available in profileData */}
            {/* This depends on what your getUserProfile backend returns */}
            <Row className="mt-3">
                <Col>
                    <h5>{profile.watchlist ? profile.watchlist.length : 0}</h5>
                    <small className="text-muted">In Watchlist</small>
                </Col>
            </Row>

          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicProfile;
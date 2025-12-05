import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Spinner, Form } from 'react-bootstrap';

// Context
import { useAuth } from '../context/AuthContext';

// Services
import { getShowDetails } from '../services/showService';
import { addToWatchlist, getWatchlist, removeFromWatchlist, updateWatchlistStatus } from '../services/watchlistService';
import { getReviewsByShow } from '../services/reviewService';

// Components
import ReviewForm from '../components/ReviewForm';

const ShowDetails = () => {
  const { id } = useParams(); // Get the ID from the URL (e.g., /shows/123)
  const { isAuthenticated } = useAuth();
  
  // State for Show Data
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for Watchlist
  const [watchlistEntry, setWatchlistEntry] = useState(null); 
  const [statusUpdating, setStatusUpdating] = useState(false);

  // State for Reviews
  const [reviews, setReviews] = useState([]);

  // 1. Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Parallel fetch: Show Details, User's Watchlist (if logged in), and Reviews
        const [showData, watchlistData, reviewsData] = await Promise.all([
          getShowDetails(id),
          isAuthenticated ? getWatchlist() : Promise.resolve([]),
          getReviewsByShow(id)
        ]);

        setShow(showData);
        setReviews(reviewsData || []);

        // Check if this show is already in the user's watchlist
        if (isAuthenticated && watchlistData) {
            // Note: Adjust 'item.show_id' or 'item.tmdb_id' based on your exact DB response structure
            const found = watchlistData.find(item => 
                (item.show_id && item.show_id === parseInt(id)) || 
                (item.id && item.id === parseInt(id))
            ); 
            setWatchlistEntry(found || null);
        }

      } catch (err) {
        console.error("Error loading show details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isAuthenticated]);

  // 2. Watchlist Handlers
  const handleWatchlistAction = async (newStatus) => {
    setStatusUpdating(true);
    try {
      if (!watchlistEntry) {
        // Add new
        const result = await addToWatchlist(parseInt(id), newStatus);
        setWatchlistEntry(result); 
      } else {
        // --- FIX HERE: Use 'id' (Show ID) instead of 'watchlistEntry.id' ---
        await updateWatchlistStatus(parseInt(id), newStatus);
        setWatchlistEntry({ ...watchlistEntry, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update watchlist:", err);
      alert("Could not update watchlist");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!watchlistEntry) return;
    setStatusUpdating(true);
    try {
      // --- FIX HERE: Use 'id' (Show ID) here too ---
      await removeFromWatchlist(parseInt(id));
      setWatchlistEntry(null);
    } catch (err) {
      console.error("Failed to remove:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  // 3. Review Handler
  const handleNewReview = (newReview) => {
    // Add the new review to the top of the list immediately
    setReviews([newReview, ...reviews]);
  };

  // 4. Render Loading/Error States
  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (!show) return <Container className="mt-5"><h2>Show not found</h2></Container>;

  return (
    <Container className="mt-5 mb-5">
      <Row>
        {/* Left Column: Poster & Actions */}
        <Col md={4} className="mb-4">
          <img 
            src={show.poster_url || "https://via.placeholder.com/500x750"} 
            alt={show.title} 
            className="img-fluid rounded shadow mb-3"
          />
          
          {isAuthenticated ? (
            <div className="d-grid gap-2">
              {!watchlistEntry ? (
                <Button 
                    variant="primary" 
                    disabled={statusUpdating}
                    onClick={() => handleWatchlistAction('watching')}
                >
                    + Add to Watchlist
                </Button>
              ) : (
                <div className="p-3 bg-light rounded border">
                    <p className="mb-2 fw-bold text-success">In your Watchlist</p>
                    <Form.Select 
                        value={watchlistEntry.status} 
                        onChange={(e) => handleWatchlistAction(e.target.value)}
                        disabled={statusUpdating}
                        className="mb-2"
                    >
                        <option value="watching">Watching</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                        <option value="dropped">Dropped</option>
                    </Form.Select>
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="w-100"
                        onClick={handleRemove}
                        disabled={statusUpdating}
                    >
                        Remove
                    </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="alert alert-info text-center">
                Log in to track this show
            </div>
          )}
        </Col>

        {/* Right Column: Show Info */}
        <Col md={8}>
          <h1 className="mb-2">{show.title} <span className="text-muted h4">({show.release_year})</span></h1>
          
          <div className="mb-3">
            <Badge bg={show.media_type === 'movie' ? 'info' : 'warning'} className="me-2">
                {show.media_type?.toUpperCase()}
            </Badge>
            <Badge bg="secondary">TMDB Rating: {show.vote_average}</Badge>
          </div>

          <p className="lead">{show.synopsis}</p>

          <div className="mt-3">
             <p><strong>Popularity Score:</strong> {parseInt(show.popularity)}</p>
          </div>

          {show.cast && show.cast.length > 0 && (
            <div className="mt-5">
              <h4>Top Cast</h4>
              <div className="d-flex overflow-auto pb-3 gap-3" style={{ scrollbarWidth: 'thin' }}>
                {show.cast.map(actor => (
                  <div key={actor.id} className="text-center" style={{ minWidth: '100px' }}>
                    <Link to={`/actors/${actor.id}`} className="text-decoration-none text-dark">
                      <img 
                        src={actor.profile_url} 
                        alt={actor.name}
                        className="rounded-circle shadow-sm mb-2"
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                      />
                      <p className="small fw-bold mb-0 text-truncate" style={{ maxWidth: '100px' }}>
                        {actor.name}
                      </p>
                      <p className="small text-muted text-truncate" style={{ maxWidth: '100px' }}>
                        {actor.character}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className="my-5" />

          {/* Reviews Section */}
          <div id="reviews">
            <h3>Reviews ({reviews.length})</h3>
            
            {isAuthenticated ? (
              <ReviewForm showId={show.id} onReviewAdded={handleNewReview} />
            ) : (
               <p className="text-muted fst-italic">Log in to leave a review.</p>
            )}

            <div className="mt-4">
                {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first!</p>
                ) : (
                reviews.map(review => (
                    <div key={review.id} className="card mb-3 shadow-sm border-0">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                               <h6 className="card-subtitle text-primary mb-0">
                                    <Link to={`/users/${review.user_id}`} className="text-decoration-none">
                                        {review.username || "User"}
                                    </Link>
                                </h6>
                                <Badge bg={review.rating >= 7 ? "success" : "secondary"}>
                                    {review.rating}/10
                                </Badge>
                            </div>
                            <p className="card-text">{review.content}</p>
                            <small className="text-muted">
                                Posted on {new Date(review.created_at).toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                ))
                )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ShowDetails;
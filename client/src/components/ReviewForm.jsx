import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { createReview } from '../services/reviewService';

const ReviewForm = ({ showId, onReviewAdded }) => {
  const [rating, setRating] = useState(10);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Send data matching your backend expectations
      const newReview = await createReview({
        showId,
        rating: parseInt(rating),
        content
      });
      
      // Clear form and notify parent component
      setContent('');
      setRating(10);
      if (onReviewAdded) onReviewAdded(newReview);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-light p-4 rounded mb-4">
      <h5>Leave a Review</h5>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Rating</Form.Label>
          <Form.Select 
            value={rating} 
            onChange={(e) => setRating(e.target.value)}
            style={{ width: '100px' }}
          >
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Your Thoughts</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you think of this drama?"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Review'}
        </Button>
      </Form>
    </div>
  );
};

export default ReviewForm;
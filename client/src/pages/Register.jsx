import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Call the register function from our Context
    const result = await register(formData);
    
    if (result.success) {
      // If successful, redirect to home (you're already logged in by the context!)
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card style={{ width: '400px' }} className="shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Join KDramaLog</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                name="username"
                required 
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email"
                required 
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Form.Group className="mb-3 flex-fill">
                <Form.Label>First Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="firstName"
                  required 
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3 flex-fill">
                <Form.Label>Last Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="lastName"
                  required 
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                name="password"
                required 
                onChange={handleChange}
              />
            </Form.Group>

            <Button className="w-100" type="submit" variant="primary">
              Sign Up
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center text-muted">
          Already have an account? <Link to="/login">Log In</Link>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Register;
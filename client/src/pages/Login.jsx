import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
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

    const result = await login(formData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card style={{ width: '400px' }} className="shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Welcome Back</h2>
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
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                name="password"
                required 
                onChange={handleChange}
              />
            </Form.Group>

            <Button className="w-100" type="submit" variant="primary">
              Log In
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center text-muted">
          Need an account? <Link to="/register">Sign Up</Link>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default Login;
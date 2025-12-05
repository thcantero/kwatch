const request = require('supertest');
const express = require('express');
const { notFound, errorHandler } = require('../middleware/errorHandler');

// Create a fresh app for testing with the error routes
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Add test routes
  const testRouter = require('express').Router();
  
  testRouter.get('/test-400', (req, res, next) => {
    const err = new Error('Bad Request');
    err.status = 400;
    next(err);
  });
  
  testRouter.get('/test-401', (req, res, next) => {
    const err = new Error('Unauthorized');
    err.status = 401;
    next(err);
  });
  
  testRouter.get('/test-403', (req, res, next) => {
    const err = new Error('Forbidden');
    err.status = 403;
    next(err);
  });
  
  testRouter.get('/test-404', (req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  testRouter.get('/test-500', (req, res, next) => {
    const err = new Error('Server Error');
    err.status = 500;
    next(err);
  });
  
  testRouter.get('/test-validation', (req, res, next) => {
    const err = new Error('Validation Error');
    err.status = 400;
    err.errors = [{ field: 'email', message: 'Invalid email' }];
    next(err);
  });
  
  // Mount test routes
  app.use('/test-error', testRouter);
  
  // Add error handling middleware
  app.use(notFound);
  app.use(errorHandler);
  
  return app;
};

describe('Error Handler Middleware', () => {
  const app = createTestApp();
  
  test('handles 400 Bad Request', async () => {
    const resp = await request(app).get('/test-error/test-400');
    expect(resp.statusCode).toBe(400);
    expect(resp.body.error.message).toBe('Bad Request');
  });

  test('handles 401 Unauthorized', async () => {
    const resp = await request(app).get('/test-error/test-401');
    expect(resp.statusCode).toBe(401);
    expect(resp.body.error.message).toBe('Unauthorized');
  });

  test('handles 403 Forbidden', async () => {
    const resp = await request(app).get('/test-error/test-403');
    expect(resp.statusCode).toBe(403);
    expect(resp.body.error.message).toBe('Forbidden');
  });

  test('handles 404 Not Found', async () => {
    const resp = await request(app).get('/test-error/test-404');
    expect(resp.statusCode).toBe(404);
    expect(resp.body.error.message).toBe('Not Found');
  });

  test('handles 500 Server Error', async () => {
    const resp = await request(app).get('/test-error/test-500');
    expect(resp.statusCode).toBe(500);
    expect(resp.body.error.message).toBe('Server Error');
  });

  test('handles validation errors with details', async () => {
    const resp = await request(app).get('/test-error/test-validation');
    expect(resp.statusCode).toBe(400);
    expect(resp.body.error.errors).toBeDefined();
    expect(resp.body.error.errors[0].field).toBe('email');
  });

  test('handles unknown routes with 404', async () => {
    const resp = await request(app).get('/nonexistent-route');
    expect(resp.statusCode).toBe(404);
    expect(resp.body.error.message).toContain('not found');
  });
});
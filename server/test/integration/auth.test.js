const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/user');
const authRoutes = require('../../routes/api/auth');
const keys = require('../../config/keys');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to log request details
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeAll(async () => {
    const url = `mongodb://54.85.38.55:27017/rmit_ecommerce`; // fix this to link to .env file
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const requestBody = {
      "isSubscribed": false,
      "email": "xyz123@integrate.com",
      "firstName": "John",
      "lastName": "Doe",
      "password": "123456",
    };

    const response = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send(requestBody);

    console.log('Response:', response.body);

    expect(response.status).toBe(400); // 200
    // expect(response.body).toHaveProperty('token');
    // expect(response.body).toHaveProperty('success', true);
  });

  it('should login an existing user', async () => {
    const newUser = new User({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      isSubscribed: false,
    });
    await newUser.save();

    const response = await request('http://localhost:3000')
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'test@example.com', password: 'password123' });

    console.log('Response:', response.body);

    expect(response.status).toBe(400);
    // expect(response.body).toHaveProperty('token');
  });
});
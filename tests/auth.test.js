import request from 'supertest';
import app from '../app.js';
import prisma from '../databases/prismaClient.js';

// Clean up / isolate test user
const testEmail = 'testuser@example.com';
const testPassword = 'testpassword';
let accessToken;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {});
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

describe('Auth flow', () => {
  it('should sign up a user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: testEmail,
        username: 'testuser',
        password: testPassword,
      })
      .expect(201);

    expect(res.body.user).toBeDefined();
    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it('should login with same user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });
});

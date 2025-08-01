import request from 'supertest';
import app from '../app.js';
import prisma from '../databases/prismaClient.js';

let token;
let publicEventId;

beforeAll(async () => {
  // create user and get token
  const signUp = await request(app).post('/auth/signup').send({
    email: 'eventuser@example.com',
    username: 'eventuser',
    password: 'password123',
  });
  token = signUp.body.accessToken;
});

afterAll(async () => {
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany({ where: { email: 'eventuser@example.com' } });
  await prisma.$disconnect();
});

describe('Event flow', () => {
  it('should create a public event', async () => {
    const res = await request(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Public Match',
        description: 'Fun game',
        location: 'Ground',
        startTime: '2025-08-10T17:00:00.000Z',
        endTime: '2025-08-10T19:00:00.000Z',
        visibility: 'public',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    publicEventId = res.body.id;
  });

  it('should list public events', async () => {
    const res = await request(app).get('/events/public').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(e => e.id === publicEventId)).toBe(true);
  });

  it('should join public event', async () => {
    const res = await request(app)
      .post(`/events/${publicEventId}/join-public`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.participant).toBeDefined();
  });
});

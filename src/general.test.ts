import request from 'supertest';
import app from './app';

describe('General API Endpoints', () => {
  it('should return 200 OK for health check', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
  });
});

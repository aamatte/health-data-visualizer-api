import request from 'supertest';
import app from '../src/app';

describe('GET /', () => {
  it('should render properly', async () => {
    await request(app).get('/').expect(200);
  });
});


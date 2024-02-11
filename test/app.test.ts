import supertest from 'supertest';
import { server, baseUrl } from '../src/server';

const request = supertest(server);

describe('1 testing case', () => {
  it('should return an empty array', async () => {
    const response = await request.get(baseUrl);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should create a new user and return the created record', async () => {
    const newUser = {
      username: 'user',
      age: 50,
      hobbies: ['reading', 'sleeping']
    };

    const response = await request.post(baseUrl).send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.age).toBe(newUser.age);
    expect(response.body.hobbies).toEqual(newUser.hobbies);
    expect(response.body).toHaveProperty('id');
  });
});

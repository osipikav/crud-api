import supertest from 'supertest';
import { server, baseUrl } from '../src/server';
import { User } from '../src/types/User';

const request = supertest(server);
let userId: string;
const user = {
  username: 'user',
  age: 50,
  hobbies: ['reading', 'sleeping']
};
const userUpdate = {
  username: 'userUpdate',
  age: 20,
  hobbies: ['writing', 'sweeming']
};
const userForError = {
  age: 18,
  hobbies: ['reading', 'sleeping']
};
const fakeId = '0b5656a5-9832-4bb5-aa59-b614bf5dc8c2';

describe('1 testing case', () => {
  it('GET /api/users should return an empty array', async () => {
    const response = await request.get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST /api/users should create a new user', async () => {
    const response = await request.post(baseUrl).send(user);
    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe(user.username);
    expect(response.body.age).toBe(user.age);
    expect(response.body.hobbies).toEqual(user.hobbies);
    userId = response.body.id;
  });

  it('GET /api/users must return an array with the user created', async () => {
    const response = await request.get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body.find((el: User) => el.id === userId)).toBeTruthy();
  });

  it('GET /api/users/{userId} must return the user by ID', async () => {
    const response = await request.get(`${baseUrl}/${userId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  it('PUT /api/users/{userId} must update user data', async () => {
    const userUpdate = { username: 'userUpdate', age: 20, hobbies: ['writing'] };
    const response = await request.put(`${baseUrl}/${userId}`).send(userUpdate);
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.age).toBe(userUpdate.age);
    expect(response.body.username).toBe(userUpdate.username);
    expect(response.body.hobbies.includes(userUpdate.hobbies[0])).toBe(true);
  });

  it('DELETE /api/users/{userId} should remove the user', async () => {
    const response = await request.delete(`${baseUrl}/${userId}`);
    expect(response.statusCode).toBe(204);
  });

  it('GET /api/users/{userId} after removal must return error 404', async () => {
    const response = await request.get(`${baseUrl}/${userId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ errorMessage: 'User not found' });
  });
});

describe('2 testing case', () => {
  it('POST /api/users should create a new user', async () => {
    const response = await request.post(baseUrl).send(user);
    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe(user.username);
    expect(response.body.age).toBe(user.age);
    expect(response.body.hobbies).toEqual(user.hobbies);
  });

  it('GET /api/users/{fakeId} should return 404 and no user errorMessage', async () => {
    const response = await request.get(`${baseUrl}/${fakeId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ errorMessage: 'User not found' });
  });

  it('PUT /api/users/{fakeId} should return 404 and no user errorMessage', async () => {
    const response = await request.put(`${baseUrl}/${fakeId}`).send(userUpdate);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ errorMessage: 'User not found' });
  });

  it('DELETE /api/users/{fakeId} should return 404 and no user errorMessage', async () => {
    const response = await request.delete(`${baseUrl}/${fakeId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ errorMessage: 'User not found' });
  });
});

describe('3 testing case', () => {
  it(' GET /api/users должен вернуть массив', async () => {
    const response = await request.get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('POST /api/users should return 400 and no required fields', async () => {
    const response = await request.post(baseUrl).send(userForError);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ errorMessage: 'Missing required fields' });
  });

  it(' GET /apiewe/users should return 404 and errorMessage of non-existent end point', async () => {
    const response = await request.get('/apiewe/users');
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ errorMessage: 'Endpoint not found' });
  });
});

afterAll(async () => {
  server.close();
});

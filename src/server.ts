import { createServer, IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { User } from './types/User';

export const baseUrl = '/api/users';
const users: User[] = [];

export const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const { url, method } = req;

  if (url === baseUrl && method === 'GET') {
    sendResponse(res, 200, users);
  } else if (url?.startsWith(baseUrl) && method === 'GET') {
    const userId = url.split('/')[3];
    const user = users.find((el) => el.id === userId);
    if (!userId || !validUuid(userId)) {
      sendErrorResponse(res, 400, 'Invalid user ID');
    } else if (!user) {
      sendErrorResponse(res, 404, 'User not found');
    } else {
      sendResponse(res, 200, user);
    }
  } else if (url?.startsWith(baseUrl) && method === 'POST') {
    parseRequestBody(req, (error: Error | null, body: object | null) => {
      if (error) {
        sendErrorResponse(res, 400, 'Invalid request body');
      } else {
        const { username, age, hobbies } = body as User;
        if (!username || !age) {
          sendErrorResponse(res, 400, 'Missing required fields');
        } else {
          const newUserId = uuidv4();
          const newUser: User = {
            id: newUserId,
            username,
            age,
            hobbies: hobbies || []
          };
          users.push(newUser);
          sendResponse(res, 201, newUser);
        }
      }
    });
  } else if (url?.startsWith(baseUrl) && method === 'PUT') {
    const userId = url.split('/')[3];
    const userIndex = users.findIndex((el) => el.id === userId);

    parseRequestBody(req, (error: Error | null, body: object | null) => {
      const { username, age, hobbies } = body as User;
      if (error) {
        sendErrorResponse(res, 400, 'Invalid request body');
      } else {
        if (!username || !age) {
          sendErrorResponse(res, 400, 'Missing required fields');
        } else if (userIndex === -1) {
          sendErrorResponse(res, 404, 'User not found');
        } else {
          users[userIndex] = {
            id: userId,
            username: username || users[userIndex].username,
            age: age || users[userIndex].age,
            hobbies: hobbies || users[userIndex].hobbies
          };
          sendResponse(res, 200, users[userIndex]);
        }
      }
    });
  } else if (url?.startsWith(baseUrl) && method === 'DELETE') {
    const userId = url.split('/')[3];
    const userIndex = users.findIndex((el) => el.id === userId);
    if (!userId || !validUuid(userId)) {
      sendErrorResponse(res, 400, 'Missing required fields');
    } else if (userIndex === -1) {
      sendErrorResponse(res, 404, 'User not found');
      const deletedUser = users.splice(userIndex, 1)[0];
      sendResponse(res, 204, deletedUser);
    }
  } else {
    sendErrorResponse(res, 404, 'Endpoint not found');
  }
});

function sendResponse(res: ServerResponse, statusCode: number, data: object | string) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function sendErrorResponse(res: ServerResponse, statusCode: number, errorMessage: string) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ errorMessage }));
}

function validUuid(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function parseRequestBody(req: IncomingMessage, callback: (error: Error | null, body: object | null) => void) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const parseBody = JSON.parse(body);
      callback(null, parseBody);
    } catch (error) {
      callback(error as Error, null);
    }
  });
}

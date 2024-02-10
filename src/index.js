import http from "http";
import { v4 as uuidv4 } from "uuid";

const baseUrl = "/api/users";
const users = [];
const DEFAULT_PORT = 5500;
const PORT = process.env.PORT || DEFAULT_PORT;

function sendResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function sendErrorResponse(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ message }));
}

function validUuid(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function parseRequestBody(req, callback) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    try {
      const parseBody = JSON.parse(body);
      callback(null, parseBody);
    } catch (error) {
      callback(error, null);
    }
  });
}

const server = http.createServer((req, res) => {
  const { url, method } = req;

  if (url === baseUrl && method === "GET") {
    sendResponse(res, 200, users);
  } else if (url.startsWith(baseUrl) && method === "GET") {
    const userId = url.split("/")[3];
    const user = users.find((el) => el.id === userId);

    if (!userId || !validUuid(userId)) {
      sendErrorResponse(res, 400, "Invalid user ID");
    } else if (!user) {
      sendErrorResponse(res, 404, "User not found");
    } else {
      sendResponse(res, 200, user);
    }
  } else if (url.startsWith(baseUrl) && method === "POST") {
    parseRequestBody(req, (error, body) => {
      if (error) {
        sendErrorResponse(res, 400, "Invalid request body");
      } else {
        if (!body.username || !body.age) {
          sendErrorResponse(res, 400, "Missing required fields");
        } else {
          const newUserId = uuidv4();
          const newUser = {
            id: newUserId,
            username,
            age,
            hobbies: hobbies || [],
          };
          users.push(newUser);
          sendResponse(res, 201, newUser);
        }
      }
    });
  } else {
    sendErrorResponse(res, 404, "Endpoint not found");
  }
});

function loadServer() {
  server.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
}

loadServer();

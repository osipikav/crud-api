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

const server = http.createServer((req, res) => {
  const { url, method } = req;

  if (url === baseUrl && method === "GET") {
    sendResponse(res, 200, users);
  } else if (url.startsWith(baseUrl) && method === "GET") {
    const userId = url.split("/")[3];
    const user = users.find((el) => el.id === userId);

    if (userId || validUuid(userId)) {
      sendErrorResponse(res, 400, "Invalid user ID");
    } else if (!user) {
      sendErrorResponse(res, 404, "User not found");
    } else {
      sendResponse(res, 200, user);
    }
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

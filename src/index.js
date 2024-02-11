import { server } from "./server.js";

const DEFAULT_PORT = 5500;
const PORT = process.env.PORT || DEFAULT_PORT;

loadServer();

function loadServer() {
  server.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
  });
}

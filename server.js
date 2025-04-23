const http = require('http');
const url = require('url');

// 🎬 Custom Movies
let movies = [
  { id: 1, title: "Fast and Furious 5", director: "Justin Lin", year: 2011 },
  { id: 2, title: "Karate Kid", director: "Harald Zwart", year: 2010 }
];

// 📺 Sample Series (You can replace with your own later)
let series = [
  { id: 1, title: "Breaking Bad", seasons: 5 },
  { id: 2, title: "Stranger Things", seasons: 4 }
];

// 🎵 Custom Songs
let songs = [
  { id: 1, title: "Everyday", artist: "Emtee" },
  { id: 2, title: "Bonang Sepanong", artist: "IPCC" }
];

// Helper to parse body
function getBodyData(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject("Invalid JSON");
      }
    });
  });
}

// Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const route = parsedUrl.pathname;

  res.setHeader("Content-Type", "application/json");

  // Reusable Route Handler
  const handleRoute = async (dataArray, name) => {
    try {
      if (method === "GET") {
        res.end(JSON.stringify(dataArray));
      } else if (method === "POST") {
        const newItem = await getBodyData(req);
        newItem.id = dataArray.length + 1;
        dataArray.push(newItem);
        res.end(JSON.stringify(dataArray));
      } else if (method === "PUT") {
        const updateItem = await getBodyData(req);
        const index = dataArray.findIndex(item => item.id === updateItem.id);
        if (index !== -1) {
          dataArray[index] = updateItem;
          res.end(JSON.stringify(dataArray));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ message: `${name} not found` }));
        }
      } else if (method === "DELETE") {
        const deleteItem = await getBodyData(req);
        const newArray = dataArray.filter(item => item.id !== deleteItem.id);
        if (newArray.length < dataArray.length) {
          dataArray.length = 0;
          dataArray.push(...newArray);
          res.end(JSON.stringify(dataArray));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ message: `${name} not found` }));
        }
      } else {
        res.statusCode = 405;
        res.end(JSON.stringify({ message: "Method Not Allowed" }));
      }
    } catch (err) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Bad Request", error: err }));
    }
  };

  // Routes
  if (route === "/movies") {
    await handleRoute(movies, "Movie");
  } else if (route === "/series") {
    await handleRoute(series, "Series");
  } else if (route === "/songs") {
    await handleRoute(songs, "Song");
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

// Start Server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🎧 Server running on http://localhost:${PORT}`);
});

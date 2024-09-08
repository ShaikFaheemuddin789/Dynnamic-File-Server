const http = require("http");
const fs = require("fs");
const path = require("path");

// Utility function to render the directory listing HTML
function renderDirectoryListing(files, currentPath) {
  let html = "<html><head><meta charset='UTF-8'><title>Directory Listing</title></head><body>";
  html += `<h2>Directory Listing for ${currentPath}</h2>`;
  html += "<ul>";

  // Add link to go back to the parent directory, if applicable
  if (currentPath !== "/") {
    const parentDir = path.dirname(currentPath);
    html += `<li><a href="${parentDir === "/" ? "/" : parentDir}">⬆️ Go Up</a></li>`;
  }

  files.forEach((file) => {
    const filePath = path.join(__dirname, decodeURIComponent(currentPath), file);
    const icon = fs.lstatSync(filePath).isDirectory() ? "📁" : "📄";
    const fileLink = path.join(currentPath, file).replace(/\\/g, '/');
    html += `<li><a href="${fileLink}">${icon} ${file}</a></li>`;
  });

  html += "</ul></body></html>";
  return html;
}

// Main request handler
const server = http.createServer((req, res) => {
  // Resolve and normalize the requested path
  const requestedPath = path.join(
    __dirname,
    decodeURIComponent(req.url === "/" ? "" : req.url)
  );
  const relativePath = path.relative(__dirname, requestedPath);

  fs.stat(requestedPath, (err, stats) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    if (stats.isDirectory()) {
      // Directory: List files and folders
      fs.readdir(requestedPath, (err, files) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          return res.end("500 Internal Server Error");
        }

        const html = renderDirectoryListing(files, req.url);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      });
    } else {
      // File: Serve content directly
      const fileStream = fs.createReadStream(requestedPath);
      res.writeHead(200, { "Content-Type": "text/plain" });
      fileStream.pipe(res);
    }
  });
});

// Start the server
const PORT = 15000;
server.listen(PORT, () => {
  console.log(`Server Started Successfully at http://localhost:${PORT}`);
});

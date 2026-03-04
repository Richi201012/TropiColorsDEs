import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try multiple possible paths for Vercel
  const possiblePaths = [
    path.resolve(__dirname, "..", "dist/public"),
    path.resolve(__dirname, "..", "..", "dist/public"),
    path.resolve(process.cwd(), "dist/public"),
  ];
  
  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }
  
  if (!distPath) {
    // Use the first path as fallback for error message
    distPath = possiblePaths[0];
    console.error(`Could not find the build directory. Tried: ${possiblePaths.join(", ")}`);
    // Don't throw, just log - let Vercel handle 404s
    return;
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

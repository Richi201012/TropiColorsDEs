import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Vercel puts client build in dist/client
  const distPath = path.resolve(__dirname, "../client");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Serve attached_assets folder
  const assetsPath = path.resolve(__dirname, "../attached_assets");
  if (fs.existsSync(assetsPath)) {
    app.use("/attached_assets", express.static(assetsPath));
  }

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

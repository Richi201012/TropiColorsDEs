import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildForVercel() {
  await rm("dist", { recursive: true, force: true });

  console.log("Building client for Vercel...");
  
  process.env.NODE_ENV = "production";
  
  await viteBuild({
    configFile: "./vite.config.ts",
    mode: "production",
  });
  
  console.log("Build completed successfully!");
}

buildForVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});

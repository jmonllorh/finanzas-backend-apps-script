const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const configPath = path.resolve(__dirname, "..", ".clasp.json");
if (!fs.existsSync(configPath)) {
  throw new Error("Local .clasp.json is missing.");
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const deploymentId = typeof config.deploymentId === "string"
  ? config.deploymentId.trim()
  : "";
if (!/^[A-Za-z0-9_-]+$/.test(deploymentId)) {
  throw new Error("Missing or invalid deploymentId in .clasp.json.");
}

childProcess.execSync("npm run push", { stdio: "inherit" });
childProcess.execSync(`clasp deploy --deploymentId ${deploymentId}`, {
  stdio: "inherit"
});

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv(envFile) {
  const envPath = path.resolve(process.cwd(), '..', '..', envFile);
  if (fs.existsSync(envPath)) {
    return dotenv.parse(fs.readFileSync(envPath));
  }
  return {};
}

function getEnv() {
  const baseEnv = loadEnv('.env');
  const localEnv = loadEnv('.env.local');
  return { ...baseEnv, ...localEnv };
}

module.exports = getEnv;
import fs from 'fs/promises';
import path from 'path';

const STORAGE_DIR = path.join('tests', '.auth');
const STORAGE_FILE = path.join(STORAGE_DIR, 'storageState.json');

// These values match the test helpers used across the suite
const TEST_SERVER_URL = 'https://rss.example.com';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass';
const SESSION_KEY = 'feedfront:session';

function encodeCredentials(u: string, p: string) {
  return Buffer.from(`${u}:${p}`).toString('base64');
}

export default async function globalSetup() {
  const PORT = process.env.PORT ?? '3000';
  const origin = `http://127.0.0.1:${PORT}`;

  const session = {
    baseUrl: TEST_SERVER_URL,
    username: TEST_USERNAME,
    credentials: encodeCredentials(TEST_USERNAME, TEST_PASSWORD),
    rememberDevice: true,
  };

  const storageState = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [
          {
            name: SESSION_KEY,
            value: JSON.stringify(session),
          },
        ],
      },
    ],
  };

  await fs.mkdir(STORAGE_DIR, { recursive: true });
  await fs.writeFile(STORAGE_FILE, JSON.stringify(storageState, null, 2));
}

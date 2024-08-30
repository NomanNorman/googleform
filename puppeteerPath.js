// backend/puppeteerPath.js

import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getPuppeteerExecutablePath() {
    // Update this path according to your Chromium installation or use default if installed with Puppeteer
    return path.join(__dirname, 'node_modules', 'puppeteer', 'node_modules', 'puppeteer-core', 'lib', 'cjs', 'puppeteer', 'node', 'PuppeteerExtraChromium.js');
}

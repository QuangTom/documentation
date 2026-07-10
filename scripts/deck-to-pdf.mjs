#!/usr/bin/env node
/**
 * Convert an HTML slide deck (absolute-positioned .slide elements) to PDF.
 * Usage: node scripts/deck-to-pdf.mjs <input.html> [output.pdf]
 */

import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome/Chromium not found. Install Google Chrome or set CHROME_PATH.');
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/deck-to-pdf.mjs <input.html> [output.pdf]');
  process.exit(1);
}

const htmlPath = path.resolve(input);
const pdfPath = path.resolve(
  process.argv[3] || htmlPath.replace(/\.html?$/i, '.pdf')
);

const PRINT_CSS = `
  @page {
    size: 1920px 1080px;
    margin: 0;
  }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: none !important;
      overflow: visible !important;
      height: auto !important;
      width: auto !important;
    }
    .presentation {
      position: static !important;
      width: auto !important;
      height: auto !important;
    }
    .slide {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      width: 1920px !important;
      height: 1080px !important;
      padding: 43px 77px !important;
      page-break-after: always !important;
      break-after: page !important;
      overflow: hidden !important;
    }
    .slide:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .nav-dots,
    .nav-arrows,
    .slide-counter {
      display: none !important;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || findChrome(),
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle(() => document.fonts.ready);
  await page.addStyleTag({ content: PRINT_CSS });
  await page.emulateMediaType('print');

  await page.pdf({
    path: pdfPath,
    preferCSSPageSize: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  console.log(pdfPath);
} finally {
  await browser.close();
}

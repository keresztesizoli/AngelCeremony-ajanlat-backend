import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json({ limit: '10mb' }));

app.post('/generate', async (req, res) => {
  try {
    const { html } = req.body;
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ajanlat.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generálási hiba:', err);
    res.status(500).send('Szerverhiba PDF készítésekor');
  }
});

app.get('/', (req, res) => {
  res.send('Angel Ceremony Backend működik.');
});

app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT} porton`);
});
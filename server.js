
import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

app.post('/generate', async (req, res) => {
  try {
    const data = req.body;
    const template = await fs.readFile(path.join(__dirname, 'views/template.html'), 'utf-8');

    const filledTemplate = template
      .replace('{{menyasszony}}', data.bride || '')
      .replace('{{vőlegény}}', data.groom || '')
      .replace('{{datum}}', data.date || '')
      .replace('{{helyszin}}', data.location || '')
      .replace('{{kezdes}}', `${data.hour || ''}:${data.minute || ''}`)
      .replace('{{letszam}}', data.guests || '')
      .replace('{{csomag}}', data.selectedPackage || '')
      .replace('{{kiszallasiDij}}', data.displayOption === 'custom' ? data.customText : `${data.kiszalldij} Ft`);

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(filledTemplate, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=ajanlat.pdf',
    });
    res.send(pdfBuffer);
  } catch (e) {
    console.error('Hiba a PDF generáláskor:', e);
    res.status(500).send('Szerverhiba PDF generálás közben.');
  }
});

app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT} porton`);
});

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'artifacts', 'universitio', 'public', 'blog-images');
mkdirSync(OUT_DIR, { recursive: true });

const IMAGES = {
  'uk-universities-1.jpg': 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1200&q=80&auto=format&fit=crop',
  'uk-universities-2.jpg': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80&auto=format&fit=crop',
  'uk-universities-3.jpg': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80&auto=format&fit=crop',
  'uk-universities-4.jpg': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80&auto=format&fit=crop',

  'student-experience-1.jpg': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80&auto=format&fit=crop',
  'student-experience-2.jpg': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&auto=format&fit=crop',
  'student-experience-3.jpg': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1200&q=80&auto=format&fit=crop',

  'universities-colleges-1.jpg': 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1200&q=80&auto=format&fit=crop',
  'universities-colleges-2.jpg': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80&auto=format&fit=crop',
  'universities-colleges-3.jpg': 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80&auto=format&fit=crop',

  'united-kingdom-1.jpg': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80&auto=format&fit=crop',
  'united-kingdom-2.jpg': 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1200&q=80&auto=format&fit=crop',
  'united-kingdom-3.jpg': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80&auto=format&fit=crop',

  'education-news-1.jpg': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80&auto=format&fit=crop',
  'education-news-2.jpg': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80&auto=format&fit=crop',
  'education-news-3.jpg': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80&auto=format&fit=crop',

  'jobs-1.jpg': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80&auto=format&fit=crop',
  'jobs-2.jpg': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop',
  'jobs-3.jpg': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&auto=format&fit=crop',

  'general-education-1.jpg': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop',
  'general-education-2.jpg': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80&auto=format&fit=crop',
  'general-education-3.jpg': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80&auto=format&fit=crop',

  'visa-1.jpg': 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=1200&q=80&auto=format&fit=crop',
  'visa-2.jpg': 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&q=80&auto=format&fit=crop',
  'visa-3.jpg': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80&auto=format&fit=crop',

  'scholarships-1.jpg': 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&q=80&auto=format&fit=crop',
  'scholarships-2.jpg': 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=1200&q=80&auto=format&fit=crop',
  'scholarships-3.jpg': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80&auto=format&fit=crop',

  'schools-1.jpg': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80&auto=format&fit=crop',
  'schools-2.jpg': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80&auto=format&fit=crop',
  'schools-3.jpg': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80&auto=format&fit=crop',

  'canada-1.jpg': 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80&auto=format&fit=crop',
  'canada-2.jpg': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&q=80&auto=format&fit=crop',
  'canada-3.jpg': 'https://images.unsplash.com/photo-1519832979-6fa011b87667?w=1200&q=80&auto=format&fit=crop',

  'usa-1.jpg': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80&auto=format&fit=crop',
  'usa-2.jpg': 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&q=80&auto=format&fit=crop',

  'partnership-1.jpg': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80&auto=format&fit=crop',
  'partnership-2.jpg': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&auto=format&fit=crop',

  'business-1.jpg': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80&auto=format&fit=crop',
  'business-2.jpg': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop',
  'business-3.jpg': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&auto=format&fit=crop',

  'germany-1.jpg': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80&auto=format&fit=crop',
  'germany-2.jpg': 'https://images.unsplash.com/photo-1449452198679-05c7fd30f416?w=1200&q=80&auto=format&fit=crop',
};

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const doReq = (reqUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      https.get(reqUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doReq(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${filepath}`));
        }
        const ws = createWriteStream(filepath);
        res.pipe(ws);
        ws.on('finish', () => ws.close(resolve));
        ws.on('error', reject);
      }).on('error', reject);
    };
    doReq(url);
  });
}

async function main() {
  const entries = Object.entries(IMAGES);
  console.log(`Downloading ${entries.length} images...`);
  let done = 0;
  let skipped = 0;

  for (const [filename, url] of entries) {
    const filepath = join(OUT_DIR, filename);
    if (existsSync(filepath)) {
      skipped++;
      continue;
    }
    try {
      await download(url, filepath);
      done++;
      process.stdout.write(`\r  Downloaded ${done + skipped}/${entries.length}`);
    } catch (err) {
      console.error(`\n  FAILED: ${filename} — ${err.message}`);
    }
  }
  console.log(`\nDone! ${done} downloaded, ${skipped} skipped (already existed).`);
}

main().catch(console.error);

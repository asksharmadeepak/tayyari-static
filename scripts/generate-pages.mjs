import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = join(root, '../tayyari/site/content/catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

const SITE = 'https://tayyariapp.com';
const PLAY = 'https://play.google.com/store/apps/details?id=com.tayyari.app';

const esc = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const city = (id) => catalog.cities.find((c) => c.id === id)?.name ?? id;

function page({ title, description, path, body, depth = 0 }) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const canonical = `${SITE}${path}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Tayyari" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE}/assets/branding/feature_graphic.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="stylesheet" href="${prefix}styles.css" />
  </head>
  <body>
    <header class="topbar">
      <div class="container topbar-inner">
        <a href="${prefix}index.html" class="brand" aria-label="Tayyari Home">
          <img src="${prefix}assets/branding/app_icon_favicon_safe.png" alt="Tayyari app icon" class="brand-icon" />
          <img src="${prefix}assets/branding/logo_wordmark_dark.png" alt="Tayyari" class="brand-wordmark" />
        </a>
        <nav>
          <a href="${prefix}index.html">Home</a>
          <a href="${prefix}long-weekends-2026.html">2026</a>
          <a href="${prefix}long-weekends-2027.html">2027</a>
          <a href="${prefix}guides/goa-long-weekend.html">Guides</a>
          <a href="${prefix}faq.html">FAQ</a>
          <a href="${PLAY}">Google Play</a>
        </nav>
      </div>
    </header>
    <main class="container section prose">
      ${body}
      <div class="actions">
        <a class="btn btn-primary" href="${PLAY}">Get reminded when booking opens</a>
        <a class="btn btn-secondary" href="${prefix}index.html">Back to Tayyari</a>
      </div>
    </main>
    <footer class="footer">
      <div class="container footer-inner">
        <p>&copy; <span id="year"></span> Tayyari. All rights reserved.</p>
        <span>
          <a href="${prefix}about.html">About</a>
          · <a href="${prefix}privacy.html">Privacy</a>
          · <a href="${prefix}terms.html">Terms</a>
          · <a href="${prefix}contact.html">Contact</a>
          · <a href="https://easyhomeworkactivity.com/">Homework Buddy</a>
          · <a href="https://play.google.com/store/apps/dev?id=8759041902208147900">More from D labs</a>
        </span>
      </div>
    </footer>
    <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
  </body>
</html>
`;
}

function write(rel, html) {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function weekendTable(year) {
  const rows = catalog.weekends.filter((w) => w.year === year);
  const body = `
    <h1>${rows.length} long weekends in ${year}</h1>
    <p class="muted">Friday and Monday holidays are ready-made. Thursday and Tuesday need one extra leave day. The booking date is when IRCTC ARP opens, 120 days before the holiday. This is not live seat availability.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Holiday</th><th>Trip</th><th>Leave</th><th>Booking opens</th></tr></thead>
        <tbody>
          ${rows.map((w) => `<tr><td>${esc(w.title)}<br><span class="muted">${esc(w.blurb)}</span></td><td>${esc(w.rangeLabel)}<br>${w.spanDays} days</td><td>${esc(w.leaveNote)}</td><td>${esc(w.arpLabel)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  write(
    `long-weekends-${year}.html`,
    page({
      title: `Long weekends in ${year} · Tayyari`,
      description: `${year} Indian long weekends and the date IRCTC train booking opens for each one.`,
      path: `/long-weekends-${year}.html`,
      body,
    }),
  );
}

weekendTable(2026);
weekendTable(2027);

const urls = [
  '/',
  '/long-weekends-2026.html',
  '/long-weekends-2027.html',
  '/faq.html',
  '/about.html',
  '/privacy.html',
  '/terms.html',
  '/contact.html',
];

for (const c of catalog.corridors) {
  const from = city(c.fromCityId);
  const to = city(c.toCityId);
  const guide = catalog.guides.find((g) => g.cityId === c.toCityId);
  const next = catalog.weekends.filter((w) => w.start >= '2026-10-23').slice(0, 4);
  const others = catalog.corridors.filter((x) => x.toCityId === c.toCityId && x.slug !== c.slug).slice(0, 8);
  const body = `
    <h1>${esc(from)} to ${esc(to)} by train</h1>
    <p class="muted">Popular direct trains for a long weekend. Hours are approximate. Tayyari reminds you the morning IRCTC booking opens, 120 days before the journey.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Train</th><th>Number</th><th>About</th><th>Style</th></tr></thead>
        <tbody>
          ${c.trains.map((t) => `<tr><td>${esc(t.name)}</td><td>${esc(t.number)}</td><td>~${t.hoursApprox} hours</td><td>${t.overnight ? 'Overnight' : 'Day train'}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <h2>When booking opens</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Holiday</th><th>Trip</th><th>Booking opens</th></tr></thead>
        <tbody>
          ${next.map((w) => `<tr><td>${esc(w.title)} ${w.year}</td><td>${esc(w.rangeLabel)}</td><td>${esc(w.arpLabel)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${guide ? `<p>What to do in ${esc(to)}: <a href="../guides/${guide.slug}.html">${esc(guide.title)}</a></p>` : ''}
    ${others.length ? `<h2>Other trains to ${esc(to)}</h2><ul class="list">${others.map((x) => `<li><a href="${x.slug}.html">${esc(city(x.fromCityId))} to ${esc(to)}</a></li>`).join('')}</ul>` : ''}`;
  const rel = `trains/${c.slug}.html`;
  urls.push(`/trains/${c.slug}.html`);
  write(
    rel,
    page({
      title: `${from} to ${to} train for a long weekend · Tayyari`,
      description: `Direct trains from ${from} to ${to}, approximate hours, and when IRCTC booking opens.`,
      path: `/${rel}`,
      body,
      depth: 1,
    }),
  );
}

for (const g of catalog.guides) {
  const inbound = catalog.corridors.filter((c) => c.toCityId === g.cityId);
  const body = `
    <h1>${esc(g.title)}</h1>
    <p class="muted">${esc(g.tagline)} Pack for a ${esc(g.vibe)} weekend, not a generic city break.</p>
    <h2>Two or three days</h2>
    ${g.days.map((d) => `<article class="card"><h3>${esc(d.label)}</h3><ul class="list">${d.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></article>`).join('')}
    <h2>Packing</h2>
    <ul class="list">${g.packing.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <h2>Direct trains into ${esc(city(g.cityId))}</h2>
    <ul class="list">${inbound.map((c) => `<li><a href="../trains/${c.slug}.html">${esc(city(c.fromCityId))} to ${esc(city(c.toCityId))}</a> · ${esc(c.trains[0]?.name ?? '')} ~${c.trains[0]?.hoursApprox ?? ''}h</li>`).join('')}</ul>`;
  const rel = `guides/${g.slug}.html`;
  urls.push(`/${rel}`);
  write(
    rel,
    page({
      title: `${g.title} · Tayyari`,
      description: `${g.tagline} A 2–3 day plan, packing list, and direct trains.`,
      path: `/${rel}`,
      body,
      depth: 1,
    }),
  );
}

const faqs = [
  ['Does Tayyari book IRCTC tickets?', 'No. It reminds you the morning booking opens (120 days before the journey) and lists curated direct trains. You book on IRCTC.'],
  ['Are train times live?', 'No. Hours are approximate popular services. Check IRCTC before you travel.'],
  ['Which cities are covered?', 'Pune, Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Goa, Kochi, Lucknow, and Ujjain.'],
  ['What counts as a long weekend?', 'A Friday or Monday holiday needs no extra leave. A Thursday or Tuesday holiday needs one bridge day.'],
];

write(
  'faq.html',
  page({
    title: 'FAQ · Tayyari',
    description: 'What Tayyari does and does not do: IRCTC reminders, direct trains, and long weekends.',
    path: '/faq.html',
    body: `<h1>FAQ</h1>${faqs.map(([q, a]) => `<article class="card"><h3>${esc(q)}</h3><p class="muted">${esc(a)}</p></article>`).join('')}<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    })}</script>`,
  }),
);

write(
  'about.html',
  page({
    title: 'About · Tayyari',
    description: 'Tayyari is a long weekend planner for people who travel by train in India.',
    path: '/about.html',
    body: `<h1>About Tayyari</h1><p>Tayyari lists the long weekends still ahead, curated direct trains from your city, a short plan for the destination, and a reminder the morning IRCTC booking opens. It does not sell tickets and it does not show live berth availability.</p><p>Tayyari is a <a href="https://play.google.com/store/apps/dev?id=8759041902208147900">D labs</a> app. D labs also makes <a href="https://easyhomeworkactivity.com/">Homework Buddy</a>, NextBinge, and MyBinge.</p>`,
  }),
);

write(
  'terms.html',
  page({
    title: 'Terms · Tayyari',
    description: 'Terms for the Tayyari website.',
    path: '/terms.html',
    body: `<h1>Terms</h1><p>Train timings, holiday dates, and day plans are curated guides. Confirm tickets, darshan slots, and leave with IRCTC and your employer. Tayyari is not affiliated with Indian Railways or IRCTC.</p>`,
  }),
);

write(
  'contact.html',
  page({
    title: 'Contact · Tayyari',
    description: 'Contact Tayyari.',
    path: '/contact.html',
    body: `<h1>Contact</h1><p>Questions and train-data corrections: use the email on the Google Play listing for com.tayyari.app. Homestays in Goa, Ujjain, Jaipur, or Kochi can write the same address to be mentioned in a guide. There is no paid placement.</p>`,
  }),
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u === '/' ? '/' : u}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);
writeFileSync(join(root, 'CNAME'), 'tayyariapp.com\n');
writeFileSync(
  join(root, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
);

console.log(`wrote ${urls.length} urls`);

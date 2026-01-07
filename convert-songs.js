import fs from 'fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('../all-songs.html', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

const trackItems = document.querySelectorAll('.track-item');
const songs = [];

trackItems.forEach((item) => {
  // Get song title
  const titleElement = item.querySelector('.text .bold');
  const title = titleElement ? titleElement.textContent.replace(/\s+/g, ' ').trim() : '';

  // Get artist name
  const artistElement = item.querySelector('.text .block');
  let artist = '';
  if (artistElement) {
    // Clone and remove the AUS span to get clean artist name
    const clone = artistElement.cloneNode(true);
    const ausSpans = clone.querySelectorAll('.aus');
    ausSpans.forEach(span => span.remove());
    artist = clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // Get thumbnail URL
  const imgElement = item.querySelector('.thumbnail img');
  const thumbnail = imgElement ? imgElement.getAttribute('src') : '';

  // Check if Australian artist
  const ausSpan = item.querySelector('.aus');
  const isAustralian = !!ausSpan;

  if (title && artist) {
    songs.push({
      title,
      artist,
      thumbnail,
      isAustralian
    });
  }
});

// Write to JSON file
fs.writeFileSync(
  './all-songs.json',
  JSON.stringify(songs, null, 2),
  'utf-8'
);

console.log(`Converted ${songs.length} songs to all-songs.json`);

import { readFile } from 'node:fs/promises';

const objectsSourcePath = new URL('../public/locales/en/objects.json', import.meta.url);

const normalizeText = (value) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();

const createObjectSlug = (title) =>
  normalizeText(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const data = JSON.parse(await readFile(objectsSourcePath, 'utf8'));
const items = data.items ?? {};
const usedSlugs = new Map();
const errors = [];

Object.entries(items)
  .sort(([leftId], [rightId]) => Number(leftId) - Number(rightId))
  .forEach(([id, item]) => {
    const title = normalizeText(item?.title);
    const slug = createObjectSlug(title);

    if (!title) {
      errors.push(`Missing English object title for ${id}`);
    }

    if (!slug) {
      errors.push(`Empty object slug for ${id}: ${title}`);
    }

    const existingId = usedSlugs.get(slug);

    if (existingId) {
      errors.push(`Duplicate object slug "${slug}" for ${existingId} and ${id}`);
    }

    usedSlugs.set(slug, id);
    console.log(`${id} -> ${title} -> ${slug}`);
  });

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}

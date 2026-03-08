import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('public/data/languages/l20.txt');
const outputDir = path.resolve('src/i18n/locales/ru');

const raw = fs.readFileSync(inputPath, 'utf8');

let lines = raw
  .split(/\r?\n/)
  .map((line) => line.replace(/\r/g, '').trim());

// старый flash-артефакт
if (lines[0]?.startsWith('tx=')) {
  lines[0] = lines[0].replace(/^tx=/, '');
}

// убираем пустые строки
lines = lines.filter((line) => line !== '');

const OBJECT_LINE_COUNT = 596; // 298 пар title/description
const UNIT_LINE_COUNT = 6;     // meter/meters/cm/cms/lightyear/lightyears
const PREFIX_COUNT = 16;       // yocto..milli + kilo..yotta, пустой метр вставим сами

const objectLines = lines.slice(0, OBJECT_LINE_COUNT);
const unitLines = lines.slice(OBJECT_LINE_COUNT, OBJECT_LINE_COUNT + UNIT_LINE_COUNT);
const prefixLines = lines.slice(
  OBJECT_LINE_COUNT + UNIT_LINE_COUNT,
  OBJECT_LINE_COUNT + UNIT_LINE_COUNT + PREFIX_COUNT
);
const uiLines = lines.slice(OBJECT_LINE_COUNT + UNIT_LINE_COUNT + PREFIX_COUNT);

if (objectLines.length !== 596) {
  throw new Error(`Ожидалось 596 строк объектов, получено ${objectLines.length}`);
}

if (unitLines.length !== 6) {
  throw new Error(`Ожидалось 6 строк единиц измерения, получено ${unitLines.length}`);
}

if (prefixLines.length !== 16) {
  throw new Error(`Ожидалось 16 строк приставок, получено ${prefixLines.length}`);
}

const items = [];
for (let i = 0; i < objectLines.length; i += 2) {
  items.push({
    title: objectLines[i],
    description: objectLines[i + 1] ?? '',
  });
}

const [
  meter,
  meters,
  centimeter,
  centimeters,
  lightyear,
  lightyears,
] = unitLines;

// В старой txt-структуре для колец нужен пустой префикс для "метра" по центру
const scalePrefixes = [
  ...prefixLines.slice(0, 8),
  '',
  ...prefixLines.slice(8),
];

const objectsJson = {
  items,
};

const unitsJson = {
  units: {
    meter,
    meters,
    centimeter,
    centimeters,
    lightyear,
    lightyears,
  },
  scalePrefixes,
};

const uiJson = {
  app: {
    title: uiLines[0] ?? 'Шкала масштабов Вселенной',
    zoomHint: uiLines[1] ?? 'Для изменения масштаба используйте полосу прокрутки или колесико мыши',
    objectHint: uiLines[2] ?? 'Для дополнительной информации щелкните по объекту',
    start: uiLines[3] ?? 'Начать',
  },
  language: {
    nativeName: uiLines[4] ?? 'Русский',
    englishName: uiLines[5] ?? 'Russian',
  },
  html: {
    meta: {
      description:
        'Шкала масштабов Вселенной. Соотношение размеров различных объектов (от элементарных частиц до галактик).',
      ogTitle: 'Шкала масштабов Вселенной',
      ogDescription:
        'Соотношение размеров различных объектов — от элементарных частиц до галактик.',
    },
    modal: {
      title: uiLines[0] ?? 'Шкала масштабов Вселенной',
      zoomHint: uiLines[1] ?? 'Для изменения масштаба используйте полосу прокрутки или колесико мыши',
      objectHint: uiLines[2] ?? 'Для дополнительной информации щелкните по объекту',
      startButton: 'Старт',
    },
    credits: {
      createdBy: 'Создано: Кэри Хуан, Майкл Хуан',
      webDev: 'Разработка веб: Мэтью Мартори',
      copyright: 'Copyright ©: Кэри и Майкл Хуан',
      translationAndDev: 'Перевод, разработка: Павел Фролов',
    },
  },
};

fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(
  path.join(outputDir, 'objects.json'),
  JSON.stringify(objectsJson, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outputDir, 'units.json'),
  JSON.stringify(unitsJson, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(outputDir, 'ui.json'),
  JSON.stringify(uiJson, null, 2),
  'utf8'
);

console.log('Готово:');
console.log(path.join(outputDir, 'objects.json'));
console.log(path.join(outputDir, 'units.json'));
console.log(path.join(outputDir, 'ui.json'));
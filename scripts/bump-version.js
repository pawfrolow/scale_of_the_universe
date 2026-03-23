#!/usr/bin/env node

import { execSync } from 'node:child_process';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const choices = ['patch', 'minor', 'major'];

console.log('\nВыбери тип повышения версии:');
console.log('1) patch');
console.log('2) minor');
console.log('3) major');
console.log('4) skip\n');

rl.question('Введите номер: ', (answer) => {
  const trimmed = answer.trim();

  if (trimmed === '4' || trimmed.toLowerCase() === 'skip') {
    console.log('Пропускаю bump версии');
    rl.close();
    process.exit(0);
  }

  const selected = choices[Number(trimmed) - 1];

  if (!selected) {
    console.error('Некорректный выбор');
    rl.close();
    process.exit(1);
  }

  try {
    execSync(`npm version ${selected} --no-git-tag-version`, {
      stdio: 'inherit',
    });

    execSync('git add package.json package-lock.json', {
      stdio: 'inherit',
    });

    console.log(`Версия повышена: ${selected}`);
    rl.close();
  } catch (error) {
    rl.close();
    process.exit(1);
  }
});
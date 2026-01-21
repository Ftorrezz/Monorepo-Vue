const fs = require('fs');
const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Remove lines 411 to 443 (1-indexed)
// In 0-indexed array, this is index 410 to 442
const start = 410;
const end = 443;

lines.splice(start, end - start);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Corrupted block removed.');

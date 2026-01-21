const fs = require('fs');
const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update appointments-grid for horizontal cards
const gridRegex = /\.appointments-grid\s*\{[\s\S]*?\}/;
const refinedGrid = `.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 20px;
  padding: 24px;
  background: #f8fafc;
}`;

if (gridRegex.test(content)) {
    content = content.replace(gridRegex, refinedGrid);
    console.log('Grid refined.');
}

// 2. Refine modern-appointment-card aesthetics
const cardCSSRegex = /\.modern-appointment-card\s*\{[\s\S]*?min-height:\s*100px;/;
const refinedCardCSS = `.modern-appointment-card {
  background: white;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: row;
  min-height: 120px;`;

if (cardCSSRegex.test(content)) {
    content = content.replace(cardCSSRegex, refinedCardCSS);
    console.log('Card CSS refined.');
}

// 3. Improve card time column
const timeColumnRegex = /\.card-time-column\s*\{[\s\S]*?width:\s*90px;/;
const refinedTimeColumn = `.card-time-column {
  width: 100px;`;

if (timeColumnRegex.test(content)) {
    content = content.replace(timeColumnRegex, refinedTimeColumn);
    console.log('Time column refined.');
}

// 4. Improve owner name and typography
const ownerNameRegex = /\.owner-name\s*\{[\s\S]*?font-size:\s*16px;/;
const refinedOwnerName = `.owner-name {
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.5px;`;

if (ownerNameRegex.test(content)) {
    content = content.replace(ownerNameRegex, refinedOwnerName);
    console.log('Owner name refined.');
}

// 5. Improve service chip
const serviceChipRegex = /\.service-chip\s*\{[\s\S]*?background:\s*#f1f5f9;/;
const refinedServiceChip = `.service-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;`;

if (serviceChipRegex.test(content)) {
    content = content.replace(serviceChipRegex, refinedServiceChip);
    console.log('Service chip refined.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully.');

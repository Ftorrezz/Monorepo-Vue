const fs = require('fs');
const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Improve Table View Consistency
const tableHeaderRegex = /\.appointments-table\s*\{[\s\S]*?box-shadow:\s*0\s*10px\s*15px\s*-3px\s*rgba\(0,\s*0,\s*0,\s*0\.1\);/;
const refinedTable = `.appointments-table {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;`;

if (tableHeaderRegex.test(content)) {
    content = content.replace(tableHeaderRegex, refinedTable);
    console.log('Table refined.');
}

// 2. Improve Month View Consistency (Day Cells)
const dayCellRegex = /\.day-cell\s*\{[\s\S]*?min-height:\s*120px;/;
const refinedDayCell = `.day-cell {
  background: white;
  min-height: 140px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  border: 0.5px solid #f1f5f9;`;

if (dayCellRegex.test(content)) {
    content = content.replace(dayCellRegex, refinedDayCell);
    console.log('Day cell refined.');
}

// 3. Add Responsiveness for the Grid
const gridMediaRegex = /@media\s*\(max-width:\s*768px\)\s*\{/;
const responsiveGrid = `@media (max-width: 1200px) {
  .appointments-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {`;

if (gridMediaRegex.test(content)) {
    content = content.replace(gridMediaRegex, responsiveGrid);
    console.log('Responsiveness added.');
}

// 4. Improve Empty States
const emptyStateRegex = /\.no-appointments\s*\{[\s\S]*?padding:\s*60px\s*0;/;
const refinedEmptyState = `.no-appointments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  gap: 24px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 24px;
  margin: 24px;
  border: 2px dashed #e2e8f0;`;

if (emptyStateRegex.test(content)) {
    content = content.replace(emptyStateRegex, refinedEmptyState);
    console.log('Empty state refined.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File updated successfully.');

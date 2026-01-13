const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Update available-badge and booked-badge
const oldBadges = `.available-badge {
  background: #dcfce7;
  color: #166534;
}

.booked-badge {
  background: #fef2f2;
  color: #991b1b;
}`;

const newBadges = `.available-badge {
  background: #22c55e;
  color: white;
}

.booked-badge {
  background: #ef4444;
  color: white;
}`;

if (content.includes(oldBadges)) {
    content = content.replace(oldBadges, newBadges);
    console.log('Badges CSS updated');
} else {
    console.log('Badges CSS not found or already updated');
}

// 2. Update time-slot-mini
const oldSlots = `.time-slot-mini.available {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #dcfce7;
}

.time-slot-mini.booked {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fee2e2;
}`;

const newSlots = `.time-slot-mini.available {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}

.time-slot-mini.booked {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}`;

if (content.includes(oldSlots)) {
    content = content.replace(oldSlots, newSlots);
    console.log('Slots CSS updated');
} else {
    console.log('Slots CSS not found or already updated');
}

// 3. Update appointments-grid
const oldGrid = `.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 20px;
}`;

const newGrid = `.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  padding: 16px;
}`;

if (content.includes(oldGrid)) {
    content = content.replace(oldGrid, newGrid);
    console.log('Grid CSS updated');
} else {
    console.log('Grid CSS not found or already updated');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');

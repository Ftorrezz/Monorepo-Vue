const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Helper to escape regex special characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 1. Update available-badge and booked-badge
// We use a flexible regex that allows for any amount of whitespace
const badgesRegex = /\.available-badge\s*,\s*\.booked-badge\s*\{\s*font-size:\s*10px;\s*padding:\s*2px\s*6px;\s*border-radius:\s*10px;\s*font-weight:\s*600;\s*\}\s*\.available-badge\s*\{\s*background:\s*#dcfce7;\s*color:\s*#166534;\s*\}\s*\.booked-badge\s*\{\s*background:\s*#fef2f2;\s*color:\s*#991b1b;\s*\}/;

const newBadges = `.available-badge,
.booked-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.available-badge {
  background: #22c55e;
  color: white;
}

.booked-badge {
  background: #ef4444;
  color: white;
}`;

// Try to find the block first to debug
const matchBadges = content.match(badgesRegex);
if (matchBadges) {
    content = content.replace(matchBadges[0], newBadges);
    console.log('Badges CSS updated');
} else {
    console.log('Badges CSS not found (regex mismatch)');
    // Fallback: try replacing just the individual rules if the combined one fails
    const availableBadgeRegex = /\.available-badge\s*\{\s*background:\s*#dcfce7;\s*color:\s*#166534;\s*\}/;
    const newAvailableBadge = `.available-badge {
  background: #22c55e;
  color: white;
}`;
    if (content.match(availableBadgeRegex)) {
        content = content.replace(availableBadgeRegex, newAvailableBadge);
        console.log('Available Badge CSS updated (fallback)');
    }

    const bookedBadgeRegex = /\.booked-badge\s*\{\s*background:\s*#fef2f2;\s*color:\s*#991b1b;\s*\}/;
    const newBookedBadge = `.booked-badge {
  background: #ef4444;
  color: white;
}`;
    if (content.match(bookedBadgeRegex)) {
        content = content.replace(bookedBadgeRegex, newBookedBadge);
        console.log('Booked Badge CSS updated (fallback)');
    }
}

// 2. Update time-slot-mini
const availableSlotRegex = /\.time-slot-mini\.available\s*\{\s*background:\s*#f0fdf4;\s*color:\s*#166534;\s*border:\s*1px\s*solid\s*#dcfce7;\s*\}/;
const newAvailableSlot = `.time-slot-mini.available {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}`;

if (content.match(availableSlotRegex)) {
    content = content.replace(availableSlotRegex, newAvailableSlot);
    console.log('Available Slot CSS updated');
} else {
    console.log('Available Slot CSS not found');
}

const bookedSlotRegex = /\.time-slot-mini\.booked\s*\{\s*background:\s*#fef2f2;\s*color:\s*#991b1b;\s*border:\s*1px\s*solid\s*#fee2e2;\s*\}/;
const newBookedSlot = `.time-slot-mini.booked {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}`;

if (content.match(bookedSlotRegex)) {
    content = content.replace(bookedSlotRegex, newBookedSlot);
    console.log('Booked Slot CSS updated');
} else {
    console.log('Booked Slot CSS not found');
}

// 3. Update appointments-grid
const gridRegex = /\.appointments-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(300px,\s*1fr\)\);\s*gap:\s*16px;\s*padding:\s*20px;\s*\}/;
const newGrid = `.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  padding: 16px;
}`;

if (content.match(gridRegex)) {
    content = content.replace(gridRegex, newGrid);
    console.log('Grid CSS updated');
} else {
    console.log('Grid CSS not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');

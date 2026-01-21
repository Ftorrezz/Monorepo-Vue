const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Template changes
const templateTarget = '<div class="card-glass-overlay"></div>';
const templateReplacement = `                <div class="card-glass-overlay"></div>
                <div class="card-gradient-border"></div>
                <div class="card-dot-pattern"></div>
                <div class="card-decorative-circle"></div>`;

if (content.includes(templateTarget)) {
    content = content.replace(templateTarget, templateReplacement);
    console.log('Template changes applied.');
} else {
    console.log('Template target not found.');
}

// 2. CSS Border changes
const borderChanges = [
    {
        target: `.modern-appointment-card.available {
  border-left: 6px solid #4ade80;
}`,
        replacement: `.modern-appointment-card.available {
  border: 1px solid rgba(74, 222, 128, 0.2);
}`
    },
    {
        target: `.modern-appointment-card.booked {
  border-left: 6px solid #f87171;
}`,
        replacement: `.modern-appointment-card.booked {
  border: 1px solid rgba(248, 113, 113, 0.2);
}`
    },
    {
        target: `.modern-appointment-card.selected {
  border-left: 6px solid #6366f1;
  background: #f5f7ff;
}`,
        replacement: `.modern-appointment-card.selected {
  border: 1px solid rgba(99, 102, 241, 0.3);
  background: rgba(245, 247, 255, 0.8);
}`
    }
];

borderChanges.forEach(change => {
    if (content.includes(change.target)) {
        content = content.replace(change.target, change.replacement);
        console.log(`CSS Border change applied for ${change.target.split('{')[0].trim()}.`);
    } else {
        console.log(`CSS Border target not found for ${change.target.split('{')[0].trim()}.`);
    }
});

// 3. CSS Glass overlay refinement
const glassRegex = /\.card-glass-overlay\s*\{[\s\S]*?background:\s*linear-gradient\(135deg,\s*rgba\(255,\s*255,\s*255,\s*0\.1\)\s*0%,\s*rgba\(255,\s*255,\s*255,\s*0\.05\)\s*100%\);[\s\S]*?\}/;

const glassReplacement = `.card-glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: none;
  z-index: 0;
}

.card-gradient-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0.8;
  z-index: 2;
}

.modern-appointment-card.available .card-gradient-border {
  background: linear-gradient(90deg, #4ade80, #22c55e);
}

.modern-appointment-card.booked .card-gradient-border {
  background: linear-gradient(90deg, #f87171, #ef4444);
}

.modern-appointment-card.selected .card-gradient-border {
  background: linear-gradient(90deg, #6366f1, #4f46e5);
}

.card-dot-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  opacity: 0.05;
  background-image: radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 6px 6px;
  z-index: 1;
}

.card-decorative-circle {
  position: absolute;
  bottom: -30px;
  right: -30px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0.1;
  z-index: 1;
  transition: all 0.4s ease;
  filter: blur(15px);
}

.modern-appointment-card.available .card-decorative-circle {
  background: #4ade80;
}

.modern-appointment-card.booked .card-decorative-circle {
  background: #f87171;
}

.modern-appointment-card.selected .card-decorative-circle {
  background: #6366f1;
}`;

if (glassRegex.test(content)) {
    content = content.replace(glassRegex, glassReplacement);
    console.log('CSS Glass overlay refined.');
} else {
    console.log('CSS Glass overlay target not found.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved.');

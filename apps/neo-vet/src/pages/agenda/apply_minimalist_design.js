const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Template changes - Remove decorative elements and keep it clean
const templateTarget = `<div class="card-glass-overlay"></div>
                <div class="card-gradient-border"></div>
                <div class="card-dot-pattern"></div>
                <div class="card-decorative-circle"></div>`;

const templateReplacement = `<div class="card-status-bar"></div>`;

if (content.includes(templateTarget)) {
    content = content.replace(templateTarget, templateReplacement);
    console.log('Template changes applied (removed modern elements, added status bar).');
} else {
    // Fallback if previous edit was partial
    content = content.replace(/<div class="card-glass-overlay"><\/div>\s*<div class="card-gradient-border"><\/div>\s*<div class="card-dot-pattern"><\/div>\s*<div class="card-decorative-circle"><\/div>/g, templateReplacement);
    console.log('Template changes applied via regex.');
}

// 2. CSS Changes - Minimalist Style
const minimalistCSS = `
.modern-appointment-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.modern-appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  z-index: 2;
}

.modern-appointment-card.available .card-status-bar {
  background: #10b981;
}

.modern-appointment-card.booked .card-status-bar {
  background: #ef4444;
}

.modern-appointment-card.selected {
  background: #f8faff;
  border-color: #3b82f6;
}

.modern-appointment-card.selected .card-status-bar {
  background: #3b82f6;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
}

.status-indicator {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-indicator.available {
  background: #ecfdf5;
  color: #059669;
}

.status-indicator.booked, .status-indicator.confirmed {
  background: #fef2f2;
  color: #dc2626;
}

.appointment-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-avatar {
  background: #f1f5f9;
  color: #64748b;
}

.info-text .label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 600;
}

.info-text .value {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.available-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  gap: 4px;
  color: #10b981;
}

.available-text {
  font-weight: 600;
  font-size: 15px;
}

.available-subtext {
  font-size: 11px;
  color: #94a3b8;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.service-tag {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
`;

// Replace the entire block of modern styles
const cssStart = '.modern-appointment-card {';
const cssEnd = '.action-btns {'; // We'll keep action-btns as is or replace up to it

// Using a more robust way to replace the CSS section
const cssRegex = /\.modern-appointment-card\s*\{[\s\S]*?\.action-btns\s*\{/;
if (cssRegex.test(content)) {
    content = content.replace(cssRegex, minimalistCSS + '\n\n.action-btns {');
    console.log('Minimalist CSS applied.');
} else {
    console.log('CSS target section not found.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved.');

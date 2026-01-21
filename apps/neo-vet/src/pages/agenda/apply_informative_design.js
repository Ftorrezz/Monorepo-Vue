const fs = require('fs');
const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Template changes - Add phone and professional
const ownerRegex = /<div class="label">Propietario<\/div>\s*<div class="value">\{\{\s*slot\.appointment\.ownerName\s*\}\}<\/div>/;
const ownerReplacement = `<div class="label">Propietario</div>
                          <div class="value">{{ slot.appointment.ownerName }}</div>
                          <div class="contact-info" v-if="slot.appointment.ownerPhone">
                            <q-icon name="phone" size="12px" />
                            <a :href="'tel:' + slot.appointment.ownerPhone" class="phone-link">{{ slot.appointment.ownerPhone }}</a>
                          </div>`;

const petRegex = /<div class="label">Mascota<\/div>\s*<div class="value">\{\{\s*slot\.appointment\.petName\s*\}\}\s*<span class="pet-type">\(\{\{\s*slot\.appointment\.petType\s*\|\|\s*'Mascota'\s*\}\}\)<\/span><\/div>/;
const petReplacement = `<div class="label">Mascota</div>
                          <div class="value">{{ slot.appointment.petName }} <span class="pet-type">({{ slot.appointment.petType || 'Mascota' }})</span></div>
                          <div class="professional-info" v-if="slot.appointment.professionalName">
                            <q-icon name="badge" size="12px" />
                            <span>{{ slot.appointment.professionalName }}</span>
                          </div>`;

if (ownerRegex.test(content)) {
    content = content.replace(ownerRegex, ownerReplacement);
    console.log('Owner phone added to template.');
} else {
    console.log('Owner target not found.');
}

if (petRegex.test(content)) {
    content = content.replace(petRegex, petReplacement);
    console.log('Professional name added to template.');
} else {
    console.log('Pet target not found.');
}

// 2. CSS Changes - Informative Modern Style
const informativeCSS = `
.modern-appointment-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #eef2f6;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
}

.modern-appointment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
  border-color: #d1d5db;
}

.card-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  z-index: 2;
}

.modern-appointment-card.available .card-status-bar {
  background: linear-gradient(to bottom, #10b981, #059669);
}

.modern-appointment-card.booked .card-status-bar {
  background: linear-gradient(to bottom, #f87171, #ef4444);
}

.modern-appointment-card.selected {
  background: #f0f7ff;
  border-color: #3b82f6;
}

.modern-appointment-card.selected .card-status-bar {
  background: #3b82f6;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  color: #1e293b;
  font-size: 18px;
  background: #f8fafc;
  padding: 4px 12px;
  border-radius: 10px;
}

.status-indicator {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-indicator.available {
  background: #dcfce7;
  color: #15803d;
}

.status-indicator.booked, .status-indicator.confirmed {
  background: #fee2e2;
  color: #b91c1c;
}

.appointment-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-avatar {
  background: #f1f5f9;
  color: #475569;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-text .label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.info-text .value {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.contact-info, .professional-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
}

.phone-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.phone-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.available-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  gap: 8px;
  color: #10b981;
  opacity: 0.8;
}

.available-text {
  font-weight: 800;
  font-size: 18px;
}

.available-subtext {
  font-size: 12px;
  color: #64748b;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.service-tag {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 6px;
}
`;

const cssRegex = /\.modern-appointment-card\s*\{[\s\S]*?\.action-btns\s*\{/;
if (cssRegex.test(content)) {
    content = content.replace(cssRegex, informativeCSS + '\n\n.action-btns {');
    console.log('Informative CSS applied.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved.');

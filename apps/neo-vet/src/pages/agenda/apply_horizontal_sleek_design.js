const fs = require('fs');
const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Template changes - Horizontal Layout
const cardTemplateRegex = /<div\s+[\s\S]*?v-for="slot in daySlots"[\s\S]*?class="modern-appointment-card"[\s\S]*?@click="selectTimeSlot\(\{ fullDate: selectedDate, slots: daySlots \}, slot\)"\s*>[\s\S]*?<\/div>\s*(?=<\/div>)/;

const horizontalTemplate = `
              <div class="modern-appointment-card" :class="{
                  'available': slot.status === 'available',
                  'booked': slot.status === 'booked' || slot.status === 'confirmed',
                  'selected': slot.status === 'selected'
                }"
                @click="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, slot)"
              >
                <div class="card-status-bar"></div>
                
                <!-- Columna Izquierda: Tiempo -->
                <div class="card-time-column">
                  <q-icon :name="getTimeIcon(slot.status)" size="24px" :color="getTimeIconColor(slot.status)" />
                  <div class="time-value">{{ slot.time }}</div>
                  <div class="status-dot" :class="slot.status"></div>
                </div>

                <!-- Columna Derecha: Detalles -->
                <div class="card-details-column">
                  <template v-if="slot.appointment">
                    <div class="details-header">
                      <div class="owner-info">
                        <span class="owner-name">{{ slot.appointment.ownerName }}</span>
                        <div class="contact-link" v-if="slot.appointment.ownerPhone">
                          <q-icon name="phone" size="12px" />
                          <a :href="'tel:' + slot.appointment.ownerPhone" @click.stop>{{ slot.appointment.ownerPhone }}</a>
                        </div>
                      </div>
                      <div class="status-badge" :class="slot.status">
                        {{ getStatusLabel(slot.status) }}
                      </div>
                    </div>

                    <div class="details-body">
                      <div class="pet-info">
                        <q-icon name="pets" size="14px" color="grey-7" />
                        <span class="pet-name">{{ slot.appointment.petName }}</span>
                        <span class="pet-species">({{ slot.appointment.petType || 'Mascota' }})</span>
                      </div>
                      <div class="pro-info" v-if="slot.appointment.professionalName">
                        <q-icon name="badge" size="14px" color="grey-7" />
                        <span>{{ slot.appointment.professionalName }}</span>
                      </div>
                    </div>

                    <div class="details-footer">
                      <div class="service-chip">
                        <q-icon :name="selectedService.icon" size="12px" />
                        <span>{{ selectedService.name }}</span>
                      </div>
                      <div class="action-buttons">
                        <q-btn flat round dense icon="visibility" size="sm" color="primary" @click.stop="viewAppointment(slot)" />
                        <q-btn flat round dense icon="delete_outline" size="sm" color="negative" @click.stop="cancelAppointment(slot)" />
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <div class="available-horizontal">
                      <div class="available-main">
                        <q-icon name="add_circle" size="24px" color="positive" />
                        <span class="available-title">Disponible</span>
                      </div>
                      <span class="available-hint">Toca para agendar una cita</span>
                    </div>
                  </template>
                </div>
              </div>`;

if (cardTemplateRegex.test(content)) {
    content = content.replace(cardTemplateRegex, horizontalTemplate);
    console.log('Horizontal template applied.');
} else {
    console.log('Card template target not found.');
}

// 2. CSS Changes - Horizontal Sleek Style
const horizontalCSS = `
.modern-appointment-card {
  background: white;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: row;
  min-height: 100px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.modern-appointment-card:hover {
  transform: translateX(4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

/* Efecto Glow en Hover */
.modern-appointment-card.available:hover { box-shadow: 0 0 20px rgba(16, 185, 129, 0.15); }
.modern-appointment-card.booked:hover { box-shadow: 0 0 20px rgba(239, 68, 68, 0.15); }
.modern-appointment-card.selected:hover { box-shadow: 0 0 20px rgba(59, 130, 246, 0.15); }

.card-status-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 5px;
  z-index: 10;
}

.modern-appointment-card.available .card-status-bar { background: #10b981; }
.modern-appointment-card.booked .card-status-bar { background: #ef4444; }
.modern-appointment-card.selected .card-status-bar { background: #3b82f6; }

/* Columna de Tiempo */
.card-time-column {
  width: 90px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-right: 1px solid #f1f5f9;
  padding: 12px;
}

.time-value {
  font-weight: 800;
  font-size: 18px;
  color: #1e293b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-dot.available { background: #10b981; box-shadow: 0 0 8px #10b981; }
.status-dot.booked { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
.status-dot.selected { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }

/* Columna de Detalles */
.card-details-column {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.owner-info {
  display: flex;
  flex-direction: column;
}

.owner-name {
  font-weight: 700;
  font-size: 16px;
  color: #334155;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 2px;
}

.contact-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.status-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
}
.status-badge.available { background: #dcfce7; color: #15803d; }
.status-badge.booked { background: #fee2e2; color: #b91c1c; }
.status-badge.selected { background: #dbeafe; color: #1e40af; }

.details-body {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 4px 0;
}

.pet-info, .pro-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.pet-name { font-weight: 700; color: #1e293b; }
.pet-species { font-size: 11px; color: #94a3b8; }

.details-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.service-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* Estado Disponible Horizontal */
.available-horizontal {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.available-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.available-title {
  font-weight: 700;
  font-size: 16px;
  color: #059669;
}

.available-hint {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 34px;
}
`;

const cssRegex = /\.modern-appointment-card\s*\{[\s\S]*?\.action-btns\s*\{/;
if (cssRegex.test(content)) {
    content = content.replace(cssRegex, horizontalCSS + '\n\n.action-btns {');
    console.log('Horizontal CSS applied.');
} else {
    console.log('CSS target section not found.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File saved.');

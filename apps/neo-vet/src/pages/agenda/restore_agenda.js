const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the corrupted card view section
const startMarker = '<!-- Vista diaria - Modo Tarjetas -->';
const endMarker = '<!-- Vista diaria - Modo Tabla -->';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newCardView = `          <!-- Vista diaria - Modo Tarjetas -->
          <div v-if="selectedService && viewMode === 'day' && dayViewMode === 'cards'" class="day-view-container">
            <div class="day-view-header">
              <div class="day-info">
                <div class="day-meta">
                  <q-chip color="positive" text-color="white" icon="check_circle">
                    {{ daySlots.filter(s => s.status === 'available').length }} disponibles
                  </q-chip>
                  <q-chip color="negative" text-color="white" icon="event_busy">
                    {{ daySlots.filter(s => s.status === 'booked').length }} ocupados
                  </q-chip>
                </div>
              </div>

              <q-btn
                outline
                color="primary"
                icon="calendar_month"
                label="Cambiar Fecha"
                @click="showDatePicker = true"
                no-caps
              />
            </div>

            <!-- Grid de citas -->
            <div class="appointments-grid">
              <div 
                v-for="slot in daySlots" 
                :key="slot.time"
                class="modern-appointment-card"
                :class="{
                  'available': slot.status === 'available',
                  'booked': slot.status === 'booked',
                  'selected': slot.status === 'selected'
                }"
                @click="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, slot)"
              >
                <div class="card-glass-overlay"></div>
                
                <div class="card-header">
                  <div class="time-badge">
                    <q-icon :name="getTimeIcon(slot.status)" size="16px" />
                    <span>{{ slot.time }}</span>
                  </div>
                  <div class="status-indicator" :class="slot.status">
                    {{ getStatusLabel(slot.status) }}
                  </div>
                </div>

                <div class="card-body">
                  <template v-if="slot.appointment">
                    <div class="appointment-info">
                      <div class="info-row">
                        <q-avatar size="36px" class="info-avatar person">
                          <q-icon name="person" />
                        </q-avatar>
                        <div class="info-text">
                          <div class="label">Propietario</div>
                          <div class="value">{{ slot.appointment.ownerName }}</div>
                        </div>
                      </div>
                      <div class="info-row">
                        <q-avatar size="36px" class="info-avatar pet">
                          <q-icon name="pets" />
                        </q-avatar>
                        <div class="info-text">
                          <div class="label">Mascota</div>
                          <div class="value">{{ slot.appointment.petName }} <span class="pet-type">({{ slot.appointment.petType || 'Mascota' }})</span></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="available-info">
                      <q-icon name="add_circle_outline" size="40px" color="positive" class="add-icon" />
                      <div class="available-text">Disponible</div>
                      <div class="available-subtext">Toca para agendar</div>
                    </div>
                  </template>
                </div>

                <div class="card-footer" v-if="slot.appointment">
                  <div class="service-tag">
                    <q-icon :name="selectedService.icon" size="14px" />
                    <span>{{ selectedService.name }}</span>
                  </div>
                  <div class="action-btns">
                    <q-btn flat round dense icon="visibility" color="primary" @click.stop="viewAppointment(slot)" />
                    <q-btn flat round dense icon="delete_outline" color="negative" @click.stop="cancelAppointment(slot)" />
                  </div>
                </div>
              </div>
            </div>
          </div>\n\n          `;

    content = content.substring(0, startIndex) + newCardView + content.substring(endIndex);
    console.log('Card view template restored and modernized');
}

// 2. Fix the end of the template
const templateEndMarker = '</template>';
const lastClosingDiv = '</div>';
const templateEndIndex = content.indexOf(templateEndMarker);

if (templateEndIndex !== -1) {
    let templateSection = content.substring(0, templateEndIndex);
    // Remove all trailing </div> tags from the template section
    while (templateSection.trim().endsWith('</div>')) {
        templateSection = templateSection.trim().slice(0, -6);
    }
    // Add back the necessary closing tags for the main layout
    // Based on the structure: fullscreen-calendar -> app-layout -> main-content -> calendar-content
    templateSection += '\n        </div>\n      </div>\n    </div>\n  </div>\n';

    content = templateSection + content.substring(templateEndIndex);
    console.log('Template end tags balanced');
}

// 3. Ensure CSS is correct (remove duplicates if any)
if (content.includes('/* MODERN CARDS DESIGN */')) {
    // Already has it, but let's make sure it's clean
    const cssStart = content.indexOf('/* MODERN CARDS DESIGN */');
    const cssEnd = content.lastIndexOf('</style>');
    const modernCSS = `/* MODERN CARDS DESIGN */
.modern-appointment-card {
  position: relative;
  border-radius: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modern-appointment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.12);
  background: rgba(255, 255, 255, 0.9);
}

.modern-appointment-card.available {
  border-left: 6px solid #10b981;
}

.modern-appointment-card.booked {
  border-left: 6px solid #ef4444;
}

.modern-appointment-card.selected {
  border-left: 6px solid #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.status-indicator {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 6px;
}

.status-indicator.available { color: #059669; background: #ecfdf5; }
.status-indicator.booked { color: #dc2626; background: #fef2f2; }

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-avatar {
  background: #f8fafc;
  color: #64748b;
}

.info-avatar.person { color: #3b82f6; background: #eff6ff; }
.info-avatar.pet { color: #ec4899; background: #fdf2f8; }

.info-text .label {
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 700;
}

.info-text .value {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.pet-type {
  font-weight: 400;
  color: #64748b;
  font-size: 13px;
}

.available-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  gap: 8px;
}

.add-icon {
  transition: transform 0.3s ease;
}

.modern-appointment-card:hover .add-icon {
  transform: scale(1.2) rotate(90deg);
}

.available-text {
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

.available-subtext {
  font-size: 12px;
  color: #94a3b8;
}

.card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}
`;
    content = content.substring(0, cssStart) + modernCSS + content.substring(cssEnd);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully restored and updated Agenda.vue');

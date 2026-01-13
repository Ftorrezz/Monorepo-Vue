const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Fuentes\\Desarrollo web\\Neodimio\\Frontend-Neodimio-VueJs\\Monorepo-Vue\\apps\\neo-vet\\src\\pages\\agenda\\Agenda.vue';

if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

const oldGrid = `            <!-- Grid de citas -->
            <div class="appointments-grid">
              <div 
                v-for="slot in daySlots" 
                :key="slot.time"
                class="appointment-card"
                :class="{
                  'available': slot.status === 'available',
                  'booked': slot.status === 'booked',
                  'selected': slot.status === 'selected'
                }"
                @click="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, slot)"
              >
                <!-- Header de la tarjeta -->
                <div class="appointment-header">
                  <div class="time-section">
                    <div class="time-display">
                      <q-icon 
                        :name="getTimeIcon(slot.status)" 
                        :color="getTimeIconColor(slot.status)"
                        size="18px"
                        class="time-icon"
                      />
                      <span class="time-text">{{ slot.time }}</span>
                    </div>
                    <q-badge 
                      :color="slot.status === 'available' ? 'positive' : slot.status === 'booked' ? 'negative' : 'primary'"
                      :label="getStatusLabel(slot.status)"
                      class="status-badge"
                    />
                  </div>
                  
                  <div class="actions-section">
                    <q-btn
                      v-if="slot.status === 'available'"
                      size="sm"
                      color="positive"
                      icon="add"
                      round
                      flat
                      @click.stop="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, slot)"
                    >
                      <q-tooltip>Agendar cita</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="slot.status === 'booked'"
                      size="sm"
                      color="info"
                      icon="visibility"
                      round
                      flat
                      @click.stop="viewAppointment(slot)"
                    >
                      <q-tooltip>Ver detalles</q-tooltip>
                    </q-btn>
                  </div>
                </div>

                <!-- Contenido de la cita -->
                <div class="appointment-content">
                  <div v-if="slot.appointment" class="appointment-details">
                    <div class="client-info">
                      <div class="client-avatar">
                        <q-avatar color="primary" text-color="white" size="32px">
                          <q-icon name="person" />
                        </q-avatar>
                      </div>
                      <div class="client-details">
                        <div class="client-name">{{ slot.appointment.ownerName }}</div>
                        <div class="client-meta">Cliente</div>
                      </div>
                    </div>
                    
                    <q-separator vertical />
                    
                    <div class="pet-info">
                      <div class="pet-avatar">
                        <q-avatar color="secondary" text-color="white" size="32px">
                          <q-icon name="pets" />
                        </q-avatar>
                      </div>
                      <div class="pet-details">
                        <div class="pet-name">{{ slot.appointment.petName }}</div>
                        <div class="pet-type">{{ slot.appointment.petType || 'Mascota' }}</div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="empty-slot">
                    <div class="empty-slot-content">
                      <q-icon name="event_available" size="28px" color="positive" />
                      <div class="empty-slot-text">
                        <div class="empty-slot-title">Horario Disponible</div>
                        <div class="empty-slot-subtitle">Haz clic para agendar</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer con información del servicio -->
                <div v-if="slot.appointment" class="appointment-footer">
                  <div class="service-info">
                    <q-icon :name="selectedService.icon" size="14px" />
                    <span>{{ selectedService.name }}</span>
                  </div>
                  <div class="duration-info">
                    <q-icon name="schedule" size="14px" />
                    <span>{{ selectedService.duration }}min</span>
                  </div>
                </div>
              </div>
            </div>`;

const newGrid = `            <!-- Grid de citas -->
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
            </div>`;

const modernCSS = `
/* MODERN CARDS DESIGN */
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

// Replace template
if (content.includes(oldGrid)) {
    content = content.replace(oldGrid, newGrid);
    console.log('Template updated');
} else {
    console.error('Could not find old grid template');
    // Try a more flexible match if exact match fails
    const gridStart = '<!-- Grid de citas -->';
    const gridEnd = '<!-- Vista diaria - Modo Tabla -->';
    const startIndex = content.indexOf(gridStart);
    const endIndex = content.indexOf(gridEnd);
    if (startIndex !== -1 && endIndex !== -1) {
        content = content.substring(0, startIndex) + newGrid + '\n\n          ' + content.substring(endIndex);
        console.log('Template updated (flexible match)');
    } else {
        process.exit(1);
    }
}

// Add CSS
if (content.includes('</style>')) {
    content = content.replace('</style>', modernCSS + '\n</style>');
    console.log('CSS updated');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Agenda.vue');

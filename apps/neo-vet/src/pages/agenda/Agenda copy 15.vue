<template>
  <div class="fullscreen-calendar">
    <div class="app-layout">
      <!-- Sidebar de servicios -->
      <div class="services-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- Header del sidebar -->
        <div class="sidebar-header">
          <div class="sidebar-logo" v-show="!sidebarCollapsed">
            <q-icon name="local_hospital" size="28px" color="white" />
            <span class="logo-text">VetCalendar</span>
          </div>
          
          <q-btn
            flat
            round
            :icon="sidebarCollapsed ? 'menu' : 'menu_open'"
            color="white"
            size="sm"
            @click="toggleSidebar"
            class="toggle-btn"
          />
        </div>

        <!-- Buscador de servicios -->
        <div class="sidebar-search" v-show="!sidebarCollapsed">
          <q-input
            v-model="serviceSearch"
            placeholder="Buscar servicio..."
            outlined
            dense
            dark
            color="white"
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="white" />
            </template>
          </q-input>
        </div>

        <!-- Lista de servicios -->
        <div class="services-list">
          <div class="services-header" v-show="!sidebarCollapsed">
            <span class="services-title">Servicios Disponibles</span>
            <q-badge color="white" text-color="primary" :label="filteredServices.length" />
          </div>

          <!-- Servicios filtrados -->
          <div class="services-items">
            <div
              v-for="service in filteredServices"
              :key="service.id"
              class="service-item"
              :class="{ 
                'active': selectedService?.id === service.id,
                'collapsed': sidebarCollapsed 
              }"
              @click="selectService(service)"
            >
              <div class="service-icon-container">
                <q-avatar 
                  :color="selectedService?.id === service.id ? 'white' : service.color" 
                  :text-color="selectedService?.id === service.id ? service.color : 'white'"
                  size="40px"
                  class="service-avatar"
                >
                  <q-icon :name="service.icon" size="20px" />
                </q-avatar>
                
                <!-- Indicador de servicio activo -->
                <div 
                  v-if="selectedService?.id === service.id" 
                  class="active-indicator"
                ></div>
              </div>

              <div class="service-content" v-show="!sidebarCollapsed">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-details">
                  <div class="service-meta">
                    <q-icon name="schedule" size="14px" />
                    <span>{{ service.duration }}min</span>
                  </div>
                  <div class="service-meta">
                    <q-icon name="attach_money" size="14px" />
                    <span>${{ service.price }}</span>
                  </div>
                </div>
                
                <!-- Estadísticas del servicio -->
                <div class="service-stats" v-if="selectedService?.id === service.id">
                  <div class="stat-mini">
                    <span class="stat-value">{{ getServiceStats(service.id).todayAppointments }}</span>
                    <span class="stat-label">Hoy</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-value">{{ getServiceStats(service.id).weekAppointments }}</span>
                    <span class="stat-label">Semana</span>
                  </div>
                </div>
              </div>

              <!-- Tooltip para sidebar colapsado -->
              <q-tooltip 
                v-if="sidebarCollapsed" 
                anchor="center right" 
                self="center left"
                :offset="[10, 0]"
                class="service-tooltip"
              >
                <div class="tooltip-content">
                  <div class="tooltip-title">{{ service.name }}</div>
                  <div class="tooltip-details">
                    <div>{{ service.duration }} minutos</div>
                    <div>${{ service.price }}</div>
                  </div>
                </div>
              </q-tooltip>
            </div>
          </div>
        </div>

        <!-- Footer del sidebar -->
        <div class="sidebar-footer" v-show="!sidebarCollapsed">
          <div class="current-stats" v-if="selectedService">
            <div class="stats-title">
              <q-icon name="analytics" size="16px" />
              <span>Estadísticas de Hoy</span>
            </div>
            <div class="stats-grid">
              <div class="mini-stat available">
                <div class="mini-stat-value">{{ currentStats.available }}</div>
                <div class="mini-stat-label">Libres</div>
              </div>
              <div class="mini-stat booked">
                <div class="mini-stat-value">{{ currentStats.booked }}</div>
                <div class="mini-stat-label">Ocupados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
        <!-- Header principal -->
        <div class="main-header">
          <div class="header-left">
            <div class="breadcrumb" v-if="selectedService">
              <q-icon :name="selectedService.icon" size="20px" :color="selectedService.color" />
              <span class="service-name">{{ selectedService.name }}</span>
              <q-icon name="keyboard_arrow_right" size="16px" color="grey-5" />
              <span class="view-name">{{ viewMode === 'month' ? 'Vista Mensual' : 'Vista Diaria' }}</span>
            </div>
            <h1 v-else class="welcome-title">Selecciona un Servicio</h1>
          </div>

          <div class="header-actions" v-if="selectedService">
            <!-- Toggle de vista -->
            <div class="view-toggle">
              <q-btn-toggle
                v-model="viewMode"
                :options="[
                  { label: 'Mes', value: 'month', icon: 'calendar_view_month' },
                  { label: 'Día', value: 'day', icon: 'calendar_view_day' }
                ]"
                color="primary"
                outline
                no-caps
              />
            </div>

            <!-- Navegación por mes -->
            <div v-if="viewMode === 'month'" class="navigation-controls">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="previousMonth"
                color="primary"
                size="md"
              />
              <div class="period-display">
                {{ currentMonthName }} {{ currentYear }}
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="nextMonth"
                color="primary"
                size="md"
              />
            </div>

            <!-- Navegación por día -->
            <div v-if="viewMode === 'day'" class="navigation-controls">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="previousDay"
                color="primary"
                size="md"
              />
              <div class="period-display">
                {{ selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                }) }}
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="nextDay"
                color="primary"
                size="md"
              />
            </div>

            <q-btn
              color="primary"
              icon="today"
              label="Hoy"
              @click="goToToday"
              no-caps
            />
          </div>
        </div>

        <!-- Contenido del calendario -->
        <div class="calendar-content">
          <!-- Vista mensual -->
          <div v-if="selectedService && viewMode === 'month'" class="calendar-container">
            <!-- Días de la semana -->
            <div class="weekdays-header">
              <div
                v-for="day in weekdays"
                :key="day"
                class="weekday-cell"
              >
                {{ day }}
              </div>
            </div>

            <!-- Grid del calendario -->
            <div class="calendar-grid">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="day-cell"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'weekend': day.isWeekend,
                  'past': day.isPast
                }"
                @click="selectDayForDayView(day)"
              >
                <div class="day-header">
                  <span class="day-number">{{ day.date }}</span>
                  <div class="day-stats" v-if="day.isCurrentMonth && !day.isPast">
                    <span class="available-badge">{{ day.availableSlots }}</span>
                    <span class="booked-badge">{{ day.bookedSlots }}</span>
                  </div>
                </div>

                <!-- Horarios del día -->
                <div class="day-slots-summary" v-if="day.isCurrentMonth && !day.isPast">
                  <div
                    v-for="(slot, index) in day.slots.slice(0, 4)"
                    :key="slot.time"
                    class="time-slot-mini"
                    :class="{
                      'available': slot.status === 'available',
                      'booked': slot.status === 'booked'
                    }"
                  >
                    <div class="slot-time-mini">{{ slot.time }}</div>
                  </div>
                  <div v-if="day.slots.length > 4" class="more-slots">
                    +{{ day.slots.length - 4 }} más
                  </div>
                </div>

                <!-- Mensaje para días inactivos -->
                <div v-if="(day.isPast || day.isWeekend) && day.isCurrentMonth" class="inactive-day">
                  <q-icon
                    :name="day.isWeekend ? 'weekend' : 'event_busy'"
                    size="md"
                    color="grey-4"
                  />
                  <span>{{ day.isWeekend ? 'Fin de semana' : 'Día pasado' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Vista diaria -->
          <div v-if="selectedService && viewMode === 'day'" class="day-view-container">
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
                        size="20px"
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
                        <q-avatar color="primary" text-color="white" size="40px">
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
                        <q-avatar color="secondary" text-color="white" size="40px">
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
                      <q-icon name="event_available" size="32px" color="positive" />
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
                    <q-icon :name="selectedService.icon" size="16px" />
                    <span>{{ selectedService.name }}</span>
                  </div>
                  <div class="duration-info">
                    <q-icon name="schedule" size="16px" />
                    <span>{{ selectedService.duration }}min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado sin servicio seleccionado -->
          <div v-else-if="!selectedService" class="no-service-selected">
            <div class="welcome-content">
              <q-icon name="medical_services" size="120px" color="primary" class="welcome-icon" />
              <h2>Bienvenido a VetCalendar</h2>
              <p>Selecciona un servicio del menú lateral para comenzar a gestionar las citas</p>
              
              <!-- Estadísticas generales -->
              <div class="welcome-stats">
                <div class="welcome-stat">
                  <q-icon name="event" size="24px" color="primary" />
                  <div class="stat-info">
                    <div class="stat-number">{{ totalAppointmentsToday }}</div>
                    <div class="stat-text">Citas hoy</div>
                  </div>
                </div>
                <div class="welcome-stat">
                  <q-icon name="trending_up" size="24px" color="positive" />
                  <div class="stat-info">
                    <div class="stat-number">{{ totalServicesActive }}</div>
                    <div class="stat-text">Servicios activos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog selector de fecha -->
    <q-dialog v-model="showDatePicker">
      <q-date
        v-model="selectedDateString"
        @update:model-value="updateSelectedDate"
        color="primary"
        :options="dateOptions"
      />
    </q-dialog>

    <!-- Dialog para asignar cita -->
    <q-dialog
      v-model="showAppointmentDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="appointment-dialog">
        <q-card-section class="dialog-header">
          <div class="header-info">
            <q-icon :name="selectedService?.icon" size="32px" color="white" />
            <div>
              <h4>Nueva Cita - {{ selectedService?.name }}</h4>
              <p>{{ selectedSlot?.dayName }}, {{ selectedSlot?.date }} - {{ selectedSlot?.time }}</p>
            </div>
          </div>
          <q-btn
            flat
            round
            icon="close"
            @click="closeAppointmentDialog"
            color="white"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-content">
          <div class="appointment-form">
            <!-- Búsqueda de propietario -->
            <div class="form-section">
              <h5><q-icon name="person_search" /> 1. Seleccionar Propietario</h5>
              <div class="search-container">
                <q-input
                  v-model="ownerSearch"
                  placeholder="Buscar propietario por nombre, teléfono o email..."
                  outlined
                  clearable
                  class="search-input"
                  @keyup.enter="searchOwners"
                  @input="onOwnerSearchInput"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      color="primary"
                      icon="search"
                      flat
                      round
                      @click="searchOwners"
                      :loading="searchingOwners"
                    />
                  </template>
                </q-input>

                <!-- Resultados de búsqueda -->
                <div v-if="ownerResults.length > 0" class="search-results">
                  <div class="results-list">
                    <q-card
                      v-for="owner in ownerResults"
                      :key="owner.id"
                      flat
                      bordered
                      class="result-item"
                      :class="{ 'selected': selectedOwner?.id === owner.id }"
                      @click="selectOwner(owner)"
                    >
                      <q-card-section class="result-content">
                        <div class="result-main">
                          <div class="result-name">
                            {{ owner.nombre }} {{ owner.primerapellido }} {{ owner.segundoapellido }}
                          </div>
                          <div class="result-details">
                            <span><q-icon name="phone" size="xs" /> {{ owner.telefono1 }}</span>
                            <span v-if="owner.email"><q-icon name="email" size="xs" /> {{ owner.email }}</span>
                          </div>
                        </div>
                        <q-icon
                          v-if="selectedOwner?.id === owner.id"
                          name="check_circle"
                          color="positive"
                          size="md"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <div class="new-owner-btn">
                  <q-btn
                    color="secondary"
                    icon="person_add"
                    label="Registrar Nuevo Propietario"
                    outline
                    @click="showNewOwnerDialog = true"
                    no-caps
                  />
                </div>
              </div>
            </div>

            <!-- Selección de mascota -->
            <div class="form-section" v-if="selectedOwner">
              <h5><q-icon name="pets" /> 2. Seleccionar Mascota</h5>
              <div class="pets-container">
                <!-- Mascotas existentes -->
                <div v-if="ownerPets.length > 0" class="pets-grid">
                  <q-card
                    v-for="pet in ownerPets"
                    :key="pet.id"
                    flat
                    bordered
                    class="pet-item"
                    :class="{ 'selected': selectedPet?.id === pet.id }"
                    @click="selectPet(pet)"
                  >
                    <q-card-section class="pet-content">
                      <div class="pet-avatar">
                        <q-avatar size="40px" color="secondary" text-color="white">
                          <q-icon name="pets" />
                        </q-avatar>
                      </div>
                      <div class="pet-info">
                        <div class="pet-name">{{ pet.nombre }}</div>
                        <div class="pet-details">
                          {{ pet.especie }} • {{ pet.raza || 'Sin raza' }}
                        </div>
                      </div>
                      <q-icon
                        v-if="selectedPet?.id === pet.id"
                        name="check_circle"
                        color="positive"
                        size="md"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <div class="new-pet-btn">
                  <q-btn
                    color="secondary"
                    icon="pets"
                    label="Registrar Nueva Mascota"
                    outline
                    @click="showNewPetDialog = true"
                    no-caps
                  />
                </div>
              </div>
            </div>

            <!-- Notas adicionales -->
            <div class="form-section" v-if="selectedPet">
              <h5><q-icon name="notes" /> 3. Notas Adicionales (Opcional)</h5>
              <q-input
                v-model="appointmentNotes"
                type="textarea"
                outlined
                placeholder="Escribe cualquier nota o comentario sobre la cita..."
                rows="3"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions class="dialog-actions">
          <q-btn
            flat
            label="Cancelar"
            @click="closeAppointmentDialog"
            no-caps
          />
          <q-spacer />
          <q-btn
            color="positive"
            label="Confirmar Cita"
            icon="check"
            @click="confirmAppointment"
            :disable="!canConfirmAppointment"
            :loading="savingAppointment"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para nuevo propietario -->
    <q-dialog v-model="showNewOwnerDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="dialog-title">
            <q-icon name="person_add" color="primary" size="md" />
            <h5>Nuevo Propietario</h5>
          </div>
        </q-card-section>

        <q-card-section>
          <q-form ref="newOwnerForm">
            <div class="form-grid">
              <q-input
                v-model="newOwner.nombre"
                label="Nombre *"
                outlined
                :rules="[val => !!val || 'Nombre requerido']"
              />
              <q-input
                v-model="newOwner.primerapellido"
                label="Primer Apellido *"
                outlined
                :rules="[val => !!val || 'Apellido requerido']"
              />
              <q-input
                v-model="newOwner.segundoapellido"
                label="Segundo Apellido"
                outlined
              />
              <q-input
                v-model="newOwner.telefono1"
                label="Teléfono *"
                outlined
                mask="(###) ###-####"
                :rules="[val => !!val || 'Teléfono requerido']"
              />
              <q-input
                v-model="newOwner.email"
                label="Email"
                type="email"
                outlined
                class="col-span-2"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeNewOwnerDialog" no-caps />
          <q-btn color="primary" label="Guardar" @click="saveNewOwner" :loading="savingNewOwner" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para nueva mascota -->
    <q-dialog v-model="showNewPetDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="dialog-title">
            <q-icon name="pets" color="secondary" size="md" />
            <h5>Nueva Mascota</h5>
          </div>
        </q-card-section>

        <q-card-section>
          <q-form ref="newPetForm">
            <div class="form-grid">
              <q-input
                v-model="newPet.nombre"
                label="Nombre *"
                outlined
                :rules="[val => !!val || 'Nombre requerido']"
              />
              <q-select
                v-model="newPet.especie"
                :options="speciesOptions"
                label="Especie *"
                outlined
                :rules="[val => !!val || 'Especie requerida']"
              />
              <q-input
                v-model="newPet.raza"
                label="Raza"
                outlined
              />
              <q-input
                v-model="newPet.edad"
                label="Edad (años)"
                type="number"
                outlined
                min="0"
                max="50"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="closeNewPetDialog" no-caps />
          <q-btn color="secondary" label="Guardar" @click="saveNewPet" :loading="savingNewPet" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmación -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="success-dialog">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="72px" color="positive" />
          <h4>¡Cita Confirmada!</h4>
          <p>La cita ha sido programada exitosamente</p>
          <div class="success-details">
            <div><strong>Servicio:</strong> {{ selectedService?.name }}</div>
            <div><strong>Mascota:</strong> {{ selectedPet?.nombre }}</div>
            <div><strong>Propietario:</strong> {{ selectedOwner?.nombre }} {{ selectedOwner?.primerapellido }}</div>
            <div><strong>Fecha:</strong> {{ selectedSlot?.dayName }}, {{ selectedSlot?.date }}</div>
            <div><strong>Hora:</strong> {{ selectedSlot?.time }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn color="positive" label="Aceptar" @click="closeSuccessDialog" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Estados principales
const currentDate = ref(new Date())
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedService = ref(null)
const selectedSlot = ref(null)
const viewMode = ref('month')
const selectedDate = ref(new Date())
const showDatePicker = ref(false)

// Estados del sidebar
const sidebarCollapsed = ref(false)
const serviceSearch = ref('')

// Dialogs
const showAppointmentDialog = ref(false)
const showNewOwnerDialog = ref(false)
const showNewPetDialog = ref(false)
const showSuccessDialog = ref(false)

// Búsqueda y selección
const ownerSearch = ref('')
const ownerResults = ref([])
const searchingOwners = ref(false)
const selectedOwner = ref(null)
const ownerPets = ref([])
const selectedPet = ref(null)
const appointmentNotes = ref('')

// Estados de carga
const savingAppointment = ref(false)
const savingNewOwner = ref(false)
const savingNewPet = ref(false)

// Formularios
const newOwnerForm = ref(null)
const newPetForm = ref(null)

// Datos de formularios
const newOwner = ref({
  nombre: '',
  primerapellido: '',
  segundoapellido: '',
  telefono1: '',
  email: ''
})

const newPet = ref({
  nombre: '',
  especie: '',
  raza: '',
  edad: null
})

// Servicios disponibles
const services = ref([
  {
    id: 1,
    name: 'Consulta General',
    duration: 30,
    price: 150,
    icon: 'medical_services',
    color: '#667eea'
  },
  {
    id: 2,
    name: 'Consulta Especialidad',
    duration: 45,
    price: 300,
    icon: 'psychology',
    color: '#764ba2'
  },
  {
    id: 3,
    name: 'Vacunación',
    duration: 20,
    price: 200,
    icon: 'vaccines',
    color: '#f093fb'
  },
  {
    id: 4,
    name: 'Cirugía Menor',
    duration: 60,
    price: 800,
    icon: 'healing',
    color: '#f5576c'
  },
  {
    id: 5,
    name: 'Baño y Corte',
    duration: 90,
    price: 300,
    icon: 'pets',
    color: '#4facfe'
  },
  {
    id: 6,
    name: 'Rayos X',
    duration: 45,
    price: 400,
    icon: 'medical_information',
    color: '#43e97b'
  },
  {
    id: 7,
    name: 'Laboratorio',
    duration: 15,
    price: 250,
    icon: 'science',
    color: '#fa709a'
  },
  {
    id: 8,
    name: 'Emergencias',
    duration: 60,
    price: 500,
    icon: 'emergency',
    color: '#ff6b6b'
  }
])

// Opciones
const speciesOptions = ref([
  'Perro', 'Gato', 'Ave', 'Conejo', 'Hamster', 'Reptil', 'Otro'
])

// Días de la semana
const weekdays = ref(['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'])

// Horarios de trabajo por servicio
const getWorkingHours = (serviceId) => {
  const baseHours = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  // Emergencias 24/7
  if (serviceId === 8) {
    return [
      '00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00',
      '08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00',
      '16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'
    ]
  }

  return baseHours
}

// Computeds
const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString('es-ES', { month: 'long' })
})

const selectedDateString = computed({
  get: () => {
    return selectedDate.value.toISOString().split('T')[0]
  },
  set: (value) => {
    selectedDate.value = new Date(value)
  }
})

// Servicios filtrados
const filteredServices = computed(() => {
  if (!serviceSearch.value) return services.value
  
  return services.value.filter(service =>
    service.name.toLowerCase().includes(serviceSearch.value.toLowerCase())
  )
})

// Estadísticas de bienvenida
const totalAppointmentsToday = computed(() => {
  return 12 // Mock data
})

const totalServicesActive = computed(() => {
  return services.value.length
})

// Slots del día seleccionado para vista diaria
const daySlots = computed(() => {
  if (!selectedService.value) return []

  const date = selectedDate.value
  const today = new Date()
  const isPast = date < today && !isSameDay(date, today)
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  if (isPast || (selectedService.value.id !== 8 && isWeekend)) {
    return []
  }

  const workingHours = getWorkingHours(selectedService.value.id)
  return workingHours.map(time => {
    const isBooked = Math.random() < 0.4
    const mockAppointment = isBooked ? generateMockAppointment() : null

    return {
      time,
      status: isBooked ? 'booked' : 'available',
      appointment: mockAppointment
    }
  })
})

const calendarDays = computed(() => {
  if (!selectedService.value) return []

  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const firstDayWeek = firstDay.getDay()
  const today = new Date()

  const days = []

  // Días del mes anterior
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const date = new Date(firstDay)
    date.setDate(date.getDate() - (i + 1))
    days.push({
      date: date.getDate(),
      fullDate: new Date(date),
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isPast: date < today,
      availableSlots: 0,
      bookedSlots: 0,
      slots: []
    })
  }

  // Días del mes actual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    const isToday = date.toDateString() === today.toDateString()
    const isPast = date < today && !isToday
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    // Generar slots para días válidos
    const slots = []
    if (!isPast && (selectedService.value.id === 8 || !isWeekend)) {
      const workingHours = getWorkingHours(selectedService.value.id)
      workingHours.forEach(time => {
        const isBooked = Math.random() < 0.4
        const mockAppointment = isBooked ? generateMockAppointment() : null

        slots.push({
          time,
          status: isBooked ? 'booked' : 'available',
          appointment: mockAppointment
        })
      })
    }

    const availableSlots = slots.filter(s => s.status === 'available').length
    const bookedSlots = slots.filter(s => s.status === 'booked').length

    days.push({
      date: day,
      fullDate: new Date(date),
      isCurrentMonth: true,
      isToday,
      isWeekend,
      isPast,
      availableSlots,
      bookedSlots,
      slots
    })
  }

  // Días del mes siguiente para completar la grilla
  const totalCells = 42
  const remainingCells = totalCells - days.length

  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, day)
    days.push({
      date: day,
      fullDate: new Date(date),
      isCurrentMonth: false,
      isToday: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isPast: false,
      availableSlots: 0,
      bookedSlots: 0,
      slots: []
    })
  }

  return days
})

// Estadísticas actuales
const currentStats = computed(() => {
  if (!selectedService.value) return { available: 0, booked: 0, revenue: 0, efficiency: 0 }

  let targetDay
  if (viewMode.value === 'month') {
    targetDay = calendarDays.value.find(day => day.isToday)
  } else {
    const available = daySlots.value.filter(s => s.status === 'available').length
    const booked = daySlots.value.filter(s => s.status === 'booked').length
    const total = available + booked
    const revenue = booked * selectedService.value.price
    const efficiency = total > 0 ? Math.round((booked / total) * 100) : 0

    return { available, booked, revenue, efficiency }
  }

  if (!targetDay) return { available: 0, booked: 0, revenue: 0, efficiency: 0 }

  const available = targetDay.availableSlots
  const booked = targetDay.bookedSlots
  const total = available + booked
  const revenue = booked * selectedService.value.price
  const efficiency = total > 0 ? Math.round((booked / total) * 100) : 0

  return { available, booked, revenue, efficiency }
})

const canConfirmAppointment = computed(() => {
  return selectedOwner.value && selectedPet.value
})

// Generar datos mock de cita
const generateMockAppointment = () => {
  const owners = [
    'García López', 'Rodríguez M.', 'Hernández S.', 'López García',
    'Martínez R.', 'González P.', 'Pérez Luna', 'Sánchez V.',
    'Ramírez C.', 'Torres M.', 'Flores D.', 'Rivera A.'
  ]
  const pets = [
    'Max', 'Luna', 'Rocky', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Daisy',
    'Buddy', 'Molly', 'Duke', 'Sadie', 'Zeus', 'Chloe', 'Bear', 'Sophie'
  ]
  const petTypes = ['Perro', 'Gato', 'Ave', 'Conejo']

  return {
    ownerName: owners[Math.floor(Math.random() * owners.length)],
    petName: pets[Math.floor(Math.random() * pets.length)],
    petType: petTypes[Math.floor(Math.random() * petTypes.length)]
  }
}

// Función auxiliar para comparar fechas
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

// Opciones para el selector de fecha
const dateOptions = (date) => {
  const targetDate = new Date(date)
  const today = new Date()
  const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6
  const isPast = targetDate < today && !isSameDay(targetDate, today)

  return !isPast && (selectedService.value?.id === 8 || !isWeekend)
}

// Métodos
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const selectService = (service) => {
  selectedService.value = service
  selectedSlot.value = null
  selectedOwner.value = null
  selectedPet.value = null
}

const getServiceStats = (serviceId) => {
  // Mock data for service statistics
  return {
    todayAppointments: Math.floor(Math.random() * 10) + 1,
    weekAppointments: Math.floor(Math.random() * 50) + 5
  }
}

// Métodos para la tabla
const getTimeIcon = (status) => {
  switch (status) {
    case 'available': return 'check_circle'
    case 'booked': return 'event_busy'
    case 'selected': return 'radio_button_checked'
    default: return 'schedule'
  }
}

const getTimeIconColor = (status) => {
  switch (status) {
    case 'available': return 'positive'
    case 'booked': return 'negative'
    case 'selected': return 'primary'
    default: return 'grey'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'available': return 'Disponible'
    case 'booked': return 'Ocupado'
    case 'selected': return 'Seleccionado'
    default: return 'Desconocido'
  }
}

const viewAppointment = (slot) => {
  $q.notify({
    type: 'info',
    message: `Cita de ${slot.appointment.petName} con ${slot.appointment.ownerName}`,
    caption: `Hora: ${slot.time}`
  })
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const previousDay = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() - 1)
  selectedDate.value = newDate
}

const nextDay = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setDate(newDate.getDate() + 1)
  selectedDate.value = newDate
}

const goToToday = () => {
  const today = new Date()
  if (viewMode.value === 'month') {
    currentYear.value = today.getFullYear()
    currentMonth.value = today.getMonth()
  } else {
    selectedDate.value = new Date(today)
  }
}

const selectDayForDayView = (day) => {
  if (!day.isCurrentMonth || day.isPast || (!selectedService.value || selectedService.value.id !== 8) && day.isWeekend) {
    return
  }

  viewMode.value = 'day'
  selectedDate.value = new Date(day.fullDate)
}

const updateSelectedDate = (newDate) => {
  selectedDate.value = new Date(newDate)
  showDatePicker.value = false
}

const selectTimeSlot = (day, slot) => {
  if (slot.status === 'booked') {
    $q.notify({
      type: 'warning',
      message: `Este horario está ocupado por ${slot.appointment.petName} (${slot.appointment.ownerName})`
    })
    return
  }

  // Limpiar selección anterior
  if (viewMode.value === 'month') {
    calendarDays.value.forEach(d => {
      d.slots.forEach(s => {
        if (s.status === 'selected') {
          s.status = 'available'
        }
      })
    })
  } else {
    daySlots.value.forEach(s => {
      if (s.status === 'selected') {
        s.status = 'available'
      }
    })
  }

  // Marcar como seleccionado
  slot.status = 'selected'

  selectedSlot.value = {
    date: day.fullDate.toLocaleDateString('es-ES'),
    dayName: day.fullDate.toLocaleDateString('es-ES', { weekday: 'long' }),
    time: slot.time,
    fullDate: day.fullDate
  }

  showAppointmentDialog.value = true
}

// Búsqueda de propietarios
const searchOwners = async () => {
  if (!ownerSearch.value.trim()) return

  searchingOwners.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 800))

    const mockOwners = [
      {
        id: 1,
        nombre: 'Juan Carlos',
        primerapellido: 'García',
        segundoapellido: 'López',
        telefono1: '(555) 123-4567',
        email: 'juan.garcia@email.com'
      },
      {
        id: 2,
        nombre: 'María Elena',
        primerapellido: 'Rodríguez',
        segundoapellido: 'Martínez',
        telefono1: '(555) 987-6543',
        email: 'maria.rodriguez@email.com'
      },
      {
        id: 3,
        nombre: 'Carlos Alberto',
        primerapellido: 'Hernández',
        segundoapellido: 'Silva',
        telefono1: '(555) 456-7890',
        email: 'carlos.hernandez@email.com'
      },
      {
        id: 4,
        nombre: 'Ana Sofía',
        primerapellido: 'López',
        segundoapellido: 'García',
        telefono1: '(555) 321-9876',
        email: 'ana.lopez@email.com'
      },
      {
        id: 5,
        nombre: 'Roberto',
        primerapellido: 'Martínez',
        segundoapellido: 'Pérez',
        telefono1: '(555) 654-3210',
        email: 'roberto.martinez@email.com'
      }
    ]

    ownerResults.value = mockOwners.filter(owner =>
      owner.nombre.toLowerCase().includes(ownerSearch.value.toLowerCase()) ||
      owner.primerapellido.toLowerCase().includes(ownerSearch.value.toLowerCase()) ||
      owner.segundoapellido.toLowerCase().includes(ownerSearch.value.toLowerCase()) ||
      owner.telefono1.includes(ownerSearch.value) ||
      (owner.email && owner.email.toLowerCase().includes(ownerSearch.value.toLowerCase()))
    )

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al buscar propietarios'
    })
  } finally {
    searchingOwners.value = false
  }
}

const onOwnerSearchInput = () => {
  if (ownerSearch.value.length >= 3) {
    searchOwners()
  } else if (ownerSearch.value.length === 0) {
    ownerResults.value = []
  }
}

const selectOwner = async (owner) => {
  selectedOwner.value = owner
  selectedPet.value = null
  await loadOwnerPets(owner.id)
}

const loadOwnerPets = async (ownerId) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockPetsData = {
      1: [
        { id: 1, nombre: 'Max', especie: 'Perro', raza: 'Golden Retriever', edad: 3 },
        { id: 2, nombre: 'Luna', especie: 'Gato', raza: 'Persa', edad: 5 }
      ],
      2: [
        { id: 3, nombre: 'Rocky', especie: 'Perro', raza: 'Pastor Alemán', edad: 4 }
      ],
      3: [
        { id: 4, nombre: 'Bella', especie: 'Perro', raza: 'Labrador', edad: 2 },
        { id: 5, nombre: 'Charlie', especie: 'Gato', raza: 'Siamés', edad: 1 },
        { id: 6, nombre: 'Coco', especie: 'Ave', raza: 'Canario', edad: 2 }
      ],
      4: [
        { id: 7, nombre: 'Daisy', especie: 'Perro', raza: 'Beagle', edad: 6 }
      ],
      5: [
        { id: 8, nombre: 'Buddy', especie: 'Perro', raza: 'Bulldog', edad: 3 },
        { id: 9, nombre: 'Molly', especie: 'Gato', raza: 'Maine Coon', edad: 4 }
      ]
    }

    ownerPets.value = mockPetsData[ownerId] || []

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las mascotas'
    })
  }
}

const selectPet = (pet) => {
  selectedPet.value = pet
}

// Dialogs
const closeAppointmentDialog = () => {
  showAppointmentDialog.value = false

  if (selectedSlot.value) {
    if (viewMode.value === 'month') {
      calendarDays.value.forEach(d => {
        d.slots.forEach(s => {
          if (s.status === 'selected') {
            s.status = 'available'
          }
        })
      })
    } else {
      daySlots.value.forEach(s => {
        if (s.status === 'selected') {
          s.status = 'available'
        }
      })
    }
  }

  selectedSlot.value = null
  selectedOwner.value = null
  selectedPet.value = null
  ownerSearch.value = ''
  ownerResults.value = []
  ownerPets.value = []
  appointmentNotes.value = ''
}

const closeNewOwnerDialog = () => {
  showNewOwnerDialog.value = false
  newOwner.value = {
    nombre: '',
    primerapellido: '',
    segundoapellido: '',
    telefono1: '',
    email: ''
  }
  if (newOwnerForm.value) {
    newOwnerForm.value.resetValidation()
  }
}

const saveNewOwner = async () => {
  const valid = await newOwnerForm.value.validate()
  if (!valid) return

  savingNewOwner.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const owner = {
      ...newOwner.value,
      id: Date.now()
    }

    selectedOwner.value = owner
    ownerPets.value = []

    showNewOwnerDialog.value = false
    closeNewOwnerDialog()

    $q.notify({
      type: 'positive',
      message: 'Propietario registrado exitosamente'
    })

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al registrar propietario'
    })
  } finally {
    savingNewOwner.value = false
  }
}

const closeNewPetDialog = () => {
  showNewPetDialog.value = false
  newPet.value = {
    nombre: '',
    especie: '',
    raza: '',
    edad: null
  }
  if (newPetForm.value) {
    newPetForm.value.resetValidation()
  }
}

const saveNewPet = async () => {
  const valid = await newPetForm.value.validate()
  if (!valid) return

  savingNewPet.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const pet = {
      ...newPet.value,
      id: Date.now(),
      id_propietario: selectedOwner.value.id
    }

    selectedPet.value = pet
    ownerPets.value.push(pet)

    showNewPetDialog.value = false
    closeNewPetDialog()

    $q.notify({
      type: 'positive',
      message: 'Mascota registrada exitosamente'
    })

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al registrar mascota'
    })
  } finally {
    savingNewPet.value = false
  }
}

const confirmAppointment = async () => {
  savingAppointment.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const appointmentData = {
      propietario: selectedOwner.value,
      mascota: selectedPet.value,
      servicio: selectedService.value,
      fecha: selectedSlot.value.fullDate,
      hora: selectedSlot.value.time,
      notas: appointmentNotes.value,
      estado: 'programada'
    }

    // Marcar el horario como ocupado
    if (viewMode.value === 'month') {
      calendarDays.value.forEach(d => {
        d.slots.forEach(s => {
          if (s.status === 'selected') {
            s.status = 'booked'
            s.appointment = {
              petName: selectedPet.value.nombre,
              ownerName: `${selectedOwner.value.nombre} ${selectedOwner.value.primerapellido}`,
              petType: selectedPet.value.especie,
              service: selectedService.value.name
            }
          }
        })
      })
    } else {
      daySlots.value.forEach(s => {
        if (s.status === 'selected') {
          s.status = 'booked'
          s.appointment = {
            petName: selectedPet.value.nombre,
            ownerName: `${selectedOwner.value.nombre} ${selectedOwner.value.primerapellido}`,
            petType: selectedPet.value.especie,
            service: selectedService.value.name
          }
        }
      })
    }

    console.log('Cita guardada:', appointmentData)

    showAppointmentDialog.value = false
    showSuccessDialog.value = true

    $q.notify({
      type: 'positive',
      message: 'Cita programada exitosamente'
    })

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al programar la cita'
    })
  } finally {
    savingAppointment.value = false
  }
}

const closeSuccessDialog = () => {
  showSuccessDialog.value = false

  selectedSlot.value = null
  selectedOwner.value = null
  selectedPet.value = null
  ownerSearch.value = ''
  ownerResults.value = []
  ownerPets.value = []
  appointmentNotes.value = ''
}

onMounted(() => {
  // Seleccionar el primer servicio por defecto
  if (services.value.length > 0) {
    selectedService.value = services.value[0]
  }
})
</script>

<style scoped>
/* Layout principal */
.fullscreen-calendar {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Inter', sans-serif;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar de servicios */
.services-sidebar {
  width: 320px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.services-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 80px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.toggle-btn {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.toggle-btn:hover {
  opacity: 1;
}

.sidebar-search {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input .q-field__control {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.search-input .q-field__native {
  color: white;
}

.search-input .q-field__native::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.services-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.services-header {
  padding: 20px 20px 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.services-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.services-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
}

.service-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.service-item.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.service-item.collapsed {
  justify-content: center;
  padding: 16px 12px;
}

.service-icon-container {
  position: relative;
  flex-shrink: 0;
}

.service-avatar {
  transition: all 0.3s ease;
}

.active-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #4ade80;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(74, 222, 128, 0.4);
}

.service-content {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-details {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  opacity: 0.8;
}

.service-stats {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.service-tooltip {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 12px;
}

.tooltip-content {
  text-align: center;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.tooltip-details {
  font-size: 13px;
  opacity: 0.8;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.current-stats {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mini-stat {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.mini-stat.available {
  border-left: 3px solid #4ade80;
}

.mini-stat.booked {
  border-left: 3px solid #f87171;
}

.mini-stat-value {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
}

.mini-stat-label {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Contenido principal */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: -10px;
  background: white;
  border-radius: 20px 0 0 0;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.main-content.expanded {
  margin-left: -10px;
}

.main-header {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
}

.breadcrumb .service-name {
  font-weight: 600;
  color: #1e293b;
}

.breadcrumb .view-name {
  color: #64748b;
}

.welcome-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.period-display {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  min-width: 200px;
  text-align: center;
  text-transform: capitalize;
}

/* Contenido del calendario */
.calendar-content {
  flex: 1;
  padding: 24px 32px;
  overflow: auto;
  background: #f8fafc;
}

/* Calendario mensual */
.calendar-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
}

.weekday-cell {
  background: #f1f5f9;
  padding: 16px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
}

.day-cell {
  background: white;
  min-height: 120px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.day-cell:hover {
  background: #f8faff;
}

.day-cell.today {
  background: linear-gradient(135deg, #667eea10, #764ba210);
}

.day-cell.other-month {
  background: #f8f9fa;
  color: #adb5bd;
}

.day-cell.past {
  background: #f8f9fa;
  color: #adb5bd;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-number {
  font-weight: 600;
  font-size: 16px;
}

.day-cell.today .day-number {
  color: #667eea;
  font-weight: 700;
}

.day-stats {
  display: flex;
  gap: 6px;
}

.available-badge,
.booked-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.available-badge {
  background: #dcfce7;
  color: #166534;
}

.booked-badge {
  background: #fef2f2;
  color: #991b1b;
}

.day-slots-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-slot-mini {
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.time-slot-mini.available {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.time-slot-mini.booked {
  background: #fefce8;
  color: #a16207;
  border: 1px solid #fde047;
}

.more-slots {
  font-size: 10px;
  color: #64748b;
  text-align: center;
  margin-top: 4px;
  font-style: italic;
}

.inactive-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
}

/* Vista diaria */
.day-view-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.day-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.day-info {
  flex: 1;
}

.day-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Grid de citas */
.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  padding-right: 8px;
}

.appointment-card {
  background: white;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 160px;
  display: flex;
  flex-direction: column;
}

.appointment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.appointment-card.available {
  border-color: #22c55e;
  background: linear-gradient(135deg, #f0fdf4, #ffffff);
}

.appointment-card.available:hover {
  border-color: #16a34a;
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.2);
}

.appointment-card.booked {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2, #ffffff);
}

.appointment-card.booked:hover {
  border-color: #dc2626;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
}

.appointment-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff, #ffffff);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.appointment-header {
  padding: 20px 20px 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.time-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-text {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.status-badge {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.appointment-content {
  flex: 1;
  padding: 0 20px 16px 20px;
}

.appointment-details {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.client-info,
.pet-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.client-details,
.pet-details {
  flex: 1;
  min-width: 0;
}

.client-name,
.pet-name {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-meta,
.pet-type {
  color: #64748b;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  text-align: center;
}

.empty-slot-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-slot-title {
  font-size: 16px;
  font-weight: 600;
  color: #22c55e;
  margin-bottom: 4px;
}

.empty-slot-subtitle {
  font-size: 14px;
  color: #64748b;
  opacity: 0.8;
}

.appointment-footer {
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-info,
.duration-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
}

/* Estado sin servicio seleccionado */
.no-service-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
}

.welcome-icon {
  margin-bottom: 24px;
  opacity: 0.8;
}

.welcome-content h2 {
  margin: 0 0 16px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.welcome-content p {
  margin: 0 0 32px 0;
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
}

.welcome-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 32px;
}

.welcome-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-info {
  text-align: left;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-text {
  font-size: 14px;
  color: #64748b;
}

/* Dialogs */
.appointment-dialog {
  width: 100%;
  max-width: none;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-info h4 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
  text-transform: capitalize;
}

.dialog-content {
  padding: 32px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.appointment-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h5 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8f9fa;
}

.results-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-main {
  flex: 1;
}

.result-name {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 4px;
}

.result-details {
  display: flex;
  gap: 16px;
  color: #64748b;
  font-size: 14px;
}

.result-details span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pets-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.pet-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.pet-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pet-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.pet-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pet-info {
  flex: 1;
}

.pet-name {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 4px;
}

.pet-details {
  color: #64748b;
  font-size: 14px;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-title h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-grid .col-span-2 {
  grid-column: span 2;
}

.dialog-actions {
  padding: 16px 24px;
  background: #f8fafc;
}

.success-dialog {
  max-width: 500px;
  border-radius: 16px;
}

.success-details {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: left;
}

.success-details div {
  margin-bottom: 8px;
  font-size: 14px;
  color: #475569;
}

.success-details div:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .services-sidebar {
    width: 280px;
  }
  
  .services-sidebar.collapsed {
    width: 70px;
  }
  
  .appointments-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-stats {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .services-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1001;
    transform: translateX(-100%);
  }
  
  .services-sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .main-content {
    margin-left: 0;
    border-radius: 0;
  }
  
  .main-header {
    padding: 16px 20px;
  }
  
  .calendar-content {
    padding: 16px 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .pets-grid {
    grid-template-columns: 1fr;
  }
  
  .appointment-details {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .appointment-details .q-separator {
    display: none;
  }
}

/* Scrollbar personalizado */
.services-items::-webkit-scrollbar,
.appointments-grid::-webkit-scrollbar,
.search-results::-webkit-scrollbar {
  width: 6px;
}

.services-items::-webkit-scrollbar-track,
.appointments-grid::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.services-items::-webkit-scrollbar-thumb,
.appointments-grid::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.services-items::-webkit-scrollbar-thumb:hover,
.appointments-grid::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Animaciones */
@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.appointment-card {
  animation: slideInUp 0.3s ease-out;
}

.service-item {
  animation: slideInRight 0.2s ease-out;
}

/* Estados de carga */
.q-btn--loading .q-btn__content {
  opacity: 0.6;
}

/* Mejoras de accesibilidad */
.service-item:focus,
.appointment-card:focus,
.result-item:focus,
.pet-item:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Transiciones suaves para el sidebar */
.services-sidebar * {
  transition: all 0.3s ease;
}

/* Efectos de glassmorphism para algunos elementos */
.sidebar-search .search-input .q-field__control,
.current-stats,
.service-item {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
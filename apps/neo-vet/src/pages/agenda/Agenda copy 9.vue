<template>
  <div class="fullscreen-calendar">
    <div class="app-layout">
      <!-- Sección de servicios compacta -->
      <div class="services-header">
        <div class="services-container">
          <div class="services-title-section">
            <q-icon name="medical_services" size="28px" color="primary" />
            <div class="title-content">
              <h3>Agendas por Servicio</h3>
              <p>Selecciona un servicio para ver su agenda</p>
            </div>
          </div>

          <!-- Sección de servicios compacta -->
      <div class="services-header">
        <div class="services-container">
          <div class="services-selection-row">
            <!-- Selector de servicio -->
            <div class="service-selector-section">
              <div class="selector-title">
                <q-icon name="medical_services" size="24px" color="primary" />
                <h3>Seleccionar Servicio</h3>
              </div>
              <q-select
                v-model="selectedService"
                :options="services"
                option-label="name"
                option-value="id"
                outlined
                emit-value
                map-options
                placeholder="Elige un servicio..."
                class="service-select"
                behavior="menu"
                :loading="false"
                clearable
                @update:model-value="onServiceChange"
              >
                <template v-slot:selected-item="scope">
                  <div class="selected-service-display" v-if="scope.opt">
                    <q-avatar :color="'primary'" text-color="white" size="32px" class="service-avatar">
                      <q-icon :name="scope.opt.icon" size="sm" />
                    </q-avatar>
                    <div class="service-info">
                      <div class="service-name">{{ scope.opt.name }}</div>
                      <div class="service-details">
                        <span><q-icon name="schedule" size="xs" /> {{ scope.opt.duration }}min</span>
                        <span><q-icon name="attach_money" size="xs" /> ${{ scope.opt.price }}</span>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="service-option">
                    <q-item-section avatar>
                      <q-avatar :color="'grey-3'" :text-color="'grey-7'" size="40px">
                        <q-icon :name="scope.opt.icon" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="option-name">{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption class="option-details">
                        <q-icon name="schedule" size="xs" /> {{ scope.opt.duration }}min
                        <span class="ml-2">
                          <q-icon name="attach_money" size="xs" /> ${{ scope.opt.price }}
                        </span>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay servicios disponibles
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Estadísticas al lado derecho -->
            <div v-if="selectedService" class="service-stats-section">
              
            </div>

            
          </div>
        </div>
      </div>

          <!-- Estadísticas compactas -->
          <div v-if="selectedService" class="service-stats-compact">
            <div class="stats-title">
              <q-icon name="analytics" size="sm" />
              <span>{{ viewMode === 'month' ? 'Hoy' : selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}</span>
            </div>
            <div class="stats-grid-compact">
              <div class="stat-item-compact available">
                <div class="stat-value">{{ currentStats.available }}</div>
                <div class="stat-label">Disponibles</div>
              </div>
              <div class="stat-item-compact booked">
                <div class="stat-value">{{ currentStats.booked }}</div>
                <div class="stat-label">Ocupados</div>
              </div>
              <div class="stat-item-compact revenue">
                <div class="stat-value">${{ currentStats.revenue }}</div>
                <div class="stat-label">Ingresos</div>
              </div>
              <div class="stat-item-compact efficiency">
                <div class="stat-value">{{ currentStats.efficiency }}%</div>
                <div class="stat-label">Ocupación</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal del calendario -->
      <div class="main-calendar">
        <div class="calendar-header">
          <div class="header-left">
            <h2 v-if="selectedService">
              {{ viewMode === 'month' ? 'Agenda:' : 'Horarios del día:' }} {{ selectedService.name }}
            </h2>
            <h2 v-else>Selecciona un Servicio</h2>
            <div v-if="selectedService" class="service-badge">
              <q-icon :name="selectedService.icon" size="sm" />
              {{ selectedService.duration }}min • ${{ selectedService.price }}
            </div>
          </div>

          <div class="header-controls">
            <!-- Toggle de vista -->
            <div class="view-toggle">
              <q-btn-toggle
                v-model="viewMode"
                :options="[
                  { label: 'Mes Completo', value: 'month', icon: 'calendar_view_month' },
                  { label: 'Vista Diaria', value: 'day', icon: 'calendar_view_day' }
                ]"
                color="primary"
                outline
              />
            </div>

            <!-- Navegación por mes (para vista completa) -->
            <div v-if="viewMode === 'month'" class="month-navigation">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="previousMonth"
                color="primary"
                size="lg"
              />
              <div class="month-display">
                <h4>{{ currentMonthName }} {{ currentYear }}</h4>
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="nextMonth"
                color="primary"
                size="lg"
              />
            </div>

            <!-- Navegación por día (para vista diaria) -->
            <div v-if="viewMode === 'day'" class="day-navigation">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="previousDay"
                color="primary"
                size="lg"
              />
              <div class="day-display">
                <h4>{{ selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</h4>
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="nextDay"
                color="primary"
                size="lg"
              />
            </div>

            <q-btn
              outline
              color="primary"
              :label="viewMode === 'month' ? 'Hoy' : 'Hoy'"
              @click="goToToday"
              icon="today"
            />
          </div>
        </div>

        <!-- Vista del calendario por mes -->
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

              <!-- Horarios del día (resumido) -->
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

              <!-- Mensaje para días pasados o fines de semana -->
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

        <!-- Vista diaria detallada en tabla -->
        <div v-if="selectedService && viewMode === 'day'" class="day-view-container">
          <div class="day-view-header">
            <div class="day-info">
              <h3>{{ selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) }}</h3>
              <div class="day-meta">
                <q-chip color="positive" text-color="white" icon="check_circle">
                  {{ daySlots.filter(s => s.status === 'available').length }} disponibles
                </q-chip>
                <q-chip color="negative" text-color="white" icon="event_busy">
                  {{ daySlots.filter(s => s.status === 'booked').length }} ocupados
                </q-chip>
              </div>
            </div>

            <!-- Selector rápido de fecha -->
            <q-btn
              outline
              color="primary"
              icon="calendar_month"
              label="Seleccionar Fecha"
              @click="showDatePicker = true"
            />
          </div>

          <!-- Tabla de horarios -->
          <div class="day-table-container">
            <q-table
              :rows="daySlots"
              :columns="dayColumns"
              row-key="time"
              flat
              bordered
              :rows-per-page-options="[0]"
              hide-pagination
              class="appointments-table"
            >
              <template v-slot:body="props">
                <q-tr :props="props"
                     :class="{
                       'available-row': props.row.status === 'available',
                       'booked-row': props.row.status === 'booked',
                       'selected-row': props.row.status === 'selected'
                     }"
                     @click="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, props.row)"
                     style="cursor: pointer;">

                  <q-td key="time" :props="props" class="time-column">
                    <div class="time-display">
                      <q-icon :name="getTimeIcon(props.row.status)" size="sm"
                             :color="getTimeIconColor(props.row.status)" class="time-icon"/>
                      <span class="time-text">{{ props.row.time }}</span>
                    </div>
                  </q-td>

                  <q-td key="status" :props="props">
                    <q-badge
                      :color="props.row.status === 'available' ? 'positive' : props.row.status === 'booked' ? 'negative' : 'primary'"
                      :label="getStatusLabel(props.row.status)"
                      class="status-badge"
                    />
                  </q-td>

                  <q-td key="owner" :props="props">
                    <div v-if="props.row.appointment" class="owner-info">
                      <div class="owner-name">{{ props.row.appointment.ownerName }}</div>
                    </div>
                    <div v-else class="available-slot">
                      <q-icon name="person_add" size="sm" color="positive" />
                      <span>Disponible para agendar</span>
                    </div>
                  </q-td>

                  <q-td key="pet" :props="props">
                    <div v-if="props.row.appointment" class="pet-info">
                      <q-avatar size="32px" color="secondary" text-color="white" class="pet-avatar">
                        <q-icon name="pets" />
                      </q-avatar>
                      <div class="pet-details">
                        <div class="pet-name">{{ props.row.appointment.petName }}</div>
                        <div class="pet-type">{{ props.row.appointment.petType || 'Mascota' }}</div>
                      </div>
                    </div>
                    <div v-else class="no-pet">
                      <q-icon name="pets" size="sm" color="grey-5" />
                      <span class="text-grey-5">Sin asignar</span>
                    </div>
                  </q-td>

                  <q-td key="actions" :props="props">
                    <div class="action-buttons">
                      <q-btn
                        v-if="props.row.status === 'available'"
                        size="sm"
                        color="positive"
                        icon="add"
                        round
                        flat
                        @click.stop="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, props.row)"
                      >
                        <q-tooltip>Agendar cita</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="props.row.status === 'booked'"
                        size="sm"
                        color="info"
                        icon="visibility"
                        round
                        flat
                        @click.stop="viewAppointment(props.row)"
                      >
                        <q-tooltip>Ver detalles</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="props.row.status === 'selected'"
                        size="sm"
                        color="primary"
                        icon="edit"
                        round
                        flat
                        @click.stop="selectTimeSlot({ fullDate: selectedDate, slots: daySlots }, props.row)"
                      >
                        <q-tooltip>Confirmar cita</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>

        <!-- Placeholder cuando no hay servicio seleccionado -->
        <div v-else-if="!selectedService" class="no-service-selected">
          <q-icon name="calendar_month" size="120px" color="grey-4" />
          <h3>Selecciona un Servicio</h3>
          <p>Elige un servicio de la lista superior para ver su agenda de citas</p>
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
          />
          <q-spacer />
          <q-btn
            color="positive"
            label="Confirmar Cita"
            icon="check"
            @click="confirmAppointment"
            :disable="!canConfirmAppointment"
            :loading="savingAppointment"
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
          <q-btn flat label="Cancelar" @click="closeNewOwnerDialog" />
          <q-btn color="primary" label="Guardar" @click="saveNewOwner" :loading="savingNewOwner" />
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
          <q-btn flat label="Cancelar" @click="closeNewPetDialog" />
          <q-btn color="secondary" label="Guardar" @click="saveNewPet" :loading="savingNewPet" />
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
          <q-btn color="positive" label="Aceptar" @click="closeSuccessDialog" />
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
const viewMode = ref('month') // 'month' o 'day'
const selectedDate = ref(new Date())
const showDatePicker = ref(false)

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

// Columnas para la tabla de horarios diarios
const dayColumns = ref([
  {
    name: 'time',
    required: true,
    label: 'Hora',
    align: 'left',
    field: 'time',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'status',
    label: 'Estado',
    align: 'center',
    field: 'status',
    style: 'width: 130px'
  },
  {
    name: 'owner',
    label: 'Propietario',
    align: 'left',
    field: row => row.appointment?.ownerName || '',
    style: 'width: 200px'
  },
  {
    name: 'pet',
    label: 'Mascota',
    align: 'left',
    field: row => row.appointment?.petName || '',
    style: 'width: 180px'
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: 'actions',
    style: 'width: 120px'
  }
])

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

// Días de la semana
const weekdays = ref(['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'])

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
    if (!isPast && (selectedService.value.id === 8 || !isWeekend)) { // Emergencias trabaja fines de semana
      const workingHours = getWorkingHours(selectedService.value.id)
      workingHours.forEach(time => {
        // Simulación de ocupación con datos más realistas
        const isBooked = Math.random() < 0.4 // 40% de probabilidad de estar ocupado
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

// Estadísticas actuales (hoy para vista mes, día seleccionado para vista día)
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

  // Permitir solo días futuros y presente, y fines de semana solo para emergencias
  return !isPast && (selectedService.value?.id === 8 || !isWeekend)
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

// Métodos
const selectService = (service) => {
  selectedService.value = service
  // Limpiar selecciones anteriores
  selectedSlot.value = null
  selectedOwner.value = null
  selectedPet.value = null
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

    // Datos de ejemplo más extensos
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

    // Datos mock de mascotas por propietario
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
/* Estilos principales del layout */
.fullscreen-calendar {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header de servicios compacto */
.services-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.services-container {
  max-width: 1400px;
  margin: 0 auto;
}

.services-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.title-content h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-content p {
  margin: 4px 0 0 0;
  color: #718096;
  font-size: 14px;
}

/* Lista compacta de servicios */
.services-list-container {
  margin-bottom: 20px;
}

.services-list {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.service-item {
  transition: all 0.3s ease;
  padding: 12px 16px;
}

.service-item:hover {
  background: #f8faff;
}

.service-item.selected-service {
  background: linear-gradient(135deg, #667eea10, #764ba210);
  border-left: 4px solid #667eea;
}

.service-name {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
}

.service-details {
  color: #718096;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-icon {
  margin-right: 2px;
}

.ml-3 {
  margin-left: 12px;
}

/* Estadísticas compactas */
.service-stats-compact {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.stats-grid-compact {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item-compact {
  text-align: center;
  padding: 12px 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  border-left: 3px solid transparent;
}

.stat-item-compact:hover {
  transform: translateY(-1px);
}

.stat-item-compact.available {
  border-left-color: #48bb78;
}

.stat-item-compact.booked {
  border-left-color: #f56565;
}

.stat-item-compact.revenue {
  border-left-color: #667eea;
}

.stat-item-compact.efficiency {
  border-left-color: #ed8936;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Calendario principal */
.main-calendar {
  flex: 1;
  background: white;
  margin: 0;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.service-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7fafc;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.month-navigation,
.day-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.month-display h4,
.day-display h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  min-width: 200px;
  text-align: center;
  text-transform: capitalize;
}

/* Calendario mensual */
.calendar-container {
  flex: 1;
  padding: 24px 32px;
  overflow: auto;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
  background: #e2e8f0;
  border-radius: 8px 8px 0 0;
}

.weekday-cell {
  background: #f7fafc;
  padding: 16px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
  border-radius: 0 0 8px 8px;
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

.day-cell.weekend.other-month {
  background: #f1f3f4;
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
  background: #c6f6d5;
  color: #22543d;
}

.booked-badge {
  background: #fed7d7;
  color: #742a2a;
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
  background: #f0fff4;
  color: #22543d;
  border: 1px solid #c6f6d5;
}

.time-slot-mini.booked {
  background: #fef5e7;
  color: #744210;
  border: 1px solid #f6e05e;
}

.more-slots {
  font-size: 10px;
  color: #718096;
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
  color: #a0aec0;
}

/* Vista diaria con tabla */
.day-view-container {
  flex: 1;
  padding: 24px 32px;
  overflow: auto;
}

.day-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.day-info h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  text-transform: capitalize;
}

.day-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Tabla de horarios */
.day-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.appointments-table {
  font-family: inherit;
}

.appointments-table .q-table__top,
.appointments-table .q-table__bottom {
  padding: 16px;
}

.appointments-table th {
  background: #f8fafc;
  color: #4a5568;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
  padding: 16px 12px;
}

.appointments-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #e2e8f0;
}

.appointments-table tr {
  transition: all 0.2s ease;
}

.appointments-table tr:hover {
  background: #f8faff;
}

.available-row {
  background: rgba(72, 187, 120, 0.05);
}

.available-row:hover {
  background: rgba(72, 187, 120, 0.1);
}

.booked-row {
  background: rgba(245, 101, 101, 0.05);
}

.booked-row:hover {
  background: rgba(245, 101, 101, 0.1);
}

.selected-row {
  background: rgba(102, 126, 234, 0.1);
  border-left: 4px solid #667eea;
}

.selected-row:hover {
  background: rgba(102, 126, 234, 0.15);
}

/* Columnas de la tabla */
.time-column {
  font-weight: 600;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-icon {
  flex-shrink: 0;
}

.time-text {
  font-size: 16px;
}

.status-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.owner-info {
  display: flex;
  flex-direction: column;
}

.owner-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.available-slot {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #48bb78;
  font-size: 14px;
  font-style: italic;
}

.pet-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pet-avatar {
  flex-shrink: 0;
}

.pet-details {
  flex: 1;
}

.pet-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  margin-bottom: 2px;
}

.pet-type {
  color: #718096;
  font-size: 12px;
}

.no-pet {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-style: italic;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
}

/* Estado sin servicio seleccionado */
.no-service-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #a0aec0;
  text-align: center;
  padding: 48px;
}

.no-service-selected h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.no-service-selected p {
  margin: 0;
  font-size: 16px;
  max-width: 400px;
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
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-input {
  width: 100%;
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
  padding: 16px;
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
  color: #2d3748;
  margin-bottom: 4px;
}

.result-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #718096;
}

.result-details span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.new-owner-btn,
.new-pet-btn {
  display: flex;
  justify-content: center;
  margin-top: 16px;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pet-item.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.pet-content {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.pet-avatar {
  flex-shrink: 0;
}

.pet-info {
  flex: 1;
}

.pet-name {
  font-weight: 600;
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 4px;
}

.pet-details {
  font-size: 14px;
  color: #718096;
}

.dialog-actions {
  padding: 24px 32px;
  background: #f8f9fa;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-title h5 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.col-span-2 {
  grid-column: span 2;
}

.success-dialog {
  max-width: 500px;
  text-align: center;
}

.success-dialog h4 {
  margin: 16px 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.success-dialog p {
  margin: 0 0 24px 0;
  color: #718096;
  font-size: 16px;
}

.success-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  text-align: left;
}

.success-details div {
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
}

.success-details div:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .services-header {
    padding: 16px;
  }

  .stats-grid-compact {
    grid-template-columns: repeat(2, 1fr);
  }

  .calendar-header {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
  }

  .header-controls {
    justify-content: center;
    gap: 16px;
  }

  .calendar-container {
    padding: 16px;
  }

  .day-cell {
    min-height: 80px;
    padding: 8px;
  }

  .day-view-container {
    padding: 16px;
  }

  .day-table-container {
    overflow-x: auto;
  }

  .appointments-table th,
  .appointments-table td {
    padding: 12px 8px;
    font-size: 14px;
  }

  .dialog-content {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .col-span-2 {
    grid-column: span 1;
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .title-content h3 {
    font-size: 20px;
  }

  .stats-grid-compact {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .day-cell {
    min-height: 60px;
    padding: 6px;
  }

  .day-number {
    font-size: 14px;
  }

  .time-slot-mini {
    font-size: 10px;
    padding: 2px 4px;
  }

  .day-meta {
    flex-direction: column;
    gap: 8px;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-item,
.stat-item-compact,
.result-item,
.pet-item {
  animation: fadeIn 0.3s ease-out backwards;
}

/* Scrollbars personalizados */
.calendar-container::-webkit-scrollbar,
.day-view-container::-webkit-scrollbar,
.search-results::-webkit-scrollbar,
.dialog-content::-webkit-scrollbar {
  width: 8px;
}

.calendar-container::-webkit-scrollbar-track,
.day-view-container::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track,
.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb,
.day-view-container::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb,
.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.calendar-container::-webkit-scrollbar-thumb:hover,
.day-view-container::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover,
.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Estados de carga */
.q-spinner {
  color: #667eea !important;
}

/* Mejoras de accesibilidad */
.service-item:focus,
.day-cell:focus,
.appointments-table tr:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Transiciones suaves */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>

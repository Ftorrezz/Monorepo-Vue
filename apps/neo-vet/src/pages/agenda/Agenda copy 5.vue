<template>
  <div class="fullscreen-calendar">
    <div class="app-layout">
      <!-- Sidebar de servicios -->
      <div class="services-sidebar">
        <div class="sidebar-header">
          <q-icon name="medical_services" size="42px" color="white" />
          <h3>Agendas por Servicio</h3>
          <p>Selecciona un servicio para ver su agenda</p>
        </div>

        <div class="services-list">
          <div class="services-title">Servicios Disponibles</div>
          <div
            v-for="service in services"
            :key="service.id"
            class="service-item"
            :class="{ 'active': selectedService?.id === service.id }"
            @click="selectService(service)"
          >
            <div class="service-icon">
              <q-icon :name="service.icon" size="24px" />
            </div>
            <div class="service-info">
              <h4>{{ service.name }}</h4>
              <div class="service-meta">
                <span><q-icon name="schedule" size="xs"/> {{ service.duration }}min</span>
                <span><q-icon name="attach_money" size="xs"/>${{ service.price }}</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas del servicio seleccionado -->
          <div v-if="selectedService" class="service-stats">
            <h5>Estadísticas de Hoy</h5>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">{{ todayStats.available }}</div>
                <div class="stat-label">Disponibles</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ todayStats.booked }}</div>
                <div class="stat-label">Ocupados</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ todayStats.revenue }}</div>
                <div class="stat-label">Ingresos Est.</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ todayStats.efficiency }}%</div>
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
              Agenda: {{ selectedService.name }}
            </h2>
            <h2 v-else>Selecciona un Servicio</h2>
            <div v-if="selectedService" class="service-badge">
              <q-icon :name="selectedService.icon" size="sm" />
              {{ selectedService.duration }}min • ${{ selectedService.price }}
            </div>
          </div>
          
          <div class="header-controls">
            <div class="month-navigation">
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
            <q-btn
              outline
              color="primary"
              label="Hoy"
              @click="goToToday"
              icon="today"
            />
          </div>
        </div>

        <!-- Calendario principal -->
        <div v-if="selectedService" class="calendar-container">
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
            >
              <div class="day-header">
                <span class="day-number">{{ day.date }}</span>
                <div class="day-stats" v-if="day.isCurrentMonth && !day.isPast">
                  <span class="available-badge">{{ day.availableSlots }}</span>
                  <span class="booked-badge">{{ day.bookedSlots }}</span>
                </div>
              </div>

              <!-- Horarios del día -->
              <div class="day-slots" v-if="day.isCurrentMonth && !day.isPast">
                <div
                  v-for="slot in day.slots"
                  :key="slot.time"
                  class="time-slot"
                  :class="{
                    'available': slot.status === 'available',
                    'booked': slot.status === 'booked',
                    'selected': slot.status === 'selected'
                  }"
                  @click="selectTimeSlot(day, slot)"
                >
                  <div class="slot-time">{{ slot.time }}</div>
                  <div v-if="slot.status === 'booked' && slot.appointment" class="slot-info">
                    <div class="owner-name">{{ slot.appointment.ownerName }}</div>
                    <div class="pet-name">{{ slot.appointment.petName }}</div>
                  </div>
                  <div v-if="slot.status === 'available'" class="slot-available">
                    <q-icon name="add" size="xs" />
                    Disponible
                  </div>
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

        <!-- Placeholder cuando no hay servicio seleccionado -->
        <div v-else class="no-service-selected">
          <q-icon name="calendar_month" size="120px" color="grey-4" />
          <h3>Selecciona un Servicio</h3>
          <p>Elige un servicio del panel lateral para ver su agenda de citas</p>
        </div>
      </div>
    </div>

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
  
  return {
    ownerName: owners[Math.floor(Math.random() * owners.length)],
    petName: pets[Math.floor(Math.random() * pets.length)]
  }
}

// Estadísticas de hoy
const todayStats = computed(() => {
  if (!selectedService.value) return { available: 0, booked: 0, revenue: 0, efficiency: 0 }
  
  const today = calendarDays.value.find(day => day.isToday)
  if (!today) return { available: 0, booked: 0, revenue: 0, efficiency: 0 }
  
  const available = today.availableSlots
  const booked = today.bookedSlots
  const total = available + booked
  const revenue = booked * selectedService.value.price
  const efficiency = total > 0 ? Math.round((booked / total) * 100) : 0
  
  return { available, booked, revenue, efficiency }
})

const canConfirmAppointment = computed(() => {
  return selectedOwner.value && selectedPet.value
})

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

const goToToday = () => {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
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
  calendarDays.value.forEach(d => {
    d.slots.forEach(s => {
      if (s.status === 'selected') {
        s.status = 'available'
      }
    })
  })
  
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
    calendarDays.value.forEach(d => {
      d.slots.forEach(s => {
        if (s.status === 'selected') {
          s.status = 'available'
        }
      })
    })
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
    calendarDays.value.forEach(d => {
      d.slots.forEach(s => {
        if (s.status === 'selected') {
          s.status = 'booked'
          s.appointment = {
            petName: selectedPet.value.nombre,
            ownerName: `${selectedOwner.value.nombre} ${selectedOwner.value.primerapellido}`,
            service: selectedService.value.name
          }
        }
      })
    })
    
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
.fullscreen-calendar {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-layout {
  display: flex;
  height: 100vh;
}

/* Sidebar de servicios */
.services-sidebar {
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 30px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.sidebar-header h3 {
  font-size: 1.4rem;
  margin: 12px 0 8px 0;
  font-weight: 700;
}

.sidebar-header p {
  opacity: 0.9;
  font-size: 0.9rem;
}

.services-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.services-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 15px;
  padding-left: 5px;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: white;
}

.service-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateX(5px);
}

.service-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: #667eea;
  transform: translateX(8px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.service-item.active .service-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.service-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.service-meta {
  font-size: 0.8rem;
  opacity: 0.7;
  display: flex;
  gap: 15px;
}

.service-stats {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 12px;
}

.service-stats h5 {
  margin: 0 0 15px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-card {
  background: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Contenido principal */
.main-calendar {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.calendar-header {
  padding: 25px 30px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-left h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.service-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 20px;
}

.month-display h4 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2d3748;
  text-transform: capitalize;
  min-width: 200px;
  text-align: center;
}

/* Calendario */
.calendar-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.weekday-cell {
  padding: 16px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #e2e8f0;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.day-cell {
  min-height: 160px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.day-cell.other-month {
  background: #f8fafc;
  color: #cbd5e0;
}

.day-cell.today {
  background: linear-gradient(135deg, #e0f2fe, #b3e5fc);
  border-color: #0277bd;
}

.day-cell.weekend {
  background: #fef7f0;
}

.day-cell.past {
  background: #f1f5f9;
  color: #94a3b8;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
  background: rgba(0, 0, 0, 0.02);
  min-height: 40px;
}

.day-number {
  font-weight: 600;
  font-size: 1rem;
}

.day-cell.today .day-number {
  color: #0277bd;
  font-weight: 700;
}

.day-stats {
  display: flex;
  gap: 6px;
  font-size: 0.7rem;
}

.available-badge {
  background: #dcfce7;
  color: #166534;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.booked-badge {
  background: #fee2e2;
  color: #991b1b;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.day-slots {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}

.time-slot {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  border: 1px solid transparent;
}

.time-slot.available {
  background: #dcfce7;
  border-color: #bbf7d0;
}

.time-slot.available:hover {
  background: #bbf7d0;
  transform: scale(1.02);
}

.time-slot.booked {
  background: #fee2e2;
  border-color: #fecaca;
  cursor: not-allowed;
}

.time-slot.selected {
  background: #dbeafe;
  border-color: #3b82f6;
  border-width: 2px;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.slot-time {
  font-weight: 700;
  font-size: 0.8rem;
  color: #1f2937;
  margin-bottom: 4px;
}

.slot-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.owner-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.7rem;
}

.pet-name {
  color: #6b7280;
  font-size: 0.65rem;
}

.slot-available {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #059669;
  font-size: 0.65rem;
  font-weight: 500;
}

.inactive-day {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: #9ca3af;
}

/* No service selected */
.no-service-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px;
  color: #6b7280;
}

.no-service-selected h3 {
  margin: 20px 0 10px 0;
  font-size: 1.8rem;
  color: #374151;
}

.no-service-selected p {
  font-size: 1.1rem;
  max-width: 400px;
}

/* Dialog styles */
.appointment-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-info h4 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.header-info p {
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-size: 1rem;
}

.dialog-content {
  padding: 32px;
  max-height: 70vh;
  overflow-y: auto;
}

.appointment-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section h5 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
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

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.result-item:hover {
  border-color: #e0e7ff;
  background: #f8fafc;
}

.result-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.result-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.result-details {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #6b7280;
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
  padding: 16px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: #f8fafc;
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
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.pet-item:hover {
  border-color: #e0e7ff;
  background: #f8fafc;
}

.pet-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.pet-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.pet-info {
  flex: 1;
}

.pet-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.pet-details {
  color: #6b7280;
  font-size: 0.9rem;
}

.dialog-actions {
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-title h5 {
  margin: 0;
  font-size: 1.2rem;
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
  border-radius: 16px;
  overflow: hidden;
  max-width: 500px;
}

.success-dialog h4 {
  margin: 16px 0 8px 0;
  color: #059669;
}

.success-dialog p {
  margin: 0 0 16px 0;
  color: #6b7280;
}

.success-details {
  background: #f0fdf4;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: left;
}

.success-details div {
  margin-bottom: 6px;
  color: #166534;
}

.success-details div:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 1400px) {
  .services-sidebar {
    width: 280px;
  }
  
  .day-cell {
    min-height: 140px;
  }
}

@media (max-width: 1200px) {
  .services-sidebar {
    width: 260px;
  }
  
  .calendar-grid {
    font-size: 0.9rem;
  }
  
  .day-cell {
    min-height: 120px;
  }
  
  .time-slot {
    font-size: 0.7rem;
    padding: 6px;
  }
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  
  .services-sidebar {
    width: 100%;
    height: 200px;
  }
  
  .services-list {
    padding: 15px;
  }
  
  .service-item {
    padding: 10px;
  }
  
  .service-stats {
    display: none;
  }
  
  .calendar-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
  
  .header-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .calendar-container {
    padding: 15px;
  }
  
  .day-cell {
    min-height: 100px;
  }
  
  .time-slot {
    font-size: 0.65rem;
    padding: 4px;
  }
  
  .slot-time {
    font-size: 0.7rem;
  }
  
  .owner-name,
  .pet-name {
    font-size: 0.6rem;
  }
}

/* Scrollbar personalizado */
.services-list::-webkit-scrollbar-thumb,
.dialog-content::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb,
.day-slots::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.services-list::-webkit-scrollbar-thumb:hover,
.dialog-content::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover,
.day-slots::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animaciones */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.appointment-form {
  animation: slideInUp 0.3s ease-out;
}

.service-item {
  animation: slideInUp 0.3s ease-out;
}

.time-slot {
  animation: slideInUp 0.2s ease-out;
}

/* Efectos hover mejorados */
.month-navigation .q-btn:hover {
  transform: scale(1.1);
}

.service-item:hover .service-icon {
  transform: scale(1.1);
}

.time-slot.available:hover .slot-time {
  color: #059669;
}

/* Estados especiales */
.time-slot.booked .owner-name {
  font-weight: 700;
}

.time-slot.booked .pet-name {
  font-style: italic;
}

/* Mejoras visuales */
.day-cell.today .day-header {
  background: linear-gradient(135deg, rgba(2, 119, 189, 0.1), rgba(179, 229, 252, 0.1));
}

.service-item.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }
  100% {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
}

/* Estilos para citas ocupadas más destacados */
.time-slot.booked {
  position: relative;
  overflow: hidden;
}

.time-slot.booked::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* Responsive adicional para pantallas muy pequeñas */
@media (max-width: 480px) {
  .services-sidebar {
    height: 150px;
  }
  
  .sidebar-header {
    padding: 20px 15px;
  }
  
  .sidebar-header h3 {
    font-size: 1.2rem;
  }
  
  .service-item {
    padding: 8px;
    margin-bottom: 4px;
  }
  
  .service-icon {
    width: 32px;
    height: 32px;
  }
  
  .service-info h4 {
    font-size: 0.9rem;
  }
  
  .service-meta {
    font-size: 0.7rem;
  }
  
  .calendar-header h2 {
    font-size: 1.4rem;
  }
  
  .month-display h4 {
    font-size: 1.2rem;
  }
  
  .weekday-cell {
    padding: 8px 4px;
    font-size: 0.8rem;
  }
  
  .day-cell {
    min-height: 80px;
  }
  
  .day-header {
    padding: 6px;
    min-height: 32px;
  }
  
  .day-number {
    font-size: 0.9rem;
  }
  
  .time-slot {
    font-size: 0.6rem;
    padding: 3px;
    gap: 2px;
  }
  
  .slot-time {
    font-size: 0.65rem;
  }
  
  .owner-name {
    font-size: 0.55rem;
  }
  
  .pet-name {
    font-size: 0.5rem;
  }
  
  .day-slots {
    padding: 4px;
    gap: 2px;
  }
  
  .available-badge,
  .booked-badge {
    padding: 2px 6px;
    font-size: 0.6rem;
  }
}

/* Estilos para impresión */
@media print {
  .services-sidebar,
  .header-controls,
  .dialog-actions {
    display: none;
  }
  
  .main-calendar {
    width: 100%;
  }
  
  .calendar-container {
    padding: 0;
  }
  
  .time-slot {
    border: 1px solid #000;
    margin-bottom: 2px;
  }
  
  .time-slot.booked {
    background: #f0f0f0;
  }
}

/* Mejoras de accesibilidad */
.service-item:focus,
.time-slot:focus,
.result-item:focus,
.pet-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.time-slot.available:focus {
  background: #86efac;
}

/* Indicadores de estado mejorados */
.day-stats {
  position: relative;
}

.available-badge::before {
  content: '●';
  color: #16a34a;
  margin-right: 4px;
}

.booked-badge::before {
  content: '●';
  color: #dc2626;
  margin-right: 4px;
}

/* Tooltips personalizados */
.time-slot[title] {
  position: relative;
}

/* Estados de carga */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>,
.dialog-content::-webkit-scrollbar,
.search-results::-webkit-scrollbar,
.day-slots::-webkit-scrollbar {
  width: 6px;
}

.services-list::-webkit-scrollbar-track,
.dialog-content::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track,
.day-slots::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.services-list::-webkit-scrollbar
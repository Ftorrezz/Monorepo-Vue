<template>
  <div class="appointment-calendar-system">
    <!-- Header moderno -->
    <div class="modern-header">
      <div class="header-content">
        <div class="header-icon">
          <q-icon name="calendar_month" size="42px" />
        </div>
        <div class="header-text">
          <h3 class="header-title">Agenda de Citas</h3>
          <p class="header-subtitle">Sistema de reservas por horarios disponibles</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-number">{{ availableSlots }}</span>
          <span class="stat-label">Disponibles</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ bookedSlots }}</span>
          <span class="stat-label">Ocupados</span>
        </div>
      </div>
    </div>

    <div class="calendar-container">
      <!-- Selector de mes y año -->
      <div class="month-selector">
        <q-card flat bordered class="selector-card">
          <q-card-section class="selector-content">
            <div class="selector-controls">
              <q-btn
                flat
                round
                icon="chevron_left"
                @click="previousMonth"
                color="primary"
              />
              <div class="month-display">
                <h5>{{ currentMonthName }} {{ currentYear }}</h5>
              </div>
              <q-btn
                flat
                round
                icon="chevron_right"
                @click="nextMonth"
                color="primary"
              />
            </div>
            <div class="today-btn">
              <q-btn
                outline
                color="primary"
                label="Hoy"
                @click="goToToday"
                size="sm"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Vista de calendario con horarios -->
      <div class="calendar-grid-container">
        <q-card flat bordered class="calendar-card">
          <q-card-section class="calendar-section">
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
                    <span class="available-count">{{ day.availableSlots }}</span>
                    <span class="booked-count">{{ day.bookedSlots }}</span>
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
                    <span class="slot-time">{{ slot.time }}</span>
                    <q-icon
                      v-if="slot.status === 'booked'"
                      name="person"
                      size="xs"
                    />
                    <q-icon
                      v-if="slot.status === 'selected'"
                      name="edit"
                      size="xs"
                    />
                  </div>
                </div>

                <!-- Mensaje para días pasados -->
                <div v-if="day.isPast && day.isCurrentMonth" class="past-day-message">
                  <q-icon name="event_busy" size="sm" color="grey-4" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Leyenda -->
      <div class="legend-container">
        <q-card flat bordered class="legend-card">
          <q-card-section class="legend-content">
            <h6>Leyenda</h6>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-color available"></div>
                <span>Disponible</span>
              </div>
              <div class="legend-item">
                <div class="legend-color booked"></div>
                <span>Ocupado</span>
              </div>
              <div class="legend-item">
                <div class="legend-color selected"></div>
                <span>Seleccionado</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
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
            <q-icon name="event" size="32px" color="primary" />
            <div>
              <h5>Asignar Cita</h5>
              <p>{{ selectedSlot?.dayName }}, {{ selectedSlot?.date }} - {{ selectedSlot?.time }}</p>
            </div>
          </div>
          <q-btn
            flat
            round
            icon="close"
            @click="closeAppointmentDialog"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-content">
          <div class="appointment-form">
            <!-- Búsqueda de propietario -->
            <div class="form-section">
              <h6>1. Seleccionar Propietario</h6>
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

                <!-- Resultados de búsqueda de propietarios -->
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

                <!-- Botón para registrar nuevo propietario -->
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
              <h6>2. Seleccionar Mascota</h6>
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
                        <q-avatar size="40px" color="primary" text-color="white">
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

                <!-- Botón para registrar nueva mascota -->
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

            <!-- Selección de servicio -->
            <div class="form-section" v-if="selectedPet">
              <h6>3. Seleccionar Servicio</h6>
              <div class="services-grid">
                <q-card
                  v-for="service in availableServices"
                  :key="service.id"
                  flat
                  bordered
                  class="service-item"
                  :class="{ 'selected': selectedService?.id === service.id }"
                  @click="selectService(service)"
                >
                  <q-card-section class="service-content">
                    <div class="service-info">
                      <div class="service-name">{{ service.name }}</div>
                      <div class="service-details">
                        <span class="duration">{{ service.duration }} min</span>
                        <span class="price">${{ service.price }}</span>
                      </div>
                    </div>
                    <q-icon
                      v-if="selectedService?.id === service.id"
                      name="check_circle"
                      color="positive"
                      size="md"
                    />
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Notas adicionales -->
            <div class="form-section" v-if="selectedService">
              <h6>4. Notas Adicionales (Opcional)</h6>
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
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="dialog-title">
            <q-icon name="person_add" color="primary" size="md" />
            <h6>Nuevo Propietario</h6>
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
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            @click="closeNewOwnerDialog"
          />
          <q-btn
            color="primary"
            label="Guardar"
            @click="saveNewOwner"
            :loading="savingNewOwner"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para nueva mascota -->
    <q-dialog v-model="showNewPetDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="dialog-title">
            <q-icon name="pets" color="primary" size="md" />
            <h6>Nueva Mascota</h6>
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
          <q-btn
            flat
            label="Cancelar"
            @click="closeNewPetDialog"
          />
          <q-btn
            color="secondary"
            label="Guardar"
            @click="saveNewPet"
            :loading="savingNewPet"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmación -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="success-dialog">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="72px" color="positive" />
          <h5>¡Cita Confirmada!</h5>
          <p>La cita ha sido programada exitosamente</p>
          <div class="success-details">
            <div><strong>{{ selectedPet?.nombre }}</strong></div>
            <div>{{ selectedSlot?.dayName }}, {{ selectedSlot?.date }}</div>
            <div>{{ selectedSlot?.time }}</div>
            <div>{{ selectedService?.name }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            color="positive"
            label="Aceptar"
            @click="closeSuccessDialog"
          />
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
const selectedService = ref(null)
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

// Opciones
const speciesOptions = ref([
  'Perro', 'Gato', 'Ave', 'Conejo', 'Hamster', 'Reptil', 'Otro'
])

const availableServices = ref([
  { id: 1, name: 'Consulta General', duration: 30, price: 150 },
  { id: 2, name: 'Vacunación', duration: 20, price: 200 },
  { id: 3, name: 'Desparasitación', duration: 15, price: 100 },
  { id: 4, name: 'Cirugía Menor', duration: 60, price: 800 },
  { id: 5, name: 'Baño y Corte', duration: 90, price: 300 },
  { id: 6, name: 'Rayos X', duration: 45, price: 400 }
])

// Horarios de trabajo (ejemplo)
const workingHours = ref([
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
])

// Días de la semana
const weekdays = ref(['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'])

// Computeds
const currentMonthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleDateString('es-ES', { month: 'long' })
})

const calendarDays = computed(() => {
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
    if (!isPast && !isWeekend) {
      workingHours.value.forEach(time => {
        // Simulación de ocupación aleatoria
        const isBooked = Math.random() < 0.3 // 30% de probabilidad de estar ocupado
        slots.push({
          time,
          status: isBooked ? 'booked' : 'available',
          appointment: isBooked ? { petName: 'Mascota', ownerName: 'Propietario' } : null
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
  const totalCells = 42 // 6 semanas × 7 días
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

const availableSlots = computed(() => {
  return calendarDays.value.reduce((total, day) => total + day.availableSlots, 0)
})

const bookedSlots = computed(() => {
  return calendarDays.value.reduce((total, day) => total + day.bookedSlots, 0)
})

const canConfirmAppointment = computed(() => {
  return selectedOwner.value && selectedPet.value && selectedService.value
})

// Métodos de navegación
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

// Selección de horario
const selectTimeSlot = (day, slot) => {
  if (slot.status === 'booked') {
    $q.notify({
      type: 'warning',
      message: 'Este horario ya está ocupado'
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
    // Simular búsqueda
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Datos de ejemplo
    ownerResults.value = [
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
      }
    ].filter(owner => 
      owner.nombre.toLowerCase().includes(ownerSearch.value.toLowerCase()) ||
      owner.primerapellido.toLowerCase().includes(ownerSearch.value.toLowerCase()) ||
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
    // Simular carga de mascotas
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Datos de ejemplo
    ownerPets.value = [
      {
        id: 1,
        nombre: 'Max',
        especie: 'Perro',
        raza: 'Golden Retriever',
        edad: 3,
        id_propietario: ownerId
      },
      {
        id: 2,
        nombre: 'Luna',
        especie: 'Gato',
        raza: 'Persa',
        edad: 5,
        id_propietario: ownerId
      }
    ]
    
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las mascotas'
    })
  }
}

const selectPet = (pet) => {
  selectedPet.value = pet
  selectedService.value = null
}

const selectService = (service) => {
  selectedService.value = service
}

// Dialogs
const closeAppointmentDialog = () => {
  showAppointmentDialog.value = false
  
  // Limpiar selección del horario
  if (selectedSlot.value) {
    calendarDays.value.forEach(d => {
      d.slots.forEach(s => {
        if (s.status === 'selected') {
          s.status = 'available'
        }
      })
    })
  }
  
  // Resetear selecciones
  selectedSlot.value = null
  selectedOwner.value = null
  selectedPet.value = null
  selectedService.value = null
  ownerSearch.value = ''
  ownerResults.value = []
  ownerPets.value = []
  appointmentNotes.value = ''
}

// Nuevo propietario
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
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const owner = {
      ...newOwner.value,
      id: Date.now() // ID temporal
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

// Nueva mascota
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
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const pet = {
      ...newPet.value,
      id: Date.now(), // ID temporal
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

// Confirmar cita
const confirmAppointment = async () => {
  savingAppointment.value = true
  
  try {
    // Simular guardado de cita
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
  
  // Resetear selecciones para la siguiente cita
  selectedSlot.value = null
  selectedOwner.value = null
  selectedPet.value = null
  selectedService.value = null
  ownerSearch.value = ''
  ownerResults.value = []
  ownerPets.value = []
  appointmentNotes.value = ''
}

onMounted(() => {
  // Inicialización si es necesaria
})
</script>

<style scoped>
.appointment-calendar-system {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* Header moderno */
.modern-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 32px;
  color: white;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
}

.header-icon {
  margin-right: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.header-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-subtitle {
  margin: 8px 0 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 16px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Contenedor del calendario */
.calendar-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* Selector de mes */
.selector-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.selector-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.selector-controls {
  display: flex;
  align-items: center;
  gap: 24px;
}

.month-display h5 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  text-transform: capitalize;
}

/* Calendario */
.calendar-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.calendar-section {
  padding: 0;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
}

.day-cell {
  min-height: 140px;
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
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
  background: rgba(0, 0, 0, 0.02);
}

.day-number {
  font-weight: 600;
  font-size: 0.9rem;
}

.day-cell.today .day-number {
  color: #0277bd;
  font-weight: 700;
}

.day-stats {
  display: flex;
  gap: 4px;
  font-size: 0.7rem;
}

.available-count {
  background: #dcfce7;
  color: #166534;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.booked-count {
  background: #fee2e2;
  color: #991b1b;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.day-slots {
  flex: 1;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.time-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 500;
}

.time-slot.available {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.time-slot.available:hover {
  background: #bbf7d0;
  transform: scale(1.02);
}

.time-slot.booked {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  cursor: not-allowed;
}

.time-slot.selected {
  background: #dbeafe;
  color: #1e40af;
  border: 2px solid #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.slot-time {
  font-weight: 600;
}

.past-day-message {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
}

/* Leyenda */
.legend-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.legend-content h6 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.legend-items {
  display: flex;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #4a5568;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-color.available {
  background: #dcfce7;
}

.legend-color.booked {
  background: #fee2e2;
}

.legend-color.selected {
  background: #dbeafe;
}

/* Dialog de cita */
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

.header-info h5 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-info p {
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
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

.form-section h6 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Búsqueda */
.search-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-input :deep(.q-field__control) {
  border-radius: 12px;
  height: 56px;
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

.new-owner-btn {
  display: flex;
  justify-content: center;
  padding: 16px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: #f8fafc;
}

/* Mascotas */
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

.new-pet-btn {
  display: flex;
  justify-content: center;
  padding: 16px;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: #f8fafc;
}

/* Servicios */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.service-item {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.service-item:hover {
  border-color: #e0e7ff;
  background: #f8fafc;
}

.service-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.service-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.service-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.service-details {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
}

.duration {
  color: #6b7280;
}

.price {
  color: #059669;
  font-weight: 600;
}

/* Dialog actions */
.dialog-actions {
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

/* Dialogs de formularios */
.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-title h6 {
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

/* Dialog de éxito */
.success-dialog {
  border-radius: 16px;
  overflow: hidden;
  max-width: 400px;
}

.success-dialog h5 {
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
}

.success-details div {
  margin-bottom: 4px;
  color: #166534;
}

.success-details div:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .calendar-grid {
    font-size: 0.9rem;
  }
  
  .day-cell {
    min-height: 120px;
  }
  
  .time-slot {
    font-size: 0.7rem;
    padding: 3px 5px;
  }
}

@media (max-width: 768px) {
  .appointment-calendar-system {
    padding: 16px;
  }
  
  .modern-header {
    padding: 24px;
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .calendar-grid {
    font-size: 0.8rem;
  }
  
  .day-cell {
    min-height: 100px;
  }
  
  .time-slot {
    font-size: 0.65rem;
    padding: 2px 4px;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 12px;
  }
  
  .dialog-content {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .pets-grid,
  .services-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .weekday-cell {
    padding: 8px 4px;
    font-size: 0.8rem;
  }
  
  .day-cell {
    min-height: 80px;
  }
  
  .day-header {
    padding: 4px;
  }
  
  .day-number {
    font-size: 0.8rem;
  }
  
  .time-slot {
    font-size: 0.6rem;
    padding: 1px 3px;
  }
  
  .day-slots {
    padding: 2px;
    gap: 1px;
  }
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

/* Estados de hover mejorados */
.selector-controls .q-btn:hover {
  transform: scale(1.1);
}

.today-btn .q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Scrollbar personalizado */
.dialog-content::-webkit-scrollbar,
.search-results::-webkit-scrollbar,
.day-slots::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track,
.search-results::-webkit-scrollbar-track,
.day-slots::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb,
.search-results::-webkit-scrollbar-thumb,
.day-slots::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover,
.search-results::-webkit-scrollbar-thumb:hover,
.day-slots::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
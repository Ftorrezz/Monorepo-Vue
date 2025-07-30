<template>
  <div class="appointment-module">
    <!-- Header con gradiente moderno -->
    <div class="modern-header">
      <div class="header-content">
        <div class="header-icon">
          <q-icon name="pets" size="42px" />
        </div>
        <div class="header-text">
          <h3 class="header-title">Registro de Citas</h3>
          <p class="header-subtitle">Sistema inteligente de agendamiento veterinario</p>
        </div>
      </div>
      <div class="header-decoration"></div>
    </div>

    <!-- Stepper Moderno -->
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
      class="modern-stepper"
      header-nav
    >
      <!-- Paso 1: Búsqueda/Registro de Propietario -->
      <q-step
        :name="1"
        title="Propietario"
        icon="person_search"
        :done="step > 1"
        class="step-propietario"
      >
        <div class="step-content">
          <!-- Búsqueda de propietario existente -->
          <q-card flat bordered class="search-card">
            <q-card-section>
              <div class="search-header">
                <q-icon name="search" color="primary" size="md" />
                <h6>Buscar Propietario Existente</h6>
              </div>

              <div class="search-controls">
                <q-input
                  v-model="searchQuery"
                  placeholder="Buscar por nombre, teléfono o email..."
                  outlined
                  clearable
                  class="search-input"
                  @keyup.enter="buscarPropietario"
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
                      @click="buscarPropietario"
                      :loading="searchLoading"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Resultados de búsqueda -->
              <div v-if="searchResults.length > 0" class="search-results">
                <div class="results-header">
                  <q-icon name="people" color="positive" />
                  <span>{{ searchResults.length }} propietario(s) encontrado(s)</span>
                </div>
                <div class="results-list">
                  <q-card
                    v-for="propietario in searchResults"
                    :key="propietario.id"
                    flat
                    bordered
                    class="result-item"
                    :class="{ 'selected': selectedOwner?.id === propietario.id }"
                    @click="selectOwner(propietario)"
                  >
                    <q-card-section class="result-content">
                      <div class="result-main">
                        <div class="result-name">
                          {{ propietario.nombre }} {{ propietario.primerapellido }} {{ propietario.segundoapellido }}
                        </div>
                        <div class="result-details">
                          <span><q-icon name="phone" size="xs" /> {{ propietario.telefono1 }}</span>
                          <span v-if="propietario.email"><q-icon name="email" size="xs" /> {{ propietario.email }}</span>
                        </div>
                      </div>
                      <q-icon
                        v-if="selectedOwner?.id === propietario.id"
                        name="check_circle"
                        color="positive"
                        size="md"
                      />
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- No se encontraron resultados -->
              <div v-else-if="searchQuery && searchPerformed && !searchLoading" class="no-results">
                <q-icon name="person_off" size="48px" color="grey-5" />
                <p>No se encontraron propietarios con esos datos</p>
              </div>
            </q-card-section>
          </q-card>

          <!-- Divider -->
          <div class="divider-section">
            <q-separator />
            <div class="divider-text">O</div>
            <q-separator />
          </div>

          <!-- Registro rápido de nuevo propietario -->
          <q-card flat bordered class="register-card">
            <q-card-section>
              <div class="register-header">
                <q-icon name="person_add" color="secondary" size="md" />
                <h6>Registrar Nuevo Propietario</h6>
              </div>

              <div class="register-options">
                <q-btn
                  color="secondary"
                  icon="flash_on"
                  label="Registro Rápido"
                  class="register-btn"
                  @click="showQuickRegister = true"
                />
                <q-btn
                  color="primary"
                  icon="assignment"
                  label="Registro Completo"
                  outline
                  class="register-btn"
                  @click="openCompleteOwnerDialog"
                />
              </div>

              <!-- Formulario rápido -->
              <div v-if="showQuickRegister" class="quick-form">
                <q-form ref="quickOwnerForm">
                  <div class="form-grid">
                    <q-input
                      v-model="quickOwner.nombre"
                      label="Nombre *"
                      outlined
                      :rules="[val => !!val || 'Nombre requerido']"
                    />
                    <q-input
                      v-model="quickOwner.primerapellido"
                      label="Apellido *"
                      outlined
                      :rules="[val => !!val || 'Apellido requerido']"
                    />
                    <q-input
                      v-model="quickOwner.telefono1"
                      label="Teléfono *"
                      outlined
                      mask="(###) ###-####"
                      :rules="[val => !!val || 'Teléfono requerido']"
                    />
                    <q-input
                      v-model="quickOwner.email"
                      label="Email"
                      type="email"
                      outlined
                    />
                  </div>
                  <div class="form-actions">
                    <q-btn
                      color="negative"
                      flat
                      label="Cancelar"
                      @click="cancelQuickRegister"
                    />
                    <q-btn
                      color="secondary"
                      label="Guardar y Continuar"
                      @click="saveQuickOwner"
                      :loading="savingQuickOwner"
                    />
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-stepper-navigation class="step-navigation">
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continuar"
            :disable="!selectedOwner"
            icon-right="arrow_forward"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Paso 2: Selección/Registro de Mascota -->
      <q-step
        :name="2"
        title="Mascota"
        icon="pets"
        :done="step > 2"
        class="step-mascota"
      >
        <div class="step-content">
          <!-- Mascotas existentes del propietario -->
          <q-card flat bordered class="pets-card" v-if="ownerPets.length > 0">
            <q-card-section>
              <div class="pets-header">
                <q-icon name="pets" color="primary" size="md" />
                <h6>Mascotas de {{ selectedOwner?.nombre }}</h6>
              </div>

              <div class="pets-grid">
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
                      <q-avatar size="48px" color="primary" text-color="white">
                        <q-icon name="pets" />
                      </q-avatar>
                    </div>
                    <div class="pet-info">
                      <div class="pet-name">{{ pet.nombre }}</div>
                      <div class="pet-details">
                        {{ pet.especie }} • {{ pet.raza || 'Sin raza' }}
                      </div>
                      <div class="pet-age" v-if="pet.edad">
                        {{ pet.edad }} años
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
            </q-card-section>
          </q-card>

          <!-- Divider si hay mascotas -->
          <div v-if="ownerPets.length > 0" class="divider-section">
            <q-separator />
            <div class="divider-text">O</div>
            <q-separator />
          </div>

          <!-- Registro de nueva mascota -->
          <q-card flat bordered class="register-card">
            <q-card-section>
              <div class="register-header">
                <q-icon name="add_circle" color="secondary" size="md" />
                <h6>Registrar Nueva Mascota</h6>
              </div>

              <div class="register-options">
                <q-btn
                  color="secondary"
                  icon="flash_on"
                  label="Registro Rápido"
                  class="register-btn"
                  @click="showQuickPetRegister = true"
                />
                <q-btn
                  color="primary"
                  icon="assignment"
                  label="Registro Completo"
                  outline
                  class="register-btn"
                  @click="openCompletePetDialog"
                />
              </div>

              <!-- Formulario rápido de mascota -->
              <div v-if="showQuickPetRegister" class="quick-form">
                <q-form ref="quickPetForm">
                  <div class="form-grid">
                    <q-input
                      v-model="quickPet.nombre"
                      label="Nombre de la mascota *"
                      outlined
                      :rules="[val => !!val || 'Nombre requerido']"
                    />
                    <q-select
                      v-model="quickPet.especie"
                      :options="especiesOptions"
                      label="Especie *"
                      outlined
                      :rules="[val => !!val || 'Especie requerida']"
                    />
                    <q-input
                      v-model="quickPet.raza"
                      label="Raza"
                      outlined
                    />
                    <q-input
                      v-model="quickPet.edad"
                      label="Edad (años)"
                      type="number"
                      outlined
                      min="0"
                      max="50"
                    />
                  </div>
                  <div class="form-actions">
                    <q-btn
                      color="negative"
                      flat
                      label="Cancelar"
                      @click="cancelQuickPetRegister"
                    />
                    <q-btn
                      color="secondary"
                      label="Guardar y Continuar"
                      @click="saveQuickPet"
                      :loading="savingQuickPet"
                    />
                  </div>
                </q-form>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-stepper-navigation class="step-navigation">
          <q-btn
            flat
            color="primary"
            @click="step = 1"
            label="Atrás"
            icon="arrow_back"
          />
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continuar"
            :disable="!selectedPet"
            icon-right="arrow_forward"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Paso 3: Selección de Fecha, Hora y Servicio -->
      <q-step
        :name="3"
        title="Fecha y Servicio"
        icon="event"
        :done="step > 3"
      >
        <div class="step-content">
          <div class="appointment-grid">
            <!-- Calendario -->
            <q-card flat bordered class="calendar-card">
              <q-card-section>
                <div class="calendar-header">
                  <q-icon name="calendar_today" color="primary" size="md" />
                  <h6>Seleccionar Fecha</h6>
                </div>
                <q-date
                  v-model="appointment.date"
                  :options="availableDates"
                  color="primary"
                  class="modern-calendar"
                  @update:model-value="onDateChange"
                />
              </q-card-section>
            </q-card>

            <!-- Horarios y Servicios -->
            <div class="schedule-section">
              <!-- Horarios -->
              <q-card flat bordered class="schedule-card">
                <q-card-section>
                  <div class="schedule-header">
                    <q-icon name="access_time" color="primary" size="md" />
                    <h6>Horarios Disponibles</h6>
                  </div>

                  <div v-if="!appointment.date" class="no-date-message">
                    <q-icon name="info" color="grey-5" size="24px" />
                    <p>Selecciona una fecha para ver los horarios</p>
                  </div>

                  <div v-else class="time-slots">
                    <q-btn
                      v-for="time in availableTimes"
                      :key="time"
                      :color="appointment.time === time ? 'primary' : 'grey-3'"
                      :text-color="appointment.time === time ? 'white' : 'grey-8'"
                      :unelevated="appointment.time === time"
                      :outline="appointment.time !== time"
                      @click="appointment.time = time"
                      :label="time"
                      class="time-slot"
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- Servicios -->
              <q-card flat bordered class="services-card">
                <q-card-section>
                  <div class="services-header">
                    <q-icon name="medical_services" color="primary" size="md" />
                    <h6>Seleccionar Servicio</h6>
                  </div>

                  <div class="services-grid">
                    <q-card
                      v-for="service in availableServices"
                      :key="service.id"
                      flat
                      bordered
                      class="service-item"
                      :class="{ 'selected': appointment.service?.id === service.id }"
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
                          v-if="appointment.service?.id === service.id"
                          name="check_circle"
                          color="positive"
                          size="md"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <q-stepper-navigation class="step-navigation">
          <q-btn
            flat
            color="primary"
            @click="step = 2"
            label="Atrás"
            icon="arrow_back"
          />
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continuar"
            :disable="!isAppointmentValid"
            icon-right="arrow_forward"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Paso 4: Confirmación -->
      <q-step
        :name="4"
        title="Confirmación"
        icon="check_circle"
      >
        <div class="step-content">
          <q-card flat bordered class="confirmation-card">
            <q-card-section>
              <div class="confirmation-header">
                <q-icon name="check_circle" color="positive" size="48px" />
                <h4>Confirmar Cita</h4>
                <p>Revisa los datos antes de confirmar</p>
              </div>

              <div class="confirmation-grid">
                <!-- Propietario -->
                <q-card flat class="info-card owner-card">
                  <q-card-section>
                    <div class="card-header">
                      <q-icon name="person" color="primary" />
                      <h6>Propietario</h6>
                    </div>
                    <div class="info-content">
                      <div class="info-item">
                        <strong>{{ selectedOwner?.nombre }} {{ selectedOwner?.primerapellido }}</strong>
                      </div>
                      <div class="info-item">
                        <q-icon name="phone" size="xs" />
                        {{ selectedOwner?.telefono1 }}
                      </div>
                      <div class="info-item" v-if="selectedOwner?.email">
                        <q-icon name="email" size="xs" />
                        {{ selectedOwner?.email }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Mascota -->
                <q-card flat class="info-card pet-card">
                  <q-card-section>
                    <div class="card-header">
                      <q-icon name="pets" color="secondary" />
                      <h6>Mascota</h6>
                    </div>
                    <div class="info-content">
                      <div class="info-item">
                        <strong>{{ selectedPet?.nombre }}</strong>
                      </div>
                      <div class="info-item">
                        {{ selectedPet?.especie }}
                      </div>
                      <div class="info-item" v-if="selectedPet?.raza">
                        {{ selectedPet?.raza }}
                      </div>
                      <div class="info-item" v-if="selectedPet?.edad">
                        {{ selectedPet?.edad }} años
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Cita -->
                <q-card flat class="info-card appointment-card">
                  <q-card-section>
                    <div class="card-header">
                      <q-icon name="event" color="positive" />
                      <h6>Cita</h6>
                    </div>
                    <div class="info-content">
                      <div class="info-item">
                        <strong>{{ formatDate(appointment.date) }}</strong>
                      </div>
                      <div class="info-item">
                        <q-icon name="access_time" size="xs" />
                        {{ appointment.time }}
                      </div>
                      <div class="info-item">
                        <q-icon name="medical_services" size="xs" />
                        {{ appointment.service?.name }}
                      </div>
                      <div class="info-item price-highlight">
                        <strong>${{ appointment.service?.price }}</strong>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <q-stepper-navigation class="step-navigation">
          <q-btn
            flat
            color="primary"
            @click="step = 3"
            label="Atrás"
            icon="arrow_back"
          />
          <q-btn
            @click="confirmAppointment"
            color="positive"
            label="Confirmar Cita"
            icon="check"
            :loading="loading"
            size="lg"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <!-- Dialogs para módulos completos -->
    <DialogAgregarPropietario
      v-if="showOwnerDialog"
      @propietario-guardado="onOwnerSaved"
      @cerrar="showOwnerDialog = false"
    />

    <DialogAgregarMascota
      v-if="showPetDialog"
      :propietario="selectedOwner"
      @mascota-guardada="onPetSaved"
      @cerrar="showPetDialog = false"
    />

    <!-- Dialog de éxito -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card class="success-dialog">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="72px" color="positive" />
          <h5>¡Cita Registrada!</h5>
          <p>La cita ha sido programada exitosamente para:</p>
          <div class="success-details">
            <div><strong>{{ selectedPet?.nombre }}</strong></div>
            <div>{{ formatDate(appointment.date) }} a las {{ appointment.time }}</div>
            <div>{{ appointment.service?.name }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            color="positive"
            label="Nueva Cita"
            @click="resetForm"
            icon="add"
          />
          <q-btn
            flat
            color="primary"
            label="Ver Agenda"
            @click="goToAgenda"
            icon="calendar_today"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Estados principales
const step = ref(1)
const loading = ref(false)
const showSuccess = ref(false)

// Búsqueda de propietarios
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const searchPerformed = ref(false)
const selectedOwner = ref(null)

// Registro rápido de propietario
const showQuickRegister = ref(false)
const savingQuickOwner = ref(false)
const quickOwnerForm = ref(null)
const quickOwner = ref({
  nombre: '',
  primerapellido: '',
  segundoapellido: '',
  telefono1: '',
  email: '',
  activo: 'S',
  id_sitio: 1
})

// Mascotas
const ownerPets = ref([])
const selectedPet = ref(null)
const showQuickPetRegister = ref(false)
const savingQuickPet = ref(false)
const quickPetForm = ref(null)
const quickPet = ref({
  nombre: '',
  especie: '',
  raza: '',
  edad: null,
  activo: 'S',
  id_sitio: 1,
  id_sucursal: 2
})

// Cita
const appointment = ref({
  date: '',
  time: '',
  service: null
})

// Dialogs
const showOwnerDialog = ref(false)
const showPetDialog = ref(false)

// Opciones
const especiesOptions = ref([
  'Perro', 'Gato', 'Ave', 'Conejo', 'Hamster', 'Reptil', 'Otro'
])

// Servicios disponibles
const availableServices = ref([
  { id: 1, name: 'Consulta General', duration: 30, price: 150 },
  { id: 2, name: 'Vacunación', duration: 20, price: 200 },
  { id: 3, name: 'Desparasitación', duration: 15, price: 100 },
  { id: 4, name: 'Cirugía Menor', duration: 60, price: 800 },
  { id: 5, name: 'Baño y Corte', duration: 90, price: 300 },
  { id: 6, name: 'Rayos X', duration: 45, price: 400 },
  { id: 7, name: 'Análisis de Sangre', duration: 30, price: 250 }
])

// Horarios disponibles
const availableTimes = ref([
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
])

// Fechas disponibles
const availableDates = computed(() => {
  const dates = []
  const today = new Date()

  for (let i = 1; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    if (date.getDay() !== 0) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      dates.push(`${year}/${month}/${day}`)
    }
  }

  return dates
})

// Validaciones
const isAppointmentValid = computed(() => {
  return appointment.value.date && appointment.value.time && appointment.value.service
})

// Métodos de búsqueda
const buscarPropietario = async () => {
  if (!searchQuery.value.trim()) return

  searchLoading.value = true
  searchPerformed.value = true

  try {
    // Simular búsqueda en API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Datos de ejemplo - aquí harías la llamada real a tu API
    searchResults.value = [
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
      }
    ].filter(p =>
      p.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.primerapellido.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.telefono1.includes(searchQuery.value) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al buscar propietarios'
    })
  } finally {
    searchLoading.value = false
  }
}

const selectOwner = async (owner) => {
  selectedOwner.value = owner
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

// Registro rápido de propietario
const saveQuickOwner = async () => {
  const valid = await quickOwnerForm.value.validate()
  if (!valid) return

  savingQuickOwner.value = true

  try {
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Crear propietario con ID simulado
    const newOwner = {
      ...quickOwner.value,
      id: Date.now() // ID temporal
    }

    selectedOwner.value = newOwner
    ownerPets.value = [] // Nuevo propietario no tiene mascotas

    showQuickRegister.value = false
    resetQuickOwnerForm()

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
    savingQuickOwner.value = false
  }
}

const cancelQuickRegister = () => {
  showQuickRegister.value = false
  resetQuickOwnerForm()
}

const resetQuickOwnerForm = () => {
  quickOwner.value = {
    nombre: '',
    primerapellido: '',
    segundoapellido: '',
    telefono1: '',
    email: '',
    activo: 'S',
    id_sitio: 1
  }
  if (quickOwnerForm.value) {
    quickOwnerForm.value.resetValidation()
  }
}

// Registro rápido de mascota
const selectPet = (pet) => {
  selectedPet.value = pet
}

const saveQuickPet = async () => {
  const valid = await quickPetForm.value.validate()
  if (!valid) return

  savingQuickPet.value = true

  try {
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Crear mascota con ID simulado
    const newPet = {
      ...quickPet.value,
      id: Date.now(), // ID temporal
      id_propietario: selectedOwner.value.id
    }

    selectedPet.value = newPet
    ownerPets.value.push(newPet) // Agregar a la lista

    showQuickPetRegister.value = false
    resetQuickPetForm()

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
    savingQuickPet.value = false
  }
}

const cancelQuickPetRegister = () => {
  showQuickPetRegister.value = false
  resetQuickPetForm()
}

const resetQuickPetForm = () => {
  quickPet.value = {
    nombre: '',
    especie: '',
    raza: '',
    edad: null,
    activo: 'S',
    id_sitio: 1,
    id_sucursal: 2
  }
  if (quickPetForm.value) {
    quickPetForm.value.resetValidation()
  }
}

// Módulos completos
const openCompleteOwnerDialog = () => {
  showOwnerDialog.value = true
}

const openCompletePetDialog = () => {
  if (!selectedOwner.value) {
    $q.notify({
      type: 'warning',
      message: 'Primero selecciona un propietario'
    })
    return
  }
  showPetDialog.value = true
}

const onOwnerSaved = (owner) => {
  selectedOwner.value = owner
  loadOwnerPets(owner.id)
  showOwnerDialog.value = false
}

const onPetSaved = (pet) => {
  selectedPet.value = pet
  ownerPets.value.push(pet)
  showPetDialog.value = false
}

// Cita
const nextStep = () => {
  if (step.value < 4) {
    step.value++
  }
}

const onDateChange = (date) => {
  appointment.value.time = ''
  // Aquí podrías cargar horarios específicos para la fecha
}

const selectService = (service) => {
  appointment.value.service = service
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const confirmAppointment = async () => {
  loading.value = true

  try {
    // Simular guardado de cita
    await new Promise(resolve => setTimeout(resolve, 2000))

    const appointmentData = {
      propietario: selectedOwner.value,
      mascota: selectedPet.value,
      fecha: appointment.value.date,
      hora: appointment.value.time,
      servicio: appointment.value.service,
      estado: 'programada'
    }

    console.log('Cita guardada:', appointmentData)

    showSuccess.value = true

    $q.notify({
      type: 'positive',
      message: 'Cita registrada exitosamente',
      position: 'top'
    })

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al registrar la cita',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  step.value = 1
  showSuccess.value = false

  // Reset búsqueda
  searchQuery.value = ''
  searchResults.value = []
  searchPerformed.value = false
  selectedOwner.value = null

  // Reset mascotas
  ownerPets.value = []
  selectedPet.value = null
  showQuickPetRegister.value = false

  // Reset cita
  appointment.value = {
    date: '',
    time: '',
    service: null
  }

  // Reset formularios
  showQuickRegister.value = false
  resetQuickOwnerForm()
  resetQuickPetForm()
}

const goToAgenda = () => {
  showSuccess.value = false
  // Navegar a agenda
  console.log('Navegando a la agenda...')
}

onMounted(() => {
  // Inicialización
})
</script>

<style scoped>
.appointment-module {
  max-width: 1400px;
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
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
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

.header-decoration {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

/* Stepper moderno */
.modern-stepper {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modern-stepper :deep(.q-stepper__step-inner) {
  padding: 0;
}

.modern-stepper :deep(.q-stepper__step-content) {
  padding: 0;
  margin-left: 0;
}

.modern-stepper :deep(.q-stepper__tab) {
  padding: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.step-content {
  padding: 32px;
  background: #fafbfc;
}

/* Cards modernas */
.search-card,
.register-card,
.pets-card,
.calendar-card,
.schedule-card,
.services-card,
.confirmation-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
}

.search-card:hover,
.register-card:hover,
.pets-card:hover,
.calendar-card:hover,
.schedule-card:hover,
.services-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Headers de secciones */
.search-header,
.register-header,
.pets-header,
.calendar-header,
.schedule-header,
.services-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.search-header h6,
.register-header h6,
.pets-header h6,
.calendar-header h6,
.schedule-header h6,
.services-header h6 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

/* Búsqueda */
.search-input {
  margin-bottom: 24px;
}

.search-input :deep(.q-field__control) {
  border-radius: 12px;
  height: 56px;
}

.search-results {
  margin-top: 24px;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #059669;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

/* Sin resultados */
.no-results {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.no-results p {
  margin: 16px 0 0 0;
  font-size: 1.1rem;
}

/* Divider */
.divider-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
}

.divider-text {
  background: #f1f5f9;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Registro */
.register-options {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.register-btn {
  flex: 1;
  height: 56px;
  border-radius: 12px;
  font-weight: 600;
}

.quick-form {
  margin-top: 24px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Mascotas */
.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
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
  gap: 16px;
  padding: 20px;
}

.pet-info {
  flex: 1;
}

.pet-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.pet-details {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.pet-age {
  color: #059669;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Cita */
.appointment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.schedule-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modern-calendar {
  width: 100%;
}

.modern-calendar :deep(.q-date__calendar) {
  border-radius: 12px;
}

.no-date-message {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.no-date-message p {
  margin: 12px 0 0 0;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.time-slot {
  border-radius: 8px;
  height: 44px;
  font-weight: 500;
}

.services-grid {
  display: flex;
  flex-direction: column;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.service-details {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
}

.duration {
  color: #6b7280;
}

.price {
  color: #059669;
  font-weight: 600;
}

/* Confirmación */
.confirmation-header {
  text-align: center;
  margin-bottom: 32px;
}

.confirmation-header h4 {
  margin: 16px 0 8px 0;
  color: #1f2937;
}

.confirmation-header p {
  margin: 0;
  color: #6b7280;
}

.confirmation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.info-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.owner-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pet-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.appointment-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.card-header h6 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.price-highlight {
  font-size: 1.2rem;
  font-weight: 700;
}

/* Navegación */
.step-navigation {
  padding: 24px 32px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
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
@media (max-width: 1024px) {
  .appointment-grid {
    grid-template-columns: 1fr;
  }

  .confirmation-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .appointment-module {
    padding: 16px;
  }

  .modern-header {
    padding: 24px;
  }

  .header-title {
    font-size: 2rem;
  }

  .step-content {
    padding: 20px;
  }

  .register-options {
    flex-direction: column;
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .time-slots {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .step-navigation {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
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

.step-content {
  animation: slideInUp 0.3s ease-out;
}

/* Efectos hover mejorados */
.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.time-slot:hover {
  transform: translateY(-1px);
}

/* Estados de carga */
.q-btn--loading {
  pointer-events: none;
}
</style>

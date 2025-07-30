<template>
  <div class="appointment-module">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <h4 class="text-h4 text-primary q-my-none">
          <q-icon name="pets" class="q-mr-sm" />
          Registro de Citas
        </h4>
        <p class="text-grey-6 q-mb-none">Programa una nueva cita veterinaria</p>
      </div>
    </div>

    <!-- Stepper -->
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
      class="appointment-stepper"
    >
      <!-- Paso 1: Datos del Propietario -->
      <q-step
        :name="1"
        title="Datos del Propietario"
        icon="person"
        :done="step > 1"
        :header-nav="step > 1"
      >
        <q-card flat bordered class="q-pa-md">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="owner.name"
                label="Nombre completo *"
                outlined
                :rules="[val => !!val || 'Nombre es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="owner.phone"
                label="Teléfono *"
                outlined
                mask="(###) ###-####"
                :rules="[val => !!val || 'Teléfono es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="owner.email"
                label="Email"
                type="email"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="owner.address"
                label="Dirección"
                outlined
              >
                <template v-slot:prepend>
                  <q-icon name="home" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card>

        <q-stepper-navigation class="q-mt-md">
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continuar"
            :disable="!isOwnerValid"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Paso 2: Datos de la Mascota -->
      <q-step
        :name="2"
        title="Datos de la Mascota"
        icon="pets"
        :done="step > 2"
        :header-nav="step > 2"
      >
        <q-card flat bordered class="q-pa-md">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="pet.name"
                label="Nombre de la mascota *"
                outlined
                :rules="[val => !!val || 'Nombre es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="pets" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="pet.species"
                :options="speciesOptions"
                label="Especie *"
                outlined
                :rules="[val => !!val || 'Especie es requerida']"
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="pet.breed"
                label="Raza"
                outlined
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="pet.age"
                label="Edad (años)"
                type="number"
                outlined
                min="0"
                max="50"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="pet.gender"
                :options="genderOptions"
                label="Sexo"
                outlined
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="pet.weight"
                label="Peso (kg)"
                type="number"
                outlined
                step="0.1"
                min="0"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="pet.notes"
                label="Observaciones adicionales"
                type="textarea"
                outlined
                rows="3"
              />
            </div>
          </div>
        </q-card>

        <q-stepper-navigation class="q-mt-md">
          <q-btn
            flat
            color="primary"
            @click="step = 1"
            label="Atrás"
            class="q-mr-sm"
          />
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continuar"
            :disable="!isPetValid"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Paso 3: Selección de Fecha, Hora y Servicio -->
      <q-step
        :name="3"
        title="Fecha, Hora y Servicio"
        icon="event"
        :done="step > 3"
      >
        <div class="row q-gutter-lg">
          <!-- Calendario -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="calendar_today" class="q-mr-sm" />
                  Seleccionar Fecha
                </div>
                <q-date
                  v-model="appointment.date"
                  :options="availableDates"
                  color="primary"
                  class="full-width"
                  @update:model-value="onDateChange"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Horarios y Servicios -->
          <div class="col-12 col-md-6">
            <!-- Horarios Disponibles -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="access_time" class="q-mr-sm" />
                  Horarios Disponibles
                </div>
                <div v-if="!appointment.date" class="text-grey-6 text-center q-pa-md">
                  Selecciona una fecha para ver los horarios disponibles
                </div>
                <div v-else class="row q-gutter-sm">
                  <q-btn
                    v-for="time in availableTimes"
                    :key="time"
                    :color="appointment.time === time ? 'primary' : 'grey-3'"
                    :text-color="appointment.time === time ? 'white' : 'grey-8'"
                    :outline="appointment.time !== time"
                    @click="appointment.time = time"
                    :label="time"
                    size="sm"
                    class="q-ma-xs"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- Servicios -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  <q-icon name="medical_services" class="q-mr-sm" />
                  Servicio
                </div>
                <q-select
                  v-model="appointment.service"
                  :options="availableServices"
                  option-label="name"
                  option-value="id"
                  label="Seleccionar servicio *"
                  outlined
                  :rules="[val => !!val || 'Servicio es requerido']"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>
                          {{ scope.opt.duration }} min - ${{ scope.opt.price }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <div>
                      {{ scope.opt.name }}
                      <div class="text-caption text-grey-6">
                        {{ scope.opt.duration }} min - ${{ scope.opt.price }}
                      </div>
                    </div>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-stepper-navigation class="q-mt-md">
          <q-btn
            flat
            color="primary"
            @click="step = 2"
            label="Atrás"
            class="q-mr-sm"
          />
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continuar"
            :disable="!isAppointmentValid"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Paso 4: Confirmación -->
      <q-step
        :name="4"
        title="Confirmación"
        icon="check_circle"
      >
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6 q-mb-md text-primary">
            <q-icon name="check_circle" class="q-mr-sm" />
            Resumen de la Cita
          </div>

          <div class="row q-gutter-lg">
            <!-- Datos del Propietario -->
            <div class="col-12 col-md-4">
              <q-card flat class="bg-grey-1">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">
                    <q-icon name="person" class="q-mr-sm" />
                    Propietario
                  </div>
                  <div><strong>Nombre:</strong> {{ owner.name }}</div>
                  <div><strong>Teléfono:</strong> {{ owner.phone }}</div>
                  <div v-if="owner.email"><strong>Email:</strong> {{ owner.email }}</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Datos de la Mascota -->
            <div class="col-12 col-md-4">
              <q-card flat class="bg-grey-1">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">
                    <q-icon name="pets" class="q-mr-sm" />
                    Mascota
                  </div>
                  <div><strong>Nombre:</strong> {{ pet.name }}</div>
                  <div><strong>Especie:</strong> {{ pet.species }}</div>
                  <div v-if="pet.breed"><strong>Raza:</strong> {{ pet.breed }}</div>
                  <div v-if="pet.age"><strong>Edad:</strong> {{ pet.age }} años</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Detalles de la Cita -->
            <div class="col-12 col-md-4">
              <q-card flat class="bg-primary text-white">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">
                    <q-icon name="event" class="q-mr-sm" />
                    Cita
                  </div>
                  <div><strong>Fecha:</strong> {{ formatDate(appointment.date) }}</div>
                  <div><strong>Hora:</strong> {{ appointment.time }}</div>
                  <div><strong>Servicio:</strong> {{ appointment.service?.name }}</div>
                  <div><strong>Duración:</strong> {{ appointment.service?.duration }} min</div>
                  <div><strong>Costo:</strong> ${{ appointment.service?.price }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card>

        <q-stepper-navigation class="q-mt-md">
          <q-btn
            flat
            color="primary"
            @click="step = 3"
            label="Atrás"
            class="q-mr-sm"
          />
          <q-btn
            @click="confirmAppointment"
            color="positive"
            label="Confirmar Cita"
            icon="check"
            :loading="loading"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <!-- Dialog de Confirmación -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card class="text-center q-pa-lg">
        <q-card-section>
          <q-icon name="check_circle" size="64px" color="positive" />
          <div class="text-h6 q-mt-md">¡Cita Registrada!</div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            La cita ha sido programada exitosamente
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            color="positive"
            label="Nueva Cita"
            @click="resetForm"
          />
          <q-btn
            flat
            color="primary"
            label="Ver Agenda"
            @click="goToAgenda"
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

// Estados reactivos
const step = ref(1)
const loading = ref(false)
const showSuccess = ref(false)

// Datos del propietario
const owner = ref({
  name: '',
  phone: '',
  email: '',
  address: ''
})

// Datos de la mascota
const pet = ref({
  name: '',
  species: '',
  breed: '',
  age: null,
  gender: '',
  weight: null,
  notes: ''
})

// Datos de la cita
const appointment = ref({
  date: '',
  time: '',
  service: null
})

// Opciones para los selects
const speciesOptions = ref([
  'Perro',
  'Gato',
  'Ave',
  'Conejo',
  'Hamster',
  'Reptil',
  'Otro'
])

const genderOptions = ref([
  'Macho',
  'Hembra'
])

// Servicios disponibles (esto vendría de tu módulo de configuración)
const availableServices = ref([
  { id: 1, name: 'Consulta General', duration: 30, price: 150 },
  { id: 2, name: 'Vacunación', duration: 20, price: 200 },
  { id: 3, name: 'Desparasitación', duration: 15, price: 100 },
  { id: 4, name: 'Cirugía Menor', duration: 60, price: 800 },
  { id: 5, name: 'Baño y Corte', duration: 90, price: 300 },
  { id: 6, name: 'Rayos X', duration: 45, price: 400 },
  { id: 7, name: 'Análisis de Sangre', duration: 30, price: 250 }
])

// Horarios disponibles (esto vendría de tu módulo de agenda)
const availableTimes = ref([
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
])

// Validaciones computadas
const isOwnerValid = computed(() => {
  return owner.value.name && owner.value.phone
})

const isPetValid = computed(() => {
  return pet.value.name && pet.value.species
})

const isAppointmentValid = computed(() => {
  return appointment.value.date && appointment.value.time && appointment.value.service
})

// Función para obtener fechas disponibles (próximos 30 días, excluyendo domingos)
const availableDates = computed(() => {
  const dates = []
  const today = new Date()

  for (let i = 1; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    // Excluir domingos (0 = domingo)
    if (date.getDay() !== 0) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      dates.push(`${year}/${month}/${day}`)
    }
  }

  return dates
})

// Métodos
const nextStep = () => {
  if (step.value < 4) {
    step.value++
  }
}

const onDateChange = (date) => {
  // Aquí podrías hacer una consulta para obtener los horarios disponibles para esa fecha
  appointment.value.time = ''
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
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Aquí harías la llamada real a tu API
    const appointmentData = {
      owner: owner.value,
      pet: pet.value,
      appointment: appointment.value
    }

    console.log('Datos de la cita:', appointmentData)

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

  owner.value = {
    name: '',
    phone: '',
    email: '',
    address: ''
  }

  pet.value = {
    name: '',
    species: '',
    breed: '',
    age: null,
    gender: '',
    weight: null,
    notes: ''
  }

  appointment.value = {
    date: '',
    time: '',
    service: null
  }
}

const goToAgenda = () => {
  showSuccess.value = false
  // Aquí navegarías a tu módulo de agenda
  console.log('Navegando a la agenda...')
}

onMounted(() => {
  // Inicialización si es necesaria
})
</script>

<style scoped>
.appointment-module {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.appointment-stepper {
  background: transparent;
}

.appointment-stepper .q-stepper__step-inner {
  padding: 0;
}

.appointment-stepper .q-stepper__step-content {
  padding-left: 0;
}

@media (max-width: 768px) {
  .appointment-module {
    padding: 10px;
  }
}
</style>

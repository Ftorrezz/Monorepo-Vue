<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="width: 800px; max-width: 90vw; border-radius: 16px;">
      <q-card-section class="bg-primary text-white q-pa-md">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="add_task" size="md" class="q-mr-sm" />
            <div>
              <div class="text-h6">Agendar Cita Rápida</div>
              <div class="text-caption" translate="no">{{ mascota?.nombre }} - {{ propietario?.nombre }} {{ propietario?.primerapellido }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-stepper
          v-model="step"
          ref="stepper"
          color="primary"
          animated
          flat
          header-nav
          class="bg-transparent"
        >
          <!-- Paso 1: Seleccionar Servicio -->
          <q-step
            :name="1"
            title="Servicio"
            icon="medical_services"
            :done="step > 1"
          >
            <div class="row q-col-gutter-md q-pa-sm">
              <div 
                v-for="service in services" 
                :key="service.id" 
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card 
                  flat 
                  bordered 
                  class="service-card cursor-pointer full-height"
                  :class="{ 'active-service': selectedService?.id === service.id }"
                  @click="selectServiceLocal(service)"
                >
                  <q-card-section class="text-center column items-center justify-center h-100">
                    <q-avatar 
                      :color="selectedService?.id === service.id ? 'primary' : service.color" 
                      text-color="white" 
                      size="56px"
                      class="shadow-2"
                    >
                      <q-icon :name="service.icon" />
                    </q-avatar>
                    <div class="text-subtitle1 q-mt-md text-weight-bold">{{ service.name }}</div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      <q-icon name="schedule" size="xs" /> {{ service.duration }} min
                      <span class="q-mx-xs">•</span>
                      <q-icon name="payments" size="xs" /> ${{ service.price }}
                    </div>
                  </q-card-section>
                  
                  <q-inner-loading :showing="selectedService?.id === service.id" color="primary">
                    <q-icon name="check_circle" size="32px" color="primary" />
                  </q-inner-loading>
                </q-card>
              </div>
            </div>
          </q-step>

          <!-- Paso 2: Seleccionar Fecha y Hora -->
          <q-step
            :name="2"
            title="Fecha y Hora"
            icon="event"
            :done="step > 2"
          >
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <div class="text-subtitle2 q-mb-sm">Selecciona una fecha</div>
                <q-date
                  v-model="selectedDateString"
                  mask="YYYY/MM/DD"
                  flat
                  bordered
                  class="full-width"
                  :options="dateOptions"
                  :events="agendaEvents"
                  event-color="primary"
                  @update:model-value="onDateChange"
                />
              </div>
              <div class="col-12 col-md-6 column">
                <div class="text-subtitle2 q-mb-sm">Horarios disponibles</div>
                <div v-if="loadingSlots" class="flex flex-center q-pa-xl">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
                <div v-else-if="availableSlots.length === 0" class="flex flex-center q-pa-xl text-grey-6 text-center">
                  <q-icon name="event_busy" size="48px" class="q-mb-sm" />
                  <div>No hay horarios disponibles para esta fecha.</div>
                </div>
                <div v-else class="slots-container scroll">
                  <div class="row q-col-gutter-sm">
                    <div v-for="slot in availableSlots" :key="slot.time" class="col-4">
                      <q-btn
                        unelevated
                        :outline="selectedSlot?.time !== slot.time"
                        :label="slot.time"
                        class="full-width slot-btn"
                        @click="selectedSlot = slot"
                        no-caps
                        :color="selectedSlot?.time === slot.time ? 'primary' : 'grey-7'"
                        :class="{ 'selected-slot-shadow': selectedSlot?.time === slot.time }"
                      >
                        <q-badge v-if="selectedSlot?.time === slot.time" floating color="primary" rounded />
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-step>

          <!-- Paso 3: Confirmar Detalles -->
          <q-step
            :name="3"
            title="Confirmar"
            icon="check_circle"
          >
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-banner dense class="bg-blue-1 text-primary rounded-borders q-pa-md">
                  <template v-slot:avatar>
                    <q-icon name="info" color="primary" />
                  </template>
                  <strong>{{ selectedService?.name }}</strong> para <strong>{{ mascota?.nombre }}</strong><br>
                  Fecha: <strong>{{ formattedDate }}</strong> a las <strong>{{ selectedSlot?.time }}</strong>
                </q-banner>
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.profesional_id"
                  :options="profesionales"
                  option-label="nombre_completo"
                  option-value="id"
                  label="Profesional Asignado (Opcional)"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="col-12 col-md-6">
                <ListaMotivoCita
                  v-model="formData.motivo_id"
                  label="Motivo de la cita *"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="full-width"
                  :rules="[val => !!val || 'El motivo es obligatorio']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="formData.observaciones"
                  label="Observaciones"
                  type="textarea"
                  rows="3"
                  outlined
                  dense
                />
              </div>
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
        <q-space />
        <q-btn
          v-if="step > 1"
          flat
          color="primary"
          @click="$refs.stepper.previous()"
          label="Anterior"
        />
        <q-btn
          @click="nextStep"
          color="primary"
          :label="step === 3 ? 'Confirmar Cita' : 'Siguiente'"
          unelevated
          :disable="!canMoveForward"
          :loading="confirming"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAgenda } from 'src/composables/useAgenda'
import NdPeticionControl from 'src/controles/rest.control'
import ListaMotivoCita from '../../../../../libs/shared/src/components/listas/ListaMotivoCita.vue'
import { useDialogStore } from 'src/stores/DialogoUbicacion'
import notificacionService from 'src/services/notificacion.service'

const props = defineProps({
  modelValue: Boolean,
  mascota: Object,
  propietario: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

const $q = useQuasar()
const store = useDialogStore()
const { 
  services, loadServices, loadDisponibilidadDia, dateOptions, formatDateKey,
  selectedService, selectService, agendaEvents, getStatusLabel, formatTime
} = useAgenda()

const dialogVisible = ref(false)
const step = ref(1)
const confirming = ref(false)
const loadingSlots = ref(false)

// Eliminamos el ref local selectedService ya que usaremos el de useAgenda
// const selectedService = ref(null)
const selectedDateString = ref(new Date().toISOString().split('T')[0].replace(/-/g, '/'))
const selectedSlot = ref(null)
const availableSlots = ref([])

const profesionales = ref([])
const motivos = ref([])

const formData = reactive({
  profesional_id: null,
  motivo_id: null,
  observaciones: ''
})

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    resetDialog()
    initData()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const resetDialog = () => {
  step.value = 1
  selectedService.value = null
  selectedSlot.value = null
  availableSlots.value = []
  formData.profesional_id = null
  formData.motivo_id = null
  formData.observaciones = ''
}

const initData = async () => {
  await loadServices()
  
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo('profesional', 'get')
    const profs = Array.isArray(response) ? response : (response?.data || [])
    
    // Mapear profesionales para mostrar nombre completo usando los campos correctos
    profesionales.value = profs.map(p => {
      const nombre = p.nombre || p.poblador_nombre || '';
      const primer = p.primerapellido || p.poblador_primerapellido || p.poblador_primer_apellido || '';
      const segundo = p.segundoapellido || p.poblador_segundoapellido || p.poblador_segundo_apellido || '';
      return {
        ...p,
        nombre_completo: `${nombre} ${primer} ${segundo}`.trim() || 'Sin nombre'
      }
    })
  } catch (error) {
    console.error('Error al cargar profesionales:', error)
  }
}

const selectServiceLocal = (service) => {
  selectService(service) // Usa la función del composable para cargar el mes
  step.value = 2
  loadAvailability()
}

const onDateChange = () => {
  selectedSlot.value = null
  loadAvailability()
}

const loadAvailability = async () => {
  if (!selectedService.value || !selectedDateString.value) return

  loadingSlots.value = true
  try {
    const fecha = new Date(selectedDateString.value)
    // loadDisponibilidadDia devuelve los horarios procesados o crudos según la implementación
    const response = await loadDisponibilidadDia(selectedService.value.id, fecha)
    
    if (Array.isArray(response)) {
      // Mapear al formato que espera el diálogo
      availableSlots.value = response.map(horario => ({
        time: formatTime(horario.hora || horario.hora_inicio || '00:00'),
        status: horario.disponible ? 'available' : 'booked',
        id_slot: horario.id || horario.id_slot
      })).filter(s => s.status === 'available')
    } else {
      availableSlots.value = []
    }
  } catch (error) {
    console.error('Error al cargar disponibilidad:', error)
    availableSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}

const getSlotStatus = (horario) => {
    if (!horario) return 'booked'
    const estado = String(horario.estado || '').toUpperCase()
    const disponible = horario.disponible === true || horario.disponible === 'true'

    if (disponible || estado === 'D' || estado === 'DISPONIBLE' || estado === 'X' || estado === 'CANCELADA') {
        return 'available'
    }
    return 'booked'
}

const canMoveForward = computed(() => {
  if (step.value === 1) return selectedService.value !== null
  if (step.value === 2) return selectedSlot.value !== null
  if (step.value === 3) return formData.profesional_id && formData.motivo_id
  return false
})

const nextStep = () => {
  if (step.value < 3) {
    step.value++
  } else {
    confirmarCita()
  }
}

const confirmarCita = async () => {
  confirming.value = true
  try {
    const peticion = new NdPeticionControl()
    
    const datos = {
      id_propietario: props.propietario.id,
      id_mascota: props.mascota.id,
      id_servicio: selectedService.value.id,
      id_profesional: formData.profesional_id,
      id_motivo: formData.motivo_id,
      fecha: formatDateKey(new Date(selectedDateString.value)),
      hora: selectedSlot.value.time,
      observaciones: formData.observaciones,
      id_sucursal: store.id_sucursal,
      estado: 'P' // Programada
    }

    const response = await peticion.invocarMetodo('agenda/citas', 'post', datos)
    
    if (response) {
      $q.notify({
        type: 'positive',
        message: 'Cita agendada exitosamente',
        icon: 'check_circle'
      })

      // Encolar notificación de confirmación para n8n
      try {
        const idCita = response.id || (Array.isArray(response) ? response[0]?.id : null)
        if (idCita) {
          await notificacionService.queueNotificacion({
            id_cita: idCita,
            id_propietario: props.propietario.id,
            tipo: 'CONFIRMACION',
            medio: 'WSP',
            destino: props.propietario.telefono1 || props.propietario.poblador_contacto_telefono1 || '',
            mensaje: `Hola ${props.propietario.nombre}, confirmamos tu cita para ${props.mascota.nombre} el ${formattedDate.value} a las ${selectedSlot.value.time}.`,
            fecha_programada: new Date().toISOString(), // Envío inmediato
            estado: 'PEND',
            id_sucursal: store.id_sucursal,
            id_sitio: store.id_sitio
          })
        }
      } catch (notifError) {
        console.warn('Error al encolar notificación:', notifError)
        // No bloqueamos el éxito de la cita por un error en la notificación
      }

      emit('success')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('Error al confirmar cita:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo agendar la cita',
      caption: error.message
    })
  } finally {
    confirming.value = false
  }
}

const profesionalesOpciones = computed(() => {
  return profesionales.value.map(p => ({
    label: (p.nombre_completo || `${p.nombre || ''} ${p.primerapellido || ''}`).trim(),
    value: p.id
  }))
})

const motivosOpciones = computed(() => {
  return motivos.value.map(m => ({
    label: m.descripcion || m.nombre,
    value: m.id
  }))
})

const formattedDate = computed(() => {
  if (!selectedDateString.value) return ''
  return new Date(selectedDateString.value).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
})

onMounted(() => {
  if (props.modelValue) {
    initData()
  }
})
</script>

<style scoped>
.service-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 16px;
  overflow: hidden;
}
.service-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  border-color: var(--q-primary);
}
.active-service {
  border-color: var(--q-primary);
  border-width: 2px;
  background: rgba(25, 118, 210, 0.02);
}
.slots-container {
  max-height: 400px;
  padding: 8px;
}
.slot-btn {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
}
.selected-slot-shadow {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}
.h-100 {
  height: 100%;
}
</style>

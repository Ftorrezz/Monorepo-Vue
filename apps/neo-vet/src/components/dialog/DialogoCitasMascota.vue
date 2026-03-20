<template>
  <q-dialog v-model="dialogVisible" persistent transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 650px; max-width: 95vw; border-radius: 20px; overflow: hidden;" class="shadow-24">
      <!-- Header con Gradiente Premium -->
      <q-card-section class="bg-gradient-header text-white q-pa-lg">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <div class="icon-container q-mr-md">
              <q-icon name="history_edu" size="md" />
            </div>
            <div>
              <div class="text-h5 text-weight-bold">Historial de Citas</div>
              <div class="text-subtitle2 opacity-80" translate="no">Pacientes: {{ mascota?.nombre || 'Paciente' }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup class="close-btn" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg bg-grey-1" style="min-height: 400px;">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-center q-pa-xl column">
          <q-spinner-cube color="primary" size="60px" />
          <div class="q-mt-md text-h6 text-primary">Cargando historial experto...</div>
        </div>

        <template v-else>
          <!-- Empty State -->
          <div v-if="citas.length === 0" class="flex flex-center q-pa-xl text-grey-6 column empty-state">
            <div class="empty-icon-wrapper q-mb-lg">
              <q-icon name="event_busy" size="80px" />
            </div>
            <div class="text-h5 text-weight-medium">Sin citas registradas</div>
            <div class="text-body1 text-center font-light q-mt-sm" style="max-width: 300px;">
              Esta mascota no tiene citas agendadas actualmente en el sistema.
            </div>
            <q-btn 
              color="primary" 
              outline 
              label="Agendar ahora" 
              icon="add_circle" 
              class="q-mt-xl rounded-pill"
              @click="$emit('agendar')"
            />
          </div>

          <!-- Timeline / List of Cards -->
          <div v-else class="citas-container">
            <div v-for="cita in sortedCitas" :key="cita.id" class="cita-card q-mb-md shadow-1">
              <div class="row no-wrap">
                <!-- Data/Hora Section -->
                <div class="date-section column items-center justify-center q-px-md" :class="'bg-' + getStatusColor(cita.estado) + '-1'">
                  <div class="text-h6 text-weight-bolder" :class="'text-' + getStatusColor(cita.estado)">
                    {{ getDay(cita.fecha) }}
                  </div>
                  <div class="text-caption text-uppercase text-weight-medium text-grey-7">
                    {{ getMonth(cita.fecha) }}
                  </div>
                  <q-separator class="full-width q-my-xs" />
                  <div class="text-subtitle1 text-weight-bold text-dark">
                    {{ formatTime(cita.hora) }}
                  </div>
                </div>

                <!-- Info Section -->
                <div class="info-section col q-pa-md relative-position">
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-subtitle1 text-weight-bold text-primary text-uppercase letter-spacing-1">
                      {{ cita.servicio_nombre || cita.servicioagenda_nombre || 'CONSULTA GENERAL' }}
                    </div>
                    <q-badge :color="getStatusColor(cita.estado)" class="q-pa-xs rounded-6">
                      {{ cita.estado_label || getStatusLabel(cita.estado) }}
                    </q-badge>
                  </div>

                  <div class="row items-center text-grey-8 q-mb-sm">
                    <q-icon name="person" size="18px" class="q-mr-xs" />
                    <span class="text-weight-medium">{{ cita.profesional_nombre || 'Profesional no asignado' }}</span>
                  </div>

                  <div v-if="cita.observaciones" class="observation-box q-pa-sm rounded-borders bg-grey-2 text-grey-8 text-italic">
                    <q-icon name="format_quote" size="xs" class="q-mr-xs opacity-50" />
                    {{ cita.observaciones }}
                  </div>
                  
                  <!-- Small hint if configured -->
                  <div class="absolute-bottom-right q-pa-xs">
                    <div class="text-caption text-grey-5" style="font-size: 10px;">ID: #{{ cita.id }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </q-card-section>

      <!-- Bottom Actions -->
      <q-card-actions align="between" class="q-pa-md bg-white border-top">
        <div class="text-caption text-grey-7 q-ml-sm">
          Total: <strong>{{ citas.length }}</strong> citas encontradas
        </div>
        <div>
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-btn 
            unelevated
            color="primary" 
            icon="add" 
            label="Nueva Cita" 
            class="action-btn px-lg"
            @click="$emit('agendar')" 
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import NdPeticionControl from 'src/controles/rest.control'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  mascota: Object
})

const emit = defineEmits(['update:modelValue', 'agendar'])

const $q = useQuasar()
const dialogVisible = ref(false)
const loading = ref(false)
const citas = ref([])

const sortedCitas = computed(() => {
  return [...citas.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.mascota?.id) {
    cargarCitas()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const cargarCitas = async () => {
  loading.value = true
  try {
    const peticion = new NdPeticionControl()
    const response = await peticion.invocarMetodo(`agenda/citas/mascota/${props.mascota.id}`, 'get')
    citas.value = Array.isArray(response) ? response : (response?.data || [])
  } catch (error) {
    console.error('Error al cargar citas:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el historial de citas',
      icon: 'error_outline'
    })
  } finally {
    loading.value = false
  }
}

const getDay = (dateStr) => {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return date.getDate()
}

const getMonth = (dateStr) => {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase()
}

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--'
  // Si viene como HH:mm:ss, cortamos a HH:mm
  return timeStr.substring(0, 5)
}

const getStatusColor = (status) => {
  const s = String(status || '').toUpperCase()
  if (s === 'P' || s === 'PROGRAMADA') return 'primary'
  if (s === 'C' || s === 'CONFIRMADA') return 'info'
  if (s === 'F' || s === 'FINALIZADA') return 'positive'
  if (s === 'X' || s === 'CANCELADA') return 'negative'
  return 'grey-7'
}

const getStatusLabel = (status) => {
  const s = String(status || '').toUpperCase()
  if (s === 'P' || s === 'PROGRAMADA') return 'Programada'
  if (s === 'C' || s === 'CONFIRMADA') return 'Confirmada'
  if (s === 'F' || s === 'FINALIZADA') return 'Finalizada'
  if (s === 'X' || s === 'CANCELADA') return 'Cancelada'
  return status
}

onMounted(() => {
  if (props.modelValue && props.mascota?.id) {
    cargarCitas()
  }
})
</script>

<style scoped>
.bg-gradient-header {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
}

.icon-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opacity-80 {
  opacity: 0.8;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
}

.citas-container {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.citas-container::-webkit-scrollbar {
  width: 4px;
}
.citas-container::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 4px;
}

.cita-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid #f0f0f0;
}

.cita-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
  border-color: #e0e0e0;
}

.date-section {
  width: 90px;
  flex-shrink: 0;
  border-right: 1px dashed #e0e0e0;
}

.letter-spacing-1 {
  letter-spacing: 0.5px;
}

.rounded-6 {
  border-radius: 6px;
}

.rounded-pill {
  border-radius: 50px;
}

.observation-box {
  font-size: 0.9em;
  border-left: 3px solid #ddd;
}

.empty-state {
  opacity: 0.7;
}

.empty-icon-wrapper {
  background: #f5f5f5;
  padding: 30px;
  border-radius: 50%;
  color: #bdbdbd;
}

.border-top {
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  border-radius: 12px;
  padding: 0 20px;
  font-weight: 600;
}

.px-lg {
  padding-left: 24px;
  padding-right: 24px;
}
</style>

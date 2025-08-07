<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-purple-1">
      <div class="row items-center">
        <q-icon name="local_hospital" color="purple" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Hospitalización</div>
          <div class="text-caption text-grey-7">
            {{ datosHospitalizacion.estado === 'activa' ? 'Paciente hospitalizado' : 'Registro de hospitalización' }}
          </div>
        </div>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
          :disable="modoLectura"
        >
          <q-list>
            <q-item 
              clickable 
              @click="iniciarHospitalizacion" 
              v-if="datosHospitalizacion.estado === 'pendiente'"
              :disable="!formularioValido"
            >
              <q-item-section avatar>
                <q-icon name="play_arrow" color="positive"/>
              </q-item-section>
              <q-item-section>Iniciar Hospitalización</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              @click="darDeAlta" 
              v-if="datosHospitalizacion.estado === 'activa'"
            >
              <q-item-section avatar>
                <q-icon name="exit_to_app" color="primary"/>
              </q-item-section>
              <q-item-section>Dar de Alta</q-item-section>
            </q-item>
            
            <q-item clickable @click="agregarEvento" v-if="datosHospitalizacion.estado === 'activa'">
              <q-item-section avatar>
                <q-icon name="add_circle" color="blue"/>
              </q-item-section>
              <q-item-section>Agregar Evento</q-item-section>
            </q-item>
            
            <q-item clickable @click="eliminarServicio">
              <q-item-section avatar>
                <q-icon name="delete" color="negative"/>
              </q-item-section>
              <q-item-section>Eliminar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>
    
    <q-card-section>
      <!-- Información básica de la hospitalización -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="text-subtitle2 q-mb-md">Información de Ingreso</div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosHospitalizacion.motivoIngreso"
            label="Motivo de Ingreso *"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura || datosHospitalizacion.estado === 'activa'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosHospitalizacion.tipoHospitalizacion"
            :options="tiposHospitalizacion"
            label="Tipo de Hospitalización *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosHospitalizacion.estado === 'activa'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosHospitalizacion.fechaIngresoEstimada"
            label="Fecha Ingreso Estimada"
            outlined
            type="datetime-local"
            :readonly="modoLectura || datosHospitalizacion.estado === 'activa'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosHospitalizacion.tiempoEstimado"
            label="Tiempo Estimado (días)"
            outlined
            type="number"
            min="1"
            step="1"
            :readonly="modoLectura || datosHospitalizacion.estado === 'activa'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosHospitalizacion.prioridad"
            :options="prioridades"
            label="Prioridad"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosHospitalizacion.estado === 'activa'"
          />
        </div>
      </div>

      <!-- Estado actual (solo si está activa) -->
      <div v-if="datosHospitalizacion.estado === 'activa'" class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Estado Actual</div>
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosHospitalizacion.fechaIngresoReal"
            label="Fecha Ingreso Real"
            outlined
            type="datetime-local"
            readonly
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            :model-value="tiempoHospitalizado"
            label="Tiempo Hospitalizado"
            outlined
            readonly
            suffix="días"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosHospitalizacion.estadoActual"
            :options="estadosHospitalizacion"
            label="Estado del Paciente"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
      </div>

      <!-- Plan de tratamiento -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Plan de Tratamiento</div>
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosHospitalizacion.planTratamiento"
            label="Plan de Tratamiento"
            outlined
            type="textarea"
            rows="3"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosHospitalizacion.medicamentos"
            label="Medicamentos y Dosificación"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosHospitalizacion.cuidadosEspeciales"
            label="Cuidados Especiales"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
          />
        </div>
      </div>

      <!-- Eventos de hospitalización -->
      <div v-if="datosHospitalizacion.eventos.length > 0 || datosHospitalizacion.estado === 'activa'" 
           class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="event_note" class="q-mr-sm"/>
            Eventos de Hospitalización
          </div>
        </div>
        
        <div class="col-12">
          <q-timeline color="primary" layout="comfortable">
            <q-timeline-entry
              v-for="(evento, index) in datosHospitalizacion.eventos"
              :key="index"
              :color="getEventColor(evento.tipo)"
              :icon="getEventIcon(evento.tipo)"
              :title="evento.titulo"
              :subtitle="formatDateTime(evento.fecha)"
            >
              <div class="text-body2">{{ evento.descripcion }}</div>
              <div v-if="evento.observaciones" class="text-caption text-grey-6">
                {{ evento.observaciones }}
              </div>
              <q-btn
                v-if="!modoLectura && evento.editable"
                flat
                dense
                icon="edit"
                size="sm"
                @click="editarEvento(index)"
                class="q-mt-sm"
              />
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>

      <!-- Información de alta (solo si está completada) -->
      <div v-if="datosHospitalizacion.estado === 'completada'" class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="exit_to_app" class="q-mr-sm"/>
            Información de Alta
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosHospitalizacion.fechaAlta"
            label="Fecha de Alta"
            outlined
            type="datetime-local"
            readonly
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosHospitalizacion.tipoAlta"
            :options="tiposAlta"
            label="Tipo de Alta"
            outlined
            option-label="label"
            option-value="value"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosHospitalizacion.resumenAlta"
            label="Resumen de Alta"
            outlined
            type="textarea"
            rows="3"
            readonly
          />
        </div>
      </div>

      <!-- Observaciones generales -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Observaciones</div>
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosHospitalizacion.observaciones"
            label="Observaciones Generales"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
          />
        </div>
      </div>
    </q-card-section>
    
    <!-- Estado y acciones -->
    <q-card-section class="bg-grey-1">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-chip 
            :color="getEstadoColor()"
            text-color="white"
            :icon="getEstadoIcon()"
            :label="getEstadoLabel()"
          />
        </div>
        
        <div class="col-auto" v-if="!modoLectura">
          <q-btn
            v-if="datosHospitalizacion.estado === 'pendiente'"
            color="positive"
            icon="play_arrow"
            label="Iniciar Hospitalización"
            @click="iniciarHospitalizacion"
            :disable="!formularioValido"
          />
          <q-btn
            v-else-if="datosHospitalizacion.estado === 'activa'"
            color="primary"
            icon="exit_to_app"
            label="Dar de Alta"
            @click="darDeAlta"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Modal para agregar evento -->
    <q-dialog v-model="mostrarModalEvento" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ eventoEditando !== null ? 'Editar Evento' : 'Agregar Evento' }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="eventoTemporal.tipo"
                :options="tiposEvento"
                label="Tipo de Evento"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="eventoTemporal.titulo"
                label="Título del Evento"
                outlined
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="eventoTemporal.descripcion"
                label="Descripción"
                outlined
                type="textarea"
                rows="3"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="eventoTemporal.observaciones"
                label="Observaciones"
                outlined
                type="textarea"
                rows="2"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="eventoTemporal.fecha"
                label="Fecha y Hora"
                outlined
                type="datetime-local"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarEvento"/>
          <q-btn color="primary" label="Guardar" @click="guardarEvento"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para dar de alta -->
    <q-dialog v-model="mostrarModalAlta" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Dar de Alta al Paciente</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="altaTemporal.tipo"
                :options="tiposAlta"
                label="Tipo de Alta"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="altaTemporal.resumen"
                label="Resumen de Alta"
                outlined
                type="textarea"
                rows="4"
                placeholder="Describa el estado del paciente, tratamientos realizados, recomendaciones..."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="altaTemporal.recomendaciones"
                label="Recomendaciones Post-Alta"
                outlined
                type="textarea"
                rows="3"
                placeholder="Cuidados en casa, medicamentos, próximas citas..."
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarAlta"/>
          <q-btn color="primary" label="Confirmar Alta" @click="confirmarAlta"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  atencionId: {
    type: String,
    required: true
  },
  servicioId: {
    type: String,
    required: true
  },
  modoLectura: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado'])

// Estados del formulario
const datosHospitalizacion = ref({
  estado: 'pendiente', // pendiente, activa, completada
  motivoIngreso: '',
  tipoHospitalizacion: '',
  fechaIngresoEstimada: '',
  fechaIngresoReal: '',
  tiempoEstimado: '',
  prioridad: 'media',
  estadoActual: 'estable',
  planTratamiento: '',
  medicamentos: '',
  cuidadosEspeciales: '',
  eventos: [],
  fechaAlta: '',
  tipoAlta: '',
  resumenAlta: '',
  recomendacionesAlta: '',
  observaciones: ''
})

// Estados para modales
const mostrarModalEvento = ref(false)
const mostrarModalAlta = ref(false)
const eventoEditando = ref(null)

const eventoTemporal = ref({
  tipo: '',
  titulo: '',
  descripcion: '',
  observaciones: '',
  fecha: new Date().toISOString().slice(0, 16),
  editable: true
})

const altaTemporal = ref({
  tipo: 'medica',
  resumen: '',
  recomendaciones: ''
})

// Opciones para selects
const tiposHospitalizacion = [
  { label: 'Cirugía Programada', value: 'cirugia_programada' },
  { label: 'Observación Post-Quirúrgica', value: 'post_quirurgica' },
  { label: 'Tratamiento Médico', value: 'tratamiento_medico' },
  { label: 'Emergencia', value: 'emergencia' },
  { label: 'Aislamiento', value: 'aislamiento' },
  { label: 'Cuidados Intensivos', value: 'cuidados_intensivos' }
]

const prioridades = [
  { label: 'Alta', value: 'alta' },
  { label: 'Media', value: 'media' },
  { label: 'Baja', value: 'baja' }
]

const estadosHospitalizacion = [
  { label: 'Estable', value: 'estable' },
  { label: 'Crítico', value: 'critico' },
  { label: 'Mejorando', value: 'mejorando' },
  { label: 'Empeorando', value: 'empeorando' },
  { label: 'En Observación', value: 'observacion' }
]

const tiposEvento = [
  { label: 'Administración de Medicamento', value: 'medicamento' },
  { label: 'Cambio de Estado', value: 'cambio_estado' },
  { label: 'Procedimiento', value: 'procedimiento' },
  { label: 'Evaluación Veterinaria', value: 'evaluacion' },
  { label: 'Alimentación', value: 'alimentacion' },
  { label: 'Ejercicio/Paseo', value: 'ejercicio' },
  { label: 'Complicación', value: 'complicacion' },
  { label: 'Mejoría', value: 'mejoria' },
  { label: 'Nota General', value: 'nota' }
]

const tiposAlta = [
  { label: 'Alta Médica', value: 'medica' },
  { label: 'Alta Voluntaria', value: 'voluntaria' },
  { label: 'Traslado', value: 'traslado' },
  { label: 'Defunción', value: 'defuncion' }
]

// Computed properties
const formularioValido = computed(() => {
  return datosHospitalizacion.value.motivoIngreso && 
         datosHospitalizacion.value.tipoHospitalizacion
})

const tiempoHospitalizado = computed(() => {
  if (!datosHospitalizacion.value.fechaIngresoReal) return '0'
  
  const ingreso = new Date(datosHospitalizacion.value.fechaIngresoReal)
  const ahora = new Date()
  const diffTime = Math.abs(ahora - ingreso)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays.toString()
})

// Métodos para el estado
const getEstadoColor = () => {
  switch(datosHospitalizacion.value.estado) {
    case 'pendiente': return 'orange'
    case 'activa': return 'green'
    case 'completada': return 'blue'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(datosHospitalizacion.value.estado) {
    case 'pendiente': return 'schedule'
    case 'activa': return 'local_hospital'
    case 'completada': return 'check_circle'
    default: return 'help'
  }
}

const getEstadoLabel = () => {
  switch(datosHospitalizacion.value.estado) {
    case 'pendiente': return 'Pendiente de Ingreso'
    case 'activa': return 'Hospitalizado'
    case 'completada': return 'Hospitalización Completada'
    default: return 'Estado Desconocido'
  }
}

// Métodos para eventos
const getEventColor = (tipo) => {
  const colores = {
    medicamento: 'blue',
    cambio_estado: 'orange',
    procedimiento: 'purple',
    evaluacion: 'green',
    alimentacion: 'brown',
    ejercicio: 'indigo',
    complicacion: 'red',
    mejoria: 'positive',
    nota: 'grey'
  }
  return colores[tipo] || 'grey'
}

const getEventIcon = (tipo) => {
  const iconos = {
    medicamento: 'medication',
    cambio_estado: 'swap_vert',
    procedimiento: 'medical_services',
    evaluacion: 'assignment',
    alimentacion: 'restaurant',
    ejercicio: 'pets',
    complicacion: 'warning',
    mejoria: 'trending_up',
    nota: 'note'
  }
  return iconos[tipo] || 'event'
}

const formatDateTime = (fechaISO) => {
  if (!fechaISO) return ''
  const fecha = new Date(fechaISO)
  return fecha.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos de acción
const iniciarHospitalizacion = () => {
  if (formularioValido.value) {
    datosHospitalizacion.value.estado = 'activa'
    datosHospitalizacion.value.fechaIngresoReal = new Date().toISOString()
    
    // Agregar evento de ingreso
    datosHospitalizacion.value.eventos.push({
      tipo: 'nota',
      titulo: 'Inicio de Hospitalización',
      descripcion: datosHospitalizacion.value.motivoIngreso,
      observaciones: '',
      fecha: datosHospitalizacion.value.fechaIngresoReal,
      editable: false
    })
    
    guardarDatos()
  }
}

const agregarEvento = () => {
  eventoTemporal.value = {
    tipo: '',
    titulo: '',
    descripcion: '',
    observaciones: '',
    fecha: new Date().toISOString().slice(0, 16),
    editable: true
  }
  eventoEditando.value = null
  mostrarModalEvento.value = true
}

const editarEvento = (index) => {
  eventoEditando.value = index
  eventoTemporal.value = { ...datosHospitalizacion.value.eventos[index] }
  mostrarModalEvento.value = true
}

const guardarEvento = () => {
  if (eventoEditando.value !== null) {
    datosHospitalizacion.value.eventos[eventoEditando.value] = { ...eventoTemporal.value }
  } else {
    datosHospitalizacion.value.eventos.push({ ...eventoTemporal.value })
  }
  
  // Ordenar eventos por fecha (más reciente primero)
  datosHospitalizacion.value.eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  
  mostrarModalEvento.value = false
  guardarDatos()
}

const cancelarEvento = () => {
  mostrarModalEvento.value = false
  eventoEditando.value = null
}

const darDeAlta = () => {
  altaTemporal.value = {
    tipo: 'medica',
    resumen: '',
    recomendaciones: ''
  }
  mostrarModalAlta.value = true
}

const confirmarAlta = () => {
  datosHospitalizacion.value.estado = 'completada'
  datosHospitalizacion.value.fechaAlta = new Date().toISOString()
  datosHospitalizacion.value.tipoAlta = altaTemporal.value.tipo
  datosHospitalizacion.value.resumenAlta = altaTemporal.value.resumen
  datosHospitalizacion.value.recomendacionesAlta = altaTemporal.value.recomendaciones
  
  // Agregar evento de alta
  datosHospitalizacion.value.eventos.unshift({
    tipo: 'mejoria',
    titulo: 'Alta Médica',
    descripcion: altaTemporal.value.resumen,
    observaciones: altaTemporal.value.recomendaciones,
    fecha: datosHospitalizacion.value.fechaAlta,
    editable: false
  })
  
  mostrarModalAlta.value = false
  
  emit('servicio-completado', props.servicioId, {
    ...datosHospitalizacion.value,
    completadaPor: 'Dr. Usuario Actual' // Obtener del contexto
  })
}

const cancelarAlta = () => {
  mostrarModalAlta.value = false
}

const guardarDatos = () => {
  emit('servicio-actualizada', props.servicioId, datosHospitalizacion.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Watchers
watch(datosHospitalizacion, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>
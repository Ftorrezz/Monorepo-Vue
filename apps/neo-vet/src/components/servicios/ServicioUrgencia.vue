<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-red-1">
      <div class="row items-center">
        <q-icon name="emergency" color="red" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Urgencia Veterinaria</div>
          <div class="text-caption text-grey-7">
            {{ datosUrgencia.estado === 'atendiendo' ? 'En atención de urgencia' : 
               datosUrgencia.estado === 'completada' ? 'Urgencia resuelta' : 'Urgencia pendiente' }}
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
              @click="iniciarAtencion" 
              v-if="datosUrgencia.estado === 'pendiente'"
              :disable="!formularioValido"
            >
              <q-item-section avatar>
                <q-icon name="play_arrow" color="positive"/>
              </q-item-section>
              <q-item-section>Iniciar Atención</q-item-section>
            </q-item>
            
            <q-item 
              clickable 
              @click="finalizarAtencion" 
              v-if="datosUrgencia.estado === 'atendiendo'"
            >
              <q-item-section avatar>
                <q-icon name="check_circle" color="primary"/>
              </q-item-section>
              <q-item-section>Finalizar Atención</q-item-section>
            </q-item>
            
            <q-item clickable @click="agregarProcedimiento" v-if="datosUrgencia.estado === 'atendiendo'">
              <q-item-section avatar>
                <q-icon name="add_circle" color="blue"/>
              </q-item-section>
              <q-item-section>Agregar Procedimiento</q-item-section>
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
      <!-- Información de la urgencia -->
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="warning" color="red" class="q-mr-sm"/>
            Información de la Urgencia
          </div>
        </div>
        
        <div class="col-12 col-md-8">
          <q-input
            v-model="datosUrgencia.descripcionUrgencia"
            label="Descripción de la Urgencia *"
            outlined
            type="textarea"
            rows="3"
            :readonly="modoLectura || datosUrgencia.estado === 'completada'"
            placeholder="Describa los síntomas, comportamiento o situación que requiere atención urgente..."
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosUrgencia.nivelUrgencia"
            :options="nivelesUrgencia"
            label="Nivel de Urgencia *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosUrgencia.estado === 'completada'"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" :color="scope.opt.color"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.descripcion }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosUrgencia.fechaInicio"
            label="Fecha y Hora de Llegada"
            outlined
            type="datetime-local"
            :readonly="modoLectura || datosUrgencia.estado !== 'pendiente'"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosUrgencia.tipoUrgencia"
            :options="tiposUrgencia"
            label="Tipo de Urgencia"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura || datosUrgencia.estado === 'completada'"
          />
        </div>
      </div>

      <!-- Signos vitales y estado inicial -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="monitor_heart" color="primary" class="q-mr-sm"/>
            Signos Vitales y Estado Inicial
          </div>
        </div>
        
        <div class="col-6 col-md-3">
          <q-input
            v-model="datosUrgencia.signosVitales.temperatura"
            label="Temperatura (°C)"
            outlined
            type="number"
            step="0.1"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-6 col-md-3">
          <q-input
            v-model="datosUrgencia.signosVitales.pulso"
            label="Pulso (lpm)"
            outlined
            type="number"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-6 col-md-3">
          <q-input
            v-model="datosUrgencia.signosVitales.respiracion"
            label="Respiración (rpm)"
            outlined
            type="number"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-6 col-md-3">
          <q-select
            v-model="datosUrgencia.signosVitales.estadoConciencia"
            :options="estadosConciencia"
            label="Estado de Conciencia"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosUrgencia.examenFisico"
            label="Examen Físico Inicial"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
            placeholder="Observaciones del examen físico inicial..."
          />
        </div>
      </div>

      <!-- Información de atención (solo si está en curso o completada) -->
      <div v-if="datosUrgencia.estado !== 'pendiente'" class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="medical_services" color="green" class="q-mr-sm"/>
            Atención Médica
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosUrgencia.fechaInicioAtencion"
            label="Inicio de Atención"
            outlined
            type="datetime-local"
            readonly
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            :model-value="tiempoAtencion"
            label="Tiempo de Atención"
            outlined
            readonly
            suffix="minutos"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosUrgencia.diagnosticoInicial"
            label="Diagnóstico Inicial"
            outlined
            type="textarea"
            rows="2"
            :readonly="modoLectura"
            placeholder="Diagnóstico preliminar basado en los síntomas y examen..."
          />
        </div>
      </div>

      <!-- Procedimientos realizados -->
      <div v-if="datosUrgencia.procedimientos.length > 0 || datosUrgencia.estado === 'atendiendo'" 
           class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="healing" class="q-mr-sm"/>
            Procedimientos y Tratamientos
          </div>
        </div>
        
        <div class="col-12">
          <q-timeline color="primary" layout="comfortable">
            <q-timeline-entry
              v-for="(procedimiento, index) in datosUrgencia.procedimientos"
              :key="index"
              :color="getProcedimientoColor(procedimiento.tipo)"
              :icon="getProcedimientoIcon(procedimiento.tipo)"
              :title="procedimiento.nombre"
              :subtitle="formatDateTime(procedimiento.fecha)"
            >
              <div class="text-body2">{{ procedimiento.descripcion }}</div>
              <div v-if="procedimiento.medicamentos" class="text-caption text-blue-6 q-mt-xs">
                <q-icon name="medication" size="xs" class="q-mr-xs"/>
                {{ procedimiento.medicamentos }}
              </div>
              <div v-if="procedimiento.observaciones" class="text-caption text-grey-6 q-mt-xs">
                {{ procedimiento.observaciones }}
              </div>
              <q-btn
                v-if="!modoLectura && procedimiento.editable && datosUrgencia.estado === 'atendiendo'"
                flat
                dense
                icon="edit"
                size="sm"
                @click="editarProcedimiento(index)"
                class="q-mt-sm"
              />
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>

      <!-- Información de finalización (solo si está completada) -->
      <div v-if="datosUrgencia.estado === 'completada'" class="row q-col-gutter-md q-mt-md">
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">
            <q-icon name="check_circle" color="positive" class="q-mr-sm"/>
            Resolución de la Urgencia
          </div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosUrgencia.fechaFinalizacion"
            label="Fecha de Finalización"
            outlined
            type="datetime-local"
            readonly
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosUrgencia.resultadoAtencion"
            :options="resultadosAtencion"
            label="Resultado de la Atención"
            outlined
            option-label="label"
            option-value="value"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosUrgencia.diagnosticoFinal"
            label="Diagnóstico Final"
            outlined
            type="textarea"
            rows="2"
            readonly
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosUrgencia.tratamientoRecomendado"
            label="Tratamiento y Recomendaciones"
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
            v-model="datosUrgencia.observacionesGenerales"
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
          <q-chip 
            v-if="datosUrgencia.nivelUrgencia"
            :color="getNivelUrgenciaColor()"
            text-color="white"
            :icon="getNivelUrgenciaIcon()"
            :label="getNivelUrgenciaLabel()"
            class="q-ml-sm"
          />
        </div>
        
        <div class="col-auto" v-if="!modoLectura">
          <q-btn
            v-if="datosUrgencia.estado === 'pendiente'"
            color="positive"
            icon="play_arrow"
            label="Iniciar Atención"
            @click="iniciarAtencion"
            :disable="!formularioValido"
          />
          <q-btn
            v-else-if="datosUrgencia.estado === 'atendiendo'"
            color="primary"
            icon="check_circle"
            label="Finalizar Atención"
            @click="finalizarAtencion"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Modal para agregar procedimiento -->
    <q-dialog v-model="mostrarModalProcedimiento" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">
            {{ procedimientoEditando !== null ? 'Editar Procedimiento' : 'Agregar Procedimiento' }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="procedimientoTemporal.tipo"
                :options="tiposProcedimiento"
                label="Tipo de Procedimiento"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="procedimientoTemporal.fecha"
                label="Fecha y Hora"
                outlined
                type="datetime-local"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="procedimientoTemporal.nombre"
                label="Nombre del Procedimiento"
                outlined
                placeholder="Ej: Aplicación de suero, Radiografía, etc."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="procedimientoTemporal.descripcion"
                label="Descripción"
                outlined
                type="textarea"
                rows="3"
                placeholder="Detalles del procedimiento realizado..."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="procedimientoTemporal.medicamentos"
                label="Medicamentos Administrados"
                outlined
                placeholder="Nombre, dosis y vía de administración..."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="procedimientoTemporal.observaciones"
                label="Observaciones"
                outlined
                type="textarea"
                rows="2"
                placeholder="Reacciones, efectos observados..."
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarProcedimiento"/>
          <q-btn color="primary" label="Guardar" @click="guardarProcedimiento"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para finalizar atención -->
    <q-dialog v-model="mostrarModalFinalizacion" persistent>
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">Finalizar Atención de Urgencia</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="finalizacionTemporal.resultado"
                :options="resultadosAtencion"
                label="Resultado de la Atención"
                outlined
                option-label="label"
                option-value="value"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="finalizacionTemporal.diagnosticoFinal"
                label="Diagnóstico Final"
                outlined
                type="textarea"
                rows="3"
                placeholder="Diagnóstico definitivo tras la atención..."
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="finalizacionTemporal.tratamiento"
                label="Tratamiento y Recomendaciones"
                outlined
                type="textarea"
                rows="4"
                placeholder="Medicamentos, cuidados, próximas citas, recomendaciones para el propietario..."
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarFinalizacion"/>
          <q-btn color="primary" label="Finalizar Atención" @click="confirmarFinalizacion"/>
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
const datosUrgencia = ref({
  estado: 'pendiente', // pendiente, atendiendo, completada
  descripcionUrgencia: '',
  nivelUrgencia: '',
  tipoUrgencia: '',
  fechaInicio: '',
  fechaInicioAtencion: '',
  fechaFinalizacion: '',
  signosVitales: {
    temperatura: '',
    pulso: '',
    respiracion: '',
    estadoConciencia: 'alerta'
  },
  examenFisico: '',
  diagnosticoInicial: '',
  diagnosticoFinal: '',
  procedimientos: [],
  resultadoAtencion: '',
  tratamientoRecomendado: '',
  observacionesGenerales: ''
})

// Estados para modales
const mostrarModalProcedimiento = ref(false)
const mostrarModalFinalizacion = ref(false)
const procedimientoEditando = ref(null)

const procedimientoTemporal = ref({
  tipo: '',
  nombre: '',
  descripcion: '',
  medicamentos: '',
  observaciones: '',
  fecha: new Date().toISOString().slice(0, 16),
  editable: true
})

const finalizacionTemporal = ref({
  resultado: 'estabilizado',
  diagnosticoFinal: '',
  tratamiento: ''
})

// Opciones para selects
const nivelesUrgencia = [
  { 
    label: 'Crítica', 
    value: 'critica', 
    color: 'red', 
    icon: 'priority_high',
    descripcion: 'Riesgo inminente de vida'
  },
  { 
    label: 'Alta', 
    value: 'alta', 
    color: 'orange', 
    icon: 'warning',
    descripcion: 'Requiere atención inmediata'
  },
  { 
    label: 'Media', 
    value: 'media', 
    color: 'amber', 
    icon: 'info',
    descripcion: 'Atención en las próximas horas'
  },
  { 
    label: 'Baja', 
    value: 'baja', 
    color: 'green', 
    icon: 'check_circle',
    descripcion: 'No es urgente, evaluación rutinaria'
  }
]

const tiposUrgencia = [
  { label: 'Traumatismo', value: 'traumatismo' },
  { label: 'Intoxicación', value: 'intoxicacion' },
  { label: 'Dificultad Respiratoria', value: 'respiratoria' },
  { label: 'Problemas Digestivos', value: 'digestivos' },
  { label: 'Problemas Neurológicos', value: 'neurologicos' },
  { label: 'Shock/Colapso', value: 'shock' },
  { label: 'Hemorragia', value: 'hemorragia' },
  { label: 'Convulsiones', value: 'convulsiones' },
  { label: 'Parto Complicado', value: 'parto' },
  { label: 'Otras', value: 'otras' }
]

const estadosConciencia = [
  { label: 'Alerta', value: 'alerta' },
  { label: 'Deprimido', value: 'deprimido' },
  { label: 'Letárgico', value: 'letargico' },
  { label: 'Estuporoso', value: 'estuporoso' },
  { label: 'Comatoso', value: 'comatoso' }
]

const tiposProcedimiento = [
  { label: 'Administración de Medicamento', value: 'medicamento' },
  { label: 'Fluidoterapia', value: 'fluidoterapia' },
  { label: 'Oxigenoterapia', value: 'oxigenoterapia' },
  { label: 'Radiografía', value: 'radiografia' },
  { label: 'Ultrasonido', value: 'ultrasonido' },
  { label: 'Análisis de Sangre', value: 'analisis_sangre' },
  { label: 'Cirugía de Urgencia', value: 'cirugia' },
  { label: 'Sutura', value: 'sutura' },
  { label: 'Lavado Gástrico', value: 'lavado_gastrico' },
  { label: 'Estabilización', value: 'estabilizacion' },
  { label: 'Monitoreo', value: 'monitoreo' },
  { label: 'Otros', value: 'otros' }
]

const resultadosAtencion = [
  { label: 'Estabilizado - Alta', value: 'estabilizado' },
  { label: 'Requiere Hospitalización', value: 'hospitalizacion' },
  { label: 'Derivado a Especialista', value: 'derivado' },
  { label: 'Tratamiento Ambulatorio', value: 'ambulatorio' },
  { label: 'No Respondió al Tratamiento', value: 'no_respuesta' },
  { label: 'Defunción', value: 'defuncion' }
]

// Computed properties
const formularioValido = computed(() => {
  return datosUrgencia.value.descripcionUrgencia && 
         datosUrgencia.value.nivelUrgencia
})

const tiempoAtencion = computed(() => {
  if (!datosUrgencia.value.fechaInicioAtencion) return '0'
  
  const inicio = new Date(datosUrgencia.value.fechaInicioAtencion)
  const fin = datosUrgencia.value.fechaFinalizacion ? 
              new Date(datosUrgencia.value.fechaFinalizacion) : 
              new Date()
  
  const diffTime = Math.abs(fin - inicio)
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  
  return diffMinutes.toString()
})

// Métodos para el estado
const getEstadoColor = () => {
  switch(datosUrgencia.value.estado) {
    case 'pendiente': return 'orange'
    case 'atendiendo': return 'red'
    case 'completada': return 'green'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(datosUrgencia.value.estado) {
    case 'pendiente': return 'schedule'
    case 'atendiendo': return 'emergency'
    case 'completada': return 'check_circle'
    default: return 'help'
  }
}

const getEstadoLabel = () => {
  switch(datosUrgencia.value.estado) {
    case 'pendiente': return 'Pendiente'
    case 'atendiendo': return 'En Atención'
    case 'completada': return 'Completada'
    default: return 'Estado Desconocido'
  }
}

const getNivelUrgenciaColor = () => {
  const nivel = nivelesUrgencia.find(n => n.value === datosUrgencia.value.nivelUrgencia)
  return nivel ? nivel.color : 'grey'
}

const getNivelUrgenciaIcon = () => {
  const nivel = nivelesUrgencia.find(n => n.value === datosUrgencia.value.nivelUrgencia)
  return nivel ? nivel.icon : 'help'
}

const getNivelUrgenciaLabel = () => {
  const nivel = nivelesUrgencia.find(n => n.value === datosUrgencia.value.nivelUrgencia)
  return nivel ? `Urgencia ${nivel.label}` : 'Nivel Desconocido'
}

// Métodos para procedimientos
const getProcedimientoColor = (tipo) => {
  const colores = {
    medicamento: 'blue',
    fluidoterapia: 'cyan',
    oxigenoterapia: 'light-blue',
    radiografia: 'purple',
    ultrasonido: 'deep-purple',
    analisis_sangre: 'red',
    cirugia: 'pink',
    sutura: 'green',
    lavado_gastrico: 'orange',
    estabilizacion: 'amber',
    monitoreo: 'brown',
    otros: 'grey'
  }
  return colores[tipo] || 'grey'
}

const getProcedimientoIcon = (tipo) => {
  const iconos = {
    medicamento: 'medication',
    fluidoterapia: 'water_drop',
    oxigenoterapia: 'air',
    radiografia: 'camera',
    ultrasonido: 'graphic_eq',
    analisis_sangre: 'bloodtype',
    cirugia: 'content_cut',
    sutura: 'healing',
    lavado_gastrico: 'clean_hands',
    estabilizacion: 'favorite',
    monitoreo: 'monitor_heart',
    otros: 'medical_services'
  }
  return iconos[tipo] || 'medical_services'
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
const iniciarAtencion = () => {
  if (formularioValido.value) {
    datosUrgencia.value.estado = 'atendiendo'
    datosUrgencia.value.fechaInicioAtencion = new Date().toISOString()
    
    // Agregar procedimiento inicial
    datosUrgencia.value.procedimientos.push({
      tipo: 'estabilizacion',
      nombre: 'Inicio de Atención de Urgencia',
      descripcion: 'Evaluación inicial y estabilización del paciente',
      medicamentos: '',
      observaciones: datosUrgencia.value.descripcionUrgencia,
      fecha: datosUrgencia.value.fechaInicioAtencion,
      editable: false
    })
    
    guardarDatos()
  }
}

const agregarProcedimiento = () => {
  procedimientoTemporal.value = {
    tipo: '',
    nombre: '',
    descripcion: '',
    medicamentos: '',
    observaciones: '',
    fecha: new Date().toISOString().slice(0, 16),
    editable: true
  }
  procedimientoEditando.value = null
  mostrarModalProcedimiento.value = true
}

const editarProcedimiento = (index) => {
  procedimientoEditando.value = index
  procedimientoTemporal.value = { ...datosUrgencia.value.procedimientos[index] }
  mostrarModalProcedimiento.value = true
}

const guardarProcedimiento = () => {
  if (procedimientoEditando.value !== null) {
    datosUrgencia.value.procedimientos[procedimientoEditando.value] = { ...procedimientoTemporal.value }
  } else {
    datosUrgencia.value.procedimientos.push({ ...procedimientoTemporal.value })
  }
  
  // Ordenar procedimientos por fecha (más reciente primero)
  datosUrgencia.value.procedimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  
  mostrarModalProcedimiento.value = false
  guardarDatos()
}

const cancelarProcedimiento = () => {
  mostrarModalProcedimiento.value = false
  procedimientoEditando.value = null
}

const finalizarAtencion = () => {
  finalizacionTemporal.value = {
    resultado: 'estabilizado',
    diagnosticoFinal: '',
    tratamiento: ''
  }
  mostrarModalFinalizacion.value = true
}

const confirmarFinalizacion = () => {
  datosUrgencia.value.estado = 'completada'
  datosUrgencia.value.fechaFinalizacion = new Date().toISOString()
  datosUrgencia.value.resultadoAtencion = finalizacionTemporal.value.resultado
  datosUrgencia.value.diagnosticoFinal = finalizacionTemporal.value.diagnosticoFinal
  datosUrgencia.value.tratamientoRecomendado = finalizacionTemporal.value.tratamiento
  
  // Agregar procedimiento de finalización
  datosUrgencia.value.procedimientos.unshift({
    tipo: 'otros',
    nombre: 'Finalización de Atención',
    descripcion: finalizacionTemporal.value.diagnosticoFinal,
    medicamentos: '',
    observaciones: finalizacionTemporal.value.tratamiento,
    fecha: datosUrgencia.value.fechaFinalizacion,
    editable: false
  })
  
  mostrarModalFinalizacion.value = false
  
  emit('servicio-completado', props.servicioId, {
    ...datosUrgencia.value,
    completadaPor: 'Dr. Usuario Actual' // Obtener del contexto
  })
}

const cancelarFinalizacion = () => {
  mostrarModalFinalizacion.value = false
}

const guardarDatos = () => {
  emit('servicio-actualizado', props.servicioId, datosUrgencia.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Watchers
watch(datosUrgencia, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>
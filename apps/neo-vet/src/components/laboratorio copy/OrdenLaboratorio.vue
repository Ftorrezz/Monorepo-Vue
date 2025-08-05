<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="science" color="blue" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Orden de Laboratorio</div>
          <div class="text-caption text-grey-7">
            Orden #{{ ordenLab.numeroOrden || 'Nueva' }} - 
            {{ ordenLab.estudios?.length || 0 }} estudio(s)
          </div>
        </div>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
          :disable="modoLectura"
        >
          <q-list>
            <q-item clickable @click="generarOrden" :disable="!formularioValido">
              <q-item-section avatar>
                <q-icon name="send" color="positive"/>
              </q-item-section>
              <q-item-section>Generar Orden</q-item-section>
            </q-item>
            <q-item clickable @click="duplicarOrden" :disable="!ordenLab.numeroOrden">
              <q-item-section avatar>
                <q-icon name="content_copy" color="primary"/>
              </q-item-section>
              <q-item-section>Duplicar Orden</q-item-section>
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
      <div class="row q-col-gutter-md">
        <!-- Información básica de la orden -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="ordenLab.numeroOrden"
            label="Número de Orden"
            outlined
            readonly
            prefix="#"
            hint="Se genera automáticamente"
          />
        </div>

        <div class="col-12 col-md-6">
          <q-select
            v-model="ordenLab.laboratorioExterno"
            :options="laboratoriosExternos"
            label="Laboratorio Externo"
            outlined
            option-label="nombre"
            option-value="id"
            :readonly="modoLectura"
            clearable
          >
            <template v-slot:hint>
              Dejar vacío si es laboratorio interno
            </template>
          </q-select>
        </div>

        <div class="col-12 col-md-4">
          <q-select
            v-model="ordenLab.prioridad"
            :options="prioridades"
            label="Prioridad *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>

        <div class="col-12 col-md-4">
          <q-select
            v-model="ordenLab.tipoMuestra"
            :options="tiposMuestra"
            label="Tipo de Muestra *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="ordenLab.fechaRecoleccion"
            label="Fecha de Recolección"
            outlined
            type="datetime-local"
            :readonly="modoLectura"
          />
        </div>

        <!-- Indicaciones especiales -->
        <div class="col-12">
          <q-input
            v-model="ordenLab.indicacionesEspeciales"
            label="Indicaciones Especiales"
            outlined
            type="textarea"
            rows="2"
            placeholder="Ayuno, medicamentos suspendidos, etc."
            :readonly="modoLectura"
          />
        </div>

        <!-- Lista de estudios -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle2">Estudios Solicitados</div>
            <q-btn
              v-if="!modoLectura"
              color="primary"
              icon="add"
              label="Agregar Estudio"
              @click="mostrarDialogoEstudio = true"
              dense
            />
          </div>

          <!-- Lista de estudios agregados -->
          <div v-if="ordenLab.estudios && ordenLab.estudios.length > 0">
            <EstudioLaboratorio
              v-for="estudio in ordenLab.estudios"
              :key="estudio.id"
              :estudio="estudio"
              :modo-lectura="modoLectura"
              @estudio-actualizado="actualizarEstudio"
              @estudio-eliminado="eliminarEstudio"
              class="q-mb-sm"
            />
          </div>

          <div v-else class="text-center q-pa-md text-grey-6">
            <q-icon name="science" size="48px" class="q-mb-sm"/>
            <div>No hay estudios agregados</div>
            <div class="text-caption">Haz clic en "Agregar Estudio" para comenzar</div>
          </div>
        </div>

        <!-- Observaciones generales -->
        <div class="col-12">
          <q-input
            v-model="ordenLab.observaciones"
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
    <q-card-section v-if="!modoLectura" class="bg-grey-1">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-chip 
            :color="getEstadoColor()"
            text-color="white"
            :icon="getEstadoIcon()"
            :label="getEstadoLabel()"
          />
          <q-chip 
            v-if="ordenLab.estudios && ordenLab.estudios.length > 0"
            color="blue"
            text-color="white"
            icon="science"
            :label="`${ordenLab.estudios.length} estudio(s)`"
            class="q-ml-sm"
          />
        </div>

        <div class="col-auto">
          <q-btn
            color="positive"
            icon="send"
            label="Generar Orden"
            @click="generarOrden"
            :disable="!formularioValido"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Diálogo para agregar estudios -->
    <q-dialog v-model="mostrarDialogoEstudio" persistent>
      <SelectorEstudios
        @estudios-seleccionados="agregarEstudios"
        @cancelar="mostrarDialogoEstudio = false"
      />
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import EstudioLaboratorio from './EstudioLaboratorio.vue'
import SelectorEstudios from './SelectorEstudios.vue'

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
const ordenLab = ref({
  numeroOrden: '',
  laboratorioExterno: null,
  prioridad: 'normal',
  tipoMuestra: '',
  fechaRecoleccion: '',
  indicacionesEspeciales: '',
  estudios: [],
  observaciones: '',
  estado: 'borrador', // borrador, generada, en_proceso, completada
  fechaCreacion: new Date().toISOString(),
  creadoPor: 'Usuario Actual'
})

const mostrarDialogoEstudio = ref(false)

// Opciones para selects
const laboratoriosExternos = [
  { id: 'lab1', nombre: 'Laboratorio Central', telefono: '555-0001' },
  { id: 'lab2', nombre: 'BioVet Labs', telefono: '555-0002' },
  { id: 'lab3', nombre: 'VetDiagnostic', telefono: '555-0003' }
]

const prioridades = [
  { label: 'Urgente', value: 'urgente' },
  { label: 'Normal', value: 'normal' },
  { label: 'Rutina', value: 'rutina' }
]

const tiposMuestra = [
  { label: 'Sangre - Suero', value: 'suero' },
  { label: 'Sangre - Plasma', value: 'plasma' },
  { label: 'Sangre - Completa', value: 'sangre_completa' },
  { label: 'Orina', value: 'orina' },
  { label: 'Heces', value: 'heces' },
  { label: 'Biopsia', value: 'biopsia' },
  { label: 'Citología', value: 'citologia' },
  { label: 'Cultivo', value: 'cultivo' },
  { label: 'Otro', value: 'otro' }
]

// Validaciones
const formularioValido = computed(() => {
  return ordenLab.value.prioridad && 
         ordenLab.value.tipoMuestra && 
         ordenLab.value.estudios && 
         ordenLab.value.estudios.length > 0
})

// Métodos para manejo de estudios
const agregarEstudios = (estudiosSeleccionados) => {
  estudiosSeleccionados.forEach(estudio => {
    const nuevoEstudio = {
      id: Date.now() + Math.random(),
      ...estudio,
      estado: 'pendiente',
      fechaAgregado: new Date().toISOString()
    }
    ordenLab.value.estudios.push(nuevoEstudio)
  })
  mostrarDialogoEstudio.value = false
  guardarDatos()
}

const actualizarEstudio = (estudioId, datosActualizados) => {
  const index = ordenLab.value.estudios.findIndex(e => e.id === estudioId)
  if (index !== -1) {
    ordenLab.value.estudios[index] = { ...ordenLab.value.estudios[index], ...datosActualizados }
    guardarDatos()
  }
}

const eliminarEstudio = (estudioId) => {
  ordenLab.value.estudios = ordenLab.value.estudios.filter(e => e.id !== estudioId)
  guardarDatos()
}

// Métodos de estado
const getEstadoColor = () => {
  switch(ordenLab.value.estado) {
    case 'borrador': return 'orange'
    case 'generada': return 'blue'
    case 'en_proceso': return 'purple'
    case 'completada': return 'green'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(ordenLab.value.estado) {
    case 'borrador': return 'edit'
    case 'generada': return 'send'
    case 'en_proceso': return 'hourglass_empty'
    case 'completada': return 'check_circle'
    default: return 'help'
  }
}

const getEstadoLabel = () => {
  switch(ordenLab.value.estado) {
    case 'borrador': return 'Borrador'
    case 'generada': return 'Orden Generada'
    case 'en_proceso': return 'En Proceso'
    case 'completada': return 'Completada'
    default: return 'Sin Estado'
  }
}

// Métodos principales
const generarNumeroOrden = () => {
  const fecha = new Date()
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `LAB${year}${month}${day}${random}`
}

const generarOrden = () => {
  if (formularioValido.value) {
    if (!ordenLab.value.numeroOrden) {
      ordenLab.value.numeroOrden = generarNumeroOrden()
    }
    ordenLab.value.estado = 'generada'
    ordenLab.value.fechaGeneracion = new Date().toISOString()
    
    emit('servicio-completado', props.servicioId, {
      ...ordenLab.value,
      tipo: 'orden_laboratorio'
    })
  }
}

const duplicarOrden = () => {
  const nuevaOrden = {
    ...ordenLab.value,
    numeroOrden: '',
    estado: 'borrador',
    fechaCreacion: new Date().toISOString(),
    fechaGeneracion: null,
    estudios: ordenLab.value.estudios.map(estudio => ({
      ...estudio,
      id: Date.now() + Math.random(),
      estado: 'pendiente',
      resultados: []
    }))
  }
  
  emit('servicio-actualizado', props.servicioId, nuevaOrden)
}

const guardarDatos = () => {
  emit('servicio-actualizado', props.servicioId, ordenLab.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Inicializar fechas por defecto
if (!ordenLab.value.fechaRecoleccion) {
  const ahora = new Date()
  ordenLab.value.fechaRecoleccion = ahora.toISOString().slice(0, 16)
}

// Watchers
watch(ordenLab, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>
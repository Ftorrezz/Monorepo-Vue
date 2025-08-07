<template>
  <q-card class="servicio-card">
    <!-- Header común -->
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
        <div class="estado-orden">
          <q-chip 
            :color="getEstadoColor()"
            text-color="white"
            :icon="getEstadoIcon()"
            :label="getEstadoLabel()"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Tabs para separar el contenido -->
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="orden" label="Datos de Orden" icon="description" />
      <q-tab name="estudios" label="Estudios" icon="science" />
      <q-tab 
        name="resultados" 
        label="Resultados" 
        icon="analytics"
        :disable="!ordenLab.numeroOrden || ordenLab.estado === 'borrador'"
      />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <!-- Panel de Datos de Orden -->
      <q-tab-panel name="orden">
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
      </q-tab-panel>

      <!-- Panel de Estudios -->
      <q-tab-panel name="estudios">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle2">Estudios Solicitados</div>
          
          <!-- Entrada rápida por código -->
          <div class="row items-center q-gutter-sm">
            <q-input
              v-model="codigoEstudio"
              dense
              outlined
              placeholder="Ingrese código de estudio"
              class="codigo-input"
              @keyup.enter="buscarPorCodigo"
            >
              <template v-slot:append>
                <q-icon 
                  name="help" 
                  color="grey-6"
                  class="cursor-pointer"
                  @click="mostrarDialogoEstudio = true"
                >
                  <q-tooltip>
                    ¿No conoce el código? Click aquí para buscar
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
            
            <q-btn
              v-if="!modoLectura && ordenLab.estado === 'borrador'"
              color="primary"
              icon="search"
              label="Buscar Estudio"
              @click="mostrarDialogoEstudio = true"
              dense
            />
          </div>
        </div>

        <!-- Lista de estudios -->
        <div class="estudios-container">
          <div v-if="ordenLab.estudios && ordenLab.estudios.length > 0">
            <transition-group name="list">
              <EstudioLaboratorio
                v-for="estudio in ordenLab.estudios"
                :key="estudio.id"
                :estudio="estudio"
                :modo-lectura="modoLectura || ordenLab.estado !== 'borrador'"
                @estudio-actualizado="actualizarEstudio"
                @estudio-eliminado="eliminarEstudio"
                class="q-mb-sm estudio-item"
              />
            </transition-group>
          </div>

          <div v-else class="text-center q-pa-md text-grey-6">
            <q-icon name="science" size="48px" class="q-mb-sm"/>
            <div>No hay estudios agregados</div>
            <div class="text-caption">
              Ingrese el código del estudio o use el botón de búsqueda
            </div>
          </div>
        </div>

        <!-- Botón para confirmar orden -->
        <div v-if="ordenLab.estado === 'borrador'" class="row justify-end q-mt-md">
          <q-btn
            color="positive"
            icon="check_circle"
            label="Confirmar Orden"
            @click="generarOrden"
            :disable="!formularioValido"
          />
        </div>
      </q-tab-panel>

      <!-- Panel de Resultados -->
      <q-tab-panel name="resultados">
        <ResultadosLaboratorio
          v-if="ordenLab.numeroOrden"
          :orden="ordenLab"
          @resultados-actualizados="actualizarResultados"
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>

  <!-- Diálogo para agregar estudios -->
  <q-dialog v-model="mostrarDialogoEstudio" persistent>
    <SelectorEstudios
      v-model="mostrarDialogoEstudio"
      @estudios-seleccionados="agregarEstudiosDesdeSelector"
      @cancelar="mostrarDialogoEstudio = false"
    />
  </q-dialog>
</template>

<script lang="ts">
// Types for the new functionality
export type EstudioEstado = 'pendiente' | 'cargado' | 'validado'
export type OrdenEstado = 'borrador' | 'generada' | 'pendiente' | 'cargada' | 'validada'

export interface Sector {
  id: string
  nombre: string
  codigo: string
  descripcion?: string
}

export interface Estudio {
  id: number
  codigo: string
  nombre: string
  sectorId: string
  sector: Sector
  estado: EstudioEstado
  tipoMuestra: string      // Preestablecido
  tiempoResultado: string  // Preestablecido
  preparacion: string      // Preestablecido
  precio: number          // Preestablecido
  metodoAnalisis?: string // Preestablecido
  valoresReferencia?: string // Preestablecido
  resultado?: string
  observaciones?: string   // Este sí se puede cargar
  validadoPor?: string
  fechaValidacion?: string
  fechaCarga?: string
  fechaAgregado: string
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import EstudioLaboratorio from './EstudioLaboratorio.vue'
import SelectorEstudios from './SelectorEstudios.vue'
import ResultadosLaboratorio from './ResultadosLaboratorio.vue'
import { useQuasar } from 'quasar'

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
const tab = ref('orden')
const codigoEstudio = ref('')
const { notify } = useQuasar()

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

const sectores = [
  { id: 'HEM', nombre: 'Hematología', codigo: 'HEM', descripcion: 'Estudios hematológicos' },
  { id: 'BQ', nombre: 'Bioquímica', codigo: 'BQ', descripcion: 'Estudios bioquímicos' },
  { id: 'MICRO', nombre: 'Microbiología', codigo: 'MICRO', descripcion: 'Estudios microbiológicos' },
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
      fechaAgregado: new Date().toISOString(),
      sector: sectores.find(s => s.id === estudio.sectorId) || null
    }
    ordenLab.value.estudios.push(nuevoEstudio)
  })
  actualizarEstadoOrden()
  mostrarDialogoEstudio.value = false
  guardarDatos()
}

const agregarEstudiosDesdeSelector = (estudios) => {
  // Verificar duplicados
  const estudiosNuevos = estudios.filter(estudio => 
    !ordenLab.value.estudios.some(e => e.codigo === estudio.codigo)
  ).map(estudio => ({
    ...estudio,
    id: Date.now() + Math.random(),
    estado: 'pendiente', // Aseguramos que se agregue el estado
    fechaAgregado: new Date().toISOString()
  }))

  if (estudiosNuevos.length > 0) {
    ordenLab.value.estudios.push(...estudiosNuevos)
    mostrarDialogoEstudio.value = false
    
    notify({
      type: 'positive',
      message: `Se agregaron ${estudiosNuevos.length} estudios`,
      position: 'top'
    })
  } else {
    notify({
      type: 'warning',
      message: 'Los estudios seleccionados ya están en la orden',
      position: 'top'
    })
  }
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

// Función para buscar por código
const buscarPorCodigo = async () => {
  if (!codigoEstudio.value) return
  
  try {
    // Simulación de búsqueda - Reemplazar con tu lógica real de API
    const estudio = await buscarEstudioPorCodigo(codigoEstudio.value)
    
    if (estudio) {
      // Verificar si ya existe
      if (ordenLab.value.estudios.some(e => e.codigo === estudio.codigo)) {
        notify({
          type: 'warning',
          message: 'Este estudio ya está en la lista',
          position: 'top'
        })
        return
      }

      // Agregar el estudio
      agregarEstudios([{
        id: Date.now(),
        ...estudio,
        estado: 'pendiente'
      }])

      // Limpiar el input
      codigoEstudio.value = ''
      
      notify({
        type: 'positive',
        message: 'Estudio agregado correctamente',
        position: 'top'
      })
    } else {
      notify({
        type: 'negative',
        message: 'Código no encontrado',
        position: 'top',
        actions: [{
          label: 'Buscar',
          color: 'white',
          handler: () => {
            mostrarDialogoEstudio.value = true
          }
        }]
      })
    }
  } catch (error) {
    console.error('Error al buscar estudio:', error)
    notify({
      type: 'negative',
      message: 'Error al buscar el estudio',
      position: 'top'
    })
  }
}

// Simulación de datos preestablecidos - Reemplazar con tu API real
const buscarEstudioPorCodigo = async (codigo) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Simulación de datos preestablecidos
  const estudiosDisponibles = {
    'HEM001': { 
      codigo: 'HEM001', 
      nombre: 'Hemograma Completo',
      sectorId: 'HEM',
      tipoMuestra: 'sangre_completa',
      tiempoResultado: '24h',
      preparacion: 'Ayuno de 8 horas',
      precio: 150,
      metodoAnalisis: 'Analizador automático',
      valoresReferencia: 'Ver tabla adjunta',
      sector: sectores.find(s => s.id === 'HEM')
    },
    'BQ001': {
      codigo: 'BQ001',
      nombre: 'Perfil Bioquímico',
      sectorId: 'BQ',
      tipoMuestra: 'suero',
      tiempoResultado: '48h',
      preparacion: 'Ayuno de 12 horas',
      precio: 200,
      metodoAnalisis: 'Espectrofotometría',
      valoresReferencia: 'Ver tabla adjunta',
      sector: sectores.find(s => s.id === 'BQ')
    }
    // ... más estudios preestablecidos
  }
  
  return estudiosDisponibles[codigo.toUpperCase()]
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
  if (!formularioValido.value) {
    notify({
      type: 'warning',
      message: 'Complete todos los campos requeridos',
      position: 'top'
    })
    return
  }

  ordenLab.value.estado = 'generada'
  ordenLab.value.numeroOrden = `LAB${Date.now()}`
  ordenLab.value.fechaGeneracion = new Date().toISOString()
  
  guardarDatos()
  
  notify({
    type: 'positive',
    message: 'Orden generada correctamente',
    position: 'top'
  })
  
  // Cambiar a la pestaña de resultados
  tab.value = 'resultados'
}

const confirmarOrden = () => {
  if (formularioValido.value) {
    mostrarDialogoConfirmacion.value = true
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

// Método para actualizar resultados
const actualizarResultados = (resultados) => {
  ordenLab.value.estudios = ordenLab.value.estudios.map(estudio => {
    const resultadoActualizado = resultados.find(r => r.estudioId === estudio.id)
    if (resultadoActualizado) {
      return {
        ...estudio,
        resultado: resultadoActualizado.resultado,
        estado: 'cargado',
        fechaCarga: new Date().toISOString()
      }
    }
    return estudio
  })
  
  actualizarEstadoOrden()
  guardarDatos()
}

// Métodos para manejo de estados
const actualizarEstadoEstudio = (estudioId, nuevoEstado) => {
  const estudio = ordenLab.value.estudios.find(e => e.id === estudioId)
  if (!estudio) return

  switch (nuevoEstado) {
    case 'cargado':
      estudio.estado = 'cargado'
      estudio.fechaCarga = new Date().toISOString()
      break
    case 'validado':
      estudio.estado = 'validado'
      estudio.fechaValidacion = new Date().toISOString()
      estudio.validadoPor = 'Usuario Actual' // Reemplazar con el usuario actual
      break
    case 'pendiente':
      estudio.estado = 'pendiente'
      estudio.fechaValidacion = null
      estudio.validadoPor = null
      break
  }
  
  actualizarEstadoOrden()
  guardarDatos()
}

const actualizarEstadoOrden = () => {
  const estudios = ordenLab.value.estudios
  if (!estudios.length) {
    ordenLab.value.estado = 'borrador'
    return
  }

  const todosValidados = estudios.every(e => e.estado === 'validado')
  const algunoCargado = estudios.some(e => e.estado === 'cargado' || e.estado === 'validado')

  if (todosValidados) {
    ordenLab.value.estado = 'validada'
  } else if (algunoCargado) {
    ordenLab.value.estado = 'cargada'
  } else {
    ordenLab.value.estado = 'pendiente'
  }
}

// Inicializar fechas por defecto
if (!ordenLab.value.fechaRecoleccion) {
  const ahora = new Date()
  ordenLab.value.fechaRecoleccion = ahora.toISOString().slice(0, 16)
}

// Watchers
watch(ordenLab, guardarDatos, { deep: true })

// Add to your setup script in ResultadosLaboratorio
const sectoresConEstudios = computed(() => {
  const sectoresUsados = new Set(orden.value.estudios.map(e => e.sectorId))
  return sectores.filter(s => sectoresUsados.has(s.id))
})

const estudiosPorSector = computed(() => {
  return orden.value.estudios.reduce((acc, estudio) => {
    if (!acc[estudio.sectorId]) {
      acc[estudio.sectorId] = []
    }
    acc[estudio.sectorId].push(estudio)
    return acc
  }, {})
})

const hayEstudiosParaValidar = computed(() => 
  estudiosSeleccionados.value.some(id => {
    const estudio = orden.value.estudios.find(e => e.id === id)
    return estudio && estudio.estado === 'cargado'
  })
)

const hayEstudiosValidados = computed(() => 
  estudiosSeleccionados.value.some(id => {
    const estudio = orden.value.estudios.find(e => e.id === id)
    return estudio && estudio.estado === 'validado'
  })
)
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}

.estado-orden {
  margin-left: auto;
  padding-left: 16px;
}

:deep(.q-tab) {
  padding: 12px 16px;
}

:deep(.q-tab__label) {
  font-size: 14px;
  font-weight: 500;
}

.codigo-input {
  width: 200px;
}

.estudios-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.estudio-item {
  transition: all 0.3s ease;
}

.estudio-item:hover {
  transform: translateX(4px);
}

.estudios-sector {
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 16px;
}

.estudio-card {
  margin-bottom: 8px;
}
</style>
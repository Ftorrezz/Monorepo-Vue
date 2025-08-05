<template>
  <q-expansion-item
    :model-value="expanded"
    @update:model-value="expanded = $event"
    :header-class="getHeaderClass()"
    class="estudio-item"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <q-avatar :color="getEstadoColor()" text-color="white" size="32px">
          <q-icon :name="getEstadoIcon()" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-weight-medium">{{ estudio.nombre }}</q-item-label>
        <q-item-label caption>
          {{ estudio.categoria }} • {{ estudio.pruebas?.length || 0 }} prueba(s)
          <span v-if="estudio.tiempoResultado"> • {{ estudio.tiempoResultado }}</span>
        </q-item-label>
      </q-item-section>

      <q-item-section side>
        <div class="row items-center q-gutter-xs">
          <q-chip
            :color="getEstadoColor()"
            text-color="white"
            :label="getEstadoLabel()"
            dense
          />
          <q-btn
            v-if="!modoLectura"
            flat
            round
            dense
            icon="delete"
            color="negative"
            @click.stop="eliminarEstudio"
          >
            <q-tooltip>Eliminar estudio</q-tooltip>
          </q-btn>
        </div>
      </q-item-section>
    </template>

    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Información del estudio -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="estudioData.codigo"
              label="Código del Estudio"
              outlined
              readonly
              dense
            />
          </div>

          <div class="col-12 col-md-6">
            <q-select
              v-model="estudioData.metodologia"
              :options="metodologias"
              label="Metodología"
              outlined
              dense
              :readonly="modoLectura"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model="estudioData.volumenMuestra"
              label="Volumen de Muestra"
              outlined
              suffix="ml"
              type="number"
              step="0.1"
              dense
              :readonly="modoLectura"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="estudioData.condicionesEspeciales"
              :options="condicionesEspeciales"
              label="Condiciones Especiales"
              outlined
              multiple
              dense
              :readonly="modoLectura"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model="estudioData.costoEstimado"
              label="Costo Estimado"
              outlined
              prefix="$"
              type="number"
              step="0.01"
              dense
              :readonly="modoLectura"
            />
          </div>

          <!-- Lista de pruebas del estudio -->
          <div class="col-12">
            <q-separator class="q-my-md"/>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle2">Pruebas Incluidas</div>
              <q-btn
                v-if="!modoLectura && estudioData.pruebas?.length < (estudio.pruebasDisponibles?.length || 0)"
                color="primary"
                icon="add"
                label="Agregar Prueba"
                @click="mostrarSelectorPruebas = true"
                dense
                size="sm"
              />
            </div>

            <div v-if="estudioData.pruebas && estudioData.pruebas.length > 0" class="q-gutter-sm">
              <PruebaLaboratorio
                v-for="prueba in estudioData.pruebas"
                :key="prueba.id"
                :prueba="prueba"
                :modo-lectura="modoLectura"
                @prueba-actualizada="actualizarPrueba"
                @prueba-eliminada="eliminarPrueba"
                @registrar-resultado="abrirRegistroResultado"
              />
            </div>

            <div v-else class="text-center q-pa-md text-grey-6">
              <q-icon name="biotech" size="32px" class="q-mb-sm"/>
              <div class="text-caption">No hay pruebas seleccionadas para este estudio</div>
            </div>
          </div>

          <!-- Observaciones del estudio -->
          <div class="col-12">
            <q-input
              v-model="estudioData.observaciones"
              label="Observaciones del Estudio"
              outlined
              type="textarea"
              rows="2"
              dense
              :readonly="modoLectura"
            />
          </div>

          <!-- Estado y progreso -->
          <div class="col-12" v-if="estudioData.estado !== 'pendiente'">
            <q-linear-progress
              :value="calcularProgreso()"
              color="primary"
              size="8px"
              class="q-mb-sm"
            />
            <div class="text-caption text-center">
              {{ Math.round(calcularProgreso() * 100) }}% completado
              ({{ pruebasCompletadas }}/{{ estudioData.pruebas?.length || 0 }} pruebas)
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Acciones del estudio -->
      <q-card-actions v-if="!modoLectura" align="right" class="bg-grey-1">
        <q-btn
          v-if="estudioData.estado === 'pendiente'"
          color="primary"
          icon="play_arrow"
          label="Iniciar Procesamiento"
          @click="iniciarProcesamiento"
          :disable="!estudioData.pruebas || estudioData.pruebas.length === 0"
        />
        
        <q-btn
          v-if="estudioData.estado === 'en_proceso'"
          color="positive"
          icon="check"
          label="Marcar como Completado"
          @click="completarEstudio"
          :disable="!todasPruebasCompletadas"
        />

        <q-btn
          color="info"
          icon="print"
          label="Imprimir Orden"
          @click="imprimirOrden"
        />
      </q-card-actions>
    </q-card>

    <!-- Diálogo selector de pruebas -->
    <q-dialog v-model="mostrarSelectorPruebas">
      <SelectorPruebas
        :estudio-id="estudio.id"
        :pruebas-disponibles="estudio.pruebasDisponibles"
        :pruebas-seleccionadas="estudioData.pruebas || []"
        @pruebas-seleccionadas="agregarPruebas"
        @cancelar="mostrarSelectorPruebas = false"
      />
    </q-dialog>

    <!-- Diálogo registro de resultados -->
    <q-dialog v-model="mostrarRegistroResultado" persistent>
      <RegistroResultados
        v-if="pruebaSeleccionada"
        :prueba="pruebaSeleccionada"
        @resultado-guardado="guardarResultado"
        @cancelar="cerrarRegistroResultado"
      />
    </q-dialog>
  </q-expansion-item>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PruebaLaboratorio from './PruebaLaboratorio.vue'
import SelectorPruebas from './SelectorPruebas.vue'
import RegistroResultados from './RegistroResultados.vue'

// Props
const props = defineProps({
  estudio: {
    type: Object,
    required: true
  },
  modoLectura: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['estudio-actualizado', 'estudio-eliminado'])

// Estados locales
const expanded = ref(false)
const estudioData = ref({ ...props.estudio })
const mostrarSelectorPruebas = ref(false)
const mostrarRegistroResultado = ref(false)
const pruebaSeleccionada = ref(null)

// Opciones
const metodologias = [
  'Espectrofotometría', 'Inmunofluorescencia', 'ELISA', 
  'PCR', 'Cultivo', 'Microscopia', 'Química Seca', 'Otra'
]

const condicionesEspeciales = [
  'Ayuno 12h', 'Refrigeración', 'Proteger de luz', 
  'Procesar inmediatamente', 'Congelación', 'Ambiente'
]

// Computed
const pruebasCompletadas = computed(() => {
  return estudioData.value.pruebas?.filter(p => p.estado === 'completada').length || 0
})

const todasPruebasCompletadas = computed(() => {
  const totalPruebas = estudioData.value.pruebas?.length || 0
  return totalPruebas > 0 && pruebasCompletadas.value === totalPruebas
})

// Métodos de estado
const getEstadoColor = () => {
  switch(estudioData.value.estado) {
    case 'pendiente': return 'orange'
    case 'en_proceso': return 'blue'
    case 'completada': return 'green'
    case 'cancelada': return 'red'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(estudioData.value.estado) {
    case 'pendiente': return 'schedule'
    case 'en_proceso': return 'hourglass_empty'
    case 'completada': return 'check_circle'
    case 'cancelada': return 'cancel'
    default: return 'help'
  }
}

const getEstadoLabel = () => {
  switch(estudioData.value.estado) {
    case 'pendiente': return 'Pendiente'
    case 'en_proceso': return 'En Proceso'
    case 'completada': return 'Completada'
    case 'cancelada': return 'Cancelada'
    default: return 'Sin Estado'
  }
}

const getHeaderClass = () => {
  return `bg-${getEstadoColor()}-1`
}

const calcularProgreso = () => {
  const total = estudioData.value.pruebas?.length || 0
  if (total === 0) return 0
  return pruebasCompletadas.value / total
}

// Métodos de manejo de pruebas
const agregarPruebas = (nuevasPruebas) => {
  if (!estudioData.value.pruebas) {
    estudioData.value.pruebas = []
  }
  
  nuevasPruebas.forEach(prueba => {
    const nuevaPrueba = {
      id: Date.now() + Math.random(),
      ...prueba,
      estado: 'pendiente',
      fechaAgregada: new Date().toISOString()
    }
    estudioData.value.pruebas.push(nuevaPrueba)
  })
  
  mostrarSelectorPruebas.value = false
  actualizarEstudio()
}

const actualizarPrueba = (pruebaId, datosActualizados) => {
  const index = estudioData.value.pruebas.findIndex(p => p.id === pruebaId)
  if (index !== -1) {
    estudioData.value.pruebas[index] = { 
      ...estudioData.value.pruebas[index], 
      ...datosActualizados 
    }
    actualizarEstudio()
  }
}

const eliminarPrueba = (pruebaId) => {
  estudioData.value.pruebas = estudioData.value.pruebas.filter(p => p.id !== pruebaId)
  actualizarEstudio()
}

const abrirRegistroResultado = (prueba) => {
  pruebaSeleccionada.value = prueba
  mostrarRegistroResultado.value = true
}

const guardarResultado = (pruebaId, resultado) => {
  const index = estudioData.value.pruebas.findIndex(p => p.id === pruebaId)
  if (index !== -1) {
    estudioData.value.pruebas[index].resultado = resultado
    estudioData.value.pruebas[index].estado = 'completada'
    estudioData.value.pruebas[index].fechaResultado = new Date().toISOString()
  }
  cerrarRegistroResultado()
  actualizarEstudio()
}

const cerrarRegistroResultado = () => {
  mostrarRegistroResultado.value = false
  pruebaSeleccionada.value = null
}

// Métodos principales
const iniciarProcesamiento = () => {
  estudioData.value.estado = 'en_proceso'
  estudioData.value.fechaInicio = new Date().toISOString()
  actualizarEstudio()
}

const completarEstudio = () => {
  estudioData.value.estado = 'completada'
  estudioData.value.fechaCompletado = new Date().toISOString()
  actualizarEstudio()
}

const imprimirOrden = () => {
  // Lógica para imprimir la orden del estudio
  console.log('Imprimiendo orden del estudio:', estudioData.value)
}

const eliminarEstudio = () => {
  emit('estudio-eliminado', estudioData.value.id)
}

const actualizarEstudio = () => {
  emit('estudio-actualizado', estudioData.value.id, estudioData.value)
}

// Watchers
watch(() => props.estudio, (newVal) => {
  estudioData.value = { ...newVal }
}, { deep: true })

watch(estudioData, actualizarEstudio, { deep: true })
</script>

<style scoped>
.estudio-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 8px;
}

.estudio-item .q-expansion-item__header {
  padding: 12px 16px;
}

.estudio-item .q-expansion-item__content {
  padding: 0;
}
</style>
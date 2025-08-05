<template>
  <q-card style="min-width: 500px; max-width: 700px">
    <q-card-section>
      <div class="text-h6">Agregar Pruebas al Estudio</div>
      <div class="text-caption text-grey-6">
        Selecciona las pruebas adicionales que deseas incluir
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <!-- Buscador -->
      <div class="q-mb-md">
        <q-input
          v-model="filtroTexto"
          label="Buscar pruebas"
          outlined
          dense
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Lista de pruebas disponibles -->
      <div class="pruebas-container" style="max-height: 300px; overflow-y: auto;">
        <q-list bordered separator>
          <q-item
            v-for="prueba in pruebasFiltradas"
            :key="prueba.id"
            clickable
            @click="togglePrueba(prueba)"
            :class="{ 'bg-blue-1': prueba.seleccionada }"
          >
            <q-item-section avatar>
              <q-checkbox
                v-model="prueba.seleccionada"
                @click.stop
                color="primary"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ prueba.nombre }}</q-item-label>
              <q-item-label caption>
                {{ prueba.codigo }} • {{ prueba.unidadMedida }}
              </q-item-label>
              <q-item-label caption v-if="prueba.valorReferencia">
                Referencia: {{ prueba.valorReferencia }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon 
                name="info" 
                color="grey-5" 
                @click.stop="mostrarInfoPrueba(prueba)"
                class="cursor-pointer"
              >
                <q-tooltip>Ver información detallada</q-tooltip>
              </q-icon>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="pruebasFiltradas.length === 0" class="text-center q-pa-md text-grey-6">
          <q-icon name="search_off" size="48px" class="q-mb-sm"/>
          <div>No se encontraron pruebas</div>
          <div class="text-caption">Intenta ajustar el filtro de búsqueda</div>
        </div>
      </div>

      <!-- Resumen de selección -->
      <div v-if="pruebasSeleccionadas.length > 0" class="q-mt-md">
        <q-separator class="q-mb-md" />
        <div class="text-subtitle2 q-mb-sm">
          Pruebas Seleccionadas ({{ pruebasSeleccionadas.length }})
        </div>
        
        <div class="row q-col-gutter-xs">
          <div 
            v-for="prueba in pruebasSeleccionadas" 
            :key="prueba.id"
            class="col-auto"
          >
            <q-chip
              :label="prueba.nombre"
              removable
              @remove="deseleccionarPrueba(prueba)"
              color="primary"
              text-color="white"
              size="sm"
            />
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" @click="cancelar" />
      <q-btn 
        flat 
        label="Seleccionar Todas" 
        @click="seleccionarTodas"
        v-if="pruebasFiltradas.length > 0"
      />
      <q-btn 
        flat 
        label="Limpiar" 
        @click="limpiarSeleccion"
        v-if="pruebasSeleccionadas.length > 0"
      />
      <q-btn 
        color="primary" 
        label="Agregar Pruebas" 
        @click="confirmarSeleccion"
        :disable="pruebasSeleccionadas.length === 0"
      />
    </q-card-actions>

    <!-- Diálogo información de prueba -->
    <q-dialog v-model="mostrarInfoDialog">
      <q-card style="min-width: 400px" v-if="pruebaInfo">
        <q-card-section>
          <div class="text-h6">{{ pruebaInfo.nombre }}</div>
          <div class="text-subtitle2 text-grey-6">{{ pruebaInfo.codigo }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-sm">
            <div v-if="pruebaInfo.descripcion">
              <div class="text-weight-medium">Descripción:</div>
              <div class="text-caption">{{ pruebaInfo.descripcion }}</div>
            </div>

            <div v-if="pruebaInfo.unidadMedida">
              <div class="text-weight-medium">Unidad de Medida:</div>
              <div class="text-caption">{{ pruebaInfo.unidadMedida }}</div>
            </div>

            <div v-if="pruebaInfo.valorReferencia">
              <div class="text-weight-medium">Valor de Referencia:</div>
              <div class="text-caption">{{ pruebaInfo.valorReferencia }}</div>
            </div>

            <div v-if="pruebaInfo.metodo">
              <div class="text-weight-medium">Método:</div>
              <div class="text-caption">{{ pruebaInfo.metodo }}</div>
            </div>

            <div v-if="pruebaInfo.tiempoEstimado">
              <div class="text-weight-medium">Tiempo Estimado:</div>
              <div class="text-caption">{{ pruebaInfo.tiempoEstimado }}</div>
            </div>

            <div v-if="pruebaInfo.observaciones">
              <div class="text-weight-medium">Observaciones:</div>
              <div class="text-caption">{{ pruebaInfo.observaciones }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" @click="mostrarInfoDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  estudioId: {
    type: String,
    required: true
  },
  pruebasDisponibles: {
    type: Array,
    default: () => []
  },
  pruebasSeleccionadas: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['pruebas-seleccionadas', 'cancelar'])

// Estados
const filtroTexto = ref('')
const mostrarInfoDialog = ref(false)
const pruebaInfo = ref(null)

// Crear copia local de pruebas con estado de selección
const pruebasLocales = ref(
  props.pruebasDisponibles.map(prueba => ({
    ...prueba,
    seleccionada: props.pruebasSeleccionadas.some(p => p.id === prueba.id)
  }))
)

// Computed
const pruebasFiltradas = computed(() => {
  if (!filtroTexto.value) return pruebasLocales.value
  
  const texto = filtroTexto.value.toLowerCase()
  return pruebasLocales.value.filter(prueba => 
    prueba.nombre.toLowerCase().includes(texto) ||
    prueba.codigo.toLowerCase().includes(texto) ||
    prueba.descripcion?.toLowerCase().includes(texto)
  )
})

const pruebasSeleccionadasComputed = computed(() => {
  return pruebasLocales.value.filter(prueba => prueba.seleccionada)
})

// Métodos
const togglePrueba = (prueba) => {
  prueba.seleccionada = !prueba.seleccionada
}

const deseleccionarPrueba = (prueba) => {
  const pruebaLocal = pruebasLocales.value.find(p => p.id === prueba.id)
  if (pruebaLocal) {
    pruebaLocal.seleccionada = false
  }
}

const seleccionarTodas = () => {
  pruebasFiltradas.value.forEach(prueba => {
    prueba.seleccionada = true
  })
}

const limpiarSeleccion = () => {
  pruebasLocales.value.forEach(prueba => {
    prueba.seleccionada = false
  })
}

const mostrarInfoPrueba = (prueba) => {
  pruebaInfo.value = prueba
  mostrarInfoDialog.value = true
}

const confirmarSeleccion = () => {
  const seleccionadas = pruebasSeleccionadasComputed.value.map(prueba => ({
    ...prueba,
    seleccionada: undefined // Remover propiedad temporal
  }))
  emit('pruebas-seleccionadas', seleccionadas)
}

const cancelar = () => {
  emit('cancelar')
}
</script>

<style scoped>
.pruebas-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
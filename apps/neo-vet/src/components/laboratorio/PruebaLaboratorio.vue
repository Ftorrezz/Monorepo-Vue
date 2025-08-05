<template>
  <q-card flat bordered class="prueba-card">
    <q-card-section class="q-pa-sm">
      <div class="row items-center">
        <div class="col-auto q-mr-sm">
          <q-avatar :color="getEstadoColor()" text-color="white" size="24px">
            <q-icon :name="getEstadoIcon()" size="16px" />
          </q-avatar>
        </div>

        <div class="col">
          <div class="text-weight-medium">{{ prueba.nombre }}</div>
          <div class="text-caption text-grey-6">
            {{ prueba.codigo }} • {{ prueba.unidadMedida }}
            <span v-if="prueba.valorReferencia"> • Ref: {{ prueba.valorReferencia }}</span>
          </div>
        </div>

        <div class="col-auto q-gutter-xs">
          <!-- Mostrar resultado si existe -->
          <q-chip
            v-if="prueba.resultado"
            :color="getResultadoColor()"
            text-color="white"
            :label="formatearResultado()"
            dense
          />

          <!-- Botones de acción -->
          <q-btn
            v-if="!modoLectura && prueba.estado !== 'completada'"
            flat
            round
            dense
            icon="edit"
            color="primary"
            @click="editarPrueba"
            size="sm"
          >
            <q-tooltip>Editar prueba</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!modoLectura && prueba.estado === 'en_proceso'"
            flat
            round
            dense
            icon="science"
            color="positive"
            @click="registrarResultado"
            size="sm"
          >
            <q-tooltip>Registrar resultado</q-tooltip>
          </q-btn>

          <q-btn
            v-if="!modoLectura"
            flat
            round
            dense
            icon="delete"
            color="negative"
            @click="eliminarPrueba"
            size="sm"
          >
            <q-tooltip>Eliminar prueba</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Detalles expandidos -->
      <q-slide-transition>
        <div v-if="expandido" class="q-mt-sm">
          <q-separator class="q-mb-sm" />
          
          <div class="row q-col-gutter-sm text-caption">
            <div class="col-12 col-sm-6">
              <div class="text-weight-medium text-grey-8">Método:</div>
              <div>{{ prueba.metodo || 'No especificado' }}</div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-weight-medium text-grey-8">Tiempo estimado:</div>
              <div>{{ prueba.tiempoEstimado || 'No especificado' }}</div>
            </div>

            <div class="col-12 col-sm-6" v-if="prueba.valorReferencia">
              <div class="text-weight-medium text-grey-8">Valor de referencia:</div>
              <div>{{ prueba.valorReferencia }}</div>
            </div>

            <div class="col-12 col-sm-6" v-if="prueba.observaciones">
              <div class="text-weight-medium text-grey-8">Observaciones:</div>
              <div>{{ prueba.observaciones }}</div>
            </div>

            <!-- Información del resultado si existe -->
            <div v-if="prueba.resultado" class="col-12">
              <div class="text-weight-medium text-grey-8">Información del resultado:</div>
              <div class="q-mt-xs">
                <div><strong>Valor:</strong> {{ formatearResultado() }}</div>
                <div v-if="prueba.resultado.interpretacion">
                  <strong>Interpretación:</strong> {{ prueba.resultado.interpretacion }}
                </div>
                <div v-if="prueba.resultado.comentarios">
                  <strong>Comentarios:</strong> {{ prueba.resultado.comentarios }}
                </div>
                <div v-if="prueba.fechaResultado">
                  <strong>Fecha:</strong> {{ formatearFecha(prueba.fechaResultado) }}
                </div>
                <div v-if="prueba.resultado.procesadoPor">
                  <strong>Procesado por:</strong> {{ prueba.resultado.procesadoPor }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-slide-transition>

      <!-- Toggle para expandir/contraer -->
      <div class="row justify-center q-mt-xs">
        <q-btn
          flat
          dense
          :icon="expandido ? 'expand_less' : 'expand_more'"
          @click="expandido = !expandido"
          size="sm"
          color="grey-6"
        />
      </div>
    </q-card-section>

    <!-- Diálogo para editar prueba -->
    <q-dialog v-model="mostrarDialogoEdicion" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Editar Prueba</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-gutter-md">
            <q-input
              v-model="pruebaEditada.nombre"
              label="Nombre de la Prueba"
              outlined
              dense
            />

            <q-input
              v-model="pruebaEditada.codigo"
              label="Código"
              outlined
              dense
            />

            <q-select
              v-model="pruebaEditada.metodo"
              :options="metodosDisponibles"
              label="Método"
              outlined
              dense
            />

            <q-input
              v-model="pruebaEditada.unidadMedida"
              label="Unidad de Medida"
              outlined
              dense
            />

            <q-input
              v-model="pruebaEditada.valorReferencia"
              label="Valor de Referencia"
              outlined
              dense
              placeholder="Ej: 5.0 - 15.0, Negativo, etc."
            />

            <q-input
              v-model="pruebaEditada.tiempoEstimado"
              label="Tiempo Estimado"
              outlined
              dense
              placeholder="Ej: 2 horas, 1 día, etc."
            />

            <q-input
              v-model="pruebaEditada.observaciones"
              label="Observaciones"
              outlined
              type="textarea"
              rows="2"
              dense
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="cancelarEdicion" />
          <q-btn flat label="Guardar" color="primary" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  prueba: {
    type: Object,
    required: true
  },
  modoLectura: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['prueba-actualizada', 'prueba-eliminada', 'registrar-resultado'])

// Estados locales
const expandido = ref(false)
const mostrarDialogoEdicion = ref(false)
const pruebaEditada = ref({ ...props.prueba })

// Opciones
const metodosDisponibles = [
  'Espectrofotometría',
  'Inmunofluorescencia', 
  'ELISA',
  'PCR',
  'Cultivo',
  'Microscopia',
  'Química Seca',
  'Inmunoquimioluminiscencia',
  'Turbidimetría',
  'Nefelometría',
  'Otro'
]

// Métodos de estado
const getEstadoColor = () => {
  switch(props.prueba.estado) {
    case 'pendiente': return 'orange'
    case 'en_proceso': return 'blue'
    case 'completada': return 'green'
    case 'cancelada': return 'red'
    default: return 'grey'
  }
}

const getEstadoIcon = () => {
  switch(props.prueba.estado) {
    case 'pendiente': return 'schedule'
    case 'en_proceso': return 'hourglass_empty'
    case 'completada': return 'check_circle'
    case 'cancelada': return 'cancel'
    default: return 'help'
  }
}

const getResultadoColor = () => {
  if (!props.prueba.resultado) return 'grey'
  
  const interpretacion = props.prueba.resultado.interpretacion?.toLowerCase()
  if (interpretacion?.includes('alto') || interpretacion?.includes('elevado')) {
    return 'red'
  } else if (interpretacion?.includes('bajo') || interpretacion?.includes('disminuido')) {
    return 'orange'
  } else if (interpretacion?.includes('normal') || interpretacion?.includes('negativo')) {
    return 'green'
  }
  return 'blue'
}

// Métodos de formateo
const formatearResultado = () => {
  if (!props.prueba.resultado) return ''
  
  const resultado = props.prueba.resultado
  let texto = resultado.valor

  if (resultado.unidad) {
    texto += ` ${resultado.unidad}`
  }

  return texto
}

const formatearFecha = (fechaISO) => {
  const fecha = new Date(fechaISO)
  return fecha.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos de acciones
const editarPrueba = () => {
  pruebaEditada.value = { ...props.prueba }
  mostrarDialogoEdicion.value = true
}

const cancelarEdicion = () => {
  mostrarDialogoEdicion.value = false
  pruebaEditada.value = { ...props.prueba }
}

const guardarEdicion = () => {
  emit('prueba-actualizada', props.prueba.id, pruebaEditada.value)
  mostrarDialogoEdicion.value = false
}

const registrarResultado = () => {
  emit('registrar-resultado', props.prueba)
}

const eliminarPrueba = () => {
  emit('prueba-eliminada', props.prueba.id)
}
</script>

<style scoped>
.prueba-card {
  transition: all 0.3s ease;
}

.prueba-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
<template>
  <q-card style="min-width: 600px; max-width: 800px">
    <q-card-section>
      <div class="text-h6">Registrar Resultado</div>
      <div class="text-subtitle2 text-grey-6">{{ prueba.nombre }}</div>
      <div class="text-caption">{{ prueba.codigo }} • {{ prueba.unidadMedida }}</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="row q-col-gutter-md">
        <!-- Información de referencia -->
        <div class="col-12" v-if="prueba.valorReferencia">
          <q-banner class="bg-blue-1 text-blue-9">
            <template v-slot:avatar>
              <q-icon name="info" />
            </template>
            <strong>Valor de Referencia:</strong> {{ prueba.valorReferencia }}
          </q-banner>
        </div>

        <!-- Tipo de resultado -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="resultado.tipoResultado"
            :options="tiposResultado"
            label="Tipo de Resultado *"
            outlined
            option-label="label"
            option-value="value"
            @update:model-value="cambiarTipoResultado"
          />
        </div>

        <!-- Método utilizado -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="resultado.metodoUtilizado"
            :options="metodosDisponibles"
            label="Método Utilizado"
            outlined
          />
        </div>

        <!-- Campos según tipo de resultado -->
        <template v-if="resultado.tipoResultado === 'numerico'">
          <div class="col-12 col-md-6">
            <q-input
              v-model.number="resultado.valor"
              label="Valor Numérico *"
              outlined
              type="number"
              step="0.01"
              @update:model-value="calcularInterpretacion"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="resultado.unidad"
              label="Unidad de Medida"
              outlined
              :hint="`Sugerida: ${prueba.unidadMedida || 'No especificada'}`"
            />
          </div>
        </template>

        <template v-else-if="resultado.tipoResultado === 'cualitativo'">
          <div class="col-12 col-md-6">
            <q-select
              v-model="resultado.valor"
              :options="opcionesCualitativas"
              label="Resultado Cualitativo *"
              outlined
              @update:model-value="calcularInterpretacion"
            />
          </div>
        </template>

        <template v-else-if="resultado.tipoResultado === 'texto'">
          <div class="col-12">
            <q-input
              v-model="resultado.valor"
              label="Resultado Descriptivo *"
              outlined
              type="textarea"
              rows="3"
              @update:model-value="calcularInterpretacion"
            />
          </div>
        </template>

        <!-- Interpretación automática -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="resultado.interpretacion"
            :options="interpretaciones"
            label="Interpretación"
            outlined
            option-label="label"
            option-value="value"
          />
        </div>

        <!-- Estado del resultado -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="resultado.estado"
            :options="estadosResultado"
            label="Estado del Resultado"
            outlined
            option-label="label"
            option-value="value"
          />
        </div>

        <!-- Comentarios y observaciones -->
        <div class="col-12">
          <q-input
            v-model="resultado.comentarios"
            label="Comentarios y Observaciones"
            outlined
            type="textarea"
            rows="2"
            placeholder="Observaciones adicionales, comentarios técnicos, etc."
          />
        </div>

        <!-- Información del procesamiento -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Información del Procesamiento</div>
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="resultado.fechaProcesamiento"
            label="Fecha de Procesamiento"
            outlined
            type="datetime-local"
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="resultado.procesadoPor"
            label="Procesado Por"
            outlined
            placeholder="Nombre del técnico/veterinario"
          />
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model="resultado.equipoUtilizado"
            label="Equipo Utilizado"
            outlined
            placeholder="Nombre/modelo del equipo"
          />
        </div>

        <!-- Control de calidad -->
        <div class="col-12">
          <q-checkbox
            v-model="resultado.controlCalidad"
            label="Control de Calidad Aprobado"
          />
        </div>

        <div v-if="resultado.controlCalidad" class="col-12 col-md-6">
          <q-input
            v-model="resultado.loteReactivos"
            label="Lote de Reactivos"
            outlined
          />
        </div>

        <div v-if="resultado.controlCalidad" class="col-12 col-md-6">
          <q-input
            v-model="resultado.calibracion"
            label="Calibración"
            outlined
            placeholder="Fecha última calibración"
          />
        </div>

        <!-- Validación y autorización -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Validación</div>
        </div>

        <div class="col-12 col-md-6">
          <q-checkbox
            v-model="resultado.requiereValidacion"
            label="Requiere Validación Adicional"
          />
        </div>

        <div class="col-12 col-md-6">
          <q-checkbox
            v-model="resultado.resultadoCritico"
            label="Resultado Crítico"
          />
        </div>

        <div v-if="resultado.requiereValidacion" class="col-12 col-md-6">
          <q-input
            v-model="resultado.validadoPor"
            label="Validado Por"
            outlined
            placeholder="Nombre del supervisor"
          />
        </div>

        <div v-if="resultado.resultadoCritico" class="col-12 col-md-6">
          <q-input
            v-model="resultado.accionesTomadas"
            label="Acciones Tomadas"
            outlined
            type="textarea"
            rows="2"
          />
        </div>
      </div>

      <!-- Vista previa del resultado -->
      <div v-if="resultado.valor" class="q-mt-md">
        <q-separator class="q-mb-md"/>
        <div class="text-subtitle2 q-mb-sm">Vista Previa del Resultado</div>
        
        <q-card flat bordered class="bg-grey-1">
          <q-card-section class="q-pa-md">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ prueba.nombre }}</div>
                <div class="text-subtitle2">
                  {{ formatearResultado() }}
                  <q-chip
                    :color="getColorInterpretacion()"
                    text-color="white"
                    :label="resultado.interpretacion?.label || resultado.interpretacion"
                    class="q-ml-sm"
                    v-if="resultado.interpretacion"
                  />
                </div>
                <div v-if="resultado.comentarios" class="text-caption text-grey-7 q-mt-xs">
                  {{ resultado.comentarios }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon 
                  :name="getIconoInterpretacion()" 
                  :color="getColorInterpretacion()"
                  size="24px"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" @click="cancelar" />
      <q-btn flat label="Guardar Borrador" @click="guardarBorrador" />
      <q-btn 
        color="primary" 
        label="Guardar Resultado" 
        @click="guardarResultado"
        :disable="!formularioValido"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  prueba: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['resultado-guardado', 'cancelar'])

// Estado del resultado
const resultado = ref({
  tipoResultado: 'numerico',
  valor: '',
  unidad: props.prueba.unidadMedida || '',
  interpretacion: '',
  comentarios: '',
  estado: 'final',
  fechaProcesamiento: new Date().toISOString().slice(0, 16),
  procesadoPor: 'Usuario Actual',
  equipoUtilizado: '',
  metodoUtilizado: props.prueba.metodo || '',
  controlCalidad: false,
  loteReactivos: '',
  calibracion: '',
  requiereValidacion: false,
  validadoPor: '',
  resultadoCritico: false,
  accionesTomadas: ''
})

// Opciones
const tiposResultado = [
  { label: 'Numérico', value: 'numerico' },
  { label: 'Cualitativo', value: 'cualitativo' },
  { label: 'Texto Libre', value: 'texto' }
]

const opcionesCualitativas = [
  'Positivo', 'Negativo', 'Presente', 'Ausente',
  'Normal', 'Anormal', 'Reactivo', 'No Reactivo',
  'Detectado', 'No Detectado'
]

const interpretaciones = [
  { label: 'Normal', value: 'normal' },
  { label: 'Alto', value: 'alto' },
  { label: 'Bajo', value: 'bajo' },
  { label: 'Crítico Alto', value: 'critico_alto' },
  { label: 'Crítico Bajo', value: 'critico_bajo' },
  { label: 'Positivo', value: 'positivo' },
  { label: 'Negativo', value: 'negativo' },
  { label: 'Indeterminado', value: 'indeterminado' }
]

const estadosResultado = [
  { label: 'Final', value: 'final' },
  { label: 'Preliminar', value: 'preliminar' },
  { label: 'Corregido', value: 'corregido' },
  { label: 'Cancelado', value: 'cancelado' }
]

const metodosDisponibles = [
  'Espectrofotometría', 'Inmunofluorescencia', 'ELISA', 
  'PCR', 'Cultivo', 'Microscopia', 'Química Seca',
  'Inmunoquimioluminiscencia', 'Turbidimetría', 'Nefelometría'
]

// Computed
const formularioValido = computed(() => {
  return resultado.value.tipoResultado && 
         resultado.value.valor && 
         resultado.value.procesadoPor &&
         resultado.value.fechaProcesamiento
})

// Métodos
const cambiarTipoResultado = () => {
  resultado.value.valor = ''
  resultado.value.interpretacion = ''
}

const calcularInterpretacion = () => {
  if (!resultado.value.valor) return

  // Lógica básica de interpretación automática
  if (resultado.value.tipoResultado === 'numerico' && props.prueba.valorReferencia) {
    const valor = parseFloat(resultado.value.valor)
    const referencia = props.prueba.valorReferencia

    // Intentar extraer rangos del valor de referencia
    const rangoMatch = referencia.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/)
    if (rangoMatch) {
      const min = parseFloat(rangoMatch[1])
      const max = parseFloat(rangoMatch[2])

      if (valor < min) {
        resultado.value.interpretacion = 'bajo'
      } else if (valor > max) {
        resultado.value.interpretacion = 'alto'
      } else {
        resultado.value.interpretacion = 'normal'
      }
    }
  } else if (resultado.value.tipoResultado === 'cualitativo') {
    const valor = resultado.value.valor.toLowerCase()
    if (['positivo', 'presente', 'detectado', 'reactivo'].includes(valor)) {
      resultado.value.interpretacion = 'positivo'
    } else if (['negativo', 'ausente', 'no detectado', 'no reactivo'].includes(valor)) {
      resultado.value.interpretacion = 'negativo'
    }
  }
}

const formatearResultado = () => {
  if (!resultado.value.valor) return ''

  if (resultado.value.tipoResultado === 'numerico') {
    return `${resultado.value.valor}${resultado.value.unidad ? ' ' + resultado.value.unidad : ''}`
  }
  
  return resultado.value.valor
}

const getColorInterpretacion = () => {
  switch(resultado.value.interpretacion?.value || resultado.value.interpretacion) {
    case 'normal':
    case 'negativo':
      return 'green'
    case 'alto':
    case 'bajo':
    case 'positivo':
      return 'orange'
    case 'critico_alto':
    case 'critico_bajo':
      return 'red'
    default:
      return 'blue'
  }
}

const getIconoInterpretacion = () => {
  switch(resultado.value.interpretacion?.value || resultado.value.interpretacion) {
    case 'normal':
    case 'negativo':
      return 'check_circle'
    case 'alto':
      return 'trending_up'
    case 'bajo':
      return 'trending_down'
    case 'critico_alto':
    case 'critico_bajo':
      return 'warning'
    case 'positivo':
      return 'add_circle'
    default:
      return 'help'
  }
}

const guardarBorrador = () => {
  const resultadoBorrador = {
    ...resultado.value,
    estado: 'preliminar',
    fechaGuardado: new Date().toISOString()
  }
  emit('resultado-guardado', props.prueba.id, resultadoBorrador)
}

const guardarResultado = () => {
  const resultadoFinal = {
    ...resultado.value,
    fechaGuardado: new Date().toISOString()
  }
  emit('resultado-guardado', props.prueba.id, resultadoFinal)
}

const cancelar = () => {
  emit('cancelar')
}

// Inicialización
onMounted(() => {
  // Si la prueba ya tiene algún resultado previo, cargarlo
  if (props.prueba.resultado) {
    Object.assign(resultado.value, props.prueba.resultado)
  }
})
</script>

<style scoped>
/* Estilos específicos para el formulario de resultados */
</style>
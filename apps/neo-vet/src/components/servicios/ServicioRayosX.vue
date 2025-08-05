<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="medical_services" color="blue" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Rayos X</div>
          <div class="text-caption text-grey-7">Estudio radiográfico</div>
        </div>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
          :disable="modoLectura"
        >
          <q-list>
            <q-item clickable @click="completarRayosX" :disable="!formularioValido">
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Marcar como Completado</q-item-section>
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
        <!-- Información básica del estudio -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosRayosX.tipoEstudio"
            :options="tiposEstudio"
            label="Tipo de Estudio *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosRayosX.regionAnatomica"
            :options="regionesAnatomicas"
            label="Región Anatómica *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosRayosX.posicion"
            :options="posiciones"
            label="Posición *"
            outlined
            multiple
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosRayosX.numeroPlacas"
            label="Número de Placas *"
            outlined
            type="number"
            min="1"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosRayosX.contraste"
            :options="opcionesContraste"
            label="Uso de Contraste"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <!-- Parámetros técnicos -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Parámetros Técnicos</div>
        </div>
        
        <div class="col-12 col-md-3">
          <q-input
            v-model="datosRayosX.kv"
            label="kV"
            outlined
            type="number"
            min="40"
            max="150"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-3">
          <q-input
            v-model="datosRayosX.mas"
            label="mAs"
            outlined
            type="number"
            step="0.1"
            min="0.1"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-3">
          <q-input
            v-model="datosRayosX.tiempo"
            label="Tiempo (s)"
            outlined
            type="number"
            step="0.01"
            min="0.01"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-3">
          <q-input
            v-model="datosRayosX.distancia"
            label="Distancia (cm)"
            outlined
            type="number"
            min="40"
            max="120"
            placeholder="100"
            :readonly="modoLectura"
          />
        </div>
        
        <!-- Sedación y preparación -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Preparación del Paciente</div>
        </div>
        
        <div class="col-12 col-md-6">
          <q-checkbox
            v-model="datosRayosX.sedacion"
            label="¿Se utilizó sedación?"
            :disable="modoLectura"
          />
        </div>
        
        <div v-if="datosRayosX.sedacion" class="col-12 col-md-6">
          <q-input
            v-model="datosRayosX.tipoSedacion"
            label="Tipo de Sedación"
            outlined
            placeholder="Ej: Acepromazina, Diazepam..."
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-checkbox
            v-model="datosRayosX.ayuno"
            label="Paciente en ayuno"
            :disable="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosRayosX.preparacion"
            label="Preparación Especial"
            outlined
            placeholder="Enemas, catéteres, etc."
            :readonly="modoLectura"
          />
        </div>
        
        <!-- Hallazgos radiográficos -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Hallazgos Radiográficos</div>
        </div>
        
        <div class="col-12">
          <q-select
            v-model="datosRayosX.calidadImagen"
            :options="calidadImagenOpciones"
            label="Calidad de la Imagen"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosRayosX.hallazgos"
            label="Hallazgos Radiográficos *"
            outlined
            type="textarea"
            rows="3"
            placeholder="Describa los hallazgos encontrados en el estudio..."
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosRayosX.interpretacion"
            label="Interpretación/Diagnóstico Radiológico *"
            outlined
            type="textarea"
            rows="3"
            placeholder="Interpretación de los hallazgos y diagnóstico radiológico..."
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosRayosX.recomendaciones"
            label="Recomendaciones"
            outlined
            type="textarea"
            rows="2"
            placeholder="Estudios adicionales, seguimiento, etc."
            :readonly="modoLectura"
          />
        </div>
        
        <!-- Archivos de imagen -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Archivos de Imagen</div>
        </div>
        
        <div class="col-12" v-if="!modoLectura">
          <q-file
            v-model="datosRayosX.archivos"
            label="Subir Imágenes Radiográficas"
            outlined
            multiple
            accept=".jpg,.jpeg,.png,.dicom,.dcm"
            max-file-size="10485760"
            @rejected="onRejected"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
        </div>
        
        <div v-if="datosRayosX.archivos && datosRayosX.archivos.length > 0" class="col-12">
          <q-list bordered>
            <q-item v-for="(archivo, index) in datosRayosX.archivos" :key="index">
              <q-item-section avatar>
                <q-icon name="image" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ archivo.name }}</q-item-label>
                <q-item-label caption>{{ formatFileSize(archivo.size) }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="!modoLectura">
                <q-btn flat round icon="delete" color="negative" @click="removeFile(index)" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        
        <!-- Observaciones generales -->
        <div class="col-12">
          <q-input
            v-model="datosRayosX.observaciones"
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
            :color="formularioValido ? 'green' : 'orange'"
            text-color="white"
            :icon="formularioValido ? 'check_circle' : 'warning'"
            :label="formularioValido ? 'Datos Completos' : 'Datos Incompletos'"
          />
        </div>
        
        <div class="col-auto">
          <q-btn
            color="positive"
            icon="check"
            label="Completar Estudio"
            @click="completarRayosX"
            :disable="!formularioValido"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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

// Quasar
const $q = useQuasar()

// Estados del formulario
const datosRayosX = ref({
  tipoEstudio: '',
  regionAnatomica: '',
  posicion: [],
  numeroPlacas: 1,
  contraste: 'sin_contraste',
  kv: '',
  mas: '',
  tiempo: '',
  distancia: 100,
  sedacion: false,
  tipoSedacion: '',
  ayuno: false,
  preparacion: '',
  calidadImagen: 'buena',
  hallazgos: '',
  interpretacion: '',
  recomendaciones: '',
  archivos: [],
  observaciones: ''
})

// Opciones para selects
const tiposEstudio = [
  { label: 'Radiografía Simple', value: 'simple' },
  { label: 'Radiografía con Contraste', value: 'contraste' },
  { label: 'Mielografía', value: 'mielografia' },
  { label: 'Urografía', value: 'urografia' },
  { label: 'Artrografía', value: 'artrografia' },
  { label: 'Estudio Digestivo', value: 'digestivo' },
  { label: 'Otro', value: 'otro' }
]

const regionesAnatomicas = [
  { label: 'Tórax', value: 'torax' },
  { label: 'Abdomen', value: 'abdomen' },
  { label: 'Pelvis', value: 'pelvis' },
  { label: 'Columna Cervical', value: 'columna_cervical' },
  { label: 'Columna Torácica', value: 'columna_toracica' },
  { label: 'Columna Lumbar', value: 'columna_lumbar' },
  { label: 'Miembro Anterior Derecho', value: 'mad' },
  { label: 'Miembro Anterior Izquierdo', value: 'mai' },
  { label: 'Miembro Posterior Derecho', value: 'mpd' },
  { label: 'Miembro Posterior Izquierdo', value: 'mpi' },
  { label: 'Cráneo', value: 'craneo' },
  { label: 'Cuerpo Completo', value: 'cuerpo_completo' }
]

const posiciones = [
  { label: 'Ventro-Dorsal (VD)', value: 'vd' },
  { label: 'Dorso-Ventral (DV)', value: 'dv' },
  { label: 'Latero-Lateral Derecha', value: 'lld' },
  { label: 'Latero-Lateral Izquierda', value: 'lli' },
  { label: 'Oblicua', value: 'oblicua' },
  { label: 'Rostro-Caudal', value: 'rc' },
  { label: 'Caudo-Rostral', value: 'cr' },
  { label: 'Medio-Lateral', value: 'ml' },
  { label: 'Latero-Medial', value: 'lm' }
]

const opcionesContraste = [
  { label: 'Sin Contraste', value: 'sin_contraste' },
  { label: 'Bario', value: 'bario' },
  { label: 'Yodo', value: 'yodo' },
  { label: 'Aire (Contraste Negativo)', value: 'aire' },
  { label: 'Doble Contraste', value: 'doble' }
]

const calidadImagenOpciones = [
  { label: 'Excelente', value: 'excelente' },
  { label: 'Buena', value: 'buena' },
  { label: 'Regular', value: 'regular' },
  { label: 'Deficiente', value: 'deficiente' }
]

// Validaciones
const formularioValido = computed(() => {
  return datosRayosX.value.tipoEstudio && 
         datosRayosX.value.regionAnatomica && 
         datosRayosX.value.posicion.length > 0 &&
         datosRayosX.value.numeroPlacas &&
         datosRayosX.value.hallazgos &&
         datosRayosX.value.interpretacion
})

// Métodos
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeFile = (index) => {
  datosRayosX.value.archivos.splice(index, 1)
}

const onRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} archivo(s) no cumplieron con los criterios de selección`
  })
}

const guardarDatos = () => {
  if (formularioValido.value) {
    emit('servicio-actualizado', props.servicioId, datosRayosX.value)
  }
}

const completarRayosX = () => {
  if (formularioValido.value) {
    emit('servicio-completado', props.servicioId, {
      ...datosRayosX.value,
      fechaRealizacion: new Date().toISOString(),
      realizadoPor: 'Dr. Usuario Actual' // Obtener del contexto
    })
  }
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Watchers
watch(datosRayosX, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>
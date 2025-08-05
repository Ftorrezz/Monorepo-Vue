<template>
  <q-card class="servicio-card">
    <q-card-section class="bg-purple-1">
      <div class="row items-center">
        <q-icon name="monitor_heart" color="purple" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6">Ultrasonido</div>
          <div class="text-caption text-grey-7">Estudio ecográfico diagnóstico</div>
        </div>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
          :disable="modoLectura"
        >
          <q-list>
            <q-item clickable @click="completarUltrasonido" :disable="!formularioValido">
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
            v-model="datosUltrasonido.tipoEstudio"
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
            v-model="datosUltrasonido.regionEstudiada"
            :options="regionesAnatomicas"
            label="Región Estudiada *"
            outlined
            multiple
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosUltrasonido.indicacion"
            :options="indicacionesClinicas"
            label="Indicación Clínica *"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosUltrasonido.tipoTransductor"
            :options="tiposTransductor"
            label="Tipo de Transductor"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-input
            v-model="datosUltrasonido.frecuencia"
            label="Frecuencia (MHz)"
            outlined
            type="number"
            step="0.5"
            min="2"
            max="15"
            :readonly="modoLectura"
          />
        </div>
        
        <!-- Preparación del paciente -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Preparación del Paciente</div>
        </div>
        
        <div class="col-12 col-md-4">
          <q-checkbox
            v-model="datosUltrasonido.ayuno"
            label="Ayuno previo"
            :disable="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-checkbox
            v-model="datosUltrasonido.sedacion"
            label="Sedación utilizada"
            :disable="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-checkbox
            v-model="datosUltrasonido.rasurado"
            label="Rasurado de la zona"
            :disable="modoLectura"
          />
        </div>
        
        <div v-if="datosUltrasonido.sedacion" class="col-12 col-md-6">
          <q-input
            v-model="datosUltrasonido.tipoSedacion"
            label="Tipo de Sedación"
            outlined
            placeholder="Ej: Acepromazina, Diazepam..."
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-input
            v-model="datosUltrasonido.posicionPaciente"
            label="Posición del Paciente"
            outlined
            placeholder="Decúbito dorsal, lateral..."
            :readonly="modoLectura"
          />
        </div>
        
        <!-- Hallazgos por sistema -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Hallazgos por Sistema</div>
        </div>
        
        <!-- Sistema Cardiovascular -->
        <div v-if="incluirSistema('cardiovascular')" class="col-12">
          <q-expansion-item
            icon="favorite"
            label="Sistema Cardiovascular"
            :default-opened="false"
          >
            <div class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="datosUltrasonido.cardiovascular.frecuenciaCardiaca"
                    label="Frecuencia Cardíaca (lpm)"
                    outlined
                    type="number"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="datosUltrasonido.cardiovascular.ritmo"
                    :options="ritmosCardiacos"
                    label="Ritmo Cardíaco"
                    outlined
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="datosUltrasonido.cardiovascular.hallazgos"
                    label="Hallazgos Cardiovasculares"
                    outlined
                    type="textarea"
                    rows="2"
                    :readonly="modoLectura"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
        
        <!-- Sistema Hepatobiliar -->
        <div v-if="incluirSistema('hepatobiliar')" class="col-12">
          <q-expansion-item
            icon="water_drop"
            label="Sistema Hepatobiliar"
            :default-opened="false"
          >
            <div class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="datosUltrasonido.hepatobiliar.tamanoHigado"
                    label="Tamaño del Hígado"
                    outlined
                    placeholder="Normal, aumentado, disminuido"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="datosUltrasonido.hepatobiliar.ecogenicidad"
                    label="Ecogenicidad Hepática"
                    outlined
                    placeholder="Normal, aumentada, disminuida"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="datosUltrasonido.hepatobiliar.hallazgos"
                    label="Hallazgos Hepatobiliares"
                    outlined
                    type="textarea"
                    rows="2"
                    :readonly="modoLectura"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
        
        <!-- Sistema Urogenital -->
        <div v-if="incluirSistema('urogenital')" class="col-12">
          <q-expansion-item
            icon="healing"
            label="Sistema Urogenital"
            :default-opened="false"
          >
            <div class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="datosUltrasonido.urogenital.tamanoRinones"
                    label="Tamaño Renal"
                    outlined
                    placeholder="Derecho/Izquierdo"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="datosUltrasonido.urogenital.ecogenicidadRenal"
                    label="Ecogenicidad Renal"
                    outlined
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="datosUltrasonido.urogenital.vejiga"
                    label="Vejiga Urinaria"
                    outlined
                    placeholder="Repleta, vacía, alteraciones"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="datosUltrasonido.urogenital.hallazgos"
                    label="Hallazgos Urogenitales"
                    outlined
                    type="textarea"
                    rows="2"
                    :readonly="modoLectura"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
        
        <!-- Sistema Reproductivo -->
        <div v-if="incluirSistema('reproductivo')" class="col-12">
          <q-expansion-item
            icon="pets"
            label="Sistema Reproductivo"
            :default-opened="false"
          >
            <div class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="datosUltrasonido.reproductivo.utero"
                    label="Útero"
                    outlined
                    placeholder="Tamaño, contenido, paredes"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="datosUltrasonido.reproductivo.ovarios"
                    label="Ovarios"
                    outlined
                    placeholder="Tamaño, folículos, cuerpos lúteos"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-checkbox
                    v-model="datosUltrasonido.reproductivo.gestacion"
                    label="¿Gestación detectada?"
                    :disable="modoLectura"
                  />
                </div>
                <div v-if="datosUltrasonido.reproductivo.gestacion" class="col-12 col-md-6">
                  <q-input
                    v-model="datosUltrasonido.reproductivo.numeroFetos"
                    label="Número de Fetos"
                    outlined
                    type="number"
                    min="1"
                    :readonly="modoLectura"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="datosUltrasonido.reproductivo.hallazgos"
                    label="Hallazgos Reproductivos"
                    outlined
                    type="textarea"
                    rows="2"
                    :readonly="modoLectura"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
        
        <!-- Hallazgos generales y conclusiones -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Conclusiones del Estudio</div>
        </div>
        
        <div class="col-12">
          <q-select
            v-model="datosUltrasonido.calidadEstudio"
            :options="calidadEstudioOpciones"
            label="Calidad del Estudio"
            outlined
            option-label="label"
            option-value="value"
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosUltrasonido.hallazgosGenerales"
            label="Hallazgos Generales *"
            outlined
            type="textarea"
            rows="3"
            placeholder="Resumen de los principales hallazgos del estudio..."
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosUltrasonido.diagnostico"
            label="Diagnóstico Ecográfico *"
            outlined
            type="textarea"
            rows="3"
            placeholder="Diagnóstico basado en los hallazgos ecográficos..."
            :readonly="modoLectura"
          />
        </div>
        
        <div class="col-12">
          <q-input
            v-model="datosUltrasonido.recomendaciones"
            label="Recomendaciones"
            outlined
            type="textarea"
            rows="2"
            placeholder="Estudios complementarios, seguimiento, tratamiento..."
            :readonly="modoLectura"
          />
        </div>
        
        <!-- Mediciones realizadas -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Mediciones Realizadas</div>
        </div>
        
        <div class="col-12" v-if="!modoLectura">
          <q-btn
            flat
            icon="add"
            label="Agregar Medición"
            color="primary"
            @click="agregarMedicion"
          />
        </div>
        
        <div v-if="datosUltrasonido.mediciones.length > 0" class="col-12">
          <q-list bordered>
            <q-item 
              v-for="(medicion, index) in datosUltrasonido.mediciones" 
              :key="index"
              class="q-pa-md"
            >
              <q-item-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="medicion.estructura"
                      label="Estructura"
                      outlined
                      dense
                      placeholder="Ej: Riñón derecho"
                      :readonly="modoLectura"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model="medicion.dimension"
                      label="Dimensión"
                      outlined
                      dense
                      placeholder="Ej: Longitud, ancho..."
                      :readonly="modoLectura"
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="medicion.valor"
                      label="Valor (cm)"
                      outlined
                      dense
                      type="number"
                      step="0.1"
                      :readonly="modoLectura"
                    />
                  </div>
                  <div class="col-12 col-md-1" v-if="!modoLectura">
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      @click="eliminarMedicion(index)"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        
        <!-- Archivos de imagen -->
        <div class="col-12">
          <q-separator class="q-my-md"/>
          <div class="text-subtitle2 q-mb-md">Archivos de Imagen</div>
        </div>
        
        <div class="col-12" v-if="!modoLectura">
          <q-file
            v-model="datosUltrasonido.archivos"
            label="Subir Imágenes Ecográficas"
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
        
        <div v-if="datosUltrasonido.archivos && datosUltrasonido.archivos.length > 0" class="col-12">
          <q-list bordered>
            <q-item v-for="(archivo, index) in datosUltrasonido.archivos" :key="index">
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
            v-model="datosUltrasonido.observaciones"
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
            @click="completarUltrasonido"
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
const datosUltrasonido = ref({
  tipoEstudio: '',
  regionEstudiada: [],
  indicacion: '',
  tipoTransductor: 'convexo',
  frecuencia: '',
  ayuno: false,
  sedacion: false,
  rasurado: true,
  tipoSedacion: '',
  posicionPaciente: '',
  cardiovascular: {
    frecuenciaCardiaca: '',
    ritmo: 'regular',
    hallazgos: ''
  },
  hepatobiliar: {
    tamanoHigado: '',
    ecogenicidad: '',
    hallazgos: ''
  },
  urogenital: {
    tamanoRinones: '',
    ecogenicidadRenal: '',
    vejiga: '',
    hallazgos: ''
  },
  reproductivo: {
    utero: '',
    ovarios: '',
    gestacion: false,
    numeroFetos: '',
    hallazgos: ''
  },
  calidadEstudio: 'buena',
  hallazgosGenerales: '',
  diagnostico: '',
  recomendaciones: '',
  mediciones: [],
  archivos: [],
  observaciones: ''
})

// Opciones para selects
const tiposEstudio = [
  { label: 'Ultrasonido Abdominal', value: 'abdominal' },
  { label: 'Ecocardiografía', value: 'ecocardiografia' },
  { label: 'Ultrasonido Reproductivo', value: 'reproductivo' },
  { label: 'Ultrasonido Torácico', value: 'toracico' },
  { label: 'Ultrasonido Musculoesquelético', value: 'musculoesqueletico' },
  { label: 'Ultrasonido Oftálmico', value: 'oftalmico' },
  { label: 'Estudio Doppler', value: 'doppler' },
  { label: 'Otro', value: 'otro' }
]

const regionesAnatomicas = [
  { label: 'Hígado', value: 'higado' },
  { label: 'Vesícula Biliar', value: 'vesicula' },
  { label: 'Riñones', value: 'rinones' },
  { label: 'Vejiga', value: 'vejiga' },
  { label: 'Bazo', value: 'bazo' },
  { label: 'Páncreas', value: 'pancreas' },
  { label: 'Estómago', value: 'estomago' },
  { label: 'Intestinos', value: 'intestinos' },
  { label: 'Útero', value: 'utero' },
  { label: 'Ovarios', value: 'ovarios' },
  { label: 'Próstata', value: 'prostata' },
  { label: 'Corazón', value: 'corazon' },
  { label: 'Pulmones', value: 'pulmones' },
  { label: 'Glándulas Adrenales', value: 'adrenales' }
]

const indicacionesClinicas = [
  { label: 'Dolor Abdominal', value: 'dolor_abdominal' },
  { label: 'Vómitos/Diarrea', value: 'vomitos_diarrea' },
  { label: 'Distensión Abdominal', value: 'distension' },
  { label: 'Sospecha de Gestación', value: 'gestacion' },
  { label: 'Control Reproductivo', value: 'control_reproductivo' },
  { label: 'Soplo Cardíaco', value: 'soplo_cardiaco' },
  { label: 'Disnea', value: 'disnea' },
  { label: 'Alteraciones Urinarias', value: 'alteraciones_urinarias' },
  { label: 'Masa Palpable', value: 'masa_palpable' },
  { label: 'Seguimiento Post-quirúrgico', value: 'seguimiento' },
  { label: 'Otra', value: 'otra' }
]

const tiposTransductor = [
  { label: 'Convexo (2-5 MHz)', value: 'convexo' },
  { label: 'Lineal (5-10 MHz)', value: 'lineal' },
  { label: 'Sectorial (2-8 MHz)', value: 'sectorial' },
  { label: 'Microconvexo (5-8 MHz)', value: 'microconvexo' },
  { label: 'Endocavitario', value: 'endocavitario' }
]

const ritmosCardiacos = [
  'Regular', 'Irregular', 'Bradicardia', 'Taquicardia', 'Arritmia'
]

const calidadEstudioOpciones = [
  { label: 'Excelente', value: 'excelente' },
  { label: 'Buena', value: 'buena' },
  { label: 'Regular', value: 'regular' },
  { label: 'Limitada', value: 'limitada' }
]

// Computed
const formularioValido = computed(() => {
  return datosUltrasonido.value.tipoEstudio && 
         datosUltrasonido.value.regionEstudiada.length > 0 && 
         datosUltrasonido.value.indicacion &&
         datosUltrasonido.value.hallazgosGenerales &&
         datosUltrasonido.value.diagnostico
})

const incluirSistema = (sistema) => {
  const regiones = datosUltrasonido.value.regionEstudiada
  
  switch(sistema) {
    case 'cardiovascular':
      return regiones.includes('corazon') || datosUltrasonido.value.tipoEstudio === 'ecocardiografia'
    case 'hepatobiliar':
      return regiones.includes('higado') || regiones.includes('vesicula')
    case 'urogenital':
      return regiones.includes('rinones') || regiones.includes('vejiga')
    case 'reproductivo':
      return regiones.includes('utero') || regiones.includes('ovarios') || regiones.includes('prostata') || 
             datosUltrasonido.value.tipoEstudio === 'reproductivo'
    default:
      return false
  }
}

// Métodos
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeFile = (index) => {
  datosUltrasonido.value.archivos.splice(index, 1)
}

const onRejected = (rejectedEntries) => {
  $q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} archivo(s) no cumplieron con los criterios de selección`
  })
}

const agregarMedicion = () => {
  datosUltrasonido.value.mediciones.push({
    estructura: '',
    dimension: '',
    valor: ''
  })
}

const eliminarMedicion = (index) => {
  datosUltrasonido.value.mediciones.splice(index, 1)
}

const guardarDatos = () => {
  if (formularioValido.value) {
    emit('servicio-actualizado', props.servicioId, datosUltrasonido.value)
  }
}

const completarUltrasonido = () => {
  if (formularioValido.value) {
    emit('servicio-completado', props.servicioId, {
      ...datosUltrasonido.value,
      fechaRealizacion: new Date().toISOString(),
      realizadoPor: 'Dr. Usuario Actual' // Obtener del contexto
    })
  }
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

// Watchers
watch(datosUltrasonido, guardarDatos, { deep: true })
</script>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>
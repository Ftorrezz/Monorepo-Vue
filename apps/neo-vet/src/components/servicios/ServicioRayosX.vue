<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-indigo-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-indigo-2 q-mr-md flex flex-center br-lg">
          <q-icon name="medical_information" color="indigo-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-indigo-10">Rayos X</div>
          <div class="text-caption text-indigo-7 opacity-80">Estudio radiográfico y diagnóstico por imagen</div>
        </div>
        
        <div class="row items-center q-gutter-xs">
          <!-- Botón Edición (Solo modo lectura) -->
          <q-btn 
            v-if="modoLectura && !modoEdicionManual"
            flat dense round 
            color="indigo-7" 
            icon="edit" 
            size="sm" 
            @click="modoEdicionManual = true"
          >
            <q-tooltip>Habilitar Edición</q-tooltip>
          </q-btn>
          
          <q-btn 
            v-if="modoEdicionManual"
            flat dense round 
            color="grey-7" 
            icon="close" 
            size="sm" 
            @click="cancelarEdicion"
          >
            <q-tooltip>Cancelar Edición</q-tooltip>
          </q-btn>

          <q-btn-dropdown flat round icon="more_vert" color="indigo-7" dropdown-icon="none">
            <q-list dense style="min-width: 200px" class="br-md">
              <q-item clickable @click="imprimirReporte('especial')">
                <q-item-section avatar><q-icon name="print" color="indigo" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Imprimir Reporte</q-item-section>
              </q-item>

              <q-item clickable @click="firmarDocumento('especial')">
                <q-item-section avatar><q-icon name="history_edu" color="orange-8" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Visualizar y Firmar</q-item-section>
              </q-item>

              <q-separator v-if="plantillasServicio && plantillasServicio.length > 0" />
              
              <q-item v-if="plantillasServicio && plantillasServicio.length > 0" clickable>
                <q-item-section avatar><q-icon name="description" color="secondary" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Imprimir Plantilla</q-item-section>
                <q-item-section side><q-icon name="chevron_right" /></q-item-section>
                
                <q-menu anchor="top end" self="top start">
                  <q-list style="min-width: 200px">
                    <q-item v-for="p in plantillasServicio" :key="p.id_plantilla" clickable v-close-popup @click="imprimirReporte('plantilla', p.id_plantilla)">
                      <q-item-section avatar><q-icon name="description" color="secondary" size="xs" /></q-item-section>
                      <q-item-section>{{ p.nombre_plantilla }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>

              <q-separator />
              <q-item clickable @click="completarRayosX" class="text-positive" :disable="!formularioValido">
                <q-item-section avatar><q-icon name="check_circle" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Finalizar Estudio</q-item-section>
              </q-item>

              <q-item clickable @click="eliminarServicio" class="text-negative">
                <q-item-section avatar><q-icon name="delete" color="negative" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Eliminar Servicio</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-lg">
      <div class="row q-col-gutter-lg">
        <!-- Información básica -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosRayosX.tipoEstudio"
            :options="tiposEstudio"
            label="Tipo de Estudio *"
            outlined dense
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosRayosX.regionAnatomica"
            :options="regionesAnatomicas"
            label="Región Anatómica *"
            outlined dense
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-6">
          <q-select
            v-model="datosRayosX.posicion"
            :options="posiciones"
            label="Posición *"
            outlined dense
            multiple
            use-chips
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-3">
          <q-input
            v-model="datosRayosX.numeroPlacas"
            label="Número de Placas *"
            outlined dense
            type="number"
            min="1"
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        
        <div class="col-12 col-md-3">
          <q-select
            v-model="datosRayosX.contraste"
            :options="opcionesContraste"
            label="Contraste"
            outlined dense
            class="br-md"
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <div class="col-12">
          <div class="row items-center q-mb-sm">
            <q-icon name="settings" color="grey-7" size="18px" class="q-mr-sm" />
            <div class="text-weight-bold text-grey-8 uppercase letter-spacing-1" style="font-size: 11px;">Parámetros Técnicos</div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6 col-md-3">
              <q-input v-model="datosRayosX.kv" label="kV" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model="datosRayosX.mas" label="mAs" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model="datosRayosX.tiempo" label="Tiempo (s)" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model="datosRayosX.distancia" label="Distancia (cm)" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
            </div>
          </div>
        </div>

        <div class="col-12">
          <q-input
            v-model="datosRayosX.hallazgos"
            label="Hallazgos Radiográficos *"
            outlined
            type="textarea"
            rows="3"
            class="br-md"
            placeholder="Describa los hallazgos observados..."
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="datosRayosX.interpretacion"
            label="Interpretación y Diagnóstico *"
            outlined
            type="textarea"
            rows="3"
            class="br-md bg-indigo-0"
            placeholder="Conclusión diagnóstica..."
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <div class="col-12">
          <q-file
            v-if="!modoLectura || modoEdicionManual"
            v-model="nuevosArchivos"
            label="Adjuntar Imágenes Radiográficas"
            outlined dense
            multiple
            use-chips
            class="br-md"
            accept=".jpg,.jpeg,.png,.pdf"
            @update:model-value="alAdjuntarArchivos"
          >
            <template v-slot:prepend><q-icon name="cloud_upload" color="primary" /></template>
          </q-file>

          <div v-if="datosRayosX.archivos_adjuntos?.length > 0" class="q-mt-md">
             <div class="text-caption text-weight-bold q-mb-sm">Archivos Adjuntos ({{ datosRayosX.archivos_adjuntos.length }})</div>
             <div class="row q-col-gutter-sm">
                <div v-for="(file, idx) in datosRayosX.archivos_adjuntos" :key="idx" class="col-auto">
                   <q-chip
                    removable
                    @remove="eliminarAdjunto(idx)"
                    color="grey-2"
                    text-color="grey-9"
                    class="br-md"
                    icon="image"
                    :disable="modoLectura && !modoEdicionManual"
                   >
                     {{ file.name || 'Archivo ' + (idx+1) }}
                   </q-chip>
                </div>
             </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Footer de acciones -->
    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn 
          v-if="modoEdicionManual"
          flat 
          color="grey-7" 
          label="Descartar" 
          @click="cancelarEdicion" 
          no-caps 
        />
        <q-btn 
          color="indigo-8" 
          icon="check" 
          :label="modoEdicionManual ? 'Guardar Cambios' : 'Completar y Guardar'" 
          @click="completarRayosX" 
          :disable="!formularioValido || procesando"
          :loading="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  modoLectura: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: () => ({}) },
  plantillasServicio: { type: Array, default: () => [] }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio', 'firmar-servicio'])
const $q = useQuasar()

const procesando = ref(false)
const modoEdicionManual = ref(false)
const nuevosArchivos = ref(null)

const datosRayosX = ref({
  tipoEstudio: null,
  regionAnatomica: null,
  posicion: [],
  numeroPlacas: 1,
  contraste: 'sin_contraste',
  kv: '',
  mas: '',
  tiempo: '',
  distancia: '100',
  hallazgos: '',
  interpretacion: '',
  archivos_adjuntos: []
})

const tiposEstudio = [
  { label: 'Radiografía Simple', value: 'simple' },
  { label: 'Radiografía con Contraste', value: 'contraste' },
  { label: 'Otro', value: 'otro' }
]

const regionesAnatomicas = [
  { label: 'Tórax', value: 'torax' },
  { label: 'Abdomen', value: 'abdomen' },
  { label: 'Pelvis', value: 'pelvis' },
  { label: 'Cráneo', value: 'craneo' },
  { label: 'Extremidades', value: 'extremidades' },
  { label: 'Columna', value: 'columna' }
]

const posiciones = [
  { label: 'VD (Ventro-Dorsal)', value: 'vd' },
  { label: 'DV (Dorso-Ventral)', value: 'dv' },
  { label: 'LL (Latero-Lateral)', value: 'll' },
  { label: 'Oblicua', value: 'ob' }
]

const opcionesContraste = [
  { label: 'Sin Contraste', value: 'sin_contraste' },
  { label: 'Bario', value: 'bario' },
  { label: 'Yodo', value: 'yodo' }
]

const formularioValido = computed(() => {
  return datosRayosX.value.tipoEstudio && 
         datosRayosX.value.regionAnatomica && 
         datosRayosX.value.hallazgos && 
         datosRayosX.value.interpretacion
})

const alAdjuntarArchivos = (files) => {
  if (!files) return
  // Aquí iría la lógica de subida real, por ahora simulamos
  files.forEach(f => {
    datosRayosX.value.archivos_adjuntos.push({
      name: f.name,
      size: f.size,
      type: f.type,
      ultimoUpdate: new Date().toISOString()
    })
  })
  nuevosArchivos.value = null
  guardarCambiosSilenciosos()
}

const eliminarAdjunto = (idx) => {
  datosRayosX.value.archivos_adjuntos.splice(idx, 1)
  guardarCambiosSilenciosos()
}

const guardarCambiosSilenciosos = () => {
  if (!props.modoLectura || modoEdicionManual.value) {
    emit('servicio-actualizado', props.servicioId, { ...datosRayosX.value })
  }
}

const completarRayosX = async () => {
  if (!formularioValido.value) return
  procesando.value = true
  try {
    emit('servicio-completado', props.servicioId, { ...datosRayosX.value })
    modoEdicionManual.value = false
  } finally {
    procesando.value = false
  }
}

const cancelarEdicion = () => {
  if (props.datosIniciales) {
    datosRayosX.value = JSON.parse(JSON.stringify(props.datosIniciales))
  }
  modoEdicionManual.value = false
}

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosRayosX.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosRayosX.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({
    title: 'Eliminar Servicio',
    message: '¿Estás seguro de eliminar este estudio de Rayos X?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosRayosX.value = { ...datosRayosX.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
  }
})

watch(() => datosRayosX.value, () => {
  if (!props.modoLectura || modoEdicionManual.value) {
    // Debounce opcional aquí
  }
}, { deep: true })
</script>

<style scoped>
.service-icon-wrap {
  width: 44px;
  height: 44px;
}
.br-xl { border-radius: 20px; }
.br-lg { border-radius: 12px; }
.br-md { border-radius: 8px; }
.border-top { border-top: 1px solid rgba(0,0,0,0.05); }
.letter-spacing-1 { letter-spacing: 1px; }
</style>

<style scoped>
.servicio-card {
  margin-bottom: 16px;
}
</style>
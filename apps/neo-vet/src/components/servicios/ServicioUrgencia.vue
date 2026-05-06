<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-red-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-red-2 q-mr-md flex flex-center br-lg">
          <q-icon name="emergency" color="red-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-red-10">Urgencia Veterinaria</div>
          <div class="text-caption text-red-7 opacity-80">
            {{ datosUrgencia.estado === 'atendiendo' ? 'En atención de urgencia' : 
               datosUrgencia.estado === 'completada' ? 'Urgencia resuelta' : 'Urgencia pendiente' }}
          </div>
        </div>
        
        <div class="row items-center q-gutter-xs">
          <q-btn 
            v-if="modoLectura && !modoEdicionManual"
            flat dense round 
            color="red-7" 
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

          <q-btn-dropdown flat round icon="more_vert" color="red-7" dropdown-icon="none">
            <q-list dense style="min-width: 200px" class="br-md">
              <q-item clickable @click="imprimirReporte('especial')">
                <q-item-section avatar><q-icon name="print" color="red" size="20px" /></q-item-section>
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
              <q-item v-if="datosUrgencia.estado === 'pendiente'" clickable @click="iniciarAtencion" class="text-positive" :disable="!formularioValido">
                <q-item-section avatar><q-icon name="play_arrow" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Iniciar Atención</q-item-section>
              </q-item>

              <q-item v-if="datosUrgencia.estado === 'atendiendo'" clickable @click="agregarProcedimiento" class="text-primary">
                <q-item-section avatar><q-icon name="add" color="primary" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Agregar Procedimiento</q-item-section>
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
        <div class="col-12 col-md-8">
          <q-input
            v-model="datosUrgencia.descripcionUrgencia"
            label="Descripción de la Urgencia *"
            outlined dense
            type="textarea"
            rows="3"
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosUrgencia.estado === 'completada'"
          />
        </div>
        
        <div class="col-12 col-md-4">
          <q-select
            v-model="datosUrgencia.nivelUrgencia"
            :options="nivelesUrgencia"
            label="Triage / Nivel *"
            outlined dense
            class="br-md q-mb-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosUrgencia.estado === 'completada'"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar><q-icon :name="scope.opt.icon" :color="scope.opt.color"/></q-item-section>
                <q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label></q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            v-model="datosUrgencia.tipoUrgencia"
            :options="tiposUrgencia"
            label="Tipo"
            outlined dense
            class="br-md"
            :readonly="(modoLectura && !modoEdicionManual) || datosUrgencia.estado === 'completada'"
          />
        </div>

        <div class="col-12">
           <q-separator class="q-my-md opacity-20" />
           <div class="text-subtitle2 text-grey-8 q-mb-md">Triaje Inicial / Signos</div>
           <div class="row q-col-gutter-md">
              <div class="col-6 col-md-3">
                <q-input v-model="datosUrgencia.signosVitales.temperatura" label="T° (°C)" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="datosUrgencia.signosVitales.pulso" label="Pulso (lpm)" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
              <div class="col-6 col-md-3">
                <q-input v-model="datosUrgencia.signosVitales.respiracion" label="Resp (rpm)" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
              <div class="col-6 col-md-3">
                <q-select v-model="datosUrgencia.signosVitales.estadoConciencia" :options="['Alerta', 'Deprimido', 'Estupor', 'Coma']" label="Conciencia" outlined dense class="br-md" :readonly="modoLectura && !modoEdicionManual" />
              </div>
           </div>
        </div>

        <div v-if="datosUrgencia.procedimientos.length > 0" class="col-12">
          <q-separator class="q-my-md opacity-20" />
          <div class="text-subtitle2 text-grey-8 q-mb-md">Línea de Tiempo de Atención</div>
          <q-timeline color="red" layout="comfortable" dense>
            <q-timeline-entry
              v-for="(proc, index) in datosUrgencia.procedimientos"
              :key="index"
              :color="getProcedimientoColor(proc.tipo)"
              icon="healing"
              :subtitle="formatDateTime(proc.fecha)"
            >
              <div class="row items-center justify-between">
                 <div class="text-weight-bold text-grey-9">{{ proc.nombre }}</div>
                 <q-btn v-if="!modoLectura || modoEdicionManual" flat dense round color="grey-6" icon="edit" size="xs" @click="editarProcedimiento(index)" />
              </div>
              <div class="text-body2 text-grey-7 q-mt-xs">{{ proc.descripcion }}</div>
              <div v-if="proc.medicamentos" class="text-caption text-blue-7 q-mt-xs">Med: {{ proc.medicamentos }}</div>
            </q-timeline-entry>
          </q-timeline>
        </div>
      </div>
    </q-card-section>
    
    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn v-if="modoEdicionManual" flat color="grey-7" label="Descartar" @click="cancelarEdicion" no-caps />
        
        <q-btn 
          v-if="datosUrgencia.estado === 'pendiente'"
          color="positive" 
          icon="play_arrow" 
          label="Iniciar Atención" 
          @click="iniciarAtencion" 
          :disable="!formularioValido || procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="datosUrgencia.estado === 'atendiendo'"
          color="primary" 
          icon="check_circle" 
          label="Finalizar Atención" 
          @click="finalizarAtencion" 
          :disable="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />

        <q-btn 
          v-if="modoEdicionManual"
          color="red-8" 
          icon="save" 
          label="Guardar Cambios" 
          @click="guardarLocal" 
          :disable="!formularioValido"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />
      </div>
    </q-card-section>
  </q-card>

  <!-- Modales Dinámicos -->
  <q-dialog v-model="mostrarModalProcedimiento" persistent>
    <q-card style="min-width: 500px" class="br-xl">
       <q-card-section class="bg-red text-white"><div class="text-h6">{{ procedimientoEditando !== null ? 'Editar' : 'Nuevo' }} Procedimiento</div></q-card-section>
       <q-card-section class="q-pa-lg row q-col-gutter-md">
          <div class="col-12"><q-input v-model="procedimientoTemporal.nombre" label="Nombre *" outlined dense class="br-md" /></div>
          <div class="col-12"><q-input v-model="procedimientoTemporal.descripcion" label="Descripción" outlined dense type="textarea" rows="2" class="br-md" /></div>
          <div class="col-12"><q-input v-model="procedimientoTemporal.medicamentos" label="Medicamentos" outlined dense class="br-md" /></div>
          <div class="col-12"><q-input v-model="procedimientoTemporal.fecha" label="Fecha/Hora" outlined dense type="datetime-local" class="br-md" /></div>
       </q-card-section>
       <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn color="red" label="Guardar" @click="guardarProcedimiento" class="br-lg px-lg" no-caps />
       </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarModalFinalizacion" persistent>
    <q-card style="min-width: 400px" class="br-xl">
       <q-card-section class="bg-positive text-white"><div class="text-h6">Finalizar Urgencia</div></q-card-section>
       <q-card-section class="q-pa-lg">
          <q-select v-model="finalizacionTemporal.resultado" :options="['Estabilizado', 'Hospitalización', 'Defunción']" label="Resultado" outlined dense class="br-md q-mb-md" />
          <q-input v-model="finalizacionTemporal.diagnosticoFinal" label="Diagnóstico Final" outlined type="textarea" rows="2" class="br-md q-mb-md" />
          <q-input v-model="finalizacionTemporal.tratamiento" label="Tratamiento / Alta" outlined type="textarea" rows="3" class="br-md" />
       </q-card-section>
       <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn color="positive" label="Cerrar Urgencia" @click="confirmarFinalizacion" class="br-lg px-lg" no-caps />
       </q-card-actions>
    </q-card>
  </q-dialog>
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
const mostrarModalProcedimiento = ref(false)
const mostrarModalFinalizacion = ref(false)
const procedimientoEditando = ref(null)

const datosUrgencia = ref({
  estado: 'pendiente', descripcionUrgencia: '', nivelUrgencia: 'media', tipoUrgencia: 'Traumatismo', fechaInicio: '', signosVitales: { temperatura: '', pulso: '', respiracion: '', estadoConciencia: 'Alerta' }, procedimientos: []
})

const procedimientoTemporal = ref({ nombre: '', descripcion: '', medicamentos: '', fecha: '' })
const finalizacionTemporal = ref({ resultado: 'Estabilizado', diagnosticoFinal: '', tratamiento: '' })

const nivelesUrgencia = [
  { label: 'Crítica', value: 'critica', color: 'red', icon: 'priority_high' },
  { label: 'Alta', value: 'alta', color: 'orange', icon: 'warning' },
  { label: 'Media', value: 'media', color: 'amber', icon: 'info' },
  { label: 'Baja', value: 'baja', color: 'green', icon: 'check_circle' }
]

const tiposUrgencia = ['Traumatismo', 'Intoxicación', 'Respiratoria', 'Digestiva', 'Neuro', 'Shock']

const formularioValido = computed(() => datosUrgencia.value.descripcionUrgencia && datosUrgencia.value.nivelUrgencia)

const iniciarAtencion = () => {
  datosUrgencia.value.estado = 'atendiendo'
  datosUrgencia.value.fechaInicio = new Date().toISOString()
  datosUrgencia.value.procedimientos.push({
    nombre: 'Inicio de Triage', descripcion: 'Evaluación primaria realizada', fecha: new Date().toISOString()
  })
  guardarLocal()
}

const agregarProcedimiento = () => {
  procedimientoTemporal.value = { nombre: '', descripcion: '', medicamentos: '', fecha: new Date().toISOString().slice(0, 16) }
  procedimientoEditando.value = null
  mostrarModalProcedimiento.value = true
}

const editarProcedimiento = (idx) => {
  procedimientoEditando.value = idx
  procedimientoTemporal.value = JSON.parse(JSON.stringify(datosUrgencia.value.procedimientos[idx]))
  mostrarModalProcedimiento.value = true
}

const guardarProcedimiento = () => {
  if (procedimientoEditando.value !== null) {
    datosUrgencia.value.procedimientos[procedimientoEditando.value] = { ...procedimientoTemporal.value }
  } else {
    datosUrgencia.value.procedimientos.unshift({ ...procedimientoTemporal.value })
  }
  mostrarModalProcedimiento.value = false
  guardarLocal()
}

const finalizarAtencion = () => { mostrarModalFinalizacion.value = true }

const confirmarFinalizacion = () => {
  datosUrgencia.value.estado = 'completada'
  emit('servicio-completado', props.servicioId, { ...datosUrgencia.value, ...finalizacionTemporal.value })
  mostrarModalFinalizacion.value = false
}

const formatDateTime = (iso) => iso ? new Date(iso).toLocaleString() : ''
const getProcedimientoColor = (tipo) => 'red-7'

const cancelarEdicion = () => {
  if (props.datosIniciales) { datosUrgencia.value = JSON.parse(JSON.stringify(props.datosIniciales)) }
  modoEdicionManual.value = false
}

const guardarLocal = () => { emit('servicio-actualizado', props.servicioId, { ...datosUrgencia.value }) }

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosUrgencia.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosUrgencia.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({ title: 'Eliminar', message: '¿Eliminar urgencia?', cancel: true }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosUrgencia.value = { ...datosUrgencia.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
  }
})
</script>

<style scoped>
.service-icon-wrap { width: 44px; height: 44px; }
.br-xl { border-radius: 20px; }
.br-lg { border-radius: 12px; }
.br-md { border-radius: 8px; }
.border-top { border-top: 1px solid rgba(0,0,0,0.05); }
</style>
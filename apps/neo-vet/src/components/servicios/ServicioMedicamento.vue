<template>
  <q-card class="servicio-card overflow-hidden br-xl shadow-2">
    <q-card-section class="bg-teal-1 q-pa-md">
      <div class="row items-center no-wrap">
        <div class="service-icon-wrap bg-teal-2 q-mr-md flex flex-center br-lg">
          <q-icon name="medication" color="teal-8" size="24px" />
        </div>
        <div class="col">
          <div class="text-subtitle1 text-weight-bolder text-teal-10">Administración de Medicamentos</div>
          <div class="text-caption text-teal-7 opacity-80">
            {{ datosMedicamentos.prescripciones.length }} prescripciones • {{ estadisticas.pendientes }} pendientes
          </div>
        </div>
        
        <div class="row items-center q-gutter-xs">
          <q-btn 
            v-if="modoLectura && !modoEdicionManual"
            flat dense round 
            color="teal-7" 
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

          <q-btn-dropdown flat round icon="more_vert" color="teal-7" dropdown-icon="none">
            <q-list dense style="min-width: 200px" class="br-md">
              <q-item clickable @click="imprimirReporte('especial')">
                <q-item-section avatar><q-icon name="print" color="teal" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Imprimir Reporte</q-item-section>
              </q-item>

              <q-item clickable @click="firmarDocumento('especial')">
                <q-item-section avatar><q-icon name="history_edu" color="orange-8" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Visualizar y Firmar</q-item-section>
              </q-item>

              <q-separator />
              <q-item clickable @click="agregarPrescripcion" v-if="!modoLectura || modoEdicionManual">
                <q-item-section avatar><q-icon name="add_circle" color="positive" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Nueva Prescripción</q-item-section>
              </q-item>

              <q-item clickable @click="verHistorial">
                <q-item-section avatar><q-icon name="history" color="blue" size="20px" /></q-item-section>
                <q-item-section class="text-weight-medium">Ver Historial</q-item-section>
              </q-item>

              <q-separator />
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
      <div v-if="datosMedicamentos.prescripciones.length === 0" class="text-center q-pa-xl">
        <q-icon name="medication" size="64px" color="grey-3" />
        <div class="text-body1 text-grey-6 q-mt-md">No hay prescripciones activas</div>
        <q-btn v-if="!modoLectura || modoEdicionManual" color="teal-8" label="Agregar Primera Prescripción" @click="agregarPrescripcion" class="q-mt-lg br-lg" no-caps />
      </div>

      <div v-else class="row q-col-gutter-md">
        <div 
          v-for="(prescripcion, index) in datosMedicamentos.prescripciones" 
          :key="prescripcion.id"
          class="col-12 col-md-6"
        >
          <q-card flat bordered class="br-lg overflow-hidden">
             <q-item class="bg-teal-0 q-py-sm">
                <q-item-section avatar>
                   <q-avatar color="white" text-color="teal-8" icon="vaccines" size="40px" class="shadow-1" />
                </q-item-section>
                <q-item-section>
                   <q-item-label class="text-weight-bold">{{ prescripcion.medicamento }}</q-item-label>
                   <q-item-label caption>{{ prescripcion.dosificacion }} • {{ prescripcion.frecuencia }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                   <q-chip dense :color="getEstadoColor(prescripcion.estado)" text-color="white" size="xs">{{ prescripcion.estado }}</q-chip>
                </q-item-section>
             </q-item>
             
             <q-card-section class="q-pa-md">
                <div class="row q-gutter-xs q-mb-sm">
                   <q-badge outline color="blue-7" :label="prescripcion.viaAdministracion" />
                   <q-badge outline color="purple-7" :label="prescripcion.duracionTratamiento" />
                </div>
                <div v-if="prescripcion.indicaciones" class="text-caption text-grey-7 italic">
                   "{{ prescripcion.indicaciones }}"
                </div>

                <div v-if="prescripcion.administraciones?.length > 0" class="q-mt-md pt-border">
                   <div class="text-overline text-grey-5">Última dosis</div>
                   <div class="row items-center justify-between">
                      <div class="text-caption text-weight-medium">{{ formatDateTime(prescripcion.administraciones[prescripcion.administraciones.length-1].fechaAdministracion) }}</div>
                      <q-icon name="check_circle" color="positive" size="xs" />
                   </div>
                </div>
             </q-card-section>

             <q-card-actions v-if="!modoLectura || modoEdicionManual" align="right" class="border-top-dashed q-px-md">
                <q-btn flat dense color="grey-7" icon="edit" @click="editarPrescripcion(index)" size="sm" />
                <q-btn flat dense color="positive" label="Administrar Ahora" @click="administrarAhora(prescripcion.id)" size="sm" no-caps />
             </q-card-actions>
          </q-card>
        </div>
      </div>

      <div class="col-12 q-mt-lg">
        <q-separator class="q-my-md opacity-20"/>
        <q-input
          v-model="datosMedicamentos.observaciones"
          label="Observaciones del Plan"
          outlined
          type="textarea"
          rows="2"
          class="br-md"
          :readonly="modoLectura && !modoEdicionManual"
        />
      </div>
    </q-card-section>
    
    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 q-pa-md border-top">
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn v-if="modoEdicionManual" flat color="grey-7" label="Descartar" @click="cancelarEdicion" no-caps />
        <q-btn 
          color="teal-8" 
          icon="check" 
          :label="modoEdicionManual ? 'Guardar Cambios' : 'Completar Plan'" 
          @click="completarServicio" 
          :disable="procesando"
          class="br-lg q-px-lg shadow-1"
          no-caps
        />
      </div>
    </q-card-section>
  </q-card>

  <!-- Modales Dinámicos -->
  <q-dialog v-model="mostrarModalPrescripcion" persistent>
    <q-card style="min-width: 500px" class="br-xl">
       <q-card-section class="bg-teal text-white"><div class="text-h6">{{ prescripcionEditando !== null ? 'Editar' : 'Nueva' }} Prescripción</div></q-card-section>
       <q-card-section class="q-pa-lg row q-col-gutter-md">
          <div class="col-12">
            <q-select v-model="prescripcionTemporal.producto" :options="productosMedicamento" label="Buscar en Inventario" outlined dense class="br-md" use-input @filter="buscarMedicamentos" @update:model-value="alSeleccionarProducto" />
          </div>
          <div class="col-12"><q-input v-model="prescripcionTemporal.medicamento" label="Medicamento *" outlined dense class="br-md" /></div>
          <div class="col-6"><q-input v-model="prescripcionTemporal.dosificacion" label="Dosificación *" outlined dense class="br-md" /></div>
          <div class="col-6"><q-select v-model="prescripcionTemporal.frecuencia" :options="frecuenciasLabel" label="Frecuencia *" outlined dense class="br-md" /></div>
          <div class="col-6"><q-select v-model="prescripcionTemporal.viaAdministracion" :options="viasLabel" label="Vía *" outlined dense class="br-md" /></div>
          <div class="col-6"><q-input v-model="prescripcionTemporal.duracionTratamiento" label="Duración *" outlined dense class="br-md" /></div>
          <div class="col-12"><q-input v-model="prescripcionTemporal.indicaciones" label="Indicaciones" outlined dense type="textarea" rows="2" class="br-md" /></div>
       </q-card-section>
       <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn color="teal" label="Guardar" @click="guardarPrescripcion" class="br-lg px-lg" no-caps />
       </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarModalAdministracion" persistent>
    <q-card style="min-width: 400px" class="br-xl">
       <q-card-section class="bg-positive text-white"><div class="text-h6">Administrar Medicamento</div></q-card-section>
       <q-card-section class="q-pa-lg row q-col-gutter-md">
          <div class="col-12 text-subtitle1 text-weight-bold text-teal-9">{{ administracionTemporal.medicamento }}</div>
          <div class="col-12">
            <q-select v-model="administracionTemporal.lote" :options="lotesDisponibles" label="Seleccionar Lote" outlined dense class="br-md" option-label="numeroLote" />
          </div>
          <div class="col-12"><q-input v-model="administracionTemporal.fechaAdministracion" label="Fecha/Hora" outlined dense type="datetime-local" class="br-md" /></div>
          <div class="col-12"><q-input v-model="administracionTemporal.observaciones" label="Notas de administración" outlined dense type="textarea" rows="2" class="br-md" /></div>
       </q-card-section>
       <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup no-caps />
          <q-btn color="positive" label="Confirmar" @click="confirmarAdministracion" class="br-lg px-lg" no-caps />
       </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarModalHistorial" maximized>
    <q-card>
      <q-card-section class="bg-teal text-white row items-center">
        <div class="text-h6">Historial Completo</div>
        <q-space />
        <q-btn flat round icon="close" v-close-popup />
      </q-card-section>
      <q-card-section class="q-pa-md">
        <q-table :rows="historialCompleto" :columns="columnasHistorial" row-key="id" flat bordered class="br-lg" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import inventarioService from 'src/services/inventario.service'

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  modoLectura: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: () => ({}) },
  plantillasServicio: { type: Array, default: () => [] },
  relacionadoCon: { type: Object, default: () => null }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio', 'firmar-servicio', 'evento-creado'])
const $q = useQuasar()

const procesando = ref(false)
const modoEdicionManual = ref(false)
const mostrarModalPrescripcion = ref(false)
const mostrarModalAdministracion = ref(false)
const mostrarModalHistorial = ref(false)
const prescripcionEditando = ref(null)

const datosMedicamentos = ref({
  prescripciones: [],
  observaciones: ''
})

const prescripcionTemporal = ref({
  medicamento: '', dosificacion: '', frecuencia: '', viaAdministracion: '', duracionTratamiento: '', indicaciones: '', estado: 'activa', administraciones: []
})

const administracionTemporal = ref({
  prescripcionId: '', medicamento: '', fechaAdministracion: new Date().toISOString().slice(0, 16), observaciones: '', lote: null
})

const productosMedicamento = ref([])
const lotesDisponibles = ref([])

const frecuenciasLabel = ['Cada 4h', 'Cada 6h', 'Cada 8h', 'Cada 12h', 'Diaria', 'BID', 'TID', 'PRN']
const viasLabel = ['Oral', 'IM', 'IV', 'SC', 'Tópica', 'Ocular']

const estadisticas = computed(() => ({
  pendientes: datosMedicamentos.value.prescripciones.length // Simplificado
}))

const buscarMedicamentos = async (val, update) => {
  if (val.length < 2) return
  try {
    const res = await inventarioService.productos.search(val)
    update(() => { productosMedicamento.value = res.data.map(p => ({ label: p.nombre, value: p.id, ...p })) })
  } catch (error) { console.error(error) }
}

const alSeleccionarProducto = (p) => {
  if (!p) return
  prescripcionTemporal.value.medicamento = p.nombre
  prescripcionTemporal.value.productoId = p.id
}

const agregarPrescripcion = () => {
  prescripcionTemporal.value = { medicamento: '', dosificacion: '', frecuencia: 'BID', viaAdministracion: 'Oral', duracionTratamiento: '7 días', indicaciones: '', estado: 'activa', administraciones: [] }
  prescripcionEditando.value = null
  mostrarModalPrescripcion.value = true
}

const editarPrescripcion = (idx) => {
  prescripcionEditando.value = idx
  prescripcionTemporal.value = JSON.parse(JSON.stringify(datosMedicamentos.value.prescripciones[idx]))
  mostrarModalPrescripcion.value = true
}

const guardarPrescripcion = () => {
  if (prescripcionEditando.value !== null) {
    datosMedicamentos.value.prescripciones[prescripcionEditando.value] = { ...prescripcionTemporal.value }
  } else {
    prescripcionTemporal.value.id = 'pres_' + Date.now()
    datosMedicamentos.value.prescripciones.push({ ...prescripcionTemporal.value })
  }
  mostrarModalPrescripcion.value = false
  guardarLocal()
}

const administrarAhora = async (pid) => {
  const p = datosMedicamentos.value.prescripciones.find(item => item.id === pid)
  if (!p) return
  
  if (p.productoId) {
    try {
      const res = await inventarioService.lotes.getByProducto(p.productoId)
      lotesDisponibles.value = res.data.filter(l => l.cantidadDisponible > 0)
    } catch (e) { console.error(e) }
  }

  administracionTemporal.value = {
    prescripcionId: pid,
    medicamento: p.medicamento,
    fechaAdministracion: new Date().toISOString().slice(0, 16),
    observaciones: '',
    lote: null
  }
  mostrarModalAdministracion.value = true
}

const confirmarAdministracion = () => {
  const p = datosMedicamentos.value.prescripciones.find(item => item.id === administracionTemporal.value.prescripcionId)
  if (p) {
    p.administraciones.push({ ...administracionTemporal.value })
    
    if (props.relacionadoCon?.tipo === 'hospitalizacion') {
      emit('evento-creado', {
        tipo: 'medicamento',
        titulo: 'Administrado: ' + p.medicamento,
        descripcion: 'Dosis administrada exitosamente',
        fecha: new Date().toISOString()
      })
    }
  }
  mostrarModalAdministracion.value = false
  guardarLocal()
}

const historialCompleto = computed(() => {
  const list = []
  datosMedicamentos.value.prescripciones.forEach(p => {
    p.administraciones.forEach(a => list.push({ ...a, medicamento: p.medicamento, id: Math.random() }))
  })
  return list
})

const columnasHistorial = [
  { name: 'medicamento', label: 'Medicamento', field: 'medicamento', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fechaAdministracion', align: 'left', format: v => formatDateTime(v) },
  { name: 'obs', label: 'Notas', field: 'observaciones', align: 'left' }
]

const getEstadoColor = (e) => (e === 'activa' ? 'positive' : e === 'suspendida' ? 'warning' : 'blue')

const formatDateTime = (iso) => iso ? new Date(iso).toLocaleString() : ''

const verHistorial = () => { mostrarModalHistorial.value = true }

const cancelarEdicion = () => {
  if (props.datosIniciales) { datosMedicamentos.value = JSON.parse(JSON.stringify(props.datosIniciales)) }
  modoEdicionManual.value = false
}

const guardarLocal = () => { emit('servicio-actualizado', props.servicioId, { ...datosMedicamentos.value }) }

const completarServicio = () => {
  emit('servicio-completado', props.servicioId, { ...datosMedicamentos.value })
  modoEdicionManual.value = false
}

const imprimirReporte = (tipo, idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, { ...datosMedicamentos.value }, tipo, idPlantilla)
}

const firmarDocumento = (tipo, idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, { ...datosMedicamentos.value }, tipo, idPlantilla)
}

const eliminarServicio = () => {
  $q.dialog({ title: 'Eliminar', message: '¿Eliminar plan de medicamentos?', cancel: true }).onOk(() => {
    emit('servicio-eliminado', props.servicioId)
  })
}

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    datosMedicamentos.value = { ...datosMedicamentos.value, ...JSON.parse(JSON.stringify(props.datosIniciales)) }
  }
})
</script>

<style scoped>
.service-icon-wrap { width: 44px; height: 44px; }
.br-xl { border-radius: 20px; }
.br-lg { border-radius: 12px; }
.br-md { border-radius: 8px; }
.border-top { border-top: 1px solid rgba(0,0,0,0.05); }
.bg-teal-0 { background: rgba(224, 242, 241, 0.4); }
.pt-border { border-top: 1px solid rgba(0,0,0,0.05); padding-top: 8px; }
.border-top-dashed { border-top: 1px dashed rgba(0,0,0,0.1); }
</style>
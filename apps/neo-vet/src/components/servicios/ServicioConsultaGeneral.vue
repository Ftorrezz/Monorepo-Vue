<template>
  <q-card class="servicio-card border-left-premium">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="medical_services" color="primary" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6 text-primary">Consulta General</div>
          <div class="text-caption text-grey-7">Registro clínico completo y receta médica</div>
        </div>
        <q-btn 
          v-if="modoLectura && !modoEdicionManual"
          flat dense round 
          color="primary" 
          icon="edit" 
          size="sm" 
          @click="modoEdicionManual = true"
          class="q-mr-sm"
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
          class="q-mr-sm"
        >
          <q-tooltip>Cancelar Edición</q-tooltip>
        </q-btn>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
        >
          <q-list>
            <q-item clickable @click="imprimirReceta('especial')">
              <q-item-section avatar>
                <q-icon name="print" color="primary"/>
              </q-item-section>
              <q-item-section>Imprimir Receta / Certificado</q-item-section>
            </q-item>

            <q-item clickable @click="firmarDocumento('especial')">
              <q-item-section avatar>
                <q-icon name="history_edu" color="orange-8"/>
              </q-item-section>
              <q-item-section>Visualizar y Firmar</q-item-section>
            </q-item>

            <q-item v-if="plantillasServicio && plantillasServicio.length > 0" clickable>
              <q-item-section avatar>
                <q-icon name="description" color="secondary"/>
              </q-item-section>
              <q-item-section>
                Otras Plantillas
                <q-tooltip>Selecciona una plantilla adicional</q-tooltip>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
              
              <q-menu anchor="top end" self="top start">
                <q-list style="min-width: 200px">
                  <q-item 
                    v-for="p in plantillasServicio" 
                    :key="p.id_plantilla" 
                    clickable 
                    v-close-popup
                    @click="imprimirReceta('plantilla', p.id_plantilla)"
                  >
                    <q-item-section avatar>
                      <q-icon name="description" color="secondary" size="xs" />
                    </q-item-section>
                    <q-item-section>{{ p.nombre_plantilla || 'Plantilla ' + p.id_plantilla }}</q-item-section>
                    <q-item-section side>
                      <div class="row items-center q-gutter-xs">
                        <q-btn flat round dense icon="print" size="xs" color="grey-7" @click.stop="imprimirReceta('plantilla', p.id_plantilla)" />
                        <q-btn flat round dense icon="history_edu" size="xs" color="orange-8" @click.stop="firmarDocumento('plantilla', p.id_plantilla)" />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-separator />
            <q-item clickable @click="completarConsulta" :disable="!formularioValido">
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive"/>
              </q-item-section>
              <q-item-section>Finalizar Consulta</q-item-section>
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
        <!-- Motivo de Consulta -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="atencionConsulta.id_motivo"
            :options="motivos"
            label="Motivo de Consulta (Categoría) *"
            outlined
            emit-value
            map-options
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="atencionConsulta.motivo_detallado"
            label="Motivo Detallado"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <!-- Anamnesis y Examen -->
        <div class="col-12">
          <q-input
            v-model="atencionConsulta.anamnesis"
            label="Anamnesis (Historia Actual)"
            type="textarea"
            rows="3"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
            placeholder="Antecedentes, inicio de síntomas, etc."
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="atencionConsulta.hallazgos_examen"
            label="Hallazgos del Examen Físico"
            type="textarea"
            rows="3"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>

        <!-- Diagnóstico y Tratamiento -->
        <div class="col-12">
          <q-separator class="q-my-sm" />
          <div class="text-subtitle2 q-mb-sm text-primary">Diagnóstico y Plan</div>
        </div>

        <div class="col-12 col-md-6">
          <q-select
            v-model="atencionConsulta.id_diagnostico"
            :options="diagnosticosOptions"
            label="Diagnóstico Presuntivo / Definitivo *"
            outlined
            emit-value
            map-options
            use-input
            @filter="filtrarDiagnosticos"
            :readonly="modoLectura && !modoEdicionManual"
            hint="Selecciona de la lista para estadísticas"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No se encontraron resultados</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="atencionConsulta.diagnostico_complemento"
            label="Complemento del Diagnóstico (Texto Libre)"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
            placeholder="Detalles adicionales, observaciones específicas..."
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="atencionConsulta.indicaciones_medicas"
            label="Indicaciones Médicas (Tratamiento)"
            type="textarea"
            rows="3"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
            placeholder="Indicaciones para el propietario..."
          />
        </div>


        <!-- Pronóstico y Seguimiento -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="atencionConsulta.pronostico"
            label="Pronóstico"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="atencionConsulta.proxima_cita"
            label="Próxima Cita Sugerida"
            type="date"
            outlined
            :readonly="modoLectura && !modoEdicionManual"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="!modoLectura || modoEdicionManual" class="bg-grey-1 text-right q-gutter-x-sm">
      <q-btn 
        v-if="modoEdicionManual"
        flat
        color="grey-7"
        label="Cancelar"
        @click="cancelarEdicion"
      />
      <q-btn 
        :color="modoEdicionManual ? 'orange' : 'primary'" 
        :icon="modoEdicionManual ? 'save' : 'save'" 
        :label="modoEdicionManual ? 'Guardar Cambios' : 'Completar y Guardar Consulta'" 
        @click="completarConsulta"
        :disable="!formularioValido"
      />
      <q-linear-progress 
        v-if="!formularioValido && (atencionConsulta.id_motivo || atencionConsulta.id_diagnostico)"
        indeterminate 
        color="warning" 
        size="2px"
        class="q-mt-sm"
      />
      <div v-if="!formularioValido" class="text-caption text-warning q-mt-sm">
        ⚠️ Completa: Motivo de Consulta y Diagnóstico (obligatorios)
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import useCatalogos from 'src/composables/useCatalogos'
import { Modulo, Tabla } from 'src/common/enums/configuracion.enum'

const { obtenerCatalogo } = useCatalogos()

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  plantillasServicio: { type: Array, default: () => [] },
  modoLectura: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: () => ({}) },
  motivos: { type: Array, default: () => [] }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio', 'firmar-servicio'])

const modoEdicionManual = ref(false)

const atencionConsulta = ref({
  id_motivo: null,
  motivo_detallado: '',
  anamnesis: '',
  hallazgos_examen: '',
  id_diagnostico: null,
  diagnostico_complemento: '',
  indicaciones_medicas: '',
  pronostico: '',
  proxima_cita: ''
})

const diagnosticosOptions = ref([])
const todosLosDiagnosticos = ref([])

const cargarDiagnosticos = async () => {
    try {
        const res = await obtenerCatalogo(Modulo.MASCOTA, Tabla.DIAGNOSTICO)
        todosLosDiagnosticos.value = res
        diagnosticosOptions.value = res
    } catch (error) {
        console.error('Error al cargar catálogo de diagnósticos:', error)
    }
}

const filtrarDiagnosticos = (val, update) => {
    update(() => {
        const needle = val.toLowerCase()
        diagnosticosOptions.value = todosLosDiagnosticos.value.filter(
            v => v.label.toLowerCase().indexOf(needle) > -1
        )
    })
}

const formularioValido = computed(() => {
  return atencionConsulta.value.id_motivo && atencionConsulta.value.id_diagnostico
})

const guardarCambios = () => {
  emit('servicio-actualizado', props.servicioId, atencionConsulta.value)
}

const completarConsulta = () => {
  if (formularioValido.value) {
    emit('servicio-completado', props.servicioId, {
      ...atencionConsulta.value,
      fecha_aplicacion: new Date().toISOString()
    })
    modoEdicionManual.value = false
  }
}

const cancelarEdicion = () => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    const datos = { ...props.datosIniciales }
    if (datos.id_motivo) datos.id_motivo = Number(datos.id_motivo)
    if (datos.id_diagnostico) datos.id_diagnostico = Number(datos.id_diagnostico)
    Object.assign(atencionConsulta.value, datos)
  } else {
    atencionConsulta.value = {
      id_motivo: null,
      motivo_detallado: '',
      anamnesis: '',
      hallazgos_examen: '',
      id_diagnostico: null,
      diagnostico_complemento: '',
      indicaciones_medicas: '',
      pronostico: '',
      proxima_cita: ''
    }
  }
  modoEdicionManual.value = false
}

const imprimirReceta = (tipo = 'especial', idPlantilla = null) => {
  emit('imprimir-servicio', props.servicioId, atencionConsulta.value, tipo, idPlantilla)
}

const firmarDocumento = (tipo = 'especial', idPlantilla = null) => {
  emit('firmar-servicio', props.servicioId, atencionConsulta.value, tipo, idPlantilla)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

watch(atencionConsulta, guardarCambios, { deep: true })

onMounted(async () => {
  await cargarDiagnosticos()
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    // Asegurar que los IDs sean números si vienen como strings (para q-select map-options)
    const datos = { ...props.datosIniciales }
    if (datos.id_motivo) datos.id_motivo = Number(datos.id_motivo)
    if (datos.id_diagnostico) datos.id_diagnostico = Number(datos.id_diagnostico)
    
    Object.assign(atencionConsulta.value, datos)
  }
})
</script>

<style scoped>
.servicio-card { margin-bottom: 20px; border-radius: 12px; }
.border-left-premium { border-left: 5px solid #1976d2; }
.bg-blue-1 { background: #ebf8ff; }
</style>

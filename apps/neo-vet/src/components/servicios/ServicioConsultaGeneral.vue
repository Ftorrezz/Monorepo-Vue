<template>
  <q-card class="servicio-card border-left-premium">
    <q-card-section class="bg-blue-1">
      <div class="row items-center">
        <q-icon name="medical_services" color="primary" size="md" class="q-mr-md"/>
        <div class="col">
          <div class="text-h6 text-primary">Consulta General</div>
          <div class="text-caption text-grey-7">Registro clínico completo y receta médica</div>
        </div>
        <q-btn-dropdown 
          flat round 
          icon="more_vert"
          :disable="modoLectura"
        >
          <q-list>
            <q-item clickable @click="imprimirReceta">
              <q-item-section avatar>
                <q-icon name="print" color="primary"/>
              </q-item-section>
              <q-item-section>Imprimir Receta / Certificado</q-item-section>
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
            :readonly="modoLectura"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="atencionConsulta.motivo_detallado"
            label="Motivo Detallado"
            outlined
            :readonly="modoLectura"
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
            :readonly="modoLectura"
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
            :readonly="modoLectura"
          />
        </div>

        <!-- Diagnóstico y Tratamiento -->
        <div class="col-12">
          <q-separator class="q-my-sm" />
          <div class="text-subtitle2 q-mb-sm text-primary">Diagnóstico y Plan</div>
        </div>

        <div class="col-12">
          <q-input
            v-model="atencionConsulta.diagnostico"
            label="Diagnóstico Presuntivo / Definitivo *"
            outlined
            :readonly="modoLectura"
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="atencionConsulta.indicaciones_medicas"
            label="Indicaciones Médicas (Tratamiento)"
            type="textarea"
            rows="3"
            outlined
            :readonly="modoLectura"
            placeholder="Indicaciones para el propietario..."
          />
        </div>

        <!-- Receta (Lo que se imprime) -->
        <div class="col-12">
          <q-card bordered flat class="bg-grey-1">
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2 text-grey-8 flex items-center">
                <q-icon name="receipt_long" class="q-mr-xs" /> Receta Médica (Contenido para impresión)
              </div>
            </q-card-section>
            <q-card-section>
              <q-input
                v-model="atencionConsulta.receta_indicaciones"
                type="textarea"
                rows="4"
                outlined
                bg-color="white"
                :readonly="modoLectura"
                placeholder="Listado de medicamentos con dosis y horarios..."
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Pronóstico y Seguimiento -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="atencionConsulta.pronostico"
            label="Pronóstico"
            outlined
            :readonly="modoLectura"
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="atencionConsulta.proxima_cita"
            label="Próxima Cita Sugerida"
            type="date"
            outlined
            :readonly="modoLectura"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="!modoLectura" class="bg-grey-1 text-right">
      <q-btn 
        color="primary" 
        icon="save" 
        label="Completar y Guardar Consulta" 
        @click="completarConsulta"
        :disable="!formularioValido"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  atencionId: { type: String, required: true },
  servicioId: { type: String, required: true },
  modoLectura: { type: Boolean, default: false },
  datosIniciales: { type: Object, default: () => ({}) },
  motivos: { type: Array, default: () => [] }
})

const emit = defineEmits(['servicio-actualizado', 'servicio-completado', 'servicio-eliminado', 'imprimir-servicio'])

const atencionConsulta = ref({
  id_motivo: null,
  motivo_detallado: '',
  anamnesis: '',
  hallazgos_examen: '',
  diagnostico: '',
  indicaciones_medicas: '',
  receta_indicaciones: '',
  pronostico: '',
  proxima_cita: ''
})

const formularioValido = computed(() => {
  return atencionConsulta.value.id_motivo && atencionConsulta.value.diagnostico
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
  }
}

const imprimirReceta = () => {
  emit('imprimir-servicio', props.servicioId, atencionConsulta.value)
}

const eliminarServicio = () => {
  emit('servicio-eliminado', props.servicioId)
}

watch(atencionConsulta, guardarCambios, { deep: true })

onMounted(() => {
  if (props.datosIniciales && Object.keys(props.datosIniciales).length > 0) {
    Object.assign(atencionConsulta.value, props.datosIniciales)
  }
})
</script>

<style scoped>
.servicio-card { margin-bottom: 20px; border-radius: 12px; }
.border-left-premium { border-left: 5px solid #1976d2; }
.bg-blue-1 { background: #ebf8ff; }
</style>

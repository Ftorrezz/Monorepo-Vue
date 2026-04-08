<template>
  <q-stepper
    v-model="step"
    ref="stepperRef"
    color="primary"
    finish-label="Finalizar"
    @finish="finalizarFormulario"
    animated
  >
    <!-- Paso 1: Datos Básicos de la Orden -->
    <q-step :name="1" title="Datos Básicos" :done="step > 1" icon="info">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input
            v-model="formulario.numeroOrden"
            label="Número de Orden"
            outlined
            clearable
            :rules="[val => !!val || 'Este campo es requerido']"
          />
        </div>

        <div class="col-12 col-md-6">
          <q-input
            v-model="formulario.paciente"
            label="Nombre del Paciente"
            outlined
            clearable
            :rules="[val => !!val || 'Este campo es requerido']"
          />
        </div>

        <div class="col-12 col-md-6">
          <q-select
            v-model="formulario.profesionalSolicitante"
            :options="profesionales"
            option-label="nombre"
            option-value="id"
            label="Profesional Solicitante"
            outlined
            clearable
            :rules="[val => !!val || 'Este campo es requerido']"
          />
        </div>

        <div class="col-12 col-md-6">
          <q-select
            v-model="formulario.especie"
            :options="especies"
            label="Especie"
            outlined
            clearable
          />
        </div>

        <div class="col-12 col-md-3">
          <q-input
            v-model.number="formulario.edad"
            label="Edad"
            type="number"
            outlined
            clearable
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="formulario.sexo"
            :options="['Macho', 'Hembra', 'Indeterminado']"
            label="Sexo"
            outlined
            clearable
          />
        </div>

        <div class="col-12 col-md-6">
          <q-input
            v-model="formulario.raza"
            label="Raza"
            outlined
            clearable
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="formulario.diagnostico"
            label="Diagnóstico Presuntivo"
            outlined
            type="textarea"
            rows="2"
            clearable
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="formulario.indicacionesEspeciales"
            label="Indicaciones Especiales"
            outlined
            type="textarea"
            rows="2"
            clearable
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="formulario.observaciones"
            label="Observaciones"
            outlined
            type="textarea"
            rows="2"
            clearable
          />
        </div>

        <div class="col-12">
          <q-checkbox
            v-model="formulario.esUrgente"
            label="Marcar como URGENTE"
            color="negative"
          />
        </div>
      </div>

      <div class="q-mt-md">
        <q-stepper-navigation>
          <q-btn color="primary" label="Continuar" @click="$refs.stepperRef.next()" />
        </q-stepper-navigation>
      </div>
    </q-step>

    <!-- Paso 2: Captura de Estudios y Generación de Muestras -->
    <q-step :name="2" title="Estudios y Muestras" :done="step > 2" icon="science">
      <CapturaEstudios
        :numero-orden="formulario.numeroOrden"
        @estudios-actualizados="handleEstudiosActualizados"
      />

      <div class="q-mt-md">
        <q-stepper-navigation>
          <q-btn
            color="primary"
            label="Continuar"
            @click="$refs.stepperRef.next()"
            :disable="!formulario.estudios || formulario.estudios.length === 0"
          />
          <q-btn
            flat
            color="primary"
            label="Atrás"
            @click="$refs.stepperRef.previous()"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </div>
    </q-step>

    <!-- Paso 3: Impresión de Etiquetas y Reportes -->
    <q-step :name="3" title="Impresión" :done="step > 3" icon="print">
      <div class="row q-col-gutter-md">
        <!-- Tab para cambiar entre etiquetas y reportes -->
        <div class="col-12">
          <q-tabs
            v-model="tabImpresion"
            dense
            align="left"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="etiquetas" label="Etiquetas de Muestras" />
            <q-tab name="reporte" label="Reporte de Orden" />
          </q-tabs>
        </div>

        <div class="col-12">
          <q-tab-panels v-model="tabImpresion" animated class="bg-transparent">
            <!-- Panel de Etiquetas -->
            <q-tab-panel name="etiquetas">
              <ImpresionEtiquetas
                :muestras="formulario.muestras"
                :numero-orden="formulario.numeroOrden"
                @impresion-completada="handleImpresionEtiquetas"
              />
            </q-tab-panel>

            <!-- Panel de Reporte -->
            <q-tab-panel name="reporte">
              <ReporteOrden
                :orden="formulario as any"
                @reporte-generado="handleReporteGenerado"
              />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>

      <div class="q-mt-md">
        <q-stepper-navigation>
          <q-btn color="positive" label="Finalizar" @click="finalizarFormulario" />
          <q-btn
            flat
            color="primary"
            label="Atrás"
            @click="$refs.stepperRef.previous()"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </div>
    </q-step>

    <!-- Paso 4: Resumen y Confirmación -->
    <q-step :name="4" title="Resumen" :done="step > 4" icon="check_circle">
      <div class="text-h6 q-mb-lg">Orden Creada Exitosamente</div>

      <q-card class="q-mb-lg">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2">Datos de la Orden</div>
              <div class="q-mt-sm texto-pequeño">
                <strong>Número:</strong> {{ formulario.numeroOrden }}<br>
                <strong>Paciente:</strong> {{ formulario.paciente }}<br>
                <strong>Profesional:</strong> {{ formulario.profesionalSolicitante }}<br>
                <strong>Estado:</strong> Generada
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-subtitle2">Resumen de Estudios</div>
              <div class="q-mt-sm">
                <q-chip
                  color="primary"
                  text-color="white"
                  :label="`Total Estudios: ${formulario.estudios?.length || 0}`"
                  dense
                />
                <q-chip
                  color="info"
                  text-color="white"
                  :label="`Total Muestras: ${formulario.muestras?.length || 0}`"
                  dense
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card v-if="formulario.estudios && formulario.estudios.length > 0">
        <q-card-section>
          <div class="text-subtitle2 q-mb-md">Estudios Agregados</div>
          <q-table
            :rows="formulario.estudios"
            :columns="columnasEstudios"
            row-key="codigo"
            flat
            dense
            separator="cell"
          />
        </q-card-section>
      </q-card>

      <div class="q-mt-lg row q-col-gutter-md">
        <div class="col-12">
          <q-btn
            color="positive"
            label="Guardar Orden"
            icon="save"
            @click="guardarOrden"
            size="lg"
            class="full-width"
          />
        </div>
      </div>

      <div class="q-mt-md">
        <q-stepper-navigation>
          <q-btn
            flat
            color="primary"
            label="Editar"
            @click="$refs.stepperRef.previous()"
          />
        </q-stepper-navigation>
      </div>
    </q-step>
  </q-stepper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { OrdenLaboratorio, EstadoOrden, Estudio, Muestra } from 'src/types/laboratorio'
import CapturaEstudios from 'src/components/laboratorio/CapturaEstudios.vue'
import ImpresionEtiquetas from 'src/components/laboratorio/ImpresionEtiquetas.vue'
import ReporteOrden from 'src/components/laboratorio/ReporteOrden.vue'

const emit = defineEmits<{
  (e: 'cancelar'): void
  (e: 'guardar', orden: OrdenLaboratorio): void
}>()

const step = ref(1)
const stepperRef = ref()
const tabImpresion = ref('etiquetas')

const profesionales = ref([
  { id: 1, nombre: 'Dr. Juan Pérez' },
  { id: 2, nombre: 'Dra. María García' },
  { id: 3, nombre: 'Dr. Carlos López' }
])

const especies = ref(['Canino', 'Felino', 'Equino', 'Bovino', 'Ovino', 'Porcino', 'Ave'])

const formulario = ref<Partial<OrdenLaboratorio>>({
  numeroOrden: '',
  paciente: '',
  profesionalSolicitante: '',
  especie: '',
  edad: undefined,
  sexo: '',
  raza: '',
  diagnostico: '',
  indicacionesEspeciales: '',
  observaciones: '',
  esUrgente: false,
  estado: EstadoOrden.GENERADA,
  estudios: [],
  muestras: [],
  fechaCreacion: new Date().toISOString()
})

const columnasEstudios = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'tipoMuestra', label: 'Tipo de Muestra', field: 'tipoMuestra', align: 'left' },
  { name: 'numeroMuestra', label: 'Número de Muestra', field: (row: any) => row.muestra?.numeroMuestra, align: 'left' }
]

const handleEstudiosActualizados = (ordenActualizada: Partial<OrdenLaboratorio>) => {
  formulario.value.estudios = ordenActualizada.estudios
  formulario.value.muestras = ordenActualizada.muestras
}

const handleImpresionEtiquetas = () => {
  console.log('Etiquetas impresas')
}

const handleReporteGenerado = (generado: boolean) => {
  console.log('Reporte generado:', generado)
}

const finalizarFormulario = () => {
  step.value = 4
}

const guardarOrden = () => {
  emit('guardar', formulario.value as OrdenLaboratorio)
}
</script>

<style scoped lang="scss">
.texto-pequeño {
  font-size: 12px;
}
</style>

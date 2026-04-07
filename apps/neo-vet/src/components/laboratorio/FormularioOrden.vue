<template>
  <q-card class="shadow-2 q-pa-md" style="min-width: 560px; max-width: 760px; width: 100%;">
    <q-card-section>
      <div class="row items-center justify-between">
        <div>
          <div class="text-h6">Nueva Orden de Laboratorio</div>
          <div class="text-caption text-grey-7">Complete los datos iniciales para crear la orden.</div>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input v-model="orden.paciente" label="Paciente" outlined clearable />
        </div>
        <div class="col-12 col-md-6">
          <q-select
            v-model="orden.profesionalSolicitante"
            :options="profesionales"
            option-label="nombre"
            option-value="id"
            label="Profesional Solicitante"
            outlined
            clearable
          />
        </div>

        <div class="col-12 col-md-6">
          <q-select
            v-model="orden.estudios"
            :options="estudiosDisponibles"
            label="Estudios Solicitados"
            outlined
            multiple
            option-label="nombre"
            option-value="codigo"
            use-input
            input-debounce="200"
            clearable
          />
        </div>

        <div class="col-12 col-md-6">
          <q-select
            v-model="orden.estado"
            :options="estados"
            label="Estado"
            outlined
            clearable
          />
        </div>

        <div class="col-12 col-md-6">
          <q-checkbox v-model="orden.esUrgente" label="Orden Urgente" />
        </div>

        <div class="col-12">
          <q-input
            v-model="orden.diagnostico"
            label="Diagnóstico Presuntivo"
            outlined
            clearable
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="orden.indicacionesEspeciales"
            label="Indicaciones Especiales"
            type="textarea"
            outlined
            rows="3"
            clearable
          />
        </div>

        <div class="col-12">
          <q-input
            v-model="orden.observaciones"
            label="Observaciones"
            type="textarea"
            outlined
            rows="3"
            clearable
          />
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" color="secondary" @click="$emit('cancelar')" />
      <q-btn color="primary" label="Guardar" :disable="!formValido" @click="guardar" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits<{
  (event: 'guardar', orden: any): void
  (event: 'cancelar'): void
}>()

const orden = ref({
  id: null as string | null,
  numeroOrden: '',
  paciente: '',
  profesionalSolicitante: null as string | null,
  estudios: [] as string[],
  estado: 'borrador',
  esUrgente: false,
  diagnostico: '',
  indicacionesEspeciales: '',
  observaciones: '',
  fechaCreacion: new Date().toISOString()
})

const profesionales = [
  { id: 'prof1', nombre: 'Dr. Juan Pérez' },
  { id: 'prof2', nombre: 'Dra. María García' },
  { id: 'prof3', nombre: 'Dr. Carlos López' }
]

const estudiosDisponibles = [
  { codigo: 'HEM01', nombre: 'Hemograma Completo' },
  { codigo: 'BIO02', nombre: 'Perfil Bioquímico' },
  { codigo: 'ORU01', nombre: 'Uroanálisis' }
]

const estados = [
  { label: 'Borrador', value: 'borrador' },
  { label: 'Generada', value: 'generada' },
  { label: 'Recepcionada', value: 'recepcionada' },
  { label: 'En Proceso', value: 'en_proceso' },
  { label: 'Completada', value: 'completada' },
  { label: 'Entregada', value: 'entregada' }
]

const formValido = computed(() => {
  return (
    orden.value.paciente.trim().length > 0 &&
    orden.value.profesionalSolicitante !== null &&
    orden.value.estudios.length > 0
  )
})

const guardar = () => {
  const nuevaOrden = {
    ...orden.value,
    id: orden.value.id || `temp-${Date.now()}`,
    numeroOrden: orden.value.numeroOrden || `LAB-${Date.now()}`,
    fechaCreacion: new Date().toISOString(),
    paciente: orden.value.paciente.trim(),
  }

  emit('guardar', nuevaOrden)
}
</script>

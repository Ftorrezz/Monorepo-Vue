<template>
  <q-card class="shadow-2 q-pa-md">
    <q-card-section class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6">Órdenes de Laboratorio</div>
        <div class="text-caption text-grey">Lista de órdenes registradas</div>
      </div>
    </q-card-section>

    <q-table
      :columns="columns"
      :rows="ordenes"
      row-key="id"
      :loading="loading"
      no-data-label="No hay órdenes para mostrar"
      flat
      bordered
      dense
      @row-click="rowClick"
    >
      <template v-slot:body-cell-estado="props">
        <q-td align="center">
          <q-chip
            :color="estadoColor(props.row.estado)"
            text-color="white"
            dense
            outline
            :label="estadoEtiqueta(props.row.estado)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td align="center">
          <q-btn-group>
            <q-btn flat round dense icon="visibility" color="primary" @click="abrirOrden(props.row)" />
            <q-btn
              v-if="['generada', 'borrador'].includes(props.row.estado)"
              flat
              round
              dense
              icon="science"
              color="secondary"
              @click="recibirOrden(props.row)"
              title="Recepcionar orden"
            />
            <q-btn
              v-if="['recepcionada', 'en_proceso', 'completada'].includes(props.row.estado)"
              flat
              round
              dense
              icon="analytics"
              color="teal"
              @click="cargarResultados(props.row)"
              title="Cargar resultados"
            />
          </q-btn-group>
        </q-td>
      </template>

      <template v-slot:top-right>
        <q-btn color="primary" label="Nueva Orden" icon="add" @click="$emit('crear-nuevo')" />
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
const props = defineProps({
  ordenes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (event: 'ver-orden', orden: any): void
  (event: 'recibir-orden', orden: any): void
  (event: 'cargar-resultados', orden: any): void
  (event: 'seleccionar-orden', orden: any): void
  (event: 'crear-nuevo'): void
}>()

const columns = [
  { name: 'numeroOrden', label: 'Orden', field: 'numeroOrden', align: 'left' as const, sortable: true },
  { name: 'paciente', label: 'Paciente', field: 'paciente', align: 'left' as const, sortable: true },
  { name: 'profesional', label: 'Solicitante', field: 'profesional', align: 'left' as const, sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const, sortable: true },
  { name: 'fechaCreacion', label: 'Fecha', field: 'fechaCreacion', align: 'left' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
]

const abrirOrden = (orden: any) => {
  emit('ver-orden', orden)
}

const recibirOrden = (orden: any) => {
  emit('recibir-orden', orden)
}

const cargarResultados = (orden: any) => {
  emit('cargar-resultados', orden)
}

const rowClick = (...args: any[]) => {
  const row = args.find((item: any) => item && typeof item === 'object' && 'id' in item)
  if (!row) return
  emit('seleccionar-orden', row)
}

const estadoColor = (estado: string) => {
  const colores: Record<string, string> = {
    borrador: 'grey-5',
    generada: 'blue',
    recepcionada: 'orange',
    en_proceso: 'teal',
    completada: 'positive'
  }
  return colores[estado] || 'grey-5'
}

const estadoEtiqueta = (estado: string) => {
  const etiquetas: Record<string, string> = {
    borrador: 'Borrador',
    generada: 'Generada',
    recepcionada: 'Recepcionada',
    en_proceso: 'En Proceso',
    completada: 'Completada'
  }
  return etiquetas[estado] || estado || 'Sin estado'
}
</script>

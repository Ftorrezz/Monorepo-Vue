<template>
  <q-page class="laboratorio-page q-pa-md">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h2 class="text-h5 q-mb-sm">Carga de Resultados de Laboratorio</h2>
        <div class="text-subtitle2 text-grey-7">Seleccione una orden y cargue resultados de los estudios realizados.</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn color="primary" label="Actualizar" icon="refresh" @click="refrescar" />
      </div>
    </div>

    <!-- Resumen general -->
    <div class="row q-col-gutter-sm q-mb-md">
      <q-chip color="blue" text-color="white" :label="`Total Órdenes: ${ordenesDisponibles.length}`" />
      <q-chip color="orange" text-color="white" :label="`Pendientes: ${ordenesPendientes}`" />
      <q-chip color="teal" text-color="white" :label="`En Proceso: ${ordenesEnProceso}`" />
      <q-chip color="positive" text-color="white" :label="`Completadas: ${ordenesCompletadas}`" />
    </div>

    <!-- Contenedor split principal -->
    <div class="row q-col-gutter-md" style="height: calc(100vh - 300px);">
      <!-- Sección superior izquierda: Lista de órdenes -->
      <div class="col-12 col-lg-6 column no-wrap">
        <q-card class="shadow-2 column no-wrap">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Órdenes Disponibles</div>
            <q-space />
            <q-toggle
              v-model="mostrarSoloActivas"
              label="Solo pendientes"
              @update:model-value="filtrarOrdenes"
            />
          </q-card-section>

          <q-separator />

          <!-- Buscador -->
          <q-card-section class="q-py-sm">
            <q-input
              v-model="busquedaOrden"
              outlined
              dense
              placeholder="Buscar por paciente, orden o profesional"
              clearable
              @update:model-value="filtrarOrdenes"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>

          <q-separator />

          <!-- Tabla de órdenes -->
          <q-scroll-area class="col">
            <q-table
              :rows="ordenesFiltradas"
              :columns="columnasOrdenes"
              row-key="id"
              flat
              dense
              separator="cell"
              :loading="cargandoOrdenes"
              @row-click="seleccionarOrden"
              :selected="ordenSeleccionadaArray"
              selection="single"
              style="cursor: pointer"
            >
              <template v-slot:body-cell-estado="props">
                <q-td>
                  <q-chip
                    :color="obtenerColorEstado(props.row.estado)"
                    text-color="white"
                    size="sm"
                    dense
                    :label="props.row.estado"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-estudios="props">
                <q-td>
                  <q-chip
                    color="grey-7"
                    text-color="black"
                    size="sm"
                    dense
                    :label="`${props.row.estudios?.length || 0}`"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-progreso="props">
                <q-td>
                  <q-linear-progress
                    :value="calcularProgreso(props.row)"
                    size="sm"
                    color="primary"
                  />
                  <div class="text-caption">{{ (calcularProgreso(props.row) * 100).toFixed(0) }}%</div>
                </q-td>
              </template>
            </q-table>
          </q-scroll-area>
        </q-card>
      </div>

      <!-- Sección derecha: Detalles y carga de resultados -->
      <div class="col-12 col-lg-6 column no-wrap">
        <q-card v-if="!ordenSeleccionada" class="shadow-2 column items-center justify-center q-pa-lg">
          <q-icon name="info" size="64px" color="grey-5" />
          <div class="text-h6 q-mt-md">Seleccione una orden</div>
          <div class="text-caption text-grey-7">Haga clic en una orden de la lista para cargar resultados</div>
        </q-card>

        <q-card v-else class="shadow-2 column no-wrap">
          <!-- Encabezado del detalle de orden -->
          <q-card-section class="row items-center q-pb-none">
            <div>
              <div class="text-h6">Orden {{ ordenSeleccionada.numeroOrden }}</div>
              <div class="text-caption text-grey-7">{{ ordenSeleccionada.paciente }} - {{ ordenSeleccionada.profesionalSolicitante }}</div>
              <div class="row q-col-gutter-xs q-mt-sm">
                <q-chip
                  :color="obtenerColorEstado(ordenSeleccionada.estado)"
                  text-color="white"
                  size="sm"
                  dense
                  :label="ordenSeleccionada.estado"
                />
                <q-chip
                  v-if="ordenSeleccionada.esUrgente"
                  color="negative"
                  text-color="white"
                  size="sm"
                  dense
                  label="URGENTE"
                />
              </div>
            </div>
            <q-space />
            <div class="text-right">
              <q-btn
                flat
                round
                dense
                icon="close"
                color="grey-7"
                @click="limpiarSeleccion"
              />
            </div>
          </q-card-section>

          <q-separator />

          <!-- Resumen de la orden -->
          <q-card-section class="q-py-sm bg-grey-1">
            <div class="row q-col-gutter-xs">
              <q-chip
                outlined
                color="grey-7"
                :label="`Estudios: ${ordenSeleccionada.estudios?.length || 0}`"
                size="sm"
              />
              <q-chip
                outlined
                color="orange"
                :label="`Pendientes: ${estudiosPendientes}`"
                size="sm"
              />
              <q-chip
                outlined
                color="blue"
                :label="`Cargados: ${estudiosCargados}`"
                size="sm"
              />
              <q-chip
                outlined
                color="positive"
                :label="`Validados: ${estudiosValidados}`"
                size="sm"
              />
            </div>
          </q-card-section>

          <q-separator />

          <!-- Carga de resultados -->
          <q-scroll-area class="col">
            <q-card-section class="q-pa-md">
              <CargaResultadosEstudios
                :orden="ordenSeleccionada"
                @resultado-cargado="handleResultadoCargado"
                @resultado-validado="handleResultadoValidado"
              />
            </q-card-section>
          </q-scroll-area>

          <!-- Acciones finales -->
          <q-separator />

          <q-card-section class="row q-gutter-sm">
            <q-btn
              color="primary"
              label="Imprimir Orden"
              icon="print"
              flat
              @click="imprimirOrden(ordenSeleccionada)"
            />
            <q-btn
              v-if="estudiosValidados === ordenSeleccionada.estudios?.length"
              color="positive"
              label="Finalizar Orden"
              icon="check"
              @click="finalizarOrden"
            />
            <q-space />
            <q-btn
              color="secondary"
              label="Cancelar"
              flat
              @click="limpiarSeleccion"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { OrdenLaboratorio, EstadoOrden } from 'src/types/laboratorio'
import CargaResultadosEstudios from 'src/components/laboratorio/CargaResultadosEstudios.vue'
import useLaboratorioOrdenes from 'src/composables/laboratorio/useLaboratorioOrdenes'

const {
  ordenes: todasLasOrdenes,
  loading: cargandoOrdenes,
  cargarOrdenes
} = useLaboratorioOrdenes()

const ordenesFiltradas = ref<OrdenLaboratorio[]>([])
const ordenSeleccionada = ref<OrdenLaboratorio | null>(null)
const busquedaOrden = ref('')
const mostrarSoloActivas = ref(true)

const columnasOrdenes = [
  { name: 'numeroOrden', label: 'Orden', field: 'numeroOrden', align: 'left' },
  { name: 'paciente', label: 'Paciente', field: 'paciente', align: 'left' },
  { name: 'profesionalSolicitante', label: 'Solicitante', field: 'profesionalSolicitante', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'estudios', label: 'Estudios', field: 'estudios', align: 'center' },
  { name: 'progreso', label: 'Progreso', field: 'progreso', align: 'center' }
]

const ordenSeleccionadaArray = computed(() => {
  return ordenSeleccionada.value ? [ordenSeleccionada.value] : []
})

const ordenesDisponibles = computed(() => {
  return todasLasOrdenes.value.filter(o =>
    ['recepcionada', 'en_proceso', 'completada'].includes(o.estado)
  )
})

const ordenesCompletadas = computed(() => {
  return todasLasOrdenes.value.filter(o => o.estado === EstadoOrden.COMPLETADA).length
})

const ordenesEnProceso = computed(() => {
  return todasLasOrdenes.value.filter(o => o.estado === EstadoOrden.EN_PROCESO).length
})

const ordenesPendientes = computed(() => {
  return todasLasOrdenes.value.filter(o => o.estado === EstadoOrden.RECEPCIONADA).length
})

const estudiosPendientes = computed(() => {
  if (!ordenSeleccionada.value) return 0
  return ordenSeleccionada.value.estudios?.filter(e => e.estado === 'pendiente').length || 0
})

const estudiosCargados = computed(() => {
  if (!ordenSeleccionada.value) return 0
  return ordenSeleccionada.value.estudios?.filter(e => e.estado === 'cargado').length || 0
})

const estudiosValidados = computed(() => {
  if (!ordenSeleccionada.value) return 0
  return ordenSeleccionada.value.estudios?.filter(e => e.estado === 'validado').length || 0
})

const obtenerColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    borrador: 'grey-5',
    generada: 'blue',
    recepcionada: 'orange',
    en_proceso: 'teal',
    completada: 'positive',
    cancelada: 'negative'
  }
  return colores[estado] || 'grey-5'
}

const calcularProgreso = (orden: OrdenLaboratorio): number => {
  if (!orden.estudios || orden.estudios.length === 0) return 0
  const completados = orden.estudios.filter(e =>
    ['cargado', 'validado'].includes(e.estado)
  ).length
  return completados / orden.estudios.length
}

const filtrarOrdenes = () => {
  let resultados = ordenesDisponibles.value

  if (mostrarSoloActivas.value) {
    resultados = resultados.filter(o =>
      ['recepcionada', 'en_proceso'].includes(o.estado)
    )
  }

  if (busquedaOrden.value) {
    const busquedaLower = busquedaOrden.value.toLowerCase()
    resultados = resultados.filter(o =>
      o.numeroOrden.toLowerCase().includes(busquedaLower) ||
      o.paciente.toLowerCase().includes(busquedaLower) ||
      o.profesionalSolicitante.toLowerCase().includes(busquedaLower)
    )
  }

  ordenesFiltradas.value = resultados
}

const seleccionarOrden = (evt: any, row: OrdenLaboratorio) => {
  ordenSeleccionada.value = row
}

const limpiarSeleccion = () => {
  ordenSeleccionada.value = null
}

const handleResultadoCargado = (estudioId: string) => {
  console.log('Resultado cargado para estudio:', estudioId)
}

const handleResultadoValidado = (estudioId: string) => {
  console.log('Resultado validado para estudio:', estudioId)
}

const imprimirOrden = (orden: OrdenLaboratorio) => {
  console.log('Imprimiendo orden:', orden.numeroOrden)
}

const finalizarOrden = async () => {
  if (ordenSeleccionada.value) {
    ordenSeleccionada.value.estado = EstadoOrden.COMPLETADA
    // Aquí iría el llamado al servicio para actualizar
    console.log('Orden finalizada:', ordenSeleccionada.value.numeroOrden)
  }
}

const refrescar = async () => {
  await cargarOrdenes()
  filtrarOrdenes()
}

onMounted(async () => {
  await cargarOrdenes()
  filtrarOrdenes()
})
</script>

<style scoped lang="scss">
:deep(.q-table__card) {
  box-shadow: none;
}

:deep(.q-table__container) {
  height: 100%;
}
</style>

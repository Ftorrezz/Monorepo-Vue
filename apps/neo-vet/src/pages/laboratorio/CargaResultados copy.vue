<template>
  <q-page class="laboratorio-page q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h2 class="text-h5 q-mb-sm">Carga de Resultados</h2>
        <div class="text-subtitle2 text-grey-7">Seleccione una orden y cargue resultados por prueba.</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn color="primary" label="Actualizar" icon="refresh" @click="cargarOrdenes" />
        <q-btn flat color="secondary" label="Imprimir" icon="print" @click="imprimirOrden" :disable="!ordenSeleccionada" />
      </div>
    </div>

    <q-card class="shadow-2 q-pa-md q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filtro"
              outlined
              dense
              placeholder="Buscar orden por paciente, profesional o estado"
              clearable
              @input="actualizarFiltro"
              class="full-width"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtroEstado"
              outlined
              dense
              label="Estado"
              :options="estados"
              clearable
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="ordenesFiltradas"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          :pagination="{ rowsPerPage: 6 }"
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn-group>
                <q-btn size="sm" icon="analytics" color="primary" label="Cargar" @click="seleccionarOrden(props.row)" />
                <q-btn size="sm" icon="visibility" color="secondary" round @click="verOrden(props.row)" />
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <div v-if="ordenSeleccionada" class="resultados-section">
      <q-card class="shadow-2 q-pa-md">
        <q-card-section class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-h6">Orden seleccionada: {{ ordenSeleccionada.numeroOrden || 'Sin número' }}</div>
            <div class="text-caption text-grey-7">Paciente: {{ ordenSeleccionada.paciente || 'No definido' }} · Estado: {{ ordenSeleccionada.estado }}</div>
            <div class="row q-col-gutter-sm q-mt-sm">
              <q-chip dense outline color="grey-7" text-color="black" :label="`Estudios: ${resumenOrdenSeleccionada.estudios}`" />
              <q-chip dense outline color="grey-7" text-color="black" :label="`Pruebas: ${resumenOrdenSeleccionada.totalPruebas}`" />
              <q-chip dense outline color="orange" text-color="white" :label="`Pendientes: ${resumenOrdenSeleccionada.pendientes}`" />
              <q-chip dense outline color="blue" text-color="white" :label="`Cargadas: ${resumenOrdenSeleccionada.cargadas}`" />
              <q-chip dense outline color="positive" text-color="white" :label="`Validadas: ${resumenOrdenSeleccionada.validadas}`" />
            </div>
          </div>
          <q-btn flat icon="close" color="negative" @click="limpiarOrdenSeleccionada" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-banner class="bg-grey-2 text-black" v-if="!ordenPuedeCargarResultados">
            Esta orden no está lista para carga de resultados. Primero debe recepcionarse y luego podrá cargar los resultados.
          </q-banner>
          <q-banner class="bg-green text-white" v-else>
            Puede cargar resultados y actualizar el estado de la orden. Las órdenes serán marcadas como <strong>en_proceso</strong> o <strong>completada</strong> según el progreso.
          </q-banner>
          <div v-if="ordenParaResultados">
            <ResultadosLaboratorio :orden="ordenParaResultados" @resultados-actualizados="handleResultadosActualizados" />
          </div>
          <div v-else class="q-pa-md">
            <q-banner class="bg-grey-1 text-black">
              Para cargar resultados, la orden debe estar en estado <strong>recepcionada</strong>, <strong>en_proceso</strong> o <strong>completada</strong>.
            </q-banner>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Guardar Resultados"
            :loading="guardandoResultados"
            :disable="guardandoResultados || !ordenParaResultados"
            @click="guardarResultadosOrden"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import useLaboratorioOrdenes from 'src/composables/laboratorio/useLaboratorioOrdenes'
import { normalizarOrden, calcularEstadoOrden } from 'src/composables/laboratorio/laboratorioOrdenHelpers'
import ResultadosLaboratorio from 'src/components/laboratorio/ResultadosLaboratorio.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const { ordenes, ordenSeleccionada, loading, cargarOrdenes: cargarOrdenesDesdeComposables, cargarOrden, guardarResultados, actualizarOrdenLocal } = useLaboratorioOrdenes()
const filtro = ref('')
const filtroEstado = ref('')
const guardandoResultados = ref(false)

const estados = [
  { label: 'Todos', value: '' },
  { label: 'Borrador', value: 'borrador' },
  { label: 'Generada', value: 'generada' },
  { label: 'Recepcionada', value: 'recepcionada' },
  { label: 'En Proceso', value: 'en_proceso' },
  { label: 'Completada', value: 'completada' }
]

const columns = [
  { name: 'numeroOrden', label: 'Orden', field: 'numeroOrden', align: 'left' as const, sortable: true },
  { name: 'paciente', label: 'Paciente', field: 'paciente', align: 'left' as const, sortable: true },
  { name: 'profesionalSolicitante', label: 'Solicitante', field: 'profesionalSolicitante', align: 'left' as const, sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const, sortable: true },
  { name: 'fechaCreacion', label: 'Fecha', field: 'fechaCreacion', align: 'left' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
]

const cargarOrdenes = async () => {
  await cargarOrdenesDesdeComposables()
}

const ordenesFiltradas = computed(() => {
  const estadosPermitidos = ['recepcionada', 'en_proceso', 'completada']
  return ordenes.value
    .filter((orden: any) => estadosPermitidos.includes(orden.estado))
    .filter((orden: any) => {
      const texto = `${orden.numeroOrden} ${orden.paciente || ''} ${orden.profesionalSolicitante || ''}`.toLowerCase()
      const cumpleFiltro = filtro.value ? texto.includes(filtro.value.toLowerCase()) : true
      const cumpleEstado = filtroEstado.value ? orden.estado === filtroEstado.value : true
      return cumpleFiltro && cumpleEstado
    })
})

const seleccionarOrden = async (orden: any) => {
  if (!orden?.id) {
    return
  }

  await cargarOrden(orden.id)
}

const limpiarOrdenSeleccionada = () => {
  ordenSeleccionada.value = null
}

const verOrden = (orden: any) => {
  if (!orden?.id) return
  router.push({ name: 'laboratorio-orden', params: { id: orden.id } })
}

const handleResultadosActualizados = (pruebasActualizadas: any[]) => {
  if (!ordenSeleccionada.value || !Array.isArray(ordenSeleccionada.value.estudios)) {
    return
  }

  ordenSeleccionada.value.estudios = ordenSeleccionada.value.estudios.map((estudio: any) => {
    if (!Array.isArray(estudio.pruebas)) {
      return estudio
    }

    const pruebasActualizadasPorEstudio = estudio.pruebas.map((prueba: any) => {
      const resultado = pruebasActualizadas.find((item: any) => item.id === prueba.id)
      return resultado ? { ...prueba, ...resultado } : prueba
    })

    return {
      ...estudio,
      pruebas: pruebasActualizadasPorEstudio
    }
  })

  actualizarOrdenLocal(ordenSeleccionada.value)
}

const guardarResultadosOrden = async () => {
  if (!ordenSeleccionada.value || !ordenPuedeCargarResultados.value) {
    return
  }

  ordenSeleccionada.value.estado = calcularEstadoOrden(ordenSeleccionada.value)
  ordenSeleccionada.value.fechaActualizacion = new Date().toISOString()

  guardandoResultados.value = true
  try {
    const respuesta = await guardarResultados(ordenSeleccionada.value)
    if (respuesta?.id) {
      await cargarOrden(respuesta.id)
    }
    $q.notify({ type: 'positive', message: 'Resultados guardados correctamente', position: 'top-right' })
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error?.message || 'Error al guardar resultados', position: 'top-right' })
  } finally {
    guardandoResultados.value = false
  }
}

const imprimirOrden = () => {
  window.print()
}

const resumenOrdenSeleccionada = computed(() => {
  if (!ordenSeleccionada.value || !Array.isArray(ordenSeleccionada.value.estudios)) {
    return {
      estudios: 0,
      totalPruebas: 0,
      pendientes: 0,
      cargadas: 0,
      validadas: 0
    }
  }

  const estudios = ordenSeleccionada.value.estudios.length
  const pruebas = ordenSeleccionada.value.estudios.flatMap((estudio: any) => Array.isArray(estudio.pruebas) ? estudio.pruebas : [])
  const pendientes = pruebas.filter((prueba: any) => prueba.estado === 'pendiente').length
  const cargadas = pruebas.filter((prueba: any) => prueba.estado === 'cargado').length
  const validadas = pruebas.filter((prueba: any) => prueba.estado === 'validado').length

  return {
    estudios,
    totalPruebas: pruebas.length,
    pendientes,
    cargadas,
    validadas
  }
})

const ordenPuedeCargarResultados = computed(() => {
  return ordenSeleccionada.value ? ['recepcionada', 'en_proceso', 'completada'].includes(ordenSeleccionada.value.estado) : false
})

const ordenParaResultados = computed(() => {
  if (!ordenSeleccionada.value || !ordenPuedeCargarResultados.value) return null
  return normalizarOrden(ordenSeleccionada.value)
})

const actualizarFiltro = () => {
  // La búsqueda se aplica reactivamente vía v-model y el computed ordenesFiltradas.
}

onMounted(async () => {
  await cargarOrdenes()
  const orderId = route.query.id
  if (typeof orderId === 'string' && orderId.trim()) {
    await cargarOrden(orderId)
  }
})
</script>

<style scoped>
.laboratorio-page {
  min-height: calc(100vh - 48px);
}

.full-width {
  width: 100%;
}

.resultados-section {
  margin-top: 24px;
}
@media print {
  .laboratorio-page {
    padding: 0 !important;
  }

  .laboratorio-page :deep(.q-btn),
  .laboratorio-page :deep(.q-separator),
  .laboratorio-page :deep(.q-table__bottom),
  .laboratorio-page :deep(.q-page__navbar) {
    display: none !important;
  }

  .laboratorio-page :deep(.q-card) {
    box-shadow: none !important;
    border: 1px solid #ccc;
  }
}
</style>

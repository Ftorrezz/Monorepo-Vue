<template>
  <q-page class="laboratorio-page q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h2 class="text-h5 q-mb-sm">Registro de Muestras</h2>
        <div class="text-subtitle2 text-grey-7">Recepciona las muestras asociadas a órdenes de laboratorio generadas.</div>
      </div>
      <q-btn flat color="primary" label="Volver" icon="arrow_back" @click="volver" />
    </div>

    <q-card class="shadow-2 q-pa-md q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filtro"
              outlined
              dense
              placeholder="Buscar orden por paciente, profesional o número"
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
          :columns="columns"
          :rows="ordenesFiltradas"
          row-key="id"
          flat
          bordered
          :loading="loading"
          :pagination="{ rowsPerPage: 6 }"
          no-data-label="No hay órdenes disponibles para recepcionar"
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn-group>
                <q-btn size="sm" icon="science" color="primary" label="Registrar" @click="seleccionarOrden(props.row)" />
                <q-btn size="sm" icon="visibility" color="secondary" round @click="verOrden(props.row)" />
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <div v-if="ordenSeleccionada" class="registro-section">
      <q-card class="shadow-2 q-pa-md">
        <q-card-section class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-h6">Orden seleccionada: {{ ordenSeleccionada.numeroOrden || 'Sin número' }}</div>
            <div class="text-caption text-grey-7">Paciente: {{ ordenSeleccionada.paciente || 'No definido' }} · Estado: {{ ordenSeleccionada.estado }}</div>
            <div class="row q-col-gutter-sm q-mt-sm">
              <q-chip dense outline color="grey-7" text-color="black" :label="`Estudios: ${resumenOrdenSeleccionada.estudios}`" />
              <q-chip dense outline color="grey-7" text-color="black" :label="`Pruebas: ${resumenOrdenSeleccionada.totalPruebas}`" />
            </div>
          </div>
          <q-btn flat icon="close" color="negative" @click="cancelarSeleccion" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-banner class="bg-orange text-white" v-if="ordenYaRecepcionada">
            Esta orden ya fue recepcionada. Si desea continuar, vaya a la carga de resultados.
            <q-btn flat dense class="q-ml-sm" color="white" label="Ir a Resultados" @click="irACargaResultados" />
          </q-banner>

          <q-banner class="bg-grey-2 text-black" v-else>
            Seleccione los códigos y estados de cada muestra para recepcionarla. Una vez guardada, la orden quedará en estado <strong>recepcionada</strong>.
          </q-banner>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="ordenSeleccionada.numeroOrden" label="Número de Orden" outlined readonly />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="ordenSeleccionada.paciente" label="Paciente" outlined readonly />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="ordenSeleccionada.profesionalSolicitante" label="Solicitante" outlined readonly />
            </div>
          </div>

          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Tipos de muestra requeridos</div>
            <div class="row q-col-gutter-md">
              <div v-for="muestra in muestras" :key="muestra.tipoMuestra" class="col-12 col-md-6">
                <q-card flat bordered class="bg-grey-1 q-pa-sm">
                  <div class="row items-center justify-between q-mb-sm">
                    <div>
                      <div class="text-subtitle2">{{ muestra.label }}</div>
                      <div class="text-caption text-grey-7">Contenedor: {{ muestra.contenedor }}</div>
                    </div>
                    <q-chip size="sm" color="secondary" text-color="white" :label="muestra.cantidad + ' muestra(s)'" />
                  </div>

                  <q-input v-model="muestra.codigoMuestra" label="Código / Etiqueta" outlined dense clearable />
                  <q-select
                    v-model="muestra.estado"
                    :options="estadosRecepcion"
                    label="Estado de la muestra"
                    outlined
                    dense
                  />
                  <q-input v-model="muestra.observaciones" label="Observaciones" type="textarea" outlined dense rows="2" clearable />
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="secondary" @click="cancelarSeleccion" />
          <q-btn color="primary" label="Guardar recepción" :disable="!puedeGuardarRecepcion" @click="guardarRecepcion" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import useLaboratorioOrdenes from 'src/composables/laboratorio/useLaboratorioOrdenes'
import { normalizarOrden } from 'src/composables/laboratorio/laboratorioOrdenHelpers'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { ordenes, ordenSeleccionada, loading, cargarOrdenes, cargarOrden, recepcionarOrden } = useLaboratorioOrdenes()

const filtro = ref('')
const filtroEstado = ref('')
const muestras = ref<Array<any>>([])

const estados = [
  { label: 'Todos', value: '' },
  { label: 'Borrador', value: 'borrador' },
  { label: 'Generada', value: 'generada' },
  { label: 'Recepcionada', value: 'recepcionada' },
  { label: 'En Proceso', value: 'en_proceso' },
  { label: 'Completada', value: 'completada' }
]

const estadosRecepcion = [
  { label: 'Recibida', value: 'recibida' },
  { label: 'Pendiente', value: 'pendiente' }
]

const ordenPuedeRecepcionar = computed(() => {
  return ordenSeleccionada.value ? ['generada', 'borrador'].includes(ordenSeleccionada.value.estado) : false
})

const ordenYaRecepcionada = computed(() => {
  return ordenSeleccionada.value ? ['recepcionada', 'en_proceso', 'completada'].includes(ordenSeleccionada.value.estado) : false
})

const resumenOrdenSeleccionada = computed(() => {
  if (!ordenSeleccionada.value || !Array.isArray(ordenSeleccionada.value.estudios)) {
    return {
      estudios: 0,
      totalPruebas: 0
    }
  }

  const estudios = ordenSeleccionada.value.estudios.length
  const pruebas = ordenSeleccionada.value.estudios.flatMap((estudio: any) => Array.isArray(estudio.pruebas) ? estudio.pruebas : [])

  return {
    estudios,
    totalPruebas: pruebas.length
  }
})

const columns = [
  { name: 'numeroOrden', label: 'Orden', field: 'numeroOrden', align: 'left' as const, sortable: true },
  { name: 'paciente', label: 'Paciente', field: 'paciente', align: 'left' as const, sortable: true },
  { name: 'profesionalSolicitante', label: 'Solicitante', field: 'profesionalSolicitante', align: 'left' as const, sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const, sortable: true },
  { name: 'fechaCreacion', label: 'Fecha', field: 'fechaCreacion', align: 'left' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
]

const cargarDatos = async () => {
  await cargarOrdenes()
}

const ordenesFiltradas = computed(() => {
  return ordenes.value
    .filter((orden: any) => orden.estado === 'generada')
    .filter((orden: any) => {
      const texto = `${orden.numeroOrden} ${orden.paciente || ''} ${orden.profesionalSolicitante || ''}`.toLowerCase()
      const cumpleFiltro = filtro.value ? texto.includes(filtro.value.toLowerCase()) : true
      const cumpleEstado = filtroEstado.value ? orden.estado === filtroEstado.value : true
      return cumpleFiltro && cumpleEstado
    })
})

const actualizarFiltro = () => {
  // La búsqueda se aplica reactivamente vía v-model y el computed ordenesFiltradas.
}

const seleccionarOrden = async (orden: any) => {
  if (!orden?.id) {
    return
  }

  await cargarOrden(orden.id)
  if (ordenSeleccionada.value) {
    ordenSeleccionada.value = normalizarOrden(ordenSeleccionada.value)
    if (ordenPuedeRecepcionar.value) {
      inicializarMuestras()
    } else {
      muestras.value = ordenSeleccionada.value.muestras ?? []
    }
  }
}

const cancelarSeleccion = () => {
  ordenSeleccionada.value = null
  muestras.value = []
}

const verOrden = (orden: any) => {
  if (!orden?.id) return
  router.push({ name: 'laboratorio-orden', params: { id: orden.id } })
}

const irACargaResultados = () => {
  if (!ordenSeleccionada.value?.id) return
  router.push({ name: 'laboratorio-carga-resultados', query: { id: ordenSeleccionada.value.id.toString() } })
}

const obtenerTiposMuestra = (orden: any) => {
  if (!orden?.estudios || !Array.isArray(orden.estudios)) return []

  const mapaTipos: Record<string, { label: string; tipoMuestra: string; contenedor: string }> = {
    HEM01: { label: 'Sangre Completa', tipoMuestra: 'sangre_completa', contenedor: 'Tubo EDTA' },
    BIO02: { label: 'Suero', tipoMuestra: 'suero', contenedor: 'Tubo de suero' },
    ORU01: { label: 'Orina', tipoMuestra: 'orina', contenedor: 'Recipiente estéril' }
  }

  const tiposUnicos = new Map<string, { label: string; tipoMuestra: string; contenedor: string }>()

  orden.estudios.forEach((estudio: any) => {
    const codigoEstudio = typeof estudio === 'string'
      ? estudio
      : estudio.codigo || estudio.id || estudio.nombre

    const tipo = mapaTipos[codigoEstudio] || { label: `Muestra ${codigoEstudio}`, tipoMuestra: `otro_${codigoEstudio}`, contenedor: 'Contenedor estándar' }
    tiposUnicos.set(tipo.tipoMuestra, tipo)
  })

  return Array.from(tiposUnicos.values())
}

const inicializarMuestras = () => {
  const orden = ordenSeleccionada.value
  if (!orden) {
    muestras.value = []
    return
  }

  const tipos = obtenerTiposMuestra(orden)
  muestras.value = tipos.map(tipo => ({
    tipoMuestra: tipo.tipoMuestra,
    label: tipo.label,
    contenedor: tipo.contenedor,
    cantidad: 1,
    codigoMuestra: '',
    observaciones: '',
    estado: 'recibida'
  }))
}

const puedeGuardarRecepcion = computed(() => {
  if (!ordenSeleccionada.value) return false
  return ordenPuedeRecepcionar.value && muestras.value.length > 0 && muestras.value.every((muestra) => muestra.estado === 'recibida')
})

const guardarRecepcion = async () => {
  if (!ordenSeleccionada.value || !ordenPuedeRecepcionar.value) return

  const ordenActualizada = {
    ...ordenSeleccionada.value,
    estado: 'recepcionada',
    fechaRecepcion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    muestras: muestras.value.map((muestra) => ({
      ...muestra,
      fechaRecepcion: new Date().toISOString()
    }))
  }

  try {
    const ordenGuardar = await recepcionarOrden(ordenActualizada)
    $q.notify({ type: 'positive', message: 'Orden registrada como recepcionada' })
    cancelarSeleccion()
    await cargarDatos()
    if (ordenGuardar?.id) {
      router.push({ name: 'laboratorio-carga-resultados', query: { id: ordenGuardar.id.toString() } })
    }
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error?.message || 'Error al guardar la recepción de la orden' })
  }
}

const volver = () => {
  router.back()
}

onMounted(async () => {
  await cargarDatos()
  const orderId = route.query.id
  if (typeof orderId === 'string' && orderId.trim()) {
    await cargarOrden(orderId)
    if (ordenSeleccionada.value) {
      ordenSeleccionada.value = normalizarOrden(ordenSeleccionada.value)
      if (ordenPuedeRecepcionar.value) {
        inicializarMuestras()
      } else {
        muestras.value = ordenSeleccionada.value.muestras ?? []
      }
    }
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
.registro-section {
  margin-top: 24px;
}
</style>

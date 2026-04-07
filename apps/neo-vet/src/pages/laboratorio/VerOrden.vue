<template>
  <q-page class="laboratorio-page q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h2 class="text-h5 q-mb-sm">Detalle de Orden de Laboratorio</h2>
        <div class="text-subtitle2 text-grey-7">Revisa la información de la orden seleccionada y su estado actual.</div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn flat color="primary" label="Volver" icon="arrow_back" @click="volver" />
        <q-btn
          v-if="orden?.estado === 'generada' || orden?.estado === 'borrador'"
          flat
          color="secondary"
          label="Recepcionar"
          icon="science"
          @click="irARegistroMuestras"
        />
        <q-btn
          v-if="['recepcionada','en_proceso','completada'].includes(orden?.estado)"
          flat
          color="teal"
          label="Cargar resultados"
          icon="analytics"
          @click="irACargaResultados"
        />
        <q-btn flat color="secondary" label="Imprimir" icon="print" @click="imprimirOrden" :disable="!orden" />
      </div>
    </div>

    <q-card class="shadow-2 q-pa-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 text-grey-8">Orden</div>
            <div class="text-h6">{{ orden?.numeroOrden || '-' }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 text-grey-8">Estado</div>
            <q-chip :label="orden?.estado || 'N/A'" color="primary" text-color="white" />
          </div>

          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-8">Paciente</div>
            <div>{{ orden?.paciente || '-' }}</div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption text-grey-8">Profesional Solicitante</div>
            <div>{{ orden?.profesionalSolicitante || '-' }}</div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-8">Estudios</div>
            <div>
              <q-chip
                v-for="estudio in estudiosUnicos"
                :key="estudio.id"
                class="q-mr-sm q-mb-sm"
                color="secondary"
                text-color="white"
                size="sm"
                outline
                :label="estudio.nombre || estudio.codigo || estudio.id"
              />
            </div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-8">Diagnóstico Presuntivo</div>
            <div>{{ orden?.diagnostico || '-' }}</div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-8">Indicaciones Especiales</div>
            <div>{{ orden?.indicacionesEspeciales || '-' }}</div>
          </div>

          <div class="col-12">
            <div class="text-caption text-grey-8">Observaciones</div>
            <div>{{ orden?.observaciones || '-' }}</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 q-mb-sm">Historial de la Orden</div>
            <div v-if="historialEventos.length > 0">
              <q-list dense bordered class="bg-grey-1">
                <q-item v-for="evento in historialEventos" :key="evento.label">
                  <q-item-section>
                    <div class="text-body2 text-grey-7">{{ evento.label }}</div>
                    <div class="text-subtitle2">{{ formatearFecha(evento.fecha) }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div v-else class="text-caption text-grey-6">No hay eventos históricos disponibles.</div>
          </div>

          <div class="col-12 col-md-6">
            <div class="text-subtitle2 q-mb-sm">Resumen de Resultados</div>
            <div class="text-caption text-grey-6">
              {{ ordenPlanificada.length }} prueba(s) cargadas en la orden.
            </div>
            <div class="q-mt-sm">
              <q-chip
                v-if="!ordenPlanificada.length"
                label="No hay resultados disponibles"
                color="grey-5"
                text-color="black"
              />
              <q-chip
                v-else
                label="Resultados listos para revisión"
                color="positive"
                text-color="white"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-if="ordenPlanificada.length > 0" class="shadow-2 q-pa-md q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Resultados de la Orden</div>
        <q-table
          :rows="ordenPlanificada"
          :columns="resultadosColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useLaboratorioOrdenes from 'src/composables/laboratorio/useLaboratorioOrdenes'
import { normalizarOrden } from 'src/composables/laboratorio/laboratorioOrdenHelpers'

const route = useRoute()
const router = useRouter()
const { ordenSeleccionada, cargarOrden } = useLaboratorioOrdenes()

const orden = computed(() => normalizarOrden(ordenSeleccionada.value))

const ordenPlanificada = computed(() => {
  if (!orden.value?.estudios || !Array.isArray(orden.value.estudios)) return []

  return orden.value.estudios
    .flatMap((estudio: any) => {
      if (!Array.isArray(estudio.pruebas)) return []
      return estudio.pruebas.map((prueba: any) => ({
        ...prueba,
        estudioNombre: estudio.nombre || estudio.codigo || estudio.id,
        sectorNombre: estudio.sector?.nombre || '',
        sectorId: estudio.sectorId || estudio.sector?.id || 'OTR'
      }))
    })
})

const historialEventos = computed(() => {
  const eventos: Array<{ label: string; fecha: string }> = []
  if (orden.value?.fechaCreacion) eventos.push({ label: 'Creación', fecha: orden.value.fechaCreacion })
  if (orden.value?.fechaGeneracion) eventos.push({ label: 'Generada', fecha: orden.value.fechaGeneracion })
  if (orden.value?.fechaRecepcion) eventos.push({ label: 'Recepcionada', fecha: orden.value.fechaRecepcion })
  if (orden.value?.fechaActualizacion) eventos.push({ label: 'Actualizada', fecha: orden.value.fechaActualizacion })
  return eventos
})

const resultadosColumns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'estudioNombre', label: 'Estudio', field: 'estudioNombre', align: 'left' as const },
  { name: 'nombre', label: 'Prueba', field: 'nombre', align: 'left' as const },
  { name: 'resultado', label: 'Resultado', field: 'resultado', align: 'center' as const },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'center' as const },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' as const }
]

const estudiosUnicos = computed(() => {
  const unique = new Map<string, any>()
  ordenPlanificada.value.forEach((prueba: any) => {
    if (!unique.has(prueba.estudioId)) {
      unique.set(prueba.estudioId, {
        id: prueba.estudioId,
        codigo: prueba.codigo,
        nombre: prueba.estudioNombre,
        sectorId: prueba.sectorId,
        sectorNombre: prueba.sectorNombre
      })
    }
  })
  return Array.from(unique.values())
})

const tieneResultados = computed(() => ordenPlanificada.value.length > 0)

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const imprimirOrden = () => {
  window.print()
}

const irARegistroMuestras = () => {
  if (!orden.value?.id) return
  router.push({ name: 'laboratorio-registro-muestras', query: { id: orden.value.id.toString() } })
}

const irACargaResultados = () => {
  if (!orden.value?.id) return
  router.push({ name: 'laboratorio-carga-resultados', query: { id: orden.value.id.toString() } })
}

const volver = () => {
  router.back()
}

onMounted(async () => {
  const id = route.params.id
  if (typeof id === 'string') {
    await cargarOrden(id)
  }
})
</script>

<style scoped>
@media print {
  .laboratorio-page {
    padding: 0 !important;
  }

  .laboratorio-page :deep(.q-btn),
  .laboratorio-page :deep(.q-btn-group),
  .laboratorio-page :deep(.q-separator),
  .laboratorio-page :deep(.q-pagination) {
    display: none !important;
  }

  .laboratorio-page :deep(.q-card) {
    box-shadow: none !important;
    border: 1px solid #ccc;
  }
}
</style>

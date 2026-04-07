<template>
  <q-page class="laboratorio-page q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h2 class="text-h5 q-mb-sm">Gestión de Órdenes de Laboratorio</h2>
        <div class="text-subtitle2 text-grey-7">Administra órdenes de laboratorio, crea nuevas solicitudes y consulta detalles.</div>
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn color="secondary" flat label="Registro de Muestras" icon="science" @click="irARegistroMuestras" />
        <q-btn color="primary" label="Nueva Orden" icon="add" @click="mostrarFormulario = true" />
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mb-md">
      <q-chip text-color="white" color="grey-7" :label="`Borrador: ${totalesPorEstado.borrador}`" />
      <q-chip text-color="white" color="blue" :label="`Generada: ${totalesPorEstado.generada}`" />
      <q-chip text-color="white" color="orange" :label="`Recepcionada: ${totalesPorEstado.recepcionada}`" />
      <q-chip text-color="white" color="teal" :label="`En Proceso: ${totalesPorEstado.en_proceso}`" />
      <q-chip text-color="white" color="positive" :label="`Completada: ${totalesPorEstado.completada}`" />
    </div>

    <div v-if="ordenSeleccionada?.id" class="q-mb-md">
      <q-card flat bordered class="q-pa-md bg-grey-1">
        <div class="row items-center justify-between">
          <div>
            <div class="text-subtitle2">Orden seleccionada</div>
            <div class="text-h6">{{ ordenSeleccionada.numeroOrden || 'Sin número' }}</div>
            <div class="text-caption">Paciente: {{ ordenSeleccionada.paciente || '-' }}</div>
            <div class="text-caption">Estado: {{ ordenSeleccionada.estado || '-' }}</div>
            <div class="q-mt-sm">
              <q-chip dense outline color="grey-7" text-color="black" :label="`Estudios: ${resumenOrdenSeleccionada.estudios}`" class="q-mr-sm" />
              <q-chip dense outline color="grey-7" text-color="black" :label="`Pruebas: ${resumenOrdenSeleccionada.totalPruebas}`" class="q-mr-sm" />
              <q-chip dense outline color="orange" text-color="white" :label="`Pendientes: ${resumenOrdenSeleccionada.pendientes}`" class="q-mr-sm" />
              <q-chip dense outline color="blue" text-color="white" :label="`Cargadas: ${resumenOrdenSeleccionada.cargadas}`" class="q-mr-sm" />
              <q-chip dense outline color="positive" text-color="white" :label="`Validadas: ${resumenOrdenSeleccionada.validadas}`" />
            </div>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-btn color="primary" label="Ver detalle" icon="visibility" @click="verOrden(ordenSeleccionada)" />
            <q-btn
              v-if="['generada','borrador'].includes(ordenSeleccionada.estado)"
              color="secondary"
              label="Recepcionar"
              icon="science"
              @click="irARegistroMuestrasConOrden(ordenSeleccionada)"
            />
            <q-btn
              v-if="['recepcionada','en_proceso','completada'].includes(ordenSeleccionada.estado)"
              color="teal"
              label="Cargar resultados"
              icon="analytics"
              @click="irACargaResultadosConOrden(ordenSeleccionada)"
            />
          </div>
        </div>
      </q-card>
    </div>

    <div class="row items-center q-gutter-sm q-mb-md">
      <q-chip text-color="white" color="grey-5" label="Borrador" />
      <q-chip text-color="white" color="blue" label="Generada" />
      <q-chip text-color="white" color="orange" label="Recepcionada" />
      <q-chip text-color="white" color="teal" label="En Proceso" />
      <q-chip text-color="white" color="positive" label="Completada" />
      <div class="text-caption text-grey-7 q-ml-md">Use los iconos de la tabla para ver, recepcionar o cargar resultados según el estado.</div>
    </div>

    <TablaOrdenes
      :ordenes="ordenes"
      :loading="loading"
      @seleccionar-orden="seleccionarOrden"
      @ver-orden="verOrden"
      @recibir-orden="irARegistroMuestrasConOrden"
      @cargar-resultados="irACargaResultadosConOrden"
      @crear-nuevo="mostrarFormulario = true"
    />

    <q-dialog v-model="mostrarFormulario" persistent>
      <FormularioOrden @cancelar="mostrarFormulario = false" @guardar="guardarOrden" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TablaOrdenes from 'src/components/laboratorio/TablaOrdenes.vue'
import FormularioOrden from 'src/components/laboratorio/FormularioOrden.vue'
import useLaboratorioOrdenes from 'src/composables/laboratorio/useLaboratorioOrdenes'
import { useRouter } from 'vue-router'

const router = useRouter()
const mostrarFormulario = ref(false)
const { ordenes, loading, ordenSeleccionada, cargarOrdenes, seleccionarOrden, crearOrden } = useLaboratorioOrdenes()

const cargarDatos = async () => {
  await cargarOrdenes()
}

const totalesPorEstado = computed(() => {
  const estados = {
    borrador: 0,
    generada: 0,
    recepcionada: 0,
    en_proceso: 0,
    completada: 0
  }

  ordenes.value.forEach((orden: any) => {
    const estado = orden?.estado as keyof typeof estados
    if (estado && estados.hasOwnProperty(estado)) {
      estados[estado] += 1
    }
  })

  return estados
})

const verOrden = async (orden: any) => {
  if (orden?.id) {
    await seleccionarOrden(orden)
    router.push({ name: 'laboratorio-orden', params: { id: orden.id } })
  }
}

const irARegistroMuestras = () => {
  router.push({ name: 'laboratorio-registro-muestras' })
}

const irARegistroMuestrasConOrden = async (orden: any) => {
  if (!orden?.id) return
  await seleccionarOrden(orden)
  router.push({ name: 'laboratorio-registro-muestras', query: { id: orden.id.toString() } })
}

const irACargaResultadosConOrden = async (orden: any) => {
  if (!orden?.id) return
  await seleccionarOrden(orden)
  router.push({ name: 'laboratorio-carga-resultados', query: { id: orden.id.toString() } })
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

const guardarOrden = async (orden: any) => {
  await crearOrden(orden)
  mostrarFormulario.value = false
}

onMounted(cargarDatos)
</script>

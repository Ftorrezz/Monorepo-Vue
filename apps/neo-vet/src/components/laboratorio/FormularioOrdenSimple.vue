<template>
  <q-card style="min-width: 800px; max-width: 900px" class="shadow-2">
    <q-card-section class="row items-center">
      <div class="text-h6">Nueva Orden de Laboratorio</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator />

    <!-- MODAL: SelectorEstudios existente -->
    <q-dialog v-model="mostrarSelector" maximized>
      <SelectorEstudios
        @estudios-seleccionados="estudiosSeleccionadosDelModal"
        @cancelar="mostrarSelector = false"
      />
    </q-dialog>

    <q-card-section class="q-pa-lg">
      <!-- SECCIÓN 1: DATOS DEL PACIENTE -->
      <div class="text-subtitle2 q-mb-md text-weight-bold">📋 Datos del Paciente</div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-input
            v-model="orden.paciente"
            label="Nombre del Paciente *"
            outlined
            dense
            :rules="[val => !!val || 'Requerido']"
          />
        </div>

        <div class="col-12 col-md-6">
          <q-select
            v-model="orden.profesionalSolicitante"
            :options="profesionales"
            option-label="nombre"
            option-value="id"
            label="Profes. Solicitante *"
            outlined
            dense
            :rules="[val => !!val || 'Requerido']"
          />
        </div>

        <div class="col-12 col-md-4">
          <q-select v-model="orden.especie" :options="especies" label="Especie" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model.number="orden.edad" label="Edad" type="number" outlined dense />
        </div>
        <div class="col-12 col-md-3">
          <q-select v-model="orden.sexo" :options="['Macho', 'Hembra', 'Indet.']" label="Sexo" outlined dense />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="orden.raza" label="Raza" outlined dense />
        </div>

        <div class="col-12">
          <q-input
            v-model="orden.diagnostico"
            label="Diagnóstico Presuntivo"
            outlined
            dense
            type="textarea"
            rows="2"
          />
        </div>

        <div class="col-12">
          <q-checkbox v-model="orden.esUrgente" label="⚠️ Marcar como URGENTE" color="negative" />
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <!-- SECCIÓN 2: AGREGAR ESTUDIOS -->
      <div class="text-subtitle2 q-mb-md text-weight-bold">🧪 Estudios a Solicitar</div>

      <div class="row q-col-gutter-md q-mb-md">
        <!-- Búsqueda rápida por código -->
        <div class="col-12 col-md-7">
          <q-input
            v-model="busquedaEstudio"
            label="Buscar por código o nombre"
            outlined
            dense
            clearable
            @keyup.enter="buscarYAgregar"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="busquedaEstudio">
              <q-btn
                flat
                dense
                round
                icon="add_circle"
                color="primary"
                @click="buscarYAgregar"
                title="Agregar resultado de búsqueda"
              />
            </template>
          </q-input>
        </div>

        <!-- Selector visual -->
        <div class="col-12 col-md-5">
          <q-btn
            color="primary"
            label="Selector de Estudios"
            icon="view_agenda"
            @click="mostrarSelector = true"
            class="full-width"
          />
        </div>
      </div>

      <!-- Estudios sugeridos o agrupados por categoría -->
      <div v-if="estudiosPorCategoria.length > 0 && orden.estudios.length === 0" class="q-mb-md">
        <div class="text-caption text-weight-bold text-grey-7 q-mb-sm">📌 Estudios más usados:</div>
        <div class="row q-col-gutter-sm">
          <div v-for="categoria in estudiosPorCategoria.slice(0, 5)" :key="categoria.codigo" class="col-auto">
            <q-btn
              flat
              outline
              size="sm"
              :label="`${categoria.codigo} (${categoria.tipoMuestra})`"
              @click="agregarEstudio(categoria)"
              color="primary"
            />
          </div>
        </div>
      </div>

      <!-- TABLA DE ESTUDIOS AGREGADOS -->
      <div v-if="orden.estudios.length > 0" class="q-mb-md">
        <div class="text-subtitle3 q-mb-sm text-weight-bold">
          ✓ {{ orden.estudios.length }} estudio{{ orden.estudios.length > 1 ? 's' : '' }} agregado{{ orden.estudios.length > 1 ? 's' : '' }}
        </div>

        <q-table
          :rows="orden.estudios"
          :columns="columnasTabla"
          row-key="codigo"
          flat
          bordered
          dense
          separator="cell"
        >
          <template v-slot:body-cell-muestra="props">
            <q-td>
              <q-chip
                size="sm"
                dense
                :label="props.row.muestra?.numeroMuestra || 'N/A'"
                color="blue"
                text-color="white"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td>
              <q-chip
                size="sm"
                dense
                :label="props.row.tipoMuestra"
                color="teal"
                text-color="white"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td align="center">
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete"
                color="negative"
                @click="removerEstudio(props.rowIndex)"
              />
            </q-td>
          </template>
        </q-table>
      </div>

      <div v-else class="text-center q-pa-md text-grey-7">
        <q-icon name="info" size="48px" class="q-mb-md" />
        <div>Agrega al menos un estudio</div>
      </div>

      <!-- RESUMEN DE MUESTRAS -->
      <div v-if="orden.estudios.length > 0" class="q-mt-md q-pa-md bg-blue-1 rounded-borders">
        <div class="text-subtitle3 text-weight-bold q-mb-sm">📦 Muestras que se generarán:</div>
        <div v-for="muestra in muestrasUnicas" :key="muestra.tipoMuestra" class="q-mb-sm">
          <q-icon name="local_shipping" size="xs" />
          <strong>{{ muestra.tipoMuestra.toUpperCase() }}:</strong>
          {{ muestra.numeroMuestra }}
          <span class="text-caption text-grey-7">({{ obtenerEstudiosPorTipo(muestra.tipoMuestra).length }} estudio{{ obtenerEstudiosPorTipo(muestra.tipoMuestra).length > 1 ? 's' : '' }})</span>
        </div>
      </div>
    </q-card-section>

    <!-- MODAL: Selector de Estudios -->
    <q-dialog v-model="mostrarSelector" maximized>
      <SelectorEstudios
        @estudios-seleccionados="estudiosSeleccionadosDelModal"
        @cancelar="mostrarSelector = false"
      />
    </q-dialog>

    <q-separator />

    <q-card-actions align="right" class="q-pa-md">
      <q-btn flat label="Cancelar" color="secondary" v-close-popup />
      <q-btn
        color="primary"
        label="Crear Orden"
        icon="check"
        :disable="!puedeGuardar"
        @click="guardarOrden"
        :loading="guardando"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { OrdenLaboratorio, Estudio, TipoMuestra, EstadoOrden, EstadoResultado } from 'src/types/laboratorio'
import GeneradorMuestrasService from 'src/services/generadorMuestras.service'
import SelectorEstudios from './SelectorEstudios.vue'

const $q = useQuasar()

const emit = defineEmits<{
  (e: 'cancelar'): void
  (e: 'guardar', orden: OrdenLaboratorio): void
}>()

const guardando = ref(false)
const nuevoEstudio = ref<any>(null)
const busquedaEstudio = ref('')
const mostrarSelector = ref(false)

const orden = ref<OrdenLaboratorio>({
  numeroOrden: `ORD${Date.now().toString().slice(-6)}`,
  paciente: '',
  profesionalSolicitante: '',
  especie: '',
  edad: undefined,
  sexo: '',
  raza: '',
  diagnostico: '',
  esUrgente: false,
  estado: EstadoOrden.BORRADOR,
  estudios: [],
  muestras: [],
  fechaCreacion: new Date().toISOString()
} as OrdenLaboratorio)

const profesionales = ref([
  { id: 1, nombre: 'Dr. Juan Pérez' },
  { id: 2, nombre: 'Dra. María García' },
  { id: 3, nombre: 'Dr. Carlos López' }
])

const especies = ref(['Canino', 'Felino', 'Equino', 'Bovino', 'Ovino', 'Porcino', 'Ave'])

// Base de estudios más completa
const estudiosDisponibles = ref<Estudio[]>([
  // SANGRE
  { codigo: 'GLU', nombre: 'Glucosa', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'CRTNN', nombre: 'Creatinina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'URE', nombre: 'Urea', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'ALB', nombre: 'Albúmina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'PROT', nombre: 'Proteína Total', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'ALAT', nombre: 'ALAT', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'ASAT', nombre: 'ASAT', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'FAL', nombre: 'Fosfatasa Alcalina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'HEM', nombre: 'Hemograma', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'TP', nombre: 'Tiempo de Protrombina', tipoMuestra: 'sangre' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  // ORINA
  { codigo: 'EO', nombre: 'Examen de Orina', tipoMuestra: 'orina' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'UC', nombre: 'Urocultivo', tipoMuestra: 'orina' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  // HECES
  { codigo: 'EH', nombre: 'Examen de Heces', tipoMuestra: 'heces' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  { codigo: 'COP', nombre: 'Coprocultivo', tipoMuestra: 'heces' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
  // OTROS
  { codigo: 'CULT', nombre: 'Cultivo General', tipoMuestra: 'fluido' as TipoMuestra, prioridad: 'normal', estado: EstadoResultado.PENDIENTE },
])

const columnasTabla = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipoMuestra', align: 'center' as const },
  { name: 'muestra', label: 'Número de Muestra', field: (row: any) => row.muestra?.numeroMuestra, align: 'left' as const },
  { name: 'acciones', label: 'Acción', field: 'acciones', align: 'center' as const }
]

// Estudios agrupados por categoría para sugerencias
const estudiosPorCategoria = computed(() => {
  return estudiosDisponibles.value.filter(
    e => !orden.value.estudios.some(o => o.codigo === e.codigo)
  )
})

// Búsqueda rápida: filtrar por código o nombre
const buscarYAgregar = () => {
  const termino = busquedaEstudio.value.toLowerCase().trim()
  if (!termino) return

  const encontrado = estudiosDisponibles.value.find(
    e => e.codigo.toLowerCase() === termino || 
         e.nombre.toLowerCase().includes(termino)
  )

  if (encontrado) {
    agregarEstudio(encontrado)
    busquedaEstudio.value = ''
  } else {
    $q.notify({
      type: 'warning',
      message: `No encontrado: ${termino}`,
      position: 'top'
    })
  }
}

const agregarEstudio = (estudio: Estudio) => {
  // Verificar duplicado
  if (orden.value.estudios.some(e => e.codigo === estudio.codigo)) {
    $q.notify({
      type: 'warning',
      message: 'Este estudio ya está agregado',
      position: 'top'
    })
    return
  }

  // Generar número de muestra
  const numeroMuestra = GeneradorMuestrasService.generarNumeroMuestra(
    orden.value.numeroOrden,
    estudio.tipoMuestra as TipoMuestra
  )

  const muestra = {
    numeroMuestra: numeroMuestra.numeroMuestra,
    tipoMuestra: estudio.tipoMuestra,
    descripcion: `Muestra para ${estudio.nombre}`,
    estado: 'recepcionada' as const,
    fechaGeneracion: new Date().toISOString()
  }

  const nuevoEst: Estudio = {
    ...estudio,
    estado: EstadoResultado.PENDIENTE,
    muestra
  }

  orden.value.estudios.push(nuevoEst)
  orden.value.muestras.push(muestra)

  nuevoEstudio.value = null

  $q.notify({
    type: 'positive',
    message: `✓ ${estudio.nombre} agregado`,
    position: 'top'
  })
}

// Procesa los estudios seleccionados desde el SelectorEstudios modal
const estudiosSeleccionadosDelModal = (ejemplosSeleccionados: any[]) => {
  if (!ejemplosSeleccionados || ejemplosSeleccionados.length === 0) return

  let agregados = 0
  ejemplosSeleccionados.forEach(estudioDelSelector => {
    // Mapear solo las propiedades que necesita Estudio
    const estudioMapeado: Estudio = {
      codigo: estudioDelSelector.codigo,
      nombre: estudioDelSelector.nombre,
      tipoMuestra: (estudioDelSelector.tipoMuestra || 'sangre') as TipoMuestra,
      id: estudioDelSelector.id,
      prioridad: 'normal',
      estado: EstadoResultado.PENDIENTE,
      descripcion: estudioDelSelector.descripcion
    }

    // Verificar que no esté duplicado
    if (!orden.value.estudios.some(e => e.codigo === estudioMapeado.codigo)) {
      agregarEstudio(estudioMapeado)
      agregados++
    }
  })

  mostrarSelector.value = false

  $q.notify({
    type: 'positive',
    message: `✓ ${agregados} estudio${agregados > 1 ? 's' : ''} agregado${agregados > 1 ? 's' : ''}`,
    position: 'top'
  })
}

const removerEstudio = (index: number) => {
  const estudio = orden.value.estudios[index]
  orden.value.estudios.splice(index, 1)
  orden.value.muestras = orden.value.muestras.filter(m => m.numeroMuestra !== estudio.muestra?.numeroMuestra)

  $q.notify({
    type: 'info',
    message: `✗ ${estudio.nombre} removido`,
    position: 'top'
  })
}

const filtrarEstudios = (val: string, update: any) => {
  if (val === '') {
    update(() => {})
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    // El select ya filtra automáticamente
  })
}

const muestrasUnicas = computed(() => {
  const map = new Map()
  orden.value.estudios.forEach(estudio => {
    if (estudio.muestra && !map.has(estudio.muestra.tipoMuestra)) {
      map.set(estudio.muestra.tipoMuestra, estudio.muestra)
    }
  })
  return Array.from(map.values())
})

const obtenerEstudiosPorTipo = (tipo: string) => {
  return orden.value.estudios.filter(e => e.tipoMuestra === tipo)
}

const puedeGuardar = computed(() => {
  return (
    !!orden.value.paciente &&
    !!orden.value.profesionalSolicitante &&
    orden.value.estudios.length > 0
  )
})

const guardarOrden = async () => {
  if (!puedeGuardar.value) return

  guardando.value = true

  try {
    // Simular delay de guardado
    await new Promise(resolve => setTimeout(resolve, 800))

    emit('guardar', orden.value)

    $q.notify({
      type: 'positive',
      message: `✓ Orden ${orden.value.numeroOrden} creada exitosamente`,
      position: 'top'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al crear la orden',
      position: 'top'
    })
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped lang="scss">
.rounded-borders {
  border-radius: 4px;
}
</style>

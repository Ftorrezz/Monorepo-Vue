<template>
  <div class="laboratorio-abm">
    <!-- Cabecera -->
    <div class="abm-header">
      <div class="header-title">
        <q-icon name="analytics" size="32px" color="primary" class="q-mr-md" />
        <div>
          <div class="text-h5">Gestión de Pruebas</div>
          <div class="text-subtitle2 text-grey-7">Tests específicos dentro de cada estudio (Hemoglobina, Glucosa, etc.)</div>
        </div>
      </div>
    </div>

    <!-- Barra de herramientas -->
    <div class="abm-toolbar">
      <q-btn
        color="primary"
        icon="add"
        label="Nueva Prueba"
        @click="abrirModal()"
        no-caps
      />

      <q-select
        v-model="filtroEstudio"
        :options="estudiosDisponibles"
        outlined
        dense
        clearable
        placeholder="Filtrar por estudio"
        emit-value
        map-options
        option-label="nombre"
        option-value="id"
        class="filter-select"
      />

      <q-input
        v-model="busqueda"
        outlined
        dense
        placeholder="Buscar..."
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-space />

      <q-btn
        flat
        round
        icon="download"
        color="info"
        @click="exportarCSV"
      >
        <q-tooltip>Exportar</q-tooltip>
      </q-btn>

      <q-btn
        flat
        round
        icon="refresh"
        color="info"
        @click="cargarPruebas"
        :loading="cargando"
      />
    </div>

    <!-- TABLA -->
    <q-card class="abm-tabla">
      <q-table
        :rows="pruebasFiltradas"
        :columns="columns"
        row-key="id"
        :loading="cargando"
        :pagination.sync="pagination"
        @request="cargarPruebas"
      >
        <template v-slot:body-cell-estudio="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ obtenerNombreEstudio(props.row.idEstudio) }}</div>
            <div class="text-caption text-grey-7">{{ obtenerCodigoEstudio(props.row.idEstudio) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-codigo="props">
          <q-td :props="props">
            <q-badge :label="props.row.codigo" color="primary" />
          </q-td>
        </template>

        <template v-slot:body-cell-unidad="props">
          <q-td :props="props">
            <div class="text-caption">
              {{ props.row.unidadMedida }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :label="props.row.estado"
              :color="props.row.estado === 'activo' ? 'positive' : 'negative'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              size="sm"
              icon="edit"
              color="primary"
              @click="abrirModal(props.row)"
            />
            <q-btn
              flat
              round
              size="sm"
              icon="delete"
              color="negative"
              @click="eliminarPrueba(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL -->
    <q-dialog v-model="mostrarModal" @hide="resetFormulario">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editando ? 'Editar Prueba' : 'Nueva Prueba' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="q-gutter-md">
            <!-- Estudio -->
            <q-select
              v-model="formulario.idEstudio"
              :options="estudiosDisponibles"
              label="Estudio *"
              outlined
              dense
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              :rules="[val => !!val || 'Requerido']"
            />

            <!-- Código -->
            <q-input
              v-model="formulario.codigo"
              label="Código de Prueba *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
              hint="Ej: HGB, GLU, CREA"
              style="text-transform: uppercase"
            />

            <!-- Nombre -->
            <q-input
              v-model="formulario.nombre"
              label="Nombre de la Prueba *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
              hint="Ej: Hemoglobina, Glucosa, Creatinina"
            />

            <!-- Unidad de Medida -->
            <q-input
              v-model="formulario.unidadMedida"
              label="Unidad de Medida *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
              hint="Ej: g/dL, mg/dL, U/L, x10³/µL"
            />

            <!-- Decimales -->
            <q-input
              v-model.number="formulario.decimalesPermitidos"
              label="Decimales Permitidos"
              outlined
              dense
              type="number"
              min="0"
              max="6"
            />

            <!-- Método -->
            <q-input
              v-model="formulario.metodoMedicion"
              label="Método de Medición"
              outlined
              dense
              hint="Ej: Espectrofotometría, Citometría de Flujo"
            />

            <!-- Notas -->
            <q-input
              v-model="formulario.notas"
              label="Notas / Observaciones"
              outlined
              type="textarea"
              rows="2"
            />

            <!-- Estado -->
            <q-select
              v-model="formulario.estado"
              :options="['activo', 'inactivo']"
              label="Estado"
              outlined
              dense
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="secondary" v-close-popup />
          <q-btn
            flat
            label="Guardar"
            color="primary"
            @click="guardarPrueba"
            :loading="guardando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import PruebasService from 'src/services/pruebas.service'
import EstudiosService from 'src/services/estudios.service'
import { Prueba, CreatePrueba } from 'src/types/laboratorio-catalogo'

const $q = useQuasar()

// Estado
const cargando = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const editando = ref(false)
const busqueda = ref('')
const filtroEstudio = ref<number | null>(null)
const pruebas = ref<Prueba[]>([])
const estudios = ref<any[]>([])

// Formulario
const formulario = ref<CreatePrueba>({
  idEstudio: null as any,
  codigo: '',
  nombre: '',
  unidadMedida: '',
  decimalesPermitidos: 2,
  metodoMedicion: '',
  notas: '',
  estado: 'activo'
})

const pruebaEditando = ref<Prueba | null>(null)

// Paginación
const pagination = ref({
  sortBy: 'nombre',
  descending: false,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const columns = [
  { name: 'estudio', label: 'Estudio', field: 'idEstudio', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre Prueba', field: 'nombre', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidadMedida', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Datos disponibles
const estudiosDisponibles = computed(() => {
  return estudios.value.map(e => ({
    id: e.id,
    nombre: `${e.codigo} - ${e.nombre}`,
    codigo: e.codigo
  }))
})

// Computed
const pruebasFiltradas = computed(() => {
  return pruebas.value.filter(p => {
    const coincideBusqueda =
      !busqueda.value ||
      p.codigo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      p.nombre.toLowerCase().includes(busqueda.value.toLowerCase())

    const coincideEstudio = !filtroEstudio.value || p.idEstudio === filtroEstudio.value

    return coincideBusqueda && coincideEstudio
  })
})

// Métodos
const cargarPruebas = async () => {
  cargando.value = true
  try {
    const res = await PruebasService.obtenerPruebas(pagination.value.page, pagination.value.rowsPerPage)
    pruebas.value = res.data.data
    pagination.value.rowsNumber = res.data.total
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar pruebas'
    })
  } finally {
    cargando.value = false
  }
}

const cargarEstudios = async () => {
  try {
    const res = await EstudiosService.obtenerActivos()
    estudios.value = res.data
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar estudios'
    })
  }
}

const abrirModal = (prueba?: Prueba) => {
  if (prueba) {
    editando.value = true
    pruebaEditando.value = prueba
    formulario.value = { ...prueba }
  } else {
    editando.value = false
    resetFormulario()
  }
  mostrarModal.value = true
}

const resetFormulario = () => {
  formulario.value = {
    idEstudio: null as any,
    codigo: '',
    nombre: '',
    unidadMedida: '',
    decimalesPermitidos: 2,
    metodoMedicion: '',
    notas: '',
    estado: 'activo'
  }
}

const guardarPrueba = async () => {
  guardando.value = true
  try {
    if (editando.value && pruebaEditando.value) {
      await PruebasService.actualizarPrueba(pruebaEditando.value.id, formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Prueba actualizada'
      })
    } else {
      await PruebasService.crearPrueba(formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Prueba creada'
      })
    }
    mostrarModal.value = false
    cargarPruebas()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar'
    })
  } finally {
    guardando.value = false
  }
}

const eliminarPrueba = async (id: number) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar esta prueba?',
    cancel: true
  }).onOk(async () => {
    try {
      await PruebasService.eliminarPrueba(id)
      $q.notify({ type: 'positive', message: 'Eliminada' })
      cargarPruebas()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: 'Error' })
    }
  })
}

const exportarCSV = async () => {
  try {
    // Implementar exportación si lo deseas
    $q.notify({ type: 'info', message: 'Exportación en desarrollo' })
  } catch (err: any) {
    $q.notify({ type: 'negative', message: 'Error' })
  }
}

const obtenerNombreEstudio = (idEstudio: number): string => {
  return estudios.value.find(e => e.id === idEstudio)?.nombre || 'Desconocido'
}

const obtenerCodigoEstudio = (idEstudio: number): string => {
  return estudios.value.find(e => e.id === idEstudio)?.codigo || ''
}

// Ciclo de vida
onMounted(() => {
  cargarEstudios()
  cargarPruebas()
})
</script>

<style scoped lang="scss">
.laboratorio-abm {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.abm-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .header-title {
    display: flex;
    align-items: center;
  }
}

.abm-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .search-input {
    min-width: 300px;
  }

  .filter-select {
    min-width: 200px;
  }
}

.abm-tabla {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>

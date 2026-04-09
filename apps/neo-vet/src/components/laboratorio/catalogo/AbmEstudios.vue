<template>
  <div class="laboratorio-abm">
    <!-- Cabecera -->
    <div class="abm-header">
      <div class="header-title">
        <q-icon name="science" size="32px" color="primary" class="q-mr-md" />
        <div>
          <div class="text-h5">Gestión de Estudios</div>
          <div class="text-subtitle2 text-grey-7">Crear, editar y administrar catálogo de estudios laboratoriales</div>
        </div>
      </div>
    </div>

    <!-- Barra de herramientas -->
    <div class="abm-toolbar">
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Estudio"
        @click="abrirModal()"
        no-caps
      />
      <q-input
        v-model="busqueda"
        outlined
        dense
        placeholder="Buscar por código, nombre..."
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-select
        v-model="categoriaFiltro"
        :options="categorias"
        outlined
        dense
        clearable
        placeholder="Filtrar por categoría"
        class="filter-select"
      />
      <q-space />
      <q-btn
        flat
        round
        icon="download"
        color="info"
        @click="exportarCSV"
      >
        <q-tooltip>Exportar CSV</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        icon="upload"
        color="info"
        @click="$refs.fileUpload.click()"
      >
        <q-tooltip>Importar CSV</q-tooltip>
      </q-btn>
      <input
        ref="fileUpload"
        type="file"
        accept=".csv"
        style="display: none"
        @change="importarCSV"
      />
      <q-btn
        flat
        round
        icon="refresh"
        color="info"
        @click="cargarEstudios"
        :loading="cargando"
      />
    </div>

    <!-- TABLA DE ESTUDIOS -->
    <q-card class="abm-tabla">
      <q-table
        :rows="estudiosFiltrados"
        :columns="columns"
        row-key="id"
        selection="multiple"
        v-model:selected="seleccionados"
        :loading="cargando"
        :pagination.sync="pagination"
        @request="cargarEstudios"
      >
        <template v-slot:body-cell-categoria="props">
          <q-td :props="props">
            <q-badge :label="props.row.categoria" color="blue" />
          </q-td>
        </template>

        <template v-slot:body-cell-costo="props">
          <q-td :props="props">
            <strong>${{ props.row.costo.toFixed(2) }}</strong>
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
              @click="eliminarEstudio(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL CREAR/EDITAR -->
    <q-dialog v-model="mostrarModal" @hide="resetFormulario">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editando ? 'Editar Estudio' : 'Nuevo Estudio' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="q-gutter-md">
            <!-- Código -->
            <q-input
              v-model="formulario.codigo"
              label="Código *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
              hint="Ej: HEM001"
            />

            <!-- Nombre -->
            <q-input
              v-model="formulario.nombre"
              label="Nombre *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
              hint="Ej: Hematología Completa"
            />

            <!-- Categoría -->
            <q-select
              v-model="formulario.categoria"
              :options="categorias"
              label="Categoría *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
            />

            <!-- Descripción -->
            <q-input
              v-model="formulario.descripcion"
              label="Descripción"
              outlined
              type="textarea"
              rows="3"
            />

            <!-- Costo -->
            <q-input
              v-model.number="formulario.costo"
              label="Costo ($) *"
              outlined
              dense
              type="number"
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
            />

            <!-- Tiempo Resultado -->
            <q-input
              v-model.number="formulario.tiempoResultado"
              label="Tiempo de Resultado (horas) *"
              outlined
              dense
              type="number"
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
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
            @click="guardarEstudio"
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
import EstudiosService from 'src/services/estudios.service'
import { Estudio, CreateEstudio, CategoriaEstudio } from 'src/types/laboratorio-catalogo'

const $q = useQuasar()

// Estado
const cargando = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const editando = ref(false)
const busqueda = ref('')
const categoriaFiltro = ref(null)
const estudios = ref<Estudio[]>([])
const seleccionados = ref<Estudio[]>([])

// Formulario
const formulario = ref<CreateEstudio>({
  codigo: '',
  nombre: '',
  categoria: 'Hematología',
  descripcion: '',
  costo: 0,
  tiempoResultado: 4,
  estado: 'activo'
})

const estudioEditando = ref<Estudio | null>(null)

// Paginación
const pagination = ref({
  sortBy: 'nombre',
  descending: false,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

// Datos
const categorias = Object.values(CategoriaEstudio)

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'costo', label: 'Costo', field: 'costo', align: 'right' },
  { name: 'tiempoResultado', label: 'Tiempo (h)', field: 'tiempoResultado', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Computed
const estudiosFiltrados = computed(() => {
  return estudios.value.filter(e => {
    const coincideBusqueda =
      !busqueda.value ||
      e.codigo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      e.nombre.toLowerCase().includes(busqueda.value.toLowerCase())

    const coincideCategoria = !categoriaFiltro.value || e.categoria === categoriaFiltro.value

    return coincideBusqueda && coincideCategoria
  })
})

// Métodos
const cargarEstudios = async () => {
  cargando.value = true
  try {
    const res = await EstudiosService.obtenerEstudios(pagination.value.page, pagination.value.rowsPerPage)
    estudios.value = res.data.data
    pagination.value.rowsNumber = res.data.total
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar estudios: ' + (err.response?.data?.message || err.message)
    })
  } finally {
    cargando.value = false
  }
}

const abrirModal = (estudio?: Estudio) => {
  if (estudio) {
    editando.value = true
    estudioEditando.value = estudio
    formulario.value = { ...estudio }
  } else {
    editando.value = false
    resetFormulario()
  }
  mostrarModal.value = true
}

const resetFormulario = () => {
  formulario.value = {
    codigo: '',
    nombre: '',
    categoria: 'Hematología',
    descripcion: '',
    costo: 0,
    tiempoResultado: 4,
    estado: 'activo'
  }
  editando.value = false
  estudioEditando.value = null
}

const guardarEstudio = async () => {
  guardando.value = true
  try {
    if (editando.value && estudioEditando.value) {
      await EstudiosService.actualizarEstudio(estudioEditando.value.id, formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Estudio actualizado exitosamente'
      })
    } else {
      await EstudiosService.crearEstudio(formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Estudio creado exitosamente'
      })
    }
    mostrarModal.value = false
    cargarEstudios()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar: ' + (err.response?.data?.message || err.message)
    })
  } finally {
    guardando.value = false
  }
}

const eliminarEstudio = async (id: number) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro que desea eliminar este estudio?',
    cancel: true
  }).onOk(async () => {
    try {
      await EstudiosService.eliminarEstudio(id)
      $q.notify({
        type: 'positive',
        message: 'Estudio eliminado'
      })
      cargarEstudios()
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar: ' + (err.response?.data?.message || err.message)
      })
    }
  })
}

const exportarCSV = async () => {
  try {
    const blob = await EstudiosService.exportarCSV()
    const url = window.URL.createObjectURL(blob.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `estudios-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al exportar'
    })
  }
}

const importarCSV = async (event: any) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const res = await EstudiosService.importarCSV(file)
    $q.notify({
      type: 'positive',
      message: `${res.data.importados} estudios importados`
    })
    cargarEstudios()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al importar: ' + (err.response?.data?.message || err.message)
    })
  }
}

// Ciclo de vida
onMounted(() => {
  cargarEstudios()
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

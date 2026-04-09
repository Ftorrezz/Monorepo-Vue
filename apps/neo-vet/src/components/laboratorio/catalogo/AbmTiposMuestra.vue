<template>
  <div class="laboratorio-abm">
    <!-- Cabecera -->
    <div class="abm-header">
      <div class="header-title">
        <q-icon name="invert_colors" size="32px" color="primary" class="q-mr-md" />
        <div>
          <div class="text-h5">Tipos de Muestra</div>
          <div class="text-subtitle2 text-grey-7">Gestionar tipos de muestras (sangre, orina, heces, etc.)</div>
        </div>
      </div>
    </div>

    <!-- Barra de herramientas -->
    <div class="abm-toolbar">
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Tipo"
        @click="abrirModal()"
        no-caps
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
        icon="upload"
        color="info"
        @click="$refs.fileUpload.click()"
      >
        <q-tooltip>Importar</q-tooltip>
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
        @click="cargarTipos"
        :loading="cargando"
      />
    </div>

    <!-- TABLA -->
    <q-card class="abm-tabla">
      <q-table
        :rows="tiposFiltrados"
        :columns="columns"
        row-key="id"
        :loading="cargando"
        :pagination.sync="pagination"
        @request="cargarTipos"
      >
        <template v-slot:body-cell-requisitos="props">
          <q-td :props="props">
            <div class="q-gutter-xs">
              <q-badge
                v-if="props.row.requiereAyuno"
                label="Ayuno"
                color="orange"
              />
              <q-badge
                v-if="props.row.requiereRefrigeracion"
                label="Refrigeración"
                color="blue"
              />
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-tiempo="props">
          <q-td :props="props">
            {{ props.row.tiempoExpiracion }}h
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
              @click="eliminarTipo(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL -->
    <q-dialog v-model="mostrarModal" @hide="resetFormulario">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editando ? 'Editar Tipo' : 'Nuevo Tipo de Muestra' }}</div>
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
              hint="Ej: SANGRE, ORINA, HECES"
            />

            <!-- Nombre -->
            <q-input
              v-model="formulario.nombre"
              label="Nombre *"
              outlined
              dense
              :rules="[val => !!val || 'Requerido']"
              hint="Ej: Sangre con EDTA"
            />

            <!-- Descripción -->
            <q-input
              v-model="formulario.descripcion"
              label="Descripción"
              outlined
              type="textarea"
              rows="2"
            />

            <!-- Requisito Ayuno -->
            <q-checkbox
              v-model="formulario.requiereAyuno"
              label="Requiere Ayuno"
            />

            <!-- Requisito Refrigeración -->
            <q-checkbox
              v-model="formulario.requiereRefrigeracion"
              label="Requiere Refrigeración"
            />

            <!-- Tiempo Expiración -->
            <q-input
              v-model.number="formulario.tiempoExpiracion"
              label="Tiempo de Expiración (horas) *"
              outlined
              dense
              type="number"
              :rules="[val => val > 0 || 'Debe ser mayor a 0']"
            />

            <!-- Instrucciones -->
            <q-input
              v-model="formulario.instruccionesRecoleccion"
              label="Instrucciones de Recolección"
              outlined
              type="textarea"
              rows="3"
              hint="Ej: Frasco con tapa de rosca, 10ml mínimo, tubo EDTA púrpura"
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
            @click="guardarTipo"
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
import TiposMuestraService from 'src/services/tipos-muestra.service'
import { TipoMuestra, CreateTipoMuestra } from 'src/types/laboratorio-catalogo'

const $q = useQuasar()

// Estado
const cargando = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const editando = ref(false)
const busqueda = ref('')
const tipos = ref<TipoMuestra[]>([])

// Formulario
const formulario = ref<CreateTipoMuestra>({
  codigo: '',
  nombre: '',
  descripcion: '',
  requiereAyuno: false,
  requiereRefrigeracion: false,
  tiempoExpiracion: 24,
  instruccionesRecoleccion: '',
  estado: 'activo'
})

const tipoEditando = ref<TipoMuestra | null>(null)

// Paginación
const pagination = ref({
  sortBy: 'nombre',
  descending: false,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'requisitos', label: 'Requisitos', field: 'requisitos', align: 'left' },
  { name: 'tiempo', label: 'Expira', field: 'tiempoExpiracion', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

// Computed
const tiposFiltrados = computed(() => {
  return tipos.value.filter(t => {
    return (
      !busqueda.value ||
      t.codigo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      t.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
    )
  })
})

// Métodos
const cargarTipos = async () => {
  cargando.value = true
  try {
    const res = await TiposMuestraService.obtenerTipos(pagination.value.page, pagination.value.rowsPerPage)
    tipos.value = res.data.data
    pagination.value.rowsNumber = res.data.total
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar tipos'
    })
  } finally {
    cargando.value = false
  }
}

const abrirModal = (tipo?: TipoMuestra) => {
  if (tipo) {
    editando.value = true
    tipoEditando.value = tipo
    formulario.value = { ...tipo }
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
    descripcion: '',
    requiereAyuno: false,
    requiereRefrigeracion: false,
    tiempoExpiracion: 24,
    instruccionesRecoleccion: '',
    estado: 'activo'
  }
}

const guardarTipo = async () => {
  guardando.value = true
  try {
    if (editando.value && tipoEditando.value) {
      await TiposMuestraService.actualizarTipo(tipoEditando.value.id, formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Tipo actualizado'
      })
    } else {
      await TiposMuestraService.crearTipo(formulario.value)
      $q.notify({
        type: 'positive',
        message: 'Tipo creado'
      })
    }
    mostrarModal.value = false
    cargarTipos()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar'
    })
  } finally {
    guardando.value = false
  }
}

const eliminarTipo = async (id: number) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este tipo de muestra?',
    cancel: true
  }).onOk(async () => {
    try {
      await TiposMuestraService.eliminarTipo(id)
      $q.notify({ type: 'positive', message: 'Eliminado' })
      cargarTipos()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: 'Error' })
    }
  })
}

const exportarCSV = async () => {
  try {
    const blob = await TiposMuestraService.exportarCSV()
    const url = window.URL.createObjectURL(blob.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `tipos-muestra-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: 'Error' })
  }
}

const importarCSV = async (event: any) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const res = await TiposMuestraService.importarCSV(file)
    $q.notify({
      type: 'positive',
      message: `${res.data.importados} tipos importados`
    })
    cargarTipos()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: 'Error' })
  }
}

// Ciclo de vida
onMounted(() => {
  cargarTipos()
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
}

.abm-tabla {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>

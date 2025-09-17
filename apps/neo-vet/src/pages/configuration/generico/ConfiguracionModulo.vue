<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div>
        <h5 class="q-ma-none">Administración de Módulos</h5>
        <p class="text-grey-7 q-ma-none">Gestiona los módulos de configuración del sistema</p>
      </div>
      <q-btn 
        color="primary" 
        label="Nuevo Módulo" 
        icon="add"
        @click="abrirFormulario()"
      />
    </div>

    <!-- Tabla de módulos -->
    <q-table
      :rows="modulos"
      :columns="columnas"
      :loading="loading"
      row-key="id"
      flat
      bordered
    >
      <template v-slot:body-cell-icono="props">
        <q-td :props="props">
          <q-icon :name="props.value" :color="props.row.color" size="md" />
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.value"
            @update:model-value="cambiarEstado(props.row.id, $event)"
            color="positive"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn-group flat>
            <q-btn
              flat
              icon="edit"
              color="primary"
              size="sm"
              @click="editarModulo(props.row)"
              :disable="loading"
            >
              <q-tooltip>Editar módulo</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="tune"
              color="secondary"
              size="sm"
              @click="gestionarCampos(props.row)"
              :disable="loading"
            >
              <q-tooltip>Gestionar campos</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="settings"
              color="warning"
              size="sm"
              @click="configurarModulo(props.row)"
              :disable="loading"
            >
              <q-tooltip>Configurar valores</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="delete"
              color="negative"
              size="sm"
              @click="eliminarModulo(props.row)"
              :disable="loading"
            >
              <q-tooltip>Eliminar módulo</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog para crear/editar módulo -->
    <q-dialog v-model="mostrarFormulario" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ modoEdicion ? 'Editar Módulo' : 'Nuevo Módulo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarModulo" ref="formulario">
            <q-input
              v-model="formularioModulo.nombre"
              label="Nombre del módulo *"
              :rules="[val => !!val || 'El nombre es requerido']"
              outlined
              dense
              class="q-mb-md"
            />

            <q-input
              v-model="formularioModulo.descripcion"
              label="Descripción"
              outlined
              dense
              type="textarea"
              rows="3"
              class="q-mb-md"
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="formularioModulo.icono"
                  :options="iconosDisponibles"
                  label="Icono"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon :name="scope.opt.value" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col">
                <q-select
                  v-model="formularioModulo.color"
                  :options="coloresDisponibles"
                  label="Color"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon name="circle" :color="scope.opt.value" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <q-input
              v-model.number="formularioModulo.orden"
              label="Orden"
              outlined
              dense
              type="number"
              class="q-mt-md"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn 
            color="primary" 
            label="Guardar" 
            @click="$refs.formulario.submit()"
            :loading="guardando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

// Estado reactivo
const loading = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const modulos = ref([])

// Formulario
const formularioModulo = reactive({
  id: null,
  nombre: '',
  descripcion: '',
  icono: 'settings',
  color: 'primary',
  orden: 0,
  activo: true
})

// Columnas de la tabla
const columnas = [
  {
    name: 'icono',
    label: '',
    field: 'icono',
    align: 'center',
    style: 'width: 50px'
  },
  {
    name: 'nombre',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: 'nombre',
    sortable: true
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left'
  },
  {
    name: 'orden',
    label: 'Orden',
    field: 'orden',
    align: 'center',
    sortable: true,
    style: 'width: 80px'
  },
  {
    name: 'activo',
    label: 'Activo',
    field: 'activo',
    align: 'center',
    style: 'width: 80px'
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    style: 'width: 200px'
  }
]

// Opciones para formulario
const iconosDisponibles = [
  { label: 'Configuración', value: 'settings' },
  { label: 'Usuarios', value: 'people' },
  { label: 'Sistema', value: 'computer' },
  { label: 'Notificaciones', value: 'notifications' },
  { label: 'Seguridad', value: 'security' },
  { label: 'Base de datos', value: 'storage' },
  { label: 'Email', value: 'email' },
  { label: 'Dashboard', value: 'dashboard' }
]

const coloresDisponibles = [
  { label: 'Primario', value: 'primary' },
  { label: 'Secundario', value: 'secondary' },
  { label: 'Positivo', value: 'positive' },
  { label: 'Negativo', value: 'negative' },
  { label: 'Advertencia', value: 'warning' },
  { label: 'Info', value: 'info' }
]

// Métodos
const cargarModulos = async () => {
  loading.value = true
  try {
    // Aquí harías la llamada a tu API
    // const response = await api.get('/modulos-configuracion')
    // modulos.value = response.data
    
    // Datos de ejemplo
    modulos.value = [
      {
        id: 1,
        nombre: 'usuarios',
        descripcion: 'Configuración de usuarios del sistema',
        icono: 'people',
        color: 'primary',
        orden: 1,
        activo: true
      },
      {
        id: 2,
        nombre: 'sistema',
        descripcion: 'Configuración general del sistema',
        icono: 'settings',
        color: 'secondary',
        orden: 2,
        activo: true
      }
    ]
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar módulos'
    })
  } finally {
    loading.value = false
  }
}

const abrirFormulario = (modulo = null) => {
  modoEdicion.value = !!modulo
  if (modulo) {
    Object.assign(formularioModulo, modulo)
  } else {
    limpiarFormulario()
  }
  mostrarFormulario.value = true
}

const limpiarFormulario = () => {
  Object.assign(formularioModulo, {
    id: null,
    nombre: '',
    descripcion: '',
    icono: 'settings',
    color: 'primary',
    orden: 0,
    activo: true
  })
}

const guardarModulo = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value) {
      // await api.put(`/modulos-configuracion/${formularioModulo.id}`, formularioModulo)
      const index = modulos.value.findIndex(m => m.id === formularioModulo.id)
      if (index !== -1) {
        modulos.value[index] = { ...formularioModulo }
      }
      $q.notify({
        type: 'positive',
        message: 'Módulo actualizado correctamente'
      })
    } else {
      // const response = await api.post('/modulos-configuracion', formularioModulo)
      modulos.value.push({
        ...formularioModulo,
        id: Date.now() // Simulado
      })
      $q.notify({
        type: 'positive',
        message: 'Módulo creado correctamente'
      })
    }
    mostrarFormulario.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar módulo'
    })
  } finally {
    guardando.value = false
  }
}

const editarModulo = (modulo) => {
  abrirFormulario(modulo)
}

const cambiarEstado = async (id, estado) => {
  try {
    // await api.patch(`/modulos-configuracion/${id}`, { activo: estado })
    const index = modulos.value.findIndex(m => m.id === id)
    if (index !== -1) {
      modulos.value[index].activo = estado
    }
    $q.notify({
      type: 'positive',
      message: `Módulo ${estado ? 'activado' : 'desactivado'}`
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar estado'
    })
  }
}

const gestionarCampos = (modulo) => {
  router.push(`/admin/modulos/${modulo.id}/campos`)
}

const configurarModulo = (modulo) => {
  router.push(`/admin/configuracion/${modulo.nombre}`)
}

const eliminarModulo = (modulo) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el módulo "${modulo.nombre}"? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      // await api.delete(`/modulos-configuracion/${modulo.id}`)
      modulos.value = modulos.value.filter(m => m.id !== modulo.id)
      $q.notify({
        type: 'positive',
        message: 'Módulo eliminado correctamente'
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar módulo'
      })
    }
  })
}

// Ciclo de vida
onMounted(() => {
  cargarModulos()
})
</script>
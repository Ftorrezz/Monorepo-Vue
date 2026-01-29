<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <div>
        <h5 class="q-ma-none">Configuración de Servicios Dinámicos</h5>
        <p class="text-grey-7 q-ma-none">Gestiona las definiciones de servicios altamente configurables (EAV)</p>
      </div>
      <q-btn 
        color="primary" 
        label="Nuevo Servicio" 
        icon="add"
        @click="abrirFormulario()"
      />
    </div>

    <!-- Tabla de servicios -->
    <q-table
      :rows="servicios"
      :columns="columnas"
      :loading="loading"
      row-key="id_servicio_def"
      flat
      bordered
    >
      <template v-slot:body-cell-icono="props">
        <q-td :props="props">
          <q-avatar size="32px" color="primary" text-color="white" :icon="props.value || 'auto_awesome'" />
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.value"
            @update:model-value="cambiarEstado(props.row, $event)"
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
              @click="editarServicio(props.row)"
            >
              <q-tooltip>Editar definición</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="account_tree"
              color="secondary"
              size="sm"
              @click="gestionarEstructura(props.row)"
            >
              <q-tooltip>Gestionar Estructura (Secciones y Campos)</q-tooltip>
            </q-btn>
            <q-btn
              flat
              icon="delete"
              color="negative"
              size="sm"
              @click="eliminarServicio(props.row)"
            >
              <q-tooltip>Eliminar servicio</q-tooltip>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog para crear/editar servicio -->
    <q-dialog v-model="mostrarFormulario" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ modoEdicion ? 'Editar Servicio' : 'Nuevo Servicio' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardarServicio" ref="formulario">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="formularioServicio.nombre"
                  label="Nombre del Servicio *"
                  placeholder="Ej: Estética Canina"
                  :rules="[val => !!val || 'El nombre es requerido']"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="formularioServicio.codigo"
                  label="Código Único *"
                  placeholder="Ej: estetica_canina"
                  hint="Identificador interno (sin espacios)"
                  :rules="[val => !!val || 'El código es requerido']"
                  :readonly="modoEdicion"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="formularioServicio.descripcion"
                  label="Descripción"
                  type="textarea"
                  rows="3"
                  outlined
                  dense
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="formularioServicio.icono"
                  label="Icono (Material Icon)"
                  placeholder="Ej: content_cut"
                  outlined
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon :name="formularioServicio.icono || 'help'" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
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
import { servicioDinamicoService } from 'src/services/servicioDinamico.service'

const $q = useQuasar()
const router = useRouter()

// Estado
const loading = ref(false)
const guardando = ref(false)
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const servicios = ref([])

const formularioServicio = reactive({
  id_servicio_def: null,
  codigo: '',
  nombre: '',
  descripcion: '',
  icono: 'auto_awesome',
  activo: true,
  id_sitio: 1 // TODO: Obtener del store de sesión
})

const columnas = [
  { name: 'icono', label: '', field: 'icono', align: 'center', style: 'width: 50px' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center', style: 'width: 150px' }
]

// Métodos
const cargarServicios = async () => {
  loading.value = true
  try {
    servicios.value = await servicioDinamicoService.getServicios()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar servicios' })
  } finally {
    loading.value = false
  }
}

const abrirFormulario = (servicio = null) => {
  modoEdicion.value = !!servicio
  if (servicio) {
    Object.assign(formularioServicio, servicio)
  } else {
    Object.assign(formularioServicio, {
      id_servicio_def: null,
      codigo: '',
      nombre: '',
      descripcion: '',
      icono: 'auto_awesome',
      activo: true,
      id_sitio: 1
    })
  }
  mostrarFormulario.value = true
}

const guardarServicio = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value) {
      await servicioDinamicoService.updateServicio(formularioServicio.id_servicio_def, formularioServicio)
      $q.notify({ type: 'positive', message: 'Servicio actualizado' })
    } else {
      await servicioDinamicoService.createServicio(formularioServicio)
      $q.notify({ type: 'positive', message: 'Servicio creado' })
    }
    mostrarFormulario.value = false
    cargarServicios()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar el servicio' })
  } finally {
    guardando.value = false
  }
}

const editarServicio = (servicio) => {
  abrirFormulario(servicio)
}

const gestionarEstructura = (servicio) => {
  router.push({
    name: 'configuracion-estructura-servicio',
    params: { id: servicio.id_servicio_def }
  })
}

const cambiarEstado = async (servicio, estado) => {
  try {
    await servicioDinamicoService.updateServicio(servicio.id_servicio_def, { ...servicio, activo: estado })
    servicio.activo = estado
    $q.notify({ type: 'positive', message: `Servicio ${estado ? 'activado' : 'desactivado'}` })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const eliminarServicio = (servicio) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar el servicio "${servicio.nombre}"? Se perderá toda su configuración de secciones y campos.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await servicioDinamicoService.deleteServicio(servicio.id_servicio_def)
      $q.notify({ type: 'positive', message: 'Servicio eliminado' })
      cargarServicios()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

onMounted(() => {
  cargarServicios()
})
</script>

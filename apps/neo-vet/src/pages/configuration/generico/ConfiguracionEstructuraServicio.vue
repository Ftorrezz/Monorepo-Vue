<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn flat icon="arrow_back" round @click="$router.go(-1)" class="q-mr-md" />
      <div>
        <h5 class="q-ma-none">Estructura: {{ servicio?.nombre }}</h5>
        <p class="text-grey-7 q-ma-none">Gestiona las secciones y campos del formulario dinámico</p>
      </div>
      <q-space />
      <q-btn 
        color="secondary" 
        label="Nueva Sección" 
        icon="add_circle"
        @click="abrirFormularioSeccion()"
        unelevated
      />
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
      <div class="text-grey-7 q-mt-md">Cargando estructura...</div>
    </div>

    <div v-else-if="secciones.length === 0" class="text-center q-pa-xl bg-grey-1 rounded-borders border-dashed">
      <q-icon name="view_quilt" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No hay secciones configuradas</div>
      <q-btn color="primary" label="Crear primera sección" flat @click="abrirFormularioSeccion()" class="q-mt-sm" />
    </div>

    <div v-else class="q-gutter-y-md">
      <q-expansion-item
        v-for="seccion in secciones"
        :key="seccion.id_seccion"
        group="secciones"
        class="shadow-1 overflow-hidden rounded-borders bg-white"
        header-class="bg-grey-1 text-weight-bold"
        expand-icon-class="text-primary"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="32px">{{ seccion.orden }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ seccion.titulo }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center q-gutter-sm">
              <q-btn flat round dense icon="edit" color="primary" size="sm" @click.stop="editarSeccion(seccion)" />
              <q-btn flat round dense icon="delete" color="negative" size="sm" @click.stop="eliminarSeccion(seccion)" />
              <q-btn color="positive" label="Campo" icon="add" size="sm" @click.stop="abrirFormularioCampo(seccion)" unelevated />
            </div>
          </q-item-section>
        </template>

        <q-card>
          <q-card-section class="q-pa-none">
            <q-table
              :rows="camposPorSeccion[seccion.id_seccion] || []"
              :columns="columnasCampos"
              row-key="id_campo"
              flat
              dense
              hide-pagination
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:body-cell-tipo="props">
                <q-td :props="props">
                  <q-chip size="xs" color="blue-1" text-color="blue-9" label="props.value" />
                </q-td>
              </template>
              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn flat round dense icon="edit" color="primary" size="xs" @click="editarCampo(props.row)" />
                  <q-btn flat round dense icon="delete" color="negative" size="xs" @click="eliminarCampo(props.row)" />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>

    <!-- Dialog Sección -->
    <q-dialog v-model="mostrarFormSeccion" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">{{ modoEdicionSeccion ? 'Editar Sección' : 'Nueva Sección' }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="formSeccion.titulo" label="Título de la Sección *" outlined dense class="q-mb-md" />
          <q-input v-model.number="formSeccion.orden" label="Orden" type="number" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="secondary" label="Guardar" @click="guardarSeccion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Campo -->
    <q-dialog v-model="mostrarFormCampo" persistent maximized>
      <q-card>
        <q-card-section class="bg-positive text-white row items-center">
          <div class="text-h6">{{ modoEdicionCampo ? 'Editar Campo' : 'Nuevo Campo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="scroll">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="formCampo.label" label="Etiqueta (Label) *" outlined dense class="q-mb-md" />
              <q-input v-model="formCampo.nombre_interno" label="ID Interno (nombre_interno) *" outlined dense class="q-mb-md" />
              <q-select 
                v-model="formCampo.tipo_dato" 
                :options="['texto', 'numerico', 'select', 'checkbox', 'textarea']" 
                label="Tipo de Campo *" 
                outlined dense class="q-mb-md" 
              />
              <q-input v-model="formCampo.placeholder" label="Placeholder" outlined dense class="q-mb-md" />
              <q-input v-model="formCampo.icono" label="Icono" outlined dense class="q-mb-md" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model.number="formCampo.orden" label="Orden" type="number" outlined dense class="q-mb-md" />
              <q-select 
                v-model.number="formCampo.cols" 
                :options="[1,2,3,4,5,6,7,8,9,10,11,12]" 
                label="Columnas (1-12)" 
                outlined dense class="q-mb-md" 
              />
              <q-checkbox v-model="formCampo.requerido" label="Es obligatorio" class="q-mb-md" />
              
              <div v-if="formCampo.tipo_dato === 'select'">
                <q-input v-model="formCampo.datasource" label="Datasource (Catálogo)" outlined dense class="q-mb-md" />
                <q-input v-model="formCampo.opciones_json" label="Opciones (JSON)" type="textarea" rows="3" outlined dense placeholder='["Opción 1", "Opción 2"]' />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="bg-grey-2">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="positive" label="Guardar Campo" @click="guardarCampo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { servicioDinamicoService } from 'src/services/servicioDinamico.service'

const route = useRoute()
const $q = useQuasar()

// Estado
const loading = ref(false)
const servicio = ref(null)
const secciones = ref([])
const camposPorSeccion = reactive({})

// Formularios
const mostrarFormSeccion = ref(false)
const modoEdicionSeccion = ref(false)
const formSeccion = reactive({ id_seccion: null, id_servicio_def: null, titulo: '', orden: 0 })

const mostrarFormCampo = ref(false)
const modoEdicionCampo = ref(false)
const formCampo = reactive({
  id_campo: null, id_seccion: null, nombre_interno: '', label: '', tipo_dato: 'texto',
  placeholder: '', hint: '', requerido: false, cols: 6, orden: 0, icono: '',
  datasource: '', opciones_json: '', configuracion_extra_json: ''
})

const columnasCampos = [
  { name: 'orden', label: '#', field: 'orden', align: 'left', style: 'width: 30px' },
  { name: 'label', label: 'Etiqueta', field: 'label', align: 'left' },
  { name: 'nombre_interno', label: 'ID', field: 'nombre_interno', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo_dato', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

// Métodos
const cargarEstructura = async () => {
  loading.value = true
  try {
    const idServicio = parseInt(route.params.id)
    // Cargar definición del servicio
    const todos = await servicioDinamicoService.getServicios()
    servicio.value = todos.find(s => s.id_servicio_def === idServicio)
    
    // Cargar secciones
    secciones.value = await servicioDinamicoService.getSecciones(idServicio)
    
    // Cargar campos para cada sección
    for (const sec of secciones.value) {
      camposPorSeccion[sec.id_seccion] = await servicioDinamicoService.getCampos(sec.id_seccion)
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar estructura' })
  } finally {
    loading.value = false
  }
}

// Lógica Secciones
const abrirFormularioSeccion = (sec = null) => {
  modoEdicionSeccion.value = !!sec
  if (sec) {
    Object.assign(formSeccion, sec)
  } else {
    Object.assign(formSeccion, { id_seccion: null, id_servicio_def: parseInt(route.params.id), titulo: '', orden: secciones.value.length + 1 })
  }
  mostrarFormSeccion.value = true
}

const guardarSeccion = async () => {
  try {
    if (modoEdicionSeccion.value) {
      await servicioDinamicoService.updateSeccion(formSeccion.id_seccion, formSeccion)
    } else {
      await servicioDinamicoService.createSeccion(formSeccion)
    }
    mostrarFormSeccion.value = false
    cargarEstructura()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar sección' })
  }
}

const eliminarSeccion = (sec) => {
  $q.dialog({ title: 'Eliminar Sección', message: '¿Eliminar esta sección y todos sus campos?', cancel: true }).onOk(async () => {
    await servicioDinamicoService.deleteSeccion(sec.id_seccion)
    cargarEstructura()
  })
}

// Lógica Campos
const abrirFormularioCampo = (sec, campo = null) => {
  modoEdicionCampo.value = !!campo
  if (campo) {
    Object.assign(formCampo, campo)
  } else {
    Object.assign(formCampo, {
      id_campo: null, id_seccion: sec.id_seccion, nombre_interno: '', label: '', tipo_dato: 'texto',
      placeholder: '', hint: '', requerido: false, cols: 6, orden: (camposPorSeccion[sec.id_seccion]?.length || 0) + 1,
      icono: '', datasource: '', opciones_json: '', configuracion_extra_json: ''
    })
  }
  mostrarFormCampo.value = true
}

const guardarCampo = async () => {
  try {
    if (modoEdicionCampo.value) {
      await servicioDinamicoService.updateCampo(formCampo.id_campo, formCampo)
    } else {
      await servicioDinamicoService.createCampo(formCampo)
    }
    mostrarFormCampo.value = false
    cargarEstructura()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar campo' })
  }
}

const eliminarCampo = (campo) => {
  $q.dialog({ title: 'Eliminar Campo', message: '¿Eliminar este campo?', cancel: true }).onOk(async () => {
    await servicioDinamicoService.deleteCampo(campo.id_campo)
    cargarEstructura()
  })
}

onMounted(() => {
  cargarEstructura()
})
</script>

<style scoped>
.border-dashed {
  border: 2px dashed #e0e0e0;
}
</style>

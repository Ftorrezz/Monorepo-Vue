<template>
  <q-page padding>
    <!-- Header principal con gradiente -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="store" size="md" class="q-mr-md" />
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Gestión de Sucursales</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticas.total }} sucursal{{ estadisticas.total !== 1 ? 'es' : '' }} •
              {{ estadisticas.activas }} activa{{ estadisticas.activas !== 1 ? 's' : '' }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn flat round icon="add_circle" @click="abrirFormulario()" size="md">
              <q-tooltip>Agregar Sucursal</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de sucursales -->
    <q-card flat bordered>
      <q-table
        :rows="sucursales"
        :columns="columnas"
        :loading="loading"
        row-key="id"
        :filter="filtro"
        :pagination="{ rowsPerPage: 10 }"
        flat
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filtro" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-logo_url="props">
          <q-td :props="props">
            <q-avatar size="40px" v-if="props.value">
              <img :src="props.value">
            </q-avatar>
            <q-avatar size="40px" color="grey-3" text-color="grey-7" icon="store" v-else />
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-chip
              :color="props.value === 'S' ? 'positive' : 'grey'"
              :label="props.value === 'S' ? 'Activo' : 'Inactivo'"
              text-color="white"
              size="sm"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn flat dense round color="primary" icon="edit" @click="editarSucursal(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense round color="negative" icon="delete" @click="eliminarSucursal(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog para crear/editar sucursal -->
    <q-dialog v-model="mostrarFormulario" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">{{ modoEdicion ? 'Editar Sucursal' : 'Nueva Sucursal' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-lg max-height-form scroll">
          <q-form @submit="guardarSucursal" ref="formularioRef" class="q-px-sm">
            <div class="row q-col-gutter-md">
              <!-- Datos básicos -->
              <div class="col-12 col-md-8">
                <q-input
                  v-model="formulario.descripcion"
                  label="Nombre de la Sucursal *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El nombre es requerido']"
                  class="q-mb-sm"
                />
                <q-input
                  v-model="formulario.abreviatura"
                  label="Abreviatura *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La abreviatura es requerida']"
                  class="q-mb-sm"
                />
                <q-input
                  v-model="formulario.responsable"
                  label="Responsable *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El responsable es requerido']"
                  class="q-mb-sm"
                />
              </div>

              <!-- Logo -->
              <div class="col-12 col-md-4 flex flex-center">
                <div class="text-center">
                  <q-avatar size="100px" bordered class="q-mb-sm shadow-1">
                    <img v-if="previewLogo" :src="previewLogo">
                    <img v-else-if="formulario.logo_url" :src="formulario.logo_url">
                    <q-icon v-else name="store" color="grey-4" size="64px" />
                  </q-avatar>
                  <q-file
                    v-model="archivoLogo"
                    label="Cambiar Logo"
                    outlined
                    dense
                    accept=".jpg, .jpeg, .png"
                    @update:model-value="generarPreview"
                    class="full-width"
                  >
                    <template v-slot:prepend>
                      <q-icon name="cloud_upload" />
                    </template>
                  </q-file>
                </div>
              </div>

              <div class="col-12">
                <q-input
                  v-model="formulario.direccion"
                  label="Dirección *"
                  type="textarea"
                  rows="2"
                  outlined
                  dense
                  :rules="[val => !!val || 'La dirección es requerida']"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-select
                  v-model="formulario.id_sitio"
                  :options="sitios"
                  option-label="descripcion"
                  option-value="id"
                  emit-value
                  map-options
                  label="Sitio *"
                  outlined
                  dense
                  :rules="[val => !!val || 'Seleccione un sitio']"
                />
              </div>

              <div class="col-12 col-md-6">
                <div class="q-py-xs">
                  <q-checkbox v-model="formulario.activo" label="Sucursal Activa" true-value="S" false-value="N" />
                </div>
              </div>
              
              <!-- Módulos de la sucursal -->
              <div class="col-12">
                <q-card flat bordered class="bg-blue-50">
                  <q-card-section class="q-py-sm">
                    <div class="text-subtitle2 text-primary flex items-center">
                      <q-icon name="view_module" class="q-mr-sm" />
                      Módulos Habilitados
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-section class="q-py-md">
                    <div class="row q-col-gutter-sm">
                      <div 
                        v-for="modulo in modulosDisponibles" 
                        :key="modulo" 
                        class="col-12 col-sm-6 col-md-4"
                      >
                        <q-checkbox 
                          v-model="modulosSeleccionados" 
                          :val="modulo" 
                          :label="modulo"
                          dense
                        />
                      </div>
                    </div>
                    <div v-if="modulosDisponibles.length === 0" class="text-caption text-grey-6 text-center">
                      Cargando módulos...
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn color="primary" label="Guardar" :loading="guardando" @click="validarYGuardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useQuasar, QTableProps } from 'quasar';
import { sucursalService, Sucursal } from 'src/services/sucursal.service';
import { useDialogStore } from 'src/stores/DialogoUbicacion';

const $q = useQuasar();
const store = useDialogStore();

// Estado
const loading = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const modoEdicion = ref(false);
const filtro = ref('');
const sucursales = ref<Sucursal[]>([]);
const sitios = ref<any[]>([]);
const modulosDisponibles = ref<string[]>([]);
const modulosSeleccionados = ref<string[]>([]);
const archivoLogo = ref<File | null>(null);
const previewLogo = ref<string | null>(null);
const formularioRef = ref<any>(null);

const formulario = reactive<Sucursal>({
  id: undefined,
  descripcion: '',
  abreviatura: '',
  responsable: '',
  direccion: '',
  id_sitio: (Number(store.id_sitio) || 0),
  activo: 'S',
  logo_url: undefined,
  logo_public_id: undefined,
  modulos: undefined
});

const columnas: QTableProps['columns'] = [
  { name: 'logo_url', label: 'Logo', field: 'logo_url', align: 'center', style: 'width: 60px' },
  { name: 'descripcion', label: 'Nombre', field: 'descripcion', align: 'left', sortable: true },
  { name: 'abreviatura', label: 'Abrev.', field: 'abreviatura', align: 'left' },
  { name: 'responsable', label: 'Responsable', field: 'responsable', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center', style: 'width: 100px' }
];

// Estadísticas
const estadisticas = computed(() => {
  const total = sucursales.value.length;
  const activas = sucursales.value.filter(s => s.activo === 'S').length;
  return { total, activas };
});

// Métodos
const cargarDatos = async () => {
  loading.value = true;
  try {
    const [resSucursales, resSitios, resModulos] = await Promise.all([
      sucursalService.getSucursales(),
      sucursalService.getSitios(),
      sucursalService.getModulos()
    ]);
    
    sucursales.value = Array.isArray(resSucursales) ? resSucursales : (resSucursales.elemento || []);
    sitios.value = Array.isArray(resSitios) ? resSitios : (resSitios.elemento || []);
    modulosDisponibles.value = Array.isArray(resModulos) ? resModulos : [];
  } catch (error) {
    console.error('Error al cargar datos:', error);
    $q.notify({ type: 'negative', message: 'Error al cargar la información' });
  } finally {
    loading.value = false;
  }
};

const abrirFormulario = (datos: Sucursal | null = null) => {
  modoEdicion.value = !!datos;
  archivoLogo.value = null;
  previewLogo.value = null;
  modulosSeleccionados.value = [];

  if (datos) {
    Object.assign(formulario, datos);
    if (datos.modulos) {
      try {
        const parsed = typeof datos.modulos === 'string' ? JSON.parse(datos.modulos) : datos.modulos;
        // Si es un objeto {'VET': 'S', ...}, convertimos a array de keys con 'S'
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          modulosSeleccionados.value = Object.keys(parsed).filter(key => parsed[key] === 'S');
        } else if (Array.isArray(parsed)) {
          modulosSeleccionados.value = parsed;
        }
      } catch (e) {
        console.error('Error al parsear módulos:', e);
      }
    }
  } else {
    Object.assign(formulario, {
      id: undefined,
      descripcion: '',
      abreviatura: '',
      responsable: '',
      direccion: '',
      id_sitio: (Number(store.id_sitio) || 0),
      activo: 'S',
      logo_url: undefined,
      logo_public_id: undefined,
      modulos: undefined
    });
  }
  mostrarFormulario.value = true;
};

const editarSucursal = (sucursal: Sucursal) => {
  abrirFormulario(sucursal);
};

const generarPreview = (file: File) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewLogo.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    previewLogo.value = null;
  }
};

const validarYGuardar = () => {
  formularioRef.value.validate().then((success: boolean) => {
    if (success) {
      guardarSucursal();
    }
  });
};

const guardarSucursal = async () => {
  guardando.value = true;
  try {
    // Convertir módulos seleccionados a formato objeto {'MOD': 'S', ...}
    const modulosObj: Record<string, string> = {};
    modulosDisponibles.value.forEach(mod => {
      modulosObj[mod] = modulosSeleccionados.value.includes(mod) ? 'S' : 'N';
    });
    formulario.modulos = modulosObj;

    // Limpiar el objeto para enviar solo lo que el DTO del backend espera
    const datosLimpios = { ...formulario } as any;
    
    // Lista de propiedades a eliminar que no pertenecen al DTO de creación/edición
    const propsParaEliminar = ['logo_url', 'logo_public_id', 'id_sitio_navegacion'];
    propsParaEliminar.forEach(p => delete datosLimpios[p]);

    // Eliminar propiedades dinámicas que vienen de JOINS o de uso interno (ej: sitio_*)
    Object.keys(datosLimpios).forEach(key => {
      if (key.startsWith('sitio_') || key.startsWith('id_sitio_')) {
        delete datosLimpios[key];
      }
    });

    let res: any;
    if (modoEdicion.value && formulario.id) {
      res = await sucursalService.updateSucursal(formulario.id, datosLimpios as Sucursal);
    } else {
      res = await sucursalService.createSucursal(datosLimpios as Sucursal);
    }

    const idSucursal = formulario.id || res?.id || (Array.isArray(res) ? res[0]?.id : null) || res?.elemento?.id;

    // Si hay un logo nuevo, subirlo
    if (idSucursal && archivoLogo.value) {
      await sucursalService.uploadLogo(idSucursal, archivoLogo.value);
    }

    $q.notify({
      type: 'positive',
      message: `Sucursal ${modoEdicion.value ? 'actualizada' : 'creada'} correctamente`
    });
    
    mostrarFormulario.value = false;
    cargarDatos();
  } catch (error) {
    console.error('Error al guardar sucursal:', error);
    $q.notify({ type: 'negative', message: 'Error al guardar la sucursal' });
  } finally {
    guardando.value = false;
  }
};

const eliminarSucursal = (sucursal: Sucursal) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar la sucursal "${sucursal.descripcion}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      if (sucursal.id) {
        await sucursalService.deleteSucursal(sucursal.id);
        $q.notify({ type: 'positive', message: 'Sucursal eliminada' });
        cargarDatos();
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al eliminar la sucursal' });
    }
  });
};

onMounted(() => {
  cargarDatos();
});
</script>

<style lang="scss" scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.opacity-80 {
  opacity: 0.8;
}

.shadow-1 {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}

.bg-blue-50 {
  background-color: #f0f7ff;
}

.max-height-form {
  max-height: 70vh;
}
</style>
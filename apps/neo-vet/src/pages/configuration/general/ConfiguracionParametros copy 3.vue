<template>
  <div class="q-pa-md bg-grey-1 min-height-screen">
    <div class="row q-col-gutter-lg full-height">
      <!-- Sidebar de Módulos y Tablas - Diseño Ultra Moderno -->
      <div class="col-12 col-md-4 col-xl-3">
        <q-card flat class="modern-sidebar full-height shadow-1">
          <div class="row full-height no-wrap">
            <!-- Columna 1: Módulos (Iconos) -->
            <div class="module-strip bg-primary text-white flex flex-center q-py-md">
              <q-list class="full-width">
                <q-item
                  v-for="modulo in modulos"
                  :key="modulo.id"
                  clickable
                  v-ripple
                  manual-focus
                  class="module-icon-item q-mb-sm"
                  :active="moduloSeleccionado?.id === modulo.id"
                  @click="moduloSeleccionado = modulo"
                >
                  <q-item-section class="flex flex-center">
                    <q-icon :name="getModuleIcon(modulo.identificador)" size="md" />
                    <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
                      {{ modulo.descripcion }}
                    </q-tooltip>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <!-- Columna 2: Tablas del Módulo -->
            <div class="tables-column col grow q-pa-md">
              <div class="text-overline text-grey-7 q-mb-md">Configuraciones</div>
              <div v-if="moduloSeleccionado" class="text-h6 text-weight-bold q-mb-lg text-primary">
                {{ moduloSeleccionado.descripcion }}
              </div>
              <div v-else class="text-h6 text-weight-bold q-mb-lg text-grey-4">
                Seleccione Módulo
              </div>

              <q-scroll-area style="height: calc(85vh - 120px)">
                <q-list class="q-gutter-y-sm">
                  <q-item
                    v-for="tabla in tablas"
                    :key="tabla.id"
                    clickable
                    v-ripple
                    class="table-link-item rounded-borders"
                    :active="tablaSeleccionada?.id === tabla.id"
                    active-class="active-table-link"
                    @click="tablaSeleccionada = tabla"
                  >
                    <q-item-section avatar>
                      <q-icon name="subdirectory_arrow_right" size="xs" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ tabla.descripcion }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="tablaSeleccionada?.id === tabla.id">
                      <div class="active-dot" />
                    </q-item-section>
                  </q-item>

                  <div v-if="moduloSeleccionado && tablas.length === 0 && !cargando" class="text-center q-pa-xl">
                    <q-icon name="upcoming" size="50px" color="grey-3" />
                    <div class="text-caption text-grey-5 q-mt-md">No hay tablas definidas</div>
                  </div>
                </q-list>
              </q-scroll-area>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Área de Contenido Principal -->
      <div class="col-12 col-md-8 col-xl-9">
        <transition
          appear
          enter-active-class="animated slideInUp"
          leave-active-class="animated slideOutDown"
        >
          <div v-if="tablaSeleccionada" key="selected">
            <q-card flat class="main-content-card shadow-2">
              <!-- Toolbar Superior Estilo BaseCrud -->
              <q-toolbar class="bg-gradient-header text-white q-py-md px-lg">
                <q-avatar color="white" text-color="primary" :icon="getModuleIcon(moduloSeleccionado?.identificador)" class="shadow-2 q-mr-md" />
                <q-toolbar-title>
                  <div class="text-h5 text-weight-bold">{{ tablaSeleccionada.descripcion }}</div>
                  <div class="text-caption opacity-70">Repositorio central de configuraciones</div>
                </q-toolbar-title>
                
                <div class="q-gutter-sm">
                  <q-btn 
                    flat 
                    rounded 
                    icon="file_download" 
                    label="Excel/CSV" 
                    class="btn-blur"
                    @click="exportarDatos" 
                  />
                  <q-btn 
                    unelevated 
                    rounded 
                    color="white" 
                    text-color="primary" 
                    icon="add" 
                    label="Agregar" 
                    class="text-weight-bold shadow-2"
                    @click="nuevoParametro" 
                  />
                </div>
              </q-toolbar>

              <q-card-section class="q-pa-none">
                <q-table
                  :rows="parametros"
                  :columns="columnas"
                  row-key="id"
                  :loading="cargando"
                  flat
                  bordered
                  class="modern-data-table"
                  :pagination="{ rowsPerPage: 15 }"
                  :filter="filtroTabla"
                >
                  <template v-slot:top-right>
                    <q-input 
                      outlined 
                      dense 
                      debounce="300" 
                      v-model="filtroTabla" 
                      placeholder="Filtrar registros..."
                      class="q-ml-md"
                      style="width: 300px"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>

                  <template v-slot:body-cell-activo="props">
                    <q-td :props="props">
                      <q-chip
                        :color="props.row.activo === 'S' ? 'blue-2' : 'grey-2'"
                        :text-color="props.row.activo === 'S' ? 'primary' : 'grey-7'"
                        label="Activo"
                        size="sm"
                        class="text-weight-bolder"
                        v-if="props.row.activo === 'S'"
                      />
                      <q-chip
                        v-else
                        color="grey-2"
                        text-color="grey-7"
                        label="Inactivo"
                        size="sm"
                        class="text-weight-bolder"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-acciones="props">
                    <q-td :props="props" class="text-right">
                      <q-btn-group flat rounded>
                        <q-btn flat round color="primary" icon="edit" size="sm" @click="editarParametro(props.row)" />
                        <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)" />
                      </q-btn-group>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Empty State -->
          <div v-else key="empty" class="flex flex-center full-height full-width" style="min-height: 70vh">
            <div class="text-center">
              <div class="glass-blob flex flex-center">
                <q-icon name="auto_awesome_motion" size="xl" color="primary" />
              </div>
              <div class="text-h4 text-weight-bolder text-grey-8 q-mt-xl">Gestor Parametrizado</div>
              <div class="text-subtitle1 text-grey-5 q-mb-xl">Explore y configure la base maestra de Neodimio</div>
              <div class="row justify-center q-gutter-md">
                <div v-for="m in modulos.slice(0, 3)" :key="m.id" class="mini-module-card q-pa-md cursor-pointer" @click="moduloSeleccionado = m">
                   <q-icon :name="getModuleIcon(m.identificador)" size="sm" color="primary" />
                   <div class="text-caption q-mt-xs">{{ m.descripcion }}</div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Diálogo de Edición -->
    <q-dialog v-model="dialogoVisible" persistent>
      <q-card style="width: 550px; border-radius: 20px" class="q-pb-md">
        <q-card-section class="bg-primary text-white row items-center q-pb-lg">
          <div class="text-h6">{{ itemEditando.id ? 'Modificar Registro' : 'Nueva Entrada' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-px-xl q-pt-xl">
          <q-form @submit="guardar" ref="formRef" class="q-gutter-md">
            <q-input 
              v-model="itemEditando.descripcion" 
              label="Nombre / Descripción" 
              outlined
              dense
              stack-label
              autofocus 
              :rules="[val => !!val || 'Obligatorio']" 
            />
            
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input 
                  v-model="itemEditando.identificador" 
                  label="Identificador Único" 
                  outlined
                  dense
                  stack-label
                  hint="Código lógico interno" 
                />
              </div>
              <div class="col-6">
                <q-input 
                  v-model="itemEditando.paridad" 
                  label="Paridad Externa" 
                  outlined
                  dense
                  stack-label
                  hint="Mapeo otros sistemas" 
                />
              </div>
            </div>

            <div class="bg-grey-1 q-pa-md rounded-borders border-dashed row items-center q-mt-lg">
              <div class="col">
                <div class="text-subtitle2">Estado de disponibilidad</div>
                <div class="text-caption text-grey-6">Define si este parámetro aparecerá en las listas de selección</div>
              </div>
              <q-toggle v-model="itemEditando.activo" true-value="S" false-value="N" color="positive" size="lg" />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-xl q-pt-md">
           <OpcionCancelarGuardar @accionCerrar="dialogoVisible = false" @accionValidar="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useConfiguracionParametros from '../../../composables/useConfiguracionParametros';
import OpcionCancelarGuardar from '../../../components/OpcionCancelarGuardar.vue';
import { useQuasar, exportFile } from 'quasar';

const $q = useQuasar();
const { 
  modulos, 
  tablas, 
  parametros, 
  moduloSeleccionado, 
  tablaSeleccionada, 
  cargando, 
  guardarParametro, 
  eliminarParametro 
} = useConfiguracionParametros();

const dialogoVisible = ref(false);
const filtroTabla = ref('');
const itemEditando = ref({
  descripcion: '',
  identificador: '',
  paridad: '',
  activo: 'S'
});
const formRef = ref(null);

const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: true },
  { name: 'identificador', label: 'Identificador', field: 'identificador', align: 'left', sortable: true },
  { name: 'paridad', label: 'Paridad', field: 'paridad', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

const getModuleIcon = (identificador) => {
  const icons = {
    'MASCOTAS': 'pets',
    'PROPIETARIOS': 'groups',
    'GENERAL': 'settings_suggest',
    'ATENCION': 'medical_information',
    'CAJA': 'payments',
    'INVENTARIO': 'inventory_2'
  };
  return icons[identificador] || 'apps';
};

const nuevoParametro = () => {
  itemEditando.value = {
    descripcion: '',
    identificador: '',
    paridad: '',
    activo: 'S'
  };
  dialogoVisible.value = true;
};

const editarParametro = (item) => {
  itemEditando.value = { ...item };
  dialogoVisible.value = true;
};

const guardar = async () => {
  const success = await formRef.value.validate();
  if (!success) return;

  const exito = await guardarParametro(itemEditando.value);
  if (exito) {
    dialogoVisible.value = false;
    $q.notify({ type: 'positive', message: 'Configuración actualizada', icon: 'done_all' });
  }
};

const confirmarEliminar = (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Eliminar permanentemente "${item.descripcion}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative', flat: true }
  }).onOk(() => {
    eliminarParametro(item);
  });
};

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

const exportarDatos = () => {
  const content = [columnas.map(col => wrapCsvValue(col.label))]
    .concat(
      parametros.value.map(row =>
        columnas.map(col =>
          wrapCsvValue(
            typeof col.field === "function"
              ? col.field(row)
              : row[col.field === void 0 ? col.name : col.field],
            col.format,
            row
          )
        ).join(",")
      )
    ).join("\r\n");

  const fileName = `${moduloSeleccionado.value.identificador}_${tablaSeleccionada.value.nombre}.csv`;
  const status = exportFile(fileName, content, "text/csv");
  if (status !== true) $q.notify({ message: 'Descarga bloqueada', color: 'warning' });
};
</script>

<style lang="scss" scoped>
.min-height-screen {
  min-height: calc(100vh - 50px);
}

.modern-sidebar {
  border-radius: 24px;
  overflow: hidden;
  height: 85vh;
}

.module-strip {
  width: 80px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
}

.module-icon-item {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 16px;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &.q-manual-focusable--focused, &.q-item--active {
    background: white;
    color: var(--q-primary);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
}

.table-link-item {
  transition: all 0.3s;
  border: 1px solid transparent;
  
  &:hover {
    background: #e3f2fd;
    color: var(--q-primary);
    border-color: #bbdefb;
  }
  
  &.q-item--active {
    background: #e3f2fd;
    color: var(--q-primary);
    border-color: #1976d2;
    font-weight: 700;
  }
}

.active-dot {
  width: 8px;
  height: 8px;
  background: var(--q-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(25, 118, 210, 0.5);
}

.main-content-card {
  border-radius: 24px;
  overflow: hidden;
}

.bg-gradient-header {
  background: linear-gradient(135deg, #1565c0 0%, #1e88e5 100%);
}

.btn-blur {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  &:hover { background: rgba(255, 255, 255, 0.25); }
}

.modern-data-table {
  border: none;
  :deep(.q-table__top) { border-bottom: 1px solid #eee; }
  :deep(thead tr th) {
     font-weight: 700;
     color: #546e7a;
     text-transform: uppercase;
     font-size: 0.75rem;
  }
}

.glass-blob {
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 40px;
  transform: rotate(45deg);
  box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
  & > * { transform: rotate(-45deg); }
}

.mini-module-card {
  background: white;
  border-radius: 16px;
  width: 100px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    border-color: var(--q-primary);
  }
}

.border-dashed {
  border: 2px dashed #e0e0e0;
}
</style>

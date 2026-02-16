<template>
  <div class="q-pa-md bg-grey-1 min-height-screen">
    <div class="row q-col-gutter-lg full-height no-wrap">
      <!-- Sidebar de Módulos y Tablas - Diseño Ultra Moderno -->
      <div 
        class="transition-all flex no-wrap"
        :style="{ width: (sidebarMini ? 80 : 250) + (tablesMini ? 0 : 300) + 'px' }"
      >
        <q-card flat class="modern-sidebar full-height shadow-1 flex no-wrap full-width overflow-hidden">
          <!-- Columna 1: Módulos (Iconos + Texto horizontal) -->
          <div 
            class="module-strip bg-primary text-white flex transition-all no-wrap column items-start q-py-md"
            :style="{ width: sidebarMini ? '80px' : '250px' }"
          >
            <div class="flex items-center q-px-md q-mb-lg full-width no-wrap">
               <q-btn 
                flat 
                round 
                dense 
                :icon="sidebarMini ? 'menu_open' : 'menu'" 
                color="white" 
                @click="sidebarMini = !sidebarMini"
              />
              <div v-if="!sidebarMini" class="text-h6 q-ml-sm text-weight-bolder text-uppercase letter-spacing-1">Módulos</div>
            </div>
            
            <q-list class="full-width q-px-xs scroll">
              <q-item
                v-for="modulo in modulos"
                :key="modulo.id"
                clickable
                v-ripple
                class="module-horizontal-item q-mb-xs transition-all"
                :class="{ 'mini-item': sidebarMini }"
                :active="moduloSeleccionado?.id === modulo.id"
                @click="moduloSeleccionado = modulo"
              >
                <q-item-section avatar class="flex-center">
                  <q-icon :name="getModuleIcon(modulo.identificador)" :size="sidebarMini ? 'md' : 'sm'" />
                </q-item-section>
                <q-item-section v-if="!sidebarMini">
                  <q-item-label class="text-weight-bold text-uppercase label-small">{{ modulo.descripcion }}</q-item-label>
                </q-item-section>
                <q-tooltip v-if="sidebarMini" anchor="center right" self="center left" :offset="[10, 10]">
                  {{ modulo.descripcion }}
                </q-tooltip>
              </q-item>
            </q-list>
          </div>

          <!-- Columna 2: Tablas del Módulo (Colapsable) -->
          <div 
            v-if="!tablesMini"
            class="tables-column col q-pa-md transition-all border-left-light bg-white"
            style="width: 300px"
          >
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-overline text-grey-7">Tablas / Vistas</div>
              <q-btn flat round dense icon="chevron_left" size="sm" @click="tablesMini = true" />
            </div>

            <div v-if="moduloSeleccionado" class="text-subtitle2 text-weight-bold q-mb-lg text-primary ellipsis">
              {{ moduloSeleccionado.descripcion }}
            </div>
            <div v-else class="text-subtitle2 text-weight-bold q-mb-lg text-grey-4">
              Seleccione Módulo
            </div>

            <q-scroll-area style="height: calc(85vh - 120px)">
              <q-list class="q-gutter-y-sm">
                <q-item
                  v-for="tabla in tablas"
                  :key="tabla.id"
                  clickable
                  v-ripple
                  class="table-link-item rounded-borders transition-all"
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
                  <div class="text-caption text-grey-5 q-mt-md">Sin tablas</div>
                </div>
              </q-list>
            </q-scroll-area>
          </div>
        </q-card>
      </div>

      <!-- Área de Contenido Principal -->
      <div class="col grow">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div v-if="tablaSeleccionada" key="selected">
            <q-card flat class="main-content-card shadow-2">
              <!-- Toolbar Superior -->
              <q-toolbar class="bg-gradient-header text-white q-py-md px-lg">
                <q-btn 
                  v-if="tablesMini"
                  flat 
                  round 
                  dense 
                  icon="chevron_right" 
                  class="q-mr-md" 
                  @click="tablesMini = false" 
                />
                <q-avatar color="white" text-color="primary" :icon="getModuleIcon(moduloSeleccionado?.identificador)" class="shadow-2 q-mr-md" />
                <q-toolbar-title>
                  <div class="text-h5 text-weight-bold text-uppercase letter-spacing-1">{{ tablaSeleccionada.descripcion }}</div>
                  <div class="text-caption opacity-70">ADMINISTRACIÓN DE PARÁMETROS CENTRALIZADOS</div>
                </q-toolbar-title>
                
                <div class="q-gutter-sm">
                  <q-btn 
                    flat 
                    rounded 
                    icon="file_download" 
                    label="Exportar" 
                    class="btn-blur"
                    @click="exportarDatos" 
                  />
                  <q-btn 
                    unelevated 
                    rounded 
                    color="white" 
                    text-color="primary" 
                    icon="add" 
                    label="Agregar Registro" 
                    class="text-weight-bold shadow-2 q-px-md"
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
                      placeholder="Buscar en esta tabla..."
                      class="q-ml-md"
                      style="width: 250px"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>

                  <template v-slot:body-cell-activo="props">
                    <q-td :props="props">
                      <q-badge
                        :color="props.row.activo === 'S' ? 'positive' : 'grey-4'"
                        rounded
                        class="q-px-sm"
                      >
                        {{ props.row.activo === 'S' ? 'ACTIVO' : 'INACTIVO' }}
                      </q-badge>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-acciones="props">
                    <q-td :props="props" class="text-right">
                      <q-btn-group flat rounded>
                        <q-btn flat round color="primary" icon="edit" size="sm" @click="editarParametro(props.row)">
                           <q-tooltip>Editar registro</q-tooltip>
                        </q-btn>
                        <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)">
                           <q-tooltip>Eliminar registro</q-tooltip>
                        </q-btn>
                      </q-btn-group>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Empty State -->
          <div v-else key="empty" class="flex flex-center full-height full-width" style="min-height: 70vh">
             <q-btn 
                v-if="tablesMini"
                flat 
                round 
                dense 
                icon="chevron_right" 
                class="absolute-top-left q-ma-md" 
                color="primary"
                @click="tablesMini = false" 
              />
            <div class="text-center">
              <div class="glass-blob flex flex-center">
                <q-icon name="token" size="xl" color="primary" />
              </div>
              <div class="text-h4 text-weight-bolder text-primary q-mt-xl text-uppercase letter-spacing-1">Estructura BioNeodimio</div>
              <div class="text-subtitle1 text-grey-6 q-mb-xl">Gestión Maestra de Configuraciones</div>
              
              <div class="row justify-center q-gutter-md">
                <div 
                  v-for="m in modulos.slice(0, 4)" 
                  :key="m.id" 
                  class="mini-module-card q-pa-md cursor-pointer shadow-1" 
                  @click="moduloSeleccionado = m; tablesMini = false"
                >
                   <q-icon :name="getModuleIcon(m.identificador)" size="md" color="primary" />
                   <div class="text-caption q-mt-sm text-weight-bold">{{ m.descripcion }}</div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Diálogo de Edición -->
    <q-dialog v-model="dialogoVisible" persistent transition-show="rotate" transition-hide="rotate">
      <q-card style="width: 550px; border-radius: 24px" class="q-pb-md overflow-hidden">
        <q-card-section class="bg-primary text-white row items-center q-pb-lg">
          <q-icon :name="itemEditando.id ? 'edit' : 'add'" size="sm" class="q-mr-sm" />
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
                  placeholder="COD_EJEMPLO"
                  hint="Uso en lógica de negocio" 
                />
              </div>
              <div class="col-6">
                <q-input 
                  v-model="itemEditando.paridad" 
                  label="Paridad Externa" 
                  outlined
                  dense
                  stack-label
                  placeholder="001, 12, ABC"
                  hint="Mapeo otros sistemas" 
                />
              </div>
            </div>

            <div class="bg-blue-grey-1 q-pa-md rounded-borders border-dashed row items-center q-mt-lg">
              <div class="col">
                <div class="text-subtitle2 text-blue-grey-9">Estado de disponibilidad</div>
                <div class="text-caption text-blue-grey-6">Activar para que sea visible en el sistema</div>
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
const sidebarMini = ref(false);
const tablesMini = ref(false);
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
    'INVENTARIO': 'inventory_2',
    'LABORATORIO': 'biotech',
    'ESTETICA': 'spa',
    'HOSPITALIZACION': 'beds'
  };
  return icons[identificador] || 'auto_awesome';
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
    $q.notify({ type: 'positive', message: 'Registro actualizado satisfactoriamente', icon: 'check' });
  }
};

const confirmarEliminar = (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de que desea eliminar permanentemente el registro "${item.descripcion}"?`,
    cancel: { label: 'Cancelar', color: 'grey', flat: true },
    ok: { label: 'Eliminar', color: 'negative', flat: true },
    persistent: true
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

  const fileName = `CONFIG_${moduloSeleccionado.value.identificador}_${tablaSeleccionada.value.nombre}.csv`;
  const status = exportFile(fileName, content, "text/csv");
  if (status !== true) $q.notify({ message: 'Error al exportar el archivo', color: 'warning' });
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
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
}

.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.module-horizontal-item {
  width: 95%;
  margin: 0 auto;
  border-radius: 12px;
  min-height: 50px;
  
  &.mini-item {
    width: 56px;
    height: 56px;
    padding: 0;
    justify-content: center;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }
  
  &.q-item--active {
    background: white;
    color: var(--q-primary);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    &:hover { transform: none; }
  }
}

.label-small {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.line-height-1 {
  line-height: 1.1;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.border-left-light {
  border-left: 1px solid #f0f0f0;
}

.table-link-item {
  transition: all 0.3s;
  border: 1px solid transparent;
  
  &:hover {
    background: #f1f7ff;
    color: var(--q-primary);
    border-color: #d1e3f8;
  }
  
  &.q-item--active {
    background: #e3f2fd;
    color: var(--q-primary);
    border-color: #1976d2;
    font-weight: 700;
  }
}

.active-dot {
  width: 6px;
  height: 6px;
  background: var(--q-primary);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(25, 118, 210, 0.6);
}

.main-content-card {
  border-radius: 24px;
  overflow: hidden;
}

.bg-gradient-header {
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
  border-bottom: 2px solid rgba(255,255,255,0.1);
}

.btn-blur {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  &:hover { background: rgba(255, 255, 255, 0.25); }
}

.modern-data-table {
  border: none;
  border-radius: 0;
  :deep(.q-table__top) { border-bottom: 1px solid #f0f0f0; background: #fafafa; }
  :deep(thead tr th) {
     font-weight: 800;
     color: #455a64;
     text-transform: uppercase;
     font-size: 0.7rem;
     letter-spacing: 0.5px;
  }
}

.letter-spacing-1 {
  letter-spacing: 1.5px;
}

.glass-blob {
  width: 140px;
  height: 140px;
  background: white;
  border-radius: 35px;
  transform: rotate(45deg);
  box-shadow: 15px 15px 40px #e0e0e0, -15px -15px 40px #ffffff;
  & > * { transform: rotate(-45deg); }
}

.mini-module-card {
  background: white;
  border-radius: 20px;
  width: 110px;
  border: 2px solid #f8f9fa;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  &:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 15px 30px rgba(0,0,0,0.08);
    border-color: var(--q-primary);
  }
}

.border-dashed {
  border: 2px dashed #cfd8dc;
}
</style>

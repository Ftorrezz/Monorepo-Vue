<template>
  <div class="q-pa-xl bg-slate-50 min-height-screen font-outfit text-blue-grey-10 overflow-hidden relative-position">
    <!-- Fondo Decorativo Sutil -->
    <div class="light-blob absolute-top-right transition-all" :class="{ 'portal-active': !moduloSeleccionado }" />
    
    <transition name="portal-transition" mode="out-in">
      <!-- ETAPA 1: EL PORTAL (Dashboard de Módulos - Versión Compacta) -->
      <div v-if="!moduloSeleccionado" key="portal" class="full-width q-px-lg">
        <!-- Header del Portal (Estilo BaseCrud Compacto) -->
        <q-card flat class="bg-gradient-primary text-white q-mb-lg animated fadeInDown shadow-2">
          <q-card-section class="q-pa-md text-center">
            <div class="glass-chip-light inline-block q-px-md q-py-xs q-mb-sm">
              <span class="text-overline text-primary text-weight-bolder letter-spacing-2">SISTEMA CENTRAL DE PARÁMETROS</span>
            </div>
            <h1 class="text-h4 text-weight-black q-mt-none q-mb-xs">Centro de Control</h1>
            <p class="text-caption opacity-80 text-weight-medium q-mb-none">Gestione las configuraciones maestras del ecosistema</p>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-lg justify-center items-stretch module-grid-compact">
          <div v-for="modulo in modulos" :key="modulo.id" class="col-12 col-sm-6 col-md-3 col-xl-2">
            <q-card 
              flat 
              bordered
              class="portal-card-light full-height cursor-pointer transition-all"
              @click="seleccionarModulo(modulo)"
            >
              <q-card-section class="q-pa-lg flex flex-center column">
                <div class="icon-discrete-wrapper q-mb-md flex flex-center transition-all" :style="{ color: getModuleRawColor(modulo.identificador) }">
                  <q-icon :name="getModuleIcon(modulo.identificador)" size="2rem" />
                </div>
                <div class="text-subtitle2 text-weight-bold text-uppercase letter-spacing-1 text-center ellipsis full-width text-blue-grey-8">
                  {{ modulo.descripcion }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ETAPA 2: EL ESPACIO DE TRABAJO (Panel Light de Gestión) -->
      <div v-else key="workspace" class="full-width animated zoomIn">
        <!-- Header del Workspace (Estilo BaseCrud) -->
        <q-card flat class="bg-gradient-primary text-white q-mb-lg shadow-2">
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <q-btn 
                flat 
                rounded 
                color="white" 
                icon="grid_view" 
                label="Módulos" 
                class="q-px-md"
                @click="volverAlPortal" 
              />
              <q-separator vertical inset dark class="q-mx-lg opacity-20" />
              <div class="row items-center col-grow">
                 <div class="icon-circle q-mr-md" style="background: rgba(255,255,255,0.2)">
                   <q-icon :name="getModuleIcon(moduloSeleccionado.identificador)" size="sm" color="white" />
                 </div>
                 <div>
                   <div class="text-h6 text-weight-bold text-uppercase letter-spacing-1">{{ moduloSeleccionado.descripcion }}</div>
                   <div class="text-caption text-white opacity-80 uppercase letter-spacing-1 font-weight-bold">Espacio de Trabajo</div>
                 </div>
              </div>
              <q-space />
              <div class="row q-gutter-sm">
                <q-btn 
                  v-if="tablaSeleccionada"
                  flat
                  round
                  icon="add_circle"
                  @click="nuevoParametro" 
                  size="md"
                >
                  <q-tooltip>Registrar Nuevo</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-lg no-wrap items-stretch" style="height: calc(85vh - 120px)">
          <!-- Panel Lateral de Tablas (Estilo Listado Moderno) -->
          <div class="col-auto" style="width: 300px">
            <q-card flat class="table-list-card full-height shadow-minimal overflow-hidden bordered">
              <div class="q-pa-md border-bottom bg-blue-1">
                <div class="row items-center">
                  <q-icon name="list" color="primary" class="q-mr-sm" size="xs" />
                  <div class="text-overline text-primary text-weight-black letter-spacing-1">Tablas Disponibles</div>
                </div>
              </div>
              
              <q-scroll-area class="full-height" style="height: calc(85vh - 180px)">
                <q-list padding class="q-px-sm">
                  <q-item
                    v-for="tabla in tablas"
                    :key="tabla.id"
                    clickable
                    v-ripple
                    class="workspace-table-item-light q-mb-xs transition-all"
                    :active="tablaSeleccionada?.id === tabla.id"
                    active-class="active-table-light"
                    @click="tablaSeleccionada = tabla"
                  >
                    <q-item-section avatar class="min-width-0 q-pr-sm">
                      <q-icon name="subdirectory_arrow_right" size="14px" :color="tablaSeleccionada?.id === tabla.id ? 'primary' : 'grey-4'" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-blue-grey-8">{{ tabla.descripcion }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="tablaSeleccionada?.id === tabla.id">
                      <div class="dot-active" />
                    </q-item-section>
                  </q-item>
                  
                  <div v-if="tablas.length === 0 && !cargando" class="text-center q-pa-xl opacity-20">
                    <q-icon name="folder_open" size="40px" />
                    <div class="text-caption q-mt-md">Módulo vacío</div>
                  </div>
                </q-list>
              </q-scroll-area>
            </q-card>
          </div>

          <!-- Panel Central de Datos (Estilo Aireado) -->
          <div class="col grow">
            <q-card flat class="data-workspace-card-light full-height shadow-minimal overflow-hidden relative-position bordered">
              <q-inner-loading :showing="cargando" color="primary" />
              
              <transition name="fade-slide" mode="out-in">
                <div v-if="tablaSeleccionada" :key="tablaSeleccionada.id">
                   <q-table
                    :rows="parametros"
                    :columns="columnas"
                    row-key="id"
                    flat
                    class="modern-table"
                    :pagination="{ rowsPerPage: 15 }"
                    :filter="filtroTabla"
                  >
                    <template v-slot:top>
                      <div class="row full-width items-center q-px-lg q-py-md bg-blue-1 border-bottom">
                        <div class="text-subtitle1 text-weight-bolder text-primary uppercase letter-spacing-1">
                          <q-icon name="table_chart" class="q-mr-sm" />
                          {{ tablaSeleccionada.descripcion }}
                        </div>
                        <q-space />
                        <div class="row q-gutter-md items-center">
                          <q-input 
                            outlined
                            dense 
                            rounded
                            bg-color="white"
                            debounce="300" 
                            v-model="filtroTabla" 
                            placeholder="Buscar en tabla..."
                            class="search-input-light shadow-1"
                          >
                            <template v-slot:append>
                              <q-icon name="search" size="xs" color="primary" />
                            </template>
                          </q-input>
                          
                          <q-btn flat round icon="download" color="primary" @click="exportarDatos">
                            <q-tooltip>Exportar CSV</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </template>

                    <template v-slot:body-cell-activo="props">
                      <q-td :props="props">
                        <q-chip
                          dense
                          :color="props.row.activo === 'S' ? 'green-1' : 'grey-1'"
                          :text-color="props.row.activo === 'S' ? 'green-9' : 'grey-7'"
                          class="text-weight-bold"
                          size="sm"
                        >
                          {{ props.row.activo === 'S' ? 'ACTIVO' : 'INACTIVO' }}
                        </q-chip>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-acciones="props">
                      <q-td :props="props" class="text-right">
                        <q-btn flat round color="primary" icon="edit" size="sm" class="q-mr-xs" @click="editarParametro(props.row)" />
                        <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)" />
                      </q-td>
                    </template>
                  </q-table>
                </div>
                
                <div v-else class="flex flex-center full-height bg-white">
                  <div class="text-center opacity-30">
                    <q-icon name="keyboard_backspace" size="60px" class="animated infinite bounce-left-light" color="primary" />
                    <div class="text-h6 q-mt-md text-weight-bold text-blue-grey-9">Seleccione una tabla lateral</div>
                  </div>
                </div>
              </transition>
            </q-card>
          </div>
        </div>
      </div>
    </transition>

    <!-- Diálogo de Edición Profesional -->
    <q-dialog v-model="dialogoVisible" persistent position="right" full-height>
      <q-card style="width: 450px" class="bg-white text-blue-grey-10 flex column no-wrap shadow-2xl">
        <q-card-section class="q-pa-xl">
          <div class="text-overline text-primary text-weight-bold q-mb-xs">MÓDULO DE EDICIÓN</div>
          <div class="text-h4 text-weight-black q-mb-xl text-blue-grey-10">{{ itemEditando.id ? 'Modificar' : 'Crear' }}</div>
          
          <q-form @submit="guardar" ref="formRef" class="q-gutter-y-lg">
            <q-input 
              v-model="itemEditando.descripcion" 
              label="Descripción" 
              outlined
              rounded
              bg-color="grey-1"
              color="primary"
              stack-label
              autofocus 
              :rules="[val => !!val || 'El campo es requerido']" 
            />
            
            <q-input 
              v-model="itemEditando.identificador" 
              label="Identificador del Sistema" 
              outlined
              rounded
              bg-color="grey-1"
              color="primary"
              stack-label
              placeholder="Ej: COD_SYS"
              hint="Clave interna para funciones lógicas"
            />

            <q-input 
              v-model="itemEditando.paridad" 
              label="Valor de Paridad" 
              outlined
              rounded
              bg-color="grey-1"
              color="primary"
              stack-label
              placeholder="Ej: 101"
              hint="Mapeo con servicios externos"
            />

            <div class="flex items-center justify-between q-mt-xl bg-blue-grey-1 q-pa-lg rounded-xl">
              <div>
                <div class="text-subtitle2 text-weight-bold">Registro Vigente</div>
                <div class="text-caption text-blue-grey-6">Habilita/Deshabilita el registro en todo el sistema</div>
              </div>
              <q-toggle v-model="itemEditando.activo" true-value="S" false-value="N" color="positive" size="lg" />
            </div>
          </q-form>
        </q-card-section>

        <q-space />

        <q-card-actions align="right" class="q-pa-xl border-top bg-grey-1">
           <q-btn flat rounded label="Cancelar" color="blue-grey-6" class="q-px-lg" v-close-popup />
           <q-btn unelevated rounded label="Sincronizar" color="primary" class="q-px-xl shadow-primary" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import useConfiguracionParametros from '../../../composables/useConfiguracionParametros';
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
  { name: 'identificador', label: 'Lógica', field: 'identificador', align: 'left', sortable: true },
  { name: 'paridad', label: 'Paridad', field: 'paridad', align: 'left' },
  { name: 'activo', label: 'Vigencia', field: 'activo', align: 'center', sortable: true },
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
    'HOSPITALIZACION': 'hotel'
  };
  return icons[identificador] || 'auto_awesome';
};

const getModuleRawColor = (identificador) => {
  const colors = {
    'MASCOTAS': '#1976D2',
    'PROPIETARIOS': '#2E7D32',
    'GENERAL': '#607D8B',
    'ATENCION': '#C62828',
    'CAJA': '#F57C00',
    'INVENTARIO': '#455A64',
    'LABORATORIO': '#6A1B9A',
    'ESTETICA': '#E91E63',
    'HOSPITALIZACION': '#009688'
  };
  return colors[identificador] || '#1976D2';
};

const getModuleColor = (identificador) => {
  const color = getModuleRawColor(identificador);
  return `${color}15`; // 15% opacity hex
};

const seleccionarModulo = (modulo) => {
  moduloSeleccionado.value = modulo;
};

const volverAlPortal = () => {
  moduloSeleccionado.value = null;
  tablaSeleccionada.value = null;
};

// Auto-seleccionar primera tabla al entrar a un modulo
watch(tablas, (newTablas) => {
  if (moduloSeleccionado.value && newTablas.length > 0 && !tablaSeleccionada.value) {
    tablaSeleccionada.value = newTablas[0];
  }
});

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
    $q.notify({ type: 'positive', message: 'Sincronizado correctamente', icon: 'done_all' });
  }
};

const confirmarEliminar = (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de borrar "${item.descripcion}" permanentemente?`,
    cancel: { label: 'Cancelar', color: 'blue-grey-6', flat: true },
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
  if (status !== true) $q.notify({ message: 'Error al exportar registros', color: 'warning' });
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

.font-outfit { font-family: 'Outfit', sans-serif; }
.min-height-screen { min-height: 100vh; }
.shadow-primary { box-shadow: 0 8px 25px rgba(25, 118, 210, 0.25); }
.shadow-minimal { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
.bordered { border: 1px solid rgba(25, 118, 210, 0.12); }
.border-bottom { border-bottom: 1px solid rgba(25, 118, 210, 0.12); }
.border-top { border-top: 1px solid rgba(25, 118, 210, 0.12); }

// Background Blobs
.light-blob {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(25, 118, 210, 0.05) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
  &.portal-active { width: 1000px; height: 1000px; transform: translate(20%, -20%); }
}

.glass-chip-light {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 1px solid white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.portal-card-light {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: var(--q-primary);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    background: #f8fafc;
  }
}

.icon-discrete-wrapper {
  width: 65px;
  height: 65px;
  background: white;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.03);
}

.back-btn-light {
  background: #f1f5f9;
  letter-spacing: 0.5px;
  &:hover { background: #e2e8f0; }
}

.icon-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-list-card {
  background: white;
  border-radius: 24px;
}

.workspace-table-item-light {
  border-radius: 12px;
  margin: 0 4px;
  &:hover { background: #f8fafc; color: var(--q-primary); }
  &.active-table-light {
    background: #eff6ff;
    color: var(--q-primary);
    border-left: 4px solid var(--q-primary);
  }
}

.dot-active {
  width: 6px;
  height: 6px;
  background: var(--q-primary);
  border-radius: 50%;
}

.data-workspace-card-light {
  background: white;
  border-radius: 30px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.opacity-80 {
  opacity: 0.8;
}

.modern-table {
  :deep(.q-table__top) { padding: 20px 32px; border-bottom: 1px solid #f8fafc; }
  :deep(thead tr th) { 
    background-color: var(--q-primary);
    color: white; 
    font-weight: 700; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    letter-spacing: 1px;
    padding: 16px 32px;
  }
  :deep(tbody tr td) { padding: 14px 32px; color: #475569; border-bottom: 1px solid #f8fafc; }
  :deep(tbody tr:hover) { background: #f8faff !important; }
}

.search-input-light { width: 280px; }

// Transitions
.portal-transition-enter-active, .portal-transition-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.portal-transition-enter-from { opacity: 0; transform: scale(0.95) translateY(20px); }
.portal-transition-leave-to { opacity: 0; transform: scale(1.05) translateY(-20px); }

.bounce-left-light {
  animation: bounce-left 2s infinite;
}

@keyframes bounce-left {
  0%, 20%, 50%, 80%, 100% { transform: translateX(0); }
  40% { transform: translateX(-15px); }
  60% { transform: translateX(-7px); }
}

.letter-spacing-1 { letter-spacing: 1px; }
.letter-spacing-2 { letter-spacing: 2.5px; }
</style>

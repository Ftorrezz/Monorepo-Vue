<template>
  <div class="q-pa-xl bg-slate-900 min-height-screen font-outfit text-white overflow-hidden relative-position">
    <!-- Fondo Decorativo Moderno -->
    <div class="blob-bg absolute-top-right transition-all" :class="{ 'portal-active': !moduloSeleccionado }" />
    
    <transition name="portal-transition" mode="out-in">
      <!-- ETAPA 1: EL PORTAL (Dashboard de Módulos) -->
      <div v-if="!moduloSeleccionado" key="portal" class="full-width q-px-lg">
        <div class="text-center q-mb-xl animated fadeInDown">
          <div class="glass-chip inline-block q-px-md q-py-xs q-mb-md">
            <span class="text-overline text-accent text-weight-bolder letter-spacing-2">SISTEMA CENTRAL DE PARÁMETROS</span>
          </div>
          <h1 class="text-h2 text-weight-black q-mt-none q-mb-sm text-gradient">Centro de Control</h1>
          <p class="text-subtitle1 text-grey-4 text-weight-light">Seleccione una dimensión para gestionar los cimientos del sistema</p>
        </div>

        <div class="row q-col-gutter-xl justify-center items-stretch module-grid">
          <div v-for="modulo in modulos" :key="modulo.id" class="col-12 col-sm-6 col-md-4 col-xl-3">
            <q-card 
              flat 
              class="portal-card full-height cursor-pointer relative-position overflow-hidden transition-all"
              @click="seleccionarModulo(modulo)"
            >
              <div class="card-glow absolute-full opacity-0 transition-all" :style="{ background: getModuleColor(modulo.identificador) }" />
              
              <q-card-section class="q-pa-xl flex flex-center column">
                <div class="icon-portal-wrapper q-mb-lg flex flex-center shadow-portal transition-all">
                  <q-icon :name="getModuleIcon(modulo.identificador)" size="3rem" />
                </div>
                <div class="text-h6 text-weight-bold text-uppercase letter-spacing-1 text-center">{{ modulo.descripcion }}</div>
                <div class="text-caption text-grey-5 q-mt-sm">Gestionar tablas del módulo</div>
                
                <q-btn flat round icon="arrow_forward" color="white" class="absolute-bottom-right q-ma-md opacity-20" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ETAPA 2: EL ESPACIO DE TRABAJO (Panel de Gestión) -->
      <div v-else key="workspace" class="full-width animated zoomIn">
        <!-- Header del Workspace -->
        <div class="row items-center q-mb-lg">
          <q-btn 
            flat 
            rounded 
            color="white" 
            icon="dashboard" 
            label="Volver al Portal" 
            class="back-btn q-px-md"
            @click="volverAlPortal" 
          />
          <q-separator vertical dark inset class="q-mx-lg opacity-20" />
          <div class="row items-center">
             <q-icon :name="getModuleIcon(moduloSeleccionado.identificador)" size="md" color="accent" class="q-mr-md" />
             <div>
               <div class="text-h5 text-weight-black letter-spacing-1 text-uppercase">{{ moduloSeleccionado.descripcion }}</div>
               <div class="text-caption text-grey-5 uppercase letter-spacing-1">Workspace de Configuración</div>
             </div>
          </div>
          <q-space />
          <div class="row q-gutter-sm">
            <q-btn 
              v-if="tablaSeleccionada"
              unelevated 
              rounded 
              color="accent" 
              icon="add" 
              label="Nuevo Registro" 
              class="text-weight-bold shadow-accent q-px-lg"
              @click="nuevoParametro" 
            />
          </div>
        </div>

        <div class="row q-col-gutter-lg no-wrap items-stretch" style="height: calc(85vh - 100px)">
          <!-- Panel Lateral de Tablas -->
          <div class="col-auto" style="width: 320px">
            <q-card flat class="table-browser-card full-height shadow-inner-dark overflow-hidden">
              <div class="q-pa-md border-bottom-dark bg-dark-soft">
                <div class="text-overline text-accent text-weight-bold opacity-60">Repositorios Disponibles</div>
                <div class="text-caption text-grey-5">Navegue por las tablas del módulo</div>
              </div>
              
              <q-scroll-area class="full-height" style="height: calc(85vh - 180px)">
                <q-list padding class="q-px-sm">
                  <q-item
                    v-for="tabla in tablas"
                    :key="tabla.id"
                    clickable
                    v-ripple
                    class="workspace-table-item q-mb-xs transition-all"
                    :active="tablaSeleccionada?.id === tabla.id"
                    active-class="active-workspace-table"
                    @click="tablaSeleccionada = tabla"
                  >
                    <q-item-section avatar>
                      <q-icon name="layers" size="xs" :color="tablaSeleccionada?.id === tabla.id ? 'accent' : 'grey-7'" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ tabla.descripcion }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="tablaSeleccionada?.id === tabla.id">
                      <q-icon name="chevron_right" color="accent" />
                    </q-item-section>
                  </q-item>
                  
                  <div v-if="tablas.length === 0 && !cargando" class="text-center q-pa-xl opacity-30">
                    <q-icon name="folder_off" size="50px" />
                    <div class="text-caption q-mt-md">Sin contenido</div>
                  </div>
                </q-list>
              </q-scroll-area>
            </q-card>
          </div>

          <!-- Panel Central de Datos -->
          <div class="col grow">
            <q-card flat class="data-workspace-card full-height shadow-portal overflow-hidden relative-position">
              <q-inner-loading :showing="cargando" color="accent" dark />
              
              <transition name="fade-slide" mode="out-in">
                <div v-if="tablaSeleccionada" :key="tablaSeleccionada.id">
                   <q-table
                    :rows="parametros"
                    :columns="columnas"
                    row-key="id"
                    flat
                    dark
                    class="workspace-data-table"
                    :pagination="{ rowsPerPage: 15 }"
                    :filter="filtroTabla"
                  >
                    <template v-slot:top-left>
                      <div class="text-h6 text-weight-bold text-accent uppercase">{{ tablaSeleccionada.descripcion }}</div>
                    </template>

                    <template v-slot:top-right>
                      <q-input 
                        dark
                        standout="bg-grey-9 text-white"
                        dense 
                        rounded
                        debounce="300" 
                        v-model="filtroTabla" 
                        placeholder="Filtrar registros..."
                        class="search-input"
                      >
                        <template v-slot:append>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                      
                      <q-btn flat round icon="file_download" class="q-ml-md opacity-50" @click="exportarDatos">
                        <q-tooltip>Descargar CSV</q-tooltip>
                      </q-btn>
                    </template>

                    <template v-slot:body-cell-activo="props">
                      <q-td :props="props">
                        <q-chip
                          outline
                          dense
                          :color="props.row.activo === 'S' ? 'positive' : 'grey-7'"
                          :text-color="props.row.activo === 'S' ? 'positive' : 'grey-7'"
                          class="text-weight-bold"
                          size="sm"
                        >
                          {{ props.row.activo === 'S' ? 'VIGENTE' : 'CADUCO' }}
                        </q-chip>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-acciones="props">
                      <q-td :props="props" class="text-right">
                        <q-btn flat round color="accent" icon="edit" size="sm" class="q-mr-xs" @click="editarParametro(props.row)" />
                        <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)" />
                      </q-td>
                    </template>
                  </q-table>
                </div>
                
                <div v-else class="flex flex-center full-height">
                  <div class="text-center opacity-20">
                    <q-icon name="arrow_back" size="80px" class="animated infinite bounce-left" />
                    <div class="text-h5 q-mt-md text-weight-light">Seleccione una tabla para editar</div>
                  </div>
                </div>
              </transition>
            </q-card>
          </div>
        </div>
      </div>
    </transition>

    <!-- Diálogo de Edición -->
    <q-dialog v-model="dialogoVisible" persistent position="right" full-height>
      <q-card style="width: 450px" class="bg-dark-soft text-white flex column no-wrap shadow-portal">
        <q-card-section class="q-pa-xl">
          <div class="text-overline text-accent text-weight-bold q-mb-md">Gestión de Registro</div>
          <div class="text-h4 text-weight-black q-mb-xl">{{ itemEditando.id ? 'Editar' : 'Crear' }}</div>
          
          <q-form @submit="guardar" ref="formRef" class="q-gutter-y-xl">
            <q-input 
              dark
              v-model="itemEditando.descripcion" 
              label="Descripción del Parámetro" 
              standout="bg-grey-9"
              color="accent"
              stack-label
              autofocus 
              :rules="[val => !!val || 'Obligatorio']" 
            />
            
            <q-input 
              dark
              v-model="itemEditando.identificador" 
              label="Identificador Lógico" 
              standout="bg-grey-9"
              color="accent"
              stack-label
              placeholder="Ej: COD_SYS"
            />

            <q-input 
              dark
              v-model="itemEditando.paridad" 
              label="Paridad / Valor Externo" 
              standout="bg-grey-9"
              color="accent"
              stack-label
              placeholder="Ej: 101"
            />

            <div class="flex items-center justify-between q-mt-xl bg-dark q-pa-lg rounded-borders border-accent-soft">
              <div>
                <div class="text-subtitle1 text-weight-bold">Status Operativo</div>
                <div class="text-caption text-grey-5">Habilita el uso en formularios</div>
              </div>
              <q-toggle v-model="itemEditando.activo" true-value="S" false-value="N" color="accent" size="lg" />
            </div>
          </q-form>
        </q-card-section>

        <q-space />

        <q-card-actions align="right" class="q-pa-xl bg-dark-soft border-top-dark">
           <q-btn flat rounded label="Cancelar" color="grey" class="q-px-lg" v-close-popup />
           <q-btn unelevated rounded label="Sincronizar Datos" color="accent" class="q-px-xl shadow-accent" @click="guardar" />
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

const getModuleColor = (identificador) => {
  const colors = {
    'MASCOTAS': 'rgba(25, 118, 210, 0.4)',
    'PROPIETARIOS': 'rgba(46, 125, 50, 0.4)',
    'GENERAL': 'rgba(97, 97, 97, 0.4)',
    'ATENCION': 'rgba(198, 40, 40, 0.4)',
    'CAJA': 'rgba(255, 143, 0, 0.4)',
    'INVENTARIO': 'rgba(69, 90, 100, 0.4)',
    'LABORATORIO': 'rgba(106, 27, 154, 0.4)',
    'ESTETICA': 'rgba(233, 30, 99, 0.4)',
    'HOSPITALIZACION': 'rgba(0, 150, 136, 0.4)'
  };
  return colors[identificador] || 'rgba(0,0,0,0.4)';
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
    $q.notify({ type: 'positive', message: 'Sincronización exitosa', icon: 'sync' });
  }
};

const confirmarEliminar = (item) => {
  $q.dialog({
    dark: true,
    title: 'Confirmar eliminación',
    message: `¿Desea borrar permanentemente "${item.descripcion}"?`,
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
  if (status !== true) $q.notify({ message: 'Falla al procesar exportación', color: 'warning' });
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;700;900&display=swap');

.font-outfit { font-family: 'Outfit', sans-serif; }
.min-height-screen { min-height: 100vh; }
.text-accent { color: #00e5ff; }
.shadow-accent { box-shadow: 0 10px 30px rgba(0, 229, 255, 0.3); }

// Background Blobs
.blob-bg {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, transparent 70%);
  filter: blur(100px);
  z-index: 0;
  &.portal-active { width: 1200px; height: 1200px; transform: translate(20%, -20%); }
}

.bg-slate-900 { background-color: #0f172a; }
.bg-dark-soft { background-color: #1e293b; }
.border-accent-soft { border: 1px solid rgba(0, 229, 255, 0.1); }
.border-bottom-dark { border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.border-top-dark { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.bg-gradient-header { background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid rgba(0, 229, 255, 0.1); }

.portal-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 40px;
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: rgba(0, 229, 255, 0.4);
    .icon-portal-wrapper { transform: scale(1.1) rotate(5deg); background: #00e5ff; color: #0f172a; }
    .card-glow { opacity: 0.1; }
  }
}

.icon-portal-wrapper {
  width: 120px;
  height: 120px;
  background: #1e293b;
  border-radius: 35px;
  color: #00e5ff;
}

.shadow-portal { box-shadow: 0 20px 50px rgba(0,0,0,0.3); }

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  &:hover { background: rgba(0, 229, 255, 0.1); color: #00e5ff !important; }
}

.table-browser-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
}

.workspace-table-item {
  border-radius: 15px;
  color: #94a3b8;
  &:hover { background: rgba(0, 229, 255, 0.05); color: #f8fafc; }
  &.active-workspace-table {
    background: linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, transparent 100%);
    color: #00e5ff;
    border-left: 3px solid #00e5ff;
  }
}

.data-workspace-card {
  background: #1e293b;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.workspace-data-table {
  background: transparent;
  :deep(.q-table__top) { background: transparent; padding: 20px 40px; }
  :deep(thead tr th) { 
    color: #64748b; 
    font-weight: 700; 
    text-transform: uppercase; 
    font-size: 0.7rem; 
    letter-spacing: 1px;
    padding: 20px 40px;
  }
  :deep(tbody tr td) { padding: 16px 40px; border-color: rgba(255, 255, 255, 0.03); }
  :deep(tbody tr:hover) { background: rgba(0, 229, 255, 0.02) !important; }
}

.search-input { width: 300px; }

.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #64748b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

// Transitions
.portal-transition-enter-active, .portal-transition-leave-active { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.portal-transition-enter-from { opacity: 0; transform: scale(1.1) translateY(30px); }
.portal-transition-leave-to { opacity: 0; transform: scale(0.9) translateY(-30px); }

.bounce-left {
  animation: bounce-left 2s infinite;
}

@keyframes bounce-left {
  0%, 20%, 50%, 80%, 100% { transform: translateX(0); }
  40% { transform: translateX(-20px); }
  60% { transform: translateX(-10px); }
}

.letter-spacing-1 { letter-spacing: 1.5px; }
.letter-spacing-2 { letter-spacing: 3px; }

.btn-blur {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  &:hover { background: rgba(255, 255, 255, 0.1); }
}
</style>

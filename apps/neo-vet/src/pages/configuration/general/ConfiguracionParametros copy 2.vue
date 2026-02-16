<template>
  <div class="q-pa-lg">
    <div class="row q-col-gutter-xl">
      <!-- Sidebar de Módulos y Tablas - Diseño Moderno -->
      <div class="col-12 col-md-3">
        <div class="sidebar-wrapper">
          <div class="sidebar-header q-mb-md">
            <q-icon name="hub" size="lg" color="primary" class="q-mr-sm" />
            <div class="text-h6 text-primary text-weight-bolder">Estructura BioNeodimio</div>
          </div>
          
          <q-scroll-area style="height: calc(85vh - 100px)">
            <q-list class="q-pr-md custom-menu">
              <q-expansion-item
                v-for="modulo in modulos"
                :key="modulo.id"
                expand-separator
                icon="folder_managed"
                :label="modulo.descripcion"
                :caption="modulo.identificador"
                header-class="module-header rounded-borders q-mb-xs"
                @show="moduloSeleccionado = modulo"
                :model-value="moduloSeleccionado?.id === modulo.id"
              >
                <q-list class="q-pl-lg q-mt-xs">
                  <q-item
                    v-for="tabla in tablas"
                    :key="tabla.id"
                    clickable
                    v-ripple
                    dense
                    :active="tablaSeleccionada?.id === tabla.id"
                    active-class="active-table-item"
                    class="table-item rounded-borders q-mb-xs"
                    @click="tablaSeleccionada = tabla"
                  >
                    <q-item-section avatar>
                      <q-icon name="data_object" size="xs" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ tabla.descripcion }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="tablaSeleccionada?.id === tabla.id">
                      <q-icon name="chevron_right" color="primary" />
                    </q-item-section>
                  </q-item>
                  
                  <div v-if="tablas.length === 0 && !cargando" class="q-pa-sm text-caption text-grey italic">
                    Sin tablas...
                  </div>
                </q-list>
              </q-expansion-item>
            </q-list>
          </q-scroll-area>
        </div>
      </div>

      <!-- Área de Contenido / CRUD - Diseño Premium -->
      <div class="col-12 col-md-9">
        <transition
          appear
          enter-active-class="animated fadeInRight"
          leave-active-class="animated fadeOutRight"
        >
          <div v-if="tablaSeleccionada">
            <q-card flat class="glass-container main-card no-border">
              <!-- Header Dinámico -->
              <div class="header-banner q-pa-lg text-white">
                <div class="row items-center no-wrap">
                  <q-avatar color="white" text-color="primary" icon="table_view" size="xl" class="q-mr-md shadow-3" />
                  <div>
                    <div class="text-h4 text-weight-bold">{{ tablaSeleccionada.descripcion }}</div>
                    <div class="text-subtitle1 opacity-70">
                      {{ moduloSeleccionado?.descripcion }} / Configuración Global
                    </div>
                  </div>
                  <q-space />
                  <div class="q-gutter-sm">
                    <q-btn 
                      flat 
                      round 
                      color="white" 
                      icon="file_download" 
                      @click="exportarDatos"
                    >
                      <q-tooltip>Exportar a CSV</q-tooltip>
                    </q-btn>
                    <q-btn 
                      unelevated 
                      rounded
                      color="white" 
                      text-color="primary" 
                      icon="add" 
                      label="Nuevo Registro"
                      @click="nuevoParametro"
                      class="q-px-md text-weight-bold"
                    />
                  </div>
                </div>
              </div>

              <q-card-section class="q-pa-none">
                <q-table
                  :rows="parametros"
                  :columns="columnas"
                  row-key="id"
                  :loading="cargando"
                  flat
                  binary-state-sort
                  class="premium-table"
                  no-data-label="No se encontraron registros para esta selección"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:body-cell-activo="props">
                    <q-td :props="props">
                      <q-badge
                        :color="props.row.activo === 'S' ? 'positive' : 'grey-5'"
                        rounded
                        class="q-px-sm"
                      >
                        {{ props.row.activo === 'S' ? 'ACTIVO' : 'INACTIVO' }}
                      </q-badge>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-acciones="props">
                    <q-td :props="props" class="text-right">
                      <q-btn flat round color="primary" icon="edit" size="sm" @click="editarParametro(props.row)">
                        <q-tooltip>Editar parámetro</q-tooltip>
                      </q-btn>
                      <q-btn flat round color="negative" icon="delete_outline" size="sm" @click="confirmarEliminar(props.row)">
                        <q-tooltip>Eliminar permanentemente</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>
                  
                  <template v-slot:loading>
                    <q-inner-loading showing color="primary">
                       <q-spinner-grid size="50px" color="primary" />
                    </q-inner-loading>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>

          <!-- Placeholder cuando no hay selección -->
          <div v-else class="empty-selection-placeholder flex flex-center">
            <div class="text-center">
              <div class="icon-blob q-mb-xl">
                <q-icon name="dashboard_customize" size="100px" color="primary" />
              </div>
              <div class="text-h4 text-weight-bold text-primary q-mb-md">Panel de Configuración Estructural</div>
              <div class="text-grey-6 text-h6 max-width-text">
                Seleccione un módulo organizativo de la izquierda para comenzar a gestionar sus parámetros globales.
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Diálogo de Edición - Estilo Premium -->
    <q-dialog v-model="dialogoVisible" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; max-width: 90vw;" class="premium-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon :name="itemEditando.id ? 'edit_square' : 'add_box'" size="md" class="q-mr-md" />
          <div>
            <div class="text-h6">{{ itemEditando.id ? 'Modificar' : 'Crear' }} Entrada</div>
            <div class="text-caption opacity-80">{{ tablaSeleccionada?.descripcion }}</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="guardar" ref="formRef" class="q-gutter-md">
            <q-input
              v-model="itemEditando.descripcion"
              label="Descripción Principal"
              stack-label
              outlined
              class="modern-input"
              placeholder="Ej: Felino, Rojo, Licenciatura..."
              :rules="[val => !!val || 'El nombre descriptivo es requerido']"
              autofocus
            />

            <q-input
              v-model="itemEditando.identificador"
              label="Identificador Clave"
              stack-label
              outlined
              class="modern-input"
              placeholder="CÓDIGO_INTERNO"
              hint="Código alfanumérico único para lógica de negocio"
            />

            <q-input
              v-model="itemEditando.paridad"
              label="Paridad / Código Externo"
              stack-label
              outlined
              class="modern-input"
              placeholder="Mapeo con sistemas externos"
            />

            <div class="row items-center q-pt-md">
              <q-toggle
                v-model="itemEditando.activo"
                label="Estado del registro (Activo/Inactivo)"
                true-value="S"
                false-value="N"
                color="positive"
              />
              <q-space />
              <q-badge :color="itemEditando.activo === 'S' ? 'positive' : 'grey'" rounded />
            </div>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <OpcionCancelarGuardar
            @accionCerrar="dialogoVisible = false"
            @accionValidar="guardar"
          />
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
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Cambios sincronizados correctamente'
    });
  }
};

const confirmarEliminar = async (item) => {
  $q.dialog({
    title: '¿Confirmar eliminación?',
    message: `Se eliminará permanentemente "${item.descripcion}". Esta acción no se puede deshacer.`,
    ok: { label: 'Eliminar', color: 'negative', flat: true },
    cancel: { label: 'Mantener', color: 'grey', flat: true },
    persistent: true
  }).onOk(() => {
    eliminarParametro(item);
  });
};

// Exportar a CSV logic
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

  if (status !== true) {
    $q.notify({
      message: 'El navegador bloqueó la descarga',
      color: 'warning',
      icon: 'warning'
    });
  }
};
</script>

<style lang="scss" scoped>
.glass-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.header-banner {
  background: linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%);
  border-radius: 16px 16px 0 0;
}

.sidebar-wrapper {
  background: #fcfdfe;
  height: 100%;
}

.module-header {
  font-weight: 700;
  color: #2c3e50;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: #f1f7ff;
    transform: translateX(5px);
  }
}

.table-item {
  color: #607d8b;
  font-weight: 500;
  font-size: 0.9rem;
  margin-left: 10px;
  
  &:hover {
    color: #1976d2;
    background: #e3f2fd;
  }
}

.active-table-item {
  background: #1976d2 !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.2);
}

.main-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
}

.premium-table {
  :deep(thead tr th) {
    background-color: #fafbfc;
    color: #78909c;
    font-weight: 800;
    font-size: 0.7rem;
    letter-spacing: 1px;
    padding: 16px;
    border-bottom: 2px solid #edf2f4;
  }
  
  :deep(tbody tr) {
    transition: all 0.2s;
    td {
      padding: 14px 16px;
    }
  }
  
  :deep(tbody tr:hover) {
    background-color: #f4faff !important;
    transform: scale(1.002);
  }
}

.empty-selection-placeholder {
  height: 70vh;
  .icon-blob {
    background: #e3f2fd;
    width: 180px;
    height: 180px;
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    animation: blobMorph 8s ease-in-out infinite;
  }
}

@keyframes blobMorph {
  0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
  67% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
}

.max-width-text {
  max-width: 450px;
  line-height: 1.6;
}

.premium-dialog {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: #fcfcfc;
  }
}
</style>

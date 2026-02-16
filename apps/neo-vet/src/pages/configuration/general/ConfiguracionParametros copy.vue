<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-lg">
      <!-- Sidebar de Módulos y Tablas -->
      <div class="col-12 col-md-3">
        <q-card flat bordered class="sidebar-card">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Módulos</div>
          </q-card-section>
          
          <q-list separator class="q-py-sm">
            <q-item 
              v-for="modulo in modulos" 
              :key="modulo.id" 
              clickable 
              v-ripple
              :active="moduloSeleccionado?.id === modulo.id"
              active-class="bg-blue-1 text-primary"
              @click="moduloSeleccionado = modulo"
            >
              <q-item-section avatar>
                <q-icon name="widgets" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ modulo.descripcion }}</q-item-label>
                <q-item-label caption>{{ modulo.identificador }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator v-if="tablas.length > 0" />

          <q-card-section v-if="moduloSeleccionado" class="bg-grey-2">
            <div class="text-subtitle1 text-weight-bold text-grey-8">Tablas del Módulo</div>
          </q-card-section>

          <q-list v-if="moduloSeleccionado" separator class="q-py-sm">
            <q-item 
              v-for="tabla in tablas" 
              :key="tabla.id" 
              clickable 
              v-ripple
              :active="tablaSeleccionada?.id === tabla.id"
              active-class="bg-green-1 text-green-9"
              @click="tablaSeleccionada = tabla"
            >
              <q-item-section avatar>
                <q-icon name="table_chart" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ tabla.descripcion }}</q-item-label>
              </q-item-section>
            </q-item>
            
            <div v-if="tablas.length === 0 && !cargando" class="q-pa-md text-center text-grey">
              No hay tablas configuradas
            </div>
          </q-list>
        </q-card>
      </div>

      <!-- Área de Contenido / CRUD -->
      <div class="col-12 col-md-9">
        <div v-if="tablaSeleccionada">
          <q-card flat bordered class="main-card shadow-2">
            <q-card-section class="bg-gradient text-white row items-center">
              <q-icon name="edit_note" size="md" class="q-mr-md" />
              <div>
                <div class="text-h5">{{ tablaSeleccionada.descripcion }}</div>
                <div class="text-subtitle2 opacity-80">Gestión de parámetros centralizados</div>
              </div>
              <q-space />
              <q-btn 
                round 
                color="white" 
                text-color="primary" 
                icon="add" 
                @click="nuevoParametro"
              >
                <q-tooltip>Agregar nuevo registro</q-tooltip>
              </q-btn>
            </q-card-section>

            <q-table
              :rows="parametros"
              :columns="columnas"
              row-key="id"
              :loading="cargando"
              flat
              class="modern-table"
              no-data-label="No hay registros disponibles para esta tabla"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:body-cell-activo="props">
                <q-td :props="props">
                  <q-chip
                    :color="props.row.activo === 'S' ? 'positive' : 'grey'"
                    text-color="white"
                    dense
                    size="sm"
                  >
                    {{ props.row.activo === 'S' ? 'Activo' : 'Inactivo' }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:body-cell-acciones="props">
                <q-td :props="props" class="text-right">
                  <q-btn flat round color="primary" icon="edit" size="sm" @click="editarParametro(props.row)">
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)">
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card>
        </div>

        <!-- Estado Vacío -->
        <div v-else class="flex flex-center full-height full-width q-pa-xl empty-state">
          <div class="text-center">
            <q-icon name="settings_suggest" size="120px" color="grey-3" />
            <div class="text-h4 text-grey-5 q-mt-md">Seleccione un módulo y una tabla</div>
            <div class="text-subtitle1 text-grey-4">Para comenzar a configurar los parámetros globales del sistema</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogo de Edición/Creación -->
    <q-dialog v-model="dialogoVisible" persistent>
      <q-card style="min-width: 450px" class="rounded-borders">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ itemEditando.id ? 'Editar' : 'Nuevo' }} Parámetro</div>
          <div class="text-subtitle2">{{ tablaSeleccionada?.descripcion }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="guardar" ref="formRef">
            <q-input
              v-model="itemEditando.descripcion"
              label="Descripción *"
              outlined
              dense
              class="q-mb-md"
              :rules="[val => !!val || 'La descripción es obligatoria']"
              autofocus
            />

            <q-input
              v-model="itemEditando.paridad"
              label="Paridad (Opcional)"
              outlined
              dense
              class="q-mb-md"
            />

            <q-checkbox
              v-model="itemEditando.activo"
              label="Activo"
              true-value="S"
              false-value="N"
              class="q-mb-md"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
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
import { useQuasar } from 'quasar';

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
  paridad: '',
  activo: 'S'
});
const formRef = ref(null);

const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: true },
  { name: 'paridad', label: 'Paridad', field: 'paridad', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

const nuevoParametro = () => {
  itemEditando.value = {
    descripcion: '',
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
  const exito = await guardarParametro(itemEditando.value);
  if (exito) {
    dialogoVisible.value = false;
    $q.notify({
      type: 'positive',
      message: 'Parámetro guardado correctamente'
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el parámetro'
    });
  }
};

const confirmarEliminar = async (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${item.descripcion}"?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    eliminarParametro(item);
  });
};
</script>

<style lang="scss" scoped>
.bg-gradient {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.sidebar-card {
  min-height: 80vh;
  border-radius: 12px;
  overflow: hidden;
}

.main-card {
  border-radius: 16px;
  overflow: hidden;
}

.modern-table {
  background: white;
  
  :deep(.q-table__top) {
    padding: 0;
  }
  
  :deep(thead tr th) {
    background-color: #f8f9fa;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
  
  :deep(tbody tr:hover) {
    background-color: #f1f7ff;
    transition: background-color 0.3s ease;
  }
}

.empty-state {
  min-height: 70vh;
  background: #fdfdfd;
  border: 2px dashed #eee;
  border-radius: 20px;
}

.opacity-80 {
  opacity: 0.8;
}

.rounded-borders {
  border-radius: 12px;
}
</style>

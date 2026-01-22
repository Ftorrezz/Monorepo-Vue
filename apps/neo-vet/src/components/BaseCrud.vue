<template>
  <div class="crud-container">
    <!-- Header principal con gradiente -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon :name="getIconForModel()" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">{{ props.crudName }}</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticas.total }} registro{{ estadisticas.total !== 1 ? 's' : '' }} • 
              {{ estadisticas.activos }} activo{{ estadisticas.activos !== 1 ? 's' : '' }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn 
              v-if="!mostrarFormIntegrado"
              flat
              round
              icon="add_circle"
              @click="agregarRegistro"
              size="md"
            >
              <q-tooltip>Agregar {{ props.crudName }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Contenido principal -->
    <div class="row q-col-gutter-md">
      <!-- Formulario lateral (si está integrado) -->
      <div
        v-if="mostrarFormIntegrado"
        class="col-12 col-lg-3"
      >
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-h6 text-primary">{{ props.crudName }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form ref="myForm">
              <template v-for="(field, index) in formFields" :key="index">
                <template v-if="field.component === 'q-input'">
                  <q-input
                    outlined
                    dense
                    v-model="editedItem[field.name]"
                    :label="field.label"
                    :class="field.classes"
                    lazy-rules
                    :rules="field.rules"
                  />
                </template>
                <template v-else-if="field.component === 'q-checkbox'">
                  <q-checkbox
                    v-model="editedItem[field.name]"
                    :label="field.label"
                    :class="field.classes"
                    :true-value="'S'"
                    :false-value="'N'"
                  />
                </template>
                <template v-else-if="field.component === 'q-select'">
                  <q-select
                    v-model="editedItem[field.name]"
                    outlined
                    dense
                    :label="field.label"
                    :options="field.options"
                    :class="field.classes"
                    :rules="field.rules"
                  />
                </template>
              </template>
            </q-form>
          </q-card-section>
          
          <q-separator />
          
          <OpcionCancelarGuardar
            @accionCerrar="close"
            @accionValidar="validate"
          />
        </q-card>
      </div>

      <!-- Modal de formulario (si no está integrado) -->
      <q-dialog v-model="formDialogModal" persistent>
        <q-card style="min-width: 400px">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">{{ props.crudName }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form ref="myForm">
              <template v-for="(field, index) in formFields" :key="index">
                <template v-if="field.component === 'q-input'">
                  <q-input
                    outlined
                    dense
                    v-model="editedItem[field.name]"
                    :label="field.label"
                    :class="field.classes"
                    lazy-rules
                    :rules="field.rules"
                  />
                </template>
                <template v-else-if="field.component === 'q-checkbox'">
                  <q-checkbox
                    v-model="editedItem[field.name]"
                    :label="field.label"
                    :class="field.classes"
                    :true-value="'S'"
                    :false-value="'N'"
                  />
                </template>
                <template v-else-if="field.component === 'q-select'">
                  <q-select
                    v-model="editedItem[field.name]"
                    outlined
                    dense
                    :label="field.label"
                    :options="field.options"
                    :class="field.classes"
                    :rules="field.rules"
                  />
                </template>
              </template>
            </q-form>
          </q-card-section>
          
          <q-separator />
          
          <OpcionCancelarGuardar
            @accionCerrar="close"
            @accionValidar="validate"
          />
        </q-card>
      </q-dialog>

      <!-- Tabla de datos -->
      <div :class="mostrarFormIntegrado ? 'col-12 col-lg-9' : 'col-12'">
        <q-card flat bordered>
          <q-table
            :rows="tableData"
            :columns="tableColumns"
            row-key="id"
            :dense="$q.screen.lt.md"
            :filter="filter"
            no-data-label="No se encontraron registros para mostrar"
            rows-per-page-label="Registros por página"
            :pagination="{ rowsPerPage: 10 }"
            class="modern-table"
          >
            <template v-slot:top>
              <div class="row full-width items-center q-gutter-md">
                <q-input
                  outlined
                  dense
                  debounce="600"
                  v-model="filter"
                  placeholder="Buscar..."
                  class="col-12 col-md-4"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>

                <q-space />

                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="archive"
                  label="Exportar CSV"
                  @click="exportTable"
                  no-caps
                >
                  <q-tooltip>Exportar información a archivo CSV</q-tooltip>
                </q-btn>
              </div>
            </template>

            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <div class="q-gutter-xs">
                  <q-btn
                    flat
                    dense
                    round
                    color="primary"
                    icon="edit"
                    @click="updateItem(props)"
                    size="sm"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    round
                    color="negative"
                    icon="delete"
                    @click="deleteItem(props)"
                    size="sm"
                    :disable="props.row.activo === 'N'"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-activo="props">
              <q-td :props="props">
                <q-chip
                  :color="props.row.activo === 'S' ? 'positive' : 'grey'"
                  :label="props.row.activo === 'S' ? 'Activo' : 'Inactivo'"
                  text-color="white"
                  size="sm"
                  dense
                />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import useCrud from "../composables/useCrud";
import OpcionCancelarGuardar from "./OpcionCancelarGuardar.vue";

const props = defineProps({
  modelName: String,
  crudName: String,
  tituloVentanaeliminacion: String,
});

const visibleFormFields = computed(() => {
  if (Array.isArray(formFields)) {
    return formFields.filter((field) => field.visible !== false);
  }
  return []; // Devuelve un arreglo vacío si formFields no es un arreglo
});

const {
  submitForm,
  createItem,
  updateItem,
  deleteItem,
  tableData,
  tableColumns,
  filter,
  exportTable,
  formFields,
  myForm,
  validate,
  editedItem,
  close,
  mostrarFormIntegrado,
  agregarRegistro,
  formDialogModal,
} = useCrud(props.modelName, props.tituloVentanaeliminacion);

const handleFileInput = (event, fieldName) => {
  const file = event.target.files[0];
  if (file) {
    editedItem.value[fieldName] = file;
  }
};

// Estadísticas para el header
const estadisticas = computed(() => {
  const total = tableData.value?.length || 0;
  const activos = tableData.value?.filter(item => item.activo === 'S').length || 0;
  return {
    total,
    activos
  };
});

// Función para obtener el icono según el modelo
const getIconForModel = () => {
  const iconMap = {
    // Mascotas
    'color': 'palette',
    'especie': 'category',
    'razamascota': 'pets',
    'caracter': 'sentiment_satisfied',
    'dieta': 'restaurant',
    'habitat': 'home',
    'sexo': 'wc',
    
    // Propietarios
    'generoconfiguracion': 'wc',
    'escolaridad': 'school',
    'estadocivil': 'favorite',
    'religion': 'church',
    'razapoblador': 'public',
    'ocupacion': 'work',
    
    // General
    'especialidad': 'medical_services',
    'servicio': 'room_service',
    'tipoprofesional': 'badge',
    'profesional': 'person',
    'perfilconfiguracion': 'account_circle',
    'sitio': 'business',
    'sucursal': 'store',
    'configuracion': 'settings',
    'tipositioubicacion': 'location_on',
    'sitioubicacion': 'place',
    
    // Default
    'default': 'list_alt'
  };
  
  return iconMap[props.modelName] || iconMap['default'];
};
</script>

<style lang="scss" scoped>
.crud-container {
  padding: 16px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.opacity-80 {
  opacity: 0.8;
}

.uppercase input {
  text-transform: uppercase;
}

.modern-table {
  :deep(thead tr th) {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  :deep(tbody tr:hover) {
    background-color: #f8faff;
  }
}
</style>

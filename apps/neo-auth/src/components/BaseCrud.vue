<template>
  <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
    <div
      v-show="!mostrarFormIntegrado"
      class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
    >
      <EncabezadoGenericoPrincipal :tituloVentana="props.crudName" />
    </div>
    <div
      v-if="mostrarFormIntegrado"
      class="col-lg-3 col-md-3 col-sm-12 col-xs-12 shadow-bg"
    >
      <q-card bordered elevated>
        <q-card-section class="text-h6">
          {{ props.crudName }}
        </q-card-section>

        <q-separator inset color="primary"></q-separator>

        <q-card-section>
          <q-form ref="myForm">

            <template v-for="(field, index) in formFields" :key="index">
              <template v-if="field.component === 'q-input'">
                <q-input
                  outlined
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
            </template>
          </q-form>
        </q-card-section>
         <q-separator inset color="primary"></q-separator>
        <OpcionCancelarGuardar
          @accionCerrar="close"
          @accionValidar="validate"
        />
      </q-card>
    </div>

    <div v-if="!mostrarFormIntegrado">
      <q-dialog v-model="formDialogModal" persistent>

        <q-card bordered elevated style="width: 400px" >
        <q-card-section class="text-h6">
          {{ props.crudName }}
        </q-card-section>

        <q-separator inset color="primary"></q-separator>

        <q-card-section>
          <q-form ref="myForm">

            <template v-for="(field, index) in formFields" :key="index">
              <template v-if="field.component === 'q-input'">
                <q-input
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
            </template>
          </q-form>
        </q-card-section>
         <q-separator inset color="primary"></q-separator>
        <OpcionCancelarGuardar
          @accionCerrar="close"
          @accionValidar="validate"
        />
      </q-card>
      </q-dialog>
    </div>

    <div
      :class="[
        mostrarFormIntegrado
          ? 'col-lg-9 col-md-12 col-sm-12 col-xs-12 shadow-bg'
          : 'col-lg-12 col-md-12 col-sm-12 col-xs-12 shadow-bg',
      ]"
    >
      <q-card elevated bordered>
        <!-- Tabla -->
        <q-table
          :rows="tableData"
          :columns="tableColumns"
          row-key="id"
          :dense="$q.screen.lt.md"
          title=""
          :filter="filter"
          no-data-label="No se encontraron registros para mostrar"
          rows-per-page-label="Registros por página"
          :pagination="{ rowsPerPage: 7 }"
        >
          <template v-slot:top>
            <q-input
              outlined
              dense
              debounce="600"
              v-model="filter"
              placeholder="Buscar"
              style="width: 400px"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
              <q-tooltip>ingrese el texto que desea buscar</q-tooltip>
            </q-input>

            <q-space />

            <q-btn v-show="!mostrarFormIntegrado"
              round
              color="secondary"
              icon="add"
              @click="agregarRegistro"
              size="17px"
            >
            <q-tooltip>agregar registro {{ crudName }}</q-tooltip>
            </q-btn>
          </template>
          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <div class="q-gutter-sm">
                <q-btn
                  round
                  color="primary"
                  icon="edit"
                  @click="updateItem(props)"
                  size="11px"
                >
                  <q-tooltip>editar información {{ crudName }}</q-tooltip>
                </q-btn>
                <q-btn
                  round
                  color="negative"
                  icon="delete"
                  @click="deleteItem(props)"
                  size="11px"
                  :disabled="
                    props.row.activo == 'S'
                      ? false
                      : props.row.activo == 'N'
                      ? true
                      : false
                  "
                >
                  <q-tooltip>eliminar registro {{ crudName }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-chip
                :color="
                  props.row.activo == 'S'
                    ? 'positive'
                    : props.row.activo == 'N'
                    ? 'grey'
                    : 'grey'
                "
                :label="
                  props.row.activo == 'S'
                    ? 'Activo'
                    : props.row.activo == 'N'
                    ? 'Inactivo'
                    : 'Activo'
                "
                text-color="white"
                class="text-weight-bolder"
                style="width: 80px"
                align="rigth"
              >
              </q-chip>
            </q-td>
          </template>
        </q-table>
      </q-card>
      <div class="text-right ml-auto">
  <q-btn
    color="primary"
    icon-right="archive"
    label="Exportar a .csv"
    no-caps

    @click="exportTable"
    outline
  >
    <q-tooltip>exportar información de la tabla, en un archivo .csv</q-tooltip>
  </q-btn>
  </div>
    </div>

  </div>

</template>

<script setup>
import { ref } from "vue";
import useCrud from "../composables/useCrud";
import OpcionCancelarGuardar from "../components/OpcionCancelarGuardar.vue";
import EncabezadoGenericoPrincipal from "../components/EncabezadoGenericoPrincipal.vue";
import baseForm from "../components/baseForm.vue"

const props = defineProps({
  modelName: String,
  crudName: String,
  tituloVentanaeliminacion: String


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
  formDialogModal
} = useCrud(props.modelName, props.tituloVentanaeliminacion);
</script>

<style lang="scss">
.uppercase input {
  text-transform: uppercase;
}
.my-card {
  border-radius: 15px;
}

</style>

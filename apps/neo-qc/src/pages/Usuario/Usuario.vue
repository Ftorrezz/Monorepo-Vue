<template>
  <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
    <div
      class="col-lg-12 col-md-12 col-sm-12 col-xs-12"
    >
      <EncabezadoGenericoPrincipal :tituloVentana="crudName" />
    </div>
    <div>
      <q-dialog v-model="formDialogModal" persistent full-width>

        <q-card bordered elevated style="width: 800px" >
        <q-card-section class="text-h6">
          {{ crudName }}
        </q-card-section>

        <q-separator inset color="primary"></q-separator>

        <q-card-section>
          <q-form ref="myForm">
            <div class="row q-col-gutter-xs">
                    <q-card class="col-12 col-md-2 my-content bg-light-green-2">
                      <q-item clickable v-ripple>
                        <q-avatar size="160px" avatar>
                          <img
                            src="https://cdn.quasar.dev/img/boy-avatar.png"
                          />
                        </q-avatar>
                      </q-item>
                    </q-card>

                    <q-card
                      :class="`shadow-up-${1}`"
                      class="row col-12- col-md-10"
                    >
                      <q-item class="col-lg-2 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.nombreusuario"
                          label="Usuario"
                          lazy-rules
                          :rules="[
                            (val) =>
                              (val && val.length > 0) || 'Ingrese un Usuario',
                          ]"
                        />
                      </q-item>

                      <q-item
                        class="col-lg-2 col-md-3 col-sm-12 col-xs-12"
                        v-show="mostrarContrasenia"
                      >
                        <q-input
                          class="full-width"
                          v-model="editedItem.clave"
                          label="Contraseña"
                          type="password"
                          lazy-rules
                          :rules="[
                            (val) =>
                              (val && val.length > 0) ||
                              'Ingrese una contraseña',
                          ]"
                        >
                        </q-input>
                      </q-item>
                      <q-item
                        class="col-lg-3 col-md-3 col-sm-12 col-xs-12"
                        v-show="mostrarContrasenia"
                      >
                        <q-input
                          class="full-width"
                          v-model="editedItem.clave2"
                          label="Repetir contraseña"
                          lazy-rules
                          type="password"
                          :rules="[
                            (val) =>
                              (val && val.length > 0) || 'Repetir contraseña',
                            isValidPassword,
                          ]"
                        >
                        </q-input>
                      </q-item>
                      <q-item class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.primerapellido"
                          label="Primer Apellido"
                          lazy-rules
                          :rules="[
                            (val) =>
                              (val && val.length > 0) ||
                              'Ingrese primer apellido',
                          ]"
                        />
                      </q-item>
                      <q-item class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.segundoapellido"
                          label="Segundo Apellido"
                          lazy-rules
                        />
                      </q-item>

                      <q-item class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.nombre"
                          label="Nombres"
                          lazy-rules
                          :rules="[
                            (val) =>
                              (val && val.length > 0) || 'Ingrese nombres',
                          ]"
                        />
                      </q-item>
                      <q-item class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <ListaGenero v-model="generoSeleccionado" />
                      </q-item>

                      <q-item class="col-lg-2 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.fechanacimiento"
                          label="Fecha nacimiento"
                          stack-label
                          type="date"
                        />
                      </q-item>

                      <q-item class="col-lg-1 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.edad"
                          label="Edad"
                          lazy-rules
                          type="number"
                          :rules="[
                            (val) =>
                              (val > 0 && val < 100) || 'Edad incorrecta',
                          ]"
                        />
                      </q-item>
                    </q-card>
                    <q-separator spaced />

                    <!------->
                    <q-card
                      class="row col-12- col-md-12"
                      :class="`shadow-up-${1}`"
                    >
                      <q-item class="col-lg-1 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.cedula"
                          label="Cédula"
                          lazy-rules
                        />
                      </q-item>
                      <q-item class="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.email"
                          label="Email"
                          type="email"
                          lazy-rules
                          :rules="[
                            (val) => !!val || 'Ingrese un Email',
                            (val) => isValidEmail(val),
                          ]"
                        >
                          <template v-slot:prepend>
                            <q-icon name="mail" />
                          </template>
                        </q-input>
                      </q-item>
                      <q-item class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.telefonomovil"
                          label="Telefono móvil"
                          lazy-rules
                          type="phone"
                        >
                          <template v-slot:prepend>
                            <q-icon name="phone_android" />
                          </template>
                        </q-input>
                      </q-item>
                      <q-item class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.telefono"
                          label="Telefono fijo"
                          lazy-rules
                        >
                          <template v-slot:prepend>
                            <q-icon name="call_end" />
                          </template>
                        </q-input>
                      </q-item>

                      <q-item class="col-lg-2 col-md-3 col-sm-12 col-xs-12">
                        <q-select
                          class="full-width"
                          v-model="perfilSeleccionado"
                          :options="listaUsuariosPerfiles"
                          option-label="descripcion"
                          option-value="id"
                          label="Perfil"
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          :rules="[
                            (val) => !!val || 'Por favor, seleccione un Perfil',
                          ]"
                        />
                      </q-item>

                      <q-item class="col-lg-2 col-md-3 col-sm-12 col-xs-12">
                        <q-select
                          class="full-width"
                          v-model="rolSeleccionado"
                          :options="listaUsuariosRoles"
                          option-label="descripcion"
                          option-value="id"
                          label="Rol"
                          transition-show="flip-up"
                          transition-hide="flip-down"
                          :rules="[
                            (val) => !!val || 'Por favor, seleccione un Rol',
                          ]"
                        />
                      </q-item>

                      <q-checkbox
                        v-model="editedItem.estado"
                        label="Activo"
                        v-show="mostrarEstado"
                      />
                    </q-card>

                    <q-separator spaced />
                    <q-card
                      class="row col-12- col-md-12"
                      :class="`shadow-up-${1}`"
                    >
                      <q-item class="col-lg-4 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.calle"
                          label="calle"
                          lazy-rules
                        />
                      </q-item>
                      <q-item class="col-lg-1 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.exterior"
                          label="exterior"
                          lazy-rules
                        />
                      </q-item>

                      <q-item class="col-lg-1 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.interior"
                          label="interior"
                          lazy-rules
                        />
                      </q-item>
                      <q-item class="col-lg-2 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.colonia"
                          label="colonia / barrio"
                          lazy-rules
                        />
                      </q-item>
                      <q-item class="col-lg-1 col-md-2 col-sm-12 col-xs-12">
                        <q-input
                          class="full-width"
                          v-model="editedItem.codigopostal"
                          label="código postal"
                          lazy-rules
                        />
                      </q-item>
                    </q-card>
                  </div>
            <!--<template v-for="(field, index) in formFields" :key="index">
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
            </template>-->
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
      class="col-lg-12 col-md-12 col-sm-12 col-xs-12 shadow-bg"
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

            <q-btn
              round
              color="secondary"
              icon="add"
              @click="agregarRegistro()"
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
import useCrud from "../../composables/useCrud";
import OpcionCancelarGuardar from "../../components/OpcionCancelarGuardar.vue";
import EncabezadoGenericoPrincipal from "../../components/EncabezadoGenericoPrincipal.vue";
import baseForm from "../../components/baseForm.vue"

const modelName = "usuario";
const crudName = "Usuario";
const tituloVentanaeliminacion = "Usuario";

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
} = useCrud(modelName, tituloVentanaeliminacion);
</script>

<style lang="scss">
.uppercase input {
  text-transform: uppercase;
}
.my-card {
  border-radius: 15px;
}

</style>

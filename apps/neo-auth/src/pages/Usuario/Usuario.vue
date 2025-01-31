<template>
  <div class="row q-col-gutter-sm q-ma-xs q-mr-sm">
    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
      <EncabezadoGenericoPrincipal :tituloVentana="crudName" />
    </div>
    <div>
      <q-dialog v-model="formDialogModal" persistent>
        <q-card
          bordered
          elevated
          style="
            width: 600px;
            max-width: 90vw;
            border-radius: 16px;
            overflow: hidden;
          "
        >
          <q-card-section>
            <div class="text-h5 font-bold text-primary">
              Agregar {{ crudName }}
            </div>
            <div class="text-subtitle2 text-grey-7 q-mt-sm">
              Complete los datos para agregar un nuevo usuario.
            </div>
          </q-card-section>

          <q-separator inset color="primary" />

          <q-card-section>
            <q-form ref="myForm">
              <div class="row q-col-gutter-sm">
                <!-- Imagen del Usuario -->
                <div class="col-12 col-md-4 text-center">
                  <q-avatar size="120px" class="q-mb-md">
                    <img
                      :src="
                        editedItem.foto ||
                        'https://cdn.quasar.dev/img/boy-avatar.png'
                      "
                      alt="Foto del usuario"
                    />
                  </q-avatar>
                  <q-btn
                    flat
                    icon="photo_camera"
                    color="primary"
                    label="Cambiar foto"
                    @click="uploadPhoto"
                  />
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handlePhotoChange"
                  />
                </div>

                <!-- Datos del Usuario -->
                <div class="col-12 col-md-8">
                  <q-input
                    outlined
                    v-model="editedItem.nombreusuario"
                    label="Usuario"
                    lazy-rules
                    :rules="[(val) => !!val || 'Ingrese un nombre de usuario']"
                    class="q-mb-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>

                  <q-input
                    outlined
                    v-model="editedItem.email"
                    label="Email"
                    type="email"
                    lazy-rules
                    :rules="[
                      (val) => !!val || 'Ingrese un correo electrónico',
                      (val) => isValidEmail(val) || 'Ingrese un correo válido',
                    ]"
                    class="q-mb-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="mail" />
                    </template>
                  </q-input>

                  <q-input
                    v-show="mostrarContrasenia"
                    outlined
                    v-model="editedItem.clave"
                    label="Contraseña"
                    :type="isPwd ? 'password' : 'text'"
                    lazy-rules
                    :rules="[
                      (val) => !!val || 'Ingrese una contraseña',
                      (val) =>
                        isValidPassword(val) ||
                        'La contraseña debe contener al menos un número, una letra minúscula, una letra mayúscula y un carácter especial. Además, debe tener una longitud de 8 a 16 caracteres.',
                    ]"
                    class="q-mb-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="vpn_key" />
                    </template>

                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>

                  <q-input
                    v-show="mostrarContrasenia"
                    outlined
                    v-model="editedItem.claverepetir"
                    label="Repetir contraseña"
                    :type="isPwdRep ? 'password' : 'text'"
                    lazy-rules
                    :rules="[
                      (val) =>
                        isValidPassword(val) ||
                        'La contraseña debe contener al menos un número, una letra minúscula, una letra mayúscula y un carácter especial. Además, debe tener una longitud de 8 a 16 caracteres.',
                      (val) =>
                        val === editedItem.clave ||
                        'Las contraseñas no coinciden',
                    ]"
                    class="q-mb-md"
                  >
                    <template v-slot:prepend>
                      <q-icon name="vpn_key" />
                    </template>

                    <template v-slot:append>
                      <q-icon
                        :name="isPwdRep ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwdRep = !isPwdRep"
                      />
                    </template>
                  </q-input>

                  <q-checkbox
                    v-model="editedItem.activo"
                    label="Activo"
                    :true-value="'S'"
                    :false-value="'N'"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>

          <q-separator inset color="primary" />

          <OpcionCancelarGuardar
            @accionCerrar="close"
            @accionValidar="validate"
          />
        </q-card>
      </q-dialog>
    </div>

    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 shadow-bg">
      <q-card elevated bordered>
        <q-table
          :rows="tableData"
          :columns="tableColumns"
          row-key="id"
          :dense="$q.screen.lt.md"
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
              <q-tooltip>Ingrese el texto que desea buscar</q-tooltip>
            </q-input>

            <q-space />

            <q-btn
              round
              color="secondary"
              icon="add"
              @click="agregarRegistro()"
              size="17px"
            >
              <q-tooltip>Agregar registro {{ crudName }}</q-tooltip>
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
                  <q-tooltip>Editar información {{ crudName }}</q-tooltip>
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
                  <q-tooltip>Eliminar registro {{ crudName }}</q-tooltip>
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
          <q-tooltip
            >Exportar información de la tabla, en un archivo .csv</q-tooltip
          >
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

const modelName = "usuario";
const crudName = "Usuario";
const tituloVentanaeliminacion = "Usuario";
const isPwd = ref(true);
const isPwdRep = ref(true);

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
  mostrarContrasenia
} = useCrud(modelName, tituloVentanaeliminacion);

const uploadPhoto = () => {
  const input = document.querySelector('input[type="file"]');
  if (input) input.click();
};

const handlePhotoChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      editedItem.foto = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidPassword = (password) => {
  const re = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
  return re.test(password);
};
</script>

<style lang="scss">
.hidden {
  display: none;
}

.text-primary {
  color: #2d88ff;
}
</style>

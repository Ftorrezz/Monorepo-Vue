<template>
  <q-dialog v-model="mostrarDialogo" persistent>
    <q-card
      bordered
      elevated

      class="fixed-card"
    >
      <q-bar class="bg-primary text-white">
        <q-icon name="person" />
        <div>Propietario</div>

        <q-space />

        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey q-mb-lg"
          active-color="primary"
          indicator-color="primary"
          align="justify"

        >
          <q-tab name="general" label="General" />
          <q-tab name="adicional" label="Adicional" />
          <q-tab name="facturacion" label="Facturación" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated class="flex-panels">
          <q-tab-panel name="general" class="flex-panel-content">
            <q-form ref="myForm">
              <div class="row q-col-gutter-sm">
                <q-card-section class="row q-col-gutter-xs">
                  <q-item class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input v-model="prueba" label="Primer Apellido" />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input v-model="prueba" label="Segundo Apellido" />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-4 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input v-model="prueba" label="Nombres" />
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input
                        v-model="prueba"
                        label="Correo electronico"
                        type="email"
                      >
                        <template v-slot:prepend>
                          <q-icon name="mail" />
                        </template>
                      </q-input>
                    </q-item-section>
                  </q-item>
                  <q-item class="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                    <q-item-section>
                      <q-input
                        v-model="prueba"
                        label="Telefono móvil"
                        lazy-rules
                      >
                        <template v-slot:prepend>
                          <q-icon name="phone_android" />
                        </template>
                      </q-input>
                    </q-item-section>
                  </q-item>
                </q-card-section>
              </div>
            </q-form>
          </q-tab-panel>

          <q-tab-panel name="adicional">
            <div class="text-h6">Alarms</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-tab-panel>

          <q-tab-panel name="facturacion">
            <div class="text-h6">Movies</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator inset color="primary" />

      <OpcionCancelarGuardar @accionCerrar="close" @accionValidar="validate" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import OpcionCancelarGuardar from "../OpcionCancelarGuardar.vue";

const tab = ref("general");
const splitterModel = ref(10);

const mostrarDialogo = ref(true);
const editedItem = ref({
  nombreusuario: "",
  email: "",
  clave: "",
  claverepetir: "",
  foto: "",
  activo: "S",
});
const isPwd = ref(true);
const isPwdRep = ref(true);
const mostrarContrasenia = ref(true);
const isValidEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
const isValidPassword = (password: string) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
  return re.test(password);
};

const photoInput = ref(null);
const uploadPhoto = () => {
  const photoInput = ref(null);
};

const close = () => {
  mostrarDialogo.value = false;
};
const validate = () => {
  const form = ref(null);
  if (form.value.validate()) {
    // Aquí puedes realizar la acción de guardar
    console.log("Formulario válido");
  } else {
    console.log("Formulario inválido");
  }
};
</script>
<style scoped>

.fixed-card {
  width: 800px; /* Ancho fijo */
 /* height: 600px; /* Alto fijo */
  max-width: 100%; /* Asegura que no exceda el ancho de la pantalla */
  max-height: 100%; /* Asegura que no exceda el alto de la pantalla */
  display: flex;
  flex-direction: column;
}

.flex-panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.flex-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto; /* Permite desplazamiento si el contenido es más grande */
}
</style>

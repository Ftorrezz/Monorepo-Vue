<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-layout>
      <q-page-container>
        <q-page class="flex flex-center">
          <q-card class="my-card shadow-bg" elevated>
            <q-img src="static/loginHIS.png"> </q-img>

            <q-card-section>
              <div class="text-center q-gutter-md my-color">
                <div class="text-h4 d-flex justify-center align-center">
                  <span class="ml-2">NeoHIS</span>
                  <div class="text-subtitle2">
                    {{ $t("descripcionsistema") }}
                    
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-card-section>
              <q-form class="q-gutter-md" @submit.prevent="onSubmit">
                <q-input
                  outlined
                  v-model="userForm.nombreusuario"
                  :label="$t('inputlogin.label')"
                  lazy-rules
                  :rules="[validationRule]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input
                  outlined
                  v-model="userForm.clave"
                  :label="$t('inputlogin.labelpassword')"
                  :type="isPwd ? 'password' : 'text'"
                  lazy-rules
                  :rules="[passwordValidationRule]"
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

                <div>
                  <q-btn type="submit" color="primary" class="full-width">
                    {{ $t("login") }}
                  </q-btn>
                </div>
                <div class="row items-center justify-between">
                  
                  <q-select
                    v-model="locale"
                    :options="localeOptions"
                    dense
                    borderless
                    emit-value
                    map-options
                    options-dense
                    style="min-width: 150px"
                  >
                    <template v-slot:prepend>
                      <q-icon name="translate" />
                    </template>
                  </q-select>
                  <!--<q-toggle
                    v-model="olvidoClave"
                    color="accent"
                    icon="mail"
                    :label="t('forgotPassword')"
                  />-->
                  <q-btn 
                    flat
                    dense
                    color="accent"
                    icon="mail"
                    :label="t('forgotPassword')"
                    @click="olvidoClave = true"
                    class="text-decoration-underline cursor-pointer"
                    style="font-size: 0.8em"
                  />
                  
                </div>

                <div v-if="olvidoClave && userForm.nombreusuario">
                  <CambioClaveUsuario
                    :nombreUsuario="userForm.nombreusuario"
                    @cancelar="cancelarOlvidoClave"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../../composables/useAuth";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import CambioClaveUsuario from "../../components/CambioClaveUsuario.vue";

defineOptions({
  name: "login",
});
const $q = useQuasar();
const router = useRouter();
const { loginUser, logout } = useAuth();
const { t, locale } = useI18n({ useScope: "global" });

const validationRule = (val: string) => {
  return (val && val.length > 0) || t("inputlogin.validation");
};

const passwordValidationRule = (val: string) => {
  return (val && val.length > 0) || t("inputlogin.validationpassword");
};

function handleForgotPassword() {
  console.log("Redirigiendo al flujo de recuperación de contraseña...");
  // Lógica: redirigir al flujo de recuperación o mostrar un modal
}

const olvidoClave = ref(false);

const localeOptions = [
  { value: "es", label: "Español"},
  { value: "en-US", label: "English"},
];

const userForm = ref({
  nombreusuario: null,
  clave: null,
});

const isPwd = ref(true);
const isMostrarSucursal = ref(false);

const onSubmit = async (): void => {
  const { ok, error } = await loginUser(userForm.value);

  if (ok == true) router.push({ name: "inicio" });
};

watch(olvidoClave, (newValue, oldValue) => {
  if (newValue === true) {
    if (!userForm.value.nombreusuario) olvidoClave.value = false;
  }
});

const cancelarOlvidoClave = () => {
  olvidoClave.value = false;
};
</script>

<style lang="scss" scoped>
.my-card {
  width: 50%;
  max-width: 400px;
}
.container {
  display: flex; /* Usar flexbox */
  align-items: center; /* Centrar verticalmente los elementos */
}

/* Opcional: Ajusta el margen entre los elementos */
.container q-select {
  margin-right: 10px;
}

.imagenfondo {
  /* Establecer la imagen de fondo y el color de fondo transparente */
  //background-image: url('static/fondopantalla.png');
  /* Ajustar otros estilos según sea necesario */
  background-size: cover; /* Hace que la imagen cubra toda el área disponible */
  background-position: center; /* Centra la imagen en el contenedor */
  /* Establece la altura del contenedor para que coincida con la pantalla */
  height: 100vh; /* 100% de la altura de la ventana del navegador */
  /* Asegura que el contenido esté en la parte superior */
  display: flex;
  justify-content: center;
  align-items: center;
}
.shadow-bg {
  background-color: rgba(
    255,
    255,
    255,
    0.9
  ); /* Color de fondo con transparencia */
  box-shadow: 0px 0px 20px rgba(47, 6, 230, 0.8); /* Sombra negra con opacidad */
}
</style>

<template>
  <div class="q-pa-md row items-start session-lock">
    <q-layout>
      <q-page-container>
        <q-page class="flex flex-center">

          <q-card class="my-card" elevated :class="`shadow-${10}`">


            <q-card-section>

              <div class="text-center q-gutter-md my-color">

                <div class="text-h6 d-flex justify-center align-center">
                  <q-img src="/static/bloqueosesion.png"> </q-img>
                  <span class="ml-2">{{ $t("pantallabloqueo.descripcion") }}</span>
                </div>

              </div>
            </q-card-section>
            <q-card-section>

              <q-form class="q-gutter-md" @submit.prevent="onSubmit">
                <q-input
                outlined
                v-model="userForm.clave"
                  :label="$t('pantallabloqueo.label')"
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

                <div class="q-gutter-md">
                  <q-btn type="submit" color="positive" class="full-width no-uppercase" align="around">
                    <div class="q-btn__content" style="display: flex; align-items: center; justify-content: center; width: 100%;">
                      <q-icon name="lock_open" class="q-mr-sm" /> <!-- Icono a la izquierda con margen -->
                      <span style="flex: 1; text-align: center;">{{ $t("desbloquear") }}</span>
                    </div>
                  </q-btn>
                </div>
                <div>
                  <q-btn color="negative" class="full-width no-uppercase" align="around" @click="onLogout">
                    <div class="q-btn__content" style="display: flex; align-items: center; justify-content: center; width: 100%;">
                      <q-icon name="logout" class="q-mr-sm" /> <!-- Icono a la izquierda con margen -->
                      <span style="flex: 1; text-align: center;">{{ $t("cerrarsesion") }}</span>
                    </div>
                  </q-btn>
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "bloqueosesion",
});
const $q = useQuasar();
const router = useRouter();
const { loginUser, logout, username } = useAuth();
const { t, locale } = useI18n({ useScope: "global" });

const emit = defineEmits(['password-correct', 'logout']); // Definir la emisión del evento

const passwordValidationRule = (val: string) => {
  return (val && val.length > 0) || t("inputlogin.validationpassword");
};

const userForm = ref({
  nombreusuario: username,
  clave: null,
});

const isPwd = ref(true);
const isMostrarSucursal = ref(false);

const onSubmit = async (): void => {
  const { ok, error } = await loginUser(userForm.value);

  if (ok == true) emit('password-correct');
};

const onLogout = () => {

  logout();
  emit('logout');
  router.push({ name: "login" });

};

</script>

<style lang="scss" scoped>
.my-card {
  width: 50%;
  max-width: 400px;

}
.session-lock {

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo más oscuro y transparente */
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;

}
.no-uppercase {
  text-transform: none !important;
}
</style>

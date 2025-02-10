<template>
  <q-btn-dropdown
    class="glossy"
    color="bg-blue"
    :label="username"
    transition-show="flip-up"
    transition-hide="flip-down"
  >
    <div class="row no-wrap q-pa-md">
      <div class="column">
        <div class="text-h6 q-mb-md">{{ $t('userMenu.options') }}</div>
        <q-btn
          color="primary"
          :label="$t('userMenu.changePassword')"
          size="sm"
          @click="openDialog"
          v-close-popup
        />
      </div>

      <q-separator vertical inset class="q-mx-lg" />

      <div class="column items-center">
        <q-avatar size="72px">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
        <div class="text-subtitle1 q-mt-md q-mb-xs">
          {{username}}
        </div>

        <q-btn
          color="primary"
          :label="$t('userMenu.logout')"
          size="sm"
          @click="onLogout"
          v-close-popup
        />
      </div>
    </div>
  </q-btn-dropdown>
  <!--<q-dialog v-model="show" persistent>
    <q-card>
      <div class="q-pa-xs q-gutter-xs">
        <EncabezadoGenerico :formTitle="formTitle" />

        <q-card-section>
          <q-form ref="form">
            <q-input
              v-model="formData.email"
              :label="$t('userMenu.email')"
              :rules="[
                (val) => !!val || $t('userMenu.validation.required'),
                (val) =>
                  /.+@.+\..+/.test(val) ||
                  $t('userMenu.validation.validEmail'),
              ]"
            ></q-input>
            <q-input
              v-model="formData.password"
              :label="$t('userMenu.newPassword')"
              type="password"
              :rules="[(val) => !!val || $t('userMenu.validation.required')]"
            ></q-input>
            <q-input
              v-model="formData.confirmPassword"
              :label="$t('userMenu.confirmPassword')"
              type="password"
              :rules="[
                (val) => !!val || $t('userMenu.validation.required'),
                (val) =>
                  val === formData.password || $t('userMenu.validation.passwordMatch'),
              ]"
            ></q-input>

            <OpcionCancelarGuardar
              @accionCerrar="closeDialog"
              @accionValidar="submitForm"
            />
          </q-form>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>-->
</template>

<script setup lang='ts'>
//import EncabezadoGenerico from "src/components/CRUD/EncabezadoGenerico.vue";
//import OpcionCancelarGuardar from "src/components/CRUD/OpcionCancelarGuardar.vue";
import { useRouter } from "vue-router";
import useAuth from "src/composables/useAuth";
import { ref, computed } from "vue";
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { logout, username } = useAuth();
const { t } = useI18n();

const onLogout = () => {
  logout();
  router.push({ name: "login" });
  
};

const show = ref(false);
const formTitle = ref("Renovar contraseña");

const formData = ref({
  email: "",
  password: "",
  confirmPassword: "",
});

const openDialog = computed(() => () => {
  show.value = true;
});

const closeDialog = computed(() => () => {
  show.value = false;
});
</script>

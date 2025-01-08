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
        <div class="text-h6 q-mb-md">Opciones</div>
        <q-btn
          color="primary"
          label="Cambiar contraseña"
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
        <!--<div class="text-subtitle1 q-mt-md q-mb-xs">{{ username }}</div>-->

        <q-btn
          color="primary"
          label="Cerrar sesión"
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
              label="Correo electrónico"
              :rules="[
                (val) => !!val || 'Este campo es requerido',
                (val) =>
                  /.+@.+\..+/.test(val) ||
                  'Ingrese un correo electrónico válido',
              ]"
            ></q-input>
            <q-input
              v-model="formData.password"
              label="Contraseña nueva"
              type="password"
              :rules="[(val) => !!val || 'Este campo es requerido']"
            ></q-input>
            <q-input
              v-model="formData.confirmPassword"
              label="Confirmar contraseña nueva"
              type="password"
              :rules="[
                (val) => !!val || 'Este campo es requerido',
                (val) =>
                  val === formData.password || 'Las contraseñas no coinciden',
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

const router = useRouter();
const { logout, username } = useAuth();

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

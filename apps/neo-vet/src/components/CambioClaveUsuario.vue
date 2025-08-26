<template>
  <!--<div v-if="autorizacionService.sistemaBloqueado" class="session-lock">-->
  <q-dialog v-model="_cambioClave" persistent>
    <div class="q-pa-md text-subtitle1" style="width: 850px; max-width: 80vw;">
      
      <q-stepper v-model="step" ref="stepper" color="primary" animated active-color="purple">
        
        <q-step
          :name="1"
          :title="$t('passwordRecovery.steps.recovery')"
          icon="settings"
          :done="step > 1"
        >
          
         <div class="column text-h5" >
         <span class="q-mt-sx">{{ $t('passwordRecovery.labels.user') }}: {{ nombreUsuario }}</span>
         </div>

          {{ $t('passwordRecovery.messages.instructions') }}
                 
        </q-step>

        <q-step
          :name="2"
          :title="$t('passwordRecovery.steps.sending')"
          icon="mail"
          :done="step > 2"
          @active="fn_recuperarClave"
        >
          <div class="column text-h5" >
          <span class="q-mt-sx">{{ $t('passwordRecovery.labels.user') }}: {{ nombreUsuario }}</span>
          </div>

          {{ $t('passwordRecovery.messages.sending') }}

          {{ envioError }}

          <div class="column items-center">
            <q-spinner color="primary" size="4em" :thickness="6" />
            <span class="q-mt-sm">{{ $t('passwordRecovery.messages.sendingStatus') }}</span>
          </div>
        </q-step>

        <q-step 
          :name="3" 
          :title="$t('passwordRecovery.steps.update')" 
          icon="save" 
          class="text-subtitle1"
        >
          <div class="column text-h5" >
          <span class="q-mt-sx">{{ $t('passwordRecovery.labels.user') }}: {{ nombreUsuario }}</span>
          </div>

          {{respuestaEnvio}} 
          
          <div class="q-mt-sm column items-center text-h6">
            <span>{{ $t('passwordRecovery.messages.enterCode') }}</span>
          </div>
          

          <div class="items-center">
            <q-form class="q-gutter-md" @submit.prevent="onSubmit">
                
                <div>
                <q-input
                  v-model="actualizaClaveForm.codigorecuperacion"
                  :label="$t('passwordRecovery.labels.recoveryCode')"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      $t('passwordRecovery.validation.recoveryCode'),
                  ]"
                >
                  <template v-slot:before>
                    <q-icon name="numbers" />
                  </template>
                </q-input>

                <q-input
                  v-model="actualizaClaveForm.clave"
                  :label="$t('passwordRecovery.labels.newPassword')"
                  :type="isPwd ? 'password' : 'text'"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      $t('passwordRecovery.validation.password'),
                  ]"
                >
                  <template v-slot:before>
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
                  v-model="actualizaClaveForm.confirmacionclave"
                  :label="$t('passwordRecovery.labels.repeatNewPassword')"
                  :type="isPwd ? 'password' : 'text'"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      $t('passwordRecovery.validation.repeatPassword'),
                  ]"
                >
                  <template v-slot:before>
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

                </div>
                <div>
                  <q-btn type="submit" color="primary" class="full-width">
                    {{ $t('passwordRecovery.buttons.update') }}
                  </q-btn>
                </div>
                                
              </q-form>
            
          </div>


        </q-step>

        <q-step
          :name="4"
          :title="$t('passwordRecovery.steps.finish')"
          icon="mail"
          :done="step > 3"
        >
          <div class="column text-h5" >
         <span class="q-mt-sx">{{ $t('passwordRecovery.labels.user') }}: {{ nombreUsuario }}</span>
         </div>
          {{ $t('passwordRecovery.messages.finish') }}

        </q-step>

      
        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn
              v-if="step === 1"
              @click="$refs.stepper.next()"
              color="primary"
              :label="$t('passwordRecovery.buttons.continue')"
            />
            <q-btn
              v-if="step === 1 || step === 3"
              flat
              color="negative"
              @click="cancelar(this.$emit)"
              :label="$t('passwordRecovery.buttons.cancel')"
              class="q-ml-sm"
            />
            <q-btn
              v-if="step === 4"
              flat
              color="negative"
              @click="_cambioClave = !_cambioClave"
              :label="$t('passwordRecovery.buttons.finish')"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { Usuario } from "src/common/interface/usuario.interfaz";
import { ref, watch } from "vue";
import useAuth from "../composables/useAuth";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{
  nombreUsuario: string;
}>();

const { solicitarCodigoRecuperacion, actualizarClaveUsuario } = useAuth();

let _cambioClave = ref(true);
let step = ref(1)
let respuestaEnvio = ref('')
let envioError = ref('')
const isPwd = ref(true);

const actualizaClaveForm = ref({
  nombreusuario: props.nombreUsuario,
  codigorecuperacion: '',
  clave: '',
  confirmacionclave: '',
});

const fn_recuperarClave = async () =>{
     
     let _usuario: Usuario = {
        nombreusuario: props.nombreUsuario,
        clave: '[NO_VALIDA]',
        confirmacionclave: '[NO_VALIDA]'
     };
    
     const { ok, _respuesta } = await solicitarCodigoRecuperacion(_usuario)
     
     if (ok == true){ 
      
      respuestaEnvio.value = _respuesta;
      step.value = 3 

     } else if (ok == false) envioError.value = _respuesta

};

const onSubmit = async (): void => {

  let _usuario: Usuario = {
        nombreusuario: props.nombreUsuario,
        clave: actualizaClaveForm.value.clave,
        confirmacionclave: actualizaClaveForm.value.confirmacionclave,
        codigorecuperacion:  +actualizaClaveForm.value.codigorecuperacion
     };

  const { ok, _respuesta } = await actualizarClaveUsuario(_usuario);

  if (ok == true){ 
      
      
      respuestaEnvio.value = _respuesta;
      step.value = 4;

      

     } 
};

watch(step, (newValue, oldValue) => {
  if (newValue === 2) {
    
    fn_recuperarClave(); // Llama a la función cuando el paso cambia a 2
  }
});

const cancelar = (emitFunction: any) => {
  // Coloca aquí la lógica para cancelar
  _cambioClave.value = false;
  emitFunction('cancelar');
}





</script>

<style scoped>
.session-lock {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
}

.my-card {
  max-width: 400px;
}
</style>

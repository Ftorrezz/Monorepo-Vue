<template>
  <h1 v-if="authStatus === 'autenticando'">{{ authStatus }}</h1>
  <router-view v-else />

  <div v-if="showSessionLock && authStatus === 'autenticado'">
    <BloqueoSesion @password-correct="ContinuarSesion"/>
    <!-- Aquí colocas tu pantalla de bloqueo de sesión -->
  </div>
</template>

<script setup lang="ts">
import useAuth from "./composables/useAuth";
import { ref, onMounted, watch } from "vue";
import BloqueoSesion from "./components/BloqueoSesion.vue"

defineOptions({
  name: "App",
});

const { authStatus, checkAuthStatus } = useAuth();

checkAuthStatus();

// Define el tiempo de inactividad en milisegundos (por ejemplo, 5 minutos)
const INACTIVITY_TIMEOUT = 1 * 60 * 10000;

// Variable reactiva para controlar si se muestra la pantalla de bloqueo de sesión
const showSessionLock = ref(false);

let inactivityTimer: any;

// Función para reiniciar el temporizador de inactividad
const resetInactivityTimer = () => {

  if (authStatus.value === 'autenticado'){
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    showSessionLock.value = true;
  }, INACTIVITY_TIMEOUT);}
};

// Función para reiniciar el temporizador de inactividad
const ContinuarSesion = () => {

 clearTimeout(inactivityTimer);
  showSessionLock.value = false;

};

// Observa cambios en el estado de autenticación
watch(authStatus, (newStatus) => {
  if (newStatus === "autenticado") {
    // Si el usuario se autentica, reinicia el temporizador
    resetInactivityTimer();
  } else {
    // Si no está autenticado, detén el temporizador y oculta el bloqueo
    clearTimeout(inactivityTimer);
    showSessionLock.value = false;
  }
});

// Iniciar el temporizador cuando el componente se monta
onMounted(() => {
  resetInactivityTimer();
  window.addEventListener("mousemove", resetInactivityTimer);
  window.addEventListener("keydown", resetInactivityTimer);
  window.addEventListener("click", resetInactivityTimer);
});


</script>
<style scoped>

</style>

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
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { io } from 'socket.io-client'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/Auth'
import { useNotificationsStore } from 'src/stores/Notifications'
import BloqueoSesion from "./components/BloqueoSesion.vue"

defineOptions({
  name: "App",
});

const { authStatus, checkAuthStatus } = useAuth();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const $q = useQuasar();
let notifSocket: any = null;

checkAuthStatus();

const connectTaskNotifications = () => {
  if (!authStore.token || !authStore.id_usuario) return;

  if (notifSocket && notifSocket.connected) return;
  if (notifSocket) { notifSocket.disconnect(); }

  notifSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:81', {
    transports: ['websocket'],
    auth: { token: authStore.token }
  });

  notifSocket.on('connect', () => {
    notifSocket.emit('user_join', authStore.id_usuario);
  });

  notifSocket.on('tarea_asignada', (tarea: any) => {
    notificationsStore.pushNotification({
      id: tarea.id,
      title: `Tarea asignada: ${tarea.titulo}`,
      message: tarea.descripcion || '',
      payload: tarea,
    });

    $q.notify({
      type: 'info',
      icon: 'assignment',
      message: `Te asignaron: ${tarea.titulo}`,
      timeout: 3000,
      position: 'top',
      onClick: () => notificationsStore.focusNotification(tarea.id)
    });

    notificationsStore.focusNotification(tarea.id);
  });

  notifSocket.on('tarea_actualizada', (tarea: any) => {
    notificationsStore.pushNotification({
      id: tarea.id,
      title: `Tarea actualizada: ${tarea.titulo}`,
      message: tarea.descripcion || '',
      payload: tarea,
    });
  });
};

const disconnectTaskNotifications = () => {
  if (notifSocket) {
    notifSocket.disconnect();
    notifSocket = null;
  }
};

// Define el tiempo de inactividad en milisegundos (por ejemplo, 5 minutos)
const INACTIVITY_TIMEOUT = 1 * 60 * 2000000;//10000;

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
    connectTaskNotifications();
    // Si el usuario se autentica, reinicia el temporizador
    resetInactivityTimer();
  } else {
    disconnectTaskNotifications();
    // Si no está autenticado, detén el temporizador y oculta el bloqueo
    clearTimeout(inactivityTimer);
    showSessionLock.value = false;
  }
}, { immediate: true });

// Iniciar el temporizador cuando el componente se monta
onMounted(() => {
  resetInactivityTimer();
  window.addEventListener("mousemove", resetInactivityTimer);
  window.addEventListener("keydown", resetInactivityTimer);
  window.addEventListener("click", resetInactivityTimer);
});

onBeforeUnmount(() => {
  disconnectTaskNotifications();
  window.removeEventListener("mousemove", resetInactivityTimer);
  window.removeEventListener("keydown", resetInactivityTimer);
  window.removeEventListener("click", resetInactivityTimer);
});


</script>
<style scoped>

</style>

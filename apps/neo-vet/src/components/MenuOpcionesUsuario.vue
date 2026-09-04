<template>
  <div class="row items-center no-wrap">

    <!-- Notifications button + menu -->
      <q-btn push round flat icon="notifications" class="shortcut-btn" @click.stop.prevent="mostrarNotificaciones = !mostrarNotificaciones" style="margin-right:8px; z-index:9999">
        <q-badge v-if="notificationsStore.unreadCount" color="negative" floating :label="notificationsStore.unreadCount" />
      </q-btn>
      <q-menu v-model="mostrarNotificaciones" anchor="bottom right" self="top right" :cover="false">

      <q-card style="min-width: 300px; max-width: 420px">
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle2">Notificaciones</div>
          <q-btn flat dense icon="done_all" @click="notificationsStore.markAllRead" title="Marcar todas como leídas" />
        </q-card-section>
        <q-separator />
        <q-list dense style="max-height: 320px; overflow:auto">
          <q-item
            v-for="notif in notificationsStore.all"
            :key="notif.id"
            :data-notif-id="notif.id"
            clickable
            @click="openNotification(notif)"
            :class="notif.read ? 'text-grey-6' : (notif.id === highlightedNotificationId ? 'notif-highlight' : '')"
          >
            <q-item-section>
              <q-item-label>{{ notif.title }}</q-item-label>
              <q-item-label caption class="text-caption-xs">{{ notif.message }} · {{ new Date(notif.date).toLocaleString() }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="notificationsStore.all.length === 0"><q-item-section class="text-grey-6 q-pa-sm">Sin notificaciones</q-item-section></q-item>
        </q-list>
      </q-card>
    </q-menu>

    <!-- User dropdown -->
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
          <div class="text-subtitle1 q-mt-md q-mb-xs">{{username}}</div>

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
  </div>
</template>

<script setup lang='ts'>
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";
import { ref, computed, nextTick, watch } from "vue";
import { useNotificationsStore } from "src/stores/Notifications";

const router = useRouter();
const { logout, username } = useAuth();
const notificationsStore = useNotificationsStore();

const mostrarNotificaciones = ref(false)
const highlightedNotificationId = ref(null)

// react to store focus requests
watch(() => notificationsStore.focusId, (id) => {
  if (id) {
    highlightedNotificationId.value = id
    mostrarNotificaciones.value = true
    setTimeout(() => { highlightedNotificationId.value = null }, 4000)
  }
})

const onLogout = () => {
  logout();
  router.push({ name: "login" });
};

const openNotification = async (notif) => {
  notificationsStore.markRead(notif.id)
  mostrarNotificaciones.value = false
}

const openAndHighlight = async (id) => {
  highlightedNotificationId.value = id
  mostrarNotificaciones.value = true
  await nextTick()
  setTimeout(() => { highlightedNotificationId.value = null }, 4000)
}

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

<style scoped>
.notif-highlight { background-color: rgba(68,138,255,0.08); border-left: 3px solid rgba(68,138,255,0.22); }
</style>

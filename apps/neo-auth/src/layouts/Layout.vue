<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lFf">
      <!-- HEADER -->
      <q-header flat class="bg-primary">
        <q-toolbar>
          <q-btn
            v-show="useIsAdmin"
            flat
            dense
            round
            @click="toggleLeftDrawer"
            icon="menu"
            aria-label="Menu"
          />
          <q-toolbar-title>{{title}}</q-toolbar-title>
          <DarkModeToggle />
          <MenuOpcionesUsuario />

        </q-toolbar>
      </q-header>

      <!-- DRAWER -->
      <q-drawer
        v-if="useIsAdmin"
        v-model="leftDrawerOpen"
        show-if-above
        :width="360"
        :breakpoint="400"
        elevated
        side="left"
        :mini="miniState"
        @mouseover="miniState = false"
        @mouseout="miniState = true"
      >
        <div
          class="full-height"
          :class="$q.dark.isActive ? 'drawer_dark' : 'drawer_normal'"
        >
          <div style="height: calc(100% - 20px); padding: 5px">
            <q-scroll-area style="height: 100%">
              <MenuPrincipal />
            </q-scroll-area>
          </div>
        </div>
      </q-drawer>

      <!-- PAGE CONTAINER -->
      <q-page-container>
        <router-view />
      </q-page-container>

      <!-- FOOTER -->
      <q-footer
        class="footer bg-primary text-white"
        elevated
        @mouseenter="expandFooter()"
        @mouseleave="collapseFooter()"
        :class="{ 'footer-expanded': footerOpen }"
      >
        <div class="footer-content">
          <div class="footer-main">
            <q-icon name="place" class="icon-large" />
            <div>
              <div v-if="!footerOpen" class="footer-title">
                <span class="working-at">Usted se encuentra trabajando en: </span>
                <span class="branch-name">{{ sucursalSeleccionada?.descripcion || $t('footer.selectBranch') }}</span>
              </div>
              <div v-else>
                <div class="footer-title">
                  <span class="working-at">Usted se encuentra trabajando en: </span>
                  <span class="branch-name">{{ sucursalSeleccionada?.descripcion || $t('footer.selectBranch') }}</span>
                </div>
                <div class="footer-details" v-if="sucursalSeleccionada">
                  {{ $t('footer.address') }}: {{ sucursalSeleccionada.direccion }}
                </div>
                <div class="footer-details" v-if="sucursalSeleccionada">
                  {{ $t('footer.manager') }}: {{ sucursalSeleccionada.responsable }}
                </div>
              </div>
            </div>
          </div>
          <div class="footer-copyright">
            <div class="version-text">v{{ appVersion }}</div>
            <div class="copyright-text">
              {{ currentYear }} Neodimio. {{ $t('footer.copyright') }}
            </div>
          </div>
        </div>
      </q-footer>
    </q-layout>
  </div>
</template>


<script setup lang="ts">
import DarkModeToggle from "../components/DarkModeToggle.vue";
import MenuOpcionesUsuario from "../components/MenuOpcionesUsuario.vue";
import MenuPrincipal from "../components/MenuPrincipal.vue";
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/Auth"
import { useDialogStore } from "../stores/DialogoUbicacion"
import { version } from '../../package.json'

defineOptions({
  name: "Layout",
});

const leftDrawerOpen = ref(false);
const miniState = ref(true);
const footerOpen = ref(false);
const title = ref('NeoHIS :: App Center')
const { useIsAdmin } = useAuthStore()
const dialogStore = useDialogStore()
const appVersion = version;

const sucursalSeleccionada = computed(() => dialogStore.sucursalSeleccionada)

const currentYear = new Date().getFullYear()

// Manejadores de transición del footer
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

function expandFooter() {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }
  footerOpen.value = true;
}

function collapseFooter() {
  debounceTimeout = setTimeout(() => {
    footerOpen.value = false;
  }, 150); // Delay para evitar el comportamiento errático
}

async function toggleLeftDrawer() {
  leftDrawerOpen.value = await !leftDrawerOpen.value;
}

</script>


<style scoped>
.footer {
  transition: height 0.3s ease;
  height: 50px;
  overflow: hidden;
}

.footer-expanded {
  height: 120px;
}

.footer-content {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 100%;
}

.footer-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-large {
  font-size: 24px;
}

.footer-title {
  font-size: 1rem;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

.working-at {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: normal;
  white-space: nowrap;
}

.branch-name {
  font-weight: 500;
}

.footer-details {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 4px;
}

.footer-copyright {
  text-align: right;
  font-size: 0.8rem;
  opacity: 0.7;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version-text {
  font-family: monospace;
  opacity: 0.9;
}

.copyright-text {
  white-space: nowrap;
}

.drawer_dark {
  background-color: #1d1d1d;
}

.drawer_normal {
  background-color: white;
}
</style>

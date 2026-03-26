<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lFf">
      <!-- HEADER -->
      <q-header flat class="bg-primary shadow-2">
        <q-toolbar>
          <q-btn
            v-if="uiStore.menuType === 'sidebar' || $q.screen.lt.md"
            flat
            dense
            round
            @click="uiStore.toggleLeftDrawer"
            icon="menu"
            aria-label="Menu"
          />
          
          <q-toolbar-title v-if="$q.screen.gt.xs">{{title}}</q-toolbar-title>
          
          <q-space />
          
          <MenuStyleToggle />
          <DarkModeToggle />
          <MenuOpcionesUsuario />
        </q-toolbar>

        <!-- SEGUNDA FILA: LOGO + MENÚ (Solo en Desktop y si el tipo es Horizontal) -->
        <q-toolbar 
          v-if="$q.screen.gt.sm && uiStore.menuType === 'horizontal'" 
          :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-primary', 'border-bottom-menu q-px-lg modern-sub-header']"
        >
          <img
            src="/static/VetDimioMenuMini.png"
            alt="Logo"
            class="menu-logo-img cursor-pointer"
            @click="router.push('/')"
          />
          <q-separator vertical inset class="q-mx-sm" />
          <MenuHorizontal />
        </q-toolbar>
      </q-header>

      <!-- DRAWER (Siempre en Mobile, en Desktop solo si es Sidebar) -->
      <q-drawer
        v-model="uiStore.leftDrawerOpen"
        :show-if-above="uiStore.menuType === 'sidebar'"
        :width="360"
        :mini-width="80"
        :mini="uiStore.miniState && uiStore.menuType === 'sidebar' && $q.screen.gt.sm"
        :breakpoint="1023"
        elevated
        side="left"
        class="modern-drawer"
        @mouseover="uiStore.menuType === 'sidebar' && (uiStore.miniState = false)"
        @mouseleave="uiStore.menuType === 'sidebar' && (uiStore.miniState = true)"
        v-if="uiStore.menuType === 'sidebar' || $q.screen.lt.md"
      >
        <!-- LOGO ADAPTATIVO -->
        <div
          class="adaptive-logo-section"
          :class="{ 'mini-mode-active': uiStore.miniState && uiStore.menuType === 'sidebar' && $q.screen.gt.sm }"
        >
          <!-- Logo grande -->
          <div
            v-show="!(uiStore.miniState && uiStore.menuType === 'sidebar')"
            class="logo-expanded-container flex flex-center"
          >
            <img
              src="/static/VetDimioMenu.png"
              alt="VetDimio Logo"
              class="system-logo-expanded"
            />
          </div>

          <!-- Logo pequeño -->
          <div
            v-show="uiStore.miniState && uiStore.menuType === 'sidebar'"
            class="logo-mini-container flex flex-center"
          >
            <img
              src="/static/VetDimioMenuMini.png"
              alt="VetDimio Logo Mini"
              class="system-logo-mini"
            />
          </div>
        </div>

        <q-separator v-if="!$q.dark.isActive" />

        <!-- Área del menú -->
        <div
          class="menu-section"
          :class="[
            $q.dark.isActive ? 'drawer_dark' : 'drawer_normal',
          ]"
        >
          <q-scroll-area 
            style="height: calc(100vh - 120px)"
            :thumb-style="{ width: '0px' }"
            :bar-style="{ width: '0px' }"
          >
            <MenuPrincipal />
          </q-scroll-area>
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
              <div v-if="!footerOpen" class="footer-title">Ubicación</div>
              <div v-else>
                <div class="footer-title">Sucursal Central</div>
                <div class="footer-details">
                  Dirección: Avenida Siempre Viva, 742
                </div>
                <div class="footer-details">Horario: 8:00 AM - 8:00 PM</div>
              </div>
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
import MenuHorizontal from "../components/MenuHorizontal.vue";
import MenuStyleToggle from "../components/MenuStyleToggle.vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUiStore } from "../stores/uiStore";

const $q = useQuasar();
const router = useRouter();
const uiStore = useUiStore();

defineOptions({
  name: "Layout",
});

const footerOpen = ref(false);
const { t, locale } = useI18n({ useScope: "global" });
const title = ref(t("descripcionsistemalargo"));

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
  }, 150);
}
</script>

<style scoped>
/* LOGO ADAPTATIVO */
.adaptive-logo-section {
  position: relative;
  color: white;
  transition: all 0.3s ease;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adaptive-logo-section.mini-mode {
  min-height: 50px;
  padding: 5px;
}

/* LOGO EXPANDIDO (menú abierto) */
.logo-expanded-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
}

.system-logo-expanded {
  max-width: 220px;
  max-height: 80px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.modern-drawer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

:deep(.body--dark) .modern-drawer {
  background: rgba(30, 30, 30, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* LOGO MINI (menú minimizado) */
.logo-mini-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 6%;
  ;
}

.system-logo-mini {
  width: 50px;
  height: 40px;
  object-fit: contain;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.system-logo-mini:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Fallback para logo mini cuando no se puede cargar */
.logo-fallback {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  transition: all 0.3s ease;
}

.logo-fallback:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* SECCIÓN DEL MENÚ */
.menu-section {
  flex: 1;
  padding: 8px;
  transition: height 0.3s ease;
}

.menu-with-adaptive-logo {
  height: calc(100vh - 160px); /* Altura ajustada para logo adaptativo */
}

/* ANIMACIONES DE TRANSICIÓN */
.logo-expanded-container {
  animation: fadeInScale 0.3s ease-out;
}

.logo-mini-container {
  animation: fadeInRotate 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInRotate {
  from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .system-logo-expanded {
    width: 300px;
    height: 70px;
  }

  .system-logo-mini {
    width: 35px;
    height: 35px;
  }

  .logo-fallback {
    width: 35px;
    height: 35px;
    font-size: 12px;
  }
}

/* Footer styles - sin cambios */
.footer {
  height: 50px;
  transition: height 0.3s ease-in-out, background-color 0.3s ease-in-out;
  background: linear-gradient(to right, #4a90e2, #007aff);
  overflow: hidden;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-expanded {
  height: 150px;
  background: linear-gradient(to right, #007aff, #4a90e2);
}

.footer-content {
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.footer-main {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-title {
  font-size: 1.2em;
  font-weight: bold;
}

.footer-details {
  font-size: 0.9em;
}

.icon-large {
  font-size: 36px;
}

.border-bottom-menu {
  border-bottom: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  z-index: 10;
}

.modern-sub-header {
  min-height: 56px; /* Altura reducida */
  transition: all 0.3s ease;
}

.menu-logo-img {
  height: 45px; /* Logo más grande */
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
}

/* Soporte para modo oscuro en la barra de menú */
:deep(.body--dark) .border-bottom-menu {
  background-color: #1d1d1d !important;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
/* Mini Mode Logo Adjustments */
.adaptive-logo-section {
  padding: 16px 0;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mini-mode-active {
  padding: 12px 0;
}

.system-logo-expanded {
  width: 180px;
  max-width: 90%;
  height: auto;
}

.system-logo-mini {
  width: 44px;
  height: auto;
}

/* Ocultar barra de scroll nativa del Drawer para que no se encime al diseño */
:deep(.q-drawer__content) {
  overflow-y: hidden !important;
}
</style>

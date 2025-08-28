<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lFf">
      <!-- HEADER -->
      <q-header flat class="bg-primary">
        <q-toolbar>
          <q-btn
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
        v-model="leftDrawerOpen"
        show-if-above
        :width="400"
        :breakpoint="400"
        elevated
        side="left"
        :mini="miniState && !isPinned"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- LOGO ADAPTATIVO: Cambia según el estado del menú -->
        <div
          class="adaptive-logo-section"
          :class="{ 'mini-mode': miniState && !isPinned }"
        >
          <!-- Logo grande cuando está expandido -->
          <div
            v-show="!miniState || isPinned"
            class="logo-expanded-container"
          >
            <img
              src="../../public/static/NeoVETMenu.png"
              alt="NeoVET Logo"
              class="system-logo-expanded"
              @error="handleImageError"
            />
            <q-btn
              flat
              dense
              round
              :icon="isPinned ? 'push_pin' : 'push_pin'"
              :color="isPinned ? 'primary' : 'grey-6'"
              @click="togglePin"
              @mouseenter="pinHovered = true"
              @mouseleave="pinHovered = false"
              size="sm"
              class="pin-expanded"
            >
              <q-tooltip>{{ isPinned ? 'Desanclar menú' : 'Anclar menú' }}</q-tooltip>
            </q-btn>
          </div>

          <!-- Logo pequeño cuando está minimizado -->
          <div
            v-show="miniState && !isPinned"
            class="logo-mini-container"
          >
            <img
              src="../../public/static/NeoVETMenuMini.png"
              alt="NeoVET Logo Mini"
              class="system-logo-mini"
              @error="handleMiniImageError"
            />
          </div>
        </div>

        <q-separator />

        <!-- Área del menú -->
        <div
          class="menu-section"
          :class="[
            $q.dark.isActive ? 'drawer_dark' : 'drawer_normal',
            'menu-with-adaptive-logo'
          ]"
        >
          <q-scroll-area style="height: 100%">
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
import { ref } from "vue";

defineOptions({
  name: "Layout",
});

const leftDrawerOpen = ref(false);
const miniState = ref(true);
const isPinned = ref(false);
const pinHovered = ref(false);
const footerOpen = ref(false);
const title = ref('NeoVET :: Sistema de Gestión Veterinaria');

// Manejadores del drawer
function handleMouseEnter() {
  if (!isPinned.value && !pinHovered.value) {
    miniState.value = false;
  }
}

function handleMouseLeave() {
  if (!isPinned.value && !pinHovered.value) {
    setTimeout(() => {
      if (!pinHovered.value && !isPinned.value) {
        miniState.value = true;
      }
    }, 100);
  }
}

function togglePin() {
  isPinned.value = !isPinned.value;
  if (isPinned.value) {
    miniState.value = false;
  } else {
    setTimeout(() => {
      if (!pinHovered.value) {
        miniState.value = true;
      }
    }, 100);
  }
}

function handleImageError(event: Event) {
  console.warn('No se pudo cargar el logo del sistema completo');
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
}

function handleMiniImageError(event: Event) {
  console.warn('No se pudo cargar el logo mini del sistema');
  const target = event.target as HTMLImageElement;
  // Fallback: mostrar solo las iniciales o un ícono
  target.style.display = 'none';

  // Opcional: crear un fallback con texto
  const fallback = document.createElement('div');
  fallback.className = 'logo-fallback';
  fallback.textContent = 'NV';
  target.parentNode?.appendChild(fallback);
}

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

async function toggleLeftDrawer() {
  leftDrawerOpen.value = await !leftDrawer;
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
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  gap: 10px;
}

.system-logo-expanded {
  width: 350px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.pin-expanded {
  background-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.pin-expanded:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* LOGO MINI (menú minimizado) */
.logo-mini-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8%;
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
</style>

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
        <!-- Header con logo del sistema -->
        <div class="logo-section">
            <img
              src="../../public/static/NeoVETMenu.png"
              alt="NeoVET Logo"
              class="system-logo"
              @error="handleImageError"
            />


        </div>

        <!-- Botón de pin -->
        <div class="pin-section" v-if="!miniState || isPinned">
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
            class="pin-button"
          >
            <q-tooltip>{{ isPinned ? 'Desanclar menú' : 'Anclar menú' }}</q-tooltip>
          </q-btn>
        </div>

        <!-- Área del menú -->
        <div
          class="menu-section"
          :class="$q.dark.isActive ? 'drawer_dark' : 'drawer_normal'"
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
    miniState.value = false; // Expandir cuando se ancla
  } else {
    // Si se desancla y no está el mouse sobre el drawer, contraer
    setTimeout(() => {
      if (!pinHovered.value) {
        miniState.value = true;
      }
    }, 100);
  }
}

// Manejador para error de imagen
function handleImageError(event: Event) {
  console.warn('No se pudo cargar el logo del sistema');
  // Opcionalmente puedes establecer una imagen por defecto
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
}

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
  }, 150);
}

async function toggleLeftDrawer() {
  leftDrawerOpen.value = await !leftDrawerOpen.value;
}
</script>

<style scoped>
/* Estilos para la sección del logo */
.logo-section {

  color: white;
  padding: 10px 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.system-logo {
  width: 350px;
  height: 100px;
  object-fit: contain;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1px;
}

.system-info {
  flex: 1;
}

.system-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.system-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.2;
}

/* Estilos para la sección del pin */
.pin-section {
  padding: 8px;
  text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.pin-button {
  transition: all 0.3s ease;
}

.pin-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Estilos para la sección del usuario */
.user-section {
  position: relative;
}

.user-background {
  width: 100%;
}

.user-info {
  padding: 16px;
}

/* Estilos para la sección del menú */
.menu-section {
  flex: 1;
  height: calc(100vh - 254px); /* 64px header + 150px imagen + 40px pin section */
  padding: 8px;
}

/* Footer styles */
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

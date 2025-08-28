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
        <!-- OPCIÓN 1: Pin superpuesto en la esquina del logo -->
        <!--<div class="logo-section-option1" v-show="!miniState || isPinned">
          <img
            src="../../public/static/NeoVETMenu.png"
            alt="NeoVET Logo"
            class="system-logo"
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
            class="pin-floating"
          >
            <q-tooltip>{{ isPinned ? 'Desanclar menú' : 'Anclar menú' }}</q-tooltip>
          </q-btn>
        </div>-->

        <!-- OPCIÓN 2: Pin integrado horizontalmente con el logo -->
        <div class="logo-section-option2" v-show="!miniState || isPinned">
          <img
            src="../../public/static/NeoVETMenu.png"
            alt="NeoVET Logo"
            class="system-logo-inline"
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
            class="pin-inline"
          >
            <q-tooltip>{{ isPinned ? 'Desanclar menú' : 'Anclar menú' }}</q-tooltip>
          </q-btn>
        </div>



        <!-- OPCIÓN 3: Pin en el header del drawer -->
        <!--
        <div class="drawer-header" v-show="!miniState || isPinned">
          <img
            src="../../public/static/NeoVETMenu.png"
            alt="NeoVET Logo"
            class="system-logo"
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
            class="pin-header"
          >
            <q-tooltip>{{ isPinned ? 'Desanclar menú' : 'Anclar menú' }}</q-tooltip>
          </q-btn>
        </div>
        -->

        <!-- Área del menú -->
        <div
          class="menu-section"
          :class="[
            $q.dark.isActive ? 'drawer_dark' : 'drawer_normal',
            (!miniState || isPinned) ? 'menu-with-logo' : 'menu-full-height'
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
  console.warn('No se pudo cargar el logo del sistema');
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
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
  leftDrawerOpen.value = await !leftDrawerOpen.value;
}
</script>

<style scoped>
/* OPCIÓN 1: Pin flotante superpuesto */
.logo-section-option1 {
  position: relative;
  color: white;
  padding: 10px 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.system-logo {
  width: 350px;
  height: 100px;
  object-fit: contain;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1px;
}

.pin-floating {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pin-floating:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

/* OPCIÓN 2: Pin integrado horizontalmente */
.logo-section-option2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  padding: 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  gap: 10px;
  transition: all 0.3s ease;
}

.system-logo-inline {
  width: 350px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1px;
  flex-shrink: 0;
}

.pin-inline {
  background-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.pin-inline:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* OPCIÓN 3: Pin en header del drawer */
.drawer-header {
  display: flex;
  flex-direction: column;
  color: white;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.drawer-header .system-logo {
  width: 350px;
  height: 100px;
  object-fit: contain;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 1px;
  margin: 10px auto;
}

.pin-header {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.pin-header:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Estilos para la sección del menú */
.menu-section {
  flex: 1;
  padding: 8px;
  transition: height 0.3s ease;
}

/* Ajustar altura del menú cuando hay logo */
.menu-with-logo {
  height: calc(100vh - 190px); /* Con logo visible */
}

/* Menú de altura completa cuando no hay logo */
.menu-full-height {
  height: calc(100vh - 50px); /* Sin logo, altura completa */
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

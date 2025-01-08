<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lFf">
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
          NeoHIS

          <q-toolbar-title>
            
          </q-toolbar-title>

          <DarkModeToggle />
          <q-btn-dropdown class="glossy" color="bg-blue" :label="username">
            <div class="row no-wrap q-pa-md">
              <!--<div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-toggle v-model="mobileData" label="Use Mobile Data" />
                <q-toggle v-model="bluetooth" label="Bluetooth" />
              </div>

              <q-separator vertical inset class="q-mx-lg" />-->

              <div class="column items-center">
                <q-avatar size="72px">
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                </q-avatar>

                <div class="text-subtitle1 q-mt-md q-mb-xs">{{ username }}</div>

                <q-btn
                  color="primary"
                  label="Cerrar sesión"
                  size="sm"
                  @click="logout"
                  v-close-popup
                />
              </div>
            </div>
          </q-btn-dropdown>

          <!--<q-btn  flat icon="account_circle"> USUARIO
            <q-menu auto-close :offset="[110, 0]">
              <q-list style="min-width: 200px">
                <q-item clickable>
                  <q-item-section>Cerrar sesión</q-item-section>
                </q-item>

                <q-item clickable>
                  <q-item-section>Cambiar contraseña</q-item-section>
                </q-item>
                
              </q-list>
            </q-menu>
          </q-btn>-->
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        :width="315"
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
              <!--<q-list>
            <q-item-label
              header
              class="text-grey-8"
            >
              Essential Links
            </q-item-label>

            <EssentialLink
              v-for="link in menuPrincipal"
              :key="link.title"
              v-bind="link"
            />
          </q-list>-->
            </q-scroll-area>
          </div>
        </div>
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>

      <q-footer flat class="bg-primary">
      <q-toolbar>
        <q-toolbar-title>
          
          <div>Ubicación</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import DarkModeToggle from "src/components/DarkModeToggle.vue"; //"components/DarkModeToggle.vue";
import MenuPrincipal from "../components/MenuPrincipalHospital.vue";
import useAuth from "src/composables/useAuth";
import { ref } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: 'HISLayout'
});

  const router = useRouter();

  //const { sideMenuOpen, toggleSideMenu } = useUI();
  
  const { logout, username } = useAuth();
  const leftDrawerOpen = ref(false);

  function toggleLeftDrawer () {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };
  
  const miniState =  ref(false);

  const drawer = ref(false);
  
 /* onLogout: () => {
        router.push({ name: "Login" });
        logout();
      },*/
</script>

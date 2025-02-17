<template>
  <q-list>
    <q-item
      to="/"
      active-class="my-menu-link"
      exact
      class="q-ma-xs navigation-item"
    >
      <q-item-section avatar>
        <q-icon name="home" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t('mainMenu.home') }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-expansion-item :icon="'settings'" :label="$t('mainMenu.settings.title')">
      <q-list class="q-pl-lg">
        

        <q-expansion-item :icon="'lock'" :label="$t('mainMenu.settings.security.title')">
          <q-list class="q-pl-lg">
            <q-item
              to="/usuario"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('mainMenu.settings.security.user') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/usuarioperfil"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('mainMenu.settings.security.profile') }}</q-item-label>
              </q-item-section>
            </q-item>
            <!-- <q-item
              to="/rol"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('mainMenu.settings.security.role') }}</q-item-label>
              </q-item-section>
            </q-item>-->
            <q-item
              to="/usuarioacceso"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="adjust" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('mainMenu.settings.security.access') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-expansion-item 
          v-if="authStore.useIsSuperAdmin"
          :icon="'admin_panel_settings'" 
          :label="$t('mainMenu.settings.admin.title')"
        >
          
        <q-list class="q-pl-lg">
          <q-expansion-item :icon="'home_work'" :label="$t('mainMenu.settings.institutional.title')">
          <q-list class="q-pl-lg">
            <q-list class="q-pl-lg">
              <q-item
                to="/sitio"
                active-class="my-menu-link"
                class="q-ma-xs navigation-item"
              >
                <q-item-section avatar side>
                  <q-icon name="adjust" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('mainMenu.settings.institutional.entity') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                to="/sucursal"
                active-class="my-menu-link"
                class="q-ma-xs navigation-item"
              >
                <q-item-section avatar side>
                  <q-icon name="adjust" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('mainMenu.settings.institutional.branch') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-list>
        </q-expansion-item>
        
            
         
          </q-list>
        </q-expansion-item>

        
      </q-list>
    </q-expansion-item>
    <!-- Nueva sección de Administrador -->
    
  </q-list>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/Auth';

const { t } = useI18n();
const authStore = useAuthStore();
</script>

<style lang="scss">
.my-menu-link {
  color: white;
  background: $primary;
}

.navigation-item {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>

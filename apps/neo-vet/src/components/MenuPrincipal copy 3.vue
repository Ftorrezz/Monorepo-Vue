<template>
  <q-list>
    <template v-for="(menu, index) in menuConfig" :key="index">

      <!-- Si el menú tiene sub-items, se muestra como un menú desplegable -->
      <q-expansion-item
        v-if="menu.items && menu.items.length > 0"
        :icon="menu.icon"
        :label="menu.label"
        :default-opened="menu.defaultopened"
      >
        <q-list class="q-pl-lg">
          <template v-for="(item, subIndex) in menu.items" :key="subIndex">
            <q-item
              v-if="!item.subItems"
              :to="item.to"
              clickable
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-expansion-item
              v-else
              :icon="item.icon"
              :label="item.label"

            >
              <q-list class="q-pl-lg">
                <q-item
                  v-for="(subItem, subSubIndex) in item.subItems"
                  :key="subSubIndex"
                  :to="subItem.to"
                  clickable
                  active-class="my-menu-link"
                  class="q-ma-xs navigation-item"
                >
                  <q-item-section avatar>
                    <q-icon :name="subItem.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ subItem.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </template>
        </q-list>
      </q-expansion-item>

      <!-- Si no tiene sub-items, se muestra como un enlace directo -->
      <q-item
        v-else
        :to="menu.to"
        clickable
        active-class="my-menu-link"
        class="q-my-xs navigation-item"
      >
        <q-item-section avatar>
          <q-icon :name="menu.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ menu.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup>
import { menuConfig } from "src/config/menuConfig";
</script>

<style lang="scss">
.my-menu-link {
  color: white;
  background: $primary;
  border-radius: 5px;
}
.navigation-item {
  border-radius: 8px;
}
</style>

<!--<template>
  <q-list>

    <q-expansion-item icon="home" label="Inicio">
      <q-list class="q-pl-lg">
        <q-item
          to="/propietariomascota"
          active-class="my-menu-link"
          exact
          class="q-ma-xs navigation-item"
        >
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Propietario / Mascota</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          to="/agenda"
          active-class="my-menu-link"
          exact
          class="q-ma-xs navigation-item"
        >
          <q-item-section avatar>
            <q-icon name="calendar_month" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Agenda</q-item-label>
          </q-item-section>
        </q-item>

      </q-list>
    </q-expansion-item>

    <q-item
      to="/"
      active-class="my-menu-link"
      exact
      class="q-ma-xs navigation-item"
    >
      <q-item-section avatar>
        <q-icon name="dashboard" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Tablero</q-item-label>
      </q-item-section>
    </q-item>


    <q-expansion-item icon="settings" label="Configuración">
      <q-list class="q-pl-lg">

        <q-expansion-item icon="pets" label="Mascota">
          <q-list class="q-pl-lg">
            <q-item
              to="/color"
              clickable
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Color</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/razamascota"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Raza</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/especie"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Especie</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/sexo"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Sexo</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/habitat"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Habitat</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/caracter"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Carácter</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/dieta"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dieta</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/diagnostico"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Especialidad</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/especialidad"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Especialidad</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <!--<q-expansion-item icon="person" label="Propietario">
          <q-list class="q-pl-lg">
            <q-item
              to="/escolaridad"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Escolaridad</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              to="/estadocivil"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Estado Civil</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/ocupacion"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Ocupación</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/raza"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Raza</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              to="/religion"
              active-class="my-menu-link"
              class="q-ma-xs navigation-item"
            >
              <q-item-section avatar side>
                <q-icon name="send" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Religion</q-item-label>
              </q-item-section>
            </q-item>

          </q-list>
        </q-expansion-item>-->

      <!--</q-list>
    </q-expansion-item>
  </q-list>
</template>

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
</style>-->

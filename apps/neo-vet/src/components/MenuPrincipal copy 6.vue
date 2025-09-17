<template>
  <q-list class="modern-menu">
    <template v-for="(menu, index) in menuConfig" :key="index">
      <!-- Menú con subitems -->
      <q-expansion-item
        v-if="menu.items && menu.items.length > 0"
        :icon="menu.icon"
        :label="menu.label"
        :default-opened="menu.defaultopened"
        class="menu-item-parent"
        header-class="menu-header"
        :class="{ 'menu-expanded': isExpanded(menu) }"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-icon
              :name="menu.icon"
              class="menu-icon"
              :class="{ 'icon-active': isExpanded(menu) }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-label">{{ menu.label }}</q-item-label>
          </q-item-section>
        </template>

        <q-list class="submenu-container">
          <template v-for="(item, subIndex) in menu.items" :key="subIndex">
            <!-- Item simple sin sub-subitems -->
            <q-item
              v-if="!item.subItems"
              :to="item.to"
              clickable
              active-class="active-menu-item"
              class="submenu-item"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" class="submenu-icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="submenu-label">{{ item.label }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Item con sub-subitems (nivel 3) -->
            <q-expansion-item
              v-else
              :icon="item.icon"
              :label="item.label"
              class="submenu-expansion"
              header-class="submenu-expansion-header"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon :name="item.icon" class="submenu-icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="submenu-label">{{ item.label }}</q-item-label>
                </q-item-section>
              </template>

              <q-list class="sub-submenu-container">
                <template v-for="(subItem, subSubIndex) in item.subItems" :key="subSubIndex">
                  <!-- Sub-subitem simple -->
                  <q-item
                    v-if="!subItem.subItems"
                    :to="subItem.to"
                    clickable
                    active-class="active-menu-item"
                    class="sub-submenu-item"
                    v-ripple
                  >
                    <q-item-section avatar>
                      <q-icon :name="subItem.icon" class="sub-submenu-icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="sub-submenu-label">{{ subItem.label }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <!-- Sub-subitem con más niveles (nivel 4) -->
                  <q-expansion-item
                    v-else
                    :icon="subItem.icon"
                    :label="subItem.label"
                    class="sub-submenu-expansion"
                    header-class="sub-submenu-expansion-header"
                  >
                    <template v-slot:header>
                      <q-item-section avatar>
                        <q-icon :name="subItem.icon" class="sub-submenu-icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="sub-submenu-label">{{ subItem.label }}</q-item-label>
                      </q-item-section>
                    </template>

                    <q-list class="deep-submenu-container">
                      <q-item
                        v-for="(deepItem, deepIndex) in subItem.subItems"
                        :key="deepIndex"
                        :to="deepItem.to"
                        clickable
                        active-class="active-menu-item"
                        class="deep-submenu-item"
                        v-ripple
                      >
                        <q-item-section avatar>
                          <q-icon :name="deepItem.icon" class="deep-submenu-icon" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="deep-submenu-label">{{ deepItem.label }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-expansion-item>
                </template>
              </q-list>
            </q-expansion-item>
          </template>
        </q-list>
      </q-expansion-item>

      <!-- Menú directo sin subitems -->
      <q-item
        v-else
        :to="menu.to"
        clickable
        active-class="active-menu-item"
        class="menu-item-direct"
        v-ripple
      >
        <q-item-section avatar>
          <q-icon :name="menu.icon" class="menu-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="menu-label">{{ menu.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup>
import { ref } from 'vue'
import { menuConfig } from "src/config/menuConfig"

const expandedItems = ref(new Set())

const isExpanded = (menu) => {
  return expandedItems.value.has(menu.label)
}
</script>

<style lang="scss" scoped>
// Importar el módulo de color de Sass
@use "sass:color";

.modern-menu {
  padding: 8px;
  background: transparent;

  .menu-item-parent {
    margin-bottom: 2px;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .menu-header {
      padding: 16px 20px;
      min-height: 60px;
      border-radius: 12px;

      .menu-icon {
        font-size: 24px;
        color: rgba(0, 0, 0, 0.7); // Suavizado de negro a gris oscuro
        transition: all 0.3s ease;

        &.icon-active {
          transform: rotate(90deg);
          color: $secondary;
        }
      }

      .menu-label {
        font-weight: 400; // Cambiado de 600 a 400 (normal)
        font-size: 17px;
        color: rgba(0, 0, 0, 0.8); // Suavizado de negro puro a gris oscuro
        letter-spacing: 0.25px;
      }
    }
  }

  .menu-item-direct {
    margin-bottom: 4px;
    border-radius: 12px;
    min-height: 60px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .menu-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.7); // Suavizado
      transition: all 0.3s ease;
    }

    .menu-label {
      font-weight: 400; // Cambiado de 600 a 400
      font-size: 17px;
      color: rgba(0, 0, 0, 0.8); // Suavizado
      letter-spacing: 0.25px;
    }
  }

  .submenu-container {
    background: rgba(255, 255, 255, 0.02);
    padding: 8px 16px 16px 16px;
    border-radius: 0 0 12px 12px;

    .submenu-item {
      margin-bottom: 4px;
      border-radius: 10px;
      padding: 12px 16px;
      min-height: 48px;
      background: rgba(255, 255, 255, 0.03);
      transition: all 0.2s ease;
      border-left: 3px solid transparent;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-left-color: $primary;
      }

      .submenu-icon {
        font-size: 20px;
        color: $primary;
        opacity: 0.8;
        transition: all 0.2s ease;
      }

      .submenu-label {
        font-weight: 400; // Cambiado de 500 a 400
        font-size: 15px;
        color: rgba(0, 0, 0, 0.75); // Suavizado
        opacity: 0.9;
      }
    }

    .submenu-expansion {
      margin-bottom: 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      overflow: hidden;

      .submenu-expansion-header {
        padding: 12px 16px;
        min-height: 48px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.06);
        }
      }

      .submenu-icon {
        font-size: 20px;
        color: $primary;
        opacity: 0.8;
      }

      .submenu-label {
        font-weight: 400; // Cambiado de 500 a 400
        font-size: 15px;
        color: rgba(0, 0, 0, 0.75); // Suavizado
        opacity: 0.9;
      }
    }
  }

  .sub-submenu-container {
    background: rgba(255, 255, 255, 0.01);
    padding: 8px 12px;

    .sub-submenu-item {
      margin-bottom: 2px;
      border-radius: 8px;
      padding: 10px 12px;
      min-height: 40px;
      background: rgba(255, 255, 255, 0.02);
      transition: all 0.2s ease;
      border-left: 2px solid transparent;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        border-left-color: $secondary;
      }

      .sub-submenu-icon {
        font-size: 16px;
        color: $secondary;
        opacity: 0.7;
      }

      .sub-submenu-label {
        font-weight: 300; // Cambiado de 400 a 300 (más ligero)
        font-size: 14px;
        color: rgba(0, 0, 0, 0.7); // Suavizado
        opacity: 0.8;
      }
    }

    .sub-submenu-expansion {
      margin-bottom: 4px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);

      .sub-submenu-expansion-header {
        padding: 10px 12px;
        min-height: 40px;
      }

      .sub-submenu-icon {
        font-size: 16px;
        color: $secondary;
        opacity: 0.7;
      }

      .sub-submenu-label {
        font-weight: 300; // Cambiado de 400 a 300
        font-size: 14px;
        color: rgba(0, 0, 0, 0.7); // Suavizado
        opacity: 0.8;
      }
    }
  }

  .deep-submenu-container {
    background: rgba(255, 255, 255, 0.005);
    padding: 4px 8px;

    .deep-submenu-item {
      margin-bottom: 1px;
      border-radius: 6px;
      padding: 8px 10px;
      min-height: 36px;
      background: rgba(255, 255, 255, 0.01);
      transition: all 0.2s ease;
      border-left: 1px solid transparent;

      &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-left-color: $accent;
      }

      .deep-submenu-icon {
        font-size: 14px;
        color: $accent;
        opacity: 0.6;
      }

      .deep-submenu-label {
        font-weight: 300; // Cambiado de 400 a 300
        font-size: 13px;
        color: rgba(0, 0, 0, 0.65); // Más suavizado
        opacity: 0.75;
      }
    }
  }

  .active-menu-item {
    // Usar la nueva sintaxis con el módulo sass:color
    background: linear-gradient(135deg, $primary 0%, color.adjust($primary, $lightness: 10%) 100%) !important;
    border-left-color: $secondary !important;

    .menu-label,
    .submenu-label,
    .sub-submenu-label,
    .deep-submenu-label {
      color: white !important;
      opacity: 1 !important;
      font-weight: 500 !important; // Reducido de 600 a 500
    }

    .menu-icon,
    .submenu-icon,
    .sub-submenu-icon,
    .deep-submenu-icon {
      color: white !important;
      opacity: 1 !important;
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .modern-menu {
    padding: 4px;

    .menu-item-parent,
    .menu-item-direct {
      margin-bottom: 2px;

      .menu-header {
        padding: 12px 16px;
        min-height: 52px;
      }
    }

    .submenu-container {
      padding: 6px 12px 12px 12px;

      .submenu-item,
      .submenu-expansion-header {
        padding: 10px 12px;
        min-height: 44px;
      }
    }
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .modern-menu {
    .menu-item-parent,
    .menu-item-direct {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    .menu-label,
    .submenu-label,
    .sub-submenu-label,
    .deep-submenu-label {
      color: rgba(255, 255, 255, 0.8) !important; // Suavizado en modo oscuro
    }
  }
}
</style>

<template>
  <q-list class="premium-menu">
    <template v-for="(menu, index) in menuConfig" :key="index">
      <!-- Menú con subitems -->
      <q-expansion-item
        v-if="menu.items && menu.items.length > 0"
        :default-opened="menu.defaultopened"
        class="premium-expansion"
        header-class="premium-header"
        :icon="menu.icon"
        :label="$t(menu.labelKey)"
        expand-icon="keyboard_arrow_down"
      >

        <q-list class="premium-submenu">
          <template v-for="(item, subIndex) in menu.items" :key="subIndex">
            <!-- Item simple (Nivel 2) -->
            <q-item
              v-if="!item.subItems"
              :to="item.to"
              clickable
              active-class="premium-active-item"
              class="premium-item"
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t(item.labelKey) }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Item con sub-subitems (Nivel 3) -->
            <q-expansion-item
              v-else
              class="premium-expansion-nested"
              header-class="premium-header-nested"
              :icon="item.icon"
              :label="$t(item.labelKey)"
              expand-icon="keyboard_arrow_down"
            >

              <q-list class="premium-sub-submenu">
                <template v-for="(subItem, subSubIdx) in item.subItems" :key="subSubIdx">
                  <q-item
                    v-if="!subItem.subItems"
                    :to="subItem.to"
                    clickable
                    active-class="premium-active-subitem"
                    class="premium-sub-item"
                    v-ripple
                  >
                    <q-item-section avatar>
                      <q-icon :name="subItem.icon" size="xs" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t(subItem.labelKey) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-expansion-item
                    v-else
                    class="premium-expansion-nested"
                    header-class="premium-header-nested"
                    :icon="subItem.icon"
                    :label="$t(subItem.labelKey)"
                    expand-icon="keyboard_arrow_down"
                  >
                    <q-list class="premium-sub-submenu">
                      <template v-for="(lvl4, lvl4Idx) in subItem.subItems" :key="lvl4Idx">
                        <q-item
                          :to="lvl4.to"
                          clickable
                          active-class="premium-active-subitem"
                          class="premium-sub-item"
                          v-ripple
                        >
                          <q-item-section avatar>
                            <q-icon :name="lvl4.icon" size="xs" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ $t(lvl4.labelKey) }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-expansion-item>
                </template>
              </q-list>
            </q-expansion-item>
          </template>
        </q-list>
      </q-expansion-item>

      <!-- Menú directo -->
      <q-item
        v-else
        :to="menu.to"
        clickable
        active-class="premium-active-item"
        class="premium-item-direct"
        v-ripple
      >
        <q-item-section avatar>
          <q-icon :name="menu.icon" class="premium-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="premium-label">{{ $t(menu.labelKey) }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup>
import { menuConfig } from "src/config/menuConfig"
</script>

<style lang="scss" scoped>
.premium-menu {
  padding: 12px;
  background: transparent;

  .premium-expansion, .premium-item-direct {
    margin-bottom: 8px;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  }

  .premium-header, .premium-item-direct {
    min-height: 52px;
    border-radius: 12px;
    color: #444;

    &:hover {
      background: rgba($primary, 0.05);
      color: $primary;
    }
  }

  .premium-icon, .premium-header .q-icon {
    font-size: 22px;
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .premium-label, .premium-header .q-item__label {
    font-weight: 500;
    font-size: 15px;
    letter-spacing: 0.3px;
  }

  .premium-submenu {
    padding: 4px 0 4px 12px;
    margin-left: 20px;
    border-left: 1px solid rgba(0, 0, 0, 0.05);
  }

  .premium-item {
    margin: 4px 0;
    border-radius: 10px;
    min-height: 40px;
    color: #666;

    &:hover {
      background: rgba($primary, 0.05);
      color: $primary;
    }
  }

  .premium-active-item {
    background: linear-gradient(135deg, rgba($primary, 0.1) 0%, rgba($primary, 0.2) 100%) !important;
    color: $primary !important;
    font-weight: 600 !important;

    .premium-icon {
      color: $primary !important;
      opacity: 1;
      transform: scale(1.1);
    }
  }

  .premium-expansion-nested {
    .premium-header-nested {
      min-height: 40px;
      padding: 8px 16px;
      border-radius: 10px;
      color: #666;

      &:hover {
        background: rgba($primary, 0.05);
      }
    }
  }

  .premium-sub-submenu {
    padding-left: 12px;
    margin-left: 10px;
    border-left: 1px solid rgba(0, 0, 0, 0.03);
  }

  .premium-sub-item {
    margin: 2px 0;
    border-radius: 8px;
    min-height: 36px;
    font-size: 0.9em;
    color: #777;

    &:hover {
      color: $secondary;
    }
  }

  .premium-active-subitem {
    color: $secondary !important;
    background: rgba($secondary, 0.05) !important;
    font-weight: 600;
  }
}

/* Dark Mode */
:deep(.body--dark) {
  .premium-menu {
    .premium-header, .premium-item-direct {
      color: rgba(255, 255, 255, 0.85);
      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
    }

    .premium-submenu {
      border-left-color: rgba(255, 255, 255, 0.1);
    }

    .premium-item {
      color: rgba(255, 255, 255, 0.7);
      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }
    }

    .premium-active-item {
      background: linear-gradient(135deg, rgba($primary, 0.2) 0%, rgba($primary, 0.3) 100%) !important;
      color: #fff !important;
    }

    .premium-header-nested {
      color: rgba(255, 255, 255, 0.7);
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .premium-sub-item {
      color: rgba(255, 255, 255, 0.6);
      &:hover {
        color: #fff;
      }
    }
  }
}

/* Mini state adjustments (only for desktop) */
:deep(.q-drawer--mini) {
  .premium-submenu, .premium-label, .premium-header-nested .q-item__section--main {
    display: none !important;
  }
  
  .premium-menu {
    padding: 8px 0;
    
    .q-item, .premium-header {
      padding: 0 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      min-height: 56px !important;
    }

    .q-item__section--avatar {
      margin: 0 !important;
      padding: 0 !important;
      min-width: 0 !important;
      display: flex !important;
      justify-content: center !important;
      width: 100% !important;
    }

    .premium-icon {
      font-size: 26px !important;
      opacity: 1 !important;
      color: inherit;
    }
  }

  .premium-expansion {
    .q-item__section--side {
      display: none !important;
    }
  }
}
</style>

<template>
  <div class="row no-wrap items-center q-px-md horizontal-menu-container">
    <template v-for="(menu, index) in typedMenuConfig" :key="index">
      <!-- Menú con items -->
      <q-btn-dropdown
        v-if="menu.items && menu.items.length > 0"
        flat
        no-caps
        dense
        :icon="menu.icon"
        :label="t(menu.labelKey)"
        class="menu-btn"
        content-class="horizontal-menu-dropdown"
      >
        <q-list dense padding>
          <template v-for="(item, subIndex) in menu.items" :key="subIndex">
            <!-- Item simple -->
            <q-item
              v-if="!item.subItems"
              clickable
              v-ripple
              :to="item.to"
              active-class="active-item"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="xs" />
              </q-item-section>
              <q-item-section>
                {{ t(item.labelKey) }}
              </q-item-section>
            </q-item>

            <!-- Item con subItems (nivel 3) -->
            <q-item
              v-else
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="xs" />
              </q-item-section>
              <q-item-section>
                {{ t(item.labelKey) }}
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>

              <!-- Menú lateral para subniveles -->
              <q-menu anchor="top end" self="top start" class="horizontal-menu-dropdown">
                <q-list dense padding>
                  <template v-for="(subItem, subSubIndex) in item.subItems" :key="subSubIndex">
                    <!-- Recursión manual para nivel 3 -->
                    <q-item
                      v-if="!subItem.subItems"
                      clickable
                      v-ripple
                      :to="subItem.to"
                      active-class="active-item"
                    >
                      <q-item-section avatar>
                        <q-icon :name="subItem.icon" size="xs" />
                      </q-item-section>
                      <q-item-section>
                        {{ t(subItem.labelKey) }}
                      </q-item-section>
                    </q-item>

                    <!-- Nivel 4 (último nivel común) -->
                    <q-item
                      v-else
                      clickable
                      v-ripple
                    >
                      <q-item-section avatar>
                        <q-icon :name="subItem.icon" size="xs" />
                      </q-item-section>
                      <q-item-section>
                        {{ t(subItem.labelKey) }}
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" />
                      </q-item-section>
                      <q-menu anchor="top end" self="top start" class="horizontal-menu-dropdown">
                        <q-list dense padding>
                          <q-item
                            v-for="(deepItem, deepIndex) in subItem.subItems"
                            :key="deepIndex"
                            clickable
                            v-ripple
                            :to="deepItem.to"
                            active-class="active-item"
                          >
                            <q-item-section avatar>
                              <q-icon :name="deepItem.icon" size="xs" />
                            </q-item-section>
                            <q-item-section>
                              {{ t(deepItem.labelKey) }}
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-item>
                  </template>
                </q-list>
              </q-menu>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>

      <!-- Botón directo -->
      <q-btn
        v-else
        flat
        no-caps
        dense
        :icon="menu.icon"
        :label="t(menu.labelKey)"
        :to="menu.to"
        class="menu-btn"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { menuConfig } from "src/config/menuConfig"
import { useI18n } from 'vue-i18n'

interface MenuItem {
  labelKey: string;
  icon: string;
  to?: string;
  defaultopened?: boolean;
  items?: MenuItem[];
  subItems?: MenuItem[];
}

const { t } = useI18n()

// Cast menuConfig to avoid deep union type issues in template
const typedMenuConfig = menuConfig as unknown as MenuItem[]
</script>

<style lang="scss" scoped>
.horizontal-menu-container {
  overflow-x: auto;
  scrollbar-width: none;
  display: flex;
  height: 100%;
  align-items: center;
  &::-webkit-scrollbar {
    display: none;
  }
}

.menu-btn {
  margin-right: 12px;
  font-weight: 600;
  color: #333;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-size: 0.95rem;
  padding: 8px 16px;
  min-height: 44px;

  &:hover {
    background-color: rgba($primary, 0.05);
    color: $primary;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }

  &.active-item {
    background-color: rgba($primary, 0.1);
    color: $primary;
  }
}

.horizontal-menu-dropdown {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  border: 1px solid rgba(0,0,0,0.05);
  padding: 8px 0;

  .q-item {
    font-size: 14px;
    border-radius: 10px;
    margin: 4px 8px;
    padding: 10px 16px;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba($primary, 0.05);
      color: $primary;
      padding-left: 20px;
    }

    .q-item__section--avatar {
      min-width: 32px;
      color: $primary;
    }
  }

  .active-item {
    background-color: rgba($primary, 0.1) !important;
    color: $primary;
    font-weight: 600;
  }
}

// Dark mode overrides
:deep(.body--dark) {
  .menu-btn {
    color: rgba(255, 255, 255, 0.8);
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }

  .horizontal-menu-dropdown {
    background: #1d1d1d;
    color: white;
    border-color: rgba(255,255,255,0.1);

    .q-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .active-item {
       background-color: rgba(255, 255, 255, 0.15) !important;
       color: white;
    }

    .q-item__section--avatar {
      color: white;
    }
  }
}
</style>

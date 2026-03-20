<template>
  <div class="row no-wrap items-center toolbar-container">
    <div 
      v-for="(menu, index) in typedMenuConfig" 
      :key="index"
      class="toolbar-item-wrapper"
      @mouseenter="onMouseEnter(index)"
      @mouseleave="onMouseLeave(index)"
    >
      <!-- Separador sutil -->
      <div v-if="index > 0" class="toolbar-divider"></div>

      <!-- Botón con submenú -->
      <template v-if="menu.items && menu.items.length > 0">
        <q-btn
          flat
          no-caps
          class="toolbar-btn"
          :class="{ 'is-active': route.path.startsWith(menu.to || 'none') }"
        >
          <div class="row items-center no-wrap gap-xs">
            <q-icon :name="menu.icon" class="toolbar-icon" />
            <span class="toolbar-label">{{ t(menu.labelKey) }}</span>
            <q-icon name="arrow_drop_down" size="14px" class="dropdown-arrow-inline" />
          </div>

          <q-menu
            v-model="hoverStates[index]"
            anchor="bottom middle"
            self="top middle"
            transition-show="jump-down"
            transition-hide="fade"
            class="premium-nav-menu"
            :offset="[0, 4]" 
            @mouseenter="onMouseEnter(index)"
            @mouseleave="onMouseLeave(index)"
          >
            <q-list padding class="premium-nav-list">
              <template v-for="(item, subIndex) in menu.items" :key="subIndex">
                <!-- Item simple (Nivel 2) -->
                <q-item
                  v-if="!item.subItems"
                  clickable
                  v-ripple
                  :to="item.to"
                  active-class="active-nav-item"
                  class="premium-nav-item"
                >
                  <q-item-section avatar>
                    <q-icon :name="item.icon" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    {{ t(item.labelKey) }}
                  </q-item-section>
                </q-item>

                <!-- Item con subItems (Nivel 2 -> 3) -->
                <q-item
                  v-else
                  clickable
                  v-ripple
                  class="premium-nav-item"
                  @mouseenter="onNestedMouseEnter(`${index}-${subIndex}`)"
                  @mouseleave="onNestedMouseLeave(`${index}-${subIndex}`)"
                >
                  <q-item-section avatar>
                    <q-icon :name="item.icon" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    {{ t(item.labelKey) }}
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" size="xs" />
                  </q-item-section>

                  <q-menu 
                    v-model="nestedHoverStates[`${index}-${subIndex}`]"
                    anchor="top end" 
                    self="top start" 
                    class="premium-nav-menu"
                    transition-show="fade"
                    transition-hide="fade"
                    :offset="[4, 0]"
                    @mouseenter="onNestedMouseEnter(`${index}-${subIndex}`)"
                    @mouseleave="onNestedMouseLeave(`${index}-${subIndex}`)"
                  >
                    <q-list padding class="premium-nav-list">
                      <template v-for="(subItem, subSubIdx) in item.subItems" :key="subSubIdx">
                        <q-item
                          clickable
                          v-ripple
                          :to="subItem.to"
                          active-class="active-nav-item"
                          class="premium-nav-item"
                        >
                          <q-item-section avatar>
                            <q-icon :name="subItem.icon" size="20px" />
                          </q-item-section>
                          <q-item-section>
                            {{ t(subItem.labelKey) }}
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-menu>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </template>

      <!-- Botón directo -->
      <q-btn
        v-else
        flat
        no-caps
        :to="menu.to"
        class="toolbar-btn"
        active-class="is-active"
      >
        <div class="row items-center no-wrap gap-xs">
          <q-icon :name="menu.icon" class="toolbar-icon" />
          <span class="toolbar-label">{{ t(menu.labelKey) }}</span>
        </div>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { menuConfig } from "src/config/menuConfig"
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

interface MenuItem {
  labelKey: string;
  icon: string;
  to?: string;
  items?: MenuItem[];
  subItems?: MenuItem[];
}

const { t } = useI18n()
const route = useRoute()
const typedMenuConfig = menuConfig as unknown as MenuItem[]

const hoverStates = reactive<Record<number, boolean>>({})
const nestedHoverStates = reactive<Record<string, boolean>>({})
const timers: Record<string, NodeJS.Timeout> = {}

const onMouseEnter = (index: number) => {
  const key = `main-${index}`
  if (timers[key]) clearTimeout(timers[key])
  
  // Cerrar todos los demás menús principales inmediatamente para evitar solapamiento
  Object.keys(hoverStates).forEach(idx => {
    if (parseInt(idx) !== index) hoverStates[parseInt(idx)] = false
  })
  
  hoverStates[index] = true
}

const onMouseLeave = (index: number) => {
  const key = `main-${index}`
  timers[key] = setTimeout(() => {
    hoverStates[index] = false
  }, 100)
}

const onNestedMouseEnter = (id: string) => {
  if (timers[id]) clearTimeout(timers[id])
  nestedHoverStates[id] = true
}

const onNestedMouseLeave = (id: string) => {
  timers[id] = setTimeout(() => {
    nestedHoverStates[id] = false
  }, 100)
}
</script>

<style lang="scss" scoped>
.toolbar-container {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 4px;
}

.toolbar-item-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 4px;
}

.toolbar-btn {
  height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #444;

  &:hover {
    background: rgba(0,0,0,0.04);
    color: $primary;
  }

  &.is-active {
    background: rgba($primary, 0.08);
    color: $primary;
    font-weight: bold;
  }

  .toolbar-icon {
    font-size: 20px;
    opacity: 0.85;
  }

  .toolbar-label {
    font-size: 13px;
    margin: 0 4px;
  }

  .dropdown-arrow-inline {
    opacity: 0.5;
    margin-left: -2px;
  }
}

.gap-xs {
  gap: 4px;
}

.premium-nav-menu {
  border-radius: 12px !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
  border: 1px solid rgba(0,0,0,0.06);
  background: white;

  .premium-nav-list {
    min-width: 260px;
    padding: 6px;
  }

  .premium-nav-item {
    margin: 2px 0;
    border-radius: 8px;
    color: #333;
    padding: 10px 16px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($primary, 0.05);
      color: $primary;
      transform: translateX(4px);
    }
  }

  .active-nav-item {
    background: rgba($primary, 0.08) !important;
    color: $primary;
    font-weight: 700;
  }
}

:deep(.body--dark) {
  .toolbar-divider {
    background: rgba(255, 255, 255, 0.1);
  }

  .toolbar-btn {
    color: rgba(255, 255, 255, 0.7);
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    &.is-active {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      &::after {
        background: #fff;
      }
    }
  }

  .premium-nav-menu {
    background: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 50px rgba(0,0,0,0.4) !important;

    .premium-nav-item {
      color: rgba(255, 255, 255, 0.85);
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }
  }
}
</style>

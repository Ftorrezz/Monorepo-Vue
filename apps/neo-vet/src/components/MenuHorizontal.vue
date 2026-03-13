<template>
  <div class="row no-wrap items-center horizontal-menu-container">
    <div 
      v-for="(menu, index) in typedMenuConfig" 
      :key="index"
      class="menu-wrapper"
      @mouseenter="onMouseEnter(index)"
      @mouseleave="onMouseLeave(index)"
    >
      <!-- Botón principal con menú -->
      <template v-if="menu.items && menu.items.length > 0">
        <q-btn
          flat
          no-caps
          :icon="menu.icon"
          :label="t(menu.labelKey)"
          class="minimalist-btn"
          :class="{ 'is-active': route.path.startsWith(menu.to || 'none') }"
        >
          <q-menu
            v-model="hoverStates[index]"
            anchor="bottom start"
            self="top start"
            transition-show="jump-down"
            transition-hide="fade"
            class="premium-dropdown glass-effect"
            :offset="[0, 0]" 
            @mouseenter="onMouseEnter(index)"
            @mouseleave="onMouseLeave(index)"
          >
            <q-list dense padding style="min-width: 240px">
              <template v-for="(item, subIndex) in menu.items" :key="subIndex">
                <!-- Item simple (Nivel 2) -->
                <q-item
                  v-if="!item.subItems"
                  clickable
                  v-ripple
                  :to="item.to"
                  active-class="active-item"
                  class="premium-item"
                  @mouseenter="clearAllTimers()"
                >
                  <q-item-section avatar>
                    <q-icon :name="item.icon" size="xs" />
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
                  class="premium-item"
                  @mouseenter="onNestedMouseEnter(`${index}-${subIndex}`)"
                  @mouseleave="onNestedMouseLeave(`${index}-${subIndex}`)"
                >
                  <q-item-section avatar>
                    <q-icon :name="item.icon" size="xs" />
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
                    class="premium-dropdown glass-effect"
                    transition-show="fade"
                    transition-hide="fade"
                    :offset="[-4, 0]"
                    @mouseenter="onNestedMouseEnter(`${index}-${subIndex}`)"
                    @mouseleave="onNestedMouseLeave(`${index}-${subIndex}`)"
                  >
                    <q-list dense padding style="min-width: 240px">
                      <template v-for="(subItem, subSubIdx) in item.subItems" :key="subSubIdx">
                        <q-item
                          v-if="!subItem.subItems"
                          clickable
                          v-ripple
                          :to="subItem.to"
                          active-class="active-item"
                          class="premium-item"
                          @mouseenter="clearAllTimers()"
                        >
                          <q-item-section avatar>
                            <q-icon :name="subItem.icon" size="xs" />
                          </q-item-section>
                          <q-item-section>
                            {{ t(subItem.labelKey) }}
                          </q-item-section>
                        </q-item>

                        <!-- Nivel 4 -->
                        <q-item
                          v-else
                          clickable
                          v-ripple
                          class="premium-item"
                          @mouseenter="onDeepMouseEnter(`${index}-${subIndex}-${subSubIdx}`)"
                          @mouseleave="onDeepMouseLeave(`${index}-${subIndex}-${subSubIdx}`)"
                        >
                          <q-item-section avatar>
                            <q-icon :name="subItem.icon" size="xs" />
                          </q-item-section>
                          <q-item-section>
                            {{ t(subItem.labelKey) }}
                          </q-item-section>
                          <q-item-section side>
                            <q-icon name="chevron_right" size="xs" />
                          </q-item-section>
                          <q-menu 
                            v-model="deepHoverStates[`${index}-${subIndex}-${subSubIdx}`]"
                            anchor="top end" 
                            self="top start" 
                            class="premium-dropdown glass-effect"
                            transition-show="fade"
                            transition-hide="fade"
                            :offset="[-4, 0]"
                            @mouseenter="onDeepMouseEnter(`${index}-${subIndex}-${subSubIdx}`)"
                            @mouseleave="onDeepMouseLeave(`${index}-${subIndex}-${subSubIdx}`)"
                          >
                            <q-list dense padding style="min-width: 240px">
                              <q-item
                                v-for="(deepItem, deepIdx) in subItem.subItems"
                                :key="deepIdx"
                                clickable
                                v-ripple
                                :to="deepItem.to"
                                active-class="active-item"
                                class="premium-item"
                                @mouseenter="clearAllTimers()"
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
          </q-menu>
        </q-btn>
      </template>

      <!-- Botón directo sin menú -->
      <q-btn
        v-else
        flat
        no-caps
        :icon="menu.icon"
        :label="t(menu.labelKey)"
        :to="menu.to"
        class="minimalist-btn"
        active-class="is-active"
      />
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
  defaultopened?: boolean;
  items?: MenuItem[];
  subItems?: MenuItem[];
}

const { t } = useI18n()
const route = useRoute()
const typedMenuConfig = menuConfig as unknown as MenuItem[]

// Estados reactivos para controlar el hover
const hoverStates = reactive<Record<number, boolean>>({})
const nestedHoverStates = reactive<Record<string, boolean>>({})
const deepHoverStates = reactive<Record<string, boolean>>({})

// Timeouts para el cierre con retraso (debounce)
const timers: Record<string, NodeJS.Timeout> = {}
const NESTED_DELAY = 150 // ms

const clearAllTimers = () => {
  Object.keys(timers).forEach(key => {
    clearTimeout(timers[key])
    delete timers[key]
  })
}

const onMouseEnter = (index: number) => {
  const key = `main-${index}`
  if (timers[key]) clearTimeout(timers[key])
  
  // Cerrar otros menús principales solo si NO estamos en un submenú de este mismo
  Object.keys(hoverStates).forEach(idx => {
    if (Number(idx) !== index) hoverStates[Number(idx)] = false
  })
  
  hoverStates[index] = true
}

const onMouseLeave = (index: number) => {
  const key = `main-${index}`
  timers[key] = setTimeout(() => {
    hoverStates[index] = false
  }, NESTED_DELAY)
}

const onNestedMouseEnter = (id: string) => {
  if (timers[id]) clearTimeout(timers[id])
  // Al entrar en un submenú, cancelamos el timer del padre principal
  const mainIdx = id.split('-')[0]
  if (timers[`main-${mainIdx}`]) clearTimeout(timers[`main-${mainIdx}`])
  
  nestedHoverStates[id] = true
}

const onNestedMouseLeave = (id: string) => {
  timers[id] = setTimeout(() => {
    nestedHoverStates[id] = false
  }, NESTED_DELAY)
}

const onDeepMouseEnter = (id: string) => {
  if (timers[id]) clearTimeout(timers[id])
  // Cancelar timers de ancestros
  const parts = id.split('-')
  const mainKey = `main-${parts[0]}`
  const nestedKey = `${parts[0]}-${parts[1]}`
  if (timers[mainKey]) clearTimeout(timers[mainKey])
  if (timers[nestedKey]) clearTimeout(timers[nestedKey])
  
  deepHoverStates[id] = true
}

const onDeepMouseLeave = (id: string) => {
  timers[id] = setTimeout(() => {
    deepHoverStates[id] = false
  }, NESTED_DELAY)
}
</script>

<style lang="scss" scoped>
.horizontal-menu-container {
  display: flex;
  height: 100%;
  align-items: center;
  gap: 2px; /* Espacio mínimo entre botones */
}

.menu-wrapper {
  position: relative;
  display: inline-block;
}

.minimalist-btn {
  font-weight: 500;
  color: #666;
  border-radius: 8px; /* Diseño más cuadrado y moderno */
  transition: all 0.2s ease;
  padding: 6px 14px;
  min-height: 38px; /* Altura compacta para barra de 56px */
  border: 1px solid transparent;

  &:hover {
    background-color: rgba($primary, 0.05);
    color: $primary;
    border-color: rgba($primary, 0.1);
  }

  &.is-active {
    background: transparent;
    color: $primary;
    font-weight: 700;
    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 14px;
      right: 14px;
      height: 2px;
      background: $primary;
      border-radius: 2px;
    }
  }
}

.glass-effect {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.premium-dropdown {
  border-radius: 10px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: visible !important;

  .premium-item {
    margin: 2px 6px;
    border-radius: 6px;
    padding: 8px 12px;
    transition: all 0.2s ease;
    color: #444;

    &:hover {
      background: rgba($primary, 0.08);
      color: $primary;
      transform: translateX(2px);
    }
  }

  .active-item {
    background: rgba($primary, 0.1) !important;
    color: $primary;
    font-weight: 700;
  }
}

/* Modo oscuro */
:deep(.body--dark) {
  .minimalist-btn {
    color: rgba(255, 255, 255, 0.75);
    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    &.is-active {
      color: #fff;
      &::after {
        background: #fff;
      }
    }
  }

  .glass-effect {
    background: rgba(30, 30, 30, 0.9) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .premium-dropdown {
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    .premium-item {
      color: rgba(255, 255, 255, 0.9);
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }
    .active-item {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #fff;
    }
  }
}
</style>

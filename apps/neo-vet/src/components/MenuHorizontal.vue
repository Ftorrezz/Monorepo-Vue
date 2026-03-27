<template>
  <div class="row items-center no-wrap">
    <div 
      v-for="(menu, index) in typedMenuConfig" 
      :key="index"
    >
      <!-- Botón con submenú -->
      <template v-if="menu.items && menu.items.length > 0">
        <div 
          @mouseenter="onMouseEnter('m' + index)" 
          @mouseleave="onMouseLeave('m' + index)"
          class="q-pa-xs inline-block"
        >
          <q-btn
            flat
            no-caps
            rounded
            class="q-px-md text-black"
            :class="{ 'text-black bg-grey-3': route.path.startsWith(menu.to || 'none') }"
          >
            <q-icon :name="menu.icon" size="sm" class="q-mr-xs" />
            <span class="menu-label-text q-ml-sm q-mr-xs">{{ t(menu.labelKey) }}</span>
            <q-icon name="arrow_drop_down" />

            <q-menu
              v-model="hoverStates['m' + index]"
              anchor="bottom left"
              self="top left"
              transition-show="jump-down"
              transition-hide="jump-up"
              :offset="[0, 5]"
              @mouseenter="onMouseEnter('m' + index)"
              @mouseleave="onMouseLeave('m' + index)"
            >
              <q-list style="min-width: 220px">
                <template v-for="(item, subIndex) in menu.items" :key="subIndex">
                  <!-- Item simple (Nivel 2) -->
                  <q-item
                    v-if="!item.subItems"
                    clickable
                    v-close-popup
                    v-ripple
                    :to="item.to"
                    active-class="text-black bg-grey-3"
                  >
                    <q-item-section avatar>
                      <q-icon :name="item.icon" size="20px" color="grey-7" />
                    </q-item-section>
                    <q-item-section class="menu-label-text">
                      {{ t(item.labelKey) }}
                    </q-item-section>
                  </q-item>

                  <!-- Item con subItems (Nivel 2 -> 3) -->
                  <q-item
                    v-else
                    clickable
                    v-ripple
                    @mouseenter="onMouseEnter('m' + index + 's' + subIndex)"
                    @mouseleave="onMouseLeave('m' + index + 's' + subIndex)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="item.icon" size="20px" color="grey-7" />
                    </q-item-section>
                    <q-item-section class="menu-label-text">
                      {{ t(item.labelKey) }}
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" size="xs" />
                    </q-item-section>

                    <q-menu 
                      v-model="hoverStates['m' + index + 's' + subIndex]"
                      anchor="top end" 
                      self="top start" 
                      transition-show="fade"
                      transition-hide="fade"
                      :offset="[0, 0]"
                    >
                      <q-list  
                        style="min-width: 200px"
                        @mouseenter="onMouseEnter('m' + index + 's' + subIndex)"
                        @mouseleave="onMouseLeave('m' + index + 's' + subIndex)"
                      >
                        <template v-for="(subItem, subSubIdx) in item.subItems" :key="subSubIdx">
                          <q-item
                            v-if="!subItem.subItems"
                            clickable
                            v-close-popup
                            v-ripple
                            :to="subItem.to"
                            active-class="text-black bg-grey-3"
                          >
                            <q-item-section avatar v-if="subItem.icon">
                              <q-icon :name="subItem.icon" size="20px" color="grey-7" />
                            </q-item-section>
                            <q-item-section class="menu-label-text">
                              {{ t(subItem.labelKey) }}
                            </q-item-section>
                          </q-item>

                          <q-item
                            v-else
                            clickable
                            v-ripple
                            @mouseenter="onMouseEnter('m' + index + 's' + subIndex + 'ss' + subSubIdx)"
                            @mouseleave="onMouseLeave('m' + index + 's' + subIndex + 'ss' + subSubIdx)"
                          >
                            <q-item-section avatar v-if="subItem.icon">
                              <q-icon :name="subItem.icon" size="20px" color="grey-7" />
                            </q-item-section>
                            <q-item-section class="menu-label-text">
                              {{ t(subItem.labelKey) }}
                            </q-item-section>
                            <q-item-section side>
                              <q-icon name="chevron_right" size="xs" />
                            </q-item-section>

                            <q-menu 
                              v-model="hoverStates['m' + index + 's' + subIndex + 'ss' + subSubIdx]"
                              anchor="top end" 
                              self="top start" 
                              transition-show="fade"
                              transition-hide="fade"
                              :offset="[0, 0]"
                            >
                              <q-list  
                                style="min-width: 200px"
                                @mouseenter="onMouseEnter('m' + index + 's' + subIndex + 'ss' + subSubIdx)"
                                @mouseleave="onMouseLeave('m' + index + 's' + subIndex + 'ss' + subSubIdx)"
                              >
                                <template v-for="(lvl4, lvl4Idx) in subItem.subItems" :key="lvl4Idx">
                                  <q-item
                                    clickable
                                    v-close-popup
                                    v-ripple
                                    :to="lvl4.to"
                                    active-class="text-black bg-grey-3"
                                  >
                                    <q-item-section avatar v-if="lvl4.icon">
                                      <q-icon :name="lvl4.icon" size="20px" color="grey-7" />
                                    </q-item-section>
                                    <q-item-section class="menu-label-text">
                                      {{ t(lvl4.labelKey) }}
                                    </q-item-section>
                                  </q-item>
                                </template>
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
        </div>
      </template>

      <!-- Botón directo -->
      <template v-else>
        <div class="q-pa-xs inline-block">
          <q-btn
            flat
            no-caps
            rounded
            class="q-px-md text-black"
            :to="menu.to"
            :class="{ 'text-black bg-grey-3': route.path.startsWith(menu.to || 'none') }"
          >
            <q-icon :name="menu.icon" size="sm" class="q-mr-xs" />
            <span class="menu-label-text q-ml-sm q-mr-xs">{{ t(menu.labelKey) }}</span>
          </q-btn>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onBeforeUnmount } from 'vue'
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

const hoverStates = reactive<Record<string, boolean>>({})
const timers: Record<string, NodeJS.Timeout> = {}

const onMouseEnter = (id: string) => {
  if (timers[id]) {
    clearTimeout(timers[id])
    delete timers[id]
  }

  let currentId = id
  if (currentId.includes('ss')) {
    const parent = currentId.split('ss')[0]
    if (timers[parent]) { clearTimeout(timers[parent]); delete timers[parent] }
    hoverStates[parent] = true
    currentId = parent
  }
  if (currentId.includes('s')) {
    const grandpa = currentId.split('s')[0]
    if (timers[grandpa]) { clearTimeout(timers[grandpa]); delete timers[grandpa] }
    hoverStates[grandpa] = true
  }
  
  const rootId = id.split('s')[0]
  Object.keys(hoverStates).forEach(key => {
    if (key.startsWith('m') && !key.includes('s') && key !== rootId) {
      hoverStates[key] = false
    }
  })

  hoverStates[id] = true
}

const onMouseLeave = (id: string) => {
  timers[id] = setTimeout(() => {
    hoverStates[id] = false
    delete timers[id]

    Object.keys(hoverStates).forEach(key => {
      if (key !== id && key.startsWith(id)) {
        hoverStates[key] = false
      }
    })
  }, 250)
}

onBeforeUnmount(() => {
  Object.values(timers).forEach(timer => clearTimeout(timer))
})
</script>

<style scoped>
.inline-block {
  display: inline-block;
}

/* Quitar negrita y suavizar fuente en el menú */
.menu-label-text {
  font-weight: 300 !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:deep(.q-btn) {
  font-weight: 300 !important;
}

:deep(.q-btn__content), 
:deep(.q-btn__content *),
:deep(.q-item__section),
:deep(.q-item__section *) {
  font-weight: 300 !important;
}

/* Efecto hover celeste sobre botones principales y opciones de menú */
:deep(.q-btn:hover), :deep(.q-item:hover) {
  background-color: #e1f5fe !important; /* Celeste muy suave (light-blue-1) */
  color: #027be3 !important; /* Texto un poco más vibrante al pasar el mouse por encima */
}
</style>

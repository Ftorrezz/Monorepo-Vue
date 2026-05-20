<template>
  <div class="q-pa-lg bg-slate-50 min-height-screen font-outfit text-blue-grey-10 overflow-hidden relative-position">
    <!-- Fondo Decorativo Sutil -->
    <div class="light-blob absolute-top-right transition-all" />

    <div class="full-width q-px-lg max-width-container">
      <!-- HEADER -->
      <q-card flat class="bg-gradient-primary text-white q-mb-lg animated fadeInDown shadow-3 overflow-hidden relative-position border-radius-24">
        <q-card-section class="q-pa-xl relative-position">
          <div class="absolute-top-right q-pa-lg opacity-10">
            <q-icon name="settings_suggest" size="180px" class="rotate-12" />
          </div>
          
          <div class="row items-center no-wrap relative-position">
            <div class="icon-discrete-wrapper q-mr-lg shadow-primary bg-white flex flex-center text-primary">
              <q-icon name="tune" size="2.2rem" />
            </div>
            <div class="col-grow">
              <div class="text-overline text-white opacity-85 text-weight-bolder letter-spacing-2">CONFIGURACIÓN GENERAL</div>
              <h1 class="text-h4 text-weight-black letter-spacing-1 q-ma-none">Preferencias de Sucursal</h1>
              <p class="text-caption text-white opacity-80 q-mt-xs q-mb-none">
                Establece la apariencia y el comportamiento predeterminado del sistema por sucursal activa.
              </p>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- SELECCIÓN DE SUCURSAL -->
      <q-card flat bordered class="bg-white q-mb-lg border-radius-16 shadow-minimal border-light">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="row items-center col-grow">
              <q-avatar 
                v-if="sucursalSeleccionada?.logo_url" 
                size="60px" 
                class="q-mr-md shadow-2"
              >
                <img :src="sucursalSeleccionada.logo_url" alt="Logo Sucursal">
              </q-avatar>
              <div v-else class="icon-circle bg-blue-1 text-primary q-mr-md">
                <q-icon name="place" size="sm" />
              </div>
              <div>
                <div class="text-subtitle1 text-weight-bold text-blue-grey-9">
                  Sucursal Activa: {{ sucursalSeleccionada?.descripcion || 'Ninguna Seleccionada' }}
                </div>
                <div class="text-caption text-blue-grey-5" v-if="sucursalSeleccionada?.direccion">
                  {{ sucursalSeleccionada.direccion }}
                </div>
              </div>
            </div>

            <!-- Selector rápido de sucursal si el usuario tiene más de una -->
            <div class="col-12 col-sm-auto" style="min-width: 250px" v-if="sucursalesDisponibles.length > 1">
              <q-select
                outlined
                dense
                emit-value
                map-options
                v-model="sucursalIdActiva"
                :options="opcionesSucursales"
                label="Cambiar Sucursal a Editar"
                class="bg-white"
              >
                <template v-slot:prepend>
                  <q-icon name="storefront" color="primary" />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- PANEL DE PREFERENCIAS -->
      <div v-if="cargando" class="flex flex-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
        <div class="text-caption text-blue-grey-6 q-ml-md">Cargando preferencias de la sucursal...</div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <!-- CATEGORÍAS TABS -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="bg-white border-radius-16 shadow-minimal border-light">
            <q-tabs
              v-model="categoriaActiva"
              :vertical="!$q.screen.lt.md"
              class="text-blue-grey-8 font-weight-bold"
              active-color="primary"
              active-bg-color="blue-1"
              indicator-color="primary"
            >
              <q-tab 
                v-for="cat in categorias" 
                :key="cat"
                :name="cat" 
                :label="cat" 
                align="left"
                class="q-py-md text-weight-bold letter-spacing-1 tab-custom"
              >
                <template v-slot:default>
                  <div class="row items-center no-wrap full-width q-px-sm">
                    <q-icon :name="getCategoriaIcon(cat)" class="q-mr-sm" size="18px" />
                    <span>{{ cat }}</span>
                  </div>
                </template>
              </q-tab>
            </q-tabs>
          </q-card>
        </div>

        <!-- FORMULARIO DE EDICIÓN -->
        <div class="col-12 col-md-9">
          <q-card flat bordered class="bg-white border-radius-20 shadow-minimal border-light overflow-hidden">
            <div class="q-pa-lg bg-blue-1 border-bottom-light row items-center justify-between">
              <div class="text-subtitle1 text-weight-bolder text-primary flex items-center letter-spacing-1">
                <q-icon :name="getCategoriaIcon(categoriaActiva)" class="q-mr-sm" size="22px" />
                <span class="text-uppercase">Preferencias: {{ categoriaActiva }}</span>
              </div>
              <div class="text-caption text-blue-grey-6">
                Guarda los cambios individuales haciendo clic en los botones correspondientes
              </div>
            </div>

            <q-list padding class="q-px-md divide-y">
              <q-item 
                v-for="schema in preferenciasFiltradas" 
                :key="schema.identificador"
                class="q-py-lg transition-all hover-item"
                :class="$q.screen.lt.sm ? 'column q-gutter-y-md' : 'row items-center'"
              >
                <!-- Info de la preferencia -->
                <div class="col-grow q-pr-sm-lg q-pb-xs">
                  <div class="row items-center q-mb-xs">
                    <div class="text-subtitle2 text-weight-bold text-blue-grey-9">
                      {{ schema.descripcion }}
                    </div>
                    <q-chip 
                      dense 
                      outline 
                      color="blue-grey-4" 
                      text-color="blue-grey-6" 
                      class="q-ml-sm text-weight-bold text-xxs font-mono"
                      size="sm"
                    >
                      {{ schema.identificador }}
                    </q-chip>
                  </div>
                  <div class="text-caption text-blue-grey-5 line-height-1-4">
                    {{ getDetallePreferencia(schema.identificador) }}
                  </div>
                </div>

                <!-- Input Dinámico según tipo -->
                <div 
                  class="col-auto flex items-center no-wrap row q-gutter-x-md"
                  :class="$q.screen.lt.sm ? 'justify-between full-width' : 'justify-end'"
                  :style="{ minWidth: $q.screen.lt.sm ? '100%' : '270px' }"
                >
                  
                  <!-- Caso 1: COLOR -->
                  <div v-if="schema.tip_dato === 'COLOR'" class="row items-center no-wrap q-gutter-sm">
                    <div 
                      class="color-preview-box cursor-pointer shadow-1 border-radius-8 border"
                      :style="{ backgroundColor: valoresEditados[schema.identificador] }"
                    >
                      <q-tooltip>Abrir paleta de colores</q-tooltip>
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-color 
                          v-model="valoresEditados[schema.identificador]" 
                          no-header 
                          no-footer
                          class="color-picker-custom"
                        />
                      </q-popup-proxy>
                    </div>
                    <q-input 
                      v-model="valoresEditados[schema.identificador]" 
                      outlined 
                      dense 
                      class="color-text-input text-uppercase" 
                      style="width: 110px"
                    />
                  </div>

                  <!-- Caso 2: BOOLEAN -->
                  <div v-else-if="schema.tip_dato === 'BOOLEAN'" class="flex items-center no-wrap">
                    <q-chip
                      dense
                      :color="valoresEditados[schema.identificador] === 'S' ? 'green-5' : 'grey-4'"
                      text-color="white"
                      class="text-weight-bold q-mr-sm"
                      size="sm"
                    >
                      {{ valoresEditados[schema.identificador] === 'S' ? 'Activo' : 'Inactivo' }}
                    </q-chip>
                    <q-toggle
                      v-model="valoresEditados[schema.identificador]"
                      true-value="S"
                      false-value="N"
                      color="positive"
                      size="md"
                      keep-color
                    />
                  </div>

                  <!-- Caso 3: SELECT -->
                  <div v-else-if="schema.tip_dato === 'SELECT'" class="full-width" style="max-width: 200px">
                    <q-select
                      v-model="valoresEditados[schema.identificador]"
                      :options="schema.opciones"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Caso 4: STRING / TEXT -->
                  <div v-else class="full-width" style="max-width: 200px">
                    <q-input
                      v-model="valoresEditados[schema.identificador]"
                      outlined
                      dense
                    />
                  </div>

                  <!-- Botón de Guardado Individual -->
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="save"
                    :loading="guardando[schema.identificador]"
                    :disable="!haCambiado(schema.identificador)"
                    @click="guardarCambio(schema.identificador)"
                  >
                    <q-tooltip>Guardar esta configuración</q-tooltip>
                  </q-btn>

                </div>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import useConfiguracionPreferencia from '../../../composables/useConfiguracionPreferencia';
import { useDialogStore } from '../../../stores/DialogoUbicacion';
import { useAuthStore } from '../../../stores/Auth';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const dialogStore = useDialogStore();
const authStore = useAuthStore();
const { schemas, preferencias, cargando, guardarPreferencia, cargarPreferencias } = useConfiguracionPreferencia();

const categoriaActiva = ref('Visual');
const valoresEditados = ref({});
const guardando = ref({});

// Obtener todas las categorías únicas del esquema
const categorias = computed(() => {
  const cats = schemas.map(s => s.categoria);
  return [...new Set(cats)];
});

// Filtrar preferencias por categoría activa
const preferenciasFiltradas = computed(() => {
  return schemas.filter(s => s.categoria === categoriaActiva.value);
});

// Sucursal seleccionada de la tienda global
const sucursalSeleccionada = computed(() => dialogStore.sucursalSeleccionada);
const sucursalIdActiva = ref(dialogStore.id_sucursal);

// Lista de sucursales a las que tiene acceso el usuario
const sucursalesDisponibles = computed(() => authStore.sucursales || []);

const opcionesSucursales = computed(() => {
  return sucursalesDisponibles.value.map(s => ({
    label: s.descripcion,
    value: s.id
  }));
});

// Sincronizar el id de sucursal local con el global al cambiar
watch(sucursalIdActiva, (newId) => {
  if (newId && newId !== dialogStore.id_sucursal) {
    const sucursal = sucursalesDisponibles.value.find(s => s.id === newId);
    if (sucursal) {
      dialogStore.selectBranch(sucursal);
    }
  }
});

watch(() => dialogStore.id_sucursal, (newId) => {
  sucursalIdActiva.value = newId;
});

// Cargar valores en el objeto local editable cuando cambian las preferencias del store
watch(preferencias, (newVal) => {
  if (newVal) {
    valoresEditados.value = { ...newVal };
  }
}, { immediate: true });

// Validar si el valor de la configuración ha cambiado respecto a la base de datos
const haCambiado = (identificador) => {
  return valoresEditados.value[identificador] !== preferencias.value[identificador];
};

// Guardar cambio individual
const guardarCambio = async (identificador) => {
  guardando.value[identificador] = true;
  try {
    const valor = valoresEditados.value[identificador];
    await guardarPreferencia(identificador, valor);
    $q.notify({
      type: 'positive',
      message: 'Configuración guardada correctamente',
      icon: 'cloud_done'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la configuración',
      icon: 'report_problem'
    });
  } finally {
    guardando.value[identificador] = false;
  }
};

const getCategoriaIcon = (categoria) => {
  switch (categoria) {
    case 'Visual': return 'palette';
    case 'Búsqueda': return 'search';
    default: return 'settings';
  }
};

const getDetallePreferencia = (identificador) => {
  const detalles = {
    'MENU_LAYOUT': 'Define cómo se visualiza el menú principal del sistema. El estilo "Horizontal" despliega pestañas superiores, mientras que "Vertical" expande un panel lateral izquierdo.',
    'THEME_COLOR': 'Establece el color primario de acentuación para botones, encabezados y elementos interactivos en esta sucursal.',
    'BUSQUEDA_RAPIDA_PROPIETARIO_MASCOTA': 'Si está activo, la búsqueda de propietarios y mascotas en el módulo ejecutará peticiones en tiempo real conforme vas digitando los caracteres. Si está inactivo, deberás presionar Enter o dar clic en el botón de búsqueda para consultar.'
  };
  return detalles[identificador] || 'Configuración general del sistema.';
};
</script>

<script>
export default {
  name: 'ConfiguracionPreferencias'
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

.font-outfit { font-family: 'Outfit', sans-serif; }
.min-height-screen { min-height: 100vh; }
.max-width-container { max-width: 100%; margin: 0 auto; }
.shadow-primary { box-shadow: 0 8px 25px rgba(25, 118, 210, 0.25); }
.shadow-minimal { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03); }
.shadow-3 { box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08); }
.border-light { border: 1px solid rgba(0, 0, 0, 0.08); }
.border-bottom-light { border-bottom: 1px solid rgba(25, 118, 210, 0.08); }
.bg-slate-50 { background-color: #f8fafc; }
.border-radius-24 { border-radius: 24px; }
.border-radius-20 { border-radius: 20px; }
.border-radius-16 { border-radius: 16px; }
.border-radius-8 { border-radius: 8px; }

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #00b0ff 100%);
}

.opacity-85 { opacity: 0.85; }

.icon-discrete-wrapper {
  width: 65px;
  height: 65px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.icon-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Background Blobs
.light-blob {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 176, 255, 0.05) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
}

.tab-custom {
  justify-content: flex-start;
  text-transform: none;
  font-size: 0.95rem;
}

.hover-item {
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #f8fafc;
  }
}

.color-preview-box {
  width: 42px;
  height: 42px;
  border: 2px solid #fff;
  outline: 1px solid rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
}

.color-picker-custom {
  max-width: 250px;
}

.text-xxs {
  font-size: 0.65rem;
  padding: 2px 6px;
}
</style>

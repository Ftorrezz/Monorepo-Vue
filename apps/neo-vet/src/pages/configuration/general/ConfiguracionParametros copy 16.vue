<template>
  <div class="q-pa-lg bg-slate-50 min-height-screen font-outfit text-blue-grey-10 overflow-hidden relative-position">
    <!-- Fondo Decorativo Sutil -->
    <div class="light-blob absolute-top-right transition-all" :class="{ 'portal-active': !moduloSeleccionado }" />
    
    <transition name="portal-transition" mode="out-in">
      <!-- ETAPA 1: EL PORTAL (Dashboard de Módulos - Versión Compacta) -->
      <div v-if="!moduloSeleccionado" key="portal" class="full-width q-px-lg">
        <!-- Header del Portal (Estilo BaseCrud Compacto) -->
        <q-card flat class="bg-gradient-primary text-white q-mb-md animated fadeInDown shadow-2">
          <q-card-section class="q-pa-sm text-center">
            <div class="row items-center justify-center">
              <div class="glass-chip-light inline-block q-px-sm q-py-xs q-mr-md">
                <span class="text-overline text-primary text-weight-bolder letter-spacing-2" style="font-size: 0.6rem">SISTEMA CENTRAL</span>
              </div>
              <h1 class="text-h5 text-weight-black q-ma-none">Panel de Configuraciones Generales</h1>
              <q-badge color="white" text-color="primary" class="q-ml-sm text-weight-bold" outline>V3</q-badge>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-sm justify-center items-stretch module-grid-compact">
          <!-- Tarjetas de Módulos (Híbridas: Base de Datos + Estáticas) -->
          <div v-for="modulo in todosLosModulos" :key="modulo.identificador" class="col-6 col-sm-4 col-md-2 col-xl-2">
              <q-card 
                flat 
                bordered
                class="portal-card-light full-height cursor-pointer transition-all relative-position"
                @click="seleccionarModulo(modulo)"
              >
                <!-- Indicador de Navegación Externa o Especializada -->
                <div v-if="modulo.ruta || modulo.componente || getAccionesAvanzadas(modulo.identificador).length > 0" class="absolute-top-right q-pa-sm">
                  <q-icon :name="getAccionesAvanzadas(modulo.identificador).length > 0 || modulo.componente ? 'auto_awesome' : 'open_in_new'" size="14px" :color="getAccionesAvanzadas(modulo.identificador).length > 0 || modulo.componente ? 'orange-4' : 'blue-3'" />
                  <q-tooltip>{{ getAccionesAvanzadas(modulo.identificador).length > 0 || modulo.componente ? 'Módulo Especializado' : 'Navegar a sección' }}</q-tooltip>
                </div>

              <q-card-section class="q-pa-md flex flex-center column">
                <div class="icon-discrete-wrapper q-mb-sm flex flex-center transition-all" :style="{ color: getModuleRawColor(modulo.identificador) }">
                  <q-icon :name="getModuleIcon(modulo.identificador)" size="1.5rem" />
                </div>
                <div class="text-caption text-weight-bold text-uppercase letter-spacing-1 text-center items-center flex justify-center full-width text-blue-grey-8" style="min-height: 32px; line-height: 1.1">
                  {{ formatDescription(modulo) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ETAPA 2: EL ESPACIO DE TRABAJO (Panel Light de Gestión) -->
      <div v-else key="workspace" class="full-width animated zoomIn">
        <!-- Header del Workspace (Estilo BaseCrud) -->
        <q-card flat class="bg-gradient-primary text-white q-mb-md shadow-2">
          <q-card-section class="q-pa-sm">
            <div class="row items-center no-wrap">
              <q-btn 
                flat 
                rounded 
                color="white" 
                icon="grid_view" 
                label="Módulos" 
                class="q-px-md"
                @click="volverAlPortal" 
              />
              <q-separator vertical inset dark class="q-mx-lg opacity-20" />
              <div class="row items-center col-grow">
                 <div class="icon-circle q-mr-md" style="background: rgba(255,255,255,0.2)">
                   <q-icon :name="getModuleIcon(moduloSeleccionado.identificador)" size="sm" color="white" />
                 </div>
                 <div>
                   <div class="text-h6 text-weight-bold text-uppercase letter-spacing-1">{{ formatDescription(moduloSeleccionado) }}</div>
                   <div class="text-caption text-white opacity-80 uppercase letter-spacing-1 font-weight-bold">Espacio de Trabajo</div>
                 </div>
              </div>
              <q-space />
              <div class="row q-gutter-sm">
                <q-btn 
                  v-if="tablaSeleccionada"
                  flat
                  round
                  icon="add_circle"
                  @click="nuevoParametro" 
                  size="md"
                >
                  <q-tooltip>Registrar Nuevo</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-lg no-wrap items-stretch" style="height: calc(85vh - 120px)">
          <!-- VISTA GENÉRICA (Sidebar + Contenido) -->
          <template v-if="!componenteModuloEspecializado">
            <!-- Panel Lateral de Tablas (Estilo Listado Moderno) -->
            <div class="col-auto" style="width: 300px">
              <q-card flat class="table-list-card full-height shadow-minimal overflow-hidden bordered">
                <div class="q-pa-md border-bottom bg-blue-1">
                  <div class="row items-center">
                    <q-icon name="list" color="primary" class="q-mr-sm" size="xs" />
                    <div class="text-overline text-primary text-weight-black letter-spacing-1">Tablas Disponibles</div>
                  </div>
                </div>
              
              <q-scroll-area class="full-height" style="height: calc(85vh - 180px)">
                <q-list padding class="q-px-sm">
                  <!-- SECCIÓN 1: Tablas Dinámicas (DB) -->
                  <div class="q-px-sm q-pb-xs">
                    <div class="text-caption text-weight-bold text-blue-grey-3 uppercase letter-spacing-1">Configuraciones</div>
                  </div>
                  <q-item
                    v-for="tabla in tablas"
                    :key="tabla.id"
                    clickable
                    v-ripple
                    class="workspace-table-item-light q-mb-xs transition-all"
                    :active="tablaSeleccionada?.id === tabla.id"
                    active-class="active-table-light"
                    @click="seleccionarTabla(tabla)"
                  >
                    <q-item-section avatar class="min-width-0 q-pr-sm">
                      <q-icon 
                        :name="(!tabla.esGenerica && tabla.esGenerica !== undefined) ? 'auto_awesome' : 'subdirectory_arrow_right'" 
                        size="14px" 
                        :color="tablaSeleccionada?.id === tabla.id ? 'primary' : ( (!tabla.esGenerica && tabla.esGenerica !== undefined) ? 'orange-4' : 'grey-4')" 
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-blue-grey-8">{{ tabla.descripcion }}</q-item-label>
                      <q-item-label v-if="!tabla.esGenerica && tabla.esGenerica !== undefined" caption class="text-orange-8">Módulo Avanzado</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="tablaSeleccionada?.id === tabla.id">
                      <div class="dot-active" />
                    </q-item-section>
                  </q-item>

                  <!-- SECCIÓN 2: Acciones Avanzadas (Módulos Especializados Estáticos) -->
                  <template v-if="getAccionesAvanzadas(moduloSeleccionado.identificador).length > 0">
                    <q-separator class="q-my-md opacity-10" />
                    <div class="q-px-sm q-pb-xs">
                      <div class="text-caption text-weight-bold text-orange-8 uppercase letter-spacing-1">Gestión Especializada</div>
                    </div>
                    <q-item
                      v-for="accion in getAccionesAvanzadas(moduloSeleccionado.identificador)"
                      :key="accion.descripcion"
                      clickable
                      v-ripple
                      class="advanced-action-item q-mb-xs transition-all"
                      @click="ejecutarAccionAvanzada(accion)"
                    >
                      <q-item-section avatar class="min-width-0 q-pr-sm">
                        <q-icon :name="accion.icon || 'settings'" size="20px" color="orange-8" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-blue-grey-9">{{ accion.descripcion }}</q-item-label>
                        <q-item-label caption>Configurador robusto</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" size="xs" color="orange-3" />
                      </q-item-section>
                    </q-item>
                  </template>
                  
                  <div v-if="tablas.length === 0 && !cargando" class="text-center q-pa-xl opacity-20">
                    <q-icon name="folder_open" size="40px" />
                    <div class="text-caption q-mt-md">Módulo vacío</div>
                  </div>
                </q-list>
              </q-scroll-area>
            </q-card>
          </div>

          <!-- Panel Central de Datos / Componente Especializado -->
          <div class="col grow h-full">
            <q-card flat class="data-workspace-card-light full-height shadow-minimal overflow-hidden relative-position bordered column no-wrap">
              <q-inner-loading :showing="cargando" color="primary" />
              
              <transition name="fade-slide" mode="out-in">
                <!-- CASO A: Tabla con Componente Especializado -->
                <div v-if="tablaSeleccionada && (!tablaSeleccionada.esGenerica && tablaSeleccionada.esGenerica !== undefined)" :key="'spec-' + tablaSeleccionada.id" class="col column no-wrap">
                   <!-- Barra de Título del Componente (Frame Look) -->
                  <div class="q-pa-sm bg-grey-1 border-bottom row items-center no-wrap">
                    <div class="row q-gutter-x-xs q-mx-sm">
                      <div class="dot-deco bg-negative" />
                      <div class="dot-deco bg-warning" />
                      <div class="dot-deco bg-positive" />
                    </div>
                    <div class="text-caption text-weight-bold text-grey-6 uppercase letter-spacing-1 q-ml-md">Vista de Configuración Avanzada</div>
                  </div>
                  <q-scroll-area class="col">
                    <div class="q-pa-sm">
                      <component 
                        :is="getComponenteEspecializado(tablaSeleccionada.identificador)" 
                        @close="volverAlPortal"
                        v-bind="hubOverlay.props"
                      />
                    </div>
                  </q-scroll-area>
                </div>

                <!-- CASO B: Tabla Genérica Estándar -->
                <div v-else-if="tablaSeleccionada" :key="'gen-' + tablaSeleccionada.id" class="col column no-wrap">
                   <q-table
                    :rows="parametros"
                    :columns="columnas"
                    row-key="id"
                    flat
                    class="modern-table col"
                    :pagination="{ rowsPerPage: 15 }"
                    :filter="filtroTabla"
                  >
                    <template v-slot:top>
                      <div class="row full-width items-center q-px-lg q-py-md bg-blue-1 border-bottom">
                        <div class="text-subtitle1 text-weight-bolder text-primary uppercase letter-spacing-1">
                          <q-icon name="table_chart" class="q-mr-sm" />
                          {{ tablaSeleccionada.descripcion }}
                        </div>
                        <q-space />
                        <div class="row q-gutter-md items-center">
                          <q-input 
                            outlined
                            dense 
                            rounded
                            bg-color="white"
                            debounce="300" 
                            v-model="filtroTabla" 
                            placeholder="Buscar en tabla..."
                            class="search-input-light shadow-1"
                          >
                            <template v-slot:append>
                              <q-icon name="search" size="xs" color="primary" />
                            </template>
                          </q-input>
                          
                          <q-btn flat round icon="download" color="primary" @click="exportarDatos">
                            <q-tooltip>Exportar CSV</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </template>

                    <template v-slot:body-cell-activo="props">
                      <q-td :props="props">
                        <q-chip
                          dense
                          :color="props.row.activo === 'S' ? 'green-1' : 'grey-1'"
                          :text-color="props.row.activo === 'S' ? 'green-9' : 'grey-7'"
                          class="text-weight-bold"
                          size="sm"
                        >
                          {{ props.row.activo === 'S' ? 'ACTIVO' : 'INACTIVO' }}
                        </q-chip>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-acciones="props">
                      <q-td :props="props" class="text-right">
                        <q-btn flat round color="primary" icon="edit" size="sm" class="q-mr-xs" @click="editarParametro(props.row)" />
                        <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)" />
                      </q-td>
                    </template>
                  </q-table>
                </div>
                
                <!-- CASO C: Estado Vacío -->
                <div v-else class="flex flex-center full-height bg-white col">
                  <div class="text-center opacity-30">
                    <q-icon name="keyboard_backspace" size="60px" class="animated infinite bounce-left-light" color="primary" />
                    <div class="text-h6 q-mt-md text-weight-bold text-blue-grey-9">Seleccione una tabla lateral</div>
                  </div>
                </div>
              </transition>
            </q-card>
          </div>
          </template>

          <!-- VISTA MODULO ESPECIALIZADO FULL (Legacy/Estaticos) -->
          <div v-else class="col-12 animated fadeIn">
            <q-card flat class="data-workspace-card-light full-height shadow-3 overflow-hidden bordered bg-white column no-wrap">
              <!-- Barra de Título del Componente (Frame Look) -->
              <div class="q-pa-sm bg-grey-1 border-bottom row items-center no-wrap">
                <div class="row q-gutter-x-xs q-mx-sm">
                  <div class="dot-deco bg-negative" />
                  <div class="dot-deco bg-warning" />
                  <div class="dot-deco bg-positive" />
                </div>
                <div class="text-caption text-weight-bold text-grey-6 uppercase letter-spacing-1 q-ml-md">Vista de Configuración de Sistema</div>
                <q-space />
                <q-btn flat round dense icon="close" color="grey-6" @click="volverAlPortal">
                  <q-tooltip>Cerrar vista</q-tooltip>
                </q-btn>
              </div>

              <q-scroll-area class="col">
                <div class="q-pa-sm">
                  <component 
                    :is="componenteModuloEspecializado" 
                    @close="volverAlPortal"
                    v-bind="hubOverlay.props"
                  />
                </div>
              </q-scroll-area>
            </q-card>
          </div>
        </div>
      </div>
    </transition>

    <!-- Diálogo de Edición Lateral Moderno (Side-Sheet) -->
    <q-dialog v-model="dialogoVisible" persistent position="right" full-height transition-show="slide-left" transition-hide="slide-right" backdrop-filter="blur(4px)">
      <q-card style="width: 480px; max-width: 90vw" class="bg-slate-50 flex column no-wrap shadow-24 overflow-hidden">
        <!-- Header del Dialogo con Degradado -->
        <q-card-section class="q-pa-none">
          <div class="bg-gradient-primary text-white q-pa-lg relative-position shadow-2">
            <div class="row items-center no-wrap">
              <div class="icon-circle q-mr-md" style="background: rgba(255,255,255,0.2)">
                <q-icon :name="itemEditando.id ? 'edit' : 'add_circle'" size="sm" color="white" />
              </div>
              <div class="col-grow">
                <div class="text-overline text-white opacity-70 text-weight-bold letter-spacing-1">Editor de Parámetros</div>
                <div class="text-h5 text-weight-black">{{ itemEditando.id ? 'Modificar Registro' : 'Nuevo Registro' }}</div>
              </div>
              <q-btn flat round dense icon="close" color="white" v-close-popup class="opacity-80" />
            </div>
          </div>
        </q-card-section>
        
        <q-card-section class="col q-pa-lg scroll">
          <div class="text-subtitle2 text-grey-7 q-mb-lg flex items-center">
            <q-icon name="info" class="q-mr-xs" color="grey-5" />
            Complete los campos para {{ tablaSeleccionada?.descripcion || 'el registro' }}
          </div>
          
          <q-form @submit="guardar" ref="formRef" class="q-gutter-y-md">
            <!-- Sección: Información Principal -->
            <q-card flat bordered class="bg-white q-pa-md border-radius-16 shadow-minimal-light">
              <div class="text-caption text-weight-bold text-primary q-mb-md uppercase letter-spacing-1">Identidad</div>
              <q-input 
                v-model="itemEditando.descripcion" 
                label="Nombre / Descripción" 
                outlined
                dense
                bg-color="white"
                color="primary"
                stack-label
                autofocus 
                :rules="[val => !!val || 'La descripción es obligatoria']" 
                class="q-mb-sm"
              >
                <template v-slot:prepend><q-icon name="description" color="primary" size="xs" /></template>
              </q-input>
              
              <q-input 
                v-model="itemEditando.identificador" 
                label="ID de Lógica (Sistema)" 
                outlined
                dense
                bg-color="white"
                color="primary"
                stack-label
                placeholder="EJ: COD_INTERNO"
                hint="Nombre técnico usado en la lógica interna"
              >
                <template v-slot:prepend><q-icon name="terminal" color="primary" size="xs" /></template>
              </q-input>
            </q-card>
            
            <!-- Sección: Integración / Valor -->
            <q-card flat bordered class="bg-white q-pa-md border-radius-16 shadow-minimal-light">
              <div class="text-caption text-weight-bold text-orange-8 q-mb-md uppercase letter-spacing-1">Paridad Técnica</div>
              <q-input 
                v-model="itemEditando.paridad" 
                label="Valor de Paridad / Mapeo" 
                outlined
                dense
                bg-color="white"
                color="orange-8"
                stack-label
                placeholder="Ej: VAL_101"
                hint="Valor de cruce para integración externa"
              >
                <template v-slot:prepend><q-icon name="sync_alt" color="orange-8" size="xs" /></template>
              </q-input>
            </q-card>

            <!-- Sección: Estado -->
            <q-card flat bordered class="bg-white q-pa-md border-radius-16 shadow-minimal-light">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-subtitle2 text-weight-bold">Visibilidad del Registro</div>
                  <div class="text-caption text-grey-6">Habilitar para uso en el sistema</div>
                </div>
                <q-toggle v-model="itemEditando.activo" true-value="S" false-value="N" color="positive" size="lg" keep-color />
              </div>
            </q-card>
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="center" class="q-pa-lg bg-white">
           <q-btn flat rounded label="Cancelar" color="blue-grey-6" class="q-px-lg" v-close-popup />
           <q-btn unelevated rounded label="Sincronizar Datos" color="primary" class="q-px-xl shadow-primary text-weight-bold" @click="guardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, watch, computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import useConfiguracionParametros from '../../../composables/useConfiguracionParametros';
import { useQuasar, exportFile } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const { 
  modulos, 
  tablas, 
  parametros, 
  moduloSeleccionado, 
  tablaSeleccionada, 
  cargando, 
  guardarParametro, 
  eliminarParametro 
} = useConfiguracionParametros();

const dialogoVisible = ref(false);
const filtroTabla = ref('');
const itemEditando = ref({
  descripcion: '',
  identificador: '',
  paridad: '',
  activo: 'S'
});
const formRef = ref(null);

// HUB V2: Estado para el In-Place Workspace
const hubOverlay = ref({
  visible: false,
  componente: null,
  props: {}
});

const componenteModuloEspecializado = computed(() => hubOverlay.value.componente);

const getComponenteEspecializado = (identificador) => {
  const acciones = getAccionesAvanzadas(identificador);
  return acciones.length > 0 ? acciones[0].componente : null;
};

// ComponentesAsync para el Hub V2
const ModuloServiciosDinamicos = defineAsyncComponent(() => import('../generico/ConfiguracionServicios.vue'));
const ModuloProfesionales = defineAsyncComponent(() => import('./profesional.vue'));
const ModuloUsuarios = defineAsyncComponent(() => import('../../Usuario/Usuario.vue'));
const ModuloProveedores = defineAsyncComponent(() => import('../inventario/Proveedores.vue'));
const ModuloTiposProducto = defineAsyncComponent(() => import('../inventario/TiposProducto.vue'));
const ModuloServiciosCatalogo = defineAsyncComponent(() => import('./servicio.vue'));

const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: true },
  { name: 'identificador', label: 'Lógica', field: 'identificador', align: 'left', sortable: true },
  { name: 'paridad', label: 'Paridad', field: 'paridad', align: 'left' },
  { name: 'activo', label: 'Vigencia', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

// Módulos adicionales que apuntan a rutas específicas (Carga en Overlay)
const modulosEstaticos = [
  { identificador: 'USUARIOS_SISTEMA', descripcion: 'Usuarios', componente: ModuloUsuarios },
  { identificador: 'PROVEEDORES_CATALOGO', descripcion: 'Proveedores', componente: ModuloProveedores },
  { identificador: 'TIPOS_PRODUCTO', descripcion: 'Tipos de Producto', componente: ModuloTiposProducto },
  { identificador: 'SERVICIOS_CATALOGO', descripcion: 'Catálogo de Servicios', componente: ModuloServiciosCatalogo }
];

// HUB V3: Mapa de Acciones Avanzadas por Módulo
const configuracionEspecializada = {
  'PROFE': [ { descripcion: 'Gestión de Profesionales', icon: 'badge', componente: ModuloProfesionales } ],
  'SERV': [ { descripcion: 'Gestión de Servicios', icon: 'auto_awesome', componente: ModuloServiciosDinamicos } ],
  'ATENC': [ { descripcion: 'Gestión de Servicios', icon: 'auto_awesome', componente: ModuloServiciosDinamicos } ],
  'GENERAL': [ { descripcion: 'Gestión de Profesionales', icon: 'badge', componente: ModuloProfesionales } ],
  'PERSONAL': [ { descripcion: 'Gestión de Profesionales', icon: 'badge', componente: ModuloProfesionales } ],
  'RRHH': [ { descripcion: 'Gestión de Profesionales', icon: 'badge', componente: ModuloProfesionales } ]
};

const getAccionesAvanzadas = (identificador) => {
  if (!identificador) return [];
  const id = String(identificador).toUpperCase();
  
  // Búsqueda por patrón para ser ultra-resiliente
  if (id.includes('PROFE') || id.includes('PERSONAL') || id.includes('RRHH') || id.includes('GENERAL') || id.includes('STAFF')) {
    return configuracionEspecializada['PROFE'];
  }
  if (id.includes('SERV') || id.includes('ATENC')) {
    return configuracionEspecializada['SERV'];
  }
  
  return configuracionEspecializada[id] || [];
};

const ejecutarAccionAvanzada = (accion) => {
  if (accion.componente) {
    hubOverlay.value.componente = accion.componente;
  } else if (accion.ruta) {
    router.push(accion.ruta);
  }
};

const todosLosModulos = computed(() => {
  return [...modulos.value, ...modulosEstaticos];
});

const getModuleIcon = (identificador) => {
  const id = String(identificador || '').toUpperCase();
  if (id.includes('MASCOTA')) return 'pets';
  if (id.includes('PERSONA') || id.includes('PROPIETA') || id.includes('CLIENTE')) return 'groups';
  if (id.includes('AGENDA') || id.includes('CITA')) return 'event';
  if (id.includes('VENTA') || id.includes('CAJA')) return 'payments';
  if (id.includes('ATENCION') || id.includes('CLINIC')) return 'medical_information';
  if (id.includes('INVENT') || id.includes('STOCK')) return 'inventory_2';
  if (id.includes('SERV')) return 'room_service';
  
  const icons = {
    'GENERAL': 'settings_suggest',
    'LABORATORIO': 'biotech',
    'ESTETICA': 'spa',
    'HOSPITALIZACION': 'hotel',
    'USUARIOS_SISTEMA': 'badge',
    'PROVEEDORES_CATALOGO': 'local_shipping',
    'TIPOS_PRODUCTO': 'category'
  };
  return icons[id] || 'auto_awesome';
};

const getModuleRawColor = (identificador) => {
  const id = String(identificador || '').toUpperCase();
  if (id.includes('MASCOTA')) return '#1976D2';
  if (id.includes('PERSONA') || id.includes('PROPIETA')) return '#2E7D32';
  if (id.includes('ATENCION')) return '#C62828';
  if (id.includes('AGENDA') || id.includes('CITA')) return '#027BE3';
  if (id.includes('VENTA') || id.includes('CAJA')) return '#F57C00';
  if (id.includes('INVENT')) return '#455A64';
  
  const colors = {
    'GENERAL': '#607D8B',
    'LABORATORIO': '#6A1B9A',
    'ESTETICA': '#E91E63',
    'HOSPITALIZACION': '#009688',
    'SERVICIOS_DINAMICOS': '#FF9800',
    'SERVICIOS_CATALOGO': '#027BE3',
    'USUARIOS_SISTEMA': '#1976D2',
    'PROVEEDORES_CATALOGO': '#f2c037',
    'TIPOS_PRODUCTO': '#26A69A'
  };
  return colors[id] || '#1976D2';
};

const getModuleColor = (identificador) => {
  const color = getModuleRawColor(identificador);
  return `${color}15`; // 15% opacity hex
};

const seleccionarTabla = (tabla) => {
  tablaSeleccionada.value = tabla;
};

const seleccionarModulo = (modulo) => {
  if (modulo.componente) {
    hubOverlay.value.componente = modulo.componente;
    moduloSeleccionado.value = modulo;
  } else if (modulo.ruta) {
    router.push(modulo.ruta);
  } else {
    // Si llegamos aquí es un módulo de la base de datos
    hubOverlay.value.componente = null;
    moduloSeleccionado.value = modulo;
  }
};

const volverAlPortal = () => {
  moduloSeleccionado.value = null;
  tablaSeleccionada.value = null;
  hubOverlay.value.componente = null;
};
const formatDescription = (modulo) => {
  if (!modulo) return '';
  const id = String(modulo.identificador || '').toUpperCase().trim();
  const desc = String(modulo.descripcion || '').toUpperCase();
  
  // Prioridad 1: Mappings específicos de limpieza
  const strictMapping = {
    'MASCOTA': 'Mascotas',
    'PERSONA': 'Personas',
    'AGENDA': 'Agenda',
    'VENTA': 'Ventas',
    'INVENTARIO': 'Inventario',
    'ATENCION': 'Atención Médica',
    'USUARIOS_SISTEMA': 'Usuarios',
    'PROVEEDORES_CATALOGO': 'Proveedores',
    'TIPOS_PRODUCTO': 'Tipos de Producto'
  };
  
  if (strictMapping[id]) return strictMapping[id];

  // Prioridad 2: Patrones de Profesionales
  if (id.includes('PROFE') || id.includes('PERSONAL') || id.includes('STAFF') || id.includes('RRHH') || id === 'GENERAL' || desc.includes('PROFE')) {
    return 'Profesionales';
  }
  
  // Prioridad 3: Patrones de Servicios (Evitando colisión con ATENCION)
  if (id.includes('SERV') || desc.includes('SERV')) {
    if (id === 'SERVICIOS_CATALOGO') return 'Catálogo de Servicios';
    return 'Servicios';
  }

  return modulo.descripcion;
};

// Auto-seleccionar primera tabla al entrar a un modulo
watch(tablas, (newTablas) => {
  if (moduloSeleccionado.value && newTablas.length > 0 && !tablaSeleccionada.value) {
    // Intentamos seleccionar la primera, sea genérica o no, para que el usuario vea algo
    tablaSeleccionada.value = newTablas[0];
  }
});

const nuevoParametro = () => {
  itemEditando.value = {
    descripcion: '',
    identificador: '',
    paridad: '',
    activo: 'S'
  };
  dialogoVisible.value = true;
};

const editarParametro = (item) => {
  itemEditando.value = { ...item };
  dialogoVisible.value = true;
};

const guardar = async () => {
  const success = await formRef.value.validate();
  if (!success) return;

  const exito = await guardarParametro(itemEditando.value);
  if (exito) {
    dialogoVisible.value = false;
    $q.notify({ type: 'positive', message: 'Sincronizado correctamente', icon: 'done_all' });
  }
};

const confirmarEliminar = (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de borrar "${item.descripcion}" permanentemente?`,
    cancel: { label: 'Cancelar', color: 'blue-grey-6', flat: true },
    ok: { label: 'Eliminar', color: 'negative', flat: true },
    persistent: true
  }).onOk(() => {
    eliminarParametro(item);
  });
};

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted = formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

const exportarDatos = () => {
  const content = [columnas.map(col => wrapCsvValue(col.label))]
    .concat(
      parametros.value.map(row =>
        columnas.map(col =>
          wrapCsvValue(
            typeof col.field === "function"
              ? col.field(row)
              : row[col.field === void 0 ? col.name : col.field],
            col.format,
            row
          )
        ).join(",")
      )
    ).join("\r\n");

  const fileName = `CONFIG_${moduloSeleccionado.value.identificador}_${tablaSeleccionada.value.nombre}.csv`;
  const status = exportFile(fileName, content, "text/csv");
  if (status !== true) $q.notify({ message: 'Error al exportar registros', color: 'warning' });
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

.font-outfit { font-family: 'Outfit', sans-serif; }
.min-height-screen { min-height: 100vh; }
.shadow-primary { box-shadow: 0 8px 25px rgba(25, 118, 210, 0.25); }
.shadow-minimal { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
.bordered { border: 1px solid rgba(25, 118, 210, 0.12); }
.border-bottom { border-bottom: 1px solid rgba(25, 118, 210, 0.12); }
.border-top { border-top: 1px solid rgba(25, 118, 210, 0.12); }

// Background Blobs
.light-blob {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(25, 118, 210, 0.05) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
  &.portal-active { width: 1000px; height: 1000px; transform: translate(20%, -20%); }
}

.glass-chip-light {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  border: 1px solid white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.portal-card-light {
  background: #ffffff;
  border-radius: 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  
  &:hover {
    transform: translateY(-5px);
    border-color: var(--q-primary);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
    background: #ffffff;
    z-index: 10;
  }
}

.border-radius-16 { border-radius: 16px; }
.shadow-minimal-light { box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.bg-slate-50 { background-color: #f8fafc; }

.icon-discrete-wrapper {
  width: 65px;
  height: 65px;
  background: white;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.03);
}

.back-btn-light {
  background: #f1f5f9;
  letter-spacing: 0.5px;
  &:hover { background: #e2e8f0; }
}

.icon-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-list-card {
  background: white;
  border-radius: 24px;
}

.workspace-table-item-light {
  border-radius: 12px;
  margin: 0 4px;
  &:hover { background: #f8fafc; color: var(--q-primary); }
  &.active-table-light {
    background: #eff6ff;
    color: var(--q-primary);
    border-left: 4px solid var(--q-primary);
  }
}

.dot-active {
  width: 6px;
  height: 6px;
  background: var(--q-primary);
  border-radius: 50%;
}

.dot-deco {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.6;
}

.data-workspace-card-light {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.1);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
}

.opacity-80 {
  opacity: 0.8;
}

.modern-table {
  :deep(.q-table__top) { padding: 20px 32px; border-bottom: 1px solid #f8fafc; }
  :deep(thead tr th) { 
    background-color: var(--q-primary);
    color: white; 
    font-weight: 700; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    letter-spacing: 1px;
    padding: 16px 32px;
  }
  :deep(tbody tr td) { padding: 14px 32px; color: #475569; border-bottom: 1px solid #f8fafc; }
  :deep(tbody tr:hover) { background: #f8faff !important; }
}

.advanced-action-item {
  border-radius: 12px;
  margin: 0 4px;
  background: rgba(255, 152, 0, 0.03);
  border: 1px dashed rgba(255, 152, 0, 0.2);
  &:hover { 
    background: rgba(255, 152, 0, 0.08); 
    border-style: solid;
    border-color: rgba(255, 152, 0, 0.4);
  }
}

.search-input-light { width: 280px; }

// Transitions
.portal-transition-enter-active, .portal-transition-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.portal-transition-enter-from { opacity: 0; transform: scale(0.95) translateY(20px); }
.portal-transition-leave-to { opacity: 0; transform: scale(1.05) translateY(-20px); }

.bounce-left-light {
  animation: bounce-left 2s infinite;
}

@keyframes bounce-left {
  0%, 20%, 50%, 80%, 100% { transform: translateX(0); }
  40% { transform: translateX(-15px); }
  60% { transform: translateX(-7px); }
}

.letter-spacing-1 { letter-spacing: 1px; }
.letter-spacing-2 { letter-spacing: 2.5px; }
</style>

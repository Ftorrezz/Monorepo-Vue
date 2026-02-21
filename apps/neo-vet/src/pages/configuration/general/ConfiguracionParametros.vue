<template>
  <div class="q-pa-lg bg-slate-50 min-height-screen font-outfit text-blue-grey-10 overflow-hidden relative-position">
    <!-- Fondo Decorativo Sutil -->
    <div class="light-blob absolute-top-right transition-all" :class="{ 'portal-active': !moduloSeleccionado }" />
    
    <transition name="portal-transition" mode="out-in">
      <!-- ETAPA 1: EL PORTAL (Dashboard de Módulos - Versión Compacta) -->
      <div v-if="!moduloSeleccionado" key="portal" class="full-width q-px-lg">
        <q-card flat class="bg-gradient-primary text-white q-mb-md animated fadeInDown shadow-2 overflow-hidden relative-position">
          <q-card-section class="q-pa-sm text-center relative-position">
            <div class="row items-center justify-center">
              <h1 class="text-h5 text-weight-black q-ma-none">Panel de Configuraciones Generales</h1>
              <q-btn
                flat
                round
                dense
                :icon="modoAyuda ? 'help' : 'help_outline'"
                :color="modoAyuda ? 'orange-4' : 'white'"
                class="absolute-right q-mr-md"
                @click="modoAyuda = !modoAyuda"
              >
                <q-tooltip>{{ modoAyuda ? 'Desactivar modo ayuda' : 'Activar modo ayuda' }}</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <!-- Banner de Ayuda del Portal -->
          <q-slide-transition>
            <div v-if="modoAyuda" class="bg-white text-blue-grey-9 q-pa-md border-top">
              <div class="row items-center no-wrap">
                <q-icon name="info" color="primary" size="sm" class="q-mr-md" />
                <div class="text-caption">
                  Este panel le permite gestionar los <strong>Parámetros de Sistema</strong>. Cada tarjeta representa un <strong>Módulo</strong> (un área funcional como Mascotas o Inventario) que contiene tablas de configuración específicas.
                </div>
              </div>
            </div>
          </q-slide-transition>
        </q-card>

        <div class="row q-col-gutter-sm justify-center items-stretch module-grid-compact">
          <!-- Tarjetas de Módulos (Base de Datos) -->
          <div v-for="modulo in modulos" :key="modulo.identificador" class="col-6 col-sm-4 col-md-2 col-xl-2">
              <q-card 
                flat 
                bordered
                class="portal-card-light full-height cursor-pointer transition-all relative-position"
                @click="seleccionarModulo(modulo)"
              >
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
                      name="subdirectory_arrow_right" 
                      size="14px" 
                      :color="tablaSeleccionada?.id === tabla.id ? 'primary' : 'grey-4'" 
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-blue-grey-8">{{ tabla.descripcion }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="tablaSeleccionada?.id === tabla.id">
                    <div class="dot-active" />
                  </q-item-section>
                </q-item>
                
                <div v-if="tablas.length === 0 && !cargando" class="text-center q-pa-xl opacity-20">
                  <q-icon name="folder_open" size="40px" />
                  <div class="text-caption q-mt-md">Módulo vacío</div>
                </div>
              </q-list>
            </q-scroll-area>
            </q-card>
          </div>

          <!-- Panel Central de Datos -->
          <div class="col grow h-full">
            <q-card flat class="data-workspace-card-light full-height shadow-minimal overflow-hidden relative-position bordered column no-wrap">
              <q-inner-loading :showing="cargando" color="primary" />
              
              <transition name="fade-slide" mode="out-in">
                <!-- Tabla Genérica Estándar -->
                <div v-if="tablaSeleccionada" :key="'gen-' + tablaSeleccionada.id" class="col column no-wrap">
                  <!-- Banner de Ayuda en Workspace -->
                  <q-slide-transition>
                    <div v-if="modoAyuda" class="bg-blue-1 text-blue-9 q-pa-md border-bottom-light">
                      <div class="row items-center no-wrap">
                        <q-icon name="help_center" color="primary" size="sm" class="q-mr-md" />
                        <div class="text-caption">
                          Está consultando la tabla <strong>{{ tablaSeleccionada.descripcion }}</strong>. Puede buscar registros, exportarlos a Excel/CSV o editarlos usando los botones de acción a la derecha.
                        </div>
                        <q-space />
                        <q-btn flat round dense icon="close" size="xs" @click="modoAyuda = false" />
                      </div>
                    </div>
                  </q-slide-transition>

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
                      <div class="row full-width items-center q-px-lg q-py-sm bg-blue-1 border-bottom-light">
                        <div class="text-subtitle1 text-weight-bolder text-primary flex items-center letter-spacing-1">
                          <q-icon name="table_chart" class="q-mr-sm" size="18px" />
                          <span class="text-uppercase">{{ tablaSeleccionada.descripcion }}</span>
                        </div>
                        <q-space />
                        <div class="row q-gutter-md items-center">
                          <q-input 
                            outlined
                            dense 
                            bg-color="white"
                            debounce="300" 
                            v-model="filtroTabla" 
                            placeholder="Buscar en la tabla..."
                            class="search-input-clean"
                            style="width: 250px"
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
                      <q-td :props="props" class="text-center">
                        <q-chip
                          dense
                          :color="props.row.activo === 'S' ? 'green-5' : 'grey-4'"
                          text-color="white"
                          class="text-weight-bold"
                          size="sm"
                        >
                          {{ props.row.activo === 'S' ? 'Activo' : 'Inactivo' }}
                        </q-chip>
                      </q-td>
                    </template>

                    <template v-slot:body-cell-acciones="props">
                      <q-td :props="props" class="text-center">
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
        </div>
      </div>
    </transition>

    <!-- Diálogo de Edición Moderno (Centrado) -->
    <q-dialog 
      v-model="dialogoVisible" 
      persistent 
      transition-show="scale" 
      transition-hide="scale" 
      backdrop-filter="blur(10px) brightness(0.9)"
    >
      <q-card style="width: 550px; max-width: 95vw; border-radius: 28px" class="bg-slate-50 shadow-2xl overflow-hidden bordered-premium">
        <!-- Header del Dialogo Design Premium -->
        <q-card-section class="q-pa-none">
          <div class="bg-gradient-primary text-white q-pa-xl relative-position">
            <!-- Círculos decorativos de fondo -->
            <div class="absolute-top-right q-pa-lg opacity-10">
              <q-icon name="hub" size="120px" class="rotate-12" />
            </div>
            
            <div class="row items-center no-wrap relative-position">
              <div class="icon-discrete-wrapper q-mr-lg shadow-primary bg-white flex flex-center" :style="{ color: getModuleRawColor(moduloSeleccionado?.identificador) }">
                <q-icon :name="itemEditando.id ? 'edit_note' : 'add_task'" size="2rem" />
              </div>
              <div class="col-grow">
                <div class="text-overline text-white opacity-80 text-weight-bolder letter-spacing-2">{{ tablaSeleccionada?.descripcion || 'EDITOR' }}</div>
                <div class="text-h4 text-weight-black letter-spacing-1">{{ itemEditando.id ? 'Editar Registro' : 'Nuevo Registro' }}</div>
              </div>
            </div>

            <!-- Curva decorativa inferior (opcional) -->
            <div class="absolute-bottom full-width text-white" style="height: 10px; background: rgba(255,255,255,0.05); filter: blur(5px);"></div>
          </div>
        </q-card-section>
        
        <q-card-section class="q-pa-xl">
          <div class="text-subtitle2 text-grey-7 q-mb-xl flex items-center bg-blue-1 q-pa-md border-radius-16 relative-position">
            <q-icon name="auto_awesome" class="q-mr-sm" color="primary" />
            Sincronización de parámetros genéricos para el módulo de sistema.
            <q-btn 
              v-if="!modoAyuda" 
              flat round dense 
              icon="help_outline" 
              size="xs" 
              color="primary" 
              class="absolute-top-right q-ma-xs"
              @click="modoAyuda = true"
            />
          </div>

          <!-- Banner de Ayuda en Formulario -->
          <q-slide-transition>
            <div v-if="modoAyuda" class="bg-orange-1 text-orange-9 q-pa-md border-radius-16 q-mb-xl bordered-orange dashed">
              <div class="row items-center no-wrap">
                <q-icon name="lightbulb" color="orange-8" size="sm" class="q-mr-md" />
                <div class="text-caption">
                  <strong>Consejo:</strong> Los cambios realizados aquí afectan el comportamiento de los desplegables y opciones en todo el sistema.
                </div>
                <q-space />
                <q-btn flat round dense icon="close" size="xs" @click="modoAyuda = false" />
              </div>
            </div>
          </q-slide-transition>
          
          <q-form @submit="guardar" ref="formRef" class="q-gutter-y-lg">
            <!-- Campo: Descripción Principal -->
            <q-input 
              v-model="itemEditando.descripcion" 
              label="Descripción del Parámetro" 
              outlined
              stack-label
              class="premium-input uppercase-input"
              style="text-transform: uppercase"
              autofocus 
              @update:model-value="val => itemEditando.descripcion = val.toUpperCase()"
              :rules="[val => !!val || 'Campo requerido']" 
            >
              <template v-slot:prepend><q-icon name="description" color="primary" /></template>
            </q-input>
            
            <div class="row q-col-gutter-md">
              <!-- Campo: Identificador -->
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="itemEditando.identificador" 
                  label="ID Sistema" 
                  outlined
                  stack-label
                  class="premium-input-sm uppercase-input"
                  style="text-transform: uppercase"
                  @update:model-value="val => itemEditando.identificador = val.toUpperCase()"
                >
                  <template v-slot:prepend><q-icon name="terminal" color="blue-grey-4" /></template>
                  <template v-slot:after v-if="modoAyuda">
                    <q-icon name="info" color="orange-4" size="xs" class="cursor-pointer">
                      <q-tooltip max-width="200px">Identificador único para la lógica del sistema. No debe cambiarse si el registro ya está en uso.</q-tooltip>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              
              <!-- Campo: Paridad -->
              <div class="col-12 col-sm-6">
                <q-input 
                  v-model="itemEditando.paridad" 
                  label="Paridad / Valor" 
                  outlined
                  stack-label
                  class="premium-input-sm"
                >
                  <template v-slot:prepend><q-icon name="sync_alt" color="orange-8" /></template>
                  <template v-slot:after v-if="modoAyuda">
                    <q-icon name="info" color="orange-4" size="xs" class="cursor-pointer">
                      <q-tooltip max-width="200px">Valor de mapeo para integraciones con laboratorios u otros sistemas externos.</q-tooltip>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Sección: Estado Switch Moderno -->
            <div class="bg-white q-pa-lg border-radius-16 bordered shadow-minimal flex items-center justify-between q-mt-sm">
              <div class="row items-center">
                <div class="icon-circle bg-blue-1 q-mr-md">
                  <q-icon :name="itemEditando.activo === 'S' ? 'visibility' : 'visibility_off'" :color="itemEditando.activo === 'S' ? 'positive' : 'grey-5'" />
                </div>
                <div>
                  <div class="text-weight-bold">Estado de Vigencia</div>
                  <div class="text-caption text-grey-6">{{ itemEditando.activo === 'S' ? 'Visible en catálogos' : 'Oculto del sistema' }}</div>
                </div>
              </div>
              <q-toggle 
                v-model="itemEditando.activo" 
                true-value="S" 
                false-value="N" 
                color="positive"
                size="70px"
                keep-color
              />
            </div>
          </q-form>
        </q-card-section>

        <q-separator class="opacity-10" />

        <q-card-actions align="center" class="q-pa-xl bg-white q-gutter-x-md">
           <q-btn flat rounded label="Descartar" color="blue-grey-6" class="q-px-xl text-weight-bold" v-close-popup />
           <q-btn 
            unelevated 
            rounded 
            label="Guardar Cambios" 
            color="primary" 
            class="q-px-xl shadow-primary text-weight-black" 
            @click="guardar" 
           />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import useConfiguracionParametros from '../../../composables/useConfiguracionParametros';
import { useQuasar, exportFile } from 'quasar';

const $q = useQuasar();
const modoAyuda = ref(false);
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

const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: true },
  { name: 'identificador', label: 'Identificador', field: 'identificador', align: 'left', sortable: true },
  { name: 'paridad', label: 'Paridad', field: 'paridad', align: 'left' },
  { name: 'activo', label: 'Vigencia', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

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
  moduloSeleccionado.value = modulo;
};

const volverAlPortal = () => {
  moduloSeleccionado.value = null;
  tablaSeleccionada.value = null;
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
  background: white;
  :deep(.q-table__top) { padding: 0; border-bottom: none; }
  :deep(thead tr th) { 
    background-color: #1976d2;
    color: white; 
    font-weight: 700; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
    padding: 12px 16px;
    letter-spacing: 0.5px;
  }
  :deep(tbody tr:nth-child(even)) {
    background-color: #fbfbfb;
  }
  :deep(tbody td) {
    font-size: 0.85rem;
    color: #444;
    padding: 8px 16px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.border-bottom-light { border-bottom: 1px solid rgba(25, 118, 210, 0.08); }

.search-input-clean {
  :deep(.q-field__control) {
    border-radius: 4px;
    background: white !important;
  }
  :deep(.q-field__marginal) {
    height: 32px;
  }
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

/* Premium Dialog & Input Styles */
.bordered-premium {
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.shadow-primary {
  box-shadow: 0 10px 15px -3px rgba(25, 118, 210, 0.3);
}

.icon-discrete-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
}

.premium-input {
  :deep(.q-field__control) {
    border-radius: 16px !important;
    background: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover { border-color: var(--q-primary); }
    &::before { border-color: rgba(0,0,0,0.1); }
  }
}

.premium-input-sm {
  :deep(.q-field__control) {
    border-radius: 12px !important;
    height: 48px;
    background: white;
    &::before { border-color: rgba(0,0,0,0.05); }
  }
}

.border-radius-16 { border-radius: 16px !important; }

/* Animación sutil para el backdrop */
.q-dialog__backdrop {
  backdrop-filter: blur(8px) brightness(0.9);
  transition: backdrop-filter 0.5s ease;
}

.bordered-orange {
  border: 1px solid #ffcc80;
}

.dashed {
  border-style: dashed;
}

.border-top {
  border-top: 1px solid rgba(0,0,0,0.05);
}
</style>

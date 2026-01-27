<template>
  <div class="row q-col-gutter-md full-width q-pl-md">
    <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12 q-pa-none">
      <q-card class="custom-card full-width">
        <q-card-section class="bg-primary text-white q-py-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1">
              <q-icon name="list" size="sm" class="q-mr-sm" />
              Lista de Propietarios
            </div>
            <q-btn
              unelevated
              color="deep-purple-14"
              text-color="white"
              size="sm"
              label="Nuevo Propietario"
              class="action-btn"
              @click="abrirDialogoPropietario"
            >
              <q-badge color="white" text-color="purple" floating>+</q-badge>
              <q-tooltip>Agregar nuevo propietario</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-table
          :rows="propietariosRows"
          :columns="columns"
          row-key="id"
          flat
          bordered
          translate="no"
          :pagination="{ rowsPerPage: 10 }"
          :rows-per-page-options="[5, 10, 15, 20]"
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              :class="{'bg-blue-1': propietarioSeleccionadoId === props.row.id}"
              class="cursor-pointer"
              @click="seleccionarPropietario(props.row)"
            >
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'expand'">
                  <q-btn
                    size="sm"
                    color="accent"
                    round
                    dense
                    @click.stop="props.expand = !props.expand"
                    :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  />
                </template>
                <template v-else-if="col.name === 'action'">
                  <div class="q-gutter-sm">
                    <q-btn
                      round
                      color="primary"
                      icon="edit"
                      @click.stop="editarPropietario(props)"
                      size="sm"
                      flat
                      dense
                    >
                      <q-tooltip>Editar propietario</q-tooltip>
                    </q-btn>
                    <!--<q-btn
                      round
                      color="negative"
                      icon="delete"
                      @click.stop="eliminarPropietario(props)"
                      size="sm"
                      flat
                      dense
                      :disabled="props.row.activo === 'N'"
                    >
                      <q-tooltip>Eliminar propietario</q-tooltip>
                    </q-btn>-->
                  </div>
                </template>
                <template v-else>
                  <span translate="no">{{ col.value }}</span>
                </template>
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <div class="text-left">
                  Detalles adicionales del propietario: {{ props.row.nombre }}.
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </div>

    <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12 q-pa-none">
      <q-card class="custom-card full-width">
        <q-card-section class="bg-secondary text-white q-py-sm">
          <div class="row items-center justify-between">
            <div class="text-subtitle1">
              <q-icon name="pets" size="sm" class="q-mr-sm" />
              Lista de Mascotas
              <span v-if="propietarioStore.propietarioActual" class="text-caption q-ml-sm propietario-seleccionado">
                ({{ propietarioStore.propietarioActual.nombre }} {{ propietarioStore.propietarioActual.primerapellido }})
              </span>
            </div>
            <div>
              <q-btn
                unelevated
                color="deep-purple-14"
                text-color="white"
                size="sm"
                label="Nueva Mascota"
                class="action-btn"
                @click="abrirDialogoMascota"
                :disabled="!propietarioStore.tienePropietarioSeleccionado"
              >
                <q-badge 
                  v-if="propietarioStore.tienePropietarioSeleccionado"
                  color="white" 
                  text-color="purple" 
                  floating
                >
                  +
                </q-badge>
                <q-badge 
                  v-else
                  color="warning" 
                  text-color="white" 
                  floating
                >
                  !
                </q-badge>
                <q-tooltip>Agregar nueva mascota</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <q-table
          :rows="mascotasFiltradas"
          :columns="columnsMascota"
          row-key="id"
          flat
          bordered
          translate="no"
          :pagination="{ rowsPerPage: 10 }"
          :rows-per-page-options="[5, 10, 15, 20]"
        >
          <!-- Mensaje informativo para propietario recién agregado -->
          <template v-slot:top v-if="propietarioRecienAgregado">
            <div class="full-width q-pa-sm bg-yellow-1 text-yellow-9 rounded-borders">
              <q-icon name="info" size="sm" class="q-mr-xs" />
              <span class="text-caption">
                Propietario recién agregado. Puedes agregar mascotas inmediatamente.
              </span>
            </div>
          </template>
          
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <template v-if="col.name === 'expand'">
                  <q-btn
                    size="sm"
                    color="accent"
                    round
                    dense
                    @click="props.expand = !props.expand"
                    :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                  />
                </template>
                <template v-else-if="col.name === 'action'">
                  <div class="q-gutter-sm">
                    <q-btn
                      round
                      color="primary"
                      icon="edit"
                      @click="editarMascota(props)"
                      size="sm"
                      flat
                      dense
                    >
                      <q-tooltip>Editar mascota</q-tooltip>
                    </q-btn>
                    <!--<q-btn
                      round
                      color="negative"
                      icon="delete"
                      @click="eliminarMascota(props)"
                      size="sm"
                      flat
                      dense
                    >
                      <q-tooltip>Eliminar mascota</q-tooltip>
                    </q-btn>-->
                    <q-btn
                      round
                      color="positive"
                      icon="check"
                      @click="seleccionarMascota(props)"
                      size="sm"
                      dense
                    >
                      <q-tooltip>Selección de Paciente</q-tooltip>
                    </q-btn>

                  </div>
                </template>
                
                <template v-else>
                  {{ col.value }}
                </template>
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <div class="text-left">
                  Detalles adicionales de la mascota: <span translate="no">{{ props.row.nombre || 'Sin nombre' }}</span>.
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-8">
              {{ propietarioSeleccionadoId ? 'Este propietario no tiene mascotas registradas' : 'No hay mascotas disponibles' }}
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </div>

  <DialogAgregarPropietario
    v-if="mostrarDialogoPropietario"
    @propietario-guardado="propietarioAgregado"
    @cerrar="cerrarDialogoPropietario"
  />

  <DialogAgregarMascota
    v-if="mostrarDialogoMascota"
    :propietario="propietarioSeleccionado"
    @mascota-guardada="mascotaAgregada"
    @cerrar="cerrarDialogoMascota"
  />

</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import DialogAgregarMascotaPropietario from "../dialog/DialogAgregarMascotaPropietario.vue";
import DialogAgregarPropietario from "../dialog/DialogAgregarPropietario.vue";
import DialogAgregarMascota from "../dialog/DialogAgregarMascota.vue";
import NdAlertasControl from "src/controles/alertas.control";
import PeticionService from "src/services/peticion.service";
import { usePropietarioStore } from 'src/stores/propietarioStore';
import NdPeticionControl from "src/controles/rest.control";
import { DtoParametros } from "src/controles/dto.parametros";
import { useMascotaSeleccionadaStore } from 'src/stores/mascotaSeleccionadaStore';

const $q = useQuasar();
const mostrarDialogoPropietario = ref(false);
const mostrarDialogoMascota = ref(false);
let alertas = new NdAlertasControl()
const propietarioStore = usePropietarioStore();
const router = useRouter();
const mascotaSeleccionadaStore = useMascotaSeleccionadaStore();

const emit = defineEmits(['update:rows', 'refresh-data', 'limpiar-filtro', 'llenar-filtro-y-buscar']);

const abrirDialogoPropietario = () => {
  // Limpiar el filtro antes de abrir el diálogo
  emit('limpiar-filtro');
  mostrarDialogoPropietario.value = true;
};

const abrirDialogoMascota = () => {
  if (propietarioStore.tienePropietarioSeleccionado) {
    mostrarDialogoMascota.value = true;
  }
};

const seleccionarPropietario = (propietario) => {
  propietarioStore.seleccionarPropietario(propietario);
};

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
});

// Watcher para actualizar el store cuando cambien los datos
watch(() => props.rows, (nuevosDatos, datosAnteriores) => {
  if (nuevosDatos) {
    // Verificar si es una nueva búsqueda (datos completamente diferentes)
    const esNuevaBusqueda = !datosAnteriores || 
      nuevosDatos.length !== datosAnteriores.length ||
      !nuevosDatos.some((item, index) => 
        datosAnteriores[index] && 
        item.id === datosAnteriores[index].id
      );
    
    if (esNuevaBusqueda) {
      // Es una nueva búsqueda, limpiar propietarios temporales
      propietarioStore.limpiarPropietariosTemporales();
    }
    
    // Solo actualizar si no hay un propietario seleccionado o si es una nueva búsqueda
    if (!propietarioStore.propietarioSeleccionadoId || esNuevaBusqueda) {
      propietarioStore.setDatosOriginales(nuevosDatos);
    } else {
      // Si hay un propietario seleccionado, solo actualizar los datos sin cambiar la selección
      propietarioStore.datosOriginales = nuevosDatos;
    }
  }
}, { immediate: true });

// Usar los getters del store
const propietariosRows = computed(() => propietarioStore.propietariosRows);
const propietarioSeleccionado = computed(() => propietarioStore.propietarioActual);
const propietarioSeleccionadoId = computed(() => propietarioStore.propietarioSeleccionadoId);
const mascotasFiltradas = computed(() => propietarioStore.mascotasFiltradas);
const propietarioRecienAgregado = computed(() => propietarioStore.propietarioRecienAgregado);

const columns = ref([
  {
    name: 'expand',
    label: '',
    field: 'expand',
    sortable: false,
    align: 'left',
  },
  {
    name: "primerapellido",
    align: "left",
    label: "Primer Apellido",
    field: "primerapellido",
    sortable: true,
  },
  {
    name: "segundoapellido",
    align: "left",
    label: "Segundo Apellido",
    field: "segundoapellido",
    sortable: true,
  },
  {
    name: "nombre",
    align: "left",
    label: "Nombres",
    field: "nombre",
    sortable: true,
  },
  {
    name: "email",
    align: "left",
    label: "Correo electrónico",
    field: "email",
    sortable: true,
  },
  {
    name: "telefonomovil",
    label: "Teléfono móvil",
    field: "telefono1",
    sortable: true,
    align: "center",
  },
  {
    name: "action",
    align: "center",
    field: "activo",
    sortable: false,
  },
]);

const columnsMascota = ref([
  {
    name: 'expand',
    label: '',
    field: 'expand',
    sortable: false,
    align: 'left',
  },
  {
    name: "nombre",
    align: "left",
    label: "Nombre",
    field: "nombre",
    sortable: true,
  },
  {
    name: "historiaclinica",
    align: "left",
    label: "Historia Clínica",
    field: "historiaclinica",
    sortable: true,
  },
  {
    name: "action",
    align: "center",
    field: "action",
    sortable: false,
  },
]);

const editarPropietario = (props) => {
  // Implementar la lógica para editar propietario
  console.log('Editar propietario:', props.row);
};

const editarMascota = (props) => {
  // Implementar la lógica para editar mascota
  console.log('Editar mascota:', props.row);
};

const eliminarPropietario = async (props) => {
  try {
    const peticionService = new PeticionService();
    const resultado = await peticionService.eliminar(
      'propietario',
      Object.assign({}, props.row),
      true,
      'Propietario'
    );

    if (resultado !== false) {
      // Usar el store para eliminar
      propietarioStore.eliminarPropietario(props.row.id);
      
      // Emitir evento para actualizar los datos
      emit('refresh-data');
    }

  } catch (error) {
    const alertas = new NdAlertasControl();
    alertas.mostrarMensaje(
      "error",
      "Eliminar",
      "No fue posible eliminar el propietario"
    );
  }
};

const eliminarMascota = async (props) => {
  try {
    const peticionService = new PeticionService();
    const resultado = await peticionService.eliminar(
      'mascota',
      Object.assign({}, props.row),
      true,
      'Mascota'
    );
      // Emitir un evento para que el padre actualice los datos
      if (resultado !== false)  emit('refresh-data');


  } catch (error) {
    const alertas = new NdAlertasControl();
    alertas.mostrarMensaje(
      "error",
      "Eliminar",
      "No fue posible eliminar la mascota"
    );
  }
};

const seleccionarMascota = async (props) => {
  try {
    // Guardar la mascota y el propietario en el store
    mascotaSeleccionadaStore.setMascota({
      ...props.row,
      propietario: propietarioSeleccionado.value
    });
    router.push({ name: "atencionpaciente" });
  } catch (error) {
    // Manejo de error opcional
  }
};

// Función mejorada para manejar propietario agregado
const propietarioAgregado = async (propietarioGuardado) => {
  mostrarDialogoPropietario.value = false;
  
  console.log('Propietario guardado recibido:', propietarioGuardado);
  
  // Usar la nueva funcionalidad del store que buscará datos completos si es necesario
  await propietarioStore.manejarPropietarioAgregado(propietarioGuardado);
  
  // Llenar el filtro con los datos del propietario recién agregado y buscar
  emit('llenar-filtro-y-buscar', propietarioGuardado);
  
  // Mostrar diálogo de confirmación para agregar mascota
 /* $q.dialog({
    title: 'Propietario agregado exitosamente',
    message: `¿Desea agregar una mascota para ${propietarioGuardado.nombre} ${propietarioGuardado.primerapellido}?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Sí, agregar mascota',
      color: 'primary'
    },
    cancel: {
      label: 'No, más tarde',
      color: 'grey'
    }
  }).onOk(() => {
    // Si el usuario confirma, abrir el diálogo de nueva mascota
    abrirDialogoMascota();
  }).onCancel(() => {
    // Si el usuario cancela, no hacer nada
    console.log('Usuario decidió no agregar mascota por ahora');
  });*/
};

const cerrarDialogoPropietario = () => {
  mostrarDialogoPropietario.value = false;
};

const mascotaAgregada = (mascotaGuardada) => {
  mostrarDialogoMascota.value = false;
  
  // En lugar de hacer refresh-data, agregar la mascota directamente a la lista
  if (propietarioStore.propietarioSeleccionadoId && mascotaGuardada) {
    // Agregar la mascota al propietario seleccionado en los datos originales
    const propietarioEncontrado = propietarioStore.datosOriginales.find(
      item => item.id === propietarioStore.propietarioSeleccionadoId
    );
    
    if (propietarioEncontrado) {
      // Asegurar que el array de mascotas existe
      if (!propietarioEncontrado.mascotas) {
        propietarioEncontrado.mascotas = [];
      }
      
      // Crear una copia de la mascota con el nombre en mayúsculas
      const mascotaConNombreMayusculas = {
        ...mascotaGuardada,
        nombre: mascotaGuardada.nombre ? mascotaGuardada.nombre.toUpperCase() : ''
      };
      
      // Agregar la nueva mascota
      propietarioEncontrado.mascotas.push(mascotaConNombreMayusculas);
      
      // Forzar la actualización del store creando una nueva referencia del array
      propietarioStore.datosOriginales = [...propietarioStore.datosOriginales];
      
      console.log('Mascota agregada exitosamente:', mascotaConNombreMayusculas);
      console.log('Mascotas del propietario:', propietarioEncontrado.mascotas);
    }
  }
};

const cerrarDialogoMascota = () => {
  mostrarDialogoMascota.value = false;
};

// Procesar los datos para la tabla de mascotas
const mascotasRows = computed(() => {
  const mascotas = [];
  props.rows.forEach(item => {
    if (item.mascotas && Array.isArray(item.mascotas)) {
      item.mascotas.forEach(mascota => {
        mascotas.push({
          id: mascota.id,
          nombre: mascota.nombre || '',
          historiaclinica: mascota.historiaclinica || '',
          propietarioId: item.propietario?.id
        });
      });
    }
  });
  return mascotas;
});
</script>

<style scoped>
.custom-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  margin: 0;
  border: 2px solid transparent; /* Borde transparente por defecto */
}

/* Efecto de borde en lugar de sombra */
.custom-card:hover {
  border: 2px solid rgba(25, 118, 210, 0.3);
}

.full-width {
  width: 100%;
  margin: 0;
}

.floating-btn {
  transform: translateY(-2px);
  margin-right: -8px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

/* Modificar el margen derecho para el botón de limpiar */
.q-mr-xs.floating-btn {
  margin-right: 8px !important; /* Aumentamos el margen entre botones */
}

.floating-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.floating-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* Nuevos estilos para botones de acción más intuitivos */
.action-btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 15px;
  transition: all 0.03s ease;
  box-shadow: 0 3px 6px rgba(245, 243, 247, 0.15);
  text-transform: none;
  letter-spacing: 0.5px;
  font-size: 10px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Estilos para los badges en los botones */
.action-btn .q-badge {
  font-weight: bold;
  font-size: 14px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  top: -6px;
  right: -6px;
}

/* Animación para el badge de advertencia */
.action-btn .q-badge[color="warning"] {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.q-pl-md {
  padding-left: 16px !important;
}

/* Ajuste del espaciado entre columnas */
.q-col-gutter-md > * {
  padding: 6px !important;
}
.cursor-pointer {
  cursor: pointer;
}

.propietario-seleccionado {
  font-weight: bold;
  color: #110707;
  /*text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);*/
  background-color: rgba(255, 255, 255, 0.1);
  padding: 3px 8px;
  border-radius: 4px;
  display: inline-block;
}

/* Estilos para la fila seleccionada */
:deep(.bg-blue-1) {
  background-color: rgba(25, 118, 210, 0.1) !important;
}

/* Estilo para el texto en modo claro cuando está seleccionado */
:deep(.bg-blue-1) td {
  color: rgba(25, 118, 210, 0.87) !important;
  font-weight: 600 !important;
}

/* Estilo para el texto en modo oscuro cuando está seleccionado */
.body--dark :deep(.bg-blue-1) {
  background-color: rgba(64, 196, 255, 0.2) !important;
}

.body--dark :deep(.bg-blue-1) td {
  color: #fff !important;
  font-weight: 600 !important;
}

/* Ajuste del color del texto del propietario seleccionado en modo oscuro */
.body--dark .propietario-seleccionado {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.15);
}
</style>

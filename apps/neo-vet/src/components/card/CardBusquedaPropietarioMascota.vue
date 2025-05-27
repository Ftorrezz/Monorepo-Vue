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
              round
              flat
              color="white"
              size="sm"
              icon="add"
              class="floating-btn"
              @click="abrirDialogoPropietario"
            >
              <q-tooltip>Agregar Propietario</q-tooltip>
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
                    <q-btn
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
                    </q-btn>
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
              <span v-if="propietarioSeleccionado" class="text-caption q-ml-sm propietario-seleccionado">
                ({{ propietarioSeleccionado.nombre }} {{ propietarioSeleccionado.primerapellido }})
              </span>
            </div>
            <div>
              <!--<q-btn
                v-if="propietarioSeleccionadoId"
                round
                flat
                color="white"
                size="sm"
                icon="clear"
                class="floating-btn q-mr-xs"
                @click="limpiarSeleccion"
              >
                <q-tooltip>Mostrar todas las mascotas</q-tooltip>
              </q-btn>-->
              <q-btn
                round
                flat
                color="white"
                size="sm"
                icon="add"
                class="floating-btn"
                @click="abrirDialogoMascota"
                :disabled="!propietarioSeleccionadoId"
              >
                <q-tooltip>Agregar Mascota</q-tooltip>
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
        >
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
                    <q-btn
                      round
                      color="negative"
                      icon="delete"
                      @click="eliminarMascota(props)"
                      size="sm"
                      flat
                      dense
                    >
                      <q-tooltip>Eliminar mascota</q-tooltip>
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
    @mascota-guardada="mascotaAgregada"
    @cerrar="cerrarDialogoMascota"
  />
  
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import DialogAgregarMascotaPropietario from "../dialog/DialogAgregarMascotaPropietario.vue";
import DialogAgregarPropietario from "../dialog/DialogAgregarPropietario.vue";
import DialogAgregarMascota from "../dialog/DialogAgregarMascota.vue";
import NdAlertasControl from "src/controles/alertas.control";
import PeticionService from "src/services/peticion.service";


const mostrarDialogoPropietario = ref(false);
const mostrarDialogoMascota = ref(false);
const propietarioSeleccionadoId = ref(null);
const propietarioSeleccionado = ref(null);
let alertas = new NdAlertasControl()

const abrirDialogoPropietario = () => {
  mostrarDialogoPropietario.value = true;
};

const abrirDialogoMascota = () => {
  if (propietarioSeleccionadoId.value) {
    mostrarDialogoMascota.value = true;
  }
};

const seleccionarPropietario = (propietario) => {
  // Siempre seleccionamos el propietario, sin importar si ya estaba seleccionado
  propietarioSeleccionadoId.value = propietario.id;
  propietarioSeleccionado.value = propietario;
};

const limpiarSeleccion = () => {
  propietarioSeleccionadoId.value = null;
  propietarioSeleccionado.value = null;
};

const actualizarMascotas = () => {
  // Esta función se llamaría después de agregar una mascota
  // Aquí podrías emitir un evento para actualizar los datos desde el componente padre
  // o implementar alguna lógica para refrescar los datos
};

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
});

// Procesar los datos para la tabla de propietarios
// Modificar el computed de propietariosRows
const propietariosRows = computed(() => {
  const propietariosUnicos = new Map();

  props.rows.forEach(item => {
    if (item.propietario && !propietariosUnicos.has(item.propietario.id)) {
      propietariosUnicos.set(item.propietario.id, {
        id: item.propietario.id,
        primerapellido: item.propietario.primerapellido || '',
        segundoapellido: item.propietario.segundoapellido || '',
        nombre: item.propietario.nombre || '',
        email: '',
        telefonomovil: '',
        activo: item.activo
      });
    }
  });

  const propietarios = Array.from(propietariosUnicos.values());

  // Seleccionar el primer propietario solo cuando hay nuevos resultados
  if (propietarios.length > 0) {
    nextTick(() => {
      // Verificar si el propietario seleccionado actual existe en los nuevos resultados
      const propietarioExiste = propietarios.some(p => p.id === propietarioSeleccionadoId.value);

      // Si no existe un propietario seleccionado o el actual no está en los resultados
      if (!propietarioSeleccionadoId.value || !propietarioExiste) {
        seleccionarPropietario(propietarios[0]);
      }
    });
  } else {
    // Si no hay propietarios, limpiar la selección
    limpiarSeleccion();
  }

  return propietarios;
});

// Procesar los datos para la tabla de mascotas
const mascotasRows = computed(() => {
  return props.rows
    .filter(item => item.mascota)
    .map(item => ({
      id: item.mascota?.id,
      nombre: item.mascota?.nombre || '',
      historiaclinica: item.mascota?.historiaclinica || '',
      propietarioId: item.propietario?.id // Agregamos el ID del propietario para filtrar
    }));
});

// Mascotas filtradas según el propietario seleccionado
const mascotasFiltradas = computed(() => {
  if (!propietarioSeleccionadoId.value) {
    return mascotasRows.value; // Mostrar todas las mascotas si no hay propietario seleccionado
  }

  return mascotasRows.value.filter(mascota =>
    mascota.propietarioId === propietarioSeleccionadoId.value
  );
});

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
    field: "perfildescripcion",
    sortable: true,
  },
  {
    name: "telefonomovil",
    label: "Teléfono móvil",
    field: "activo",
    sortable: true,
    align: "center",
  },
  {
    name: "action",
    align: "center",
    field: "action",
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


    // Si el propietario eliminado era el seleccionado, limpiar la selección
      if (propietarioSeleccionadoId.value === props.row.id) {
        limpiarSeleccion();
      }

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

const emit = defineEmits(['update:rows', 'refresh-data']);

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

// Agregar estas funciones
const propietarioAgregado = (propietario) => {
  // Actualizar la lista de propietarios o realizar otras acciones necesarias
  buscar(); // Asumiendo que tienes una función buscar para actualizar la lista
  mostrarDialogoPropietario.value = false;
};

const cerrarDialogoPropietario = () => {
  mostrarDialogoPropietario.value = false;
};
</script>

<style scoped>
.custom-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  margin: 0;
}

.custom-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

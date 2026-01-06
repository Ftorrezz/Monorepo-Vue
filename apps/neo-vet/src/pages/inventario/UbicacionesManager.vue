<template>
  <q-dialog v-model="show" persistent maximized>
    <q-card>
      <!-- Header -->
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="place" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Gestión de Ubicaciones</div>
            <div class="text-caption">Administra las ubicaciones físicas del inventario</div>
          </div>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="cerrar"
          />
        </div>
      </q-card-section>

      <!-- Toolbar -->
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            outlined
            dense
            placeholder="Buscar ubicación..."
            class="col-12 col-md-4"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-space />

          <q-btn
            color="primary"
            icon="add"
            label="Nueva Ubicación"
            @click="abrirFormulario()"
            unelevated
          />
        </div>
      </q-card-section>

      <!-- Tabla de ubicaciones -->
      <q-card-section>
        <q-table
          :rows="ubicacionesFiltradas"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :pagination="paginacion"
          dense
        >
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-badge 
                :color="props.value ? 'positive' : 'grey'" 
                :label="props.value ? 'Activo' : 'Inactivo'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                @click="editarUbicacion(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                dense
                round
                :icon="props.row.activo ? 'block' : 'check_circle'"
                :color="props.row.activo ? 'negative' : 'positive'"
                @click="toggleEstado(props.row)"
              >
                <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width text-center q-py-xl">
              <q-icon name="place" size="48px" color="grey-4" class="q-mb-md"/>
              <div class="text-h6 text-grey-6">No hay ubicaciones registradas</div>
              <div class="text-caption text-grey-5 q-mb-md">Comienza creando tu primera ubicación</div>
              <q-btn
                color="primary"
                icon="add"
                label="Nueva Ubicación"
                @click="abrirFormulario()"
                unelevated
              />
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Modal Formulario -->
  <q-dialog v-model="mostrarFormulario" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          {{ ubicacionEditando ? 'Editar Ubicación' : 'Nueva Ubicación' }}
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="ubicacionTemporal.nombre"
          label="Nombre *"
          outlined
          dense
          :rules="[val => !!val || 'El nombre es requerido']"
          maxlength="100"
          counter
        >
          <template v-slot:prepend>
            <q-icon name="label" />
          </template>
        </q-input>

        <q-input
          v-model="ubicacionTemporal.descripcion"
          label="Descripción"
          outlined
          dense
          type="textarea"
          rows="3"
          maxlength="500"
          counter
        >
          <template v-slot:prepend>
            <q-icon name="description" />
          </template>
        </q-input>

        <q-toggle
          v-if="ubicacionEditando"
          v-model="ubicacionTemporal.activo"
          label="Ubicación activa"
          color="positive"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" @click="cancelarFormulario" />
        <q-btn 
          color="primary"
          :label="ubicacionEditando ? 'Guardar Cambios' : 'Crear Ubicación'"
          @click="guardarUbicacion"
          :loading="guardando"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import inventarioService, { Ubicacion } from 'src/services/inventario.service';

// Props
const props = defineProps<{
  modelValue: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'actualizado'): void;
}>();

// Quasar
const $q = useQuasar();

// Estados
const ubicaciones = ref<Ubicacion[]>([]);
const filtro = ref('');
const cargando = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const ubicacionEditando = ref<Ubicacion | null>(null);

// Ubicación temporal para el formulario
const ubicacionTemporal = ref<Partial<Ubicacion>>({
  nombre: '',
  descripcion: '',
  activo: true
});

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const ubicacionesFiltradas = computed(() => {
  if (!filtro.value) return ubicaciones.value;
  
  const busqueda = filtro.value.toLowerCase();
  return ubicaciones.value.filter(u => 
    u.nombre.toLowerCase().includes(busqueda) ||
    u.descripcion?.toLowerCase().includes(busqueda)
  );
});

// Configuración de tabla
const columnas = [
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'activo',
    label: 'Estado',
    field: 'activo',
    align: 'center' as const,
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: '',
    align: 'center' as const
  }
];

const paginacion = ref({
  rowsPerPage: 10
});

// Métodos
const cargarUbicaciones = async () => {
  cargando.value = true;
  try {
    const response = await inventarioService.ubicaciones.getAll();
    ubicaciones.value = response.data;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar ubicaciones',
      caption: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    cargando.value = false;
  }
};

const abrirFormulario = (ubicacion?: Ubicacion) => {
  if (ubicacion) {
    ubicacionEditando.value = ubicacion;
    ubicacionTemporal.value = { ...ubicacion };
  } else {
    ubicacionEditando.value = null;
    ubicacionTemporal.value = {
      nombre: '',
      descripcion: '',
      activo: true
    };
  }
  mostrarFormulario.value = true;
};

const editarUbicacion = (ubicacion: Ubicacion) => {
  abrirFormulario(ubicacion);
};

const cancelarFormulario = () => {
  mostrarFormulario.value = false;
  ubicacionEditando.value = null;
  ubicacionTemporal.value = {
    nombre: '',
    descripcion: '',
    activo: true
  };
};

const guardarUbicacion = async () => {
  if (!ubicacionTemporal.value.nombre) {
    $q.notify({
      type: 'warning',
      message: 'El nombre es requerido'
    });
    return;
  }

  guardando.value = true;
  try {
    if (ubicacionEditando.value) {
      // Actualizar
      await inventarioService.ubicaciones.update(
        ubicacionEditando.value.id,
        ubicacionTemporal.value
      );
      $q.notify({
        type: 'positive',
        message: 'Ubicación actualizada correctamente'
      });
    } else {
      // Crear
      await inventarioService.ubicaciones.create(ubicacionTemporal.value);
      $q.notify({
        type: 'positive',
        message: 'Ubicación creada correctamente'
      });
    }
    
    await cargarUbicaciones();
    emit('actualizado');
    cancelarFormulario();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar ubicación',
      caption: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    guardando.value = false;
  }
};

const toggleEstado = async (ubicacion: Ubicacion) => {
  const accion = ubicacion.activo ? 'desactivar' : 'activar';
  
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de ${accion} la ubicación "${ubicacion.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inventarioService.ubicaciones.update(ubicacion.id, { activo: !ubicacion.activo });
      $q.notify({
        type: 'positive',
        message: `Ubicación ${accion === 'desactivar' ? 'desactivada' : 'activada'} correctamente`
      });
      await cargarUbicaciones();
      emit('actualizado');
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: `Error al ${accion} ubicación`,
        caption: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
};

const cerrar = () => {
  emit('update:modelValue', false);
};

// Lifecycle
onMounted(() => {
  if (show.value) {
    cargarUbicaciones();
  }
});

// Watch para cargar cuando se abre el modal
watch(show, (newVal) => {
  if (newVal) {
    cargarUbicaciones();
  }
});

</script>

<style scoped>
.q-table {
  box-shadow: none;
}
</style>

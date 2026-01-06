<template>
  <div class="ubicaciones-manager">
    <q-card flat bordered>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Gestión de Ubicaciones</div>
        <q-space />
        <q-btn color="primary" icon="add" label="Nueva Ubicación" @click="abrirModalCrear" />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="ubicaciones"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
        >
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.activo ? 'positive' : 'grey'"
                text-color="white"
                dense
                size="sm"
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" align="right">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="editarUbicacion(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" size="sm" @click="confirmarEliminar(props.row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal Crear/Editar -->
    <q-dialog v-model="mostrarModal" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editando ? 'Editar Ubicación' : 'Nueva Ubicación' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="guardarUbicacion" class="q-gutter-md">
            <q-input
              v-model="form.nombre"
              label="Nombre *"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="form.descripcion"
              label="Descripción"
              outlined
              dense
              type="textarea"
              rows="2"
            />
            <q-toggle
              v-if="editando"
              v-model="form.activo"
              label="Activo"
            />
            
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" color="grey" v-close-popup flat />
              <q-btn :label="editando ? 'Actualizar' : 'Guardar'" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialogo Confirmar Eliminación -->
    <q-dialog v-model="mostrarConfirmacion" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">¿Estás seguro de que deseas eliminar esta ubicación?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="eliminarUbicacion" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { UbicacionService } from '../../services/ubicacion.service';

const $q = useQuasar();
const ubicaciones = ref([]);
const loading = ref(false);
const mostrarModal = ref(false);
const mostrarConfirmacion = ref(false);
const editando = ref(false);
const ubicacionSeleccionada = ref(null);

const form = ref({
  id: null,
  nombre: '',
  descripcion: '',
  activo: true
});

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' }
];

const cargarUbicaciones = async () => {
  loading.value = true;
  try {
    ubicaciones.value = await UbicacionService.getAll();
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al cargar ubicaciones',
      icon: 'report_problem'
    });
  } finally {
    loading.value = false;
  }
};

const abrirModalCrear = () => {
  editando.value = false;
  form.value = { id: null, nombre: '', descripcion: '', activo: true };
  mostrarModal.value = true;
};

const editarUbicacion = (ubicacion) => {
  editando.value = true;
  form.value = { ...ubicacion };
  mostrarModal.value = true;
};

const confirmarEliminar = (ubicacion) => {
  ubicacionSeleccionada.value = ubicacion;
  mostrarConfirmacion.value = true;
};

const guardarUbicacion = async () => {
  try {
    if (editando.value) {
      await UbicacionService.update(form.value.id, form.value);
      $q.notify({ color: 'positive', message: 'Ubicación actualizada correctamente' });
    } else {
      await UbicacionService.create(form.value);
      $q.notify({ color: 'positive', message: 'Ubicación creada correctamente' });
    }
    mostrarModal.value = false;
    cargarUbicaciones();
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al guardar ubicación',
      icon: 'report_problem'
    });
  }
};

const eliminarUbicacion = async () => {
  if (!ubicacionSeleccionada.value) return;
  try {
    await UbicacionService.delete(ubicacionSeleccionada.value.id);
    $q.notify({ color: 'positive', message: 'Ubicación eliminada correctamente' });
    cargarUbicaciones();
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al eliminar ubicación',
      icon: 'report_problem'
    });
  }
};

onMounted(() => {
  cargarUbicaciones();
});
</script>

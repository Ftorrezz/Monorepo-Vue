<template>
  <q-page padding>
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="label" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Tipos de Producto</div>
            <div class="text-caption">Gestiona los tipos para clasificar productos</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            outlined
            dense
            placeholder="Buscar tipo..."
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
            label="Nuevo Tipo"
            @click="abrirFormulario()"
            unelevated
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="tiposFiltrados"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :pagination="paginacion"
          dense
        >
          <template v-slot:body-cell-requiereFraccionamiento="props">
            <q-td :props="props">
              <q-icon 
                v-if="props.value" 
                name="check_circle" 
                color="positive"
                size="sm"
              />
            </q-td>
          </template>

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
              <q-btn flat dense round icon="edit" color="primary" @click="editarTipo(props.row)">
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
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="mostrarFormulario" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ tipoEditando ? 'Editar Tipo' : 'Nuevo Tipo' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="tipoTemporal.nombre"
            label="Nombre *"
            outlined
            dense
            :rules="[val => !!val || 'El nombre es requerido']"
            maxlength="100"
          />

          <q-input
            v-model="tipoTemporal.descripcion"
            label="Descripción"
            outlined
            dense
            type="textarea"
            rows="2"
            maxlength="500"
          />

          <q-toggle
            v-model="tipoTemporal.requiereFraccionamiento"
            label="Requiere fraccionamiento (medicamentos por dosis)"
            color="primary"
          />

          <q-toggle
            v-if="tipoEditando"
            v-model="tipoTemporal.activo"
            label="Tipo activo"
            color="positive"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarFormulario" />
          <q-btn 
            color="primary"
            :label="tipoEditando ? 'Guardar Cambios' : 'Crear Tipo'"
            @click="guardarTipo"
            :loading="guardando"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import inventarioService, { TipoProducto } from 'src/services/inventario.service';

const $q = useQuasar();

const tipos = ref<TipoProducto[]>([]);
const filtro = ref('');
const cargando = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const tipoEditando = ref<TipoProducto | null>(null);

const tipoTemporal = ref<Partial<TipoProducto>>({
  nombre: '',
  descripcion: '',
  requiereFraccionamiento: false,
  activo: true
});

const tiposFiltrados = computed(() => {
  if (!filtro.value) return tipos.value;
  const busqueda = filtro.value.toLowerCase();
  return tipos.value.filter(t => 
    t.nombre.toLowerCase().includes(busqueda) ||
    t.descripcion?.toLowerCase().includes(busqueda)
  );
});

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' as const },
  { name: 'requiereFraccionamiento', label: 'Fraccionamiento', field: 'requiereFraccionamiento', align: 'center' as const },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const }
];

const paginacion = ref({ rowsPerPage: 10 });

const cargarTipos = async () => {
  cargando.value = true;
  try {
    const response = await inventarioService.tipos.getAll();
    tipos.value = response.data;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar tipos' });
  } finally {
    cargando.value = false;
  }
};

const abrirFormulario = (tipo?: TipoProducto) => {
  if (tipo) {
    tipoEditando.value = tipo;
    tipoTemporal.value = { ...tipo };
  } else {
    tipoEditando.value = null;
    tipoTemporal.value = {
      nombre: '',
      descripcion: '',
      requiereFraccionamiento: false,
      activo: true
    };
  }
  mostrarFormulario.value = true;
};

const editarTipo = (tipo: TipoProducto) => abrirFormulario(tipo);

const cancelarFormulario = () => {
  mostrarFormulario.value = false;
  tipoEditando.value = null;
};

const guardarTipo = async () => {
  if (!tipoTemporal.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es requerido' });
    return;
  }

  guardando.value = true;
  try {
    if (tipoEditando.value) {
      await inventarioService.tipos.update(tipoEditando.value.id, tipoTemporal.value);
      $q.notify({ type: 'positive', message: 'Tipo actualizado correctamente' });
    } else {
      await inventarioService.tipos.create(tipoTemporal.value);
      $q.notify({ type: 'positive', message: 'Tipo creado correctamente' });
    }
    await cargarTipos();
    cancelarFormulario();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar tipo' });
  } finally {
    guardando.value = false;
  }
};

const toggleEstado = async (tipo: TipoProducto) => {
  const accion = tipo.activo ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de ${accion} el tipo "${tipo.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inventarioService.tipos.update(tipo.id, { activo: !tipo.activo });
      $q.notify({ type: 'positive', message: `Tipo ${accion === 'desactivar' ? 'desactivado' : 'activado'}` });
      await cargarTipos();
    } catch (error) {
      $q.notify({ type: 'negative', message: `Error al ${accion} tipo` });
    }
  });
};

onMounted(() => cargarTipos());
</script>

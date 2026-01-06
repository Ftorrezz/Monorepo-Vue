<template>
  <q-page padding>
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="straighten" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Unidades de Medida</div>
            <div class="text-caption">Gestiona las unidades para medir productos</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            outlined
            dense
            placeholder="Buscar unidad..."
            class="col-12 col-md-4"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filtroTipo"
            :options="tiposDisponibles"
            label="Filtrar por tipo"
            outlined
            dense
            clearable
            class="col-12 col-md-3"
          />

          <q-space />

          <q-btn
            color="primary"
            icon="add"
            label="Nueva Unidad"
            @click="abrirFormulario()"
            unelevated
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="unidadesFiltradas"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :pagination="paginacion"
          dense
        >
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-badge :label="getTipoLabel(props.value)" />
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
              <q-btn flat dense round icon="edit" color="primary" @click="editarUnidad(props.row)">
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
            {{ unidadEditando ? 'Editar Unidad' : 'Nueva Unidad' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="unidadTemporal.nombre"
            label="Nombre *"
            outlined
            dense
            :rules="[val => !!val || 'El nombre es requerido']"
            maxlength="100"
            hint="Ej: Kilogramo, Litro, Pieza"
          />

          <q-input
            v-model="unidadTemporal.abreviacion"
            label="Abreviación *"
            outlined
            dense
            :rules="[val => !!val || 'La abreviación es requerida']"
            maxlength="10"
            hint="Ej: kg, L, pza"
          />

          <q-select
            v-model="unidadTemporal.tipo"
            :options="tiposDisponibles"
            label="Tipo *"
            outlined
            dense
            emit-value
            map-options
            :rules="[val => !!val || 'El tipo es requerido']"
          />

          <q-toggle
            v-if="unidadEditando"
            v-model="unidadTemporal.activo"
            label="Unidad activa"
            color="positive"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarFormulario" />
          <q-btn 
            color="primary"
            :label="unidadEditando ? 'Guardar Cambios' : 'Crear Unidad'"
            @click="guardarUnidad"
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
import inventarioService, { UnidadMedida } from 'src/services/inventario.service';

const $q = useQuasar();

const unidades = ref<UnidadMedida[]>([]);
const filtro = ref('');
const filtroTipo = ref<string | null>(null);
const cargando = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const unidadEditando = ref<UnidadMedida | null>(null);

const unidadTemporal = ref<Partial<UnidadMedida>>({
  nombre: '',
  abreviacion: '',
  tipo: 'unidad',
  activo: true
});

const tiposDisponibles = [
  { label: 'Masa (peso)', value: 'masa' },
  { label: 'Volumen', value: 'volumen' },
  { label: 'Unidad (contable)', value: 'unidad' }
];

const unidadesFiltradas = computed(() => {
  let resultado = unidades.value;
  
  if (filtro.value) {
    const busqueda = filtro.value.toLowerCase();
    resultado = resultado.filter(u => 
      u.nombre.toLowerCase().includes(busqueda) ||
      u.abreviacion.toLowerCase().includes(busqueda)
    );
  }
  
  if (filtroTipo.value) {
    resultado = resultado.filter(u => u.tipo === filtroTipo.value);
  }
  
  return resultado;
});

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'abreviacion', label: 'Abreviación', field: 'abreviacion', align: 'center' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' as const, sortable: true },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const }
];

const paginacion = ref({ rowsPerPage: 10 });

const getTipoLabel = (tipo: string) => {
  const t = tiposDisponibles.find(td => td.value === tipo);
  return t?.label || tipo;
};

const cargarUnidades = async () => {
  cargando.value = true;
  try {
    const response = await inventarioService.unidades.getAll();
    unidades.value = response.data;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar unidades' });
  } finally {
    cargando.value = false;
  }
};

const abrirFormulario = (unidad?: UnidadMedida) => {
  if (unidad) {
    unidadEditando.value = unidad;
    unidadTemporal.value = { ...unidad };
  } else {
    unidadEditando.value = null;
    unidadTemporal.value = {
      nombre: '',
      abreviacion: '',
      tipo: 'unidad',
      activo: true
    };
  }
  mostrarFormulario.value = true;
};

const editarUnidad = (unidad: UnidadMedida) => abrirFormulario(unidad);

const cancelarFormulario = () => {
  mostrarFormulario.value = false;
  unidadEditando.value = null;
};

const guardarUnidad = async () => {
  if (!unidadTemporal.value.nombre || !unidadTemporal.value.abreviacion || !unidadTemporal.value.tipo) {
    $q.notify({ type: 'warning', message: 'Todos los campos son requeridos' });
    return;
  }

  guardando.value = true;
  try {
    if (unidadEditando.value) {
      await inventarioService.unidades.update(unidadEditando.value.id, unidadTemporal.value);
      $q.notify({ type: 'positive', message: 'Unidad actualizada correctamente' });
    } else {
      await inventarioService.unidades.create(unidadTemporal.value);
      $q.notify({ type: 'positive', message: 'Unidad creada correctamente' });
    }
    await cargarUnidades();
    cancelarFormulario();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar unidad' });
  } finally {
    guardando.value = false;
  }
};

const toggleEstado = async (unidad: UnidadMedida) => {
  const accion = unidad.activo ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de ${accion} la unidad "${unidad.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inventarioService.unidades.update(unidad.id, { activo: !unidad.activo });
      $q.notify({ type: 'positive', message: `Unidad ${accion === 'desactivar' ? 'desactivada' : 'activada'}` });
      await cargarUnidades();
    } catch (error) {
      $q.notify({ type: 'negative', message: `Error al ${accion} unidad` });
    }
  });
};

onMounted(() => cargarUnidades());
</script>

<template>
  <q-page padding>
    <q-card>
      <!-- Header -->
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="category" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Categorías de Productos</div>
            <div class="text-caption">Gestiona las categorías para organizar el inventario</div>
          </div>
        </div>
      </q-card-section>

      <!-- Toolbar -->
      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            outlined
            dense
            placeholder="Buscar categoría..."
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
            label="Nueva Categoría"
            @click="abrirFormulario()"
            unelevated
          />
        </div>
      </q-card-section>

      <!-- Tabla -->
      <q-card-section>
        <q-table
          :rows="categoriasFiltradas"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :pagination="paginacion"
          dense
        >
          <template v-slot:body-cell-icono="props">
            <q-td :props="props">
              <q-icon v-if="props.value" :name="props.value" size="sm" />
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
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                @click="editarCategoria(props.row)"
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
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal Formulario -->
    <q-dialog v-model="mostrarFormulario" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="categoriaTemporal.nombre"
            label="Nombre *"
            outlined
            dense
            :rules="[val => !!val || 'El nombre es requerido']"
            maxlength="100"
          />

          <q-input
            v-model="categoriaTemporal.descripcion"
            label="Descripción"
            outlined
            dense
            type="textarea"
            rows="2"
            maxlength="500"
          />

          <q-input
            v-model="categoriaTemporal.icono"
            label="Icono (Material Icons)"
            outlined
            dense
            hint="Nombre del icono de Material Icons, ej: medication, pets, food_bank"
          >
            <template v-slot:append>
              <q-icon v-if="categoriaTemporal.icono" :name="categoriaTemporal.icono" />
            </template>
          </q-input>

          <q-toggle
            v-if="categoriaEditando"
            v-model="categoriaTemporal.activo"
            label="Categoría activa"
            color="positive"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarFormulario" />
          <q-btn 
            color="primary"
            :label="categoriaEditando ? 'Guardar Cambios' : 'Crear Categoría'"
            @click="guardarCategoria"
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
import inventarioService, { Categoria } from 'src/services/inventario.service';

// Quasar
const $q = useQuasar();

// Estados
const categorias = ref<Categoria[]>([]);
const filtro = ref('');
const cargando = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const categoriaEditando = ref<Categoria | null>(null);

const categoriaTemporal = ref<Partial<Categoria>>({
  nombre: '',
  descripcion: '',
  icono: '',
  activo: true
});

// Computed
const categoriasFiltradas = computed(() => {
  if (!filtro.value) return categorias.value;
  
  const busqueda = filtro.value.toLowerCase();
  return categorias.value.filter(c => 
    c.nombre.toLowerCase().includes(busqueda) ||
    c.descripcion?.toLowerCase().includes(busqueda)
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
    align: 'left' as const
  },
  {
    name: 'icono',
    label: 'Icono',
    field: 'icono',
    align: 'center' as const
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
const cargarCategorias = async () => {
  cargando.value = true;
  try {
    const response = await inventarioService.categorias.getAll();
    categorias.value = response.data;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar categorías',
      caption: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    cargando.value = false;
  }
};

const abrirFormulario = (categoria?: Categoria) => {
  if (categoria) {
    categoriaEditando.value = categoria;
    categoriaTemporal.value = { ...categoria };
  } else {
    categoriaEditando.value = null;
    categoriaTemporal.value = {
      nombre: '',
      descripcion: '',
      icono: '',
      activo: true
    };
  }
  mostrarFormulario.value = true;
};

const editarCategoria = (categoria: Categoria) => {
  abrirFormulario(categoria);
};

const cancelarFormulario = () => {
  mostrarFormulario.value = false;
  categoriaEditando.value = null;
};

const guardarCategoria = async () => {
  if (!categoriaTemporal.value.nombre) {
    $q.notify({
      type: 'warning',
      message: 'El nombre es requerido'
    });
    return;
  }

  guardando.value = true;
  try {
    if (categoriaEditando.value) {
      await inventarioService.categorias.update(
        categoriaEditando.value.id,
        categoriaTemporal.value
      );
      $q.notify({
        type: 'positive',
        message: 'Categoría actualizada correctamente'
      });
    } else {
      await inventarioService.categorias.create(categoriaTemporal.value);
      $q.notify({
        type: 'positive',
        message: 'Categoría creada correctamente'
      });
    }
    
    await cargarCategorias();
    cancelarFormulario();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar categoría',
      caption: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    guardando.value = false;
  }
};

const toggleEstado = async (categoria: Categoria) => {
  const accion = categoria.activo ? 'desactivar' : 'activar';
  
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de ${accion} la categoría "${categoria.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inventarioService.categorias.update(categoria.id, { activo: !categoria.activo });
      $q.notify({
        type: 'positive',
        message: `Categoría ${accion === 'desactivar' ? 'desactivada' : 'activada'} correctamente`
      });
      await cargarCategorias();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: `Error al ${accion} categoría`,
        caption: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
};

// Lifecycle
onMounted(() => {
  cargarCategorias();
});
</script>

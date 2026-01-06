<template>
  <q-page padding>
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="branding_watermark" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Marcas</div>
            <div class="text-caption">Gestiona las marcas de los productos</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            outlined
            dense
            placeholder="Buscar marca..."
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
            label="Nueva Marca"
            @click="abrirFormulario()"
            unelevated
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="marcasFiltradas"
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
              <q-btn flat dense round icon="edit" color="primary" @click="editarMarca(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              
              <q-btn
                flat dense round
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
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ marcaEditando ? 'Editar Marca' : 'Nueva Marca' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="marcaTemporal.nombre"
            label="Nombre de la Marca *"
            outlined dense
            :rules="[val => !!val || 'El nombre es requerido']"
          />
          <q-input
            v-model="marcaTemporal.descripcion"
            label="Descripción"
            outlined dense
            type="textarea"
            rows="2"
          />
          <q-toggle
            v-if="marcaEditando"
            v-model="marcaTemporal.activo"
            label="Marca activa"
            color="positive"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarFormulario" />
          <q-btn 
            color="primary"
            :label="marcaEditando ? 'Guardar Cambios' : 'Crear Marca'"
            @click="guardarMarca"
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
import { api } from 'boot/axios';

const $q = useQuasar();

// Estados
const marcas = ref<any[]>([]);
const filtro = ref('');
const cargando = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const marcaEditando = ref<any>(null);

const marcaTemporal = ref({
  nombre: '',
  descripcion: '',
  activo: true
});

// Computed
const marcasFiltradas = computed(() => {
  if (!filtro.value) return marcas.value;
  const b = filtro.value.toLowerCase();
  return marcas.value.filter(m => m.nombre.toLowerCase().includes(b));
});

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' as const },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const }
];

const paginacion = ref({ rowsPerPage: 15 });

// Métodos
const cargarMarcas = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get('/api/marcas');
    marcas.value = data;
  } catch (error) {
    // Si no existe el endpoint, usamos datos mock por ahora
    marcas.value = [
      { id: 1, nombre: 'Royal Canin', descripcion: 'Alimento premium', activo: true },
      { id: 2, nombre: 'Zoetis', descripcion: 'Medicamentos', activo: true }
    ];
  } finally {
    cargando.value = false;
  }
};

const abrirFormulario = (marca?: any) => {
  if (marca) {
    marcaEditando.value = marca;
    marcaTemporal.value = { ...marca };
  } else {
    marcaEditando.value = null;
    marcaTemporal.value = { nombre: '', descripcion: '', activo: true };
  }
  mostrarFormulario.value = true;
};

const editarMarca = (marca: any) => abrirFormulario(marca);

const cancelarFormulario = () => {
  mostrarFormulario.value = false;
  marcaEditando.value = null;
};

const guardarMarca = async () => {
  if (!marcaTemporal.value.nombre) return;
  guardando.value = true;
  try {
    if (marcaEditando.value) {
      await api.put(`/api/marcas/${marcaEditando.value.id}`, marcaTemporal.value);
    } else {
      await api.post('/api/marcas', marcaTemporal.value);
    }
    await cargarMarcas();
    cancelarFormulario();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar marca' });
  } finally {
    guardando.value = false;
  }
};

const toggleEstado = async (marca: any) => {
  try {
    await api.put(`/api/marcas/${marca.id}`, { ...marca, activo: !marca.activo });
    await cargarMarcas();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' });
  }
};

onMounted(() => cargarMarcas());
</script>

<template>
  <q-page padding>
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <q-icon name="inventory_2" size="md" class="q-mr-md"/>
          <div class="col">
            <div class="text-h6">Catálogo de Productos</div>
            <div class="text-caption">Define los productos que manejas en tu inventario</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="filtro"
            outlined
            dense
            placeholder="Buscar producto..."
            class="col-12 col-md-4"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filtroCategoria"
            :options="categorias"
            label="Categoría"
            outlined
            dense
            clearable
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            class="col-12 col-md-2"
          />

          <q-space />

          <q-btn
            color="primary"
            icon="add"
            label="Nuevo Producto"
            @click="abrirFormulario()"
            unelevated
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="productosFiltrados"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :pagination="paginacion"
          dense
        >
          <template v-slot:body-cell-categoria="props">
            <q-td :props="props">
              {{ props.row.categoria?.nombre || 'Sin categoría' }}
            </q-td>
          </template>

          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              {{ props.row.tipo?.nombre || 'Sin tipo' }}
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
              <q-btn flat dense round icon="edit" color="primary" @click="editarProducto(props.row)">
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
      <q-card style="min-width: 700px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ productoEditando ? 'Editar Producto' : 'Nuevo Producto' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="row q-gutter-md">
            <q-input
              v-model="productoTemporal.nombre"
              label="Nombre del Producto *"
              outlined dense
              class="col-12 col-md-8"
              :rules="[val => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="productoTemporal.codigo"
              label="Código / SKU"
              outlined dense
              class="col"
            />
          </div>

          <div class="row q-gutter-md">
            <q-select
              v-model="productoTemporal.categoriaId"
              :options="categorias"
              label="Categoría *"
              outlined dense
              class="col"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              :rules="[val => !!val || 'La categoría es requerida']"
            />
            <q-select
              v-model="productoTemporal.tipoId"
              :options="tipos"
              label="Tipo de Producto *"
              outlined dense
              class="col"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              :rules="[val => !!val || 'El tipo es requerido']"
            />
          </div>

          <div class="row q-gutter-md">
            <q-select
              v-model="productoTemporal.unidadMedidaId"
              :options="unidades"
              label="Unidad de Medida *"
              outlined dense
              class="col"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              :rules="[val => !!val || 'La unidad es requerida']"
            />
            <q-input
              v-model.number="productoTemporal.stockMinimo"
              label="Stock Mínimo *"
              outlined dense
              class="col"
              type="number"
              :rules="[val => val >= 0 || 'Mínimo 0']"
            />
            <q-input
              v-model.number="productoTemporal.precioVenta"
              label="Precio de Venta *"
              outlined dense
              class="col"
              type="number"
              prefix="$"
              :rules="[val => val >= 0 || 'Mínimo 0']"
            />
          </div>

          <q-input
            v-model="productoTemporal.descripcion"
            label="Descripción"
            outlined dense
            type="textarea"
            rows="2"
          />

          <div class="row items-center q-gutter-md">
            <q-toggle
              v-model="productoTemporal.manejoFraccionado"
              label="Manejo Fraccionado (Dosis)"
              color="primary"
            />
            <q-toggle
              v-if="productoEditando"
              v-model="productoTemporal.activo"
              label="Producto activo"
              color="positive"
            />
          </div>

          <div v-if="productoTemporal.manejoFraccionado" class="row q-gutter-md bg-grey-1 q-pa-sm rounded-borders">
            <q-input
              v-model.number="productoTemporal.contenidoPorEnvase"
              label="Contenido por Envase"
              outlined dense
              class="col"
              type="number"
            />
            <q-input
              v-model="productoTemporal.unidadEnvase"
              label="Unidad Envase (ej: ml, tab)"
              outlined dense
              class="col"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarFormulario" />
          <q-btn 
            color="primary"
            :label="productoEditando ? 'Guardar Cambios' : 'Crear Producto'"
            @click="guardarProducto"
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
import inventarioService, { Producto, Categoria, TipoProducto, UnidadMedida } from 'src/services/inventario.service';

const $q = useQuasar();

// Estados
const productos = ref<Producto[]>([]);
const categorias = ref<Categoria[]>([]);
const tipos = ref<TipoProducto[]>([]);
const unidades = ref<UnidadMedida[]>([]);

const filtro = ref('');
const filtroCategoria = ref<number | null>(null);
const cargando = ref(false);
const guardando = ref(false);
const mostrarFormulario = ref(false);
const productoEditando = ref<Producto | null>(null);

const productoTemporal = ref<Partial<Producto>>({
  nombre: '',
  descripcion: '',
  codigo: '',
  categoriaId: undefined,
  tipoId: undefined,
  unidadMedidaId: undefined,
  stockMinimo: 0,
  precioVenta: 0,
  manejoFraccionado: false,
  activo: true
});

// Computed
const productosFiltrados = computed(() => {
  let res = productos.value;
  
  if (filtro.value) {
    const b = filtro.value.toLowerCase();
    res = res.filter(p => p.nombre.toLowerCase().includes(b) || p.codigo?.toLowerCase().includes(b));
  }
  
  if (filtroCategoria.value) {
    res = res.filter(p => p.categoriaId === filtroCategoria.value);
  }
  
  return res;
});

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' as const },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' as const },
  { name: 'precioVenta', label: 'Precio Venta', field: 'precioVenta', align: 'right' as const, format: (val: number) => `$${val.toFixed(2)}` },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: '', align: 'center' as const }
];

const paginacion = ref({ rowsPerPage: 15 });

// Métodos
const cargarDatos = async () => {
  cargando.value = true;
  try {
    const [prodRes, catRes, tipoRes, uniRes] = await Promise.all([
      inventarioService.productos.getAll(),
      inventarioService.categorias.getActive(),
      inventarioService.tipos.getActive(),
      inventarioService.unidades.getActive()
    ]);
    
    productos.value = prodRes.data;
    categorias.value = catRes.data;
    tipos.value = tipoRes.data;
    unidades.value = uniRes.data;
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar datos del catálogo' });
  } finally {
    cargando.value = false;
  }
};

const abrirFormulario = (producto?: Producto) => {
  if (producto) {
    productoEditando.value = producto;
    productoTemporal.value = { ...producto };
  } else {
    productoEditando.value = null;
    productoTemporal.value = {
      nombre: '',
      descripcion: '',
      codigo: '',
      categoriaId: undefined,
      tipoId: undefined,
      unidadMedidaId: undefined,
      stockMinimo: 0,
      precioVenta: 0,
      manejoFraccionado: false,
      activo: true
    };
  }
  mostrarFormulario.value = true;
};

const editarProducto = (producto: Producto) => abrirFormulario(producto);

const cancelarFormulario = () => {
  mostrarFormulario.value = false;
  productoEditando.value = null;
};

const guardarProducto = async () => {
  if (!productoTemporal.value.nombre || !productoTemporal.value.categoriaId || !productoTemporal.value.tipoId) {
    $q.notify({ type: 'warning', message: 'Completa los campos obligatorios' });
    return;
  }

  guardando.value = true;
  try {
    if (productoEditando.value) {
      await inventarioService.productos.update(productoEditando.value.id, productoTemporal.value);
      $q.notify({ type: 'positive', message: 'Producto actualizado' });
    } else {
      await inventarioService.productos.create(productoTemporal.value);
      $q.notify({ type: 'positive', message: 'Producto creado' });
    }
    await cargarDatos();
    cancelarFormulario();
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al guardar producto' });
  } finally {
    guardando.value = false;
  }
};

const toggleEstado = async (producto: Producto) => {
  const accion = producto.activo ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar',
    message: `¿Seguro que quieres ${accion} "${producto.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inventarioService.productos.update(producto.id, { activo: !producto.activo });
      $q.notify({ type: 'positive', message: `Producto ${accion === 'desactivar' ? 'desactivado' : 'activado'}` });
      await cargarDatos();
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al cambiar estado' });
    }
  });
};

onMounted(() => cargarDatos());
</script>

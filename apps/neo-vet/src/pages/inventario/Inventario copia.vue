<template>
  <div class="inventario-container">
    <!-- Header principal -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="inventory_2" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Inventario y Farmacia</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticasGenerales.totalProductos }} productos • 
              {{ estadisticasGenerales.stockBajo }} con stock bajo • 
              {{ estadisticasGenerales.proximosVencer }} próximos a vencer
            </div>
          </div>
          <div class="col-auto">
            <div class="row q-gutter-sm">
              <q-btn 
                flat
                round
                icon="add_circle"
                @click="mostrarModalProducto = true"
                :disable="modoLectura"
              >
                <q-tooltip>Agregar Producto</q-tooltip>
              </q-btn>
              <q-btn 
                flat
                round
                icon="shopping_cart"
                @click="mostrarModalVenta = true"
                :disable="modoLectura"
              >
                <q-tooltip>Nueva Venta</q-tooltip>
              </q-btn>
              <q-btn 
                flat
                round
                icon="receipt_long"
                @click="verHistorialMovimientos"
              >
                <q-tooltip>Historial de Movimientos</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabs de navegación -->
    <q-card flat class="q-mb-sm">
      <q-tabs
        v-model="tabSeleccionada"
        dense
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="productos" icon="inventory_2" label="Inventario" />
        <q-tab name="proveedores" icon="local_shipping" label="Proveedores" />
        <q-tab name="movimientos" icon="history" label="Movimientos" />
      </q-tabs>
    </q-card>

    <q-tab-panels v-model="tabSeleccionada" animated class="bg-transparent">
      <!-- PANEL DE PRODUCTOS -->
      <q-tab-panel name="productos" class="q-pa-none">
        <!-- Filtros y estadísticas -->
        <q-card flat class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center q-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtroTexto"
              label="Buscar productos..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtroCategoria"
              :options="categoriasDisponibles"
              label="Categoría"
              outlined
              dense
              clearable
              option-label="label"
              option-value="value"
            />
          </div>
          
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtroTipo"
              :options="tiposDisponibles"
              label="Tipo"
              outlined
              dense
              clearable
              option-label="label"
              option-value="value"
            />
          </div>
          
          <div class="col-12 col-md-2">
            <q-select
              v-model="filtroEstado"
              :options="estadosStock"
              label="Estado Stock"
              outlined
              dense
              clearable
              option-label="label"
              option-value="value"
            />
          </div>

          <q-space />
          
          <!-- Tarjetas de estadísticas compactas -->
          <div class="col-auto">
            <div class="row q-gutter-xs">
              <q-chip 
                :color="estadisticasGenerales.stockBajo > 0 ? 'warning' : 'positive'"
                text-color="white"
                :label="`${estadisticasGenerales.stockBajo} Stock Bajo`"
                icon="trending_down"
                clickable
                @click="filtroEstado = 'stock_bajo'"
              />
              <q-chip 
                :color="estadisticasGenerales.proximosVencer > 0 ? 'deep-orange' : 'blue'"
                text-color="white"
                :label="`${estadisticasGenerales.proximosVencer} Por Vencer`"
                icon="event"
                clickable
                @click="filtroEstado = 'proximo_vencer'"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Grid de productos -->
    <div class="row q-col-gutter-md">
      <div 
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        v-for="producto in productosFiltrados"
        :key="producto.id"
      >
        <q-card 
          flat 
          :class="getCardClass(producto)"
          class="producto-card"
        >
          <!-- Header con nombre y estado -->
          <q-card-section class="q-pa-sm">
            <div class="row items-center justify-between no-wrap">
              <div class="col-grow">
                <div class="producto-nombre text-truncate">{{ producto.nombre }}</div>
                <div class="producto-categoria">
                  {{ getCategoriaLabel(producto.categoria) }} • {{ getTipoLabel(producto.tipo) }}
                </div>
              </div>
              <q-chip 
                dense
                square
                :color="getStockColor(producto)"
                text-color="white"
                :label="getStockLabel(producto)"
                size="sm"
              />
            </div>
          </q-card-section>

          <!-- Contenido principal -->
          <q-card-section class="info-container">
            <!-- Stock -->
            <div class="stock-info">
              <div class="text-caption text-grey-7">Stock Actual</div>
              <div class="stock-value">
                {{ producto.stockUnidades }} {{ producto.unidadMedida }}
                <q-icon 
                  :name="producto.tipo === 'medicamento' ? 'medical_services' : 'inventory'" 
                  size="xs" 
                  :color="getStockColor(producto)"
                />
              </div>
            </div>

            <!-- Precios en línea -->
            <div class="precios-container">
              <div class="precio-item">
                <div class="precio-label">Costo</div>
                <div class="precio-valor">${{ producto.costoUnitario?.toFixed(2) }}</div>
              </div>
              <div class="precio-item">
                <div class="precio-label">Venta</div>
                <div class="precio-valor">${{ producto.precioVenta?.toFixed(2) }}</div>
              </div>
              <div v-if="producto.manejoFraccionado" class="precio-item precio-dosis">
                <div class="precio-label">Por Dosis</div>
                <div class="precio-valor">
                  ${{ (producto.precioVenta / producto.dosisTotal)?.toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Chips de información adicional -->
            <div class="row q-gutter-x-xs" v-if="producto.lote || producto.fechaVencimiento">
              <q-chip 
                v-if="producto.lote"
                dense 
                outline 
                color="grey" 
                size="sm"
                icon="qr_code"
              >
                {{ producto.lote }}
              </q-chip>
              <q-chip 
                v-if="producto.fechaVencimiento"
                dense 
                outline 
                :color="isProximoVencer(producto.fechaVencimiento) ? 'deep-orange' : 'grey'"
                size="sm"
                icon="event"
              >
                {{ formatDate(producto.fechaVencimiento) }}
              </q-chip>
            </div>
          </q-card-section>

          <!-- Acciones -->
          <q-card-actions align="right" class="q-pa-sm" v-if="!modoLectura">
            <q-btn 
              flat 
              dense
              color="positive" 
              icon="add_shopping_cart"
              @click="iniciarVentaProducto(producto)"
              size="sm"
              :disable="producto.stockUnidades <= 0"
            >
              <q-tooltip>Vender Producto</q-tooltip>
            </q-btn>
            <q-space />
            <q-btn-dropdown flat dense round icon="more_vert" size="sm">
              <q-list dense>
                <q-item clickable @click="editarProducto(producto)">
                  <q-item-section avatar mini>
                    <q-icon name="edit" color="primary"/>
                  </q-item-section>
                  <q-item-section>Editar</q-item-section>
                </q-item>
                <q-item clickable @click="ajustarStock(producto)">
                  <q-item-section avatar mini>
                    <q-icon name="tune" color="blue"/>
                  </q-item-section>
                  <q-item-section>Ajustar Stock</q-item-section>
                </q-item>
                <q-item clickable @click="verMovimientos(producto)">
                  <q-item-section avatar mini>
                    <q-icon name="history" color="orange"/>
                  </q-item-section>
                  <q-item-section>Ver Historial</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="eliminarProducto(producto.id)">
                  <q-item-section avatar mini>
                    <q-icon name="delete" color="negative"/>
                  </q-item-section>
                  <q-item-section>Eliminar</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="productosFiltrados.length === 0" class="text-center q-py-xl">
      <q-icon name="inventory_2" size="64px" color="grey-4" class="q-mb-md"/>
      <div class="text-h6 text-grey-6 q-mb-sm">
        {{ filtroTexto || filtroCategoria || filtroTipo || filtroEstado ? 'No se encontraron productos' : 'No hay productos en el inventario' }}
      </div>
      <div class="text-body2 text-grey-5 q-mb-md">
        {{ filtroTexto || filtroCategoria || filtroTipo || filtroEstado ? 'Intenta cambiar los filtros de búsqueda' : 'Comienza agregando el primer producto' }}
      </div>
      <q-btn 
        v-if="!modoLectura && !filtroTexto && !filtroCategoria && !filtroTipo && !filtroEstado"
        color="primary" 
        icon="add" 
        label="Agregar Producto" 
        @click="mostrarModalProducto = true"
        unelevated
      />
    </div>

    <!-- Modal para agregar/editar producto -->
    <q-dialog v-model="mostrarModalProducto" persistent maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ productoEditando ? 'Editar Producto' : 'Nuevo Producto' }}
          </div>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="cancelarProducto"
            class="absolute-top-right q-ma-sm"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Información básica -->
            <div class="col-12">
              <div class="text-h6 text-primary q-mb-md">Información Básica</div>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="productoTemporal.nombre"
                label="Nombre del Producto *"
                outlined
                dense
                :rules="[val => !!val || 'El nombre es requerido']"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-select
                v-model="productoTemporal.categoria"
                :options="categoriasDisponibles"
                label="Categoría *"
                outlined
                dense
                option-label="label"
                option-value="value"
                :rules="[val => !!val || 'La categoría es requerida']"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-select
                v-model="productoTemporal.tipo"
                :options="tiposDisponibles"
                label="Tipo *"
                outlined
                dense
                option-label="label"
                option-value="value"
                :rules="[val => !!val || 'El tipo es requerido']"
              />
            </div>
            
            <div class="col-12">
              <q-input
                v-model="productoTemporal.descripcion"
                label="Descripción"
                outlined
                dense
                type="textarea"
                rows="2"
              />
            </div>

            <!-- Información de stock -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Información de Stock</div>
            </div>
            
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="productoTemporal.stockUnidades"
                label="Stock Actual *"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="productoTemporal.stockMinimo"
                label="Stock Mínimo *"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-input
                v-model="productoTemporal.unidadMedida"
                label="Unidad de Medida *"
                outlined
                dense
                placeholder="ej: piezas, ml, gr, kg"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-input
                v-model="productoTemporal.ubicacion"
                label="Ubicación"
                outlined
                dense
                placeholder="ej: Estante A1, Refrigerador"
              />
            </div>

            <!-- Manejo fraccionado (solo para medicamentos) -->
            <div class="col-12" v-if="productoTemporal.tipo === 'medicamento'">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Manejo por Dosis</div>
              <q-toggle
                v-model="productoTemporal.manejoFraccionado"
                label="¿Este medicamento se administra por dosis individuales?"
                color="primary"
              />
            </div>
            
            <div v-if="productoTemporal.tipo === 'medicamento' && productoTemporal.manejoFraccionado" class="col-12">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input
                    v-model.number="productoTemporal.contenidoPorEnvase"
                    label="Contenido por Envase *"
                    outlined
                    dense
                    type="number"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="productoTemporal.unidadEnvase"
                    label="Unidad del Envase *"
                    outlined
                    dense
                    placeholder="ej: ml, mg, gr"
                  />
                </div>
                
                <div class="col-12 col-md-3">
                  <q-input
                    v-model.number="productoTemporal.dosisPorAplicacion"
                    label="Dosis por Aplicación *"
                    outlined
                    dense
                    type="number"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="productoTemporal.unidadDosis"
                    label="Unidad de Dosis *"
                    outlined
                    dense
                    placeholder="ej: ml, mg, gr"
                  />
                </div>
              </div>
            </div>

            <!-- Información de precios -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Precios</div>
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="productoTemporal.costoUnitario"
                label="Costo Unitario *"
                outlined
                dense
                type="number"
                min="0"
                step="0.01"
                prefix="$"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="productoTemporal.precioVenta"
                label="Precio de Venta *"
                outlined
                dense
                type="number"
                min="0"
                step="0.01"
                prefix="$"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                :model-value="calcularMargenGanancia()"
                label="Margen de Ganancia"
                outlined
                dense
                readonly
                suffix="%"
              />
            </div>

            <!-- Información adicional -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Información Adicional</div>
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="productoTemporal.lote"
                label="Lote"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="productoTemporal.fechaVencimiento"
                label="Fecha de Vencimiento"
                outlined
                dense
                type="date"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="productoTemporal.proveedor"
                label="Proveedor"
                outlined
                dense
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarAjusteStock"/>
          <q-btn 
            color="blue"
            label="Confirmar Ajuste" 
            @click="confirmarAjusteStock"
            :disable="!ajusteStock.cantidad || !ajusteStock.motivo"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para historial de movimientos -->
    <q-dialog v-model="mostrarModalHistorial" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Historial de Movimientos</div>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="mostrarModalHistorial = false"
            class="absolute-top-right q-ma-sm"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-table
            :rows="historialMovimientos"
            :columns="columnasHistorial"
            row-key="id"
            :pagination="paginacionHistorial"
            :filter="filtroHistorial"
            binary-state-sort
            dense
          >
            <template v-slot:top>
              <div class="row full-width items-center q-gutter-md">
                <q-input
                  v-model="filtroHistorial"
                  debounce="300"
                  placeholder="Buscar en historial..."
                  class="col-12 col-md-4"
                  outlined
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
                
                <q-select
                  v-model="filtroTipoMovimiento"
                  :options="tiposMovimiento"
                  label="Tipo de Movimiento"
                  outlined
                  dense
                  clearable
                  class="col-12 col-md-3"
                  option-label="label"
                  option-value="value"
                />
                
                <q-input
                  v-model="filtroFechaDesde"
                  label="Desde"
                  outlined
                  dense
                  type="date"
                  class="col-12 col-md-2"
                />
                
                <q-input
                  v-model="filtroFechaHasta"
                  label="Hasta"
                  outlined
                  dense
                  type="date"
                  class="col-12 col-md-2"
                />
              </div>
            </template>

            <template v-slot:body-cell-tipo="props">
              <q-td :props="props">
                <q-chip 
                  :color="getTipoMovimientoColor(props.value)"
                  text-color="white"
                  :label="getTipoMovimientoLabel(props.value)"
                  size="sm"
                  dense
                />
              </q-td>
            </template>

            <template v-slot:body-cell-cantidad="props">
              <q-td :props="props">
                <span :class="props.row.tipo === 'salida' || props.row.tipo === 'ajuste_negativo' ? 'text-negative' : 'text-positive'">
                  {{ props.row.tipo === 'salida' || props.row.tipo === 'ajuste_negativo' ? '-' : '+' }}{{ props.value }}
                </span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
      </q-tab-panel>

    <!-- PANEL DE PROVEEDORES -->
    <q-tab-panel name="proveedores" class="q-pa-none">
      <q-card flat class="q-mb-md">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="filtroProveedor" label="Buscar proveedor..." outlined dense clearable>
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <q-space />
            <q-btn color="primary" icon="add" label="Nuevo Proveedor" @click="mostrarModalProveedor = true" unelevated />
          </div>
        </q-card-section>
      </q-card>

      <q-table
        :rows="proveedoresFiltrados"
        :columns="columnasProveedores"
        row-key="id"
        flat
        bordered
        :loading="cargando"
      >
        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-chip :color="props.value ? 'positive' : 'grey'" text-color="white" dense>
              {{ props.value ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-right q-gutter-xs">
            <q-btn flat round dense color="primary" icon="edit" @click="editarProveedor(props.row)" />
            <q-btn flat round dense color="negative" icon="delete" @click="eliminarProveedor(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="movimientos" class="q-pa-none">
      <q-card flat class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Historial de Movimientos</div>
          <div class="text-caption">Registro de todas las entradas, salidas y ventas</div>
        </q-card-section>
      </q-card>
      
      <q-table
        :rows="historialMovimientos"
        :columns="columnasHistorial"
        row-key="id"
        flat
        bordered
        dense
        :loading="cargando"
      >
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip 
              :color="getTipoMovimientoColor(props.value)"
              text-color="white"
              :label="getTipoMovimientoLabel(props.value)"
              size="sm"
              dense
            />
          </q-td>
        </template>
      </q-table>
    </q-tab-panel>
    </q-tab-panels>

    <!-- Modal para Proveedor -->
    <q-dialog v-model="mostrarModalProveedor" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="proveedorTemporal.nombre" label="Nombre *" outlined dense />
          <q-input v-model="proveedorTemporal.razonSocial" label="Razón Social" outlined dense />
          <q-input v-model="proveedorTemporal.rfc" label="RFC" outlined dense />
          <q-input v-model="proveedorTemporal.telefono" label="Teléfono" outlined dense />
          <q-input v-model="proveedorTemporal.email" label="Email" outlined dense />
          <q-input v-model="proveedorTemporal.contacto" label="Persona de Contacto" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarProveedor" unelevated />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="cargando">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import inventarioService from 'src/services/inventario.service'

const $q = useQuasar()

// Props
const props = defineProps({
  modoLectura: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['inventario-actualizado', 'venta-procesada', 'movimiento-registrado'])

// Estados de navegación
const tabSeleccionada = ref('productos')

// Estados principales poblados desde API
const productos = ref([])
const proveedores = ref([])
const lotes = ref([])
const ubicaciones = ref([])
const categorias = ref([])
const tiposProducto = ref([])
const unidadesMedida = ref([])

const configuracionInventario = ref({
  diasAlertaVencimiento: 30,
  monedaLocal: 'MXN'
})

// Estados de carga
const cargando = ref(false)

// Estados de modales
const mostrarModalProducto = ref(false)
const mostrarModalProveedor = ref(false)
const mostrarModalLote = ref(false)
const mostrarModalVenta = ref(false)
const mostrarModalAjusteStock = ref(false)
const mostrarModalHistorial = ref(false)
const productoEditando = ref(null)
const proveedorEditando = ref(null)
const loteEditando = ref(null)
const productoParaAjustar = ref(null)

// Estados de filtros
const filtroTexto = ref('')
const filtroCategoria = ref('')
const filtroTipo = ref('')
const filtroEstado = ref('')
const filtroProveedor = ref('')
const filtroHistorial = ref('')
const filtroTipoMovimiento = ref('')
const filtroFechaDesde = ref('')
const filtroFechaHasta = ref('')

// Estados temporales para formularios
const productoTemporal = ref({
  id: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  tipo: '',
  stockUnidades: 0,
  stockMinimo: 0,
  unidadMedida: '',
  ubicacion: '',
  costoUnitario: 0,
  precioVenta: 0,
  lote: '',
  fechaVencimiento: '',
  proveedor: '',
  manejoFraccionado: false,
  contenidoPorEnvase: 0,
  unidadEnvase: '',
  dosisPorAplicacion: 0,
  unidadDosis: '',
  fechaCreacion: '',
  activo: true
})

const ventaTemporal = ref({
  id: '',
  cliente: '',
  paciente: null,
  productos: [],
  total: 0,
  fecha: '',
  usuario: 'Usuario Actual'
})

const ajusteStock = ref({
  tipo: '',
  cantidad: 0,
  motivo: '',
  usuario: 'Usuario Actual'
})

// Estados para la venta
const productoParaAgregar = ref(null)
const cantidadParaAgregar = ref(1)
const tipoVentaSeleccionado = ref('completo')
const productosDisponiblesParaVenta = ref([])

// Historial de movimientos
const movimientos = ref([])

// Estados temporales para proveedores
const proveedorTemporal = ref({
  id: null,
  nombre: '',
  razonSocial: '',
  rfc: '',
  telefono: '',
  email: '',
  direccion: '',
  contacto: '',
  notas: '',
  activo: true
})

// Estados temporales para lotes
const loteTemporal = ref({
  id: null,
  productoId: null,
  proveedorId: null,
  numeroLote: '',
  fechaVencimiento: '',
  fechaIngreso: new Date().toISOString().substr(0, 10),
  cantidad: 0,
  cantidadDisponible: 0,
  costoUnitario: 0,
  ubicacionId: null,
  activo: true
})

// Opciones para selects
const categoriasDisponibles = [
  { label: 'Medicamentos', value: 'medicamentos' },
  { label: 'Alimentos', value: 'alimentos' },
  { label: 'Suplementos', value: 'suplementos' },
  { label: 'Accesorios', value: 'accesorios' },
  { label: 'Higiene', value: 'higiene' },
  { label: 'Juguetes', value: 'juguetes' },
  { label: 'Otros', value: 'otros' }
]

const tiposDisponibles = [
  { label: 'Medicamento', value: 'medicamento' },
  { label: 'Alimento', value: 'alimento' },
  { label: 'Producto', value: 'producto' }
]

const estadosStock = [
  { label: 'Stock Normal', value: 'normal' },
  { label: 'Stock Bajo', value: 'stock_bajo' },
  { label: 'Sin Stock', value: 'sin_stock' },
  { label: 'Próximo a Vencer', value: 'proximo_vencer' }
]

const tiposAjuste = [
  { label: 'Entrada (Compra)', value: 'entrada' },
  { label: 'Salida (Pérdida/Daño)', value: 'salida' },
  { label: 'Ajuste Positivo', value: 'ajuste_positivo' },
  { label: 'Ajuste Negativo', value: 'ajuste_negativo' }
]

const tiposMovimiento = [
  { label: 'Entrada', value: 'entrada' },
  { label: 'Salida', value: 'salida' },
  { label: 'Venta', value: 'venta' },
  { label: 'Ajuste Positivo', value: 'ajuste_positivo' },
  { label: 'Ajuste Negativo', value: 'ajuste_negativo' }
]

// Pacientes disponibles (esto vendría de otro módulo)
const pacientesDisponibles = ref([
  { id: 1, nombre: 'Max - Perro Golden' },
  { id: 2, nombre: 'Luna - Gata Persa' },
  { id: 3, nombre: 'Rocky - Perro Bulldog' }
])

const columnasProveedores = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'contacto', label: 'Contacto', field: 'contacto', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'right' }
]

// Computed properties
const productosFiltrados = computed(() => {
  let listado = productos.value.filter(p => p.activo)
  
  if (filtroTexto.value) {
    const texto = filtroTexto.value.toLowerCase()
    listado = listado.filter(p => 
      p.nombre.toLowerCase().includes(texto) ||
      p.descripcion?.toLowerCase().includes(texto) ||
      p.codigo?.toLowerCase().includes(texto)
    )
  }
  
  if (filtroCategoria.value) {
    listado = listado.filter(p => p.categoriaId === filtroCategoria.value.value)
  }
  
  if (filtroTipo.value) {
    listado = listado.filter(p => p.tipoId === filtroTipo.value.value)
  }
  
  if (filtroEstado.value) {
    listado = listado.filter(p => {
      const estadoProducto = getEstadoStock(p)
      return estadoProducto === filtroEstado.value.value
    })
  }
  
  return listado
})

const estadisticasGenerales = computed(() => {
  const activos = productos.value.filter(p => p.activo)
  
  return {
    totalProductos: activos.length,
    stockBajo: activos.filter(p => getEstadoStock(p) === 'stock_bajo').length,
    sinStock: activos.filter(p => getEstadoStock(p) === 'sin_stock').length,
    proximosVencer: activos.filter(p => getEstadoStock(p) === 'proximo_vencer').length,
    valorTotal: activos.reduce((acc, p) => acc + ((p.stockActual || 0) * (p.costoPromedio || 0)), 0)
  }
})

const proveedoresFiltrados = computed(() => {
  if (!filtroProveedor.value) return proveedores.value
  const texto = filtroProveedor.value.toLowerCase()
  return proveedores.value.filter(p => 
    p.nombre.toLowerCase().includes(texto) || 
    p.contacto?.toLowerCase().includes(texto) ||
    p.rfc?.toLowerCase().includes(texto)
  )
})

const historialMovimientos = computed(() => {
  let movimientosFiltrados = [...movimientos.value]
  
  if (filtroHistorial.value) {
    const texto = filtroHistorial.value.toLowerCase()
    movimientosFiltrados = movimientosFiltrados.filter(m => 
      m.producto.toLowerCase().includes(texto) ||
      m.motivo?.toLowerCase().includes(texto) ||
      m.usuario?.toLowerCase().includes(texto)
    )
  }
  
  if (filtroTipoMovimiento.value) {
    movimientosFiltrados = movimientosFiltrados.filter(m => m.tipo === filtroTipoMovimiento.value.value)
  }
  
  if (filtroFechaDesde.value) {
    movimientosFiltrados = movimientosFiltrados.filter(m => 
      new Date(m.fecha) >= new Date(filtroFechaDesde.value)
    )
  }
  
  if (filtroFechaHasta.value) {
    movimientosFiltrados = movimientosFiltrados.filter(m => 
      new Date(m.fecha) <= new Date(filtroFechaHasta.value + 'T23:59:59')
    )
  }
  
  return movimientosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

// Columnas para las tablas
const columnasVenta = [
  {
    name: 'producto',
    label: 'Producto',
    field: 'nombre',
    align: 'left'
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipoVenta',
    align: 'center',
    format: val => val === 'completo' ? 'Completo' : 'Por Dosis'
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: row => `${row.cantidad} ${row.tipoVenta === 'completo' ? row.unidadMedida : 'dosis'}`,
    align: 'center'
  },
  {
    name: 'precio',
    label: 'Precio Unit.',
    field: 'precioUnitario',
    align: 'right',
    format: val => `${val?.toFixed(2)}`
  },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
    format: val => `${val?.toFixed(2)}`
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: '',
    align: 'center'
  }
]

const columnasHistorial = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true,
    format: val => formatDateTime(val)
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'center'
  },
  {
    name: 'producto',
    label: 'Producto',
    field: 'producto',
    align: 'left',
    sortable: true
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'center'
  },
  {
    name: 'motivo',
    label: 'Motivo',
    field: 'motivo',
    align: 'left'
  },
  {
    name: 'usuario',
    label: 'Usuario',
    field: 'usuario',
    align: 'left'
  }
]

const paginacionHistorial = ref({
  rowsPerPage: 15
})

// Métodos de utilidad
const formatDate = (fechaISO) => {
  if (!fechaISO) return ''
  return new Date(fechaISO).toLocaleDateString('es-MX')
}

const formatDateTime = (fechaISO) => {
  if (!fechaISO) return ''
  return new Date(fechaISO).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoriaLabel = (categoria) => {
  const cat = categoriasDisponibles.find(c => c.value === categoria)
  return cat?.label || categoria
}

const getTipoLabel = (tipo) => {
  const t = tiposDisponibles.find(t => t.value === tipo)
  return t?.label || tipo
}

const getEstadoStock = (producto) => {
  if (producto.stockUnidades <= 0) return 'sin_stock'
  if (producto.stockUnidades <= producto.stockMinimo) return 'stock_bajo'
  if (producto.fechaVencimiento && isProximoVencer(producto.fechaVencimiento)) return 'proximo_vencer'
  return 'normal'
}

const getStockColor = (producto) => {
  const estado = getEstadoStock(producto)
  const colores = {
    'normal': 'positive',
    'stock_bajo': 'warning',
    'sin_stock': 'negative',
    'proximo_vencer': 'deep-orange'
  }
  return colores[estado]
}

const getStockLabel = (producto) => {
  const estado = getEstadoStock(producto)
  const labels = {
    'normal': 'Normal',
    'stock_bajo': 'Stock Bajo',
    'sin_stock': 'Sin Stock',
    'proximo_vencer': 'Por Vencer'
  }
  return labels[estado]
}

const getCardClass = (producto) => {
  const estado = getEstadoStock(producto)
  return {
    'producto-card': true,
    [`border-${getStockColor(producto)}`]: true
  }
}

const isProximoVencer = (fechaVencimiento) => {
  if (!fechaVencimiento) return false
  const fecha = new Date(fechaVencimiento)
  const ahora = new Date()
  const diffDias = Math.floor((fecha - ahora) / (1000 * 60 * 60 * 24))
  return diffDias <= configuracionInventario.value.diasAlertaVencimiento && diffDias >= 0
}

const calcularDosisDisponibles = (producto) => {
  if (!producto.manejoFraccionado) return 0
  const totalContenido = producto.stockUnidades * producto.contenidoPorEnvase
  return Math.floor(totalContenido / producto.dosisPorAplicacion)
}

const calcularMargenGanancia = () => {
  if (!productoTemporal.value.costoUnitario || !productoTemporal.value.precioVenta) return '0'
  const margen = ((productoTemporal.value.precioVenta - productoTemporal.value.costoUnitario) / productoTemporal.value.costoUnitario) * 100
  return margen.toFixed(2)
}

const getTipoMovimientoColor = (tipo) => {
  const colores = {
    'entrada': 'positive',
    'salida': 'negative',
    'venta': 'blue',
    'ajuste_positivo': 'teal',
    'ajuste_negativo': 'deep-orange'
  }
  return colores[tipo] || 'grey'
}

const getTipoMovimientoLabel = (tipo) => {
  const movimiento = tiposMovimiento.find(t => t.value === tipo)
  return movimiento?.label || tipo
}

// Métodos para productos
const editarProducto = (producto) => {
  productoEditando.value = producto
  productoTemporal.value = { ...producto }
  // Calcular propiedades derivadas para medicamentos fraccionados
  if (producto.manejoFraccionado) {
    productoTemporal.value.dosisTotal = Math.floor(
      (producto.contenidoPorEnvase || 0) / (producto.dosisPorAplicacion || 1)
    )
  }
  mostrarModalProducto.value = true
}

const guardarProducto = async () => {
  if (!validarProducto()) return
  
  cargando.value = true
  try {
    const payload = { ...productoTemporal.value }
    // Mapear campos si es necesario
    payload.categoriaId = payload.categoria?.value || payload.categoriaId
    payload.tipoId = payload.tipo?.value || payload.tipoId
    
    if (productoEditando.value) {
      await inventarioService.productos.update(productoEditando.value.id, payload)
      $q.notify({ color: 'positive', message: 'Producto actualizado con éxito' })
    } else {
      await inventarioService.productos.create(payload)
      $q.notify({ color: 'positive', message: 'Producto creado con éxito' })
    }
    
    await cargarDatos()
    mostrarModalProducto.value = false
    productoEditando.value = null
    limpiarProductoTemporal()
  } catch (error) {
    console.error('Error al guardar producto:', error)
    $q.notify({ color: 'negative', message: 'Error al procesar la solicitud' })
  } finally {
    cargando.value = false
  }
}

const validarProducto = () => {
  if (!productoTemporal.value.nombre || !productoTemporal.value.categoria || !productoTemporal.value.tipo) {
    return false
  }
  
  if (productoTemporal.value.manejoFraccionado) {
    if (!productoTemporal.value.contenidoPorEnvase || !productoTemporal.value.dosisPorAplicacion) {
      return false
    }
  }
  
  return true
}

const cancelarProducto = () => {
  mostrarModalProducto.value = false
  productoEditando.value = null
  limpiarProductoTemporal()
}

const limpiarProductoTemporal = () => {
  productoTemporal.value = {
    id: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo: '',
    stockUnidades: 0,
    stockMinimo: 0,
    unidadMedida: '',
    ubicacion: '',
    costoUnitario: 0,
    precioVenta: 0,
    lote: '',
    fechaVencimiento: '',
    proveedor: '',
    manejoFraccionado: false,
    contenidoPorEnvase: 0,
    unidadEnvase: '',
    dosisPorAplicacion: 0,
    unidadDosis: '',
    fechaCreacion: '',
    activo: true
  }
}

const eliminarProducto = (productoId) => {
  const producto = inventario.value.productos.find(p => p.id === productoId)
  if (producto) {
    producto.activo = false
    registrarMovimiento({
      tipo: 'salida',
      productoId: producto.id,
      producto: producto.nombre,
      cantidad: producto.stockUnidades,
      motivo: 'Producto eliminado del inventario',
      stockAnterior: producto.stockUnidades,
      stockNuevo: 0
    })
    producto.stockUnidades = 0
    guardarDatos()
  }
}

// Métodos para ventas
const filtrarProductosVenta = (val, update) => {
  update(() => {
    const productos = inventario.value.productos.filter(p => 
      p.activo && 
      p.stockUnidades > 0 && 
      p.nombre.toLowerCase().includes(val.toLowerCase())
    )
    productosDisponiblesParaVenta.value = productos
  })
}

const iniciarVentaProducto = (producto) => {
  ventaTemporal.value = {
    id: '',
    cliente: '',
    paciente: null,
    productos: [],
    total: 0,
    fecha: new Date().toISOString(),
    usuario: 'Usuario Actual'
  }
  
  productoParaAgregar.value = producto
  cantidadParaAgregar.value = 1
  tipoVentaSeleccionado.value = 'completo'
  
  mostrarModalVenta.value = true
}

const getTiposVentaDisponibles = () => {
  if (!productoParaAgregar.value) return []
  
  const tipos = [{ label: 'Producto Completo', value: 'completo' }]
  
  if (productoParaAgregar.value.manejoFraccionado) {
    tipos.push({ label: 'Por Dosis', value: 'dosis' })
  }
  
  return tipos
}

const getLabelCantidad = () => {
  if (!productoParaAgregar.value) return 'Cantidad'
  
  if (tipoVentaSeleccionado.value === 'dosis') {
    return 'Número de Dosis'
  }
  
  return `Cantidad (${productoParaAgregar.value.unidadMedida})`
}

const getMaximoCantidad = () => {
  if (!productoParaAgregar.value) return 1
  
  if (tipoVentaSeleccionado.value === 'dosis') {
    return calcularDosisDisponibles(productoParaAgregar.value)
  }
  
  return productoParaAgregar.value.stockUnidades
}

const calcularPrecioLinea = () => {
  if (!productoParaAgregar.value || !cantidadParaAgregar.value) return '0.00'
  
  let precioUnitario = productoParaAgregar.value.precioVenta
  
  if (tipoVentaSeleccionado.value === 'dosis' && productoParaAgregar.value.manejoFraccionado) {
    precioUnitario = productoParaAgregar.value.precioVenta / productoParaAgregar.value.dosisTotal
  }
  
  return (precioUnitario * cantidadParaAgregar.value).toFixed(2)
}

const puedeAgregarProducto = () => {
  return productoParaAgregar.value && 
         cantidadParaAgregar.value > 0 && 
         cantidadParaAgregar.value <= getMaximoCantidad()
}

const agregarProductoAVenta = () => {
  if (!puedeAgregarProducto()) return
  
  let precioUnitario = productoParaAgregar.value.precioVenta
  let unidadVenta = productoParaAgregar.value.unidadMedida
  
  if (tipoVentaSeleccionado.value === 'dosis') {
    precioUnitario = productoParaAgregar.value.precioVenta / productoParaAgregar.value.dosisTotal
    unidadVenta = 'dosis'
  }
  
  const productoVenta = {
    id: `venta_${Date.now()}`,
    productoId: productoParaAgregar.value.id,
    nombre: productoParaAgregar.value.nombre,
    tipoVenta: tipoVentaSeleccionado.value,
    cantidad: cantidadParaAgregar.value,
    unidadMedida: unidadVenta,
    precioUnitario: precioUnitario,
    subtotal: precioUnitario * cantidadParaAgregar.value
  }
  
  ventaTemporal.value.productos.push(productoVenta)
  calcularTotalVenta()
  
  // Limpiar selección
  productoParaAgregar.value = null
  cantidadParaAgregar.value = 1
  tipoVentaSeleccionado.value = 'completo'
}

const removerProductoDeVenta = (index) => {
  ventaTemporal.value.productos.splice(index, 1)
  calcularTotalVenta()
}

const calcularTotalVenta = () => {
  ventaTemporal.value.total = ventaTemporal.value.productos.reduce(
    (acc, producto) => acc + producto.subtotal, 0
  )
}

const procesarVenta = () => {
  if (ventaTemporal.value.productos.length === 0) return
  
  // Procesar cada producto vendido
  ventaTemporal.value.productos.forEach(productoVenta => {
    const producto = inventario.value.productos.find(p => p.id === productoVenta.productoId)
    if (!producto) return
    
    let cantidadDescontar = 0
    
    if (productoVenta.tipoVenta === 'dosis') {
      // Calcular cuántas unidades completas se necesitan para las dosis
      const dosisRequeridas = productoVenta.cantidad
      const unidadesNecesarias = Math.ceil(dosisRequeridas * producto.dosisPorAplicacion / producto.contenidoPorEnvase)
      cantidadDescontar = unidadesNecesarias
    } else {
      cantidadDescontar = productoVenta.cantidad
    }
    
    const stockAnterior = producto.stockUnidades
    producto.stockUnidades = Math.max(0, producto.stockUnidades - cantidadDescontar)
    
    // Registrar movimiento de venta
    registrarMovimiento({
      tipo: 'venta',
      productoId: producto.id,
      producto: producto.nombre,
      cantidad: cantidadDescontar,
      motivo: `Venta a ${ventaTemporal.value.cliente || 'Cliente'} ${productoVenta.tipoVenta === 'dosis' ? `(${productoVenta.cantidad} dosis)` : ''}`,
      stockAnterior: stockAnterior,
      stockNuevo: producto.stockUnidades,
      cliente: ventaTemporal.value.cliente,
      paciente: ventaTemporal.value.paciente,
      precioVenta: productoVenta.subtotal
    })
  })
  
  // Generar ID de venta
  ventaTemporal.value.id = `venta_${Date.now()}`
  
  // Emitir evento de venta procesada
  emit('venta-procesada', { ...ventaTemporal.value })
  
  mostrarModalVenta.value = false
  limpiarVentaTemporal()
  guardarDatos()
}

const cancelarVenta = () => {
  mostrarModalVenta.value = false
  limpiarVentaTemporal()
}

const limpiarVentaTemporal = () => {
  ventaTemporal.value = {
    id: '',
    cliente: '',
    paciente: null,
    productos: [],
    total: 0,
    fecha: '',
    usuario: 'Usuario Actual'
  }
  productoParaAgregar.value = null
  cantidadParaAgregar.value = 1
  tipoVentaSeleccionado.value = 'completo'
}

// Métodos para ajustes de stock
const ajustarStock = (producto) => {
  productoParaAjustar.value = producto
  ajusteStock.value = {
    tipo: '',
    cantidad: 0,
    motivo: '',
    usuario: 'Usuario Actual'
  }
  mostrarModalAjusteStock.value = true
}

const confirmarAjusteStock = () => {
  if (!ajusteStock.value.cantidad || !ajusteStock.value.motivo) return
  
  const producto = productoParaAjustar.value
  const stockAnterior = producto.stockUnidades
  
  switch (ajusteStock.value.tipo) {
    case 'entrada':
      producto.stockUnidades += ajusteStock.value.cantidad
      break
    case 'salida':
      producto.stockUnidades = Math.max(0, producto.stockUnidades - ajusteStock.value.cantidad)
      break
    case 'ajuste_positivo':
      producto.stockUnidades += ajusteStock.value.cantidad
      break
    case 'ajuste_negativo':
      producto.stockUnidades = Math.max(0, producto.stockUnidades - ajusteStock.value.cantidad)
      break
  }
  
  // Registrar movimiento
  registrarMovimiento({
    tipo: ajusteStock.value.tipo,
    productoId: producto.id,
    producto: producto.nombre,
    cantidad: ajusteStock.value.cantidad,
    motivo: ajusteStock.value.motivo,
    stockAnterior: stockAnterior,
    stockNuevo: producto.stockUnidades
  })
  
  mostrarModalAjusteStock.value = false
  productoParaAjustar.value = null
  guardarDatos()
}

const cancelarAjusteStock = () => {
  mostrarModalAjusteStock.value = false
  productoParaAjustar.value = null
}

// Métodos para movimientos
const registrarMovimiento = (datosMovimiento) => {
  const movimiento = {
    id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fecha: new Date().toISOString(),
    ...datosMovimiento,
    usuario: datosMovimiento.usuario || 'Usuario Actual'
  }
  
  movimientos.value.push(movimiento)
  emit('movimiento-registrado', movimiento)
}

const verMovimientos = (producto) => {
  filtroHistorial.value = producto.nombre
  mostrarModalHistorial.value = true
}

// Métodos para proveedores
const editarProveedor = (proveedor) => {
  proveedorEditando.value = proveedor
  proveedorTemporal.value = { ...proveedor }
  mostrarModalProveedor.value = true
}

const guardarProveedor = async () => {
  if (!proveedorTemporal.value.nombre) return
  
  cargando.value = true
  try {
    if (proveedorEditando.value) {
      await inventarioService.proveedores.update(proveedorEditando.value.id, proveedorTemporal.value)
      $q.notify({ color: 'positive', message: 'Proveedor actualizado' })
    } else {
      await inventarioService.proveedores.create(proveedorTemporal.value)
      $q.notify({ color: 'positive', message: 'Proveedor creado' })
    }
    await cargarDatos()
    mostrarModalProveedor.value = false
    proveedorEditando.value = null
    limpiarProveedorTemporal()
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Error al guardar proveedor' })
  } finally {
    cargando.value = false
  }
}

const eliminarProveedor = async (id) => {
  $q.dialog({
    title: 'Eliminar Proveedor',
    message: '¿Estás seguro de que deseas eliminar este proveedor?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await inventarioService.proveedores.delete(id)
      $q.notify({ color: 'positive', message: 'Proveedor eliminado' })
      await cargarDatos()
    } catch (error) {
      $q.notify({ color: 'negative', message: 'Error al eliminar proveedor' })
    }
  })
}

const limpiarProveedorTemporal = () => {
  proveedorTemporal.value = {
    id: null,
    nombre: '',
    razonSocial: '',
    rfc: '',
    telefono: '',
    email: '',
    direccion: '',
    contacto: '',
    notas: '',
    activo: true
  }
}

const verHistorialMovimientos = () => {
  filtroHistorial.value = ''
  mostrarModalHistorial.value = true
}

// Métodos de persistencia
const cargarDatos = async () => {
  cargando.value = true
  try {
    const [
      resProd, 
      resProv, 
      resCat, 
      resTip, 
      resUni, 
      resUbi
    ] = await Promise.all([
      inventarioService.productos.getAll(),
      inventarioService.proveedores.getAll(),
      inventarioService.categorias.getAll(),
      inventarioService.tipos.getAll(),
      inventarioService.unidades.getAll(),
      inventarioService.ubicaciones.getActive()
    ])

    productos.value = resProd.data
    proveedores.value = resProv.data
    categorias.value = resCat.data
    tiposProducto.value = resTip.data
    unidadesMedida.value = resUni.data
    ubicaciones.value = resUbi.data

    // Si hay lotes por cargar para el producto seleccionado o general
    // resLotes = await inventarioService.lotes.getAll()
    // lotes.value = resLotes.data
    
  } catch (error) {
    console.error('Error al cargar datos de inventario:', error)
    $q.notify({
      color: 'negative',
      message: 'No se pudieron cargar los datos del inventario',
      icon: 'error'
    })
  } finally {
    cargando.value = false
  }
}

const guardarDatos = () => {
  // Ahora el guardado es individual por entidad, pero podemos emitir el estado actual
  emit('inventario-actualizado', {
    productos: productos.value,
    proveedores: proveedores.value
  })
}

// Inicialización al montar el componente
onMounted(() => {
  cargarDatos()
})

// Watcher de productos disponibles para venta
watch(productos, (nuevosProductos) => {
  productosDisponiblesParaVenta.value = nuevosProductos.filter(p => p.activo && p.stockUnidades > 0)
}, { deep: true })

// Exponer métodos públicos si es necesario
defineExpose({
  cargarDatos,
  guardarDatos,
  procesarVenta: (datosVenta) => {
    // Método para procesar ventas desde otros componentes
    ventaTemporal.value = datosVenta
    procesarVenta()
  },
  ajustarStockProducto: (productoId, ajuste) => {
    // Método para ajustar stock desde otros componentes
    const producto = productos.value.find(p => p.id === productoId)
    if (producto) {
      productoParaAjustar.value = producto
      ajusteStock.value = ajuste
      confirmarAjusteStock()
    }
  },
  obtenerProductoPorId: (productoId) => {
    return productos.value.find(p => p.id === productoId)
  },
  verificarDisponibilidad: (productoId, cantidad, tipoBusqueda = 'completo') => {
    const producto = productos.value.find(p => p.id === productoId)
    if (!producto) return false
    
    if (tipoBusqueda === 'dosis' && producto.manejoFraccionado) {
      return calcularDosisDisponibles(producto) >= cantidad
    }
    
    return producto.stockUnidades >= cantidad
  }
})
</script>

<style scoped>
/* Estilos del header */
.bg-gradient-primary {
  background: linear-gradient(145deg, #1976d2 0%, #2196f3 100%) !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
}

/* Ajustes del contenido del header */
.q-card.bg-gradient-primary .q-card-section {
  padding: 20px !important;
}

.text-h5 {
  font-size: 1.5rem !important;
  font-weight: 500 !important;
  color: white !important;
  margin: 0 !important;
  line-height: 1.2 !important;
}

.text-subtitle2 {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 0.875rem !important;
  margin-top: 4px !important;
}

/* Ajustes para los botones del header */
.q-btn.flat {
  color: white !important;
}

.q-btn.flat:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* Asegurar que los iconos sean visibles */
.q-icon {
  color: inherit !important;
}

/* Contenedor principal ajustado */
.inventario-container {
  padding: 16px;
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5; /* Agregar un fondo sutil */
}

/* Ajustes para el espaciado */
.q-mb-md {
  margin-bottom: 16px !important;
}

/* Estilos para las tarjetas de productos */
.producto-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: white;
}

.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Header de la tarjeta */
.producto-card .q-card-section:first-child {
  padding: 12px !important;
  border-bottom: 1px solid #f0f0f0;
}

/* Nombre del producto y categoría */
.producto-nombre {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
  color: #2c3e50;
  margin-bottom: 4px;
}

.producto-categoria {
  font-size: 0.75rem;
  color: #64748b;
}

/* Contenedor de información */
.info-container {
  padding: 12px !important;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Sección de stock */
.stock-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
}

.stock-value {
  font-weight: 600;
  color: #334155;
}

/* Sección de precios actualizada */
.precios-container {
  display: flex;
  gap: 8px;
  width: 100%;
}

.precio-item {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: #f1f5f9;
  min-width: 0; /* Para evitar desbordamiento */
}

.precio-dosis {
  background: #f0f9ff;
  border-left: 2px solid #e0f2fe;
}

.precio-label {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 2px;
  white-space: nowrap;
}

.precio-valor {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

/* Estilos para el precio por dosis */
.precio-dosis {
  margin-top: 4px;
  padding: 8px;
  border-radius: 6px;
  background: #f0f9ff;
}

/* Badges y chips */
.q-chip {
  font-size: 0.7rem;
  padding: 2px 6px;
}

/* Estados de borde según estado */
.border-positive { border-color: var(--q-positive) !important; }
.border-warning { border-color: var(--q-warning) !important; }
.border-negative { border-color: var(--q-negative) !important; }
.border-deep-orange { border-color: var(--q-deep-orange) !important; }

/* Footer de acciones */
.q-card-actions {
  padding: 8px !important;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}
</style>
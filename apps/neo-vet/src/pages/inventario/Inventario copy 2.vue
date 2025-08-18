<template>
  <div class="inventory-modern-container">
    <!-- Header con glassmorphism -->
    <div class="modern-header">
      <div class="header-glass">
        <div class="header-content">
          <div class="header-left">
            <div class="header-icon">
              <q-icon name="inventory_2" size="40px" />
            </div>
            <div class="header-info">
              <h1 class="header-title">Inventario & Farmacia</h1>
              <div class="header-stats">
                <span class="stat-item">
                  <q-icon name="inventory" size="14px" />
                  {{ estadisticas.totalProductos }} productos
                </span>
                <span class="stat-item warning" v-if="estadisticas.stockBajo > 0">
                  <q-icon name="trending_down" size="14px" />
                  {{ estadisticas.stockBajo }} stock bajo
                </span>
                <span class="stat-item danger" v-if="estadisticas.proximosVencer > 0">
                  <q-icon name="event" size="14px" />
                  {{ estadisticas.proximosVencer }} por vencer
                </span>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <q-btn 
              class="action-btn primary"
              round
              size="lg"
              icon="add_circle"
              @click="abrirModalProducto"
              :disable="modoLectura"
            >
              <q-tooltip class="modern-tooltip">Agregar Producto</q-tooltip>
            </q-btn>
            <q-btn 
              class="action-btn secondary"
              round
              size="lg"
              icon="shopping_cart"
              @click="abrirModalVenta"
              :disable="modoLectura"
            >
              <q-tooltip class="modern-tooltip">Nueva Venta</q-tooltip>
            </q-btn>
            <q-btn 
              class="action-btn tertiary"
              round
              size="lg"
              icon="analytics"
              @click="abrirModalHistorial"
            >
              <q-tooltip class="modern-tooltip">Análisis & Historial</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de filtros modernos -->
    <div class="filters-panel">
      <div class="filters-glass">
        <div class="filters-content">
          <!-- Buscador principal -->
          <div class="search-container">
            <q-input
              v-model="filtros.texto"
              class="search-input"
              outlined
              dense
              placeholder="Buscar productos, lotes, proveedores..."
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" class="search-icon" />
              </template>
            </q-input>
          </div>

          <!-- Filtros categorizados -->
          <div class="category-filters">
            <div 
              v-for="categoria in categoriasDisponibles" 
              :key="categoria.value"
              class="category-chip"
              :class="{ active: filtros.categoria === categoria.value }"
              @click="toggleFiltroCategoria(categoria.value)"
            >
              <span class="chip-emoji">{{ categoria.emoji }}</span>
              <span class="chip-label">{{ categoria.label }}</span>
              <span class="chip-count">{{ getProductosPorCategoria(categoria.value) }}</span>
            </div>
          </div>

          <!-- Filtros de estado -->
          <div class="status-filters">
            <q-chip
              v-for="estado in estadosStock"
              :key="estado.value"
              :color="estado.color"
              :text-color="estado.textColor"
              :outline="filtros.estado !== estado.value"
              clickable
              @click="toggleFiltroEstado(estado.value)"
              :icon="estado.icon"
              class="status-chip"
            >
              {{ estado.label }}
              <q-badge 
                v-if="getProductosPorEstado(estado.value) > 0"
                :color="estado.badgeColor"
                floating
              >
                {{ getProductosPorEstado(estado.value) }}
              </q-badge>
            </q-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de productos con masonry layout -->
    <div class="products-grid-container">
      <div class="products-grid">
        <div
          v-for="producto in productosFiltrados"
          :key="producto.id"
          class="product-card"
          :class="getProductCardClass(producto)"
        >
          <!-- Header del producto con gradiente -->
          <div class="product-header" :style="getProductHeaderStyle(producto)">
            <div class="product-title-area">
              <h3 class="product-name">{{ producto.nombre }}</h3>
              <div class="product-meta">
                <span class="meta-item">
                  <q-icon :name="getCategoriaIcon(producto.categoria)" size="12px" />
                  {{ getCategoriaLabel(producto.categoria) }}
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">{{ getTipoLabel(producto.tipo) }}</span>
              </div>
            </div>
            <div class="product-status">
              <q-chip
                :color="getStockColor(producto)"
                text-color="white"
                size="sm"
                class="status-badge"
              >
                <q-icon :name="getStockIcon(producto)" size="14px" class="q-mr-xs" />
                {{ getStockLabel(producto) }}
              </q-chip>
            </div>
          </div>

          <!-- Contenido principal -->
          <div class="product-content">
            <!-- Stock visual -->
            <div class="stock-section">
              <div class="section-header">
                <q-icon name="inventory" class="section-icon" />
                <span class="section-title">Stock Disponible</span>
              </div>
              
              <div v-if="producto.manejoFraccionado" class="stock-fractionated">
                <div class="stock-main">
                  <span class="stock-number">{{ producto.stockUnidades }}</span>
                  <span class="stock-unit">{{ producto.unidadEnvase }}</span>
                </div>
                <div class="stock-doses">
                  <q-icon name="medical_services" size="16px" />
                  <span>{{ calcularDosisDisponibles(producto) }} dosis disponibles</span>
                </div>
                <div class="stock-progress">
                  <q-linear-progress
                    :value="producto.stockUnidades / (producto.stockMinimo * 3)"
                    :color="getStockProgressColor(producto)"
                    size="4px"
                    rounded
                  />
                </div>
              </div>

              <div v-else class="stock-simple">
                <div class="stock-main">
                  <span class="stock-number">{{ producto.stockUnidades }}</span>
                  <span class="stock-unit">{{ producto.unidadMedida }}</span>
                </div>
                <div class="stock-progress">
                  <q-linear-progress
                    :value="producto.stockUnidades / (producto.stockMinimo * 3)"
                    :color="getStockProgressColor(producto)"
                    size="4px"
                    rounded
                  />
                  <span class="progress-label">Mín: {{ producto.stockMinimo }}</span>
                </div>
              </div>
            </div>

            <!-- Precios modernos -->
            <div class="price-section">
              <div class="section-header">
                <q-icon name="attach_money" class="section-icon" />
                <span class="section-title">Información de Precios</span>
              </div>
              
              <div class="price-grid">
                <div class="price-item cost">
                  <span class="price-label">Costo</span>
                  <span class="price-value">${{ producto.costoUnitario?.toFixed(2) }}</span>
                </div>
                <div class="price-item sale">
                  <span class="price-label">Venta</span>
                  <span class="price-value">${{ producto.precioVenta?.toFixed(2) }}</span>
                </div>
                <div v-if="producto.manejoFraccionado" class="price-item dose">
                  <span class="price-label">Por Dosis</span>
                  <span class="price-value">${{ (producto.precioVenta / producto.dosisTotal)?.toFixed(2) }}</span>
                </div>
              </div>

              <div class="margin-indicator">
                <span class="margin-label">Margen:</span>
                <span class="margin-value" :class="getMarginClass(producto)">
                  {{ calcularMargen(producto) }}%
                </span>
              </div>
            </div>

            <!-- Información adicional -->
            <div v-if="tieneInfoAdicional(producto)" class="additional-info">
              <div v-if="producto.fechaVencimiento" class="info-item expiry">
                <q-icon 
                  :name="isProximoVencer(producto.fechaVencimiento) ? 'warning' : 'event'" 
                  :class="isProximoVencer(producto.fechaVencimiento) ? 'text-warning' : 'text-grey-6'"
                />
                <span>{{ formatearFecha(producto.fechaVencimiento) }}</span>
              </div>
              
              <div v-if="producto.lote" class="info-item batch">
                <q-icon name="qr_code" />
                <span>Lote: {{ producto.lote }}</span>
              </div>
              
              <div v-if="producto.ubicacion" class="info-item location">
                <q-icon name="place" />
                <span>{{ producto.ubicacion }}</span>
              </div>
            </div>
          </div>

          <!-- Acciones flotantes -->
          <div class="product-actions" v-if="!modoLectura">
            <q-btn
              class="action-sell"
              round
              icon="add_shopping_cart"
              @click="iniciarVenta(producto)"
              :disable="producto.stockUnidades <= 0"
            >
              <q-tooltip>Vender</q-tooltip>
            </q-btn>
            
            <q-btn-dropdown 
              class="action-menu"
              round
              icon="more_vert"
              auto-close
            >
              <q-list>
                <q-item clickable @click="editarProducto(producto)">
                  <q-item-section avatar>
                    <q-icon name="edit" color="primary" />
                  </q-item-section>
                  <q-item-section>Editar</q-item-section>
                </q-item>
                
                <q-item clickable @click="ajustarStock(producto)">
                  <q-item-section avatar>
                    <q-icon name="tune" color="blue" />
                  </q-item-section>
                  <q-item-section>Ajustar Stock</q-item-section>
                </q-item>
                
                <q-item clickable @click="verHistorial(producto)">
                  <q-item-section avatar>
                    <q-icon name="history" color="orange" />
                  </q-item-section>
                  <q-item-section>Ver Historial</q-item-section>
                </q-item>
                
                <q-separator />
                
                <q-item clickable @click="eliminarProducto(producto)">
                  <q-item-section avatar>
                    <q-icon name="delete" color="negative" />
                  </q-item-section>
                  <q-item-section>Eliminar</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>

      <!-- Estado vacío moderno -->
      <div v-if="productosFiltrados.length === 0" class="empty-state">
        <div class="empty-illustration">
          <q-icon name="inventory_2" size="120px" />
        </div>
        <h2 class="empty-title">
          {{ hayFiltrosActivos ? 'No se encontraron productos' : 'Inventario vacío' }}
        </h2>
        <p class="empty-subtitle">
          {{ hayFiltrosActivos 
            ? 'Intenta cambiar los filtros de búsqueda' 
            : 'Comienza agregando tu primer producto al inventario' 
          }}
        </p>
        <q-btn
          v-if="!modoLectura && !hayFiltrosActivos"
          class="empty-action"
          color="primary"
          size="lg"
          icon="add"
          label="Agregar Primer Producto"
          @click="abrirModalProducto"
          unelevated
        />
      </div>
    </div>

    <!-- Fab flotante para acciones rápidas -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]" v-if="!modoLectura">
      <q-fab
        color="primary"
        icon="add"
        direction="up"
        class="modern-fab"
      >
        <q-fab-action
          color="blue"
          icon="shopping_cart"
          label="Nueva Venta"
          @click="abrirModalVenta"
        />
        <q-fab-action
          color="green"
          icon="add_circle"
          label="Producto"
          @click="abrirModalProducto"
        />
        <q-fab-action
          color="purple"
          icon="tune"
          label="Ajuste Stock"
          @click="abrirModalAjuste"
        />
      </q-fab>
    </q-page-sticky>

    <!-- Modal de Producto -->
    <q-dialog v-model="modales.producto" persistent maximized>
      <q-card class="modern-modal">
        <q-card-section class="modal-header">
          <div class="text-h6">
            {{ productoEditando ? 'Editar Producto' : 'Nuevo Producto' }}
          </div>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="cerrarModalProducto"
            class="close-btn"
          />
        </q-card-section>
        
        <q-card-section class="modal-content">
          <div class="form-grid">
            <!-- Información básica -->
            <div class="form-section">
              <h3 class="section-title">Información Básica</h3>
              <div class="form-row">
                <q-input
                  v-model="productoTemporal.nombre"
                  label="Nombre del Producto"
                  outlined
                  class="form-field"
                  :rules="[val => !!val || 'El nombre es requerido']"
                />
                <q-select
                  v-model="productoTemporal.categoria"
                  :options="categoriasDisponibles"
                  label="Categoría"
                  outlined
                  option-label="label"
                  option-value="value"
                  class="form-field"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cancelar" @click="cerrarModalProducto"/>
          <q-btn color="primary" label="Guardar" @click="guardarProducto" unelevated/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Venta -->
    <q-dialog v-model="modales.venta" persistent maximized>
      <q-card class="modern-modal">
        <q-card-section class="modal-header">
          <div class="text-h6">Nueva Venta</div>
          <q-btn flat round icon="close" @click="cerrarModalVenta" class="close-btn"/>
        </q-card-section>
        
        <q-card-section class="modal-content">
          <div class="text-center q-pa-xl">
            <q-icon name="shopping_cart" size="64px" class="text-grey-5"/>
            <div class="text-h6 text-grey-6 q-mt-md">Modal de Venta</div>
            <div class="text-body2 text-grey-5">Funcionalidad en desarrollo</div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cerrar" @click="cerrarModalVenta"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Historial -->
    <q-dialog v-model="modales.historial" persistent maximized>
      <q-card class="modern-modal">
        <q-card-section class="modal-header">
          <div class="text-h6">Historial de Movimientos</div>
          <q-btn flat round icon="close" @click="cerrarModalHistorial" class="close-btn"/>
        </q-card-section>
        
        <q-card-section class="modal-content">
          <div class="text-center q-pa-xl">
            <q-icon name="analytics" size="64px" class="text-grey-5"/>
            <div class="text-h6 text-grey-6 q-mt-md">Análisis & Historial</div>
            <div class="text-body2 text-grey-5">Funcionalidad en desarrollo</div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Cerrar" @click="cerrarModalHistorial"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  modoLectura: { type: Boolean, default: false }
})

// Emits
const emit = defineEmits(['inventario-actualizado', 'venta-procesada', 'movimiento-registrado'])

// Estados
const inventario = ref({ 
  productos: [], 
  configuracion: { 
    diasAlertaVencimiento: 30,
    monedaLocal: 'MXN'
  } 
})

const filtros = ref({ 
  texto: '', 
  categoria: '', 
  tipo: '', 
  estado: '' 
})

const modales = ref({ 
  producto: false, 
  venta: false, 
  historial: false, 
  ajuste: false 
})

const productoEditando = ref(null)
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
  dosisTotal: 0,
  fechaCreacion: '',
  activo: true
})

// Opciones de configuración
const categoriasDisponibles = [
  { label: 'Medicamentos', value: 'medicamentos', emoji: '💊', color: 'blue' },
  { label: 'Alimentos', value: 'alimentos', emoji: '🥫', color: 'green' },
  { label: 'Suplementos', value: 'suplementos', emoji: '💊', color: 'purple' },
  { label: 'Accesorios', value: 'accesorios', emoji: '🎾', color: 'orange' },
  { label: 'Higiene', value: 'higiene', emoji: '🧴', color: 'cyan' },
  { label: 'Juguetes', value: 'juguetes', emoji: '🧸', color: 'pink' }
]

const tiposDisponibles = [
  { label: 'Medicamento', value: 'medicamento' },
  { label: 'Alimento', value: 'alimento' },
  { label: 'Producto', value: 'producto' }
]

const estadosStock = [
  { 
    label: 'Normal', 
    value: 'normal', 
    color: 'positive', 
    textColor: 'white', 
    icon: 'check_circle', 
    badgeColor: 'green' 
  },
  { 
    label: 'Stock Bajo', 
    value: 'stock_bajo', 
    color: 'warning', 
    textColor: 'black', 
    icon: 'trending_down', 
    badgeColor: 'orange' 
  },
  { 
    label: 'Sin Stock', 
    value: 'sin_stock', 
    color: 'negative', 
    textColor: 'white', 
    icon: 'remove_circle', 
    badgeColor: 'red' 
  },
  { 
    label: 'Por Vencer', 
    value: 'proximo_vencer', 
    color: 'deep-orange', 
    textColor: 'white', 
    icon: 'schedule', 
    badgeColor: 'deep-orange' 
  }
]

// Computed properties
const productosFiltrados = computed(() => {
  let productos = inventario.value.productos.filter(p => p.activo)
  
  if (filtros.value.texto) {
    const texto = filtros.value.texto.toLowerCase()
    productos = productos.filter(p => 
      p.nombre.toLowerCase().includes(texto) ||
      p.descripcion?.toLowerCase().includes(texto) ||
      p.lote?.toLowerCase().includes(texto) ||
      p.proveedor?.toLowerCase().includes(texto)
    )
  }
  
  if (filtros.value.categoria) {
    productos = productos.filter(p => p.categoria === filtros.value.categoria)
  }
  
  if (filtros.value.estado) {
    productos = productos.filter(p => getEstadoStock(p) === filtros.value.estado)
  }
  
  return productos
})

const estadisticas = computed(() => {
  const productos = inventario.value.productos.filter(p => p.activo)
  return {
    totalProductos: productos.length,
    stockBajo: productos.filter(p => getEstadoStock(p) === 'stock_bajo').length,
    proximosVencer: productos.filter(p => getEstadoStock(p) === 'proximo_vencer').length,
    sinStock: productos.filter(p => getEstadoStock(p) === 'sin_stock').length,
    valorTotal: productos.reduce((acc, p) => acc + (p.stockUnidades * p.costoUnitario), 0)
  }
})

const hayFiltrosActivos = computed(() => {
  return filtros.value.texto || filtros.value.categoria || filtros.value.estado
})

// Métodos de utilidad
const getEstadoStock = (producto) => {
  if (producto.stockUnidades <= 0) return 'sin_stock'
  if (producto.stockUnidades <= producto.stockMinimo) return 'stock_bajo'
  if (producto.fechaVencimiento && isProximoVencer(producto.fechaVencimiento)) return 'proximo_vencer'
  return 'normal'
}

const getStockColor = (producto) => {
  const colores = {
    'normal': 'positive',
    'stock_bajo': 'warning', 
    'sin_stock': 'negative',
    'proximo_vencer': 'deep-orange'
  }
  return colores[getEstadoStock(producto)]
}

const getStockIcon = (producto) => {
  const iconos = {
    'normal': 'check_circle',
    'stock_bajo': 'trending_down',
    'sin_stock': 'remove_circle', 
    'proximo_vencer': 'schedule'
  }
  return iconos[getEstadoStock(producto)]
}

const getStockLabel = (producto) => {
  const labels = {
    'normal': 'Normal',
    'stock_bajo': 'Stock Bajo',
    'sin_stock': 'Sin Stock',
    'proximo_vencer': 'Por Vencer'
  }
  return labels[getEstadoStock(producto)]
}

const getProductCardClass = (producto) => {
  const estado = getEstadoStock(producto)
  return {
    'card-warning': estado === 'stock_bajo',
    'card-danger': estado === 'sin_stock',
    'card-alert': estado === 'proximo_vencer'
  }
}

const getProductHeaderStyle = (producto) => {
  const gradientes = {
    medicamentos: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    alimentos: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    suplementos: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    accesorios: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    higiene: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    juguetes: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
  return { background: gradientes[producto.categoria] || gradientes.medicamentos }
}

const getCategoriaIcon = (categoria) => {
  const iconos = {
    medicamentos: 'medical_services',
    alimentos: 'restaurant',
    suplementos: 'science',
    accesorios: 'pets',
    higiene: 'soap',
    juguetes: 'toys'
  }
  return iconos[categoria] || 'inventory'
}

const getCategoriaLabel = (categoria) => {
  const cat = categoriasDisponibles.find(c => c.value === categoria)
  return cat?.label || categoria
}

const getTipoLabel = (tipo) => {
  const tipos = {
    medicamento: 'Medicamento',
    alimento: 'Alimento', 
    producto: 'Producto'
  }
  return tipos[tipo] || tipo
}

const getStockProgressColor = (producto) => {
  return getStockColor(producto)
}

const calcularDosisDisponibles = (producto) => {
  if (!producto.manejoFraccionado) return 0
  const totalContenido = producto.stockUnidades * producto.contenidoPorEnvase
  return Math.floor(totalContenido / producto.dosisPorAplicacion)
}

const calcularMargen = (producto) => {
  if (!producto.costoUnitario || !producto.precioVenta) return 0
  return (((producto.precioVenta - producto.costoUnitario) / producto.costoUnitario) * 100).toFixed(1)
}

const getMarginClass = (producto) => {
  const margen = calcularMargen(producto)
  if (margen >= 50) return 'margin-excellent'
  if (margen >= 30) return 'margin-good'
  if (margen >= 15) return 'margin-fair'
  return 'margin-low'
}

const isProximoVencer = (fecha) => {
  if (!fecha) return false
  const fechaVenc = new Date(fecha)
  const ahora = new Date()
  const diffDias = Math.floor((fechaVenc - ahora) / (1000 * 60 * 60 * 24))
  return diffDias <= inventario.value.configuracion.diasAlertaVencimiento && diffDias >= 0
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-MX')
}

const tieneInfoAdicional = (producto) => {
  return producto.fechaVencimiento || producto.lote || producto.ubicacion
}

const getProductosPorCategoria = (categoria) => {
  return inventario.value.productos.filter(p => p.activo && p.categoria === categoria).length
}

const getProductosPorEstado = (estado) => {
  return inventario.value.productos.filter(p => p.activo && getEstadoStock(p) === estado).length
}

// Métodos de filtros
const toggleFiltroCategoria = (categoria) => {
  filtros.value.categoria = filtros.value.categoria === categoria ? '' : categoria
}

const toggleFiltroEstado = (estado) => {
  filtros.value.estado = filtros.value.estado === estado ? '' : estado
}

// Métodos de modales
const abrirModalProducto = () => {
  productoEditando.value = null
  limpiarProductoTemporal()
  modales.value.producto = true
}

const cerrarModalProducto = () => {
  modales.value.producto = false
  productoEditando.value = null
  limpiarProductoTemporal()
}

const abrirModalVenta = () => modales.value.venta = true
const cerrarModalVenta = () => modales.value.venta = false

const abrirModalHistorial = () => modales.value.historial = true
const cerrarModalHistorial = () => modales.value.historial = false

const abrirModalAjuste = () => modales.value.ajuste = true

// Métodos de acciones
const editarProducto = (producto) => {
  productoEditando.value = producto
  productoTemporal.value = { ...producto }
  modales.value.producto = true
}

const guardarProducto = () => {
  if (!productoTemporal.value.nombre || !productoTemporal.value.categoria) {
    return
  }
  
  const ahora = new Date().toISOString()
  
  if (productoEditando.value) {
    // Editar producto existente
    const index = inventario.value.productos.findIndex(p => p.id === productoEditando.value.id)
    if (index !== -1) {
      inventario.value.productos[index] = { 
        ...productoTemporal.value,
        fechaModificacion: ahora
      }
    }
  } else {
    // Nuevo producto
    const nuevoProducto = {
      ...productoTemporal.value,
      id: `prod_${Date.now()}`,
      fechaCreacion: ahora,
      fechaModificacion: ahora
    }
    
    // Calcular dosisTotal si es medicamento fraccionado
    if (nuevoProducto.manejoFraccionado) {
      nuevoProducto.dosisTotal = Math.floor(
        nuevoProducto.contenidoPorEnvase / nuevoProducto.dosisPorAplicacion
      )
    }
    
    inventario.value.productos.push(nuevoProducto)
  }
  
  cerrarModalProducto()
  emit('inventario-actualizado', inventario.value)
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
    dosisTotal: 0,
    fechaCreacion: '',
    activo: true
  }
}

const ajustarStock = (producto) => {
  console.log('Ajustando stock:', producto.id)
  abrirModalAjuste()
}

const verHistorial = (producto) => {
  console.log('Ver historial:', producto.id)
  abrirModalHistorial()
}

const eliminarProducto = (producto) => {
  const index = inventario.value.productos.findIndex(p => p.id === producto.id)
  if (index !== -1) {
    inventario.value.productos[index].activo = false
    emit('inventario-actualizado', inventario.value)
  }
}

const iniciarVenta = (producto) => {
  console.log('Iniciando venta:', producto.id)
  abrirModalVenta()
}

// Inicialización con datos de ejemplo
onMounted(() => {
  inventario.value.productos = [
    {
      id: 'prod_001',
      nombre: 'Amoxicilina 250mg - Frasco 100ml',
      descripcion: 'Antibiótico de amplio espectro para uso veterinario',
      categoria: 'medicamentos',
      tipo: 'medicamento',
      stockUnidades: 5,
      stockMinimo: 2,
      unidadMedida: 'frascos',
      ubicacion: 'Refrigerador A-1',
      costoUnitario: 85.00,
      precioVenta: 120.00,
      lote: 'AMX2024-001',
      fechaVencimiento: '2025-12-31',
      proveedor: 'Laboratorios Veterinarios SA',
      manejoFraccionado: true,
      contenidoPorEnvase: 100,
      unidadEnvase: 'ml',
      dosisPorAplicacion: 5,
      unidadDosis: 'ml',
      dosisTotal: 20,
      fechaCreacion: '2024-01-15T08:00:00.000Z',
      activo: true
    },
    {
      id: 'prod_002', 
      nombre: 'Alimento Premium Perro Adulto 15kg',
      descripcion: 'Alimento balanceado para perros adultos de todas las razas',
      categoria: 'alimentos',
      tipo: 'alimento',
      stockUnidades: 25,
      stockMinimo: 5,
      unidadMedida: 'sacos',
      ubicacion: 'Almacén B-3',
      costoUnitario: 450.00,
      precioVenta: 650.00,
      lote: 'ALM2024-005',
      fechaVencimiento: '2025-06-30',
      proveedor: 'Nutrición Animal Plus',
      manejoFraccionado: false,
      fechaCreacion: '2024-01-20T10:30:00.000Z',
      activo: true
    },
    {
      id: 'prod_003',
      nombre: 'Meloxicam 0.5% - Frasco 50ml', 
      descripcion: 'Antiinflamatorio no esteroideo para perros y gatos',
      categoria: 'medicamentos',
      tipo: 'medicamento',
      stockUnidades: 1,
      stockMinimo: 3,
      unidadMedida: 'frascos',
      ubicacion: 'Farmacia A-2',
      costoUnitario: 95.00,
      precioVenta: 140.00,
      lote: 'MEL2024-002',
      fechaVencimiento: '2025-03-15',
      proveedor: 'Farmacia Veterinaria Nacional',
      manejoFraccionado: true,
      contenidoPorEnvase: 50,
      unidadEnvase: 'ml',
      dosisPorAplicacion: 2.5,
      unidadDosis: 'ml',
      dosisTotal: 20,
      fechaCreacion: '2024-02-01T14:15:00.000Z',
      activo: true
    },
    {
      id: 'prod_004',
      nombre: 'Shampoo Antipulgas 500ml',
      descripcion: 'Shampoo medicado para control de pulgas y garrapatas',
      categoria: 'higiene',
      tipo: 'producto', 
      stockUnidades: 0,
      stockMinimo: 3,
      unidadMedida: 'botellas',
      ubicacion: 'Estante C-1',
      costoUnitario: 55.00,
      precioVenta: 85.00,
      lote: 'SHA2024-001',
      fechaVencimiento: '2026-01-31',
      proveedor: 'Productos de Higiene Pet',
      manejoFraccionado: false,
      fechaCreacion: '2024-01-10T09:45:00.000Z',
      activo: true
    },
    {
      id: 'prod_005',
      nombre: 'Suplemento Vitamínico Canino',
      descripcion: 'Complejo vitamínico para perros de todas las edades',
      categoria: 'suplementos',
      tipo: 'producto',
      stockUnidades: 8,
      stockMinimo: 5,
      unidadMedida: 'frascos',
      ubicacion: 'Estante B-2',
      costoUnitario: 75.00,
      precioVenta: 115.00,
      lote: 'VIT2024-003',
      fechaVencimiento: '2025-04-20',
      proveedor: 'Suplementos Nutricionales Vet',
      manejoFraccionado: false,
      fechaCreacion: '2024-01-25T11:30:00.000Z',
      activo: true
    },
    {
      id: 'prod_006',
      nombre: 'Pelota Interactiva Grande',
      descripcion: 'Juguete interactivo para perros grandes, material resistente',
      categoria: 'juguetes',
      tipo: 'producto',
      stockUnidades: 12,
      stockMinimo: 3,
      unidadMedida: 'piezas',
      ubicacion: 'Estante D-1',
      costoUnitario: 35.00,
      precioVenta: 65.00,
      lote: 'JUG2024-001',
      fechaVencimiento: null,
      proveedor: 'Juguetes Pet Fun',
      manejoFraccionado: false,
      fechaCreacion: '2024-02-05T09:20:00.000Z',
      activo: true
    },
    {
      id: 'prod_007',
      nombre: 'Collar Antipulgas Mediano',
      descripcion: 'Collar antipulgas de larga duración para perros medianos',
      categoria: 'accesorios',
      tipo: 'producto',
      stockUnidades: 15,
      stockMinimo: 8,
      unidadMedida: 'piezas',
      ubicacion: 'Vitrina Principal',
      costoUnitario: 120.00,
      precioVenta: 180.00,
      lote: 'COL2024-002',
      fechaVencimiento: '2026-08-15',
      proveedor: 'Accesorios Veterinarios Pro',
      manejoFraccionado: false,
      fechaCreacion: '2024-02-10T16:45:00.000Z',
      activo: true
    },
    {
      id: 'prod_008',
      nombre: 'Tramadol 50mg - Caja 20 tabletas',
      descripcion: 'Analgésico para dolor moderado a severo en animales',
      categoria: 'medicamentos',
      tipo: 'medicamento',
      stockUnidades: 3,
      stockMinimo: 5,
      unidadMedida: 'cajas',
      ubicacion: 'Farmacia Controlados',
      costoUnitario: 180.00,
      precioVenta: 250.00,
      lote: 'TRA2024-001',
      fechaVencimiento: '2025-09-30',
      proveedor: 'Farmacéuticos Especializados',
      manejoFraccionado: true,
      contenidoPorEnvase: 20,
      unidadEnvase: 'tabletas',
      dosisPorAplicacion: 1,
      unidadDosis: 'tableta',
      dosisTotal: 20,
      fechaCreacion: '2024-02-12T11:15:00.000Z',
      activo: true
    }
  ]
})

// Exponer métodos si es necesario
defineExpose({
  inventario,
  filtros,
  abrirModalProducto,
  abrirModalVenta,
  abrirModalHistorial
})
</script>

<style scoped>
.inventory-modern-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  padding: 0;
  overflow-x: hidden;
}

/* Header moderno con glassmorphism */
.modern-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20px;
  backdrop-filter: blur(20px);
}

.header-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-stats {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}

.stat-item.warning {
  color: #ffb74d;
}

.stat-item.danger {
  color: #ff7043;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 56px;
  height: 56px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn.primary {
  background: rgba(33, 150, 243, 0.8);
  color: white;
}

.action-btn.secondary {
  background: rgba(76, 175, 80, 0.8);
  color: white;
}

.action-btn.tertiary {
  background: rgba(156, 39, 176, 0.8);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

/* Panel de filtros */
.filters-panel {
  padding: 0 20px 20px;
}

.filters-glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.filters-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-container {
  width: 100%;
}

.search-input {
  width: 100%;
  font-size: 16px;
}

.search-input :deep(.q-field__control) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.search-icon {
  color: #666;
}

/* Filtros de categoría */
.category-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.category-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.chip-emoji {
  font-size: 18px;
}

.chip-label {
  font-weight: 600;
  font-size: 14px;
}

.chip-count {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.category-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Filtros de estado */
.status-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-chip {
  font-weight: 600;
  transition: all 0.3s ease;
}

.status-chip:hover {
  transform: scale(1.05);
}

/* Grid de productos */
.products-grid-container {
  padding: 0 20px 20px;
  flex: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

/* Tarjetas de productos */
.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(31, 38, 135, 0.5);
}

.product-card.card-warning {
  border-left: 4px solid #ff9800;
}

.product-card.card-danger {
  border-left: 4px solid #f44336;
}

.product-card.card-alert {
  border-left: 4px solid #ff5722;
}

/* Header del producto */
.product-header {
  padding: 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.product-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.product-title-area {
  position: relative;
  z-index: 2;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-separator {
  opacity: 0.6;
}

.product-status {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
}

.status-badge {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Contenido del producto */
.product-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-icon {
  color: #666;
  font-size: 16px;
}

.section-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

/* Sección de stock */
.stock-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
}

.stock-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.stock-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.stock-unit {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stock-doses {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.stock-progress {
  position: relative;
}

.progress-label {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
  display: block;
}

/* Sección de precios */
.price-section {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border-radius: 12px;
  padding: 16px;
}

.price-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.price-item {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
}

.price-label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.price-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
}

.price-item.cost .price-value {
  color: #e74c3c;
}

.price-item.sale .price-value {
  color: #27ae60;
}

.price-item.dose .price-value {
  color: #8e44ad;
}

.margin-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.margin-label {
  color: #666;
  font-weight: 500;
}

.margin-value {
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.margin-excellent {
  background: #d4edda;
  color: #155724;
}

.margin-good {
  background: #fff3cd;
  color: #856404;
}

.margin-fair {
  background: #f8d7da;
  color: #721c24;
}

.margin-low {
  background: #f8d7da;
  color: #721c24;
}

/* Información adicional */
.additional-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.info-item.expiry {
  background: rgba(255, 152, 0, 0.1);
}

/* Acciones de productos */
.product-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.action-sell {
  background: #4caf50;
  color: white;
  width: 44px;
  height: 44px;
}

.action-sell:disabled {
  background: #ccc;
}

.action-menu {
  background: #666;
  color: white;
  width: 44px;
  height: 44px;
}

/* Estado vacío */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 40px auto;
  max-width: 500px;
}

.empty-illustration {
  margin-bottom: 24px;
  opacity: 0.6;
  color: #666;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.empty-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.empty-action {
  border-radius: 12px;
  padding: 12px 24px;
}

/* FAB moderno */
.modern-fab {
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(20px);
}

/* Modales modernos */
.modern-modal {
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  color: white;
}

.modal-content {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-actions {
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.02);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.form-field {
  margin-bottom: 16px;
}

/* Tooltips modernos */
.modern-tooltip {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .inventory-modern-container {
    padding: 0;
  }

  .modern-header {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .header-left {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .header-stats {
    justify-content: center;
  }

  .filters-panel {
    padding: 0 16px 16px;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .products-grid-container {
    padding: 0 16px 16px;
  }

  .category-filters {
    justify-content: center;
  }

  .status-filters {
    justify-content: center;
  }

  .product-actions {
    opacity: 1;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 22px;
  }

  .product-name {
    font-size: 16px;
  }

  .price-grid {
    grid-template-columns: 1fr 1fr;
  }

  .category-chip {
    padding: 6px 12px;
  }

  .chip-label {
    font-size: 13px;
  }
}

/* Animaciones */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card {
  animation: slideInUp 0.6s ease-out;
}

.product-card:nth-child(2n) {
  animation-delay: 0.1s;
}

.product-card:nth-child(3n) {
  animation-delay: 0.2s;
}

/* Efectos de hover mejorados */
.action-btn:hover {
  transform: translateY(-2px) scale(1.05);
}

.category-chip:hover:not(.active) {
  background: rgba(255, 255, 255, 0.9);
}

.product-card:hover .product-header::before {
  background: rgba(0, 0, 0, 0.2);
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Efectos de glassmorphism mejorados */
.header-glass:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.filters-glass:hover {
  background: rgba(255, 255, 255, 0.98);
  transform: translateY(-2px);
}

/* Animaciones de carga */
.product-card:nth-child(4n) {
  animation-delay: 0.3s;
}

.product-card:nth-child(5n) {
  animation-delay: 0.4s;
}

/* Mejoras en los badges */
.q-badge {
  animation: pulse 2s infinite;
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

/* Hover effects para las acciones */
.action-sell:hover:not(:disabled) {
  background: #66bb6a !important;
  transform: scale(1.1);
}

.action-menu:hover {
  background: #555 !important;
  transform: scale(1.1);
}

/* Transiciones suaves para los filtros */
.status-chip {
  transform: scale(1);
  transition: all 0.2s ease;
}

.status-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Mejoras en el grid responsive */
@media (min-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (min-width: 1800px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Efectos especiales para productos con alertas */
.product-card.card-warning {
  animation: warningGlow 3s ease-in-out infinite;
}

.product-card.card-danger {
  animation: dangerGlow 2s ease-in-out infinite;
}

.product-card.card-alert {
  animation: alertGlow 2.5s ease-in-out infinite;
}

@keyframes warningGlow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  }
  50% {
    box-shadow: 0 8px 32px rgba(255, 152, 0, 0.3);
  }
}

@keyframes dangerGlow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  }
  50% {
    box-shadow: 0 8px 32px rgba(244, 67, 54, 0.3);
  }
}

@keyframes alertGlow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  }
  50% {
    box-shadow: 0 8px 32px rgba(255, 87, 34, 0.3);
  }
}

/* Mejoras en la tipografía */
.header-title {
  background: linear-gradient(45deg, #fff, #f0f0f0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Efectos de micro-interacciones */
.search-input:focus-within {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}

.category-chip:active {
  transform: scale(0.95);
}

.action-btn:active {
  transform: scale(0.95);
}

/* Indicadores de loading state */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Mejoras en accesibilidad */
.product-card:focus-within {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.action-btn:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* Estados de error y éxito */
.success-state {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 1px solid #28a745;
  color: #155724;
}

.error-state {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border: 1px solid #dc3545;
  color: #721c24;
}

/* Optimizaciones de rendimiento */
.product-card {
  will-change: transform;
  transform: translateZ(0);
}

.header-glass {
  will-change: background, border-color;
}

/* Dark mode support (opcional) */
@media (prefers-color-scheme: dark) {
  .inventory-modern-container {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .header-glass {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .filters-glass {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
  
  .product-card {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
}

/* Fin del CSS */
</style>
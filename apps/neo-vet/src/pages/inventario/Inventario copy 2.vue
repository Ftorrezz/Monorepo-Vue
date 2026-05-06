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
        no-caps
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="dashboard" icon="dashboard" label="Dashboard" />
        <q-tab name="productos" icon="inventory_2" label="Inventario" />
        <q-tab name="proveedores" icon="local_shipping" label="Proveedores" />
        <q-tab name="movimientos" icon="history" label="Movimientos" />
      </q-tabs>
    </q-card>

    <q-tab-panels v-model="tabSeleccionada" animated class="bg-transparent">
      <!-- PANEL DE DASHBOARD -->
      <q-tab-panel name="dashboard" class="q-pa-none">
        <div class="row q-col-gutter-md q-mb-xl">
          <!-- KPI 1 -->
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-primary" v-ripple>
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="attach_money" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Inversión Total</div>
                    <div class="text-h4 text-weight-bolder">${{ estadisticasGenerales.valorTotal.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <!-- KPI 2 -->
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-secondary" v-ripple @click="tabSeleccionada = 'productos'" style="cursor:pointer">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="inventory_2" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Prod. Activos</div>
                    <div class="text-h4 text-weight-bolder">{{ estadisticasGenerales.totalProductos }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <!-- KPI 3 -->
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-warning" v-ripple @click="tabSeleccionada = 'productos'; filtroEstado = estadosStock.find(e => e.value === 'stock_bajo')" style="cursor:pointer">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="warning" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Stock Bajo</div>
                    <div class="text-h4 text-weight-bolder">{{ estadisticasGenerales.stockBajo }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <!-- KPI 4 -->
          <div class="col-12 col-md-3">
            <q-card class="kpi-card glass-panel kpi-danger" v-ripple @click="tabSeleccionada = 'productos'; filtroEstado = estadosStock.find(e => e.value === 'proximo_vencer')" style="cursor:pointer">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="kpi-icon-wrapper"><q-icon name="event_busy" size="lg" /></div>
                  <div class="text-right">
                    <div class="text-caption text-uppercase q-mb-xs opacity-70">Por Vencer</div>
                    <div class="text-h4 text-weight-bolder">{{ estadisticasGenerales.proximosVencer }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Seccion Inferior Dashboard: Alertas y Mover rápidos -->
        <div class="row q-col-gutter-md">
           <div class="col-12 col-md-7">
             <q-card flat bordered class="rounded-16">
                <q-card-section class="bg-grey-1 row items-center">
                   <q-icon name="notifications_active" color="deep-orange" size="sm" class="q-mr-sm"/>
                   <span class="text-h6 text-weight-medium">Atención Inmediata</span>
                   <q-space />
                   <q-btn flat dense icon="arrow_forward" color="primary" label="Ver Farmacia" @click="tabSeleccionada = 'productos'" />
                </q-card-section>
                <q-list separator>
                   <q-item v-for="prod in productosProximosYAgotados.slice(0, 5)" :key="prod.id">
                      <q-item-section avatar>
                         <q-avatar :color="getStockColor(prod)" text-color="white" icon="warning" />
                      </q-item-section>
                      <q-item-section>
                         <q-item-label class="text-weight-bold">{{ prod.nombre }}</q-item-label>
                         <q-item-label caption>{{ getStockLabel(prod) }} (Stock actual: {{ prod.stockUnidades }})</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                         <q-btn outline color="primary" label="Reponer" size="sm" @click="ajustarStock(prod)" />
                      </q-item-section>
                   </q-item>
                   <q-item v-if="productosProximosYAgotados.length === 0">
                      <q-item-section class="text-center text-grey q-py-lg">Todo excelente. Ningún producto en nivel crítico.</q-item-section>
                   </q-item>
                </q-list>
             </q-card>
           </div>
           <div class="col-12 col-md-5">
             <q-card flat bordered class="rounded-16 shadow-gradient cursor-pointer" v-ripple @click="mostrarModalImpresion = true">
                <q-card-section class="q-pa-lg text-center text-white bg-gradient-print">
                   <q-icon name="print" size="xl" class="q-mb-md opacity-90"/>
                   <div class="text-h5 q-mb-sm text-weight-bold">Módulo de Reportería</div>
                   <div class="text-body2 opacity-80 q-mb-xl">Genera documentos PDF de existencias de farmacia, kárdex y alertas de caducidad.</div>
                   <q-btn color="white" text-color="primary" class="full-width q-py-sm shadow-1" unelevated label="Abrir Generador de PDF" icon="picture_as_pdf" />
                </q-card-section>
             </q-card>
           </div>
        </div>
      </q-tab-panel>

      <!-- PANEL DE PRODUCTOS -->
      <q-tab-panel name="productos" class="q-pa-none">
        <!-- Filtros y estadísticas -->
        <q-card flat class="q-mb-md rounded-12 bg-white shadow-1 overflow-hidden">
      <q-card-section class="q-pa-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filtroTexto"
              label="Buscar productos..."
              outlined
              dense
              bg-color="grey-1"
              class="rounded-8"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>
          
          <div class="col-6 col-md-2">
            <q-select
              v-model="filtroCategoria"
              :options="categoriasDisponibles"
              label="Categoría"
              outlined
              dense
              bg-color="grey-1"
              class="rounded-8"
              clearable
            >
              <template v-slot:prepend><q-icon name="category" color="primary" size="xs" /></template>
            </q-select>
          </div>
          
          <div class="col-6 col-md-2">
            <q-select
              v-model="filtroTipo"
              :options="tiposDisponibles"
              label="Tipo"
              outlined
              dense
              bg-color="grey-1"
              class="rounded-8"
              clearable
            >
              <template v-slot:prepend><q-icon name="inventory" color="primary" size="xs" /></template>
            </q-select>
          </div>
          
          <div class="col-12 col-md-4">
            <div class="row q-gutter-x-sm no-wrap items-center">
              <q-select
                v-model="filtroEstado"
                :options="estadosStock"
                label="Estado Stock"
                outlined
                dense
                bg-color="grey-1"
                class="rounded-8 col-grow"
                clearable
              />
              <q-btn 
                color="primary" 
                icon="add" 
                label="Producto" 
                @click="mostrarModalProducto = true" 
                unelevated 
                class="rounded-8 q-px-md"
                v-if="!modoLectura"
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
                  <q-icon :name="getCategoriaIcon(producto.categoriaId)" size="xs" class="q-mr-xs" />
                  {{ getCategoriaLabel(producto.categoriaId) }} • {{ getTipoLabel(producto.tipoId) }}
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
    <q-dialog v-model="mostrarModalProducto" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-grey-1">
        <q-card-section class="bg-primary text-white row items-center q-py-sm">
          <div class="text-h6">
            <q-icon :name="productoEditando ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ productoEditando ? 'Editar Producto' : 'Nuevo Producto' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="cancelarProducto" />
        </q-card-section>

        <q-tabs
          v-model="tabProducto"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
          bordered
          bg-color="white"
        >
          <q-tab name="general" label="General" icon="info" />
          <q-tab name="stock" label="Stock & Ubicación" icon="inventory_2" />
          <q-tab name="precios" label="Precios" icon="payments" />
          <q-tab name="adicional" label="Adicional & Lotes" icon="more_horiz" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tabProducto" animated class="bg-grey-1">
          <!-- PANEL GENERAL -->
          <q-tab-panel name="general" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-card flat bordered class="rounded-12">
                  <q-card-section class="q-gutter-y-md">
                    <div class="text-subtitle1 text-weight-bold text-primary">Información Principal</div>
                    
                    <q-input
                      v-model="productoTemporal.nombre"
                      label="Nombre del Producto *"
                      outlined
                      dense
                      class="rounded-8"
                      :rules="[val => !!val || 'El nombre es requerido']"
                    >
                      <template v-slot:prepend><q-icon name="label" color="primary" /></template>
                    </q-input>

                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="productoTemporal.categoriaId"
                          :options="categoriasDisponibles"
                          label="Categoría *"
                          outlined
                          dense
                          emit-value
                          map-options
                          :rules="[val => !!val || 'La categoría es requerida']"
                        >
                          <template v-slot:prepend><q-icon name="category" color="primary" /></template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="productoTemporal.tipoId"
                          :options="tiposDisponibles"
                          label="Tipo de Producto *"
                          outlined
                          dense
                          emit-value
                          map-options
                          :rules="[val => !!val || 'El tipo es requerido']"
                        >
                          <template v-slot:prepend><q-icon name="inventory" color="primary" /></template>
                        </q-select>
                      </div>
                    </div>

                    <q-input
                      v-model="productoTemporal.descripcion"
                      label="Descripción"
                      outlined
                      dense
                      type="textarea"
                      rows="3"
                      class="rounded-8"
                    />

                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <q-input v-model="productoTemporal.codigo" label="Código SKU" outlined dense icon="qr_code" />
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-input v-model="productoTemporal.codigoBarras" label="Código de Barras" outlined dense icon="barcode" />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- PANEL STOCK -->
          <q-tab-panel name="stock" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-card flat bordered class="rounded-12">
                  <q-card-section class="q-gutter-y-md">
                    <div class="text-subtitle1 text-weight-bold text-primary">Gestión de Existencias</div>
                    
                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <q-input
                          v-model.number="productoTemporal.stockUnidades"
                          label="Stock Inicial *"
                          outlined
                          dense
                          type="number"
                          min="0"
                          bg-color="blue-1"
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-input
                          v-model.number="productoTemporal.stockMinimo"
                          label="Punto de Reorden (Mínimo) *"
                          outlined
                          dense
                          type="number"
                          min="0"
                          bg-color="orange-1"
                        />
                      </div>
                    </div>

                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="productoTemporal.unidadMedidaId"
                          :options="unidadesDisponibles"
                          label="Unidad de Medida *"
                          outlined
                          dense
                          emit-value
                          map-options
                        />
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="productoTemporal.ubicacionId"
                          :options="catalogos.ubicaciones"
                          option-label="nombre"
                          option-value="id"
                          label="Ubicación Física"
                          outlined
                          dense
                          emit-value
                          map-options
                        />
                      </div>
                    </div>

                    <q-separator q-my-sm />

                    <!-- Manejo fraccionado -->
                    <div class="bg-indigo-1 q-pa-md rounded-8">
                      <div class="row items-center no-wrap">
                        <q-icon name="science" color="primary" size="md" class="q-mr-md" />
                        <div>
                          <div class="text-weight-bold">Fraccionamiento y Dosis</div>
                          <q-toggle
                            v-model="productoTemporal.manejoFraccionado"
                            label="Permitir venta/uso fraccionado"
                            color="primary"
                          />
                        </div>
                      </div>

                      <div v-if="productoTemporal.manejoFraccionado" class="row q-col-gutter-sm q-mt-sm">
                        <div class="col-6">
                          <q-input v-model.number="productoTemporal.contenidoPorEnvase" label="Contenido/Envase" outlined dense type="number" />
                        </div>
                        <div class="col-6">
                          <q-input v-model="productoTemporal.unidadEnvase" label="Unidad (ml, gr, etc)" outlined dense />
                        </div>
                        <div class="col-6">
                          <q-input v-model.number="productoTemporal.dosisPorAplicacion" label="Dosis Estándar" outlined dense type="number" />
                        </div>
                        <div class="col-6">
                          <q-input v-model="productoTemporal.unidadDosis" label="Unidad Dosis" outlined dense />
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- PANEL PRECIOS -->
          <q-tab-panel name="precios" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-card flat bordered class="rounded-12">
                  <q-card-section class="q-gutter-y-md text-center">
                    <div class="text-subtitle1 text-weight-bold text-primary text-left">Estructura de Costeo</div>
                    
                    <q-input
                      v-model.number="productoTemporal.costoUnitario"
                      label="Costo de Adquisición *"
                      outlined
                      dense
                      type="number"
                      prefix="$"
                      input-class="text-h6 text-weight-bold"
                    />

                    <q-input
                      v-model.number="productoTemporal.precioVenta"
                      label="Precio de Venta Sugerido *"
                      outlined
                      dense
                      type="number"
                      prefix="$"
                      color="positive"
                      input-class="text-h6 text-weight-bold text-positive"
                    />

                    <div class="q-pa-md bg-grey-2 rounded-8 row items-center justify-between">
                      <div class="text-subtitle2">Margen Estimado:</div>
                      <div class="text-h6 text-primary">{{ calcularMargenGanancia() }}%</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- PANEL ADICIONAL -->
          <q-tab-panel name="adicional" class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-card flat bordered class="rounded-12">
                  <q-card-section class="q-gutter-y-md">
                    <div class="text-subtitle1 text-weight-bold text-primary">Lote de Entrada Inicial</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <q-input v-model="productoTemporal.lote" label="Número de Lote" outlined dense />
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-input v-model="productoTemporal.fechaVencimiento" label="Fecha de Vencimiento" outlined dense type="date" stack-label />
                      </div>
                    </div>

                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="productoTemporal.id_proveedor"
                          :options="proveedoresOpciones"
                          label="Proveedor Predeterminado"
                          outlined
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend><q-icon name="local_shipping" color="primary" /></template>
                        </q-select>
                      </div>
                      <div class="col-12 col-sm-6">
                        <q-select
                          v-model="productoTemporal.id_fabricante"
                          :options="fabricantesOpciones"
                          label="Fabricante / Marca"
                          outlined
                          dense
                          emit-value
                          map-options
                        >
                          <template v-slot:prepend><q-icon name="factory" color="primary" /></template>
                        </q-select>
                      </div>
                    </div>

                    <q-separator class="q-my-md" />
                    
                    <div class="text-subtitle1 text-weight-bold text-primary">Estado del Registro</div>
                    <q-toggle v-model="productoTemporal.activo" label="Producto habilitado para venta y receta" color="positive" />
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-white">
          <q-btn flat label="Cancelar" color="grey-7" @click="cancelarProducto" class="q-px-md" />
          <q-btn 
            color="primary" 
            :label="productoEditando ? 'Actualizar Producto' : 'Registrar Producto'" 
            @click="guardarProducto" 
            unelevated 
            class="q-px-lg rounded-8"
            :loading="cargando"
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

    <!-- Modal para Proveedor Rediseñado -->
    <q-dialog v-model="mostrarModalProveedor" persistent>
      <q-card style="width: 600px; max-width: 90vw;" class="rounded-12 shadow-10">
        <q-card-section class="bg-gradient-primary text-white q-py-md">
          <div class="row items-center">
            <q-icon name="local_shipping" size="md" class="q-mr-md" />
            <div class="col">
              <div class="text-h6">{{ proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</div>
              <div class="text-caption">Registra la información de tus aliados comerciales</div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md q-gutter-y-sm">
          <div class="text-subtitle2 text-primary q-mb-none"><q-icon name="business" /> Datos Fiscales</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input v-model="proveedorTemporal.nombre" label="Nombre Comercial *" outlined dense class="rounded-8" :rules="[val => !!val || 'Requerido']" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="proveedorTemporal.razonSocial" label="Razón Social" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="proveedorTemporal.rfc" label="RFC / Tax ID" outlined dense />
            </div>
          </div>

          <q-separator class="q-my-sm" />
          <div class="text-subtitle2 text-primary q-mb-none"><q-icon name="contact_phone" /> Medios de Contacto</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="proveedorTemporal.telefono" label="Teléfono" outlined dense mask="(###) ###-####" hint="Formato: (000) 000-0000" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="proveedorTemporal.email" label="Email Corporativo" outlined dense type="email" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="proveedorTemporal.contacto" label="Persona de Contacto" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="proveedorTemporal.direccion" label="Dirección" outlined dense />
            </div>
          </div>

          <q-input v-model="proveedorTemporal.notas" label="Notas Adicionales" outlined dense type="textarea" rows="2" />
        </q-card-section>

        <q-separator />
        
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn 
            color="primary" 
            :label="proveedorEditando ? 'Actualizar' : 'Registrar'" 
            @click="guardarProveedor" 
            unelevated 
            class="q-px-lg rounded-8"
            :loading="cargando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Selección de Productos (Nueva Venta / Ajuste) -->
    <q-dialog v-model="mostrarModalVenta" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-grey-2">
        <q-card-section class="bg-primary text-white q-py-sm">
          <div class="row items-center no-wrap">
            <q-icon name="add_shopping_cart" size="md" class="q-mr-md" />
            <div class="col">
              <div class="text-h6 text-weight-bold">Selector de Productos</div>
              <div class="text-caption opacity-80">Selecciona productos del catálogo para agregar a la transacción</div>
            </div>
            <q-btn flat round dense icon="close" @click="cancelarVenta" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Panel Izquierdo: Buscador y Catálogo -->
            <div class="col-12 col-md-8">
              <q-card flat bordered class="rounded-16 shadow-2">
                <q-card-section class="q-pa-md bg-white">
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-grow">
                      <q-input 
                        v-model="filtroTextoVenta" 
                        placeholder="Buscar por nombre o código..." 
                        outlined 
                        dense 
                        bg-color="grey-1"
                        @keyup.enter="buscarEnCatalogo"
                      >
                        <template v-slot:prepend><q-icon name="search" color="primary" /></template>
                      </q-input>
                    </div>
                    <div class="col-auto">
                      <q-select 
                        v-model="filtroCategoriaVenta" 
                        :options="categoriasDisponibles" 
                        label="Categoría" 
                        outlined 
                        dense 
                        clearable 
                        style="min-width: 150px"
                      />
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pa-md scroll" style="height: 60vh">
                  <div class="row q-col-gutter-md">
                    <div 
                      v-for="producto in productosFiltradosParaVenta" 
                      :key="producto.id"
                      class="col-12 col-sm-6 col-lg-4"
                    >
                      <q-card 
                        flat 
                        bordered 
                        class="producto-item-card cursor-pointer hover-shadow"
                        @click="seleccionarProductoParaVenta(producto)"
                      >
                        <q-card-section class="q-pa-sm">
                          <div class="row items-center no-wrap">
                            <q-avatar size="40px" font-size="20px" color="indigo-1" text-color="primary" icon="inventory_2" />
                            <div class="col q-ml-sm">
                              <div class="text-weight-bold text-blue-9 text-truncate">{{ producto.nombre }}</div>
                              <div class="text-caption text-grey-7">{{ getCategoriaLabel(producto.categoriaId) }}</div>
                            </div>
                          </div>
                        </q-card-section>
                        <q-separator />
                        <q-card-section class="q-pa-xs bg-grey-1 row items-center justify-between">
                          <div class="q-px-sm">
                            <span class="text-caption text-grey-6">Stock: </span>
                            <span :class="producto.stockUnidades <= producto.stockMinimo ? 'text-negative text-weight-bold' : 'text-positive'">{{ producto.stockUnidades }}</span>
                          </div>
                          <div class="text-weight-bold text-primary q-px-sm">${{ producto.precioVenta?.toFixed(2) }}</div>
                        </q-card-section>
                        <q-btn 
                          flat 
                          dense 
                          round 
                          icon="add" 
                          color="primary" 
                          class="absolute-top-right q-ma-xs bg-white shadow-1" 
                          size="sm"
                        />
                      </q-card>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Panel Derecho: Detalle de Venta / Carrito -->
            <div class="col-12 col-md-4">
              <q-card flat bordered class="rounded-16 shadow-4 bg-white sticky-cart">
                <q-card-section class="bg-indigo-9 text-white q-py-sm">
                  <div class="text-subtitle1 text-weight-bold row items-center">
                    <q-icon name="receipt_long" class="q-mr-sm" />
                    Detalle de Transacción
                  </div>
                </q-card-section>

                <q-card-section class="q-pa-none scroll" style="height: 50vh">
                  <q-list separator>
                    <q-item v-for="(item, index) in ventaTemporal.productos" :key="item.id">
                      <q-item-section>
                        <q-item-label class="text-weight-bold">{{ item.nombre }}</q-item-label>
                        <q-item-label caption>
                          <div class="row items-center q-gutter-x-sm">
                            <q-input 
                              v-model.number="item.cantidad" 
                              type="number" 
                              dense 
                              outlined 
                              style="width: 70px" 
                              size="xs"
                              @update:model-value="calcularTotalVenta"
                            />
                            <span>{{ item.unidadMedida }} x ${{ item.precioUnitario?.toFixed(2) }}</span>
                          </div>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="column items-end">
                          <span class="text-weight-bold text-blue-10">${{ item.subtotal?.toFixed(2) }}</span>
                          <q-btn flat round dense icon="delete" color="negative" size="sm" @click="removerProductoDeVenta(index)" />
                        </div>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="ventaTemporal.productos.length === 0" class="q-py-xl text-center text-grey">
                      <q-item-section>
                        <q-icon name="shopping_basket" size="xl" class="q-mx-auto q-mb-md opacity-20" />
                        No hay productos seleccionados
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pa-md bg-grey-1">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6">TOTAL:</div>
                    <div class="text-h4 text-weight-bolder text-primary">${{ ventaTemporal.total?.toFixed(2) }}</div>
                  </div>
                  <q-btn 
                    color="positive" 
                    label="Procesar Transacción" 
                    icon="check_circle" 
                    class="full-width q-py-md rounded-8 text-weight-bold shadow-2"
                    :disable="ventaTemporal.productos.length === 0"
                    @click="procesarVenta"
                    unelevated
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="mostrarModalImpresion">
      <q-card style="min-width: 450px" class="rounded-16">
        <q-card-section class="bg-gradient-print text-white row items-center">
          <div class="text-h6"><q-icon name="print" class="q-mr-sm" /> Módulo de Reportería</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md q-gutter-y-md">
           <p class="text-body2 text-grey-8">Selecciona qué documento necesitas emitir en formato PDF para formalizar las existencias farmacéuticas.</p>
           
           <q-list bordered separator class="rounded-borders">
             <q-item clickable @click="imprimirReporte('inventario_completo')" v-ripple>
               <q-item-section avatar><q-avatar color="primary" text-color="white" icon="inventory_2" /></q-item-section>
               <q-item-section>
                 <q-item-label class="text-weight-bold">Inventario Completo</q-item-label>
                 <q-item-label caption>Genera un PDF con todas las existencias actuales.</q-item-label>
               </q-item-section>
               <q-item-section side><q-icon name="chevron_right" /></q-item-section>
             </q-item>
             <q-item clickable @click="imprimirReporte('stock_bajo')" v-ripple>
               <q-item-section avatar><q-avatar color="warning" text-color="white" icon="warning" /></q-item-section>
               <q-item-section>
                 <q-item-label class="text-weight-bold">Productos con Stock Bajo</q-item-label>
                 <q-item-label caption>Útil para órdenes de compra.</q-item-label>
               </q-item-section>
               <q-item-section side><q-icon name="chevron_right" /></q-item-section>
             </q-item>
             <q-item clickable @click="imprimirReporte('proximos_vencer')" v-ripple>
               <q-item-section avatar><q-avatar color="deep-orange" text-color="white" icon="event_busy" /></q-item-section>
               <q-item-section>
                 <q-item-label class="text-weight-bold">Lotes a Caducar</q-item-label>
                 <q-item-label caption>Identifica frascos o empaques que deben salir.</q-item-label>
               </q-item-section>
               <q-item-section side><q-icon name="chevron_right" /></q-item-section>
             </q-item>
           </q-list>
        </q-card-section>
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
import useCatalogos from 'src/composables/useCatalogos'
import { Modulo, Tabla } from 'src/common/enums/configuracion.enum'

const $q = useQuasar()
const { obtenerCatalogo } = useCatalogos()

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
const tabSeleccionada = ref('dashboard')

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
const mostrarModalImpresion = ref(false)
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

// Filtros para el Selector de Productos en Grid
const filtroTextoVenta = ref('')
const filtroCategoriaVenta = ref(null)

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
  id_fabricante: null,
  id_proveedor: null,
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

// Catálogos dinámicos
const catalogos = ref({
  categorias: [],
  tipos: [],
  unidades: [],
  ubicaciones: [],
  proveedores: [],
  fabricantes: []
})

// Opciones calculadas para selects
const categoriasDisponibles = computed(() => catalogos.value.categorias)
const tiposDisponibles = computed(() => catalogos.value.tipos)
const unidadesDisponibles = computed(() => catalogos.value.unidades)
const proveedoresOpciones = computed(() => 
  catalogos.value.proveedores.map(p => ({
    label: p.nombre,
    value: p.id,
    contacto: p.contacto
  }))
)

const fabricantesOpciones = computed(() => 
  catalogos.value.fabricantes.map(f => ({
    label: f.nombre,
    value: f.id
  }))
)

// Opciones estáticas (se mantienen por ser de lógica interna)
const estadosStock = [
  { label: 'Disponible', value: 'disponible', color: 'positive' },
  { label: 'Stock Bajo', value: 'bajo_stock', color: 'warning' },
  { label: 'Agotado', value: 'agotado', color: 'negative' },
  { label: 'Vencido', value: 'vencido', color: 'grey-8' }
]

const tiposAjuste = [
  { label: 'Entrada manual', value: 'entrada', icon: 'add_circle' },
  { label: 'Salida manual', value: 'salida', icon: 'remove_circle' },
  { label: 'Ajuste de inventario (+)', value: 'ajuste_positivo', icon: 'trending_up' },
  { label: 'Ajuste de inventario (-)', value: 'ajuste_negativo', icon: 'trending_down' }
]

const tiposMovimiento = [
  { label: 'Compra', value: 'COMPRA' },
  { label: 'Venta', value: 'VENTA' },
  { label: 'Ajuste', value: 'AJUSTE' },
  { label: 'Merma', value: 'MERMA' },
  { label: 'Devolución', value: 'DEVOLUCION' }
]

const tabProducto = ref('general') // Control de tabs en modal producto

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

const productosFiltradosParaVenta = computed(() => {
  let listado = productos.value.filter(p => p.activo && p.stockUnidades > 0)
  
  if (filtroTextoVenta.value) {
    const texto = filtroTextoVenta.value.toLowerCase()
    listado = listado.filter(p => 
      p.nombre.toLowerCase().includes(texto) ||
      p.codigo?.toLowerCase().includes(texto) ||
      p.codigoBarras?.toLowerCase().includes(texto)
    )
  }
  
  if (filtroCategoriaVenta.value) {
    listado = listado.filter(p => p.categoriaId === filtroCategoriaVenta.value.value)
  }
  
  return listado
})

const productosProximosYAgotados = computed(() => {
  return productosFiltrados.value
    .filter(p => getEstadoStock(p) !== 'normal')
    .sort((a,b) => a.stockUnidades - b.stockUnidades)
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

const getCategoriaLabel = (id) => {
  const cat = catalogos.value.categorias.find(c => c.id === id)
  return cat?.nombre || 'Sin Categoría'
}

const getCategoriaIcon = (id) => {
  const cat = catalogos.value.categorias.find(c => c.id === id)
  return cat?.icono || 'category'
}

const getTipoLabel = (id) => {
  const t = catalogos.value.tipos.find(t => t.id === id)
  return t?.nombre || 'Sin Tipo'
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
  // Aseguramos que los campos de ID estén correctamente asignados
  productoTemporal.value = { 
    ...producto,
    categoriaId: producto.categoriaId || null,
    tipoId: producto.tipoId || null,
    unidadMedidaId: producto.unidadMedidaId || null,
    ubicacionId: producto.ubicacionId || null,
    id_proveedor: producto.id_proveedor || null,
    id_fabricante: producto.id_fabricante || null
  }
  
  // Resetear tab al abrir
  tabProducto.value = 'general'
  
  // Calcular propiedades derivadas para medicamentos fraccionados
  if (producto.manejoFraccionado) {
    productoTemporal.value.dosisTotal = Math.floor(
      (producto.contenidoPorEnvase || 0) / (producto.dosisPorAplicacion || 1)
    )
  }
  mostrarModalProducto.value = true
}

const guardarProducto = async () => {
  if (!validarProducto()) {
    $q.notify({ color: 'warning', message: 'Por favor completa los campos requeridos (*)' })
    return
  }
  
  cargando.value = true
  try {
    const payload = { ...productoTemporal.value }
    
    if (productoEditando.value) {
      await inventarioService.productos.update(productoEditando.value.id, payload)
      $q.notify({ 
        color: 'positive', 
        message: 'Producto actualizado con éxito',
        icon: 'check_circle'
      })
    } else {
      await inventarioService.productos.create(payload)
      $q.notify({ 
        color: 'positive', 
        message: 'Producto registrado con éxito',
        icon: 'add_task'
      })
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
  return !!(
    productoTemporal.value.nombre && 
    productoTemporal.value.categoriaId && 
    productoTemporal.value.tipoId
  )
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
    categoriaId: null,
    tipoId: null,
    stockUnidades: 0,
    stockMinimo: 0,
    unidadMedidaId: null,
    ubicacionId: null,
    costoUnitario: 0,
    precioVenta: 0,
    lote: '',
    fechaVencimiento: '',
    proveedorId: null,
    manejoFraccionado: false,
    contenidoPorEnvase: 0,
    unidadEnvase: '',
    dosisPorAplicacion: 0,
    unidadDosis: '',
    activo: true
  }
  tabProducto.value = 'general'
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

const seleccionarProductoParaVenta = (producto) => {
  // Verificar si ya está en la lista
  const existente = ventaTemporal.value.productos.find(p => p.productoId === producto.id)
  if (existente) {
    existente.cantidad++
    calcularTotalVenta()
  } else {
    // Agregar nuevo
    ventaTemporal.value.productos.push({
      id: `item_${Date.now()}_${producto.id}`,
      productoId: producto.id,
      nombre: producto.nombre,
      tipoVenta: 'completo',
      cantidad: 1,
      unidadMedida: getUnidadMedidaLabel(producto.unidadMedidaId),
      precioUnitario: producto.precioVenta,
      subtotal: producto.precioVenta
    })
    calcularTotalVenta()
  }
  
  $q.notify({
    message: `${producto.nombre} agregado`,
    color: 'positive',
    icon: 'add_shopping_cart',
    timeout: 500,
    position: 'bottom-right'
  })
}

const buscarEnCatalogo = () => {
  // El computed ya maneja el filtrado reactivo
}

const getUnidadMedidaLabel = (id) => {
  const unidad = catalogos.value.unidades.find(u => u.id === id)
  return unidad?.nombre || 'Unid'
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

const imprimirReporte = async (tipo) => {
  try {
    $q.loading.show({
      message: 'Construyendo documento PDF, por favor espera...',
      spinnerColor: 'primary'
    })
    
    const response = await inventarioService.reportes.descargarPdf(tipo)
    
    // Crear objeto Blob con la data del PDF
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    
    // Abrir en otra pestaña
    window.open(url, '_blank')
    
    $q.notify({ 
      type: 'positive', 
      message: 'Reporte generado con éxito', 
      icon: 'check_circle'
    })
  } catch (error) {
    console.error('Error generando reporte PDF:', error)
    $q.notify({ 
      type: 'negative', 
      message: 'Hubo un error al generar el reporte en el backend', 
      icon: 'error'
    })
  } finally {
    $q.loading.hide()
  }
}

// Métodos de persistencia
const cargarDatos = async () => {
  cargando.value = true
  try {
    const [
      resProd, 
      resProv, 
      resUbi
    ] = await Promise.all([
      inventarioService.productos.getAll(),
      inventarioService.proveedores.getAll(),
      inventarioService.ubicaciones.getActive()
    ])

    productos.value = resProd.data
    
    // Asignar catálogos usando useCatalogos
    catalogos.value.categorias = await obtenerCatalogo(Modulo.INVENTARIO, Tabla.CATEGORIA_PRODUCTO)
    catalogos.value.tipos = await obtenerCatalogo(Modulo.INVENTARIO, Tabla.TIPO_PRODUCTO)
    catalogos.value.unidades = await obtenerCatalogo(Modulo.INVENTARIO, Tabla.UNIDAD_MEDIDA)
    catalogos.value.ubicaciones = resUbi.data || []
    
    catalogos.value.proveedores = resProv.data || []
    
    const resFab = await inventarioService.fabricantes.getActive()
    catalogos.value.fabricantes = resFab.data || []

    proveedores.value = resProv.data || []
    categorias.value = resCat.data || []
    tiposProducto.value = resTip.data || []
    unidadesMedida.value = resUni.data || []
    ubicaciones.value = resUbi.data || []

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

/* Dashboard Premium Styles */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

.kpi-card {
  border-radius: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.15);
}

.kpi-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 6px; height: 100%;
}

.kpi-primary::before { background: linear-gradient(180deg, #2196f3, #0d47a1); }
.kpi-secondary::before { background: linear-gradient(180deg, #9c27b0, #4a148c); }
.kpi-warning::before { background: linear-gradient(180deg, #ff9800, #e65100); }
.kpi-danger::before { background: linear-gradient(180deg, #f44336, #b71c1c); }

.kpi-icon-wrapper {
  background: rgba(0,0,0,0.03);
  border-radius: 50%;
  padding: 12px;
  color: #555;
}

.kpi-primary .kpi-icon-wrapper { color: #1976d2; background: rgba(25, 118, 210, 0.1); }
.kpi-secondary .kpi-icon-wrapper { color: #9c27b0; background: rgba(156, 39, 176, 0.1); }
.kpi-warning .kpi-icon-wrapper { color: #ff9800; background: rgba(255, 152, 0, 0.1); }
.kpi-danger .kpi-icon-wrapper { color: #f44336; background: rgba(244, 67, 54, 0.1); }

.rounded-16 { border-radius: 16px; }

.bg-gradient-print {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}
.shadow-gradient {
  box-shadow: 0 10px 30px -10px rgba(30, 60, 114, 0.5);
}
</style>
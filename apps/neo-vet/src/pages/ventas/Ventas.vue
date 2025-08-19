<template>
  <div class="ventas-container">
    <!-- Header principal -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="point_of_sale" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Ventas y Facturación</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticasGenerales.ventasHoy }} ventas hoy •
              ${{ estadisticasGenerales.totalHoy.toFixed(2) }} facturado •
              {{ estadisticasGenerales.productosVendidos }} productos vendidos
            </div>
          </div>
          <div class="col-auto">
            <div class="row q-gutter-sm">
              <q-btn
                flat
                round
                icon="add_shopping_cart"
                @click="nuevaVenta"
                :disable="modoLectura"
              >
                <q-tooltip>Nueva Venta</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="receipt"
                @click="mostrarModalReportes = true"
              >
                <q-tooltip>Reportes de Ventas</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                icon="analytics"
                @click="mostrarModalEstadisticas = true"
              >
                <q-tooltip>Estadísticas</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filtros y resumen -->
    <q-card flat class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center q-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtroTexto"
              label="Buscar ventas..."
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
            <q-input
              v-model="filtroFechaDesde"
              label="Desde"
              outlined
              dense
              type="date"
            />
          </div>

          <div class="col-12 col-md-2">
            <q-input
              v-model="filtroFechaHasta"
              label="Hasta"
              outlined
              dense
              type="date"
            />
          </div>

          <div class="col-12 col-md-2">
            <q-select
              v-model="filtroEstado"
              :options="estadosVenta"
              label="Estado"
              outlined
              dense
              clearable
              option-label="label"
              option-value="value"
            />
          </div>

          <q-space />

          <!-- Tarjetas de resumen -->
          <div class="col-auto">
            <div class="row q-gutter-xs">
              <q-chip
                color="positive"
                text-color="white"
                :label="`$${estadisticasGenerales.totalHoy.toFixed(2)} Hoy`"
                icon="today"
              />
              <q-chip
                color="blue"
                text-color="white"
                :label="`$${estadisticasGenerales.totalMes.toFixed(2)} Este Mes`"
                icon="calendar_month"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Lista de ventas -->
    <q-card flat>
      <q-card-section class="q-pa-none">
        <q-table
          :rows="ventasFiltradas"
          :columns="columnasVentas"
          row-key="id"
          :pagination="paginacionVentas"
          :filter="filtroTexto"
          binary-state-sort
          :loading="cargando"
        >
          <template v-slot:top>
            <div class="row full-width items-center justify-between">
              <div class="text-h6">Historial de Ventas</div>
              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  icon="add"
                  label="Nueva Venta"
                  @click="nuevaVenta"
                  :disable="modoLectura"
                />
                <q-btn
                  flat
                  icon="file_download"
                  label="Exportar"
                  @click="exportarVentas"
                />
              </div>
            </div>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                :color="getEstadoColor(props.value)"
                text-color="white"
                :label="getEstadoLabel(props.value)"
                size="sm"
                dense
              />
            </q-td>
          </template>

          <template v-slot:body-cell-total="props">
            <q-td :props="props" class="text-weight-bold">
              ${{ props.value.toFixed(2) }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round icon="visibility" size="sm" @click="verDetalleVenta(props.row)">
                <q-tooltip>Ver Detalle</q-tooltip>
              </q-btn>
              <q-btn flat round icon="print" size="sm" @click="imprimirTicket(props.row)">
                <q-tooltip>Imprimir Ticket</q-tooltip>
              </q-btn>
              <q-btn-dropdown flat round icon="more_vert" size="sm">
                <q-list dense>
                  <q-item clickable @click="duplicarVenta(props.row)">
                    <q-item-section avatar mini>
                      <q-icon name="content_copy" color="blue"/>
                    </q-item-section>
                    <q-item-section>Duplicar Venta</q-item-section>
                  </q-item>
                  <q-item clickable @click="enviarPorEmail(props.row)">
                    <q-item-section avatar mini>
                      <q-icon name="email" color="teal"/>
                    </q-item-section>
                    <q-item-section>Enviar por Email</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="cancelarVentaCompleta(props.row)" v-if="props.row.estado === 'completada'">
                    <q-item-section avatar mini>
                      <q-icon name="cancel" color="negative"/>
                    </q-item-section>
                    <q-item-section>Cancelar Venta</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal para nueva venta -->
    <q-dialog v-model="mostrarModalVenta" persistent maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col-grow">
              <div class="text-h6">
                {{ ventaEditando ? 'Editar Venta' : 'Nueva Venta' }}
              </div>
              <div class="text-caption opacity-80" v-if="ventaTemporal.id">
                ID: {{ ventaTemporal.id }}
              </div>
            </div>
            <q-btn
              flat
              round
              icon="close"
              @click="cancelarVentaForm"
              class="q-ml-sm"
            />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Información del cliente -->
            <div class="col-12">
              <div class="text-h6 text-primary q-mb-md">Información del Cliente</div>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="ventaTemporal.cliente"
                label="Cliente *"
                outlined
                dense
                :rules="[val => !!val || 'El cliente es requerido']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="ventaTemporal.paciente"
                :options="pacientesDisponibles"
                label="Paciente (opcional)"
                outlined
                dense
                clearable
                option-label="nombre"
                option-value="id"
                use-input
                @filter="filtrarPacientes"
              />
            </div>

            <!-- Productos -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Productos</div>
            </div>

            <!-- Selector de productos -->
            <div class="col-12">
              <div class="row q-col-gutter-md q-mb-md bg-grey-1 q-pa-md rounded-borders">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="productoParaAgregar"
                    :options="productosDisponibles"
                    label="Seleccionar Producto"
                    outlined
                    dense
                    use-input
                    @filter="filtrarProductos"
                    option-label="nombre"
                    option-value="id"
                    :rules="[val => !!val || 'Selecciona un producto']"
                  >
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                          <q-item-label caption>
                            Stock: {{ scope.opt.stockUnidades }} {{ scope.opt.unidadMedida }} •
                            ${{ scope.opt.precioVenta.toFixed(2) }}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-chip
                            :color="getStockColor(scope.opt)"
                            text-color="white"
                            size="sm"
                            dense
                          >
                            {{ getStockLabel(scope.opt) }}
                          </q-chip>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-md-2" v-if="productoParaAgregar && productoParaAgregar.manejoFraccionado">
                  <q-select
                    v-model="tipoVentaSeleccionado"
                    :options="getTiposVentaDisponibles()"
                    label="Tipo de Venta"
                    outlined
                    dense
                    option-label="label"
                    option-value="value"
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-input
                    v-model.number="cantidadParaAgregar"
                    :label="getLabelCantidad()"
                    outlined
                    dense
                    type="number"
                    min="1"
                    :max="getMaximoCantidad()"
                    :rules="[val => val > 0 && val <= getMaximoCantidad() || 'Cantidad inválida']"
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-input
                    :model-value="calcularPrecioLinea()"
                    label="Subtotal"
                    outlined
                    dense
                    readonly
                    prefix="$"
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-btn
                    color="positive"
                    icon="add"
                    label="Agregar"
                    @click="agregarProductoAVenta"
                    :disable="!puedeAgregarProducto()"
                    class="full-width"
                  />
                </div>
              </div>
            </div>

            <!-- Tabla de productos agregados -->
            <div class="col-12" v-if="ventaTemporal.productos.length > 0">
              <q-table
                :rows="ventaTemporal.productos"
                :columns="columnasProductosVenta"
                row-key="id"
                dense
                flat
                hide-pagination
              >
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      round
                      icon="delete"
                      size="sm"
                      color="negative"
                      @click="removerProductoDeVenta(props.rowIndex)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>

            <!-- Resumen de totales -->
            <div class="col-12" v-if="ventaTemporal.productos.length > 0">
              <q-separator class="q-my-md"/>
              <div class="row justify-end">
                <div class="col-12 col-md-4">
                  <div class="bg-grey-1 q-pa-md rounded-borders">
                    <div class="row items-center justify-between q-mb-sm">
                      <span class="text-body1">Subtotal:</span>
                      <span class="text-body1">${{ ventaTemporal.subtotal.toFixed(2) }}</span>
                    </div>
                    <div class="row items-center justify-between q-mb-sm">
                      <span class="text-body1">Descuento:</span>
                      <q-input
                        v-model.number="ventaTemporal.descuento"
                        dense
                        outlined
                        type="number"
                        min="0"
                        :max="ventaTemporal.subtotal"
                        style="width: 100px"
                        prefix="$"
                      />
                    </div>
                    <div class="row items-center justify-between q-mb-sm">
                      <span class="text-body1">IVA (16%):</span>
                      <span class="text-body1">${{ ventaTemporal.iva.toFixed(2) }}</span>
                    </div>
                    <q-separator class="q-my-sm"/>
                    <div class="row items-center justify-between">
                      <span class="text-h6 text-weight-bold">Total:</span>
                      <span class="text-h6 text-weight-bold text-positive">${{ ventaTemporal.total.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="col-12" v-if="ventaTemporal.productos.length > 0">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Método de Pago</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="ventaTemporal.metodoPago"
                    :options="metodosPago"
                    label="Método de Pago *"
                    outlined
                    dense
                    option-label="label"
                    option-value="value"
                  />
                </div>

                <div class="col-12 col-md-4" v-if="ventaTemporal.metodoPago === 'efectivo'">
                  <q-input
                    v-model.number="ventaTemporal.montoRecibido"
                    label="Monto Recibido"
                    outlined
                    dense
                    type="number"
                    min="0"
                    prefix="$"
                  />
                </div>

                <div class="col-12 col-md-4" v-if="ventaTemporal.metodoPago === 'efectivo' && ventaTemporal.montoRecibido">
                  <q-input
                    :model-value="calcularCambio()"
                    label="Cambio"
                    outlined
                    dense
                    readonly
                    prefix="$"
                  />
                </div>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="col-12">
              <q-input
                v-model="ventaTemporal.observaciones"
                label="Observaciones"
                outlined
                dense
                type="textarea"
                rows="2"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarVentaForm"/>
          <q-btn
            color="positive"
            icon="shopping_cart"
            label="Procesar Venta"
            @click="procesarVenta"
            :disable="!puedeCompletarVenta()"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para detalle de venta -->
    <q-dialog v-model="mostrarModalDetalle" maximized>
      <q-card v-if="ventaSeleccionada">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col-grow">
              <div class="text-h6">Detalle de Venta #{{ ventaSeleccionada.numero }}</div>
              <div class="text-caption opacity-80">
                {{ formatDateTime(ventaSeleccionada.fecha) }}
              </div>
            </div>
            <q-btn
              flat
              round
              icon="close"
              @click="mostrarModalDetalle = false"
            />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Información general -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Información General</div>
                  <div class="info-row"><strong>Cliente:</strong> {{ ventaSeleccionada.cliente }}</div>
                  <div class="info-row" v-if="ventaSeleccionada.paciente">
                    <strong>Paciente:</strong> {{ getPacienteNombre(ventaSeleccionada.paciente) }}
                  </div>
                  <div class="info-row"><strong>Estado:</strong>
                    <q-chip
                      :color="getEstadoColor(ventaSeleccionada.estado)"
                      text-color="white"
                      :label="getEstadoLabel(ventaSeleccionada.estado)"
                      size="sm"
                    />
                  </div>
                  <div class="info-row"><strong>Método de Pago:</strong> {{ getMetodoPagoLabel(ventaSeleccionada.metodoPago) }}</div>
                  <div class="info-row"><strong>Usuario:</strong> {{ ventaSeleccionada.usuario }}</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Resumen financiero -->
            <div class="col-12 col-md-6">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Resumen Financiero</div>
                  <div class="info-row"><strong>Subtotal:</strong> ${{ ventaSeleccionada.subtotal.toFixed(2) }}</div>
                  <div class="info-row"><strong>Descuento:</strong> ${{ ventaSeleccionada.descuento.toFixed(2) }}</div>
                  <div class="info-row"><strong>IVA:</strong> ${{ ventaSeleccionada.iva.toFixed(2) }}</div>
                  <div class="info-row total-row"><strong>Total:</strong> ${{ ventaSeleccionada.total.toFixed(2) }}</div>
                  <div class="info-row" v-if="ventaSeleccionada.montoRecibido">
                    <strong>Recibido:</strong> ${{ ventaSeleccionada.montoRecibido.toFixed(2) }}
                  </div>
                  <div class="info-row" v-if="ventaSeleccionada.cambio">
                    <strong>Cambio:</strong> ${{ ventaSeleccionada.cambio.toFixed(2) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Productos vendidos -->
            <div class="col-12">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Productos Vendidos</div>
                  <q-table
                    :rows="ventaSeleccionada.productos"
                    :columns="columnasDetalleVenta"
                    row-key="id"
                    flat
                    hide-pagination
                  />
                </q-card-section>
              </q-card>
            </div>

            <!-- Observaciones -->
            <div class="col-12" v-if="ventaSeleccionada.observaciones">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Observaciones</div>
                  <p>{{ ventaSeleccionada.observaciones }}</p>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" @click="mostrarModalDetalle = false"/>
          <q-btn color="blue" icon="print" label="Imprimir" @click="imprimirTicket(ventaSeleccionada)"/>
          <q-btn color="teal" icon="email" label="Enviar por Email" @click="enviarPorEmail(ventaSeleccionada)"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de reportes -->
    <q-dialog v-model="mostrarModalReportes" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col-grow">
              <div class="text-h6">Reportes de Ventas</div>
            </div>
            <q-btn
              flat
              round
              icon="close"
              @click="mostrarModalReportes = false"
            />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Filtros de reporte -->
            <div class="col-12">
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="reportes.fechaDesde"
                    label="Fecha Desde"
                    outlined
                    dense
                    type="date"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="reportes.fechaHasta"
                    label="Fecha Hasta"
                    outlined
                    dense
                    type="date"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="reportes.tipoReporte"
                    :options="tiposReporte"
                    label="Tipo de Reporte"
                    outlined
                    dense
                    option-label="label"
                    option-value="value"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-btn
                    color="primary"
                    icon="analytics"
                    label="Generar Reporte"
                    @click="generarReporte"
                    class="full-width"
                  />
                </div>
              </div>
            </div>

            <!-- Estadísticas de resumen -->
            <div class="col-12">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-card">
                    <q-card-section class="text-center">
                      <div class="stat-value text-positive">${{ reportes.datos.totalVentas.toFixed(2) }}</div>
                      <div class="stat-label">Total Ventas</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-card">
                    <q-card-section class="text-center">
                      <div class="stat-value text-blue">{{ reportes.datos.numeroVentas }}</div>
                      <div class="stat-label">Número de Ventas</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-card">
                    <q-card-section class="text-center">
                      <div class="stat-value text-orange">${{ reportes.datos.promedioVenta.toFixed(2) }}</div>
                      <div class="stat-label">Promedio por Venta</div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-3">
                  <q-card flat bordered class="stat-card">
                    <q-card-section class="text-center">
                      <div class="stat-value text-teal">{{ reportes.datos.productosVendidos }}</div>
                      <div class="stat-label">Productos Vendidos</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>

            <!-- Tabla de reporte -->
            <div class="col-12" v-if="reportes.datos.ventas.length > 0">
              <q-table
                :rows="reportes.datos.ventas"
                :columns="columnasReporte"
                row-key="id"
                :pagination="paginacionReporte"
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de estadísticas -->
    <q-dialog v-model="mostrarModalEstadisticas" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Estadísticas de Ventas</div>
          <q-btn
            flat
            round
            icon="close"
            @click="mostrarModalEstadisticas = false"
            class="absolute-top-right q-ma-sm"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Gráfico de ventas por día (placeholder) -->
            <div class="col-12 col-md-8">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Ventas por Día</div>
                  <div class="chart-placeholder">
                    <q-icon name="analytics" size="64px" color="grey-4"/>
                    <div class="text-grey-6">Gráfico de ventas por día</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Top productos -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Top Productos</div>
                  <div v-for="(producto, index) in topProductos" :key="index" class="top-producto-item">
                    <div class="row items-center">
                      <div class="col-grow">
                        <div class="text-weight-medium">{{ producto.nombre }}</div>
                        <div class="text-caption text-grey-6">{{ producto.cantidad }} vendidos</div>
                      </div>
                      <div class="col-auto text-weight-bold">
                        ${{ producto.total.toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  modoLectura: {
    type: Boolean,
    default: false
  },
  inventario: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['venta-procesada', 'inventario-actualizado'])

// Estados principales
const ventas = ref([])
const cargando = ref(false)

// Estados de modales
const mostrarModalVenta = ref(false)
const mostrarModalDetalle = ref(false)
const mostrarModalReportes = ref(false)
const mostrarModalEstadisticas = ref(false)
const ventaEditando = ref(null)
const ventaSeleccionada = ref(null)

// Estados de filtros
const filtroTexto = ref('')
const filtroFechaDesde = ref('')
const filtroFechaHasta = ref('')
const filtroEstado = ref('')

// Estados para nueva venta
const ventaTemporal = ref({
  id: '',
  numero: '',
  fecha: '',
  cliente: '',
  paciente: null,
  productos: [],
  subtotal: 0,
  descuento: 0,
  iva: 0,
  total: 0,
  metodoPago: '',
  montoRecibido: 0,
  cambio: 0,
  estado: 'completada',
  usuario: 'Usuario Actual',
  observaciones: ''
})

const productoParaAgregar = ref(null)
const cantidadParaAgregar = ref(1)
const tipoVentaSeleccionado = ref('completo')
const productosDisponibles = ref([])

// Estados para reportes
const reportes = ref({
  fechaDesde: new Date().toISOString().split('T')[0],
  fechaHasta: new Date().toISOString().split('T')[0],
  tipoReporte: 'ventas_detalle',
  datos: {
    totalVentas: 0,
    numeroVentas: 0,
    promedioVenta: 0,
    productosVendidos: 0,
    ventas: []
  }
})

// Opciones para selects
const estadosVenta = [
  { label: 'Completada', value: 'completada' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Cancelada', value: 'cancelada' },
  { label: 'Devuelta', value: 'devuelta' }
]

const metodosPago = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'Tarjeta de Crédito', value: 'tarjeta_credito' },
  { label: 'Tarjeta de Débito', value: 'tarjeta_debito' },
  { label: 'Transferencia', value: 'transferencia' },
  { label: 'Cheque', value: 'cheque' }
]

const tiposReporte = [
  { label: 'Ventas Detalladas', value: 'ventas_detalle' },
  { label: 'Resumen por Producto', value: 'productos_resumen' },
  { label: 'Resumen por Cliente', value: 'clientes_resumen' },
  { label: 'Análisis de Rentabilidad', value: 'rentabilidad' }
]

// Pacientes disponibles (esto vendría del módulo de pacientes)
const pacientesDisponibles = ref([
  { id: 1, nombre: 'Max - Perro Golden' },
  { id: 2, nombre: 'Luna - Gata Persa' },
  { id: 3, nombre: 'Rocky - Perro Bulldog' },
  { id: 4, nombre: 'Mimi - Gata Siamés' }
])

// Computed properties
const ventasFiltradas = computed(() => {
  let ventasFilt = [...ventas.value]

  if (filtroTexto.value) {
    const texto = filtroTexto.value.toLowerCase()
    ventasFilt = ventasFilt.filter(v =>
      v.cliente.toLowerCase().includes(texto) ||
      v.numero.toLowerCase().includes(texto) ||
      v.productos.some(p => p.nombre.toLowerCase().includes(texto))
    )
  }

  if (filtroFechaDesde.value) {
    ventasFilt = ventasFilt.filter(v =>
      new Date(v.fecha) >= new Date(filtroFechaDesde.value)
    )
  }

  if (filtroFechaHasta.value) {
    ventasFilt = ventasFilt.filter(v =>
      new Date(v.fecha) <= new Date(filtroFechaHasta.value + 'T23:59:59')
    )
  }

  if (filtroEstado.value) {
    ventasFilt = ventasFilt.filter(v => v.estado === filtroEstado.value.value)
  }

  return ventasFilt.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const estadisticasGenerales = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const ventasHoy = ventas.value.filter(v => v.fecha.startsWith(hoy) && v.estado === 'completada')
  const ventasMes = ventas.value.filter(v => v.fecha >= inicioMes && v.estado === 'completada')

  return {
    ventasHoy: ventasHoy.length,
    totalHoy: ventasHoy.reduce((acc, v) => acc + v.total, 0),
    totalMes: ventasMes.reduce((acc, v) => acc + v.total, 0),
    productosVendidos: ventasHoy.reduce((acc, v) => acc + v.productos.reduce((pAcc, p) => pAcc + p.cantidad, 0), 0)
  }
})

const topProductos = computed(() => {
  const productosStats = {}

  ventas.value.forEach(venta => {
    if (venta.estado === 'completada') {
      venta.productos.forEach(producto => {
        if (!productosStats[producto.nombre]) {
          productosStats[producto.nombre] = {
            nombre: producto.nombre,
            cantidad: 0,
            total: 0
          }
        }
        productosStats[producto.nombre].cantidad += producto.cantidad
        productosStats[producto.nombre].total += producto.subtotal
      })
    }
  })

  return Object.values(productosStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
})

// Columnas para las tablas
const columnasVentas = [
  {
    name: 'numero',
    label: 'Número',
    field: 'numero',
    align: 'left',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true,
    format: val => formatDateTime(val)
  },
  {
    name: 'cliente',
    label: 'Cliente',
    field: 'cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'productos',
    label: 'Productos',
    field: row => row.productos.length,
    align: 'center'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'metodoPago',
    label: 'Método Pago',
    field: 'metodoPago',
    align: 'center',
    format: val => getMetodoPagoLabel(val)
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'right',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: '',
    align: 'center'
  }
]

const columnasProductosVenta = [
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
    field: row => `${row.cantidad} ${row.unidadMedida}`,
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

const columnasDetalleVenta = [
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
    field: row => `${row.cantidad} ${row.unidadMedida}`,
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
  }
]

const columnasReporte = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    format: val => formatDate(val)
  },
  {
    name: 'numero',
    label: 'Número',
    field: 'numero',
    align: 'left'
  },
  {
    name: 'cliente',
    label: 'Cliente',
    field: 'cliente',
    align: 'left'
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'right',
    format: val => `${val?.toFixed(2)}`
  }
]

const paginacionVentas = ref({
  rowsPerPage: 15
})

const paginacionReporte = ref({
  rowsPerPage: 20
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

const getEstadoColor = (estado) => {
  const colores = {
    'completada': 'positive',
    'pendiente': 'warning',
    'cancelada': 'negative',
    'devuelta': 'deep-orange'
  }
  return colores[estado] || 'grey'
}

const getEstadoLabel = (estado) => {
  const est = estadosVenta.find(e => e.value === estado)
  return est?.label || estado
}

const getMetodoPagoLabel = (metodo) => {
  const met = metodosPago.find(m => m.value === metodo)
  return met?.label || metodo
}

const getPacienteNombre = (pacienteId) => {
  const paciente = pacientesDisponibles.value.find(p => p.id === pacienteId)
  return paciente?.nombre || ''
}

const getStockColor = (producto) => {
  if (producto.stockUnidades <= 0) return 'negative'
  if (producto.stockUnidades <= producto.stockMinimo) return 'warning'
  return 'positive'
}

const getStockLabel = (producto) => {
  if (producto.stockUnidades <= 0) return 'Sin Stock'
  if (producto.stockUnidades <= producto.stockMinimo) return 'Stock Bajo'
  return 'Normal'
}

// Métodos para nueva venta
const nuevaVenta = () => {
  ventaEditando.value = null
  limpiarVentaTemporal()
  ventaTemporal.value.fecha = new Date().toISOString()
  ventaTemporal.value.numero = generarNumeroVenta()
  mostrarModalVenta.value = true
}

const generarNumeroVenta = () => {
  const fecha = new Date()
  const timestamp = fecha.getTime().toString().slice(-6)
  return `V-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}-${timestamp}`
}

const filtrarPacientes = (val, update) => {
  update(() => {
    if (val === '') {
      pacientesDisponibles.value = [
        { id: 1, nombre: 'Max - Perro Golden' },
        { id: 2, nombre: 'Luna - Gata Persa' },
        { id: 3, nombre: 'Rocky - Perro Bulldog' },
        { id: 4, nombre: 'Mimi - Gata Siamés' }
      ]
    } else {
      const needle = val.toLowerCase()
      pacientesDisponibles.value = pacientesDisponibles.value.filter(p =>
        p.nombre.toLowerCase().includes(needle)
      )
    }
  })
}

const filtrarProductos = (val, update) => {
  update(() => {
    if (val === '') {
      productosDisponibles.value = props.inventario.filter(p =>
        p.activo && p.stockUnidades > 0
      )
    } else {
      const needle = val.toLowerCase()
      productosDisponibles.value = props.inventario.filter(p =>
        p.activo &&
        p.stockUnidades > 0 &&
        p.nombre.toLowerCase().includes(needle)
      )
    }
  })
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

const calcularDosisDisponibles = (producto) => {
  if (!producto.manejoFraccionado) return 0
  const totalContenido = producto.stockUnidades * producto.contenidoPorEnvase
  return Math.floor(totalContenido / producto.dosisPorAplicacion)
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
  calcularTotalesVenta()

  // Limpiar selección
  productoParaAgregar.value = null
  cantidadParaAgregar.value = 1
  tipoVentaSeleccionado.value = 'completo'
}

const removerProductoDeVenta = (index) => {
  ventaTemporal.value.productos.splice(index, 1)
  calcularTotalesVenta()
}

const calcularTotalesVenta = () => {
  ventaTemporal.value.subtotal = ventaTemporal.value.productos.reduce(
    (acc, producto) => acc + producto.subtotal, 0
  )

  const baseImponible = ventaTemporal.value.subtotal - (ventaTemporal.value.descuento || 0)
  ventaTemporal.value.iva = baseImponible * 0.16
  ventaTemporal.value.total = baseImponible + ventaTemporal.value.iva
}

const calcularCambio = () => {
  if (!ventaTemporal.value.montoRecibido) return '0.00'
  const cambio = ventaTemporal.value.montoRecibido - ventaTemporal.value.total
  return Math.max(0, cambio).toFixed(2)
}

const puedeCompletarVenta = () => {
  return ventaTemporal.value.cliente &&
         ventaTemporal.value.productos.length > 0 &&
         ventaTemporal.value.metodoPago &&
         (ventaTemporal.value.metodoPago !== 'efectivo' || ventaTemporal.value.montoRecibido >= ventaTemporal.value.total)
}

const procesarVenta = () => {
  if (!puedeCompletarVenta()) return

  // Calcular cambio si es pago en efectivo
  if (ventaTemporal.value.metodoPago === 'efectivo') {
    ventaTemporal.value.cambio = parseFloat(calcularCambio())
  }

  // Generar ID único
  ventaTemporal.value.id = `venta_${Date.now()}`

  // Agregar a la lista de ventas
  ventas.value.push({ ...ventaTemporal.value })

  // Emitir evento para actualizar inventario
  emit('venta-procesada', { ...ventaTemporal.value })

  // Cerrar modal y limpiar
  mostrarModalVenta.value = false
  limpiarVentaTemporal()

  // Guardar datos
  guardarDatos()
}

const cancelarVentaForm = () => {
  mostrarModalVenta.value = false
  ventaEditando.value = null
  limpiarVentaTemporal()
}

const limpiarVentaTemporal = () => {
  ventaTemporal.value = {
    id: '',
    numero: '',
    fecha: '',
    cliente: '',
    paciente: null,
    productos: [],
    subtotal: 0,
    descuento: 0,
    iva: 0,
    total: 0,
    metodoPago: '',
    montoRecibido: 0,
    cambio: 0,
    estado: 'completada',
    usuario: 'Usuario Actual',
    observaciones: ''
  }
  productoParaAgregar.value = null
  cantidadParaAgregar.value = 1
  tipoVentaSeleccionado.value = 'completo'
}

// Métodos para acciones de ventas
const verDetalleVenta = (venta) => {
  ventaSeleccionada.value = venta
  mostrarModalDetalle.value = true
}

const imprimirTicket = (venta) => {
  // Implementar lógica de impresión
  console.log('Imprimiendo ticket:', venta)
}

const enviarPorEmail = (venta) => {
  // Implementar lógica de envío por email
  console.log('Enviando por email:', venta)
}

const duplicarVenta = (venta) => {
  ventaEditando.value = null
  ventaTemporal.value = {
    ...venta,
    id: '',
    numero: generarNumeroVenta(),
    fecha: new Date().toISOString(),
    estado: 'completada'
  }
  mostrarModalVenta.value = true
}

const cancelarVentaCompleta = (venta) => {
  venta.estado = 'cancelada'
  guardarDatos()
}

const exportarVentas = () => {
  // Implementar lógica de exportación
  console.log('Exportando ventas:', ventasFiltradas.value)
}

// Métodos para reportes
const generarReporte = () => {
  let ventasReporte = ventas.value.filter(v => {
    const fechaVenta = v.fecha.split('T')[0]
    return fechaVenta >= reportes.value.fechaDesde &&
           fechaVenta <= reportes.value.fechaHasta &&
           v.estado === 'completada'
  })

  reportes.value.datos = {
    totalVentas: ventasReporte.reduce((acc, v) => acc + v.total, 0),
    numeroVentas: ventasReporte.length,
    promedioVenta: ventasReporte.length > 0 ? ventasReporte.reduce((acc, v) => acc + v.total, 0) / ventasReporte.length : 0,
    productosVendidos: ventasReporte.reduce((acc, v) => acc + v.productos.reduce((pAcc, p) => pAcc + p.cantidad, 0), 0),
    ventas: ventasReporte
  }
}

// Métodos de persistencia
const guardarDatos = () => {
  // Aquí se guardarían los datos en el backend o localStorage
  localStorage.setItem('ventas_veterinaria', JSON.stringify(ventas.value))
}

const cargarDatos = () => {
  // Cargar datos de ejemplo para demostración
  ventas.value = [
    {
      id: 'venta_001',
      numero: 'V-20240218-001234',
      fecha: '2024-02-18T14:30:00.000Z',
      cliente: 'María González',
      paciente: 1,
      productos: [
        {
          id: 'vp_001',
          productoId: 'prod_001',
          nombre: 'Amoxicilina 250mg - Frasco 100ml',
          tipoVenta: 'dosis',
          cantidad: 3,
          unidadMedida: 'dosis',
          precioUnitario: 6.00,
          subtotal: 18.00
        }
      ],
      subtotal: 18.00,
      descuento: 0,
      iva: 2.88,
      total: 20.88,
      metodoPago: 'efectivo',
      montoRecibido: 25.00,
      cambio: 4.12,
      estado: 'completada',
      usuario: 'Dr. Veterinario',
      observaciones: 'Tratamiento para infección respiratoria'
    },
    {
      id: 'venta_002',
      numero: 'V-20240218-001235',
      fecha: '2024-02-18T16:45:00.000Z',
      cliente: 'Carlos Pérez',
      paciente: 3,
      productos: [
        {
          id: 'vp_002',
          productoId: 'prod_002',
          nombre: 'Alimento Premium Perro Adulto',
          tipoVenta: 'completo',
          cantidad: 1,
          unidadMedida: 'sacos 15kg',
          precioUnitario: 650.00,
          subtotal: 650.00
        },
        {
          id: 'vp_003',
          productoId: 'prod_005',
          nombre: 'Suplemento Vitamínico Perros',
          tipoVenta: 'completo',
          cantidad: 1,
          unidadMedida: 'frascos',
          precioUnitario: 115.00,
          subtotal: 115.00
        }
      ],
      subtotal: 765.00,
      descuento: 50.00,
      iva: 114.40,
      total: 829.40,
      metodoPago: 'tarjeta_credito',
      montoRecibido: 0,
      cambio: 0,
      estado: 'completada',
      usuario: 'Vendedor Luis',
      observaciones: 'Cliente frecuente - descuento aplicado'
    },
    {
      id: 'venta_003',
      numero: 'V-20240217-001230',
      fecha: '2024-02-17T11:20:00.000Z',
      cliente: 'Ana Rodríguez',
      paciente: 2,
      productos: [
        {
          id: 'vp_004',
          productoId: 'prod_003',
          nombre: 'Meloxicam 0.5% - Frasco 50ml',
          tipoVenta: 'dosis',
          cantidad: 5,
          unidadMedida: 'dosis',
          precioUnitario: 7.00,
          subtotal: 35.00
        }
      ],
      subtotal: 35.00,
      descuento: 0,
      iva: 5.60,
      total: 40.60,
      metodoPago: 'transferencia',
      montoRecibido: 0,
      cambio: 0,
      estado: 'completada',
      usuario: 'Dr. Veterinario',
      observaciones: 'Antiinflamatorio post-cirugía'
    }
  ]
}

// Watchers
watch(() => ventaTemporal.value.descuento, () => {
  calcularTotalesVenta()
})

// Inicialización
onMounted(() => {
  cargarDatos()
  productosDisponibles.value = props.inventario.filter(p =>
    p.activo && p.stockUnidades > 0
  )

  // Configurar fechas por defecto para reportes
  const hoy = new Date().toISOString().split('T')[0]
  reportes.value.fechaDesde = hoy
  reportes.value.fechaHasta = hoy
})

// Watchers para actualizar productos disponibles cuando cambie el inventario
watch(() => props.inventario, (newInventario) => {
  productosDisponibles.value = newInventario.filter(p =>
    p.activo && p.stockUnidades > 0
  )
}, { deep: true })

// Exponer métodos públicos
defineExpose({
  cargarDatos,
  guardarDatos,
  nuevaVenta,
  procesarVentaDirecta: (datosVenta) => {
    ventaTemporal.value = datosVenta
    procesarVenta()
  },
  obtenerVentaPorId: (ventaId) => {
    return ventas.value.find(v => v.id === ventaId)
  },
  obtenerVentasDelDia: (fecha = null) => {
    const fechaBuscar = fecha || new Date().toISOString().split('T')[0]
    return ventas.value.filter(v => v.fecha.startsWith(fechaBuscar))
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

/* Contenedor principal */
.ventas-container {
  padding: 16px;
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Espaciado */
.q-mb-md {
  margin-bottom: 16px !important;
}

/* Estilos para la información detallada */
.info-row {
  margin-bottom: 8px;
  padding: 4px 0;
}

.info-row strong {
  display: inline-block;
  min-width: 120px;
  color: #334155;
}

.total-row {
  border-top: 1px solid #e2e8f0;
  padding-top: 8px;
  margin-top: 8px;
}

.total-row strong {
  font-size: 1.1em;
  color: #059669;
}

/* Estilos para tarjetas de estadísticas */
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Estilos para productos en venta */
.rounded-borders {
  border-radius: 8px;
}

/* Top productos */
.top-producto-item {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.top-producto-item:last-child {
  border-bottom: none;
}

.top-producto-item:hover {
  background-color: #f8fafc;
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;
  margin: 0 -8px;
}

/* Placeholder para gráficos */
.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .ventas-container {
    padding: 8px;
  }

  .q-card.bg-gradient-primary .q-card-section {
    padding: 16px !important;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

/* Estilos para tablas */
.q-table th {
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
}

.q-table tr:hover {
  background-color: #f8fafc;
}

/* Estilos para chips de estado */
.q-chip {
  font-weight: 500;
}

/* Ajustes para modales en móviles */
@media (max-width: 600px) {
  .q-dialog__inner {
    padding: 0 !important;
  }
}

/* Animaciones suaves */
.q-card {
  transition: all 0.3s ease;
}

.q-btn {
  transition: all 0.2s ease;
}

/* Estados de hover para botones */
.q-btn:not(.q-btn--disable):hover {
  transform: translateY(-1px);
}

/* Estilos para inputs de números */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Mejoras visuales para las secciones */
.q-card-section {
  position: relative;
}

/* Separadores más elegantes */
.q-separator {
  background-color: #e2e8f0;
}

/* Estilos para tooltips */
.q-tooltip {
  background-color: #1f2937;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
}

/* Loading states */
.q-table--loading .q-table__middle {
  opacity: 0.6;
}

/* Mejoras para selectores */
.q-select .q-field__native {
  color: #374151;
}

.q-select .q-field__label {
  color: #6b7280;
}

/* Estados de focus mejorados */
.q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Estilos para badges y notificaciones */
.q-badge {
  font-weight: 600;
  border-radius: 12px;
}

/* Ajustes finales para coherencia visual */
.text-primary {
  color: #1976d2 !important;
}

.text-positive {
  color: #059669 !important;
}

.text-negative {
  color: #dc2626 !important;
}

.text-warning {
  color: #d97706 !important;
}
</style>

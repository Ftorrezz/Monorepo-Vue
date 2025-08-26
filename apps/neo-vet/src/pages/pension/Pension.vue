<template>
  <div class="pensiones-container">
    <!-- Header principal -->
    <q-card flat class="bg-gradient-primary text-white q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center no-wrap">
          <q-icon name="hotel" size="md" class="q-mr-md"/>
          <div class="col-grow">
            <div class="text-h5 text-weight-medium">Gestión de Pensiones</div>
            <div class="text-subtitle2 opacity-80">
              {{ estadisticasGenerales.totalPensiones }} pensiones • 
              {{ estadisticasGenerales.activas }} activas • 
              {{ estadisticasGenerales.proximasSalida }} próximas a salir
            </div>
          </div>
          <div class="col-auto">
            <div class="row q-gutter-sm">
              <q-btn 
                flat
                round
                icon="add_circle"
                @click="mostrarModalPension = true"
                :disable="modoLectura"
              >
                <q-tooltip>Nueva Pensión</q-tooltip>
              </q-btn>
              <q-btn 
                flat
                round
                icon="event"
                @click="verCalendarioPensiones"
              >
                <q-tooltip>Calendario</q-tooltip>
              </q-btn>
              <q-btn 
                flat
                round
                icon="receipt_long"
                @click="verHistorialPensiones"
              >
                <q-tooltip>Historial</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filtros y vista rápida -->
    <q-card flat class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center q-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtroTexto"
              label="Buscar pensiones..."
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
              v-model="filtroEstado"
              :options="estadosDisponibles"
              label="Estado"
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
              :options="tiposPension"
              label="Tipo"
              outlined
              dense
              clearable
              option-label="label"
              option-value="value"
            />
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

          <q-space />
          
          <!-- Tarjetas de estadísticas -->
          <div class="col-auto">
            <div class="row q-gutter-xs">
              <q-chip 
                color="positive"
                text-color="white"
                :label="estadisticasGenerales.activas + ' Activas'"
                icon="pets"
                clickable
                @click="filtroEstado = { value: 'activa', label: 'Activa' }"
              />
              <q-chip 
                color="warning"
                text-color="white"
                :label="estadisticasGenerales.proximasSalida + ' Por Salir'"
                icon="schedule"
                clickable
                @click="filtroEstado = { value: 'proxima_salida', label: 'Próxima Salida' }"
              />
              <q-chip 
                color="blue"
                text-color="white"
                :label="`${estadisticasGenerales.reservadas} Reservadas`"
                icon="book_online"
                clickable
                @click="filtroEstado = { value: 'reservada', label: 'Reservada' }"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Grid de pensiones -->
    <div class="row q-col-gutter-md">
      <div 
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        v-for="pension in pensionesFiltradas"
        :key="pension.id"
      >
        <q-card 
          flat 
          :class="getCardClass(pension)"
          class="pension-card"
        >
          <!-- Header con mascota y estado -->
          <q-card-section class="q-pa-sm pension-header">
            <div class="row items-center justify-between no-wrap">
              <div class="col-grow">
                <div class="mascota-nombre text-truncate">{{ pension.mascota.nombre }}</div>
                <div class="propietario-info">
                  {{ pension.propietario }} • {{ pension.mascota.especie }}
                </div>
              </div>
              <q-chip 
                dense
                square
                :color="getEstadoColor(pension)"
                text-color="white"
                :label="getEstadoLabel(pension.estado)"
                size="sm"
                :icon="getEstadoIcon(pension.estado)"
              />
            </div>
          </q-card-section>

          <!-- Contenido principal -->
          <q-card-section class="info-container">
            <!-- Fechas -->
            <div class="fechas-info">
              <div class="fecha-item">
                <div class="fecha-label">Entrada</div>
                <div class="fecha-valor">{{ formatDate(pension.fechaEntrada) }}</div>
              </div>
              <div class="fecha-item" v-if="pension.fechaSalida">
                <div class="fecha-label">{{ pension.estado === 'activa' ? 'Salida Est.' : 'Salida' }}</div>
                <div class="fecha-valor">{{ formatDate(pension.fechaSalida) }}</div>
              </div>
            </div>

            <!-- Duración y tipo -->
            <div class="duracion-info">
              <div class="row items-center justify-between">
                <div class="col">
                  <div class="text-caption text-grey-7">Duración</div>
                  <div class="text-subtitle2 text-weight-medium">
                    {{ calcularDuracion(pension) }}
                    <q-icon name="schedule" size="xs" class="q-ml-xs"/>
                  </div>
                </div>
                <div class="col-auto">
                  <q-chip 
                    dense
                    outline
                    :color="getTipoColor(pension.tipo)"
                    :label="getTipoLabel(pension.tipo)"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <!-- Servicios incluidos -->
            <div class="servicios-container" v-if="pension.servicios && pension.servicios.length > 0">
              <div class="text-caption text-grey-7 q-mb-xs">Servicios incluidos</div>
              <div class="row q-gutter-x-xs">
                <q-chip
                  v-for="servicio in pension.servicios.slice(0, 2)"
                  :key="servicio"
                  dense
                  outline
                  color="teal"
                  :label="servicio"
                  size="xs"
                />
                <q-chip
                  v-if="pension.servicios.length > 2"
                  dense
                  outline
                  color="grey"
                  :label="'+' + (pension.servicios.length - 2)"
                  size="xs"
                />
              </div>
            </div>

            <!-- Precio -->
            <div class="precio-info" v-if="pension.precioTotal">
              <div class="row items-center justify-between">
                <div class="text-caption text-grey-7">Total</div>
                <div class="text-h6 text-positive text-weight-bold">
                  ${{ pension.precioTotal.toFixed(2) }}
                </div>
              </div>
              <div class="row items-center justify-between" v-if="pension.precioPorDia">
                <div class="text-caption text-grey-7">Por día</div>
                <div class="text-body2 text-grey-8">
                  ${{ pension.precioPorDia.toFixed(2) }}
                </div>
              </div>
            </div>

            <!-- Notas importantes -->
            <div class="notas-importantes" v-if="pension.observaciones">
              <q-icon name="info" size="xs" color="blue" class="q-mr-xs"/>
              <span class="text-caption text-grey-7 text-truncate">
                {{ pension.observaciones }}
              </span>
            </div>
          </q-card-section>

          <!-- Acciones -->
          <q-card-actions align="right" class="q-pa-sm" v-if="!modoLectura">
            <q-btn 
              flat 
              dense
              :color="pension.estado === 'activa' ? 'negative' : 'positive'" 
              :icon="pension.estado === 'activa' ? 'logout' : 'login'"
              @click="pension.estado === 'activa' ? procesarSalida(pension) : procesarEntrada(pension)"
              size="sm"
              :disable="pension.estado === 'finalizada' || pension.estado === 'cancelada'"
            >
              <q-tooltip>
                {{ pension.estado === 'activa' ? 'Procesar Salida' : 'Procesar Entrada' }}
              </q-tooltip>
            </q-btn>
            <q-space />
            <q-btn-dropdown flat dense round icon="more_vert" size="sm">
              <q-list dense>
                <q-item clickable @click="editarPension(pension)">
                  <q-item-section avatar mini>
                    <q-icon name="edit" color="primary"/>
                  </q-item-section>
                  <q-item-section>Editar</q-item-section>
                </q-item>
                <q-item clickable @click="verDetalleCompleto(pension)">
                  <q-item-section avatar mini>
                    <q-icon name="visibility" color="blue"/>
                  </q-item-section>
                  <q-item-section>Ver Detalle</q-item-section>
                </q-item>
                <q-item clickable @click="duplicarPension(pension)">
                  <q-item-section avatar mini>
                    <q-icon name="content_copy" color="teal"/>
                  </q-item-section>
                  <q-item-section>Duplicar</q-item-section>
                </q-item>
                <q-item clickable @click="generarFactura(pension)" v-if="pension.estado === 'finalizada'">
                  <q-item-section avatar mini>
                    <q-icon name="receipt" color="green"/>
                  </q-item-section>
                  <q-item-section>Generar Factura</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="cancelarPensionAction(pension)" v-if="pension.estado !== 'finalizada'">
                  <q-item-section avatar mini>
                    <q-icon name="cancel" color="negative"/>
                  </q-item-section>
                  <q-item-section>Cancelar</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="pensionesFiltradas.length === 0" class="text-center q-py-xl">
      <q-icon name="hotel" size="64px" color="grey-4" class="q-mb-md"/>
      <div class="text-h6 text-grey-6 q-mb-sm">
        {{ hayFiltros ? 'No se encontraron pensiones' : 'No hay pensiones registradas' }}
      </div>
      <div class="text-body2 text-grey-5 q-mb-md">
        {{ hayFiltros ? 'Intenta cambiar los filtros de búsqueda' : 'Comienza registrando la primera pensión' }}
      </div>
      <q-btn 
        v-if="!modoLectura && !hayFiltros"
        color="primary" 
        icon="add" 
        label="Nueva Pensión" 
        @click="mostrarModalPension = true"
        unelevated
      />
    </div>

    <!-- Modal para agregar/editar pensión -->
    <q-dialog v-model="mostrarModalPension" persistent maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ pensionEditando ? 'Editar Pensión' : 'Nueva Pensión' }}
          </div>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="cancelarModal"
            class="absolute-top-right q-ma-sm"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Información de la mascota -->
            <div class="col-12">
              <div class="text-h6 text-primary q-mb-md">Información de la Mascota</div>
            </div>
            
            <div class="col-12 col-md-6">
              <q-select
                v-model="pensionTemporal.mascota"
                :options="mascotasDisponibles"
                label="Mascota *"
                outlined
                dense
                option-label="nombre"
                option-value="id"
                use-input
                @filter="filtrarMascotas"
                :rules="[val => !!val || 'La mascota es requerida']"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.propietario }} - {{ scope.opt.especie }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="pensionTemporal.propietario"
                label="Propietario *"
                outlined
                dense
                readonly
              />
            </div>

            <!-- Tipo y fechas -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Tipo y Duración</div>
            </div>
            
            <div class="col-12 col-md-4">
              <q-select
                v-model="pensionTemporal.tipo"
                :options="tiposPension"
                label="Tipo de Pensión *"
                outlined
                dense
                option-label="label"
                option-value="value"
                :rules="[val => !!val || 'El tipo es requerido']"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="pensionTemporal.fechaEntrada"
                label="Fecha de Entrada *"
                outlined
                dense
                type="datetime-local"
                :rules="[val => !!val || 'La fecha de entrada es requerida']"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="pensionTemporal.fechaSalida"
                label="Fecha de Salida Estimada"
                outlined
                dense
                type="datetime-local"
              />
            </div>

            <!-- Servicios incluidos -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Servicios Incluidos</div>
            </div>
            
            <div class="col-12">
              <q-option-group
                v-model="pensionTemporal.servicios"
                :options="serviciosDisponibles"
                color="primary"
                type="checkbox"
                inline
              />
            </div>

            <!-- Precios -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Información de Precios</div>
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="pensionTemporal.precioPorDia"
                label="Precio por Día *"
                outlined
                dense
                type="number"
                min="0"
                step="0.01"
                prefix="$"
                :rules="[val => val > 0 || 'El precio debe ser mayor a 0']"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="pensionTemporal.descuento"
                label="Descuento"
                outlined
                dense
                type="number"
                min="0"
                max="100"
                step="0.01"
                suffix="%"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                :model-value="calcularPrecioTotal()"
                label="Precio Total Estimado"
                outlined
                dense
                readonly
                prefix="$"
              />
            </div>

            <!-- Habitación y ubicación -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Ubicación</div>
            </div>
            
            <div class="col-12 col-md-6">
              <q-select
                v-model="pensionTemporal.habitacion"
                :options="habitacionesDisponibles"
                label="Habitación Asignada"
                outlined
                dense
                option-label="nombre"
                option-value="id"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="pensionTemporal.ubicacionEspecial"
                label="Ubicación Especial"
                outlined
                dense
                placeholder="ej: Junto a la ventana, área tranquila"
              />
            </div>

            <!-- Observaciones -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Observaciones y Notas</div>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="pensionTemporal.observaciones"
                label="Observaciones Generales"
                outlined
                dense
                type="textarea"
                rows="3"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="pensionTemporal.instruccionesEspeciales"
                label="Instrucciones Especiales"
                outlined
                dense
                type="textarea"
                rows="3"
                placeholder="Cuidados especiales, medicamentos, dieta, etc."
              />
            </div>

            <!-- Contacto de emergencia -->
            <div class="col-12">
              <q-separator class="q-my-md"/>
              <div class="text-h6 text-primary q-mb-md">Contacto de Emergencia</div>
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="pensionTemporal.contactoEmergencia.nombre"
                label="Nombre del Contacto"
                outlined
                dense
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="pensionTemporal.contactoEmergencia.telefono"
                label="Teléfono"
                outlined
                dense
                type="tel"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="pensionTemporal.contactoEmergencia.relacion"
                label="Relación"
                outlined
                dense
                placeholder="ej: Familiar, Amigo, Vecino"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelarModal"/>
          <q-btn 
            color="primary"
            label="Guardar Pensión" 
            @click="guardarPension"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para procesar entrada/salida -->
    <q-dialog v-model="mostrarModalProceso" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            {{ procesoPension?.tipo === 'entrada' ? 'Procesar Entrada' : 'Procesar Salida' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="text-subtitle1 q-mb-md">
            {{ procesoPension?.pension?.mascota?.nombre }} - {{ procesoPension?.pension?.propietario }}
          </div>

          <q-input
            v-model="procesoPension.fechaProceso"
            label="Fecha y Hora de Proceso"
            outlined
            dense
            type="datetime-local"
            class="q-mb-md"
          />

          <q-input
            v-model="procesoPension.observacionesProceso"
            label="Observaciones del Proceso"
            outlined
            dense
            type="textarea"
            rows="3"
            class="q-mb-md"
          />

          <div v-if="procesoPension?.tipo === 'salida'">
            <q-input
              v-model.number="procesoPension.costoAdicional"
              label="Costo Adicional"
              outlined
              dense
              type="number"
              min="0"
              step="0.01"
              prefix="$"
              class="q-mb-md"
            />
            
            <q-input
              v-model="procesoPension.motivoCostoAdicional"
              label="Motivo del Costo Adicional"
              outlined
              dense
              placeholder="ej: Servicios extra, daños, medicamentos"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="mostrarModalProceso = false"/>
          <q-btn 
            :color="procesoPension?.tipo === 'entrada' ? 'positive' : 'negative'"
            :label="procesoPension?.tipo === 'entrada' ? 'Confirmar Entrada' : 'Confirmar Salida'"
            @click="confirmarProceso"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de calendario -->
    <q-dialog v-model="mostrarModalCalendario" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Calendario de Pensiones</div>
          <q-btn 
            flat 
            round 
            icon="close" 
            @click="mostrarModalCalendario = false"
            class="absolute-top-right q-ma-sm"
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <!-- Aquí iría el componente de calendario -->
          <div class="text-center q-py-xl">
            <q-icon name="calendar_month" size="64px" color="grey-4" class="q-mb-md"/>
            <div class="text-h6 text-grey-6">Vista de Calendario</div>
            <div class="text-body2 text-grey-5">Próximamente disponible</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de historial -->
    <q-dialog v-model="mostrarModalHistorial" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Historial de Pensiones</div>
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
            :rows="historialPensiones"
            :columns="columnasHistorial"
            row-key="id"
            :pagination="paginacionHistorial"
            :filter="filtroHistorialGeneral"
            binary-state-sort
            dense
          >
            <template v-slot:top>
              <q-input
                v-model="filtroHistorialGeneral"
                debounce="300"
                placeholder="Buscar en historial..."
                class="col-12 col-md-6"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip 
                  :color="getEstadoColor({ estado: props.value })"
                  text-color="white"
                  :label="getEstadoLabel(props.value)"
                  size="sm"
                  dense
                />
              </q-td>
            </template>

            <template v-slot:body-cell-duracion="props">
              <q-td :props="props">
                {{ calcularDuracion(props.row) }}
              </q-td>
            </template>

            <template v-slot:body-cell-total="props">
              <q-td :props="props">
                ${{ props.value?.toFixed(2) || '0.00' }}
              </q-td>
            </template>
          </q-table>
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
  }
})

// Emits
const emit = defineEmits(['pension-creada', 'pension-actualizada', 'entrada-procesada', 'salida-procesada'])

// Estados principales
const pensiones = ref([])
const historialPensiones = ref([])

// Estados de modales
const mostrarModalPension = ref(false)
const mostrarModalProceso = ref(false)
const mostrarModalCalendario = ref(false)
const mostrarModalHistorial = ref(false)
const pensionEditando = ref(null)

// Estados de filtros
const filtroTexto = ref('')
const filtroEstado = ref('')
const filtroTipo = ref('')
const filtroFechaDesde = ref('')
const filtroFechaHasta = ref('')
const filtroHistorialGeneral = ref('')

// Estados temporales
const pensionTemporal = ref({
  id: '',
  mascota: null,
  propietario: '',
  tipo: '',
  estado: 'reservada',
  fechaEntrada: '',
  fechaSalida: '',
  fechaEntradaReal: '',
  fechaSalidaReal: '',
  servicios: [],
  precioPorDia: 0,
  descuento: 0,
  precioTotal: 0,
  costosAdicionales: 0,
  habitacion: null,
  ubicacionEspecial: '',
  observaciones: '',
  instruccionesEspeciales: '',
  contactoEmergencia: {
    nombre: '',
    telefono: '',
    relacion: ''
  },
  fechaCreacion: '',
  usuario: 'Usuario Actual'
})

const procesoPension = ref({
  pension: null,
  tipo: '',
  fechaProceso: '',
  observacionesProceso: '',
  costoAdicional: 0,
  motivoCostoAdicional: ''
})

// Opciones para selects
const estadosDisponibles = [
  { label: 'Reservada', value: 'reservada' },
  { label: 'Activa', value: 'activa' },
  { label: 'Finalizada', value: 'finalizada' },
  { label: 'Cancelada', value: 'cancelada' },
  { label: 'Próxima Salida', value: 'proxima_salida' }
]

const tiposPension = [
  { label: 'Corta (1-3 días)', value: 'corta' },
  { label: 'Media (4-7 días)', value: 'media' },
  { label: 'Larga (más de 7 días)', value: 'larga' },
  { label: 'Diaria (entrada/salida diaria)', value: 'diaria' },
  { label: 'Fin de Semana', value: 'fin_semana' },
  { label: 'Mensual', value: 'mensual' }
]

const serviciosDisponibles = [
  { label: 'Alimentación Premium', value: 'alimentacion_premium' },
  { label: 'Paseos Diarios', value: 'paseos' },
  { label: 'Baño y Aseo', value: 'bano_aseo' },
  { label: 'Medicación', value: 'medicacion' },
  { label: 'Juego y Socialización', value: 'juego_socializacion' },
  { label: 'Cuidado Especial', value: 'cuidado_especial' },
  { label: 'Monitoreo Veterinario', value: 'monitoreo_vet' },
  { label: 'Llamadas de Seguimiento', value: 'llamadas_seguimiento' }
]

const habitacionesDisponibles = [
  { id: 'hab_001', nombre: 'Habitación A1 - Individual', tipo: 'individual', capacidad: 1 },
  { id: 'hab_002', nombre: 'Habitación A2 - Individual', tipo: 'individual', capacidad: 1 },
  { id: 'hab_003', nombre: 'Habitación B1 - Doble', tipo: 'doble', capacidad: 2 },
  { id: 'hab_004', nombre: 'Habitación B2 - Doble', tipo: 'doble', capacidad: 2 },
  { id: 'hab_005', nombre: 'Suite Premium', tipo: 'premium', capacidad: 1 },
  { id: 'hab_006', nombre: 'Área Común - Perros Grandes', tipo: 'compartida', capacidad: 5 },
  { id: 'hab_007', nombre: 'Área Común - Perros Pequeños', tipo: 'compartida', capacidad: 8 },
  { id: 'hab_008', nombre: 'Área Gatos', tipo: 'gatos', capacidad: 6 }
]

// Mascotas disponibles (esto vendría de otro módulo)
const mascotasDisponibles = ref([
  { 
    id: 1, 
    nombre: 'Max', 
    especie: 'Perro Golden', 
    propietario: 'Juan Pérez',
    telefono: '555-0101',
    edad: '3 años'
  },
  { 
    id: 2, 
    nombre: 'Luna', 
    especie: 'Gata Persa', 
    propietario: 'María García',
    telefono: '555-0102',
    edad: '2 años'
  },
  { 
    id: 3, 
    nombre: 'Rocky', 
    especie: 'Perro Bulldog', 
    propietario: 'Carlos López',
    telefono: '555-0103',
    edad: '4 años'
  },
  { 
    id: 4, 
    nombre: 'Mia', 
    especie: 'Gata Siamesa', 
    propietario: 'Ana Martínez',
    telefono: '555-0104',
    edad: '1 año'
  }
])

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

const getTipoLabel = (tipo) => {
  const t = tiposPension.find(tp => tp.value === tipo)
  return t?.label || tipo
}

const getTipoColor = (tipo) => {
  const colores = {
    'corta': 'blue',
    'media': 'teal',
    'larga': 'purple',
    'diaria': 'orange',
    'fin_semana': 'indigo',
    'mensual': 'deep-purple'
  }
  return colores[tipo] || 'grey'
}

const getEstadoLabel = (estado) => {
  const e = estadosDisponibles.find(est => est.value === estado)
  return e?.label || estado
}

const getEstadoColor = (pension) => {
  if (isProximaSalida(pension)) return 'warning'
  
  const colores = {
    'reservada': 'blue',
    'activa': 'positive',
    'finalizada': 'grey',
    'cancelada': 'negative'
  }
  return colores[pension.estado] || 'grey'
}

const getEstadoIcon = (estado) => {
  const iconos = {
    'reservada': 'book_online',
    'activa': 'pets',
    'finalizada': 'check_circle',
    'cancelada': 'cancel'
  }
  return iconos[estado] || 'help'
}

const getCardClass = (pension) => {
  const color = getEstadoColor(pension)
  return {
    'pension-card': true,
    [`border-${color}`]: true
  }
}

const isProximaSalida = (pension) => {
  if (pension.estado !== 'activa' || !pension.fechaSalida) return false
  const fechaSalida = new Date(pension.fechaSalida)
  const ahora = new Date()
  const diffHoras = Math.floor((fechaSalida - ahora) / (1000 * 60 * 60))
  return diffHoras <= 24 && diffHoras >= 0
}

const esMesActual = (fechaISO) => {
  if (!fechaISO) return false
  const fecha = new Date(fechaISO)
  const ahora = new Date()
  return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
}

const calcularDuracion = (pension) => {
  if (!pension.fechaEntrada) return '---'
  
  const fechaInicio = new Date(pension.fechaEntradaReal || pension.fechaEntrada)
  const fechaFin = pension.fechaSalidaReal ? 
    new Date(pension.fechaSalidaReal) : 
    (pension.fechaSalida ? new Date(pension.fechaSalida) : new Date())
  
  const diffMs = fechaFin - fechaInicio
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDias < 1) return 'Menos de 1 día'
  if (diffDias === 1) return '1 día'
  if (diffDias < 7) return `${diffDias} días`
  
  const semanas = Math.floor(diffDias / 7)
  const diasExtra = diffDias % 7
  
  if (semanas === 1 && diasExtra === 0) return '1 semana'
  if (diasExtra === 0) return `${semanas} semanas`
  
  return `${semanas} sem, ${diasExtra} días`
}

const calcularPrecioTotal = () => {
  if (!pensionTemporal.value.precioPorDia || !pensionTemporal.value.fechaEntrada) return '0.00'
  
  const fechaInicio = new Date(pensionTemporal.value.fechaEntrada)
  const fechaFin = pensionTemporal.value.fechaSalida ? 
    new Date(pensionTemporal.value.fechaSalida) : 
    new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000) // Al menos 1 día
  
  const diffMs = fechaFin - fechaInicio
  const dias = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  
  const subtotal = dias * pensionTemporal.value.precioPorDia
  const descuento = (pensionTemporal.value.descuento || 0) / 100
  const total = subtotal * (1 - descuento)
  
  return total.toFixed(2)
}

// Computed properties
const pensionesFiltradas = computed(() => {
  let pensionesFilt = [...pensiones.value]
  
  if (filtroTexto.value) {
    const texto = filtroTexto.value.toLowerCase()
    pensionesFilt = pensionesFilt.filter(p => 
      p.mascota.nombre.toLowerCase().includes(texto) ||
      p.propietario.toLowerCase().includes(texto) ||
      p.observaciones?.toLowerCase().includes(texto)
    )
  }
  
  if (filtroEstado.value) {
    if (filtroEstado.value.value === 'proxima_salida') {
      pensionesFilt = pensionesFilt.filter(p => isProximaSalida(p))
    } else {
      pensionesFilt = pensionesFilt.filter(p => p.estado === filtroEstado.value.value)
    }
  }
  
  if (filtroTipo.value) {
    pensionesFilt = pensionesFilt.filter(p => p.tipo === filtroTipo.value.value)
  }
  
  if (filtroFechaDesde.value) {
    pensionesFilt = pensionesFilt.filter(p => 
      new Date(p.fechaEntrada) >= new Date(filtroFechaDesde.value)
    )
  }
  
  if (filtroFechaHasta.value) {
    pensionesFilt = pensionesFilt.filter(p => 
      new Date(p.fechaEntrada) <= new Date(filtroFechaHasta.value + 'T23:59:59')
    )
  }
  
  return pensionesFilt.sort((a, b) => {
    // Ordenar por estado: activas primero, luego reservadas, etc.
    const ordenEstados = { 'activa': 1, 'reservada': 2, 'proxima_salida': 3, 'finalizada': 4, 'cancelada': 5 }
    return ordenEstados[a.estado] - ordenEstados[b.estado]
  })
})

const estadisticasGenerales = computed(() => {
  return {
    totalPensiones: pensiones.value.length,
    activas: pensiones.value.filter(p => p.estado === 'activa').length,
    reservadas: pensiones.value.filter(p => p.estado === 'reservada').length,
    proximasSalida: pensiones.value.filter(p => isProximaSalida(p)).length,
    finalizadas: pensiones.value.filter(p => p.estado === 'finalizada').length,
    ingresosMes: pensiones.value
      .filter(p => p.estado === 'finalizada' && esMesActual(p.fechaSalidaReal))
      .reduce((acc, p) => acc + (p.precioTotal || 0), 0)
  }
})

const hayFiltros = computed(() => {
  return !!(filtroTexto.value || filtroEstado.value || filtroTipo.value || filtroFechaDesde.value || filtroFechaHasta.value)
})

// Columnas para tabla de historial
const columnasHistorial = [
  {
    name: 'fechaEntrada',
    label: 'Entrada',
    field: 'fechaEntrada',
    align: 'left',
    sortable: true,
    format: val => formatDateTime(val)
  },
  {
    name: 'mascota',
    label: 'Mascota',
    field: row => row.mascota.nombre,
    align: 'left',
    sortable: true
  },
  {
    name: 'propietario',
    label: 'Propietario',
    field: 'propietario',
    align: 'left',
    sortable: true
  },
  {
    name: 'tipo',
    label: 'Tipo',
    field: 'tipo',
    align: 'center',
    format: val => getTipoLabel(val)
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'duracion',
    label: 'Duración',
    field: row => row,
    align: 'center'
  },
  {
    name: 'total',
    label: 'Total',
    field: 'precioTotal',
    align: 'right'
  }
]

const paginacionHistorial = ref({
  rowsPerPage: 15
})

// Métodos de utilidad
// Métodos de pensiones
const editarPension = (pension) => {
  pensionEditando.value = pension
  pensionTemporal.value = { ...pension }
  mostrarModalPension.value = true
}

const guardarPension = () => {
  if (!validarPension()) return
  
  const ahora = new Date().toISOString()
  
  // Calcular precio total
  pensionTemporal.value.precioTotal = parseFloat(calcularPrecioTotal())
  
  if (pensionEditando.value) {
    // Editar pensión existente
    const index = pensiones.value.findIndex(p => p.id === pensionEditando.value.id)
    if (index !== -1) {
      pensiones.value[index] = { 
        ...pensionTemporal.value,
        fechaModificacion: ahora
      }
      emit('pension-actualizada', pensiones.value[index])
    }
  } else {
    // Nueva pensión
    const nuevaPension = {
      ...pensionTemporal.value,
      id: `pension_${Date.now()}`,
      fechaCreacion: ahora,
      fechaModificacion: ahora
    }
    
    // Establecer propietario basado en la mascota seleccionada
    if (nuevaPension.mascota) {
      nuevaPension.propietario = nuevaPension.mascota.propietario
    }
    
    pensiones.value.push(nuevaPension)
    emit('pension-creada', nuevaPension)
  }
  
  mostrarModalPension.value = false
  pensionEditando.value = null
  limpiarPensionTemporal()
  guardarDatos()
}

const validarPension = () => {
  if (!pensionTemporal.value.mascota || !pensionTemporal.value.tipo || !pensionTemporal.value.fechaEntrada) {
    return false
  }
  
  if (pensionTemporal.value.precioPorDia <= 0) {
    return false
  }
  
  return true
}

const cancelarModal = () => {
  mostrarModalPension.value = false
  pensionEditando.value = null
  limpiarPensionTemporal()
}

const limpiarPensionTemporal = () => {
  pensionTemporal.value = {
    id: '',
    mascota: null,
    propietario: '',
    tipo: '',
    estado: 'reservada',
    fechaEntrada: '',
    fechaSalida: '',
    fechaEntradaReal: '',
    fechaSalidaReal: '',
    servicios: [],
    precioPorDia: 0,
    descuento: 0,
    precioTotal: 0,
    costosAdicionales: 0,
    habitacion: null,
    ubicacionEspecial: '',
    observaciones: '',
    instruccionesEspeciales: '',
    contactoEmergencia: {
      nombre: '',
      telefono: '',
      relacion: ''
    },
    fechaCreacion: '',
    usuario: 'Usuario Actual'
  }
}

// Métodos para procesos de entrada/salida
const procesarEntrada = (pension) => {
  procesoPension.value = {
    pension: pension,
    tipo: 'entrada',
    fechaProceso: new Date().toISOString().slice(0, 16),
    observacionesProceso: '',
    costoAdicional: 0,
    motivoCostoAdicional: ''
  }
  mostrarModalProceso.value = true
}

const procesarSalida = (pension) => {
  procesoPension.value = {
    pension: pension,
    tipo: 'salida',
    fechaProceso: new Date().toISOString().slice(0, 16),
    observacionesProceso: '',
    costoAdicional: 0,
    motivoCostoAdicional: ''
  }
  mostrarModalProceso.value = true
}

const confirmarProceso = () => {
  const pension = procesoPension.value.pension
  const ahora = new Date().toISOString()
  
  if (procesoPension.value.tipo === 'entrada') {
    pension.estado = 'activa'
    pension.fechaEntradaReal = procesoPension.value.fechaProceso
    pension.observacionesEntrada = procesoPension.value.observacionesProceso
    
    emit('entrada-procesada', {
      pension: pension,
      fechaProceso: procesoPension.value.fechaProceso,
      observaciones: procesoPension.value.observacionesProceso
    })
  } else {
    pension.estado = 'finalizada'
    pension.fechaSalidaReal = procesoPension.value.fechaProceso
    pension.observacionesSalida = procesoPension.value.observacionesProceso
    
    // Agregar costos adicionales si existen
    if (procesoPension.value.costoAdicional > 0) {
      pension.costosAdicionales = (pension.costosAdicionales || 0) + procesoPension.value.costoAdicional
      pension.precioTotal = (pension.precioTotal || 0) + procesoPension.value.costoAdicional
      pension.motivoCostosAdicionales = procesoPension.value.motivoCostoAdicional
    }
    
    // Mover al historial
    historialPensiones.value.push({ ...pension })
    
    emit('salida-procesada', {
      pension: pension,
      fechaProceso: procesoPension.value.fechaProceso,
      observaciones: procesoPension.value.observacionesProceso,
      costoAdicional: procesoPension.value.costoAdicional,
      motivoCostoAdicional: procesoPension.value.motivoCostoAdicional
    })
  }
  
  pension.fechaModificacion = ahora
  mostrarModalProceso.value = false
  guardarDatos()
}

// Otros métodos
const duplicarPension = (pension) => {
  pensionTemporal.value = {
    ...pension,
    id: '',
    estado: 'reservada',
    fechaEntrada: '',
    fechaSalida: '',
    fechaEntradaReal: '',
    fechaSalidaReal: '',
    observacionesEntrada: '',
    observacionesSalida: '',
    costosAdicionales: 0
  }
  pensionEditando.value = null
  mostrarModalPension.value = true
}

const cancelarPensionAction = (pension) => {
  pension.estado = 'cancelada'
  pension.fechaCancelacion = new Date().toISOString()
  guardarDatos()
}

const verDetalleCompleto = (pension) => {
  // Aquí se abriría un modal con todos los detalles de la pensión
  console.log('Ver detalle completo:', pension)
}

const generarFactura = (pension) => {
  // Aquí se generaría la factura de la pensión
  console.log('Generar factura:', pension)
}

const verCalendarioPensiones = () => {
  mostrarModalCalendario.value = true
}

const verHistorialPensiones = () => {
  mostrarModalHistorial.value = true
}

const filtrarMascotas = (val, update) => {
  update(() => {
    const texto = val.toLowerCase()
    mascotasDisponibles.value = mascotasDisponibles.value.filter(m => 
      m.nombre.toLowerCase().includes(texto) ||
      m.propietario.toLowerCase().includes(texto) ||
      m.especie.toLowerCase().includes(texto)
    )
  })
}

// Watchers
watch(() => pensionTemporal.value.mascota, (nuevaMascota) => {
  if (nuevaMascota) {
    pensionTemporal.value.propietario = nuevaMascota.propietario
  }
})

// Método de persistencia
const guardarDatos = () => {
  // Aquí se guardarían los datos en el backend
  console.log('Guardando pensiones:', pensiones.value)
  console.log('Guardando historial:', historialPensiones.value)
}

const cargarDatos = () => {
  // Datos de ejemplo
  pensiones.value = [
    {
      id: 'pension_001',
      mascota: { id: 1, nombre: 'Max', especie: 'Perro Golden' },
      propietario: 'Juan Pérez',
      tipo: 'media',
      estado: 'activa',
      fechaEntrada: '2024-02-15T09:00:00.000Z',
      fechaSalida: '2024-02-22T17:00:00.000Z',
      fechaEntradaReal: '2024-02-15T09:15:00.000Z',
      servicios: ['alimentacion_premium', 'paseos', 'monitoreo_vet'],
      precioPorDia: 150,
      precioTotal: 1050,
      habitacion: { id: 'hab_001', nombre: 'Habitación A1 - Individual' },
      observaciones: 'Perro muy sociable, le gusta jugar con otros perros.',
      instruccionesEspeciales: 'Medicación para artritis cada 12 horas.',
      contactoEmergencia: {
        nombre: 'María Pérez',
        telefono: '555-0201',
        relacion: 'Esposa'
      },
      fechaCreacion: '2024-02-10T14:30:00.000Z',
      usuario: 'Dr. Veterinario'
    },
    {
      id: 'pension_002',
      mascota: { id: 2, nombre: 'Luna', especie: 'Gata Persa' },
      propietario: 'María García',
      tipo: 'corta',
      estado: 'reservada',
      fechaEntrada: '2024-02-25T16:00:00.000Z',
      fechaSalida: '2024-02-27T10:00:00.000Z',
      servicios: ['alimentacion_premium', 'cuidado_especial'],
      precioPorDia: 120,
      precioTotal: 240,
      habitacion: { id: 'hab_008', nombre: 'Área Gatos' },
      observaciones: 'Gata muy tímida, necesita ambiente tranquilo.',
      instruccionesEspeciales: 'Dieta especial para problemas renales.',
      contactoEmergencia: {
        nombre: 'Carlos García',
        telefono: '555-0202',
        relacion: 'Hermano'
      },
      fechaCreacion: '2024-02-20T10:15:00.000Z',
      usuario: 'Asistente Ana'
    },
    {
      id: 'pension_003',
      mascota: { id: 3, nombre: 'Rocky', especie: 'Perro Bulldog' },
      propietario: 'Carlos López',
      tipo: 'fin_semana',
      estado: 'activa',
      fechaEntrada: '2024-02-16T18:00:00.000Z',
      fechaSalida: '2024-02-18T12:00:00.000Z',
      fechaEntradaReal: '2024-02-16T18:30:00.000Z',
      servicios: ['alimentacion_premium', 'bano_aseo'],
      precioPorDia: 100,
      precioTotal: 200,
      habitacion: { id: 'hab_003', nombre: 'Habitación B1 - Doble' },
      observaciones: 'Problemas respiratorios leves, evitar ejercicio intenso.',
      fechaCreacion: '2024-02-14T16:45:00.000Z',
      usuario: 'Dr. Veterinario'
    }
  ]
  
  historialPensiones.value = [
    {
      id: 'pension_hist_001',
      mascota: { id: 4, nombre: 'Mia', especie: 'Gata Siamesa' },
      propietario: 'Ana Martínez',
      tipo: 'corta',
      estado: 'finalizada',
      fechaEntrada: '2024-02-01T14:00:00.000Z',
      fechaSalida: '2024-02-03T11:00:00.000Z',
      fechaEntradaReal: '2024-02-01T14:15:00.000Z',
      fechaSalidaReal: '2024-02-03T10:45:00.000Z',
      servicios: ['alimentacion_premium'],
      precioPorDia: 90,
      precioTotal: 180,
      costosAdicionales: 0,
      fechaCreacion: '2024-01-28T09:30:00.000Z',
      usuario: 'Asistente Ana'
    }
  ]
}

// Inicialización
onMounted(() => {
  cargarDatos()
})

// Exponer métodos públicos
defineExpose({
  cargarDatos,
  guardarDatos,
  procesarEntradaPension: (pensionId) => {
    const pension = pensiones.value.find(p => p.id === pensionId)
    if (pension) procesarEntrada(pension)
  },
  procesarSalidaPension: (pensionId) => {
    const pension = pensiones.value.find(p => p.id === pensionId)
    if (pension) procesarSalida(pension)
  },
  obtenerPensionPorId: (pensionId) => {
    return pensiones.value.find(p => p.id === pensionId) || 
           historialPensiones.value.find(p => p.id === pensionId)
  },
  obtenerPensionesPorMascota: (mascotaId) => {
    return [...pensiones.value, ...historialPensiones.value].filter(p => p.mascota.id === mascotaId)
  }
})
</script>

<style scoped>
/* Estilos del header - mismo estilo que inventario */
.bg-gradient-primary {
  background: linear-gradient(145deg, #1976d2 0%, #2196f3 100%) !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
}

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

.q-btn.flat {
  color: white !important;
}

.q-btn.flat:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.q-icon {
  color: inherit !important;
}

/* Contenedor principal */
.pensiones-container {
  padding: 16px;
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.q-mb-md {
  margin-bottom: 16px !important;
}

/* Estilos para las tarjetas de pensiones */
.pension-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: white;
  min-height: 280px;
}

.pension-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Header de la pensión */
.pension-header {
  padding: 12px !important;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.mascota-nombre {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.2;
  color: #2c3e50;
  margin-bottom: 4px;
}

.propietario-info {
  font-size: 0.75rem;
  color: #64748b;
}

/* Contenedor de información */
.info-container {
  padding: 12px !important;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

/* Sección de fechas */
.fechas-info {
  display: flex;
  gap: 12px;
  background: #f8fafc;
  padding: 10px;
  border-radius: 6px;
}

.fecha-item {
  flex: 1;
}

.fecha-label {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 2px;
  text-transform: uppercase;
  font-weight: 500;
}

.fecha-valor {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

/* Sección de duración */
.duracion-info {
  background: #f1f5f9;
  padding: 10px;
  border-radius: 6px;
}

/* Sección de servicios */
.servicios-container {
  background: #f0fdf4;
  padding: 10px;
  border-radius: 6px;
}

/* Sección de precio */
.precio-info {
  background: #fef7f0;
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
}

/* Notas importantes */
.notas-importantes {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #eff6ff;
  padding: 8px;
  border-radius: 6px;
  border-left: 2px solid #3b82f6;
}

/* Estados de borde según estado */
.border-positive { border-color: var(--q-positive) !important; }
.border-warning { border-color: var(--q-warning) !important; }
.border-negative { border-color: var(--q-negative) !important; }
.border-blue { border-color: var(--q-blue) !important; }
.border-grey { border-color: var(--q-grey) !important; }

/* Footer de acciones */
.q-card-actions {
  padding: 8px !important;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  margin-top: auto;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .fechas-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .fecha-item {
    flex: none;
  }
  
  .pension-card {
    min-height: auto;
  }
}

/* Chips personalizados */
.q-chip {
  font-size: 0.7rem;
  padding: 2px 8px;
  font-weight: 500;
}

.q-chip.dense {
  padding: 1px 6px;
}

/* Animaciones para los estados */
.pension-card.border-positive {
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.pension-card.border-warning {
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2);
}

.pension-card.border-blue {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

/* Estilos para el modal */
.q-dialog .q-card {
  max-width: none;
}

/* Tabla de historial */
.q-table {
  background: white;
  border-radius: 8px;
}

.q-table thead tr {
  background: #f8fafc;
}

.q-table thead th {
  font-weight: 600;
  color: #374151;
}

/* Formulario en el modal */
.q-input, .q-select {
  margin-bottom: 8px;
}

.q-field--outlined .q-field__control {
  border-radius: 6px;
}

/* Sección headers en el modal */
.text-h6.text-primary {
  color: #1976d2 !important;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e3f2fd;
}

/* Grupos de opciones */
.q-option-group {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
}

.q-option-group .q-checkbox {
  margin-right: 16px;
  margin-bottom: 8px;
}

/* Estados especiales en las tarjetas */
.pension-card.border-positive .mascota-nombre {
  color: #059669;
}

.pension-card.border-warning .mascota-nombre {
  color: #d97706;
}

.pension-card.border-blue .mascota-nombre {
  color: #2563eb;
}

/* Indicadores visuales */
.pension-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: currentColor;
  border-radius: 8px 8px 0 0;
  opacity: 0.7;
}

.pension-card.border-positive::before {
  background: var(--q-positive);
}

.pension-card.border-warning::before {
  background: var(--q-warning);
}

.pension-card.border-blue::before {
  background: var(--q-blue);
}

.pension-card.border-grey::before {
  background: var(--q-grey);
}

/* Espaciado mejorado */
.row.q-col-gutter-md > * {
  padding: 8px;
}

/* Texto truncado mejorado */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Mejoras para dispositivos táctiles */
@media (hover: none) {
  .pension-card:hover {
    transform: none;
  }
  
  .pension-card:active {
    transform: scale(0.98);
  }
}

/* Estados de carga y vacío */
.text-center.q-py-xl {
  padding: 64px 16px;
}

.text-center.q-py-xl .q-icon {
  opacity: 0.3;
}

/* Mejoras de accesibilidad */
.q-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.q-chip:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

/* Animaciones suaves */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.pension-card {
  position: relative;
  overflow: hidden;
}

/* Efectos de hover mejorados */
.q-btn-dropdown:hover {
  background: rgba(0, 0, 0, 0.05) !important;
}

/* Consistencia en el diseño */
.q-separator {
  margin: 16px 0;
}

.q-card-section.q-pa-md {
  padding: 20px !important;
}

/* Mejoras para formularios largos */
.col-12:has(.text-h6.text-primary) {
  margin-top: 24px;
}

.col-12:has(.text-h6.text-primary):first-child {
  margin-top: 0;
}
</style>
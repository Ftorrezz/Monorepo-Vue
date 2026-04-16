<template>
  <div class="servicio-resumen">
    <div class="row q-col-gutter-lg">
      <!-- Columna Izquierda: Métricas y Estadísticas -->
      <div class="col-12 col-md-4">
        <!-- Bloque de Tarjetas de Métricas en Columna -->
        <div class="column q-gutter-md q-mb-lg">
          <div class="metric-card metric-card--total">
            <div class="metric-card__icon">
              <q-icon name="assignment" size="20px" />
            </div>
            <div class="metric-card__content">
              <div class="metric-card__label">Total Servicios</div>
              <div class="metric-card__value">{{ serviciosAplicados.length }}</div>
            </div>
          </div>
          
          <div class="metric-card metric-card--done">
            <div class="metric-card__icon">
              <q-icon name="check_circle" size="20px" />
            </div>
            <div class="metric-card__content">
              <div class="metric-card__label">Completados</div>
              <div class="metric-card__value">{{ serviciosCompletados.length }}</div>
            </div>
          </div>
          
          <div class="metric-card metric-card--pending">
            <div class="metric-card__icon">
              <q-icon name="pending" size="20px" />
            </div>
            <div class="metric-card__content">
              <div class="metric-card__label">Pendientes</div>
              <div class="metric-card__value">{{ serviciosPendientes.length }}</div>
            </div>
          </div>
        </div>

        <!-- Panel de progreso con diseño moderno -->
        <div class="stats-panel premium-glass">
          <div class="stats-header">
            <div class="text-subtitle1 text-weight-bold text-primary">Estado de Avance</div>
            <div class="text-caption text-grey-6">Progreso general de la atención</div>
          </div>
          
          <div class="flex flex-center q-py-lg">
            <q-circular-progress
              show-value
              font-size="16px"
              :value="porcentajeProgreso"
              size="120px"
              :thickness="0.15"
              color="primary"
              track-color="blue-1"
              class="progress-chart"
            >
              <div class="column items-center">
                <span class="text-h6 text-weight-bolder">{{ porcentajeProgreso }}%</span>
                <span class="text-caption text-grey-7" style="font-size: 10px; margin-top: -4px;">LOGRADO</span>
              </div>
            </q-circular-progress>
          </div>

          <div class="modern-legend">
            <div class="legend-item-v2">
              <div class="legend-info">
                <div class="legend-label">Finalizados</div>
                <div class="legend-count text-positive">{{ serviciosCompletados.length }}</div>
              </div>
              <q-linear-progress :value="porcentajeProgreso / 100" color="positive" class="legend-bar" />
            </div>
            
            <div class="legend-item-v2">
              <div class="legend-info">
                <div class="legend-label">Pendientes</div>
                <div class="legend-count text-orange">{{ serviciosPendientes.length }}</div>
              </div>
              <q-linear-progress :value="1 - (porcentajeProgreso / 100)" color="orange" class="legend-bar" />
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Servicios con diseño premium -->
      <div class="col-12 col-md-8">
        <div class="section-title row items-center q-mb-md">
          <q-icon name="list_alt" size="20px" color="primary" class="q-mr-sm" />
          <span class="text-subtitle1 text-weight-bold text-grey-9">Servicios en esta Atención</span>
          <q-space />
          <q-btn flat dense color="primary" icon="print" label="Imprimir Resumen" no-caps @click="$emit('imprimir-resumen')" v-if="serviciosAplicados.length > 0" />
        </div>

        <div class="services-modern-list">
          <div
            v-for="servicio in serviciosAplicados"
            :key="servicio.id"
            class="premium-service-card"
            :class="{ 'premium-service-card--done': servicio.completado }"
          >
            <!-- Lado izquierdo: Icono y Estado -->
            <div class="service-lead">
              <div class="service-icon-wrapper" :class="servicio.completado ? 'bg-positive-soft' : 'bg-orange-soft'">
                <q-icon :name="servicio.icono" :color="servicio.completado ? 'positive' : 'orange'" size="24px" />
              </div>
              <div class="service-status-line">
                <div class="status-dot" :class="servicio.completado ? 'bg-positive' : 'bg-orange'"></div>
              </div>
            </div>

            <!-- Centro: Información -->
            <div class="service-main">
              <div class="row items-center justify-between no-wrap">
                <div class="service-title-group">
                  <div class="service-name-text">{{ servicio.nombre }}</div>
                  <div class="service-meta-text">
                    <q-icon name="schedule" size="12px" class="q-mr-xs" />
                    {{ servicio.timestamp }}
                  </div>
                </div>

                <div class="service-action-group">
                  <!-- Botones de acción movidos al encabezado -->
                  <div class="service-quick-actions-header" v-if="servicio.completado">
                    <q-btn
                      v-if="servicio.tipo?.toLowerCase() === 'vacunacion' || servicio.componente_clave === 'vacunacion'"
                      flat round dense icon="card_membership" size="sm" color="primary" class="action-btn-v2"
                      @click.stop="$emit('imprimir-servicio', servicio, 'especial')"
                    ><q-tooltip>Certificado</q-tooltip></q-btn>
                    
                    <q-btn
                      v-if="servicio.tipo?.toLowerCase() === 'consulta' || servicio.componente_clave === 'consulta'"
                      flat round dense icon="description" size="sm" color="primary" class="action-btn-v2"
                      @click.stop="$emit('imprimir-servicio', servicio, 'especial')"
                    ><q-tooltip>Imprimir Consulta</q-tooltip></q-btn>
                    
                    <q-btn
                      v-if="servicio.tipo?.toLowerCase() === 'receta' || servicio.componente_clave === 'receta'"
                      flat round dense icon="receipt_long" size="sm" color="secondary" class="action-btn-v2"
                      @click.stop="$emit('imprimir-servicio', servicio, 'especial')"
                    ><q-tooltip>Receta</q-tooltip></q-btn>

                    <q-btn-dropdown
                      v-if="servicio.plantillas_servicio && servicio.plantillas_servicio.length > 1"
                      flat round dense icon="print" size="sm" color="grey-7" class="action-btn-v2"
                    >
                      <q-list dense style="min-width: 200px">
                        <q-item
                          v-for="p in servicio.plantillas_servicio"
                          :key="p.id_plantilla"
                          clickable v-close-popup
                          @click="$emit('imprimir-servicio', servicio, 'plantilla', p.id_plantilla)"
                        >
                          <q-item-section avatar><q-icon name="description" color="secondary" size="xs" /></q-item-section>
                          <q-item-section>{{ p.nombre_plantilla || 'Plantilla ' + p.id_plantilla }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                    <q-btn
                      v-else-if="servicio.plantillas_servicio?.length === 1 || servicio.id_plantilla"
                      flat round dense icon="print" size="sm" color="grey-7" class="action-btn-v2"
                      @click.stop="$emit('imprimir-servicio', servicio, 'plantilla')"
                    ><q-tooltip>Imprimir</q-tooltip></q-btn>
                  </div>

                  <q-chip
                    dense
                    :color="servicio.completado ? 'positive' : 'orange'"
                    text-color="white"
                    size="10px"
                    class="status-chip-v2 text-weight-bold"
                  >
                    {{ servicio.completado ? 'FINALIZADO' : 'PENDIENTE' }}
                  </q-chip>
                  
                  <q-btn flat round dense icon="arrow_forward" size="sm" color="primary" class="go-to-btn" @click="$emit('seleccionar-pestaña', servicio.id)">
                    <q-tooltip>Abrir servicio</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <!-- Datos relevantes en grid -->
              <div class="service-data-grid" v-if="servicio.completado">
                <template v-for="(valor, label) in getsDatosRelevantes(servicio)" :key="label">
                  <div class="data-item-v2" v-if="valor">
                    <span class="data-item-v2__label">{{ label }}</span>
                    <span class="data-item-v2__value">{{ valor }}</span>
                  </div>
                </template>
              </div>
              <div class="service-empty-state" v-else>
                <div class="flex items-center text-grey-5 italic" style="font-size: 11px;">
                  <q-icon name="info" size="14px" class="q-mr-xs" />
                  Pendiente de registro de datos clínicos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  serviciosAplicados: {
    type: Array,
    required: true
  }
})

defineEmits(['seleccionar-pestaña', 'imprimir-servicio', 'imprimir-resumen'])

const serviciosCompletados = computed(() => props.serviciosAplicados.filter(s => s.completado))
const serviciosPendientes = computed(() => props.serviciosAplicados.filter(s => !s.completado))

const porcentajeProgreso = computed(() => {
  if (props.serviciosAplicados.length === 0) return 0
  return Math.round((serviciosCompletados.value.length / props.serviciosAplicados.length) * 100)
})

const getsDatosRelevantes = (servicio) => {
  const datos = servicio.datos || {}
  
  // Mapeo para servicios conocidos
  const mapeos = {
    vacunacion: {
      'Vacuna': datos.tipoVacuna?.label || datos.vacuna,
      'Lote': datos.numeroLote || datos.lote,
      'Próxima': datos.proximaVacuna
    },
    exploracion: {
      'Temp': datos.temperatura ? `${datos.temperatura}°C` : null,
      'Peso': datos.peso ? `${datos.peso} kg` : null,
      'FC': datos.frecuencia_cardiaca ? `${datos.frecuencia_cardiaca} lpm` : null
    },
    desparacitacion: {
      'Producto': datos.producto,
      'Vía': datos.viaAdministracion || datos.via
    }
  }

  if (mapeos[servicio.tipo]) {
    return mapeos[servicio.tipo]
  }

  // Lógica genérica para servicios dinámicos
  const keys = Object.keys(datos).filter(k => 
    datos[k] !== null && 
    datos[k] !== '' && 
    typeof datos[k] !== 'object'
  )
  
  const res = {}
  keys.slice(0, 3).forEach(k => {
    const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    res[label] = datos[k]
  })
  
  return res
}
</script>

<style scoped>
.servicio-resumen {
  padding: 4px;
}

/* Tarjetas de Métricas */
.metric-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: white;
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
}

.metric-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.metric-card--total .metric-card__icon { background: #eff6ff; color: #2563eb; }
.metric-card--done .metric-card__icon { background: #ecfdf5; color: #10b981; }
.metric-card--pending .metric-card__icon { background: #fff7ed; color: #f59e0b; }

.metric-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metric-card__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

/* Panel de Estadísticas Premium */
.stats-panel {
  padding: 24px;
  border-radius: 20px;
  background: white;
  border: 1px solid #f1f5f9;
  height: 100%;
}

.premium-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.premium-glass::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  opacity: 0.8;
}

.stats-header {
  margin-bottom: 20px;
}

.progress-chart {
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.15));
}

.modern-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
}

.legend-item-v2 {
  width: 100%;
}

.legend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.legend-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.legend-count {
  font-size: 0.9rem;
  font-weight: 700;
}

.legend-bar {
  height: 6px;
  border-radius: 3px;
}

/* Lista de Servicios Premium */
.services-modern-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.premium-service-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s ease;
  position: relative;
}

.premium-service-card:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateX(4px);
}

.premium-service-card--done {
  border-left: 4px solid #10b981;
}

.service-lead {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.service-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-positive-soft { background: #ecfdf5; }
.bg-orange-soft { background: #fff7ed; }

.service-status-line {
  width: 2px;
  flex: 1;
  background: #f1f5f9;
  position: relative;
  min-height: 20px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.service-main {
  flex: 1;
  min-width: 0;
}

.service-name-text {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.service-meta-text {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
}

.service-action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-quick-actions-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
  padding-right: 8px;
  border-right: 1px solid #f1f5f9;
}


.status-chip-v2 {
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.go-to-btn {
  background: #eff6ff;
  transition: all 0.2s;
}

.go-to-btn:hover {
  background: #3b82f6;
  color: white !important;
}

.service-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #f1f5f9;
}

.data-item-v2 {
  display: flex;
  flex-direction: column;
}

.data-item-v2__label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.data-item-v2__value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}


/* Animaciones */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.premium-service-card {
  animation: fadeInUp 0.3s ease forwards;
}

/* Delay gradual para items de la lista */
.premium-service-card:nth-child(1) { animation-delay: 0.05s; }
.premium-service-card:nth-child(2) { animation-delay: 0.1s; }
.premium-service-card:nth-child(3) { animation-delay: 0.15s; }
.premium-service-card:nth-child(4) { animation-delay: 0.2s; }
</style>


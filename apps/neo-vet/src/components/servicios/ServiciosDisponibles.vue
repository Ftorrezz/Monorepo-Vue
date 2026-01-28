<template>
  <div class="servicios-disponibles">
    <!-- Lista de Servicios compacta y en dos columnas -->
    <div class="services-list">
      <q-card
        v-for="servicio in serviciosDisponibles"
        :key="servicio.id"
        class="service-item cursor-pointer transition-all"
        :class="[
          `service-item--${servicio.tipo}`,
          { 'service-item--disabled': isServicioYaAgregado(servicio.tipo) }
        ]"
        @click="seleccionarServicio(servicio)"
        flat
        bordered
      >
        <q-card-section class="row items-center no-wrap q-pa-sm">
          <!-- Icono del servicio (Izquierda) -->
          <div class="service-icon-container q-mr-md">
            <q-avatar 
              :color="isServicioYaAgregado(servicio.tipo) ? 'grey-4' : servicio.color" 
              text-color="white" 
              size="44px"
              :icon="servicio.icono"
              class="service-icon shadow-2"
            />
            <!-- Badges compactos -->
            <q-badge
              v-if="servicio.premium"
              floating
              color="amber"
              text-color="white"
              class="service-badge-mini"
            >
              <q-icon name="star" size="10px" />
            </q-badge>
            <q-badge
              v-if="servicio.integrable"
              floating
              color="blue"
              text-color="white"
              class="service-badge-mini service-badge-mini--left"
            >
              <q-icon name="link" size="10px" />
            </q-badge>
          </div>
          
          <!-- Información del servicio (Centro) -->
          <div class="col column justify-center overflow-hidden">
            <div class="service-name text-subtitle2 text-weight-bold no-wrap ellipsis" 
                 :class="{ 'text-grey-6': isServicioYaAgregado(servicio.tipo) }">
              {{ servicio.nombre }}
            </div>
            <div class="service-description text-caption text-grey-7 ellipsis" style="max-width: 100%;">
              {{ servicio.descripcion }}
            </div>
            
            <div class="row items-center q-gutter-x-sm q-mt-xs">
              <!-- Indicadores especiales compactos -->
              <div v-if="servicio.duracion" class="service-info-mini text-caption text-grey-6">
                <q-icon name="schedule" size="12px" />
                {{ servicio.duracion }}
              </div>
              
              <!-- Precio si existe -->
              <div v-if="servicio.precio" class="service-price-mini text-caption text-primary text-weight-medium">
                <q-icon name="attach_money" size="12px" />
                {{ servicio.precio }}
              </div>
            </div>
          </div>
          
          <!-- Acción / Estado (Derecha) -->
          <div class="q-ml-md">
            <q-btn
              v-if="!isServicioYaAgregado(servicio.tipo)"
              round
              flat
              dense
              :color="servicio.color"
              icon="add_circle"
              size="14px"
              class="service-action-btn"
            >
              <q-tooltip>Agregar servicio</q-tooltip>
            </q-btn>
            <q-icon
              v-else
              name="check_circle"
              color="positive"
              size="24px"
              class="q-ma-xs"
            >
              <q-tooltip>Ya agregado</q-tooltip>
            </q-icon>
          </div>
        </q-card-section>
      </q-card>
    </div>
    
    <!-- Información adicional y botones de cierre -->
    <div class="row items-center justify-between q-mt-md q-px-sm border-top-divider">
      <div class="column">
        <div class="text-caption text-grey-6">
          <q-icon name="info" size="xs" color="grey-5" class="q-mr-xs" />
          {{ serviciosDisponibles.length }} servicios disponibles
        </div>
      </div>
      
      <div class="row q-gutter-x-md">
        <!-- Leyenda compacta -->
        <div class="row q-gutter-x-sm items-center">
          <q-icon name="star" color="amber" size="14px"><q-tooltip>Premium</q-tooltip></q-icon>
          <q-icon name="link" color="blue" size="14px"><q-tooltip>Integrable</q-tooltip></q-icon>
        </div>
        <q-btn flat dense label="Cerrar" color="grey-7" @click="$emit('close')" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ServiciosDisponibles',
  
  props: {
    // Servicios ya agregados a la atención actual
    serviciosAplicados: {
      type: Array,
      default: () => []
    },
    
    // Lista personalizada de servicios (opcional)
    serviciosCustom: {
      type: Array,
      default: null
    },
    
    // Si la atención está finalizada
    atencionFinalizada: {
      type: Boolean,
      default: false
    }
  },
  
  emits: [
    'agregar-servicio',
    'close'
  ],
  
  setup(props, { emit }) {
    const $q = useQuasar()
    
    // Lista de servicios disponibles
    const serviciosDisponiblesPredeterminados = [
      { id: 'vacunacion', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas preventivas', icono: 'vaccines', color: 'green', tipo: 'vacunacion' },
      { id: 'desparacitacion', nombre: 'Desparacitación', descripcion: 'Tratamiento antiparasitario', icono: 'medication', color: 'orange', tipo: 'desparacitacion' },
      { id: 'exploracion', nombre: 'Exploración Física', descripcion: 'Examen clínico general', icono: 'health_and_safety', color: 'blue', tipo: 'exploracion' },
      { id: 'certificado', nombre: 'Certificado Médico', descripcion: 'Constancias médicas', icono: 'description', color: 'purple', tipo: 'certificado' },
      { id: 'medicamentos', nombre: 'Administración de Medicamentos', descripcion: 'Gestión de prescripciones', icono: 'medication', color: 'blue', tipo: 'medicamentos', integrable: true },
      { id: 'cirugia', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos', icono: 'local_hospital', color: 'red', tipo: 'cirugia', integrable: true },
      { id: 'laboratorio', nombre: 'Análisis de Laboratorio', descripcion: 'Pruebas diagnósticas', icono: 'biotech', color: 'teal', tipo: 'laboratorio' },
      { id: 'rayosx', nombre: 'Rayos X', descripcion: 'Estudios por imagen', icono: 'medical_information', color: 'indigo', tipo: 'rayosx' },
      { id: 'hospitalizacion', nombre: 'Hospitalización', descripcion: 'Cuidados intensivos', icono: 'local_hotel', color: 'pink', tipo: 'hospitalizacion', integrable: true },
      { id: 'estetica', nombre: 'Estética y Belleza', descripcion: 'Corte y baño', icono: 'content_cut', color: 'cyan', tipo: 'estetica' },
      { id: 'ultrasonido', nombre: 'Ultrasonido', descripcion: 'Diagnóstico por imagen', icono: 'ultrasound', color: 'lime', tipo: 'ultrasonido' },
      { id: 'emergencia', nombre: 'Atención de Emergencia', descripcion: 'Urgencias 24 horas', icono: 'emergency', color: 'deep-orange', tipo: 'emergencia', integrable: true, premium: true },
      { id: 'rehabilitacion', nombre: 'Rehabilitación', descripcion: 'Fisioterapia y recuperación', icono: 'accessibility_new', color: 'brown', tipo: 'rehabilitacion', integrable: true }
    ]
    
    const serviciosDisponibles = props.serviciosCustom || serviciosDisponiblesPredeterminados
    
    const isServicioYaAgregado = (tipoServicio) => {
      return props.serviciosAplicados.some(servicio => servicio.tipo === tipoServicio)
    }
    
    const seleccionarServicio = (servicio) => {
      if (props.atencionFinalizada) {
        $q.notify({ type: 'warning', message: 'Atención finalizada', position: 'top' })
        return
      }
      
      if (isServicioYaAgregado(servicio.tipo)) {
        $q.notify({ type: 'warning', message: 'Servicio ya agregado', position: 'top' })
        return
      }
      
      emit('agregar-servicio', {
        ...servicio,
        timestamp: new Date().toLocaleString()
      })
      
      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado`,
        position: 'top',
        timeout: 2000,
        icon: servicio.icono
      })
    }
    
    return {
      serviciosDisponibles,
      isServicioYaAgregado,
      seleccionarServicio
    }
  }
})
</script>

<style scoped>
.services-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 65vh;
  overflow-y: auto;
  padding: 8px;
}

@media (max-width: 800px) {
  .services-list {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

.services-list::-webkit-scrollbar { width: 6px; }
.services-list::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }

.service-item {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  background: white;
  min-height: 70px;
}

.service-item:hover:not(.service-item--disabled) {
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
  border-color: currentColor !important;
}

.service-item--disabled {
  background: #f9fdfa !important;
  border-color: #4caf5020 !important;
  opacity: 0.8;
  cursor: default;
}

.service-icon-container { position: relative; display: flex; align-items: center; }
.service-icon { transition: transform 0.3s ease; }
.service-item:hover:not(.service-item--disabled) .service-icon { transform: scale(1.05) rotate(5deg); }
.service-badge-mini { padding: 2px 4px; min-height: 14px; border-radius: 4px; border: 1px solid white; }
.service-badge-mini--left { top: auto !important; bottom: -2px !important; right: -4px !important; left: auto !important; }

.service-name { line-height: 1.2; }
.service-description { font-size: 0.75rem; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.service-info-mini, .service-price-mini { display: flex; align-items: center; gap: 3px; }

.service-action-btn { opacity: 0.6; transition: all 0.2s ease; }
.service-item:hover .service-action-btn { opacity: 1; transform: scale(1.1); }

.service-item--vacunacion:hover { color: #4caf50; border-color: #4caf50 !important; }
.service-item--desparacitacion:hover { color: #ff9800; border-color: #ff9800 !important; }
.service-item--exploracion:hover { color: #2196f3; border-color: #2196f3 !important; }
.service-item--certificado:hover { color: #9c27b0; border-color: #9c27b0 !important; }
.service-item--medicamentos:hover { color: #2196f3; border-color: #2196f3 !important; }
.service-item--cirugia:hover { color: #f44336; border-color: #f44336 !important; }
.service-item--laboratorio:hover { color: #009688; border-color: #009688 !important; }
.service-item--rayosx:hover { color: #3f51b5; border-color: #3f51b5 !important; }
.service-item--hospitalizacion:hover { color: #e91e63; border-color: #e91e63 !important; }
.service-item--estetica:hover { color: #00bcd4; border-color: #00bcd4 !important; }
.service-item--ultrasonido:hover { color: #cddc39; border-color: #cddc39 !important; }
.service-item--emergencia:hover { color: #ff5722; border-color: #ff5722 !important; }
.service-item--rehabilitacion:hover { color: #795548; border-color: #795548 !important; }

.service-item { animation: itemSlideIn 0.3s ease-out forwards; animation-fill-mode: both; }
@keyframes itemSlideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

.service-item:nth-child(1) { animation-delay: 0.05s; }
.service-item:nth-child(2) { animation-delay: 0.1s; }
.service-item:nth-child(3) { animation-delay: 0.15s; }
.service-item:nth-child(4) { animation-delay: 0.2s; }
.service-item:nth-child(5) { animation-delay: 0.25s; }
.service-item:nth-child(6) { animation-delay: 0.3s; }

.border-top-divider { border-top: 1px solid rgba(0, 0, 0, 0.05); padding-top: 12px; }

.body--dark .service-item { background: #1e1e1e; border-color: rgba(255, 255, 255, 0.1) !important; }
.body--dark .service-item:hover:not(.service-item--disabled) { background: #252525; }
.body--dark .service-item--disabled { background: rgba(76, 175, 80, 0.05) !important; }
.body--dark .border-top-divider { border-top-color: rgba(255, 255, 255, 0.1); }

.transition-all { transition: all 0.3s ease; }
.cursor-pointer { cursor: pointer; }
</style>
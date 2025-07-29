<template>
  <div class="servicios-disponibles">
    <!-- Grid de Cards de Servicios optimizado -->
    <div class="services-grid">
      <q-card
        v-for="servicio in serviciosDisponibles"
        :key="servicio.id"
        class="service-card cursor-pointer transition-all"
        :class="[
          `service-card--${servicio.tipo}`,
          { 'service-card--disabled': isServicioYaAgregado(servicio.tipo) }
        ]"
        @click="seleccionarServicio(servicio)"
        flat
        bordered
      >
        <q-card-section class="text-center q-pa-sm">
          <!-- Icono del servicio -->
          <div class="service-icon-container q-mb-sm">
            <q-avatar 
              :color="isServicioYaAgregado(servicio.tipo) ? 'grey-4' : servicio.color" 
              text-color="white" 
              size="40px"
              :icon="servicio.icono"
              class="service-icon"
            />
            <!-- Badge de servicio premium si aplica -->
            <q-badge
              v-if="servicio.premium"
              floating
              color="amber"
              text-color="white"
              class="service-premium-badge"
            >
              <q-icon name="star" size="xs" />
            </q-badge>
          </div>
          
          <!-- Información del servicio -->
          <div class="service-name text-weight-bold q-mb-xs" 
               :class="{ 'text-grey-6': isServicioYaAgregado(servicio.tipo) }">
            {{ servicio.nombre }}
          </div>
          <div class="service-description text-caption text-grey-7 q-mb-xs">
            {{ servicio.descripcion }}
          </div>
          
          <!-- Precio estimado si existe -->
          <div v-if="servicio.precio" class="service-price text-caption text-primary q-mb-xs">
            <q-icon name="attach_money" size="xs" />
            {{ servicio.precio }}
          </div>
          
          <!-- Estado del servicio -->
          <q-chip
            v-if="isServicioYaAgregado(servicio.tipo)"
            color="positive"
            text-color="white"
            icon="check_circle"
            label="Agregado"
            size="sm"
            class="service-status-chip"
          />
          <q-chip
            v-else
            outline
            :color="servicio.color"
            icon="add_circle"
            label="Agregar"
            size="sm"
            class="service-status-chip"
          />
        </q-card-section>

        <!-- Ripple effect -->
        <q-inner-loading :showing="false" />
      </q-card>
    </div>
    
    <!-- Información adicional -->
    <div class="text-center q-mt-lg">
      <div class="text-body2 text-grey-6 q-mb-xs">
        <q-icon name="info" size="sm" class="q-mr-xs" />
        Servicios disponibles: {{ serviciosDisponibles.length }}
      </div>
      <div class="text-caption text-grey-5">
        Los servicios marcados como "Ya agregado" no se pueden seleccionar nuevamente
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
    
    // Lista extendida de servicios disponibles
    const serviciosDisponiblesPredeterminados = [
      {
        id: 'vacunacion',
        nombre: 'Vacunación',
        descripcion: 'Aplicación de vacunas preventivas y refuerzos',
        icono: 'vaccines',
        color: 'green',
        tipo: 'vacunacion',
       // precio: 'Desde $25'
      },
      {
        id: 'desparacitacion',
        nombre: 'Desparacitación',
        descripcion: 'Tratamiento antiparasitario interno y externo',
        icono: 'medication',
        color: 'orange',
        tipo: 'desparacitacion',
        //precio: 'Desde $15'
      },
      {
        id: 'exploracion',
        nombre: 'Exploración Física',
        descripcion: 'Examen clínico general completo del paciente',
        icono: 'health_and_safety',
        color: 'blue',
        tipo: 'exploracion',
        //precio: 'Desde $30'
      },
      {
        id: 'certificado',
        nombre: 'Certificado Médico',
        descripcion: 'Emisión de certificados y constancias médicas',
        icono: 'description',
        color: 'purple',
        tipo: 'certificado',
        //precio: 'Desde $10'
      },
      {
        id: 'cirugia',
        nombre: 'Cirugía',
        descripcion: 'Procedimientos quirúrgicos menores y mayores',
        icono: 'local_hospital',
        color: 'red',
        tipo: 'cirugia',
        //precio: 'Consultar',
        //premium: true
      },
      {
        id: 'laboratorio',
        nombre: 'Análisis de Laboratorio',
        descripcion: 'Pruebas diagnósticas y análisis clínicos',
        icono: 'biotech',
        color: 'teal',
        tipo: 'laboratorio',
        //precio: 'Desde $40'
      },
      {
        id: 'radiologia',
        nombre: 'Radiología',
        descripcion: 'Estudios radiológicos, ecografías y diagnóstico por imagen',
        icono: 'medical_information',
        color: 'indigo',
        tipo: 'radiologia',
        //precio: 'Desde $80',
        //premium: true
      },
      {
        id: 'hospitalizacion',
        nombre: 'Hospitalización',
        descripcion: 'Internamiento, cuidados intensivos y monitoreo 24/7',
        icono: 'local_hotel',
        color: 'pink',
        tipo: 'hospitalizacion',
        //precio: 'Por día',
        //premium: true
      },
      {
        id: 'estetica',
        nombre: 'Estética y Belleza',
        descripcion: 'Corte de pelo, baño, limpieza dental y cuidado estético',
        icono: 'content_cut',
        color: 'cyan',
        tipo: 'estetica',
        //precio: 'Desde $35'
      },
      /*{
        id: 'nutricion',
        nombre: 'Consulta Nutricional',
        descripcion: 'Asesoramiento nutricional y planes alimentarios',
        icono: 'restaurant',
        color: 'lime',
        tipo: 'nutricion',
        precio: 'Desde $25'
      },
      {
        id: 'emergencia',
        nombre: 'Atención de Emergencia',
        descripción: 'Atención veterinaria de urgencia las 24 horas',
        icono: 'emergency',
        color: 'deep-orange',
        tipo: 'emergencia',
        precio: 'Consultar',
        premium: true
      },
      {
        id: 'rehabilitacion',
        nombre: 'Rehabilitación',
        descripcion: 'Fisioterapia y rehabilitación post-operatoria',
        icono: 'accessibility_new',
        color: 'brown',
        tipo: 'rehabilitacion',
        precio: 'Por sesión'
      }*/
    ]
    
    // Usar servicios custom si se proporcionan, sino usar los predeterminados
    const serviciosDisponibles = props.serviciosCustom || serviciosDisponiblesPredeterminados
    
    // Verificar si un servicio ya está agregado
    const isServicioYaAgregado = (tipoServicio) => {
      return props.serviciosAplicados.some(servicio => servicio.tipo === tipoServicio)
    }
    
    // Seleccionar un servicio
    const seleccionarServicio = (servicio) => {
      // Verificar si la atención está finalizada
      if (props.atencionFinalizada) {
        $q.notify({
          type: 'warning',
          message: 'No se pueden agregar servicios a una atención finalizada',
          position: 'top',
          timeout: 3000,
          icon: 'warning'
        })
        return
      }
      
      // Verificar si ya está agregado
      if (isServicioYaAgregado(servicio.tipo)) {
        $q.notify({
          type: 'warning',
          message: `El servicio "${servicio.nombre}" ya ha sido agregado a esta atención`,
          position: 'top',
          timeout: 2500,
          icon: 'warning'
        })
        return
      }
      
      // Efecto visual temporal
      const cardElement = document.querySelector(`.service-card--${servicio.tipo}`)
      if (cardElement) {
        cardElement.classList.add('selecting')
        setTimeout(() => {
          cardElement.classList.remove('selecting')
        }, 300)
      }
      
      // Emitir evento de selección
      emit('agregar-servicio', {
        ...servicio,
        timestamp: new Date().toLocaleString()
      })
      
      // Mostrar feedback de éxito
      $q.notify({
        type: 'positive',
        message: `${servicio.nombre} agregado exitosamente`,
        position: 'top',
        timeout: 2000,
        icon: servicio.icono,
        actions: [
          {
            label: 'Ver',
            color: 'white',
            handler: () => {
              emit('close')
            }
          }
        ]
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
/* Grid optimizado para más servicios con cards compactas */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  padding: 4px;
}

/* Ajustes para diferentes tamaños de pantalla */
@media (min-width: 1200px) {
  .services-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 900px) and (max-width: 1199px) {
  .services-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

@media (max-width: 599px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.service-card {
  border-radius: 12px !important;
  overflow: hidden;
  position: relative;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent !important;
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.service-card .q-card-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px !important;
}

.service-card:hover:not(.service-card--disabled) {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15) !important;
}

.service-card--disabled {
  background: rgba(76, 175, 80, 0.05) !important;
  border-color: #4caf50 !important;
  transform: scale(0.98);
  cursor: not-allowed;
}

.service-card--disabled:hover {
  transform: scale(0.98);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.2) !important;
}

/* Estados hover por tipo de servicio */
.service-card--vacunacion:hover:not(.service-card--disabled) {
  border-color: #4caf50 !important;
  box-shadow: 0 16px 32px rgba(76, 175, 80, 0.25) !important;
}

.service-card--desparacitacion:hover:not(.service-card--disabled) {
  border-color: #ff9800 !important;
  box-shadow: 0 16px 32px rgba(255, 152, 0, 0.25) !important;
}

.service-card--exploracion:hover:not(.service-card--disabled) {
  border-color: #2196f3 !important;
  box-shadow: 0 16px 32px rgba(33, 150, 243, 0.25) !important;
}

.service-card--certificado:hover:not(.service-card--disabled) {
  border-color: #9c27b0 !important;
  box-shadow: 0 16px 32px rgba(156, 39, 176, 0.25) !important;
}

.service-card--cirugia:hover:not(.service-card--disabled) {
  border-color: #f44336 !important;
  box-shadow: 0 16px 32px rgba(244, 67, 54, 0.25) !important;
}

.service-card--laboratorio:hover:not(.service-card--disabled) {
  border-color: #009688 !important;
  box-shadow: 0 16px 32px rgba(0, 150, 136, 0.25) !important;
}

.service-card--radiologia:hover:not(.service-card--disabled) {
  border-color: #3f51b5 !important;
  box-shadow: 0 16px 32px rgba(63, 81, 181, 0.25) !important;
}

.service-card--hospitalizacion:hover:not(.service-card--disabled) {
  border-color: #e91e63 !important;
  box-shadow: 0 16px 32px rgba(233, 30, 99, 0.25) !important;
}

.service-card--estetica:hover:not(.service-card--disabled) {
  border-color: #00bcd4 !important;
  box-shadow: 0 16px 32px rgba(0, 188, 212, 0.25) !important;
}

.service-card--nutricion:hover:not(.service-card--disabled) {
  border-color: #cddc39 !important;
  box-shadow: 0 16px 32px rgba(205, 220, 57, 0.25) !important;
}

.service-card--emergencia:hover:not(.service-card--disabled) {
  border-color: #ff5722 !important;
  box-shadow: 0 16px 32px rgba(255, 87, 34, 0.25) !important;
}

.service-card--rehabilitacion:hover:not(.service-card--disabled) {
  border-color: #795548 !important;
  box-shadow: 0 16px 32px rgba(121, 85, 72, 0.25) !important;
}

/* Icono del servicio */
.service-icon-container {
  position: relative;
  margin-bottom: 8px;
}

.service-icon {
  transition: all 0.3s ease;
}

.service-card:hover:not(.service-card--disabled) .service-icon {
  transform: scale(1.1);
}

.service-card--disabled .service-icon {
  transform: scale(0.9);
}

/* Badge premium */
.service-premium-badge {
  animation: premiumGlow 2s ease-in-out infinite alternate;
}

@keyframes premiumGlow {
  from {
    box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
  }
  to {
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
  }
}

/* Texto del servicio */
.service-name {
  font-size: 0.875rem;
  line-height: 1.2;
  margin-bottom: 6px;
}

.service-description {
  font-size: 0.75rem;
  line-height: 1.3;
  min-height: 2.4em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.service-price {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.75rem;
}

/* Chip de estado */
.service-status-chip {
  transition: all 0.2s ease;
  font-weight: 500;
  margin-top: auto;
}

/* Efecto de selección */
.service-card.selecting {
  transform: scale(0.95);
  transition: transform 0.15s ease;
}

.service-card.selecting::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(25, 118, 210, 0.4) 0%, transparent 70%);
  animation: selectPulse 0.4s ease-out;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 10;
}

@keyframes selectPulse {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 150px;
    height: 150px;
    opacity: 0;
  }
}

/* Animación de entrada para las cards */
.service-card {
  animation: cardSlideIn 0.6s ease-out forwards;
}

.service-card:nth-child(1) { animation-delay: 0.05s; }
.service-card:nth-child(2) { animation-delay: 0.1s; }
.service-card:nth-child(3) { animation-delay: 0.15s; }
.service-card:nth-child(4) { animation-delay: 0.2s; }
.service-card:nth-child(5) { animation-delay: 0.25s; }
.service-card:nth-child(6) { animation-delay: 0.3s; }
.service-card:nth-child(7) { animation-delay: 0.35s; }
.service-card:nth-child(8) { animation-delay: 0.4s; }
.service-card:nth-child(9) { animation-delay: 0.45s; }
.service-card:nth-child(10) { animation-delay: 0.5s; }
.service-card:nth-child(11) { animation-delay: 0.55s; }
.service-card:nth-child(12) { animation-delay: 0.6s; }

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Mejoras para accesibilidad */
.service-card:focus-visible {
  outline: 3px solid #1976d2;
  outline-offset: 2px;
}

.service-card[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Transición suave para cambios de estado */
.service-card * {
  transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

/* Estilos para modo oscuro */
.body--dark .service-card {
  background: #1e1e1e !important;
  border-color: #333 !important;
}

.body--dark .service-card:hover:not(.service-card--disabled) {
  background: #2a2a2a !important;
}

.body--dark .service-card--disabled {
  background: rgba(76, 175, 80, 0.1) !important;
  border-color: #4caf50 !important;
}

/* Estilos adicionales */
.transition-all {
  transition: all 0.3s ease;
}

.cursor-pointer {
  cursor: pointer;
}

.servicios-disponibles {
  width: 100%;
  max-width: 100%;
}

/* Responsive para móviles pequeños */
@media (max-width: 480px) {
  .service-card {
    min-height: 160px;
  }
  
  .service-name {
    font-size: 0.8rem;
  }
  
  .service-description {
    font-size: 0.7rem;
    min-height: 2.1em;
  }
  
  .service-icon-container .q-avatar {
    width: 36px !important;
    height: 36px !important;
    font-size: 18px !important;
  }
  
  .service-price {
    font-size: 0.7rem;
  }
}
</style>
<template>
  <q-card>
    <q-card-section class="q-pb-none">
      <div class="text-h6 q-mb-md">
        <q-icon name="medical_services" class="q-mr-sm" color="primary" />
        Servicios Disponibles
      </div>
    </q-card-section>

    <q-card-section>
      <!-- Grid de Cards de Servicios -->
      <div class="services-grid">
        <q-card
          v-for="servicio in serviciosDisponibles"
          :key="servicio.id"
          class="service-card cursor-pointer transition-all"
          :class="[
            `service-card--${servicio.tipo}`,
            { 'service-card--added': isServicioYaAgregado(servicio.tipo) }
          ]"
          @click="emitAgregarServicio(servicio)"
          flat
          bordered
          :disable="atencionFinalizada || isServicioYaAgregado(servicio.tipo)"
        >
          <q-card-section class="text-center q-pa-md">
            <!-- Icono del servicio -->
            <div class="service-icon-container q-mb-md">
              <q-avatar 
                :color="isServicioYaAgregado(servicio.tipo) ? 'grey-4' : servicio.color" 
                text-color="white" 
                size="56px"
                :icon="servicio.icono"
                class="service-icon"
              />
            </div>
            
            <!-- Información del servicio -->
            <div class="service-name text-weight-bold q-mb-xs" 
                 :class="{ 'text-grey-6': isServicioYaAgregado(servicio.tipo) }">
              {{ servicio.nombre }}
            </div>
            <div class="service-description text-caption text-grey-7 q-mb-sm">
              {{ servicio.descripcion }}
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
      <div class="text-center q-mt-md">
        <div class="text-caption text-grey-6">
          <q-icon name="info" size="xs" class="q-mr-xs" />
          Haz clic en cualquier servicio para agregarlo a la atención actual
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="right" class="q-pt-none">
      <q-btn flat label="Cerrar" color="primary" @click="$emit('close')" />
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ServiciosDisponibles',
  props: {
    serviciosAplicados: {
      type: Array,
      default: () => []
    },
    atencionFinalizada: {
      type: Boolean,
      default: false
    }
  },
  emits: ['agregar-servicio', 'close'],
  setup(props, { emit }) {
    const serviciosDisponibles = ref([
      {
        id: 'vacunacion',
        nombre: 'Vacunación',
        descripcion: 'Aplicación de vacunas',
        icono: 'vaccines',
        color: 'green',
        tipo: 'vacunacion'
      },
      {
        id: 'desparacitacion',
        nombre: 'Desparacitación',
        descripcion: 'Tratamiento antiparasitario',
        icono: 'medication',
        color: 'orange',
        tipo: 'desparacitacion'
      },
      {
        id: 'exploracion',
        nombre: 'Exploración Física',
        descripcion: 'Examen clínico general',
        icono: 'health_and_safety',
        color: 'blue',
        tipo: 'exploracion'
      },
      {
        id: 'certificado',
        nombre: 'Certificado',
        descripcion: 'Emisión de certificados',
        icono: 'description',
        color: 'purple',
        tipo: 'certificado'
      },
      {
        id: 'cirugia',
        nombre: 'Cirugía',
        descripcion: 'Procedimiento quirúrgico',
        icono: 'local_hospital',
        color: 'red',
        tipo: 'cirugia'
      },
      {
        id: 'laboratorio',
        nombre: 'Laboratorio',
        descripcion: 'Análisis de laboratorio',
        icono: 'biotech',
        color: 'teal',
        tipo: 'laboratorio'
      }
    ]);

    const isServicioYaAgregado = (tipoServicio) => {
      return props.serviciosAplicados.some(servicio => servicio.tipo === tipoServicio);
    };

    const emitAgregarServicio = (servicio) => {
      emit('agregar-servicio', servicio);
    };

    return {
      serviciosDisponibles,
      isServicioYaAgregado,
      emitAgregarServicio
    };
  }
};
</script>

<style scoped>
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.service-card {
  border-radius: 16px !important;
  overflow: hidden;
  position: relative;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent !important;
}

.service-card:hover:not(.service-card--added):not([aria-disabled="true"]) {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.service-card--added {
  background: rgba(76, 175, 80, 0.05) !important;
  border-color: #4caf50 !important;
  transform: scale(0.98);
}

.service-card--added:hover {
  transform: scale(0.98);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.2) !important;
}

/* Estados por tipo de servicio */
.service-card--vacunacion:hover:not(.service-card--added):not([aria-disabled="true"]) {
  border-color: #4caf50 !important;
  box-shadow: 0 12px 24px rgba(76, 175, 80, 0.2) !important;
}

.service-card--desparacitacion:hover:not(.service-card--added):not([aria-disabled="true"]) {
  border-color: #ff9800 !important;
  box-shadow: 0 12px 24px rgba(255, 152, 0, 0.2) !important;
}

.service-card--exploracion:hover:not(.service-card--added):not([aria-disabled="true"]) {
  border-color: #2196f3 !important;
  box-shadow: 0 12px 24px rgba(33, 150, 243, 0.2) !important;
}

.service-card--certificado:hover:not(.service-card--added):not([aria-disabled="true"]) {
  border-color: #9c27b0 !important;
  box-shadow: 0 12px 24px rgba(156, 39, 176, 0.2) !important;
}

.service-card--cirugia:hover:not(.service-card--added):not([aria-disabled="true"]) {
  border-color: #f44336 !important;
  box-shadow: 0 12px 24px rgba(244, 67, 54, 0.2) !important;
}

.service-card--laboratorio:hover:not(.service-card--added):not([aria-disabled="true"]) {
  border-color: #009688 !important;
  box-shadow: 0 12px 24px rgba(0, 150, 136, 0.2) !important;
}

/* Icono del servicio */
.service-icon-container {
  position: relative;
}

.service-icon {
  transition: all 0.3s ease;
}

.service-card:hover:not(.service-card--added):not([aria-disabled="true"]) .service-icon {
  transform: scale(1.1);
}

.service-card--added .service-icon {
  transform: scale(0.9);
}

/* Texto del servicio */
.service-name {
  font-size: 0.95rem;
  line-height: 1.3;
}

.service-description {
  font-size: 0.85rem;
  line-height: 1.4;
  min-height: 2.4em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Chip de estado */
.service-status-chip {
  transition: all 0.2s ease;
  font-weight: 500;
}

/* Efectos de brillo para servicios agregados */
.service-card--added::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.3), transparent);
  animation: successSweep 1.5s ease-out;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

@keyframes successSweep {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Badge de completado flotante */
.service-card--added::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  animation: checkmarkBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

@keyframes checkmarkBounce {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(-90deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .service-card .q-card-section {
    padding: 16px !important;
  }
  
  .service-icon-container .q-avatar {
    width: 48px !important;
    height: 48px !important;
    font-size: 24px !important;
  }
  
  .service-name {
    font-size: 0.9rem;
  }
  
  .service-description {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .service-card .q-card-section {
    padding: 12px !important;
  }
  
  .service-icon-container .q-avatar {
    width: 40px !important;
    height: 40px !important;
    font-size: 20px !important;
  }
  
  .service-name {
    font-size: 0.85rem;
  }
  
  .service-description {
    font-size: 0.75rem;
    min-height: 2em;
    -webkit-line-clamp: 2;
  }
}

/* Animación de entrada para las cards */
.service-card {
  animation: cardSlideIn 0.5s ease-out forwards;
}

.service-card:nth-child(1) { animation-delay: 0.1s; }
.service-card:nth-child(2) { animation-delay: 0.15s; }
.service-card:nth-child(3) { animation-delay: 0.2s; }
.service-card:nth-child(4) { animation-delay: 0.25s; }
.service-card:nth-child(5) { animation-delay: 0.3s; }
.service-card:nth-child(6) { animation-delay: 0.35s; }

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efecto de partículas para agregar servicio */
.service-card.adding::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.6) 0%, transparent 70%);
  animation: addServicePulse 0.8s ease-out;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

@keyframes addServicePulse {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
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

.body--dark .service-card:hover:not(.service-card--added) {
  background: #2a2a2a !important;
}

.body--dark .service-card--added {
  background: rgba(76, 175, 80, 0.1) !important;
  border-color: #4caf50 !important;
}
</style> 
<template>
  <div class="servicios-selector-premium">
    <!-- Header de Búsqueda y Categorías -->
    <div class="selector-header q-pa-md bg-white border-bottom sticky-top z-10">
      <div class="row q-col-gutter-sm items-center">
        <div class="col-12 col-md-5">
          <q-input
            v-model="filtroTexto"
            placeholder="¿Qué servicio necesitas?"
            outlined
            dense
            bg-color="grey-1"
            class="br-md search-field"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
            <template v-slot:append v-if="filtroTexto">
              <q-icon name="close" class="cursor-pointer" @click="filtroTexto = ''" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-7">
          <div class="row q-gutter-xs justify-end no-wrap overflow-auto hide-scrollbar">
            <q-btn
              v-for="cat in ['todas', 'consultas', 'procedimientos', 'diagnostico']"
              :key="cat"
              :label="cat"
              :color="categoriaSeleccionada === cat ? 'primary' : 'grey-8'"
              :flat="categoriaSeleccionada !== cat"
              :unelevated="categoriaSeleccionada === cat"
              size="11px"
              class="br-md q-px-sm text-capitalize"
              no-caps
              @click="categoriaSeleccionada = cat"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Servicios con Estética de Menú -->
    <div class="scroll-area custom-scrollbar" style="height: calc(80vh - 160px)">
      <q-list class="q-pa-md">
        <q-item
          v-for="(servicio, index) in serviciosFiltrados"
          :key="servicio.id"
          clickable
          :disable="isServicioYaAgregado(servicio.tipo, servicio.id)"
          v-ripple="!isServicioYaAgregado(servicio.tipo, servicio.id)"
          class="service-modern-item q-mb-xs animate-fade-in"
          :class="{ 'item--is-added': isServicioYaAgregado(servicio.tipo, servicio.id) }"
          :style="{ animationDelay: (index * 0.03) + 's' }"
          @click="seleccionarServicio(servicio)"
        >
          <!-- Icono Moderno (Color sobre Fondo Pastel) -->
          <q-item-section avatar>
            <div 
              class="modern-icon-container" 
              :style="{ 
                backgroundColor: getServicePastelColor(servicio),
                color: getServiceColor(servicio)
              }"
            >
              <q-icon :name="servicio.icono" size="24px" />
            </div>
          </q-item-section>

          <!-- Textos con Mayor Contraste -->
          <q-item-section>
            <q-item-label class="text-weight-bold text-dark text-uppercase letter-spacing-1 no-wrap">
              {{ servicio.nombre }}
              <q-badge v-if="servicio.premium" color="amber-2" text-color="amber-10" label="PREMIUM" class="q-ml-sm br-sm text-weight-bolder" />
            </q-item-label>
            <q-item-label caption lines="1" class="text-grey-8 text-weight-medium">{{ servicio.descripcion }}</q-item-label>
          </q-item-section>

          <!-- Acciones -->
          <q-item-section side>
            <div v-if="isServicioYaAgregado(servicio.tipo, servicio.id)" class="flex items-center text-positive animate-scale">
              <q-icon name="check_circle" size="26px" />
            </div>
            <q-btn
              v-else
              icon="add_circle"
              color="blue-7"
              flat
              round
              dense
              size="md"
              class="hover-reveal"
            />
          </q-item-section>
        </q-item>

        <!-- Empty State -->
        <div v-if="serviciosFiltrados.length === 0" class="text-center q-pa-xl">
          <q-icon name="search_off" size="64px" color="grey-3" />
          <div class="text-grey-5 q-mt-md">No se encontraron servicios que coincidan</div>
        </div>
      </q-list>
    </div>

    <!-- Footer Informativo -->
    <div class="selector-footer q-px-lg q-py-sm bg-grey-1 flex items-center justify-between border-top">
      <div class="row items-center text-caption text-grey-6">
        <q-icon name="lightbulb" color="amber-8" size="14px" class="q-mr-xs" />
        Mostrando {{ serviciosFiltrados.length }} servicios disponibles
      </div>
      <q-btn flat dense label="Cerrar Catálogo" color="primary" no-caps v-close-popup />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ServiciosDisponibles',
  
  props: {
    serviciosAplicados: {
      type: Array,
      default: () => []
    },
    serviciosCustom: {
      type: Array,
      default: null
    },
    serviciosDinamicos: {
      type: Array,
      default: () => []
    },
    // Catálogo desde BD (GEN.SERVICIO con tipo_renderizado y componente_clave)
    serviciosCatalogo: {
      type: Array,
      default: null
    },
    atencionFinalizada: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['agregar-servicio', 'close'],
  
  setup(props, { emit }) {
    const $q = useQuasar()
    
    // Referencias reactivas para filtros
    const filtroTexto = ref('')
    const categoriaSeleccionada = ref('todas')
    
    // Categorización de servicios
    const categoriasMap = {
      vacunacion: 'consultas',
      desparasitacion: 'consultas',
      desparacitacion: 'consultas', // fallback
      exploracion: 'consultas',
      certificado: 'consultas',
      receta: 'consultas',
      medicamentos: 'consultas',
      cirugia: 'procedimientos',
      hospitalizacion: 'procedimientos',
      estetica: 'procedimientos',
      rehabilitacion: 'procedimientos',
      emergencia: 'procedimientos',
      laboratorio: 'diagnostico',
      rayosx: 'diagnostico',
      ultrasonido: 'diagnostico',
      archivos: 'diagnostico'
    }
    
    // Lista de servicios fijos con su configuración especializada explícita
    const serviciosDisponiblesPredeterminados = [
      { id: 'vacunacion', nombre: 'Vacunación', descripcion: 'Aplicación de vacunas preventivas', icono: 'vaccines', color: 'green', tipo: 'vacunacion', tipo_renderizado: 'especializado', componente_clave: 'vacunacion', esFijo: true },
      { id: 'desparasitacion', nombre: 'Desparasitación', descripcion: 'Tratamiento antiparasitario', icono: 'medication', color: 'orange', tipo: 'desparasitacion', tipo_renderizado: 'especializado', componente_clave: 'desparasitacion', esFijo: true },
      { id: 'exploracion', nombre: 'Exploración Física', descripcion: 'Examen clínico general', icono: 'health_and_safety', color: 'blue', tipo: 'exploracion', tipo_renderizado: 'especializado', componente_clave: 'exploracion', esFijo: true },
      { id: 'certificado', nombre: 'Certificado Médico', descripcion: 'Constancias médicas', icono: 'description', color: 'purple', tipo: 'certificado', tipo_renderizado: 'especializado', componente_clave: 'certificado', esFijo: true },
      { id: 'receta', nombre: 'Receta Médica', descripcion: 'Prescripción de medicamentos', icono: 'receipt_long', color: 'purple', tipo: 'receta', tipo_renderizado: 'especializado', componente_clave: 'receta', esFijo: true },
      { id: 'medicamentos', nombre: 'Medicamentos', descripcion: 'Gestión de prescripciones', icono: 'medication', color: 'blue', tipo: 'medicamentos', tipo_renderizado: 'especializado', componente_clave: 'medicamentos', integrable: true, esFijo: true },
      { id: 'cirugia', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos', icono: 'local_hospital', color: 'red', tipo: 'cirugia', tipo_renderizado: 'especializado', componente_clave: 'cirugia', integrable: true, esFijo: true },
      { id: 'laboratorio', nombre: 'Laboratorio', descripcion: 'Análisis y pruebas', icono: 'biotech', color: 'teal', tipo: 'laboratorio', tipo_renderizado: 'especializado', componente_clave: 'laboratorio', esFijo: true },
      { id: 'rayosx', nombre: 'Rayos X', descripcion: 'Estudios por imagen', icono: 'medical_information', color: 'indigo', tipo: 'rayosx', tipo_renderizado: 'especializado', componente_clave: 'rayosx', esFijo: true },
      { id: 'hospitalizacion', nombre: 'Hospitalización', descripcion: 'Cuidados intensivos', icono: 'local_hotel', color: 'pink', tipo: 'hospitalizacion', tipo_renderizado: 'especializado', componente_clave: 'hospitalizacion', integrable: true, esFijo: true },
      { id: 'estetica', nombre: 'Estética', descripcion: 'Corte y baño', icono: 'content_cut', color: 'cyan', tipo: 'estetica', tipo_renderizado: 'especializado', componente_clave: 'estetica', esFijo: true },
      { id: 'ultrasonido', nombre: 'Ultrasonido', descripcion: 'Diagnóstico por ultrasonido', icono: 'monitor_heart', color: 'lime', tipo: 'ultrasonido', tipo_renderizado: 'especializado', componente_clave: 'ultrasonido', esFijo: true },
      { id: 'emergencia', nombre: 'Emergencia', descripcion: 'Atención urgente 24/7', icono: 'emergency', color: 'deep-orange', tipo: 'emergencia', tipo_renderizado: 'especializado', componente_clave: 'emergencia', integrable: true, premium: true, esFijo: true },
      { id: 'rehabilitacion', nombre: 'Rehabilitación', descripcion: 'Fisioterapia y recuperación', icono: 'accessibility_new', color: 'brown', tipo: 'rehabilitacion', tipo_renderizado: 'especializado', componente_clave: 'rehabilitacion', integrable: true, esFijo: true },
      { id: 'archivos', nombre: 'Archivos Adjuntos', descripcion: 'Subir imágenes, PDFs y otros documentos', icono: 'folder_open', color: 'blue-grey', tipo: 'archivos', tipo_renderizado: 'especializado', componente_clave: 'archivos', esFijo: true }
    ]
    
    // Mapear servicios dinámicos
    const serviciosDinamicosMapeados = computed(() => {
      return props.serviciosDinamicos.map(servicio => ({
        id: `dinamico_${servicio.id}`,
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || 'Servicio configurable',
        icono: servicio.icono || 'auto_awesome',
        color: 'primary',
        tipo: servicio.identificador,
        esDinamico: true,
        integrable: true
      }))
    })
    
    // Combinar servicios
    const serviciosDisponibles = computed(() => {
      // 1. Prioridad máxima: prop custom explícito
      if (props.serviciosCustom) return props.serviciosCustom

      // 2. Catálogo desde BD (GEN.SERVICIO con tipo_renderizado)
      if (props.serviciosCatalogo && props.serviciosCatalogo.length > 0) {
        return props.serviciosCatalogo.map(s => {
          const tipo = s.componente_clave || s.identificador || String(s.id)
          
          let pred = serviciosDisponiblesPredeterminados.find(p => 
            p.tipo === tipo || 
            (typeof tipo === 'string' && p.tipo.toLowerCase() === tipo.toLowerCase())
          )
          
          // Si no encuentra por clave, intentar por nombre normalizado (sin acentos)
          if (!pred && s.nombre) {
            const nombreNormalizado = s.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            pred = serviciosDisponiblesPredeterminados.find(p => 
              p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === nombreNormalizado ||
              p.tipo === nombreNormalizado
            )
          }

          return {
            // id numérico real de BD → se usa como id_servicio_def en ATENCION_SERVICIOS
            id:              s.id,
            id_servicio:     s.id,
            nombre:          (s.nombre && !s.nombre.toUpperCase().startsWith('SERVICIO ')) ? s.nombre : (pred?.nombre || s.nombre),
            descripcion:     s.descripcion || (pred?.descripcion) || '',
            icono:           s.icono || (pred?.icono) || 'medical_services',
            color:           s.color || (pred?.color) || 'primary',
            categoria:       s.categoria || (pred ? categoriasMap[pred.tipo] : 'consultas'),
            tipo_renderizado: s.tipo_renderizado || 'dinamico',
            // componente_clave: qué componente Vue cargar (ej: 'vacunacion')
            componente_clave: s.componente_clave || null,
            // tipo: para backward compat con isServicioYaAgregado
            tipo:            String(tipo).toLowerCase(),
            esDinamico:      s.tipo_renderizado !== 'especializado'
          }
        })
      }

      // 3. Fallback: array hardcodeado + dinámicos (backward compat)
      return [
        ...serviciosDisponiblesPredeterminados,
        ...serviciosDinamicosMapeados.value
      ]
    })
    
    // Servicios filtrados (Incluyendo los agregados pero marcados como deshabilitados)
    const serviciosFiltrados = computed(() => {
      let servicios = serviciosDisponibles.value
      
      // 1. Filtro por texto
      if (filtroTexto.value) {
        const texto = filtroTexto.value.toLowerCase()
        servicios = servicios.filter(s => 
          s.nombre.toLowerCase().includes(texto) ||
          s.descripcion.toLowerCase().includes(texto)
        )
      }
      
      // 2. Filtro por categoría
      if (categoriaSeleccionada.value !== 'todas') {
        servicios = servicios.filter(s => {
          const categoria = categoriasMap[s.tipo] || 'consultas'
          return categoria === categoriaSeleccionada.value
        })
      }
      
      return servicios
    })
    
    const isServicioYaAgregado = (tipoServicio, idCatalog = null) => {
      if (!tipoServicio && !idCatalog) return false
      
      const tipoLower = tipoServicio ? String(tipoServicio).toLowerCase() : null
      
      return props.serviciosAplicados.some(s => {
        // 1. Prioridad: Comparar por ID real de catálogo (unívoco)
        if (idCatalog && s.id_servicio_def && Number(s.id_servicio_def) === Number(idCatalog)) return true
        
        // 2. Fallback: Comparar por tipo (retrocompatibilidad)
        if (tipoLower && s.tipo && String(s.tipo).toLowerCase() === tipoLower) return true
        
        return false
      })
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
    
    const getServiceColor = (servicio) => {
      const colors = {
        consultas: '#2e7d32', // Mas oscuro para contraste
        procedimientos: '#4527a0',
        diagnostico: '#00695c'
      }
      return servicio.color || colors[categoriasMap[servicio.tipo]] || '#1565c0'
    }

    const getServicePastelColor = (servicio) => {
      const baseColor = getServiceColor(servicio)
      // Generar una versión muy clara del color base para el fondo
      return baseColor + '15' // 15 es ~8% de opacidad en hex
    }

    return {
      serviciosDisponibles,
      serviciosFiltrados,
      isServicioYaAgregado,
      seleccionarServicio,
      filtroTexto,
      categoriaSeleccionada,
      getServiceColor,
      getServicePastelColor
    }
  }
})
</script>

<style scoped>
.servicios-selector-premium {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fdfdfd;
}

.selector-header {
  border-bottom: 2px solid #f1f1f1;
}

.search-field :deep(.q-field__control) {
  border-radius: 8px !important;
  background: white !important;
}

.service-modern-item {
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease-out;
  padding: 8px 16px;
}

.service-modern-item:hover:not(.item--is-added) {
  border-color: #1976d2;
  background: #f8fbff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  transform: translateY(-1px);
}

.item--is-added {
  background: #fff5f5;
  border-color: #fee2e2;
  opacity: 0.7;
  cursor: not-allowed !important;
}

.item--is-added .modern-icon-container {
  filter: grayscale(0.5);
  opacity: 0.6;
}

.item--is-added .text-dark {
  color: #c53030 !important;
}

.modern-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.service-modern-item:hover .modern-icon-container {
  transform: scale(1.05) rotate(-2deg);
}

.letter-spacing-1 {
  letter-spacing: 0.5px;
  font-size: 13px;
}

.hover-reveal {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.service-modern-item:hover .hover-reveal {
  opacity: 1;
}

/* Animations */
.animate-fade-in {
  animation: fadeInUp 0.35s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-scale {
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

.selector-footer {
  border-top: 1px solid #eee;
}
</style>

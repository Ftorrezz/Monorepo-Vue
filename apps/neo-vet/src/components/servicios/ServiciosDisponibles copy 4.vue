<template>
  <div class="servicios-selector-premium">

    <!-- Header de Búsqueda -->
    <div class="selector-header q-pa-lg bg-white">
      <div class="row q-col-gutter-md items-center q-mb-md">
        <div class="col-12 col-md-7">
          <q-input
            v-model="filtroTexto"
            placeholder="Buscar servicio..."
            outlined
            dense
            bg-color="grey-1"
            class="search-field"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="blue-7" />
            </template>
            <template v-slot:append v-if="filtroTexto">
              <q-icon name="close" class="cursor-pointer text-grey-5" @click="filtroTexto = ''" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-5">
          <div class="row q-gutter-xs no-wrap overflow-auto hide-scrollbar">
            <q-btn
              v-for="cat in categorias"
              :key="cat.key"
              :label="cat.label"
              :color="categoriaSeleccionada === cat.key ? 'blue-8' : 'grey-7'"
              :unelevated="categoriaSeleccionada === cat.key"
              :flat="categoriaSeleccionada !== cat.key"
              size="xs"
              no-caps
              class="cat-pill q-px-md text-weight-bold"
              @click="categoriaSeleccionada = cat.key"
            />
          </div>
        </div>
      </div>

      <!-- Contador -->
      <div class="row items-center justify-between">
        <span class="text-caption text-grey-6 text-weight-medium">
          <span class="text-blue-8 text-weight-bold">{{ serviciosFiltrados.length }}</span> servicios disponibles
          <span v-if="totalAgregados > 0" class="q-ml-sm">
            · <span class="text-positive text-weight-bold">{{ totalAgregados }}</span> ya en esta atención
          </span>
        </span>
        <div class="row q-gutter-xs">
          <q-btn-toggle
            v-model="viewMode"
            flat
            dense
            :options="[
              { value: 'grid', icon: 'grid_view' },
              { value: 'list', icon: 'view_list' }
            ]"
            color="grey-6"
            toggle-color="blue-8"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- GRID VIEW -->
    <div class="scroll-area custom-scrollbar" style="height: calc(75vh - 200px); overflow-y: auto;">

      <!-- Grid de Tarjetas -->
      <div v-if="viewMode === 'grid'" class="cards-grid q-pa-md">
        <transition-group name="card-list" tag="div" class="cards-wrapper">
          <div
            v-for="(servicio, index) in serviciosFiltrados"
            :key="servicio.id"
            class="service-card"
            :class="{
              'service-card--added': isServicioYaAgregado(servicio.tipo, servicio.id),
              'service-card--available': !isServicioYaAgregado(servicio.tipo, servicio.id)
            }"
            :style="{ '--card-color': getServiceHex(servicio), '--delay': (index * 0.04) + 's' }"
            @click="seleccionarServicio(servicio)"
          >
            <!-- Fondo decorativo -->
            <div class="card-bg-shape"></div>

            <!-- Badge estado -->
            <div class="card-status-badge">
              <div v-if="isServicioYaAgregado(servicio.tipo, servicio.id)" class="badge-added">
                <q-icon name="check" size="11px" />
                <span>Agregado</span>
              </div>
              <div v-else class="badge-available">
                <q-icon name="add" size="11px" />
                <span>Agregar</span>
              </div>
            </div>

            <!-- Icono principal -->
            <div class="card-icon-wrap">
              <div class="card-icon-ring"></div>
              <div class="card-icon-inner">
                <q-icon :name="servicio.icono" size="22px" />
              </div>
            </div>

            <!-- Contenido -->
            <div class="card-content">
              <div class="card-name">{{ servicio.nombre }}</div>
              <div class="card-desc">{{ servicio.descripcion }}</div>
            </div>

            <!-- Footer de la tarjeta -->
            <div class="card-footer">
              <q-chip
                v-if="servicio.premium"
                size="xs"
                color="amber-2"
                text-color="amber-10"
                icon="star"
                label="PREMIUM"
                class="text-weight-bolder q-px-sm"
              />
              <span v-else class="card-categoria-label">
                {{ getCategoriaLabel(servicio) }}
              </span>
              <q-icon
                :name="isServicioYaAgregado(servicio.tipo, servicio.id) ? 'block' : 'arrow_forward'"
                size="16px"
                class="card-arrow"
              />
            </div>

            <!-- Overlay hover -->
            <div class="card-hover-overlay">
              <q-icon
                :name="isServicioYaAgregado(servicio.tipo, servicio.id) ? 'remove_circle_outline' : 'add_circle_outline'"
                size="28px"
              />
              <span>{{ isServicioYaAgregado(servicio.tipo, servicio.id) ? 'Ya agregado' : 'Agregar servicio' }}</span>
            </div>
          </div>
        </transition-group>

        <!-- Empty State -->
        <div v-if="serviciosFiltrados.length === 0" class="empty-state">
          <div class="empty-icon">
            <q-icon name="search_off" size="56px" />
          </div>
          <div class="empty-title">Sin resultados</div>
          <div class="empty-subtitle">No encontramos servicios con "{{ filtroTexto }}"</div>
          <q-btn flat color="blue-7" label="Limpiar filtro" icon="refresh" no-caps class="q-mt-md" @click="filtroTexto = ''" />
        </div>
      </div>

      <!-- LIST VIEW -->
      <div v-else class="q-pa-md">
        <q-list>
          <q-item
            v-for="(servicio, index) in serviciosFiltrados"
            :key="servicio.id"
            clickable
            :disable="isServicioYaAgregado(servicio.tipo, servicio.id)"
            v-ripple="!isServicioYaAgregado(servicio.tipo, servicio.id)"
            class="list-item q-mb-xs"
            :class="{
              'list-item--added': isServicioYaAgregado(servicio.tipo, servicio.id),
              'list-item--available': !isServicioYaAgregado(servicio.tipo, servicio.id)
            }"
            :style="{ '--card-color': getServiceHex(servicio), animationDelay: (index * 0.03) + 's' }"
            @click="seleccionarServicio(servicio)"
          >
            <q-item-section avatar>
              <div class="list-icon" :style="{ backgroundColor: getServiceHex(servicio) + '18', color: getServiceHex(servicio) }">
                <q-icon :name="servicio.icono" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-dark">{{ servicio.nombre }}</q-item-label>
              <q-item-label caption class="text-grey-6">{{ servicio.descripcion }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div v-if="isServicioYaAgregado(servicio.tipo, servicio.id)" class="list-badge-added">
                <q-icon name="check_circle" size="20px" />
                <span>Agregado</span>
              </div>
              <div v-else class="list-badge-add">
                <q-icon name="add_circle" size="20px" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- Footer -->
    <div class="selector-footer q-px-lg q-py-sm bg-white flex items-center justify-between">
      <div class="row items-center text-caption text-grey-5 q-gutter-xs">
        <q-icon name="info_outline" size="14px" />
        <span>Los servicios en rojo ya fueron agregados a esta atención</span>
      </div>
      <q-btn unelevated color="blue-8" label="Cerrar" icon-right="close" no-caps class="br-lg q-px-lg" v-close-popup />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ServiciosDisponibles',

  props: {
    serviciosAplicados: { type: Array, default: () => [] },
    serviciosCustom: { type: Array, default: null },
    serviciosDinamicos: { type: Array, default: () => [] },
    serviciosCatalogo: { type: Array, default: null },
    atencionFinalizada: { type: Boolean, default: false }
  },

  emits: ['agregar-servicio', 'close'],

  setup(props, { emit }) {
    const $q = useQuasar()

    const filtroTexto = ref('')
    const categoriaSeleccionada = ref('todas')
    const viewMode = ref('grid')

    const categorias = [
      { key: 'todas',         label: 'Todas' },
      { key: 'consultas',     label: 'Consultas' },
      { key: 'procedimientos',label: 'Procedimientos' },
      { key: 'diagnostico',   label: 'Diagnóstico' }
    ]

    const categoriasMap = {
      vacunacion: 'consultas', desparasitacion: 'consultas', desparacitacion: 'consultas',
      exploracion: 'consultas', certificado: 'consultas', receta: 'consultas', medicamentos: 'consultas',
      cirugia: 'procedimientos', hospitalizacion: 'procedimientos', estetica: 'procedimientos',
      rehabilitacion: 'procedimientos', emergencia: 'procedimientos',
      laboratorio: 'diagnostico', rayosx: 'diagnostico', ultrasonido: 'diagnostico', archivos: 'diagnostico'
    }

    // Mapa de colores hex por servicio
    const colorHexMap = {
      vacunacion: '#16a34a', desparasitacion: '#ea580c', exploracion: '#2563eb',
      certificado: '#7c3aed', receta: '#9333ea', medicamentos: '#0891b2',
      cirugia: '#dc2626', laboratorio: '#0d9488', rayosx: '#4f46e5',
      hospitalizacion: '#db2777', estetica: '#06b6d4', ultrasonido: '#65a30d',
      emergencia: '#ea580c', rehabilitacion: '#92400e', archivos: '#475569',
      consulta: '#1d4ed8'
    }

    const serviciosDisponiblesPredeterminados = [
      { id: 'vacunacion',     nombre: 'Vacunación',        descripcion: 'Aplicación de vacunas preventivas',        icono: 'vaccines',           color: 'green',       tipo: 'vacunacion',     tipo_renderizado: 'especializado', componente_clave: 'vacunacion',     esFijo: true },
      { id: 'desparasitacion',nombre: 'Desparasitación',   descripcion: 'Tratamiento antiparasitario',              icono: 'medication',         color: 'orange',      tipo: 'desparasitacion',tipo_renderizado: 'especializado', componente_clave: 'desparasitacion',esFijo: true },
      { id: 'exploracion',    nombre: 'Exploración Física',descripcion: 'Examen clínico general',                   icono: 'health_and_safety',  color: 'blue',        tipo: 'exploracion',    tipo_renderizado: 'especializado', componente_clave: 'exploracion',    esFijo: true },
      { id: 'certificado',    nombre: 'Certificado Médico',descripcion: 'Constancias médicas oficiales',            icono: 'description',        color: 'purple',      tipo: 'certificado',    tipo_renderizado: 'especializado', componente_clave: 'certificado',    esFijo: true },
      { id: 'receta',         nombre: 'Receta Médica',     descripcion: 'Prescripción de medicamentos',             icono: 'receipt_long',       color: 'purple',      tipo: 'receta',         tipo_renderizado: 'especializado', componente_clave: 'receta',         esFijo: true },
      { id: 'medicamentos',   nombre: 'Medicamentos',      descripcion: 'Gestión de prescripciones',                icono: 'medication_liquid',  color: 'blue',        tipo: 'medicamentos',   tipo_renderizado: 'especializado', componente_clave: 'medicamentos',   esFijo: true },
      { id: 'cirugia',        nombre: 'Cirugía',           descripcion: 'Procedimientos quirúrgicos',               icono: 'local_hospital',     color: 'red',         tipo: 'cirugia',        tipo_renderizado: 'especializado', componente_clave: 'cirugia',        esFijo: true },
      { id: 'laboratorio',    nombre: 'Laboratorio',       descripcion: 'Análisis y pruebas clínicas',              icono: 'biotech',            color: 'teal',        tipo: 'laboratorio',    tipo_renderizado: 'especializado', componente_clave: 'laboratorio',    esFijo: true },
      { id: 'rayosx',         nombre: 'Rayos X',           descripcion: 'Estudios por imagen',                      icono: 'medical_information',color: 'indigo',      tipo: 'rayosx',         tipo_renderizado: 'especializado', componente_clave: 'rayosx',         esFijo: true },
      { id: 'hospitalizacion',nombre: 'Hospitalización',   descripcion: 'Cuidados intensivos',                      icono: 'local_hotel',        color: 'pink',        tipo: 'hospitalizacion',tipo_renderizado: 'especializado', componente_clave: 'hospitalizacion',esFijo: true },
      { id: 'estetica',       nombre: 'Estética',          descripcion: 'Corte y baño',                             icono: 'content_cut',        color: 'cyan',        tipo: 'estetica',       tipo_renderizado: 'especializado', componente_clave: 'estetica',       esFijo: true },
      { id: 'ultrasonido',    nombre: 'Ultrasonido',       descripcion: 'Diagnóstico por ultrasonido',              icono: 'monitor_heart',      color: 'lime',        tipo: 'ultrasonido',    tipo_renderizado: 'especializado', componente_clave: 'ultrasonido',    esFijo: true },
      { id: 'emergencia',     nombre: 'Emergencia',        descripcion: 'Atención urgente 24/7',                    icono: 'emergency',          color: 'deep-orange', tipo: 'emergencia',     tipo_renderizado: 'especializado', componente_clave: 'emergencia',     premium: true, esFijo: true },
      { id: 'rehabilitacion', nombre: 'Rehabilitación',    descripcion: 'Fisioterapia y recuperación',              icono: 'accessibility_new',  color: 'brown',       tipo: 'rehabilitacion', tipo_renderizado: 'especializado', componente_clave: 'rehabilitacion', esFijo: true },
      { id: 'archivos',       nombre: 'Archivos Adjuntos', descripcion: 'Subir imágenes, PDFs y documentos',        icono: 'folder_open',        color: 'blue-grey',   tipo: 'archivos',       tipo_renderizado: 'especializado', componente_clave: 'archivos',       esFijo: true }
    ]

    const serviciosDinamicosMapeados = computed(() =>
      props.serviciosDinamicos.map(s => ({
        id: `dinamico_${s.id}`, nombre: s.nombre, descripcion: s.descripcion || 'Servicio configurable',
        icono: s.icono || 'auto_awesome', color: 'primary', tipo: s.identificador, esDinamico: true
      }))
    )

    const serviciosDisponibles = computed(() => {
      if (props.serviciosCustom) return props.serviciosCustom

      if (props.serviciosCatalogo && props.serviciosCatalogo.length > 0) {
        return props.serviciosCatalogo.map(s => {
          const tipo = s.componente_clave || s.identificador || String(s.id)
          let pred = serviciosDisponiblesPredeterminados.find(p =>
            p.tipo === tipo || (typeof tipo === 'string' && p.tipo.toLowerCase() === tipo.toLowerCase())
          )
          if (!pred && s.nombre) {
            const norm = s.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            pred = serviciosDisponiblesPredeterminados.find(p =>
              p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === norm || p.tipo === norm
            )
          }
          return {
            id: s.id, id_servicio: s.id,
            nombre: (s.nombre && !s.nombre.toUpperCase().startsWith('SERVICIO ')) ? s.nombre : (pred?.nombre || s.nombre),
            descripcion: s.descripcion || pred?.descripcion || '',
            icono: s.icono || pred?.icono || 'medical_services',
            color: s.color || pred?.color || 'primary',
            categoria: s.categoria || (pred ? categoriasMap[pred.tipo] : 'consultas'),
            tipo_renderizado: s.tipo_renderizado || 'dinamico',
            componente_clave: s.componente_clave || null,
            tipo: String(tipo).toLowerCase(),
            esDinamico: s.tipo_renderizado !== 'especializado'
          }
        })
      }

      return [...serviciosDisponiblesPredeterminados, ...serviciosDinamicosMapeados.value]
    })

    const serviciosFiltrados = computed(() => {
      let lista = serviciosDisponibles.value
      if (filtroTexto.value) {
        const txt = filtroTexto.value.toLowerCase()
        lista = lista.filter(s => s.nombre.toLowerCase().includes(txt) || s.descripcion.toLowerCase().includes(txt))
      }
      if (categoriaSeleccionada.value !== 'todas') {
        lista = lista.filter(s => {
          const cat = s.categoria || categoriasMap[s.tipo] || 'consultas'
          return cat === categoriaSeleccionada.value
        })
      }
      return lista
    })

    const totalAgregados = computed(() =>
      serviciosDisponibles.value.filter(s => isServicioYaAgregado(s.tipo, s.id)).length
    )

    const isServicioYaAgregado = (tipoServicio, idCatalog = null) => {
      if (!tipoServicio && !idCatalog) return false
      const tipoLower = tipoServicio ? String(tipoServicio).toLowerCase() : null
      return props.serviciosAplicados.some(s => {
        if (idCatalog && s.id_servicio_def && Number(s.id_servicio_def) === Number(idCatalog)) return true
        if (tipoLower && s.tipo && String(s.tipo).toLowerCase() === tipoLower) return true
        return false
      })
    }

    const getServiceHex = (servicio) => {
      const tipo = servicio.tipo || ''
      return colorHexMap[tipo] || '#1d4ed8'
    }

    const getCategoriaLabel = (servicio) => {
      const cat = servicio.categoria || categoriasMap[servicio.tipo] || 'consultas'
      return categorias.find(c => c.key === cat)?.label || cat
    }

    const seleccionarServicio = (servicio) => {
      if (props.atencionFinalizada) {
        $q.notify({ type: 'warning', message: 'Atención finalizada', position: 'top' })
        return
      }
      if (isServicioYaAgregado(servicio.tipo, servicio.id)) {
        $q.notify({ type: 'warning', message: `${servicio.nombre} ya está en esta atención`, position: 'top' })
        return
      }
      emit('agregar-servicio', { ...servicio, timestamp: new Date().toLocaleString() })
    }

    return {
      filtroTexto, categoriaSeleccionada, viewMode, categorias,
      serviciosFiltrados, totalAgregados,
      isServicioYaAgregado, seleccionarServicio,
      getServiceHex, getCategoriaLabel
    }
  }
})
</script>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────────── */
.servicios-selector-premium {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── Header ────────────────────────────────────────────────────── */
.selector-header {
  border-bottom: 1px solid #e9eef5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.search-field :deep(.q-field__control) {
  border-radius: 10px !important;
}

.cat-pill {
  border-radius: 20px !important;
  font-size: 11px !important;
  letter-spacing: 0.3px;
}

/* ─── GRID ──────────────────────────────────────────────────────── */
.cards-grid {
  min-height: 200px;
}

.cards-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 10px;
}

/* ─── SERVICE CARD ──────────────────────────────────────────────── */
.service-card {
  position: relative;
  border-radius: 18px;
  padding: 13px 12px 11px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.25s ease;
  animation: cardAppear 0.4s ease both;
  animation-delay: var(--delay, 0s);
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 148px;
  border: 1.5px solid transparent;
}

@keyframes cardAppear {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* Available state */
.service-card--available {
  background: white;
  border-color: #e8edf5;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.service-card--available:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 16px 30px rgba(0,0,0,0.12);
  border-color: var(--card-color, #1d4ed8);
}

/* Added / disabled state */
.service-card--added {
  background: #fff5f5;
  border-color: #fca5a5;
  cursor: not-allowed;
  box-shadow: 0 2px 6px rgba(220,38,38,0.08);
}

.service-card--added .card-icon-inner {
  filter: grayscale(0.3);
}

/* Background shape decoration */
.card-bg-shape {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--card-color, #1d4ed8);
  opacity: 0.05;
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: none;
}

.service-card--available:hover .card-bg-shape {
  transform: scale(1.5);
  opacity: 0.08;
}

.service-card--added .card-bg-shape {
  background: #ef4444;
  opacity: 0.06;
}

/* Status badge */
.card-status-badge {
  position: absolute;
  top: 11px;
  right: 11px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  border-radius: 20px;
  padding: 3px 8px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.badge-available {
  background: rgba(var(--card-color, #1d4ed8), 0.1);
  color: var(--card-color, #1d4ed8);
  background: color-mix(in srgb, var(--card-color) 12%, transparent);
  color: var(--card-color);
}

.badge-added {
  background: #fee2e2;
  color: #dc2626;
}

/* Icon */
.card-icon-wrap {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.card-icon-ring {
  position: absolute;
  inset: 0;
  border-radius: 11px;
  background: color-mix(in srgb, var(--card-color) 12%, white);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.service-card--available:hover .card-icon-ring {
  transform: scale(1.12) rotate(-6deg);
  background: color-mix(in srgb, var(--card-color) 18%, white);
}

.service-card--added .card-icon-ring {
  background: #fee2e2;
}

.card-icon-inner {
  position: absolute;
  inset: 0;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-color, #1d4ed8);
  transition: color 0.2s;
}

.service-card--added .card-icon-inner {
  color: #dc2626;
}

/* Content */
.card-content {
  flex: 1;
}

.card-name {
  font-size: 11.5px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  letter-spacing: 0.2px;
  margin-bottom: 3px;
}

.service-card--added .card-name {
  color: #dc2626;
}

.card-desc {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.4;
  font-weight: 400;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.service-card--added .card-footer {
  border-top-color: #fee2e2;
}

.card-categoria-label {
  font-size: 10px;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-arrow {
  color: #cbd5e1;
  transition: transform 0.2s ease, color 0.2s;
}

.service-card--available:hover .card-arrow {
  transform: translateX(3px);
  color: var(--card-color, #1d4ed8);
}

.service-card--added .card-arrow {
  color: #fca5a5;
}

/* Hover overlay */
.card-hover-overlay {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  pointer-events: none;
}

.service-card--available .card-hover-overlay {
  background: color-mix(in srgb, var(--card-color) 92%, white);
  color: white;
}

.service-card--added .card-hover-overlay {
  background: rgba(220,38,38, 0.88);
  color: white;
}

.service-card--available:hover .card-hover-overlay,
.service-card--added:hover .card-hover-overlay {
  opacity: 0.92;
}

/* ─── LIST VIEW ─────────────────────────────────────────────────── */
.list-item {
  background: white;
  border-radius: 12px;
  border: 1.5px solid #e8edf5;
  margin-bottom: 6px;
  transition: all 0.2s ease;
  animation: cardAppear 0.3s ease both;
}

.list-item--available:hover {
  border-color: var(--card-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.07);
  transform: translateX(3px);
}

.list-item--added {
  background: #fff5f5;
  border-color: #fca5a5;
  cursor: not-allowed !important;
}

.list-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-badge-added {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #dc2626;
  background: #fee2e2;
  padding: 4px 10px;
  border-radius: 20px;
}

.list-badge-add {
  color: #94a3b8;
  transition: color 0.2s;
}

.list-item--available:hover .list-badge-add {
  color: var(--card-color);
}

/* ─── Empty state ───────────────────────────────────────────────── */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 90px;
  height: 90px;
  border-radius: 24px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #cbd5e1;
}

.empty-title {
  font-size: 17px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}

.empty-subtitle {
  font-size: 13px;
  color: #94a3b8;
}

/* ─── Footer ────────────────────────────────────────────────────── */
.selector-footer {
  border-top: 1px solid #e9eef5;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
}

/* ─── Transitions ───────────────────────────────────────────────── */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.3s ease;
}
.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ─── Scrollbar ─────────────────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #dde3ec; border-radius: 10px; }
.hide-scrollbar::-webkit-scrollbar { display: none; }

.br-lg { border-radius: 14px; }
</style>

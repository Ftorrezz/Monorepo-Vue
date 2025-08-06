<template>
  <q-dialog 
    ref="dialogRef" 
    @hide="onDialogHide"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="modern-selector">
      <!-- Header con gradiente -->
      <q-card-section class="header-section">
        <div class="header-content">
          <div class="header-title">
            <q-icon name="science" size="32px" class="header-icon" />
            <div>
              <div class="text-h5 text-white">Catálogo de Estudios</div>
              <div class="text-subtitle2 text-blue-2">Selecciona los estudios necesarios</div>
            </div>
          </div>
          <q-btn 
            icon="close" 
            flat 
            round 
            color="white" 
            @click="onDialogCancel"
            size="md"
          />
        </div>
      </q-card-section>

      <!-- Barra de búsqueda y filtros mejorada -->
      <q-card-section class="search-section">
        <div class="search-container">
          <!-- Búsqueda principal -->
          <div class="search-input-wrapper">
            <q-input
              v-model="busqueda"
              outlined
              placeholder="Buscar estudios por nombre, código o descripción..."
              class="search-input"
              @input="filtrarEstudios"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>
          </div>

          <!-- Filtros avanzados -->
          <div class="filters-row">
            <!-- Selector de categoría -->
            <q-select
              v-model="categoriaSeleccionada"
              :options="categorias"
              option-value="valor"
              option-label="label"
              placeholder="Categoría"
              outlined
              dense
              clearable
              class="filter-select"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>
            </q-select>

            <!-- Selector de especie -->
            <q-select
              v-model="especieSeleccionada"
              :options="especies"
              option-value="valor"
              option-label="label"
              placeholder="Especie"
              outlined
              dense
              clearable
              class="filter-select"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="pets" />
              </template>
            </q-select>

            <!-- Filtro por precio -->
            <q-select
              v-model="rangoPrecios"
              :options="rangosPrecios"
              option-value="valor"
              option-label="label"
              placeholder="Rango de precio"
              outlined
              dense
              clearable
              class="filter-select"
              emit-value
              map-options
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
            </q-select>

            <!-- Toggle para vista -->
            <q-btn-toggle
              v-model="vistaActual"
              :options="[
                { label: 'Tarjetas', value: 'cards', icon: 'view_module' },
                { label: 'Lista', value: 'list', icon: 'view_list' }
              ]"
              color="primary"
              toggle-color="primary"
              outline
              dense
            />
          </div>

          <!-- Chips de filtros activos -->
          <div class="active-filters" v-if="tienesFiltrosActivos">
            <div class="filters-label">Filtros activos:</div>
            <q-chip
              v-if="categoriaSeleccionada"
              :label="getCategoriaLabel(categoriaSeleccionada)"
              removable
              @remove="categoriaSeleccionada = null"
              color="primary"
              text-color="white"
              icon="category"
            />
            <q-chip
              v-if="especieSeleccionada"
              :label="getEspecieLabel(especieSeleccionada)"
              removable
              @remove="especieSeleccionada = null"
              color="green"
              text-color="white"
              icon="pets"
            />
            <q-chip
              v-if="rangoPrecios"
              :label="getRangoPrecioLabel(rangoPrecios)"
              removable
              @remove="rangoPrecios = null"
              color="orange"
              text-color="white"
              icon="attach_money"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Stats rápidas -->
      <q-card-section class="stats-section">
        <div class="stats-container">
          <div class="stat-item">
            <q-icon name="science" color="blue" size="20px" />
            <span>{{ estudiosFiltrados.length }} estudios disponibles</span>
          </div>
          <div class="stat-item">
            <q-icon name="check_circle" color="green" size="20px" />
            <span>{{ seleccionados.length }} seleccionados</span>
          </div>
          <div class="stat-item">
            <q-icon name="attach_money" color="orange" size="20px" />
            <span>${{ costoTotalSeleccionados }} total estimado</span>
          </div>
        </div>
      </q-card-section>

      <!-- Contenido principal - Lista de estudios -->
      <q-card-section class="content-section">
        <!-- Vista de tarjetas -->
        <div v-if="vistaActual === 'cards'" class="cards-grid">
          <q-card
            v-for="estudio in estudiosFiltrados"
            :key="estudio.codigo"
            class="estudio-card"
            :class="{
              'selected': seleccionados.includes(estudio.codigo),
              'premium': estudio.costoEstimado > 300
            }"
            @click="toggleSeleccion(estudio)"
          >
            <q-card-section class="card-header">
              <div class="card-title-section">
                <q-checkbox
                  :model-value="seleccionados.includes(estudio.codigo)"
                  @update:model-value="toggleSeleccion(estudio)"
                  color="primary"
                  @click.stop
                />
                <div class="card-title">
                  <div class="estudio-nombre">{{ estudio.nombre }}</div>
                  <q-chip
                    :label="estudio.codigo"
                    dense
                    color="grey-3"
                    text-color="grey-8"
                    size="sm"
                  />
                </div>
              </div>
              <q-chip
                :label="estudio.categoria"
                :color="getCategoriaColor(estudio.categoria)"
                text-color="white"
                size="sm"
                dense
              />
            </q-card-section>

            <q-card-section class="card-content">
              <div class="estudio-descripcion">{{ estudio.descripcion }}</div>
              
              <div class="estudio-info">
                <div class="info-item">
                  <q-icon name="schedule" color="blue" />
                  <span>{{ estudio.tiempoResultado }}</span>
                </div>
                <div class="info-item">
                  <q-icon name="attach_money" color="green" />
                  <span>${{ estudio.costoEstimado }}</span>
                </div>
                <div class="info-item" v-if="estudio.requisitos?.length">
                  <q-icon name="warning" color="orange" />
                  <span>{{ estudio.requisitos[0] }}</span>
                </div>
              </div>

              <!-- Pruebas incluidas -->
              <div class="pruebas-preview" v-if="estudio.pruebasDisponibles?.length > 0">
                <div class="pruebas-label">Incluye:</div>
                <div class="pruebas-chips">
                  <q-chip
                    v-for="(prueba, index) in estudio.pruebasDisponibles.slice(0, 3)"
                    :key="prueba.id"
                    :label="prueba.nombre"
                    size="sm"
                    color="blue-1"
                    text-color="blue-8"
                    dense
                  />
                  <q-chip
                    v-if="estudio.pruebasDisponibles.length > 3"
                    :label="`+${estudio.pruebasDisponibles.length - 3} más`"
                    size="sm"
                    color="grey-3"
                    text-color="grey-7"
                    dense
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="card-actions">
              <q-btn
                flat
                dense
                icon="info"
                label="Detalles"
                color="primary"
                @click.stop="mostrarDetalles(estudio)"
              />
              <q-space />
              <q-icon
                v-if="estudio.costoEstimado > 300"
                name="star"
                color="orange"
                size="16px"
              />
            </q-card-actions>
          </q-card>
        </div>

        <!-- Vista de lista -->
        <q-list v-else separator class="estudios-list">
          <q-item
            v-for="estudio in estudiosFiltrados"
            :key="estudio.codigo"
            clickable
            v-ripple
            class="estudio-list-item"
            :class="{
              'bg-blue-1': seleccionados.includes(estudio.codigo)
            }"
            @click="toggleSeleccion(estudio)"
          >
            <q-item-section avatar>
              <q-checkbox
                :model-value="seleccionados.includes(estudio.codigo)"
                @update:model-value="toggleSeleccion(estudio)"
                color="primary"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="estudio-header">
                <span class="text-weight-medium">{{ estudio.nombre }}</span>
                <div class="header-chips">
                  <q-chip
                    :label="estudio.codigo"
                    dense
                    size="sm"
                    color="grey-3"
                    text-color="grey-8"
                  />
                  <q-chip
                    :label="estudio.categoria"
                    :color="getCategoriaColor(estudio.categoria)"
                    text-color="white"
                    size="sm"
                    dense
                  />
                </div>
              </q-item-label>
              <q-item-label caption class="estudio-meta">
                <div class="meta-row">
                  <div class="meta-item">
                    <q-icon name="schedule" size="16px" />
                    <span>{{ estudio.tiempoResultado }}</span>
                  </div>
                  <div class="meta-item">
                    <q-icon name="attach_money" size="16px" />
                    <span>${{ estudio.costoEstimado }}</span>
                  </div>
                  <div class="meta-item" v-if="estudio.requisitos?.length">
                    <q-icon name="warning" size="16px" color="orange" />
                    <span>{{ estudio.requisitos.join(', ') }}</span>
                  </div>
                </div>
                <div class="descripcion-text">{{ estudio.descripcion }}</div>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="item-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="info"
                  color="primary"
                  @click.stop="mostrarDetalles(estudio)"
                >
                  <q-tooltip>Ver detalles</q-tooltip>
                </q-btn>
                <q-icon
                  v-if="estudio.costoEstimado > 300"
                  name="star"
                  color="orange"
                  size="20px"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="estudiosFiltrados.length === 0" class="no-results">
          <q-icon name="search_off" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">No se encontraron estudios</div>
          <div class="text-subtitle1 text-grey-5">
            Intenta ajustar tus filtros de búsqueda
          </div>
          <q-btn
            flat
            color="primary"
            label="Limpiar filtros"
            @click="limpiarFiltros"
            class="q-mt-md"
          />
        </div>
      </q-card-section>

      <!-- Footer con acciones -->
      <q-card-section class="footer-section">
        <div class="footer-content">
          <div class="selection-summary">
            <div class="summary-text">
              <strong>{{ seleccionados.length }}</strong> estudio(s) seleccionado(s)
              <span v-if="seleccionados.length > 0" class="text-grey-6">
                • Total estimado: <strong>${{ costoTotalSeleccionados }}</strong>
              </span>
            </div>
          </div>
          
          <div class="footer-actions">
            <q-btn
              flat
              label="Limpiar selección"
              color="grey-7"
              @click="limpiarSeleccion"
              :disable="seleccionados.length === 0"
            />
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              @click="onDialogCancel"
            />
            <q-btn
              unelevated
              label="Agregar Seleccionados"
              color="primary"
              icon="add"
              :disable="seleccionados.length === 0"
              @click="confirmarSeleccion"
              class="primary-action"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDialogPluginComponent } from 'quasar'

// Dialog setup
defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

// Estados del componente
const busqueda = ref('')
const categoriaSeleccionada = ref(null)
const especieSeleccionada = ref(null)
const rangoPrecios = ref(null)
const vistaActual = ref('cards')
const seleccionados = ref([])

// Catálogo de estudios (expandido con más ejemplos)
const estudiosDisponibles = ref([
  {
    id: 'hem_completa',
    codigo: 'HEM001',
    nombre: 'Hematología Completa',
    categoria: 'Hematología',
    descripcion: 'Conteo completo de células sanguíneas incluyendo fórmula leucocitaria',
    tiempoResultado: '2-4 horas',
    costoEstimado: 250.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 8h'],
    pruebasDisponibles: [
      { id: 'globulos_rojos', nombre: 'Glóbulos Rojos', codigo: 'GR', unidadMedida: 'x10⁶/µL' },
      { id: 'globulos_blancos', nombre: 'Glóbulos Blancos', codigo: 'GB', unidadMedida: 'x10³/µL' },
      { id: 'hemoglobina', nombre: 'Hemoglobina', codigo: 'HGB', unidadMedida: 'g/dL' },
      { id: 'hematocrito', nombre: 'Hematocrito', codigo: 'HCT', unidadMedida: '%' },
      { id: 'plaquetas', nombre: 'Plaquetas', codigo: 'PLT', unidadMedida: 'x10³/µL' }
    ]
  },
  {
    id: 'quimica_basica',
    codigo: 'QUI001',
    nombre: 'Química Sanguínea Básica',
    categoria: 'Química Clínica',
    descripcion: 'Panel básico de química sanguínea para evaluación metabólica general',
    tiempoResultado: '1-2 horas',
    costoEstimado: 180.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 12h'],
    pruebasDisponibles: [
      { id: 'glucosa', nombre: 'Glucosa', codigo: 'GLU', unidadMedida: 'mg/dL' },
      { id: 'urea', nombre: 'Urea', codigo: 'BUN', unidadMedida: 'mg/dL' },
      { id: 'creatinina', nombre: 'Creatinina', codigo: 'CREA', unidadMedida: 'mg/dL' },
      { id: 'alt', nombre: 'ALT (TGP)', codigo: 'ALT', unidadMedida: 'U/L' },
      { id: 'ast', nombre: 'AST (TGO)', codigo: 'AST', unidadMedida: 'U/L' }
    ]
  },
  {
    id: 'perfil_hepatico',
    codigo: 'HEP001',
    nombre: 'Perfil Hepático Completo',
    categoria: 'Química Clínica',
    descripcion: 'Evaluación exhaustiva de la función hepática y metabolismo proteico',
    tiempoResultado: '2-4 horas',
    costoEstimado: 420.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 12h'],
    pruebasDisponibles: [
      { id: 'alt_h', nombre: 'ALT', codigo: 'ALT', unidadMedida: 'U/L' },
      { id: 'ast_h', nombre: 'AST', codigo: 'AST', unidadMedida: 'U/L' },
      { id: 'ggt', nombre: 'GGT', codigo: 'GGT', unidadMedida: 'U/L' },
      { id: 'bilirrubina_total', nombre: 'Bilirrubina Total', codigo: 'TBIL', unidadMedida: 'mg/dL' },
      { id: 'bilirrubina_directa', nombre: 'Bilirrubina Directa', codigo: 'DBIL', unidadMedida: 'mg/dL' },
      { id: 'albumina', nombre: 'Albúmina', codigo: 'ALB', unidadMedida: 'g/dL' },
      { id: 'proteinas_totales', nombre: 'Proteínas Totales', codigo: 'TP', unidadMedida: 'g/dL' }
    ]
  },
  {
    id: 'perfil_tiroideo',
    codigo: 'END001',
    nombre: 'Perfil Tiroideo Completo',
    categoria: 'Endocrinología',
    descripcion: 'Evaluación completa de la función tiroidea',
    tiempoResultado: '24-48 horas',
    costoEstimado: 380.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 8h', 'Suspender medicamentos tiroideos 4-6 semanas'],
    pruebasDisponibles: [
      { id: 't4_total', nombre: 'T4 Total', codigo: 'T4T', unidadMedida: 'µg/dL' },
      { id: 't4_libre', nombre: 'T4 Libre', codigo: 'T4L', unidadMedida: 'ng/dL' },
      { id: 'tsh', nombre: 'TSH', codigo: 'TSH', unidadMedida: 'ng/mL' },
      { id: 't3', nombre: 'T3 Total', codigo: 'T3', unidadMedida: 'ng/dL' }
    ]
  },
  {
    id: 'cultivo_bacteriano',
    codigo: 'MIC001',
    nombre: 'Cultivo Bacteriano + Antibiograma',
    categoria: 'Microbiología',
    descripción: 'Identificación de microorganismos y prueba de sensibilidad antimicrobiana',
    tiempoResultado: '48-72 horas',
    costoEstimado: 320.00,
    especies: ['canino', 'felino'],
    requisitos: ['Muestra estéril', 'Sin antibióticos previos 48h'],
    pruebasDisponibles: [
      { id: 'identificacion', nombre: 'Identificación bacteriana', codigo: 'ID', unidadMedida: '' },
      { id: 'antibiograma', nombre: 'Antibiograma', codigo: 'ATB', unidadMedida: '' },
      { id: 'recuento', nombre: 'Recuento bacteriano', codigo: 'UFC', unidadMedida: 'UFC/mL' }
    ]
  }
])

// Opciones para filtros
const categorias = [
  { label: 'Todas las categorías', valor: null },
  { label: 'Hematología', valor: 'Hematología' },
  { label: 'Química Clínica', valor: 'Química Clínica' },
  { label: 'Endocrinología', valor: 'Endocrinología' },
  { label: 'Microbiología', valor: 'Microbiología' },
  { label: 'Urianálisis', valor: 'Urianálisis' },
  { label: 'Parasitología', valor: 'Parasitología' }
]

const especies = [
  { label: 'Todas las especies', valor: null },
  { label: 'Canino', valor: 'canino' },
  { label: 'Felino', valor: 'felino' }
]

const rangosPrecios = [
  { label: 'Todos los precios', valor: null },
  { label: 'Hasta $150', valor: 'bajo' },
  { label: '$151 - $300', valor: 'medio' },
  { label: 'Más de $300', valor: 'alto' }
]

// Computed properties
const estudiosFiltrados = computed(() => {
  let estudios = estudiosDisponibles.value

  // Filtro por texto
  if (busqueda.value) {
    const texto = busqueda.value.toLowerCase()
    estudios = estudios.filter(estudio => 
      estudio.nombre.toLowerCase().includes(texto) ||
      estudio.codigo.toLowerCase().includes(texto) ||
      estudio.categoria.toLowerCase().includes(texto) ||
      estudio.descripcion?.toLowerCase().includes(texto)
    )
  }

  // Filtro por categoría
  if (categoriaSeleccionada.value) {
    estudios = estudios.filter(estudio => 
      estudio.categoria === categoriaSeleccionada.value
    )
  }

  // Filtro por especie
  if (especieSeleccionada.value) {
    estudios = estudios.filter(estudio => 
      estudio.especies.includes(especieSeleccionada.value)
    )
  }

  // Filtro por rango de precios
  if (rangoPrecios.value) {
    estudios = estudios.filter(estudio => {
      const precio = estudio.costoEstimado
      switch (rangoPrecios.value) {
        case 'bajo': return precio <= 150
        case 'medio': return precio > 150 && precio <= 300
        case 'alto': return precio > 300
        default: return true
      }
    })
  }

  return estudios
})

const costoTotalSeleccionados = computed(() => {
  const estudiosSeleccionadosObj = estudiosDisponibles.value.filter(
    estudio => seleccionados.value.includes(estudio.codigo)
  )
  return estudiosSeleccionadosObj
    .reduce((total, estudio) => total + (estudio.costoEstimado || 0), 0)
    .toFixed(2)
})

const tienesFiltrosActivos = computed(() => {
  return categoriaSeleccionada.value || especieSeleccionada.value || rangoPrecios.value
})

// Métodos
const getCategoriaColor = (categoria) => {
  const colores = {
    'Hematología': 'red-6',
    'Química Clínica': 'blue-6',
    'Endocrinología': 'purple-6',
    'Microbiología': 'green-6',
    'Urianálisis': 'yellow-7',
    'Parasitología': 'teal-6'
  }
  return colores[categoria] || 'grey-6'
}

const toggleSeleccion = (estudio) => {
  const index = seleccionados.value.indexOf(estudio.codigo)
  if (index === -1) {
    seleccionados.value.push(estudio.codigo)
  } else {
    seleccionados.value.splice(index, 1)
  }
}

const confirmarSeleccion = () => {
  const estudiosParaAgregar = estudiosDisponibles.value
    .filter(estudio => seleccionados.value.includes(estudio.codigo))
    .map(estudio => ({
      id: estudio.id,
      codigo: estudio.codigo,
      nombre: estudio.nombre,
      categoria: estudio.categoria,
      tiempoResultado: estudio.tiempoResultado,
      costoEstimado: estudio.costoEstimado,
      requisitos: estudio.requisitos,
      pruebasDisponibles: estudio.pruebasDisponibles
    }))
  
  onDialogOK(estudiosParaAgregar)
}

const filtrarEstudios = () => {
  // El filtrado se maneja automáticamente por el computed
}

const limpiarFiltros = () => {
  busqueda.value = ''
  categoriaSeleccionada.value = null
  especieSeleccionada.value = null
  rangoPrecios.value = null
}

const limpiarSeleccion = () => {
  seleccionados.value = []
}

const mostrarDetalles = (estudio) => {
  console.log('Mostrar detalles de:', estudio.nombre)
  // Aquí puedes implementar un diálogo de detalles
}

// Helpers para labels
const getCategoriaLabel = (valor) => {
  const categoria = categorias.find(c => c.valor === valor)
  return categoria?.label || valor
}

const getEspecieLabel = (valor) => {
  const especie = especies.find(e => e.valor === valor)
  return especie?.label || valor
}

const getRangoPrecioLabel = (valor) => {
  const rango = rangosPrecios.find(r => r.valor === valor)
  return rango?.label || valor
}
</script>

<style scoped>
.modern-selector {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  padding: 24px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  color: white;
  opacity: 0.9;
}

/* Search Section */
.search-section {
  background: #f5f5f5;
  padding: 20px 24px;
  flex-shrink: 0;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-input-wrapper {
  margin-bottom: 16px;
}

.search-input {
  max-width: 600px;
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.filter-select {
  min-width: 160px;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filters-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Stats Section */
.stats-section {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 24px;
  flex-shrink: 0;
}

.stats-container {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

/* Content Section */
.content-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.estudio-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
}

.estudio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

.estudio-card.selected {
  border-color: #1976d2;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.2);
}

.estudio-card.premium {
  position: relative;
}

.estudio-card.premium::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-top: 20px solid #ff9800;
  z-index: 1;
}

.card-header {
  padding: 16px 20px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

.card-title-section {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.card-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.estudio-nombre {
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
  line-height: 1.3;
}

.card-content {
  padding: 16px 20px;
}

.estudio-descripcion {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 16px;
}

.estudio-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.pruebas-preview {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
}

.pruebas-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.pruebas-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-actions {
  background: #fafafa;
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
}

/* List View */
.estudios-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.estudio-list-item {
  padding: 16px 20px;
  min-height: auto;
}

.estudio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.header-chips {
  display: flex;
  gap: 8px;
  align-items: center;
}

.estudio-meta {
  color: #666;
}

.meta-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.descripcion-text {
  margin-top: 4px;
  font-size: 13px;
  color: #777;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

/* Footer */
.footer-section {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 20px 24px;
  flex-shrink: 0;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.selection-summary {
  flex: 1;
}

.summary-text {
  font-size: 16px;
  color: #1a1a1a;
}

.footer-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.primary-action {
  font-weight: 600;
  padding: 8px 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .search-section {
    padding: 16px;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    min-width: unset;
    width: 100%;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stats-container {
    flex-direction: column;
    gap: 12px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .footer-actions {
    justify-content: center;
  }
  
  .content-section {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .header-title {
    gap: 12px;
  }
  
  .header-icon {
    display: none;
  }
  
  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
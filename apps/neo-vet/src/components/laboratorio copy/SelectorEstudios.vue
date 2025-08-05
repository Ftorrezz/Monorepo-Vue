<template>
  <q-card style="min-width: 700px; max-width: 900px">
    <q-card-section>
      <div class="text-h6">Seleccionar Estudios de Laboratorio</div>
      <div class="text-caption text-grey-6">
        Selecciona los estudios que deseas incluir en la orden
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <!-- Buscador y filtros -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-input
            v-model="filtroTexto"
            label="Buscar estudios"
            outlined
            dense
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroCategoria"
            :options="categorias"
            label="Categoría"
            outlined
            dense
            clearable
            option-label="label"
            option-value="value"
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroEspecie"
            :options="especies"
            label="Especie"
            outlined
            dense
            clearable
            option-label="label"
            option-value="value"
          />
        </div>
      </div>

      <!-- Lista de estudios disponibles -->
      <div class="estudios-container" style="max-height: 400px; overflow-y: auto;">
        <div class="row q-col-gutter-sm">
          <div 
            v-for="estudio in estudiosFiltrados" 
            :key="estudio.id"
            class="col-12 col-md-6"
          >
            <q-card 
              flat 
              bordered 
              class="cursor-pointer estudio-item"
              :class="{ 'selected': estudio.seleccionado }"
              @click="toggleEstudio(estudio)"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center">
                  <div class="col-auto q-mr-sm">
                    <q-checkbox
                      v-model="estudio.seleccionado"
                      @click.stop
                      color="primary"
                    />
                  </div>

                  <div class="col">
                    <div class="text-weight-medium">{{ estudio.nombre }}</div>
                    <div class="text-caption text-grey-6">
                      {{ estudio.categoria }} • {{ estudio.codigo }}
                    </div>
                    <div class="text-caption">
                      {{ estudio.pruebasDisponibles?.length || 0 }} prueba(s) disponible(s)
                    </div>
                  </div>

                  <div class="col-auto">
                    <q-chip
                      :color="getCategoriaColor(estudio.categoria)"
                      text-color="white"
                      :label="estudio.categoria"
                      dense
                      size="sm"
                    />
                  </div>
                </div>

                <!-- Información adicional expandible -->
                <q-slide-transition>
                  <div v-if="estudio.mostrarDetalles" class="q-mt-sm">
                    <q-separator class="q-mb-sm" />
                    
                    <div class="text-caption">
                      <div v-if="estudio.descripcion" class="q-mb-xs">
                        <strong>Descripción:</strong> {{ estudio.descripcion }}
                      </div>
                      
                      <div v-if="estudio.tiempoResultado" class="q-mb-xs">
                        <strong>Tiempo de resultado:</strong> {{ estudio.tiempoResultado }}
                      </div>
                      
                      <div v-if="estudio.costoEstimado" class="q-mb-xs">
                        <strong>Costo estimado:</strong> ${{ estudio.costoEstimado }}
                      </div>

                      <div v-if="estudio.requisitos && estudio.requisitos.length > 0" class="q-mb-xs">
                        <strong>Requisitos:</strong> 
                        <q-chip
                          v-for="requisito in estudio.requisitos"
                          :key="requisito"
                          :label="requisito"
                          size="sm"
                          class="q-ml-xs"
                        />
                      </div>

                      <!-- Lista de pruebas incluidas -->
                      <div v-if="estudio.pruebasDisponibles && estudio.pruebasDisponibles.length > 0">
                        <strong>Pruebas incluidas:</strong>
                        <div class="q-mt-xs">
                          <q-chip
                            v-for="prueba in estudio.pruebasDisponibles.slice(0, 5)"
                            :key="prueba.id"
                            :label="prueba.nombre"
                            size="sm"
                            color="blue-1"
                            class="q-mr-xs q-mb-xs"
                          />
                          <span v-if="estudio.pruebasDisponibles.length > 5" class="text-grey-6">
                            +{{ estudio.pruebasDisponibles.length - 5 }} más...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-slide-transition>

                <!-- Toggle para detalles -->
                <div class="row justify-center q-mt-xs">
                  <q-btn
                    flat
                    dense
                    :icon="estudio.mostrarDetalles ? 'expand_less' : 'expand_more'"
                    @click.stop="estudio.mostrarDetalles = !estudio.mostrarDetalles"
                    size="sm"
                    color="grey-6"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-if="estudiosFiltrados.length === 0" class="text-center q-pa-md text-grey-6">
          <q-icon name="search_off" size="48px" class="q-mb-sm"/>
          <div>No se encontraron estudios</div>
          <div class="text-caption">Intenta ajustar los filtros de búsqueda</div>
        </div>
      </div>

      <!-- Resumen de selección -->
      <div v-if="estudiosSeleccionados.length > 0" class="q-mt-md">
        <q-separator class="q-mb-md" />
        <div class="text-subtitle2 q-mb-sm">
          Estudios Seleccionados ({{ estudiosSeleccionados.length }})
        </div>
        
        <div class="row q-col-gutter-xs">
          <div 
            v-for="estudio in estudiosSeleccionados" 
            :key="estudio.id"
            class="col-auto"
          >
            <q-chip
              :label="estudio.nombre"
              removable
              @remove="deseleccionarEstudio(estudio)"
              color="primary"
              text-color="white"
            />
          </div>
        </div>

        <div class="text-caption text-grey-6 q-mt-sm">
          Costo total estimado: ${{ costoTotalEstimado }}
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" @click="cancelar" />
      <q-btn 
        flat 
        label="Seleccionar Todo" 
        @click="seleccionarTodos"
        v-if="estudiosFiltrados.length > 0"
      />
      <q-btn 
        flat 
        label="Limpiar Selección" 
        @click="limpiarSeleccion"
        v-if="estudiosSeleccionados.length > 0"
      />
      <q-btn 
        color="primary" 
        label="Agregar Estudios" 
        @click="confirmarSeleccion"
        :disable="estudiosSeleccionados.length === 0"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Emits
const emit = defineEmits(['estudios-seleccionados', 'cancelar'])

// Estados del componente
const filtroTexto = ref('')
const filtroCategoria = ref(null)
const filtroEspecie = ref(null)

// Catálogo de estudios disponibles
const estudiosDisponibles = ref([
  {
    id: 'hem_completa',
    codigo: 'HEM001',
    nombre: 'Hematología Completa',
    categoria: 'Hematología',
    descripcion: 'Conteo completo de células sanguíneas',
    tiempoResultado: '2-4 horas',
    costoEstimado: 250.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 8h'],
    seleccionado: false,
    mostrarDetalles: false,
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
    descripcion: 'Panel básico de química sanguínea',
    tiempoResultado: '1-2 horas',
    costoEstimado: 180.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 12h'],
    seleccionado: false,
    mostrarDetalles: false,
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
    nombre: 'Perfil Hepático',
    categoria: 'Química Clínica',
    descripcion: 'Evaluación completa de la función hepática',
    tiempoResultado: '2-4 horas',
    costoEstimado: 320.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 12h'],
    seleccionado: false,
    mostrarDetalles: false,
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
    id: 'perfil_renal',
    codigo: 'REN001',
    nombre: 'Perfil Renal',
    categoria: 'Química Clínica',
    descripcion: 'Evaluación de la función renal',
    tiempoResultado: '2-4 horas',
    costoEstimado: 280.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 8h'],
    seleccionado: false,
    mostrarDetalles: false,
    pruebasDisponibles: [
      { id: 'urea_r', nombre: 'Urea', codigo: 'BUN', unidadMedida: 'mg/dL' },
      { id: 'creatinina_r', nombre: 'Creatinina', codigo: 'CREA', unidadMedida: 'mg/dL' },
      { id: 'acido_urico', nombre: 'Ácido Úrico', codigo: 'UA', unidadMedida: 'mg/dL' },
      { id: 'fosforo', nombre: 'Fósforo', codigo: 'PHOS', unidadMedida: 'mg/dL' }
    ]
  },
  {
    id: 'general_orina',
    codigo: 'ORI001',
    nombre: 'General de Orina',
    categoria: 'Urianálisis',
    descripcion: 'Análisis completo de orina',
    tiempoResultado: '1-2 horas',
    costoEstimado: 120.00,
    especies: ['canino', 'felino'],
    requisitos: ['Muestra fresca'],
    seleccionado: false,
    mostrarDetalles: false,
    pruebasDisponibles: [
      { id: 'densidad', nombre: 'Densidad', codigo: 'SG', unidadMedida: '' },
      { id: 'ph_orina', nombre: 'pH', codigo: 'pH', unidadMedida: '' },
      { id: 'proteinas_orina', nombre: 'Proteínas', codigo: 'PRO', unidadMedida: 'mg/dL' },
      { id: 'glucosa_orina', nombre: 'Glucosa', codigo: 'GLU', unidadMedida: 'mg/dL' },
      { id: 'sangre_orina', nombre: 'Sangre', codigo: 'BLD', unidadMedida: '' }
    ]
  },
  {
    id: 'coprologico',
    codigo: 'COP001',
    nombre: 'Coproparasitoscópico',
    categoria: 'Parasitología',
    descripcion: 'Búsqueda de parásitos en heces',
    tiempoResultado: '2-4 horas',
    costoEstimado: 100.00,
    especies: ['canino', 'felino'],
    requisitos: ['Muestra fresca'],
    seleccionado: false,
    mostrarDetalles: false,
    pruebasDisponibles: [
      { id: 'parasitos_adultos', nombre: 'Parásitos Adultos', codigo: 'PA', unidadMedida: '' },
      { id: 'huevos_parasitos', nombre: 'Huevos de Parásitos', codigo: 'HP', unidadMedida: '' },
      { id: 'quistes', nombre: 'Quistes', codigo: 'QUI', unidadMedida: '' }
    ]
  }
])

// Opciones para filtros
const categorias = [
  { label: 'Hematología', value: 'Hematología' },
  { label: 'Química Clínica', value: 'Química Clínica' },
  { label: 'Urianálisis', value: 'Urianálisis' },
  { label: 'Parasitología', value: 'Parasitología' },
  { label: 'Microbiología', value: 'Microbiología' },
  { label: 'Endocrinología', value: 'Endocrinología' }
]

const especies = [
  { label: 'Canino', value: 'canino' },
  { label: 'Felino', value: 'felino' },
  { label: 'Ambas especies', value: 'ambas' }
]

// Computed
const estudiosFiltrados = computed(() => {
  let estudios = estudiosDisponibles.value

  // Filtro por texto
  if (filtroTexto.value) {
    const texto = filtroTexto.value.toLowerCase()
    estudios = estudios.filter(estudio => 
      estudio.nombre.toLowerCase().includes(texto) ||
      estudio.codigo.toLowerCase().includes(texto) ||
      estudio.categoria.toLowerCase().includes(texto) ||
      estudio.descripcion?.toLowerCase().includes(texto)
    )
  }

  // Filtro por categoría
  if (filtroCategoria.value) {
    estudios = estudios.filter(estudio => 
      estudio.categoria === filtroCategoria.value.value
    )
  }

  // Filtro por especie
  if (filtroEspecie.value) {
    estudios = estudios.filter(estudio => 
      estudio.especies.includes(filtroEspecie.value.value) ||
      filtroEspecie.value.value === 'ambas'
    )
  }

  return estudios
})

const estudiosSeleccionados = computed(() => {
  return estudiosDisponibles.value.filter(estudio => estudio.seleccionado)
})

const costoTotalEstimado = computed(() => {
  return estudiosSeleccionados.value
    .reduce((total, estudio) => total + (estudio.costoEstimado || 0), 0)
    .toFixed(2)
})

// Métodos
const getCategoriaColor = (categoria) => {
  const colores = {
    'Hematología': 'red',
    'Química Clínica': 'blue',
    'Urianálisis': 'yellow',
    'Parasitología': 'green',
    'Microbiología': 'purple',
    'Endocrinología': 'orange'
  }
  return colores[categoria] || 'grey'
}

const toggleEstudio = (estudio) => {
  estudio.seleccionado = !estudio.seleccionado
}

const deseleccionarEstudio = (estudio) => {
  estudio.seleccionado = false
}

const seleccionarTodos = () => {
  estudiosFiltrados.value.forEach(estudio => {
    estudio.seleccionado = true
  })
}

const limpiarSeleccion = () => {
  estudiosDisponibles.value.forEach(estudio => {
    estudio.seleccionado = false
  })
}

const confirmarSeleccion = () => {
  const seleccionados = estudiosSeleccionados.value.map(estudio => ({
    ...estudio,
    seleccionado: undefined,
    mostrarDetalles: undefined
  }))
  emit('estudios-seleccionados', seleccionados)
}

const cancelar = () => {
  emit('cancelar')
}
</script>

<style scoped>
.estudio-item {
  transition: all 0.3s ease;
}

.estudio-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.estudio-item.selected {
  border-color: var(--q-primary);
  background-color: rgba(25, 118, 210, 0.05);
}

.estudios-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
}
</style>
<template>
  <q-card class="selector-estudios">
    <q-card-section class="row items-center">
      <div class="text-h6">Búsqueda de Estudios</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- Búsqueda -->
        <div class="col-12">
          <q-input
            v-model="busqueda"
            outlined
            dense
            placeholder="Buscar por nombre o código"
            @input="filtrarEstudios"
            clearable
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Filtros rápidos -->
        <div class="col-12">
          <div class="row q-gutter-sm">
            <q-chip
              v-for="categoria in categorias"
              :key="categoria.valor"
              :selected="categoriaSeleccionada === categoria.valor"
              clickable
              @click="filtrarPorCategoria(categoria.valor)"
            >
              {{ categoria.label }}
            </q-chip>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="estudios-lista q-pa-none">
      <q-list separator>
        <q-item
          v-for="estudio in estudiosFiltrados"
          :key="estudio.codigo"
          clickable
          v-ripple
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
            <q-item-label>
              <span class="text-weight-medium">{{ estudio.nombre }}</span>
              <q-chip
                dense
                size="sm"
                class="q-ml-sm"
                color="grey-3"
                text-color="grey-8"
              >
                {{ estudio.codigo }}
              </q-chip>
            </q-item-label>
            <q-item-label caption>
              <div class="row items-center text-grey-8">
                <q-icon name="schedule" size="16px" />
                <span class="q-ml-xs">{{ estudio.tiempoResultado }}</span>
                <q-separator vertical inset class="q-mx-sm" />
                <q-icon name="attach_money" size="16px" />
                <span class="q-ml-xs">${{ estudio.precio }}</span>
              </div>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              round
              dense
              icon="info"
              @click.stop="mostrarDetalles(estudio)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-section class="row items-center justify-between q-pa-md">
      <div class="text-grey-8">
        {{ seleccionados.length }} estudio(s) seleccionado(s)
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          v-close-popup
        />
        <q-btn
          unelevated
          label="Agregar Seleccionados"
          color="primary"
          :disable="seleccionados.length === 0"
          @click="confirmarSeleccion"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'

// Emits
const emit = defineEmits(['estudios-seleccionados', 'cancelar'])

// Estados del componente
const busqueda = ref('')
const categoriaSeleccionada = ref(null)

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

  return estudios
})

const seleccionados = ref([]) // Mantener solo los IDs

// Método para toggle selección
const toggleSeleccion = (estudio) => {
  const index = seleccionados.value.indexOf(estudio.codigo)
  if (index === -1) {
    seleccionados.value.push(estudio.codigo)
  } else {
    seleccionados.value.splice(index, 1)
  }
}

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
  
  emit('estudios-seleccionados', estudiosParaAgregar)
}

const cancelar = () => {
  emit('cancelar')
}

const filtrarEstudios = () => {
  // Lógica de filtrado ya manejada por el computed 'estudiosFiltrados'
}

const filtrarPorCategoria = (categoria) => {
  categoriaSeleccionada.value = categoria === categoriaSeleccionada.value ? null : categoria
}
</script>

<style scoped>
.selector-estudios {
  min-width: 600px;
  max-width: 800px;
}

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
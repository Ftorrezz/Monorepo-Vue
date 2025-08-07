<template>
  <q-card class="selector-estudios-split full-width">
    <!-- Header simple y limpio -->
    <q-card-section class="bg-primary text-white q-pa-lg">
      <div class="row items-center no-wrap">
        <q-icon name="science" size="xl" class="q-mr-md"/>
        <div class="col">
          <div class="text-h5 q-mb-xs">Catálogo de Estudios</div>
          <div class="text-subtitle2 opacity-90">
            {{ estudiosFiltrados.length }} de {{ estudiosDisponibles.length }} estudios disponibles
          </div>
        </div>
        <q-btn 
          flat 
          round 
          icon="close" 
          v-close-popup 
          class="text-white"
          size="md"
        />
      </div>
    </q-card-section>

    <!-- Barra de búsqueda compacta -->
    <q-card-section class="q-pa-md bg-grey-1">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input
            v-model="busqueda"
            outlined
            dense
            placeholder="Buscar por código, nombre o descripción..."
            @input="filtrarEstudios"
            clearable
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="categoriaSeleccionada"
            :options="categoriasConConteo"
            outlined
            dense
            clearable
            placeholder="Filtrar por categoría"
            option-label="display"
            option-value="value"
          >
            <template v-slot:prepend>
              <q-icon name="category" color="primary" />
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-btn-toggle
            v-model="vistaActual"
            :options="[
              {label: 'Tarjetas', value: 'cards', icon: 'view_module'},
              {label: 'Lista', value: 'list', icon: 'view_list'}
            ]"
            outline
            color="primary"
            dense
          />
        </div>
      </div>
    </q-card-section>

    <!-- Contenido principal dividido -->
    <div class="row no-wrap" style="height: 600px;">
      
      <!-- Panel izquierdo: Selector de estudios -->
      <div class="col-8 q-pa-md">
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="list_alt" class="q-mr-sm text-primary" />
          Seleccionar Estudios
          <q-space />
          <q-chip 
            :label="`${seleccionados.length} seleccionados`" 
            color="primary" 
            text-color="white"
            v-if="seleccionados.length > 0"
          />
        </div>

        <!-- Vista de tarjetas pequeñas -->
        <div v-if="vistaActual === 'cards'" class="estudios-grid">
          <div 
            v-for="estudio in estudiosFiltradosYOrdenados" 
            :key="estudio.id"
            class="estudio-card-mini"
            :class="{ 'estudio-card-mini--selected': seleccionados.includes(estudio.codigo) }"
            @click="toggleSeleccion(estudio)"
          >
            <div class="estudio-card-mini__header">
              <div class="row items-center no-wrap">
                <q-checkbox
                  :model-value="seleccionados.includes(estudio.codigo)"
                  @update:model-value="toggleSeleccion(estudio)"
                  @click.stop
                  color="primary"
                  size="sm"
                  dense
                />
                <div class="col q-ml-sm">
                  <div class="text-weight-bold text-sm">{{ estudio.codigo }}</div>
                  <q-badge 
                    :color="getCategoriaColor(estudio.categoria)" 
                    :label="estudio.categoria"
                    dense
                    class="text-xs"
                  />
                </div>
              </div>
            </div>
            
            <div class="estudio-card-mini__content">
              <div class="text-subtitle2 text-weight-medium q-mb-xs">
                {{ estudio.nombre }}
              </div>
              <div class="text-caption text-grey-6 q-mb-sm">
                {{ estudio.pruebasDisponibles?.length || 0 }} prueba{{ (estudio.pruebasDisponibles?.length || 0) !== 1 ? 's' : '' }}
              </div>
              <div class="row items-center text-xs text-grey-7">
                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                {{ estudio.tiempoResultado }}
                <q-space />
                <span class="text-weight-bold text-primary">${{ estudio.costoEstimado || 0 }}</span>
              </div>
            </div>

            <div 
              class="estudio-card-mini__overlay"
              @click.stop="mostrarPruebas(estudio)"
            >
              <q-btn
                flat
                dense
                round
                icon="visibility"
                size="sm"
                color="white"
                class="bg-primary"
              >
                <q-tooltip>Ver pruebas incluidas</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Vista de lista compacta -->
        <div v-else class="estudios-lista" style="max-height: 500px; overflow-y: auto;">
          <q-list dense>
            <q-item
              v-for="estudio in estudiosFiltradosYOrdenados"
              :key="estudio.id"
              clickable
              v-ripple
              :active="seleccionados.includes(estudio.codigo)"
              @click="toggleSeleccion(estudio)"
              class="q-py-sm"
            >
              <q-item-section avatar>
                <q-checkbox
                  :model-value="seleccionados.includes(estudio.codigo)"
                  @update:model-value="toggleSeleccion(estudio)"
                  color="primary"
                  size="sm"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="row items-center">
                  <span class="text-weight-bold q-mr-sm">{{ estudio.codigo }}</span>
                  <q-badge 
                    :color="getCategoriaColor(estudio.categoria)" 
                    :label="estudio.categoria"
                    dense
                  />
                </q-item-label>
                <q-item-label caption class="text-body2">
                  {{ estudio.nombre }}
                </q-item-label>
                <q-item-label caption class="text-xs text-grey-6">
                  {{ estudio.pruebasDisponibles?.length || 0 }} pruebas • 
                  {{ estudio.tiempoResultado }} • 
                  ${{ estudio.costoEstimado || 0 }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  dense
                  round
                  icon="visibility"
                  size="sm"
                  @click.stop="mostrarPruebas(estudio)"
                  color="grey-6"
                >
                  <q-tooltip>Ver pruebas</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Estado vacío -->
        <div v-if="estudiosFiltrados.length === 0" class="text-center q-pa-xl">
          <q-icon name="search_off" size="48px" class="text-grey-4 q-mb-md" />
          <div class="text-h6 text-grey-6 q-mb-sm">No se encontraron estudios</div>
          <q-btn flat color="primary" label="Limpiar filtros" @click="limpiarFiltros" />
        </div>
      </div>

      <!-- Panel derecho: Detalles y pruebas -->
      <div class="col-4 bg-grey-1 q-pa-md">
        <div class="text-h6 q-mb-md flex items-center">
          <q-icon name="science" class="q-mr-sm text-primary" />
          Pruebas Incluidas
        </div>

        <!-- Cuando no hay estudio seleccionado para ver -->
        <div v-if="!estudioParaMostrar" class="text-center q-pa-lg">
          <q-icon name="touch_app" size="64px" class="text-grey-3 q-mb-md" />
          <div class="text-body1 text-grey-6">
            Haz clic en el ícono 
            <q-icon name="visibility" class="q-mx-xs" />
            para ver las pruebas de un estudio
          </div>
        </div>

        <!-- Detalles del estudio seleccionado -->
        <div v-else>
          <!-- Header del estudio -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section class="q-pa-md">
              <div class="row items-start justify-between">
                <div class="col">
                  <div class="text-weight-bold text-primary">{{ estudioParaMostrar.codigo }}</div>
                  <div class="text-subtitle2 q-mb-xs">{{ estudioParaMostrar.nombre }}</div>
                  <q-badge 
                    :color="getCategoriaColor(estudioParaMostrar.categoria)" 
                    :label="estudioParaMostrar.categoria"
                  />
                </div>
                <q-btn
                  flat
                  dense
                  round
                  icon="close"
                  size="sm"
                  @click="estudioParaMostrar = null"
                  color="grey-6"
                />
              </div>
              
              <!-- Info adicional -->
              <div class="q-mt-md">
                <div class="row q-gutter-md text-caption">
                  <div class="flex items-center">
                    <q-icon name="schedule" size="sm" class="q-mr-xs text-grey-6" />
                    {{ estudioParaMostrar.tiempoResultado }}
                  </div>
                  <div class="flex items-center">
                    <q-icon name="attach_money" size="sm" class="q-mr-xs text-grey-6" />
                    <span class="text-weight-bold">${{ estudioParaMostrar.costoEstimado || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- Requisitos si los hay -->
              <div v-if="estudioParaMostrar.requisitos?.length" class="q-mt-sm">
                <div class="text-caption text-orange-8 flex items-center">
                  <q-icon name="info" size="sm" class="q-mr-xs" />
                  {{ estudioParaMostrar.requisitos.join(', ') }}
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Lista de pruebas -->
          <div class="text-subtitle2 q-mb-sm">
            Pruebas incluidas ({{ estudioParaMostrar.pruebasDisponibles?.length || 0 }})
          </div>

          <div style="max-height: 350px; overflow-y: auto;">
            <q-list dense separator>
              <q-item
                v-for="prueba in estudioParaMostrar.pruebasDisponibles"
                :key="prueba.id"
                class="q-py-xs"
              >
                <q-item-section avatar class="min-width-none">
                  <q-avatar size="24px" color="grey-3" text-color="grey-7" font-size="10px">
                    {{ prueba.codigo.substring(0, 2) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-sm">{{ prueba.nombre }}</q-item-label>
                  <q-item-label caption class="text-xs">
                    {{ prueba.codigo }}
                    <span v-if="prueba.unidadMedida"> • {{ prueba.unidadMedida }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Botón de selección rápida -->
          <div class="q-mt-md">
            <q-btn
              :color="seleccionados.includes(estudioParaMostrar.codigo) ? 'negative' : 'primary'"
              :icon="seleccionados.includes(estudioParaMostrar.codigo) ? 'remove' : 'add'"
              :label="seleccionados.includes(estudioParaMostrar.codigo) ? 'Quitar estudio' : 'Agregar estudio'"
              @click="toggleSeleccion(estudioParaMostrar)"
              unelevated
              class="full-width"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Footer con resumen -->
    <q-card-section class="bg-grey-1 q-pa-md">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <div class="text-subtitle1">
            <q-icon name="playlist_add_check" class="q-mr-sm text-primary" />
            {{ seleccionados.length }} estudio{{ seleccionados.length !== 1 ? 's' : '' }} seleccionado{{ seleccionados.length !== 1 ? 's' : '' }}
          </div>
          <div v-if="costoTotalEstimado > 0" class="text-caption text-grey-6">
            Costo total estimado: <span class="text-weight-bold text-primary">${{ costoTotalEstimado }}</span> •
            {{ totalPruebas }} pruebas en total
          </div>
        </div>

        <div class="col-auto">
          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="grey-7"
              label="Limpiar selección"
              @click="limpiarSeleccion"
              :disable="seleccionados.length === 0"
              dense
            />
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              v-close-popup
              @click="cancelar"
            />
            <q-btn
              unelevated
              label="Agregar Estudios"
              color="primary"
              :disable="seleccionados.length === 0"
              @click="confirmarSeleccion"
              icon-right="add"
              class="text-weight-bold"
            />
          </div>
        </div>
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
const vistaActual = ref('cards')
const estudioParaMostrar = ref(null)

// Opciones para filtros
const categorias = [
  { label: 'Hematología', value: 'Hematología' },
  { label: 'Química Clínica', value: 'Química Clínica' },
  { label: 'Urianálisis', value: 'Urianálisis' },
  { label: 'Parasitología', value: 'Parasitología' },
  { label: 'Microbiología', value: 'Microbiología' },
  { label: 'Endocrinología', value: 'Endocrinología' },
  { label: 'Inmunología', value: 'Inmunología' },
  { label: 'Citología', value: 'Citología' },
  { label: 'Cardiología', value: 'Cardiología' }
]

const seleccionados = ref([])

// Catálogo de estudios expandido con más pruebas
const estudiosDisponibles = ref([
  {
    id: 'hem_completa',
    codigo: 'HEM001',
    nombre: 'Hematología Completa',
    categoria: 'Hematología',
    descripcion: 'Conteo completo de células sanguíneas con fórmula leucocitaria',
    tiempoResultado: '2-4 horas',
    costoEstimado: 250.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 8h'],
    pruebasDisponibles: [
      { id: 'globulos_rojos', nombre: 'Glóbulos Rojos', codigo: 'GR', unidadMedida: 'x10⁶/µL' },
      { id: 'globulos_blancos', nombre: 'Glóbulos Blancos', codigo: 'GB', unidadMedida: 'x10³/µL' },
      { id: 'hemoglobina', nombre: 'Hemoglobina', codigo: 'HGB', unidadMedida: 'g/dL' },
      { id: 'hematocrito', nombre: 'Hematocrito', codigo: 'HCT', unidadMedida: '%' },
      { id: 'plaquetas', nombre: 'Plaquetas', codigo: 'PLT', unidadMedida: 'x10³/µL' },
      { id: 'vcm', nombre: 'Volumen Corpuscular Medio', codigo: 'VCM', unidadMedida: 'fL' },
      { id: 'hcm', nombre: 'Hemoglobina Corpuscular Media', codigo: 'HCM', unidadMedida: 'pg' },
      { id: 'chcm', nombre: 'Concentración HCM', codigo: 'CHCM', unidadMedida: 'g/dL' },
      { id: 'rdw', nombre: 'Amplitud Distribución Eritrocitaria', codigo: 'RDW', unidadMedida: '%' },
      { id: 'neutrofilos', nombre: 'Neutrófilos', codigo: 'NEU', unidadMedida: '%' },
      { id: 'linfocitos', nombre: 'Linfocitos', codigo: 'LIN', unidadMedida: '%' },
      { id: 'monocitos', nombre: 'Monocitos', codigo: 'MON', unidadMedida: '%' },
      { id: 'eosinofilos', nombre: 'Eosinófilos', codigo: 'EOS', unidadMedida: '%' },
      { id: 'basofilos', nombre: 'Basófilos', codigo: 'BAS', unidadMedida: '%' }
    ]
  },
  {
    id: 'quimica_completa',
    codigo: 'QUI002',
    nombre: 'Química Sanguínea Completa',
    categoria: 'Química Clínica',
    descripcion: 'Panel completo de química sanguínea con electrolitos',
    tiempoResultado: '2-4 horas',
    costoEstimado: 350.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 12h'],
    pruebasDisponibles: [
      { id: 'glucosa_c', nombre: 'Glucosa', codigo: 'GLU', unidadMedida: 'mg/dL' },
      { id: 'urea_c', nombre: 'Urea', codigo: 'BUN', unidadMedida: 'mg/dL' },
      { id: 'creatinina_c', nombre: 'Creatinina', codigo: 'CREA', unidadMedida: 'mg/dL' },
      { id: 'alt_c', nombre: 'ALT (TGP)', codigo: 'ALT', unidadMedida: 'U/L' },
      { id: 'ast_c', nombre: 'AST (TGO)', codigo: 'AST', unidadMedida: 'U/L' },
      { id: 'proteinas_c', nombre: 'Proteínas Totales', codigo: 'TP', unidadMedida: 'g/dL' },
      { id: 'albumina_c', nombre: 'Albúmina', codigo: 'ALB', unidadMedida: 'g/dL' },
      { id: 'globulinas_c', nombre: 'Globulinas', codigo: 'GLOB', unidadMedida: 'g/dL' },
      { id: 'bilirrubina_total_c', nombre: 'Bilirrubina Total', codigo: 'TBIL', unidadMedida: 'mg/dL' },
      { id: 'bilirrubina_directa_c', nombre: 'Bilirrubina Directa', codigo: 'DBIL', unidadMedida: 'mg/dL' },
      { id: 'fosfatasa_alcalina_c', nombre: 'Fosfatasa Alcalina', codigo: 'ALP', unidadMedida: 'U/L' },
      { id: 'ggt_c', nombre: 'Gamma GT', codigo: 'GGT', unidadMedida: 'U/L' },
      { id: 'colesterol_c', nombre: 'Colesterol Total', codigo: 'CHOL', unidadMedida: 'mg/dL' },
      { id: 'trigliceridos_c', nombre: 'Triglicéridos', codigo: 'TRIG', unidadMedida: 'mg/dL' },
      { id: 'sodio_c', nombre: 'Sodio', codigo: 'Na', unidadMedida: 'mEq/L' },
      { id: 'potasio_c', nombre: 'Potasio', codigo: 'K', unidadMedida: 'mEq/L' },
      { id: 'cloro_c', nombre: 'Cloro', codigo: 'Cl', unidadMedida: 'mEq/L' },
      { id: 'calcio_c', nombre: 'Calcio', codigo: 'Ca', unidadMedida: 'mg/dL' },
      { id: 'fosforo_c', nombre: 'Fósforo', codigo: 'P', unidadMedida: 'mg/dL' },
      { id: 'magnesio_c', nombre: 'Magnesio', codigo: 'Mg', unidadMedida: 'mg/dL' }
    ]
  },
  {
    id: 'perfil_hepatico',
    codigo: 'HEP001',
    nombre: 'Perfil Hepático Completo',
    categoria: 'Química Clínica',
    descripcion: 'Evaluación completa de la función hepática',
    tiempoResultado: '2-4 horas',
    costoEstimado: 320.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 12h'],
    pruebasDisponibles: [
      { id: 'alt_h', nombre: 'ALT (Alanina Aminotransferasa)', codigo: 'ALT', unidadMedida: 'U/L' },
      { id: 'ast_h', nombre: 'AST (Aspartato Aminotransferasa)', codigo: 'AST', unidadMedida: 'U/L' },
      { id: 'ggt_h', nombre: 'Gamma Glutamiltransferasa', codigo: 'GGT', unidadMedida: 'U/L' },
      { id: 'alp_h', nombre: 'Fosfatasa Alcalina', codigo: 'ALP', unidadMedida: 'U/L' },
      { id: 'bilirrubina_total_h', nombre: 'Bilirrubina Total', codigo: 'TBIL', unidadMedida: 'mg/dL' },
      { id: 'bilirrubina_directa_h', nombre: 'Bilirrubina Directa', codigo: 'DBIL', unidadMedida: 'mg/dL' },
      { id: 'bilirrubina_indirecta_h', nombre: 'Bilirrubina Indirecta', codigo: 'IBIL', unidadMedida: 'mg/dL' },
      { id: 'albumina_h', nombre: 'Albúmina', codigo: 'ALB', unidadMedida: 'g/dL' },
      { id: 'proteinas_totales_h', nombre: 'Proteínas Totales', codigo: 'TP', unidadMedida: 'g/dL' },
      { id: 'globulinas_h', nombre: 'Globulinas', codigo: 'GLOB', unidadMedida: 'g/dL' },
      { id: 'ratio_alb_glob', nombre: 'Ratio Albúmina/Globulinas', codigo: 'A/G', unidadMedida: '' }
    ]
  },
  {
    id: 'perfil_tiroideo_ext',
    codigo: 'ENDO001',
    nombre: 'Perfil Tiroideo Extendido',
    categoria: 'Endocrinología',
    descripcion: 'Evaluación completa de función tiroidea con anticuerpos',
    tiempoResultado: '24-48 horas',
    costoEstimado: 450.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 8h'],
    pruebasDisponibles: [
      { id: 't4_total_e', nombre: 'T4 Total (Tiroxina)', codigo: 'T4', unidadMedida: 'µg/dL' },
      { id: 't4_libre_e', nombre: 'T4 Libre', codigo: 'fT4', unidadMedida: 'ng/dL' },
      { id: 't3_total_e', nombre: 'T3 Total (Triyodotironina)', codigo: 'T3', unidadMedida: 'ng/dL' },
      { id: 't3_libre_e', nombre: 'T3 Libre', codigo: 'fT3', unidadMedida: 'pg/mL' },
      { id: 'tsh_e', nombre: 'TSH (Hormona Estimulante del Tiroides)', codigo: 'TSH', unidadMedida: 'ng/mL' },
      { id: 'anti_tpo', nombre: 'Anticuerpos Anti-TPO', codigo: 'Anti-TPO', unidadMedida: 'IU/mL' },
      { id: 'anti_tg', nombre: 'Anticuerpos Anti-Tiroglobulina', codigo: 'Anti-TG', unidadMedida: 'IU/mL' },
      { id: 'tiroglobulina', nombre: 'Tiroglobulina', codigo: 'TG', unidadMedida: 'ng/mL' }
    ]
  },
  {
    id: 'panel_cardiaco_comp',
    codigo: 'CARDIO002',
    nombre: 'Panel Cardíaco Completo',
    categoria: 'Cardiología',
    descripcion: 'Evaluación completa de marcadores cardíacos',
    tiempoResultado: '2-4 horas',
    costoEstimado: 380.00,
    especies: ['canino', 'felino'],
    requisitos: ['Muestra fresca'],
    pruebasDisponibles: [
      { id: 'troponina_i_comp', nombre: 'Troponina I Cardíaca', codigo: 'cTnI', unidadMedida: 'ng/mL' },
      { id: 'troponina_t_comp', nombre: 'Troponina T Cardíaca', codigo: 'cTnT', unidadMedida: 'ng/mL' },
      { id: 'ck_mb', nombre: 'Creatina Kinasa MB', codigo: 'CK-MB', unidadMedida: 'U/L' },
      { id: 'ck_total', nombre: 'Creatina Kinasa Total', codigo: 'CK', unidadMedida: 'U/L' },
      { id: 'ldh', nombre: 'Lactato Deshidrogenasa', codigo: 'LDH', unidadMedida: 'U/L' },
      { id: 'mioglobina', nombre: 'Mioglobina', codigo: 'MYO', unidadMedida: 'ng/mL' },
      { id: 'bnp', nombre: 'Péptido Natriurético Tipo B', codigo: 'BNP', unidadMedida: 'pg/mL' },
      { id: 'nt_probnp', nombre: 'NT-proBNP', codigo: 'NT-proBNP', unidadMedida: 'pg/mL' }
    ]
  },
  // Agregar más estudios con diferentes cantidades de pruebas
  {
    id: 'hem_basica',
    codigo: 'HEM002',
    nombre: 'Hematología Básica',
    categoria: 'Hematología',
    descripcion: 'Conteo básico de células sanguíneas',
    tiempoResultado: '1-2 horas',
    costoEstimado: 150.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 4h'],
    pruebasDisponibles: [
      { id: 'hemoglobina_b', nombre: 'Hemoglobina', codigo: 'HGB', unidadMedida: 'g/dL' },
      { id: 'hematocrito_b', nombre: 'Hematocrito', codigo: 'HCT', unidadMedida: '%' },
      { id: 'globulos_rojos_b', nombre: 'Glóbulos Rojos', codigo: 'GR', unidadMedida: 'x10⁶/µL' }
    ]
  },
  {
    id: 'quimica_basica',
    codigo: 'QUI001',
    nombre: 'Química Sanguínea Básica',
    categoria: 'Química Clínica',
    descripcion: 'Panel básico de química sanguínea para evaluación metabólica',
    tiempoResultado: '1-2 horas',
    costoEstimado: 180.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 12h'],
    pruebasDisponibles: [
      { id: 'glucosa', nombre: 'Glucosa', codigo: 'GLU', unidadMedida: 'mg/dL' },
      { id: 'urea', nombre: 'Urea', codigo: 'BUN', unidadMedida: 'mg/dL' },
      { id: 'creatinina', nombre: 'Creatinina', codigo: 'CREA', unidadMedida: 'mg/dL' }
    ]
  },
  {
    id: 'general_orina',
    codigo: 'ORI001',
    nombre: 'Urianálisis Completo',
    categoria: 'Urianálisis',
    descripcion: 'Análisis físico, químico y microscópico de orina',
    tiempoResultado: '1-2 horas',
    costoEstimado: 120.00,
    especies: ['canino', 'felino'],
    requisitos: ['Muestra fresca'],
    pruebasDisponibles: [
      { id: 'densidad', nombre: 'Densidad Específica', codigo: 'SG', unidadMedida: '' },
      { id: 'ph_orina', nombre: 'pH', codigo: 'pH', unidadMedida: '' },
      { id: 'proteinas_orina', nombre: 'Proteínas', codigo: 'PRO', unidadMedida: 'mg/dL' },
      { id: 'glucosa_orina', nombre: 'Glucosa', codigo: 'GLU', unidadMedida: 'mg/dL' },
      { id: 'cetonas_orina', nombre: 'Cetonas', codigo: 'KET', unidadMedida: 'mg/dL' },
      { id: 'bilirrubina_orina', nombre: 'Bilirrubina', codigo: 'BIL', unidadMedida: 'mg/dL' },
      { id: 'urobilinogeno_orina', nombre: 'Urobilinógeno', codigo: 'UBG', unidadMedida: 'mg/dL' },
      { id: 'sangre_orina', nombre: 'Sangre Oculta', codigo: 'BLD', unidadMedida: '' },
      { id: 'leucocitos_orina', nombre: 'Leucocitos', codigo: 'LEU', unidadMedida: '/campo' },
      { id: 'eritrocitos_orina', nombre: 'Eritrocitos', codigo: 'RBC', unidadMedida: '/campo' },
      { id: 'cilindros_orina', nombre: 'Cilindros', codigo: 'CAST', unidadMedida: '/campo' },
      { id: 'cristales_orina', nombre: 'Cristales', codigo: 'CRYST', unidadMedida: '/campo' },
      { id: 'bacterias_orina', nombre: 'Bacterias', codigo: 'BACT', unidadMedida: '/campo' }
    ]
  },
  {
    id: 'coprologico',
    codigo: 'COP001',
    nombre: 'Coproparasitoscópico Seriado',
    categoria: 'Parasitología',
    descripcion: 'Búsqueda de parásitos en heces (3 muestras)',
    tiempoResultado: '2-4 horas',
    costoEstimado: 100.00,
    especies: ['canino', 'felino'],
    requisitos: ['Muestra fresca'],
    pruebasDisponibles: [
      { id: 'parasitos_adultos', nombre: 'Parásitos Adultos', codigo: 'PA', unidadMedida: '' },
      { id: 'huevos_parasitos', nombre: 'Huevos de Parásitos', codigo: 'HP', unidadMedida: '' }
    ]
  },
  {
    id: 'cultivo_general',
    codigo: 'MICRO001',
    nombre: 'Cultivo Bacteriológico General',
    categoria: 'Microbiología',
    descripcion: 'Cultivo e identificación de bacterias aerobias',
    tiempoResultado: '48-72 horas',
    costoEstimado: 200.00,
    especies: ['canino', 'felino'],
    requisitos: ['Muestra estéril'],
    pruebasDisponibles: [
      { id: 'cultivo', nombre: 'Cultivo Bacteriológico', codigo: 'CULT', unidadMedida: '' },
      { id: 'identificacion', nombre: 'Identificación Bacteriana', codigo: 'ID', unidadMedida: '' },
      { id: 'recuento_colonias', nombre: 'Recuento de Colonias', codigo: 'UFC', unidadMedida: 'UFC/mL' }
    ]
  },
  {
    id: 'cortisol',
    codigo: 'ENDO002',
    nombre: 'Cortisol Sérico',
    categoria: 'Endocrinología',
    descripcion: 'Medición de cortisol en suero',
    tiempoResultado: '24 horas',
    costoEstimado: 180.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 8h', 'Ambiente tranquilo'],
    pruebasDisponibles: [
      { id: 'cortisol_suero', nombre: 'Cortisol Sérico', codigo: 'CORT', unidadMedida: 'µg/dL' }
    ]
  },
  {
    id: 'electrolitos_completos',
    codigo: 'ELEC001',
    nombre: 'Electrolitos Séricos Completos',
    categoria: 'Química Clínica',
    descripcion: 'Panel completo de electrolitos séricos',
    tiempoResultado: '1-2 horas',
    costoEstimado: 160.00,
    especies: ['canino', 'felino'],
    requisitos: ['Ayuno 6h'],
    pruebasDisponibles: [
      { id: 'sodio', nombre: 'Sodio', codigo: 'Na', unidadMedida: 'mEq/L' },
      { id: 'potasio', nombre: 'Potasio', codigo: 'K', unidadMedida: 'mEq/L' },
      { id: 'cloro', nombre: 'Cloro', codigo: 'Cl', unidadMedida: 'mEq/L' },
      { id: 'co2', nombre: 'Dióxido de Carbono', codigo: 'CO2', unidadMedida: 'mEq/L' },
      { id: 'anion_gap', nombre: 'Brecha Aniónica', codigo: 'AG', unidadMedida: 'mEq/L' }
    ]
  }
])

// Computed properties
const estudiosFiltrados = computed(() => {
  let estudios = estudiosDisponibles.value

  // Filtro por texto (nombre, código o descripción)
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

const estudiosFiltradosYOrdenados = computed(() => {
  return [...estudiosFiltrados.value].sort((a, b) => a.codigo.localeCompare(b.codigo))
})

const categoriasConConteo = computed(() => {
  const conteo = {}
  estudiosDisponibles.value.forEach(estudio => {
    conteo[estudio.categoria] = (conteo[estudio.categoria] || 0) + 1
  })

  return [
    { display: 'Todas las categorías', value: null },
    ...categorias.map(cat => ({
      display: `${cat.label} (${conteo[cat.value] || 0})`,
      value: cat.value
    }))
  ]
})

const costoTotalEstimado = computed(() => {
  return estudiosDisponibles.value
    .filter(estudio => seleccionados.value.includes(estudio.codigo))
    .reduce((total, estudio) => total + (estudio.costoEstimado || 0), 0)
    .toFixed(2)
})

const totalPruebas = computed(() => {
  return estudiosDisponibles.value
    .filter(estudio => seleccionados.value.includes(estudio.codigo))
    .reduce((total, estudio) => total + (estudio.pruebasDisponibles?.length || 0), 0)
})

// Métodos
const getCategoriaColor = (categoria) => {
  const colores = {
    'Hematología': 'red-6',
    'Química Clínica': 'blue-6',
    'Urianálisis': 'amber-6',
    'Parasitología': 'green-6',
    'Microbiología': 'purple-6',
    'Endocrinología': 'orange-6',
    'Inmunología': 'teal-6',
    'Citología': 'pink-6',
    'Cardiología': 'deep-purple-6'
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

const mostrarPruebas = (estudio) => {
  estudioParaMostrar.value = estudio
}

const limpiarSeleccion = () => {
  seleccionados.value = []
}

const limpiarFiltros = () => {
  busqueda.value = ''
  categoriaSeleccionada.value = null
}

const filtrarEstudios = () => {
  // La lógica se maneja en el computed
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
      pruebasDisponibles: estudio.pruebasDisponibles,
      descripcion: estudio.descripcion,
      especies: estudio.especies
    }))
  
  emit('estudios-seleccionados', estudiosParaAgregar)
}

const cancelar = () => {
  emit('cancelar')
}
</script>

<style scoped>
/* Contenedor principal */
.selector-estudios-split {
  min-width: 90vw;
  max-width: 1200px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

/* Input de búsqueda */
.search-input :deep(.q-field__control) {
  border-radius: 8px;
  height: 40px;
}

/* Grid de tarjetas pequeñas */
.estudios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Tarjetas pequeñas */
.estudio-card-mini {
  position: relative;
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 120px;
}

.estudio-card-mini:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 12px rgba(25, 118, 210, 0.15);
  transform: translateY(-1px);
}

.estudio-card-mini--selected {
  border-color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.estudio-card-mini__header {
  margin-bottom: 8px;
}

.estudio-card-mini__content {
  flex: 1;
}

.estudio-card-mini__overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.estudio-card-mini:hover .estudio-card-mini__overlay {
  opacity: 1;
}

/* Lista compacta */
.estudios-lista {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.estudios-lista .q-item {
  border-radius: 6px;
  margin: 2px;
  transition: all 0.2s ease;
}

.estudios-lista .q-item:hover {
  background: #f5f5f5;
}

.estudios-lista .q-item--active {
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
  border: 1px solid #1976d2;
}

/* Panel derecho */
.col-4.bg-grey-1 {
  border-left: 1px solid #e0e0e0;
  min-height: 600px;
}

/* Scrollbars personalizados */
.estudios-grid::-webkit-scrollbar,
.estudios-lista::-webkit-scrollbar {
  width: 6px;
}

.estudios-grid::-webkit-scrollbar-track,
.estudios-lista::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.estudios-grid::-webkit-scrollbar-thumb,
.estudios-lista::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.estudios-grid::-webkit-scrollbar-thumb:hover,
.estudios-lista::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Badges y chips */
.q-badge {
  font-weight: 500;
  border-radius: 4px;
  font-size: 10px;
}

.q-chip {
  border-radius: 12px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .selector-estudios-split {
    min-width: 95vw;
  }

  .row.no-wrap {
    flex-direction: column;
    height: auto !important;
  }

  .col-8, .col-4 {
    width: 100% !important;
    max-width: 100% !important;
  }

  .col-4.bg-grey-1 {
    border-left: none;
    border-top: 1px solid #e0e0e0;
    min-height: 300px;
  }

  .estudios-grid {
    grid-template-columns: 1fr;
    max-height: 400px;
  }

  .estudio-card-mini {
    min-height: 100px;
  }
}

@media (max-width: 480px) {
  .estudios-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .estudio-card-mini {
    padding: 10px;
    min-height: 90px;
  }
}

/* Estados de animación */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Lista de pruebas en el panel derecho */
.q-list .q-item {
  min-height: 40px;
}

.q-avatar {
  font-size: 8px;
  font-weight: bold;
}

/* Mejoras visuales */
.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

/* Focus states para accesibilidad */
.estudio-card-mini:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.q-btn:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Estados de hover mejorados */
.q-btn:hover {
  transform: translateY(-1px);
}
</style>
<template>
  <div class="dashboard-catalogo">
    <!-- Tarjetas de estadísticas -->
    <div class="stats-grid">
      <!-- Tarjeta Estudios -->
      <q-card class="stat-card">
        <q-card-section class="row items-center">
          <div class="col">
            <div class="text-h6">{{ stats.totalEstudios }}</div>
            <div class="text-subtitle2 text-grey-7">Estudios Total</div>
            <div class="text-caption text-positive q-mt-sm">{{ stats.estudiosActivos }} activos</div>
          </div>
          <q-icon name="science" size="48px" color="primary" class="col-auto" />
        </q-card-section>
      </q-card>

      <!-- Tarjeta Pruebas -->
      <q-card class="stat-card">
        <q-card-section class="row items-center">
          <div class="col">
            <div class="text-h6">{{ stats.totalPruebas }}</div>
            <div class="text-subtitle2 text-grey-7">Pruebas / Tests</div>
            <div class="text-caption text-positive q-mt-sm">{{ stats.pruebasActivas }} activas</div>
          </div>
          <q-icon name="analytics" size="48px" color="info" class="col-auto" />
        </q-card-section>
      </q-card>

      <!-- Tarjeta Valores Referencia -->
      <q-card class="stat-card">
        <q-card-section class="row items-center">
          <div class="col">
            <div class="text-h6">{{ stats.totalValoresReferencia }}</div>
            <div class="text-subtitle2 text-grey-7">Valores Referencia</div>
            <div class="text-caption text-positive q-mt-sm">{{ stats.especiesRegistradas }} especies</div>
          </div>
          <q-icon name="assessment" size="48px" color="secondary" class="col-auto" />
        </q-card-section>
      </q-card>

      <!-- Tarjeta Tipos Muestra -->
      <q-card class="stat-card">
        <q-card-section class="row items-center">
          <div class="col">
            <div class="text-h6">{{ stats.totalTiposMuestra }}</div>
            <div class="text-subtitle2 text-grey-7">Tipos de Muestra</div>
            <div class="text-caption q-mt-sm">Última actualización: {{ formatearFecha(stats.ultimaActualizacion) }}</div>
          </div>
          <q-icon name="invert_colors" size="48px" color="teal" class="col-auto" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Secciones de información -->
    <div class="q-mt-lg">
      <!-- Info Estudios -->
      <q-card class="info-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="science" color="primary" class="q-mr-sm" />
            Estado de Estudios
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="info-item">
                <div class="label">Medicina General</div>
                <div class="value">{{ contarEstudiosPorCategoria('Hematología') + contarEstudiosPorCategoria('Química Clínica') }}</div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="info-item">
                <div class="label">Especialidades</div>
                <div class="value">{{ stats.totalEstudios - (contarEstudiosPorCategoria('Hematología') + contarEstudiosPorCategoria('Química Clínica')) }}</div>
              </div>
            </div>
          </div>

          <div class="q-mt-md text-caption text-grey-7">
            <q-icon name="info" size="xs" />
            Últimas actualizaciones de estudios hace {{ tiempoDesdeUltimaActualizacion }} días
          </div>
        </q-card-section>
      </q-card>

      <!-- Info Valores Referencia -->
      <q-card class="info-card q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="assessment" color="secondary" class="q-mr-sm" />
            Cobertura de Valores de Referencia
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-6">
              <div class="text-subtitle2">Especies registradas:</div>
              <div class="q-mt-sm">
                <q-badge
                  v-for="especie in especiesRegistradas"
                  :key="especie"
                  :label="capitalizarEspecie(especie)"
                  color="blue"
                  class="q-mr-sm q-mb-sm"
                />
                <q-badge
                  v-if="especiesRegistradas.length === 0"
                  label="Sin registros"
                  color="grey"
                />
              </div>
            </div>

            <div class="col-12 col-lg-6">
              <div class="text-subtitle2">% Cobertura por especie:</div>
              <div class="q-mt-md q-gutter-md">
                <div v-for="especie in especiesRegistradas" :key="especie" class="coverage-item">
                  <div class="label">{{ capitalizarEspecie(especie) }}</div>
                  <q-linear-progress
                    :value="calcularCobertura(especie)"
                    color="primary"
                    size="20px"
                    class="q-mt-xs"
                  >
                    <div class="absolute-full flex flex-center">
                      <span class="text-white text-caption text-weight-bold">
                        {{ Math.round(calcularCobertura(especie) * 100) }}%
                      </span>
                    </div>
                  </q-linear-progress>
                </div>
              </div>
            </div>
          </div>

          <div class="q-mt-md q-pa-md bg-warning-1 rounded-borders">
            <q-icon name="warning" color="warning" size="sm" class="q-mr-xs" />
            <span class="text-caption">
              Es importante tener valores de referencia para todas las pruebas y especies
              para garantizar la interpretación correcta de resultados
            </span>
          </div>
        </q-card-section>
      </q-card>

      <!-- Recomendaciones -->
      <q-card class="info-card q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="lightbulb" color="info" class="q-mr-sm" />
            Recomendaciones
          </div>

          <div class="q-gutter-md">
            <div v-if="stats.totalEstudios === 0" class="recommendation warning">
              <q-icon name="priority_high" color="warning" class="q-mr-sm" />
              <div>
                <div class="text-weight-bold">Comienza cargando Estudios</div>
                <div class="text-caption">Accede a "Estudios" e importa o crea la lista de estudios disponibles</div>
              </div>
            </div>

            <div v-if="stats.totalPruebas < stats.totalEstudios * 5" class="recommendation info">
              <q-icon name="info" color="info" class="q-mr-sm" />
              <div>
                <div class="text-weight-bold">Pruebas por completar</div>
                <div class="text-caption">Se recomienda ~5-15 pruebas por estudio. Actualmente: {{ stats.totalPruebas }}</div>
              </div>
            </div>

            <div v-if="stats.totalValoresReferencia < stats.totalPruebas" class="recommendation warning">
              <q-icon name="priority_high" color="warning" class="q-mr-sm" />
              <div>
                <div class="text-weight-bold">Valores de Referencia incompletos</div>
                <div class="text-caption">
                  Tienes {{ stats.totalPruebas }} pruebas pero solo {{ stats.totalValoresReferencia }}
                  valores de referencia. Se recomienda cargar CSV con rangos normales
                </div>
              </div>
            </div>

            <div v-if="stats.totalTiposMuestra < 5" class="recommendation info">
              <q-icon name="info" color="info" class="q-mr-sm" />
              <div>
                <div class="text-weight-bold">Tipos de Muestra básicos</div>
                <div class="text-caption">Considera agregar: Sangre EDTA, Sangre Suero, Orina, Heces, Aspirado</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Instructivos -->
      <q-card class="info-card q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="help" color="primary" class="q-mr-sm" />
            ¿Cómo usar los Catálogos?
          </div>

          <div class="q-gutter-lg">
            <div class="instruction">
              <div class="step-number">1</div>
              <div>
                <div class="text-weight-bold">Carga de Estudios</div>
                <ul class="text-caption q-pl-md q-my-sm">
                  <li>Opción A: Importar CSV (plantilla disponible)</li>
                  <li>Opción B: Crear manualmente vía formulario</li>
                </ul>
              </div>
            </div>

            <div class="instruction">
              <div class="step-number">2</div>
              <div>
                <div class="text-weight-bold">Definición de Pruebas</div>
                <ul class="text-caption q-pl-md q-my-sm">
                  <li>Por cada estudio, agregar sus pruebas específicas</li>
                  <li>Ej: "Hematología Completa" contiene Hemoglobina, Hematocrito, etc.</li>
                </ul>
              </div>
            </div>

            <div class="instruction">
              <div class="step-number">3</div>
              <div>
                <div class="text-weight-bold">Valores de Referencia (CRÍTICO)</div>
                <ul class="text-caption q-pl-md q-my-sm">
                  <li>Especificar rangos normales por especie, edad, peso, sexo</li>
                  <li>Importar CSV masiva (plantilla con datos veterinarios)</li>
                  <li>Esto permite validación automática de resultados</li>
                </ul>
              </div>
            </div>

            <div class="instruction">
              <div class="step-number">4</div>
              <div>
                <div class="text-weight-bold">Tipos de Muestra</div>
                <ul class="text-caption q-pl-md q-my-sm">
                  <li>Definir cómo se recolectan: Ayuno, Refrigeración, Tiempo máximo</li>
                  <li>Será usado en "Registro de Muestras"</li>
                </ul>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Enlaces a descargas -->
      <q-card class="info-card q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="download" color="info" class="q-mr-sm" />
            Descargar Plantillas
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-btn
                color="info"
                label="Plantilla Estudios CSV"
                icon="download"
                flat
                size="md"
                class="full-width"
                @click="descargarPlantillaEstudios"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-btn
                color="info"
                label="Plantilla Valores Referencia CSV"
                icon="download"
                flat
                size="md"
                class="full-width"
                @click="descargarPlantillaValores"
              />
            </div>
          </div>

          <div class="q-mt-md text-caption text-grey-7">
            <q-icon name="info" size="xs" />
            Las plantillas incluyen ejemplos y documentación en las primeras filas
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// Mock stats - en producción vendrían del backend
const stats = reactive({
  totalEstudios: 28,
  totalPruebas: 156,
  totalValoresReferencia: 420,
  totalTiposMuestra: 6,
  estudiosActivos: 28,
  pruebasActivas: 156,
  especiesRegistradas: 5,
  ultimaActualizacion: new Date()
})

const especiesRegistradas = computed(() => ['canino', 'felino', 'equino', 'bovino', 'ave'])

const tiempoDesdeUltimaActualizacion = computed(() => {
  const ahora = new Date().getTime()
  const ultima = stats.ultimaActualizacion.getTime()
  const dias = Math.floor((ahora - ultima) / (1000 * 60 * 60 * 24))
  return dias
})

// Métodos
const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-ES')
}

const capitalizarEspecie = (especie: string): string => {
  return especie.charAt(0).toUpperCase() + especie.slice(1)
}

const contarEstudiosPorCategoria = (categoria: string): number => {
  // Mock - en producción consultar backend
  const map: Record<string, number> = {
    'Hematología': 4,
    'Química Clínica': 6,
    'Urianálisis': 2,
    'Parasitología': 3
  }
  return map[categoria] || 0
}

const calcularCobertura = (especie: string): number => {
  // Mock - en producción consultar backend
  const map: Record<string, number> = {
    'canino': 0.95,
    'felino': 0.85,
    'equino': 0.70,
    'bovino': 0.65,
    'ave': 0.45
  }
  return map[especie] || 0
}

const descargarPlantillaEstudios = () => {
  const csv = `codigo,nombre,categoria,descripcion,costo,tiempoResultado,estado
HEM001,Hematología Completa,Hematología,Conteo de células sanguíneas,250.00,4,activo
QUI002,Química Sanguínea,Química Clínica,Panel de química general,350.00,4,activo
URN001,Urianálisis,Urianálisis,Análisis de orina completo,120.00,2,activo`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'plantilla-estudios.csv')
  link.click()
}

const descargarPlantillaValores = () => {
  const csv = `id_prueba,especie,sexo,edad_minima,edad_maxima,peso_minimo,peso_maximo,valor_minimo,valor_maximo,alerta_minima,alerta_maxima,observaciones
5,canino,macho,3,8,,15,12,18,10,20,Raza mediana
5,canino,hembra,3,8,,15,11.5,17.5,10,20,Ligeramente más baja
5,felino,,1,10,,8,8,15,6,18,Todas las edades y sexos`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'plantilla-valores-referencia.csv')
  link.click()
}
</script>

<style scoped lang="scss">
.dashboard-catalogo {
  padding: 20px;
  background: #f5f5f5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  .stat-card {
    background: white;
    border-left: 4px solid var(--q-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .text-h6 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
  }
}

.info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recommendation {
  display: flex;
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid;

  &.info {
    background: #e8f4f8;
    border-left-color: var(--q-info);
  }

  &.warning {
    background: #fff8e1;
    border-left-color: var(--q-warning);
  }

  .text-weight-bold {
    margin-bottom: 4px;
  }
}

.instruction {
  display: flex;
  gap: 15px;

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--q-primary);
    color: white;
    font-weight: bold;
    flex-shrink: 0;
  }

  ul {
    list-style-type: disc;
  }
}

.coverage-item {
  padding: 8px 0;

  .label {
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
  }
}

.rounded-borders {
  border-radius: 4px;
}
</style>

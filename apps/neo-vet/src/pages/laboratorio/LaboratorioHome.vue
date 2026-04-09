<template>
  <div class="laboratorio-home">
    <!-- Sección de Bienvenida y Estadísticas -->
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-header">
          <div>
            <h1 class="welcome-title">Dashboard de Laboratorio</h1>
            <p class="welcome-subtitle">
              Última actualización: {{ fechaActual }}
            </p>
          </div>
          <q-btn
            rounded
            color="primary"
            icon="refresh"
            @click="cargarEstadisticas"
            flat
          />
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="stats-grid">
          <div class="stat-card bg-blue">
            <div class="stat-icon">
              <q-icon name="receipt" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.ordenesPendientes }}</div>
              <div class="stat-label">Órdenes Pendientes</div>
            </div>
          </div>

          <div class="stat-card bg-orange">
            <div class="stat-icon">
              <q-icon name="local_shipping" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.muestrasEnProceso }}</div>
              <div class="stat-label">Muestras en Proceso</div>
            </div>
          </div>

          <div class="stat-card bg-green">
            <div class="stat-icon">
              <q-icon name="check_circle" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.resultadosCompletados }}</div>
              <div class="stat-label">Resultados Completados</div>
            </div>
          </div>

          <div class="stat-card bg-purple">
            <div class="stat-icon">
              <q-icon name="science" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ estadisticas.estudiosDisponibles }}</div>
              <div class="stat-label">Estudios Disponibles</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menú de Módulos - Tarjetas de Navegación -->
    <div class="modules-section">
      <h2 class="section-title">Módulos de Gestión</h2>

      <div class="modules-grid">
        <!-- Gestión de Órdenes -->
        <div
          class="module-card"
          @click="irA('/laboratorio')"
          :class="{ 'card-hover': true }"
        >
          <div class="card-header bg-primary">
            <q-icon name="receipt" size="32px" />
          </div>
          <div class="card-body">
            <h3 class="card-title">Gestión de Órdenes</h3>
            <p class="card-description">
              Crear, editar y gestionar órdenes de laboratorio
            </p>
            <div class="card-meta">
              <span class="badge">{{ estadisticas.ordenesPendientes }} pendientes</span>
            </div>
          </div>
          <div class="card-footer">
            <q-btn color="primary" label="Acceder" flat no-caps icon-right="arrow_forward" />
          </div>
        </div>

        <!-- Registro de Muestras -->
        <div
          class="module-card"
          @click="irA('/laboratorio/registro-muestras')"
          :class="{ 'card-hover': true }"
        >
          <div class="card-header bg-orange">
            <q-icon name="local_shipping" size="32px" />
          </div>
          <div class="card-body">
            <h3 class="card-title">Registro de Muestras</h3>
            <p class="card-description">
              Registrar y rastrear muestras del laboratorio
            </p>
            <div class="card-meta">
              <span class="badge">{{ estadisticas.muestrasEnProceso }} en proceso</span>
            </div>
          </div>
          <div class="card-footer">
            <q-btn color="primary" label="Acceder" flat no-caps icon-right="arrow_forward" />
          </div>
        </div>

        <!-- Carga de Resultados -->
        <div
          class="module-card"
          @click="irA('/laboratorio/carga-resultados')"
          :class="{ 'card-hover': true }"
        >
          <div class="card-header bg-green">
            <q-icon name="check_circle" size="32px" />
          </div>
          <div class="card-body">
            <h3 class="card-title">Carga de Resultados</h3>
            <p class="card-description">
              Ingresar y procesar resultados de estudios
            </p>
            <div class="card-meta">
              <span class="badge">{{ estadisticas.resultadosCompletados }} completados</span>
            </div>
          </div>
          <div class="card-footer">
            <q-btn color="primary" label="Acceder" flat no-caps icon-right="arrow_forward" />
          </div>
        </div>

        <!-- Configuración de Catálogos -->
        <div
          class="module-card"
          @click="irA('/laboratorio/admin-catalogos')"
          :class="{ 'card-hover': true }"
        >
          <div class="card-header bg-purple">
            <q-icon name="settings" size="32px" />
          </div>
          <div class="card-body">
            <h3 class="card-title">Configuración</h3>
            <p class="card-description">
              Gestionar estudios, pruebas y valores de referencia
            </p>
            <div class="card-meta">
              <span class="badge">{{ estadisticas.estudiosDisponibles }} estudios</span>
            </div>
          </div>
          <div class="card-footer">
            <q-btn color="primary" label="Acceder" flat no-caps icon-right="arrow_forward" />
          </div>
        </div>

        <!-- Reportes -->
        <div
          class="module-card"
          @click="irA('/laboratorio/reportes')"
          :class="{ 'card-hover': true }"
        >
          <div class="card-header bg-teal">
            <q-icon name="assessment" size="32px" />
          </div>
          <div class="card-body">
            <h3 class="card-title">Reportes</h3>
            <p class="card-description">
              Generar reportes y analíticas del laboratorio
            </p>
            <div class="card-meta">
              <span class="badge">Informes disponibles</span>
            </div>
          </div>
          <div class="card-footer">
            <q-btn color="primary" label="Acceder" flat no-caps icon-right="arrow_forward" />
          </div>
        </div>

        <!-- Inventario -->
        <div
          class="module-card"
          @click="irA('/laboratorio/inventario')"
          :class="{ 'card-hover': true }"
        >
          <div class="card-header bg-cyan">
            <q-icon name="inventory" size="32px" />
          </div>
          <div class="card-body">
            <h3 class="card-title">Inventario</h3>
            <p class="card-description">
              Gestionar materiales y reactivos del laboratorio
            </p>
            <div class="card-meta">
              <span class="badge">En tiempo real</span>
            </div>
          </div>
          <div class="card-footer">
            <q-btn color="primary" label="Acceder" flat no-caps icon-right="arrow_forward" />
          </div>
        </div>

        <!-- Configuración Avanzada -->
        <div
          class="module-card"
          @click="mostrarMenuConfiguracion"
          :class="{ 'card-hover': true }"
        >
          <div class="card-header bg-indigo">
            <q-icon name="tune" size="32px" />
          </div>
          <div class="card-body">
            <h3 class="card-title">Configuración Avanzada</h3>
            <p class="card-description">
              Impresoras, tipos de muestra y parámetros del sistema
            </p>
          </div>
          <div class="card-footer">
            <q-btn color="primary" label="Acceder" flat no-caps icon-right="arrow_forward" />
          </div>
        </div>
      </div>
    </div>

    <!-- Accesos Rápidos -->
    <div class="quick-actions">
      <h3 class="section-title">Acciones Rápidas</h3>
      <div class="actions-grid">
        <q-btn
          color="primary"
          label="Nueva Orden"
          icon="add_circle"
          @click="irA('/laboratorio')"
          rounded
          size="lg"
        />
        <q-btn
          color="secondary"
          label="Ver Resultados Pendientes"
          icon="list"
          @click="irA('/laboratorio/carga-resultados')"
          rounded
          size="lg"
        />
        <q-btn
          color="info"
          label="Gestionar Muestras"
          icon="inventory_2"
          @click="irA('/laboratorio/registro-muestras')"
          rounded
          size="lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const fechaActual = ref('');

const estadisticas = ref({
  ordenesPendientes: 0,
  muestrasEnProceso: 0,
  resultadosCompletados: 0,
  estudiosDisponibles: 0,
});

onMounted(() => {
  actualizarFecha();
  cargarEstadisticas();
});

const actualizarFecha = () => {
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  fechaActual.value = new Date().toLocaleDateString('es-ES', opciones);
};

const cargarEstadisticas = async () => {
  try {
    // MOCK: Reemplazar con llamadas reales al backend
    // TODO: Implementar servicios reales
    estadisticas.value = {
      ordenesPendientes: 12,
      muestrasEnProceso: 8,
      resultadosCompletados: 45,
      estudiosDisponibles: 32,
    };
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
};

const irA = (ruta: string) => {
  router.push(ruta);
};

const mostrarMenuConfiguracion = () => {
  router.push('/laboratorio/admin-catalogos');
};
</script>

<style lang="scss" scoped>
.laboratorio-home {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Sección de Bienvenida
.welcome-section {
  margin-bottom: 32px;

  .welcome-card {
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;

      .welcome-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .welcome-subtitle {
        margin: 8px 0 0 0;
        color: #999;
        font-size: 14px;
      }
    }
  }
}

// Estadísticas
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 8px;
    color: white;

    &.bg-blue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.bg-orange {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.bg-green {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.bg-purple {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .stat-icon {
      font-size: 32px;
      opacity: 0.9;
    }

    .stat-info {
      .stat-number {
        font-size: 28px;
        font-weight: 700;
      }

      .stat-label {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 4px;
      }
    }
  }
}

// Sección de Módulos
.modules-section {
  margin-bottom: 40px;

  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

// Tarjeta de Módulo
.module-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;

  &.card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

    .card-header {
      transform: scale(1.1);
    }
  }

  .card-header {
    padding: 24px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
    transition: transform 0.3s ease;

    &.bg-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.bg-orange {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.bg-green {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.bg-purple {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.bg-teal {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    &.bg-indigo {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }
  }

  .card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .card-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }

    .card-description {
      font-size: 14px;
      color: #666;
      margin: 0;
      flex: 1;
      line-height: 1.5;
    }

    .card-meta {
      margin-top: 12px;

      .badge {
        display: inline-block;
        background: #f0f0f0;
        color: #667eea;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }
    }
  }

  .card-footer {
    padding: 12px 20px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;

    :deep(.q-btn) {
      width: 100%;
      letter-spacing: 0.3px;
    }
  }
}

// Acciones Rápidas
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 28px;
  margin-top: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .section-title {
    margin-bottom: 16px;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;

    :deep(.q-btn) {
      font-weight: 500;
      letter-spacing: 0.3px;
    }
  }
}

// Responsivo
@media (max-width: 768px) {
  .welcome-card {
    padding: 20px !important;

    .welcome-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .welcome-title {
        font-size: 22px;
      }
    }
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .laboratorio-home {
    padding: 0;
  }

  .welcome-card {
    border-radius: 0 !important;
    padding: 16px !important;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modules-grid {
    gap: 12px !important;
  }
}
</style>

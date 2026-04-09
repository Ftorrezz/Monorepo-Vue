<template>
  <div class="laboratorio-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-my-none">Dashboard de Laboratorio</h1>
        <div class="breadcrumbs text-grey-7 text-caption q-mt-sm">
          <q-icon name="science" /> / Control de Laboratorio / {{ fechaActual }}
        </div>
      </div>
    </div>

    <!-- Stats Cards Section -->
    <div class="q-mb-lg">
      <h6 class="text-subtitle1 text-weight-bold q-mb-md">Estadísticas Rápidas</h6>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card-blue">
            <div class="stat-icon">
              <q-icon name="receipt" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ estadisticas.ordenesPendientes }}</div>
              <div class="stat-label">Órdenes Pendientes</div>
            </div>
            <div class="stat-bar"></div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card-blue">
            <div class="stat-icon">
              <q-icon name="local_shipping" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ estadisticas.muestrasEnProceso }}</div>
              <div class="stat-label">Muestras en Proceso</div>
            </div>
            <div class="stat-bar"></div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card-blue">
            <div class="stat-icon">
              <q-icon name="check_circle" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ estadisticas.resultadosCompletados }}</div>
              <div class="stat-label">Resultados Completados</div>
            </div>
            <div class="stat-bar"></div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div class="stat-card stat-card-blue">
            <div class="stat-icon">
              <q-icon name="science" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ estadisticas.estudiosDisponibles }}</div>
              <div class="stat-label">Estudios Disponibles</div>
            </div>
            <div class="stat-bar"></div>
          </div>
        </div>
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
  ordenesPendientes: 12,
  muestrasEnProceso: 8,
  resultadosCompletados: 45,
  estudiosDisponibles: 32,
});

onMounted(() => {
  actualizarFecha();
});

const actualizarFecha = () => {
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  fechaActual.value = new Date().toLocaleDateString('es-ES', opciones);
};

const irA = (ruta: string) => {
  router.push(ruta);
};
</script>

<style lang="scss" scoped>
.laboratorio-dashboard {
  animation: fadeIn 0.3s ease;
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

// Dashboard Header
.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: 10px;

  h1 {
    margin-bottom: 8px;
  }
}

// Breadcrumbs
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
}

// Stat Cards
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    opacity: 0.08;
    transform: translate(25%, -25%);
  }

  .stat-icon {
    font-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 10px;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;

    .stat-number {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      opacity: 0.8;
    }
  }

  .stat-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    width: 100%;
    opacity: 0.6;
  }

  &.stat-card-brown {
    border-left-color: #1976d2;

    .stat-icon {
      background-color: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .stat-number {
      color: #1976d2;
    }

    .stat-bar {
      background-color: #1976d2;
    }
  }

  &.stat-card-warning {
    border-left-color: #1976d2;

    .stat-icon {
      background-color: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .stat-number {
      color: #1976d2;
    }

    .stat-bar {
      background-color: #1976d2;
    }
  }

  &.stat-card-positive {
    border-left-color: #1976d2;

    .stat-icon {
      background-color: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .stat-number {
      color: #1976d2;
    }

    .stat-bar {
      background-color: #1976d2;
    }
  }

  &.stat-card-info {
    border-left-color: #1976d2;

    .stat-icon {
      background-color: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .stat-number {
      color: #1976d2;
    }

    .stat-bar {
      background-color: #1976d2;
    }
  }

  &.stat-card-blue {
    border-left-color: #1976d2;

    .stat-icon {
      background-color: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .stat-number {
      color: #1976d2;
    }

    .stat-bar {
      background-color: #1976d2;
    }
  }
}

// Responsive
@media (max-width: 1024px) {
  .stat-card {
    flex-direction: column;
    text-align: center;

    .stat-icon {
      width: 48px;
      height: 48px;
      font-size: 24px;
    }

    .stat-content {
      .stat-number {
        font-size: 24px;
      }
    }
  }
}

@media (max-width: 768px) {
  .laboratorio-dashboard {
    padding: 0;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-card {
    .stat-icon {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }

    .stat-content {
      .stat-number {
        font-size: 22px;
      }

      .stat-label {
        font-size: 12px;
      }
    }
  }
}
</style>

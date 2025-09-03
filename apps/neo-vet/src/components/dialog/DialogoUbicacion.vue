<template>
  <q-dialog v-model="dialogStore.showSucursalDialog" persistent>
    <q-card class="branch-dialog">
      <!-- Header con diseño moderno -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <q-icon name="location_on" size="32px" color="white" />
          </div>
          <div class="header-text">
            <h2 class="header-title">{{ $t('branchDialog.title') }}</h2>
            <p class="header-subtitle">{{ $t('branchDialog.subtitle') }}</p>
          </div>
        </div>
        <div class="header-decoration"></div>
      </div>

      <!-- Lista de sucursales con grid moderno -->
      <q-card-section class="branches-container">
        <div class="branches-grid">
          <div
            v-for="sucursal in dialogStore.sucursales"
            :key="sucursal.id"
            class="branch-card"
            @click="selectBranch(sucursal)"
          >
            <div class="branch-image-container">
              <q-img
                :src="sucursal.imagen"
                :alt="$t('branchDialog.imageAlt')"
                class="branch-image"
                loading="lazy"
              >
                <div class="image-overlay">
                  <q-icon name="pets" size="24px" color="white" />
                </div>
              </q-img>
            </div>
            
            <div class="branch-info">
              <h3 class="branch-name">{{ sucursal.descripcion }}</h3>
              <div class="branch-details">
                <div class="detail-item">
                  <q-icon name="place" size="16px" color="#64748b" />
                  <span class="detail-text">{{ sucursal.direccion }}</span>
                </div>
                <div class="detail-item">
                  <q-icon name="person" size="16px" color="#64748b" />
                  <span class="detail-text">{{ sucursal.responsable }}</span>
                </div>
              </div>
            </div>
            
            <!-- Botón de selección -->
            <div class="select-button">
              <q-icon name="arrow_forward" size="20px" color="#6366f1" />
            </div>
            
            <!-- Efecto hover -->
            <div class="hover-overlay"></div>
          </div>
        </div>
      </q-card-section>

      <!-- Footer con botón moderno -->
      <q-card-actions class="dialog-footer">
        <q-btn
          flat
          :label="$t('branchDialog.cancelButton')"
          class="cancel-btn"
          @click="dialogStore.closeDialog"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogStore } from "../../stores/DialogoUbicacion";
import { Sucursal } from "../../../../../libs/shared/src/interfaces/sucursal.interfaz";
import { useI18n } from 'vue-i18n';

const dialogStore = useDialogStore();
const { t } = useI18n();

const selectBranch = (sucursal: Sucursal) => {
  dialogStore.selectBranch(sucursal);
};
</script>

<style lang="scss" scoped>
.branch-dialog {
  width: 700px;
  max-width: 95vw;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  background: white;
  backdrop-filter: blur(20px);
}

.dialog-header {
  position: relative;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  padding: 32px;
  overflow: hidden;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    z-index: 2;
  }

  .header-icon {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
  }

  .header-text {
    flex: 1;
  }

  .header-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: white;
    line-height: 1.2;
  }

  .header-subtitle {
    margin: 8px 0 0 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
  }

  .header-decoration {
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.branches-container {
  padding: 32px;
}

.branches-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.branch-card {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: #6366f1;
    box-shadow: 
      0 25px 50px -12px rgba(99, 102, 241, 0.25),
      0 0 0 1px rgba(99, 102, 241, 0.1);

    .branch-image {
      transform: scale(1.1);
    }

    .hover-overlay {
      opacity: 1;
    }

    .select-button {
      transform: translateX(0);
      opacity: 1;
    }

    .image-overlay {
      opacity: 1;
    }
  }
}

.branch-image-container {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.branch-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: rgba(99, 102, 241, 0.9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.branch-info {
  padding: 24px;
  flex: 1;
}

.branch-name {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.branch-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.detail-text {
  color: #64748b;
  font-weight: 500;
}

.select-button {
  position: absolute;
  top: 50%;
  right: 24px;
  transform: translateY(-50%) translateX(20px);
  width: 44px;
  height: 44px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.dialog-footer {
  padding: 24px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  justify-content: center;
}

.cancel-btn {
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  color: #64748b;
  background: white;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
    color: #475569;
  }
}

// Responsive design
@media (max-width: 768px) {
  .branch-dialog {
    width: 95vw;
    margin: 20px;
  }

  .dialog-header {
    padding: 24px;

    .header-title {
      font-size: 24px;
    }

    .header-subtitle {
      font-size: 14px;
    }
  }

  .branches-container {
    padding: 20px;
  }

  .branches-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .branch-card {
    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }

  .branch-info {
    padding: 20px;
  }

  .branch-name {
    font-size: 18px;
  }
}

// Animaciones de entrada
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.branch-card {
  animation: slideInUp 0.6s ease-out;
  
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.3s; }
}
</style>
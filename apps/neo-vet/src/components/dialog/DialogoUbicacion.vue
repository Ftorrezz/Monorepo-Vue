<template>
  <q-dialog v-model="dialogStore.showSucursalDialog" persistent>
    <q-card style="width: 600px; max-width: 90vw; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <q-card-section>
        <div class="text-h5 font-bold text-primary">{{ $t('branchDialog.title') }}</div>
        <div class="text-subtitle2 text-dark q-mt-sm">
          {{ $t('branchDialog.subtitle') }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list>
          <q-item
            v-for="sucursal in dialogStore.sucursales"
            :key="sucursal.id"
            class="custom-card q-mb-md"
            @click="selectBranch(sucursal)"
            clickable
          >
            <q-item-section avatar>
              <q-img
                :src="sucursal.imagen"
                :alt="$t('branchDialog.imageAlt')"
                style="width: 120px; height: 100px; object-fit: cover; border-radius: 8px"
              />
            </q-item-section>

            <q-item-section class="q-pl-md">
              <div class="text-h6 font-medium text-primary text-white">{{ sucursal.descripcion }}</div>
              <div class="text-subtitle2 text-grey-5 q-mt-xs">{{ sucursal.direccion }}</div>
              <div class="text-caption text-grey q-mt-xs">{{ sucursal.responsable }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('branchDialog.cancelButton')" color="negative" v-close-popup @click="dialogStore.closeDialog" />
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
.custom-card {
  background: linear-gradient(145deg, #5930d2, #3329f6);
  border-radius: 12px;
  transition: transform 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
}

.text-white {
  color: white !important;
}

.text-grey-5 {
  color: #e0e0e0 !important;
}

.text-grey {
  color: #bdbdbd !important;
}

.font-medium {
  font-weight: 500;
}

.elevated-btn {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}
</style>

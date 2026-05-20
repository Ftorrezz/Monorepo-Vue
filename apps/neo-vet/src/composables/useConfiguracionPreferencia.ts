import { ref, computed, watch, onMounted } from 'vue';
import { usePreferenciasStore, SCHEMA_PREFERENCIAS } from '../stores/preferencias';
import { useDialogStore } from '../stores/DialogoUbicacion';

export default function useConfiguracionPreferencia() {
  const store = usePreferenciasStore();
  const dialogStore = useDialogStore();

  const idSucursal = computed(() => dialogStore.id_sucursal);

  const cargarPreferencias = async () => {
    if (idSucursal.value) {
      await store.cargarPreferencias(idSucursal.value);
    }
  };

  watch(idSucursal, () => {
    cargarPreferencias();
  });

  onMounted(() => {
    cargarPreferencias();
  });

  return {
    schemas: SCHEMA_PREFERENCIAS,
    preferencias: computed(() => store.preferenciasCargadas),
    cargando: computed(() => store.cargando),
    guardarPreferencia: (identificador: string, valor: string) => {
      if (idSucursal.value) {
        return store.guardarPreferencia(identificador, valor, idSucursal.value);
      }
    },
    cargarPreferencias
  };
}

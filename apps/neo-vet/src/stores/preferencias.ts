import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import configuracionPreferenciaService, { Preferencia } from '../services/configuracionPreferencia.service';
import { useDialogStore } from './DialogoUbicacion';
import { useUiStore } from './uiStore';
import { colors } from 'quasar';

export const SCHEMA_PREFERENCIAS = [
  {
    identificador: 'MENU_LAYOUT',
    descripcion: 'Diseño de Menú de Navegación',
    tip_dato: 'SELECT',
    valor_defecto: 'horizontal',
    opciones: [
      { label: 'Horizontal (Barra superior)', value: 'horizontal' },
      { label: 'Vertical (Menú lateral)', value: 'sidebar' }
    ],
    categoria: 'Visual'
  },
  {
    identificador: 'THEME_COLOR',
    descripcion: 'Color del Tema Principal',
    tip_dato: 'COLOR',
    valor_defecto: '#1976D2',
    categoria: 'Visual'
  },
  {
    identificador: 'BUSQUEDA_RAPIDA_PROPIETARIO_MASCOTA',
    descripcion: 'Búsqueda Rápida de Propietario/Mascota',
    tip_dato: 'BOOLEAN',
    valor_defecto: 'S',
    categoria: 'Búsqueda'
  }
];

export const usePreferenciasStore = defineStore('preferencias', () => {
  const dialogStore = useDialogStore();
  const uiStore = useUiStore();
  
  const preferenciasCargadas = ref<Record<string, string>>({});
  const preferenciasRaw = ref<Preferencia[]>([]);
  const cargando = ref(false);

  const menuLayout = computed(() => preferenciasCargadas.value['MENU_LAYOUT'] || 'horizontal');
  const themeColor = computed(() => preferenciasCargadas.value['THEME_COLOR'] || '#1976D2');
  const busquedaRapidaPropietarioMascota = computed(() => (preferenciasCargadas.value['BUSQUEDA_RAPIDA_PROPIETARIO_MASCOTA'] || 'S') === 'S');

  const aplicarEfectosPreferencias = () => {
    // 1. Aplicar color del tema
    if (themeColor.value) {
      colors.setBrand('primary', themeColor.value);
    }
    // 2. Aplicar menú layout en uiStore
    if (menuLayout.value) {
      uiStore.setMenuType(menuLayout.value as 'horizontal' | 'sidebar');
    }
  };

  const cargarPreferencias = async (idSucursal: number) => {
    if (!idSucursal) return;
    cargando.value = true;
    try {
      const data = await configuracionPreferenciaService.getPreferenciasPorSucursal(idSucursal);
      preferenciasRaw.value = data || [];
      
      const cargadas: Record<string, string> = {};
      SCHEMA_PREFERENCIAS.forEach(schema => {
        const dbItem = preferenciasRaw.value.find(p => p.identificador === schema.identificador);
        cargadas[schema.identificador] = dbItem ? dbItem.valor : schema.valor_defecto;
      });
      preferenciasCargadas.value = cargadas;
      
      aplicarEfectosPreferencias();
    } catch (error) {
      console.error('Error cargando preferencias de sucursal:', error);
    } finally {
      cargando.value = false;
    }
  };

  const guardarPreferencia = async (identificador: string, valor: string, idSucursal: number) => {
    const schema = SCHEMA_PREFERENCIAS.find(s => s.identificador === identificador);
    if (!schema) return;

    const existing = preferenciasRaw.value.find(p => p.identificador === identificador);
    const preferenciaData: Preferencia = {
      id: existing?.id,
      identificador,
      valor,
      id_sucursal: idSucursal,
      tip_dato: schema.tip_dato
    };

    try {
      await configuracionPreferenciaService.guardarPreferencia(preferenciaData);
      await cargarPreferencias(idSucursal);
    } catch (error) {
      console.error(`Error al guardar preferencia ${identificador}:`, error);
      throw error;
    }
  };

  // Reaccionar automáticamente a cambios en la sucursal seleccionada
  watch(() => dialogStore.id_sucursal, (newId) => {
    if (newId) {
      cargarPreferencias(newId);
    }
  }, { immediate: true });

  return {
    preferenciasCargadas,
    preferenciasRaw,
    cargando,
    menuLayout,
    themeColor,
    busquedaRapidaPropietarioMascota,
    cargarPreferencias,
    guardarPreferencia,
    aplicarEfectosPreferencias
  };
}, { persist: true });

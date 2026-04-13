// libs/shared/src/composables/useUbicacion.ts
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import PeticionService from '../../../../apps/neo-vet/src/services/peticion.service';
import { DtoParametros } from '../../../../apps/neo-vet/src/controles/dto.parametros';

// Interfaces (pueden estar en un archivo d.ts compartido)
interface Pais { id?: number; id_configuracion: number; descripcion: string; paridad: string; activo: string; }
interface Estado { id?: number; id_configuracion: number; id_pais: number; descripcion: string; paridad: string; activo: string; }
interface Municipio { id?: number; id_configuracion: number; id_estado: number; descripcion: string; paridad: string; activo: string; }
interface Colonia { id?: number; id_configuracion: number; id_municipio: number; descripcion: string; paridad: string; activo: string; }

// Define un tipo genérico para los formularios para evitar repetición
type UbicacionForm<T extends { id?: number; descripcion: string; paridad: string; activo: string }> = T;


export function useUbicacion() {
  const $q = useQuasar();

  const paises = ref<Pais[]>([]);
  const estados = ref<Estado[]>([]);
  const municipios = ref<Municipio[]>([]);
  const colonias = ref<Colonia[]>([]);

  const selectedPaisId = ref<number | null>(null);
  const selectedEstadoId = ref<number | null>(null);
  const selectedMunicipioId = ref<number | null>(null);

  const loadingPaises = ref(false);
  const loadingEstados = ref(false);
  const loadingMunicipios = ref(false);
  const loadingColonias = ref(false);

  const peticionService = new PeticionService();

  // --- PAÍSES ---
  const fetchPaisesAPI = async () => {
    loadingPaises.value = true;
    try {
      paises.value = await peticionService.obtenerGet('pais'); // Asumiendo que DtoParametros puede llevar 'endPoint'
    } catch (error) {
      console.error("Error fetching paises:", error);
      $q.notify({ type: 'negative', message: 'Error al cargar países.' });
      paises.value = [];
    } finally {
      loadingPaises.value = false;
    }
  };

  const savePaisAPI = async (paisData: UbicacionForm<Pais>) => {
    try {
      if (paisData.id) {
        await peticionService.actualizar('pais', paisData);
      } else {
        await peticionService.crear('pais', paisData);
      }
    } catch (error) {
      console.error("Error saving pais:", error);
      throw error;
    }
  };
  const deletePaisAPI = async (id: number) => {
    try {
      await peticionService.eliminar('pais', { id });
    } catch (error) {
      console.error("Error deleting pais:", error);
      throw error;
    }
  };

  const resetPaisForm = (form: UbicacionForm<Pais>) => {
    form.id = undefined;
    form.id_configuracion = 1;
    form.descripcion = '';
    form.paridad = '';
    form.activo = 'S';
  };

  const editPaisForm = (pais: Pais, form: UbicacionForm<Pais>) => {
    Object.assign(form, pais);
  };


  // --- ESTADOS ---
  const fetchEstadosByPaisAPI = async (paisId: number) => {
    loadingEstados.value = true;
    estados.value = [];
    try {
      const _peticion = new DtoParametros();
      _peticion.filtro = { id_pais: paisId };
      estados.value = await peticionService.obtenerGet('estado', _peticion);
    } catch (error) {
      console.error("Error fetching estados:", error);
      $q.notify({ type: 'negative', message: `Error al cargar estados para el país ID: ${paisId}.` });
    } finally {
      loadingEstados.value = false;
    }
  };

  const saveEstadoAPI = async (estadoData: UbicacionForm<Estado>) => {
    try {
      if (estadoData.id) {
        await peticionService.actualizar('estado', estadoData);
      } else {
        await peticionService.crear('estado', estadoData);
      }
    } catch (error) {
      console.error("Error saving estado:", error);
      throw error;
    }
  };
  const deleteEstadoAPI = async (id: number) => {
    try {
      await peticionService.eliminar('estado', { id });
    } catch (error) {
      console.error("Error deleting estado:", error);
      throw error;
    }
  };

  const resetEstadoForm = (form: UbicacionForm<Estado>) => {
    form.id = undefined;
    // form.id_pais se asigna en el componente antes de guardar
    form.descripcion = '';
    form.paridad = '';
    form.activo = 'S';
    form.id_configuracion = 1;
  };

  const editEstadoForm = (estado: Estado, form: UbicacionForm<Estado>) => {
    Object.assign(form, estado);
  };

  // --- MUNICIPIOS ---
  const fetchMunicipiosByEstadoAPI = async (estadoId: number) => {
    loadingMunicipios.value = true;
    municipios.value = [];
    try {
      const _peticion = new DtoParametros();
      _peticion.filtro = { id_estado: estadoId };
      municipios.value = await peticionService.obtenerGet('municipio', _peticion);
    } catch (error) {
      console.error("Error fetching municipios:", error);
      $q.notify({ type: 'negative', message: `Error al cargar municipios para el estado ID: ${estadoId}.` });
    } finally {
      loadingMunicipios.value = false;
    }
  };

  const saveMunicipioAPI = async (municipioData: UbicacionForm<Municipio>) => {
    try {
      if (municipioData.id) {
        await peticionService.actualizar('municipio', municipioData);
      } else {
        await peticionService.crear('municipio', municipioData);
      }
    } catch (error) {
      console.error("Error saving municipio:", error);
      throw error;
    }
  };
  const deleteMunicipioAPI = async (id: number) => {
    try {
      await peticionService.eliminar('municipio', { id });
    } catch (error) {
      console.error("Error deleting municipio:", error);
      throw error;
    }
  };

  const resetMunicipioForm = (form: UbicacionForm<Municipio>) => {
    form.id = undefined;
    // form.id_estado se asigna en el componente
    form.descripcion = '';
    form.paridad = '';
    form.activo = 'S';
    form.id_configuracion = 1;
  };

  const editMunicipioForm = (municipio: Municipio, form: UbicacionForm<Municipio>) => {
    Object.assign(form, municipio);
  };


  // --- COLONIAS ---
  const fetchColoniasByMunicipioAPI = async (municipioId: number) => {
    loadingColonias.value = true;
    colonias.value = [];
    try {
      const _peticion = new DtoParametros();
      _peticion.filtro = { id_municipio: municipioId };
      colonias.value = await peticionService.obtenerGet('colonia', _peticion);
    } catch (error) {
      console.error("Error fetching colonias:", error);
      $q.notify({ type: 'negative', message: `Error al cargar colonias para el municipio ID: ${municipioId}.` });
    } finally {
      loadingColonias.value = false;
    }
  };

  const saveColoniaAPI = async (coloniaData: UbicacionForm<Colonia>) => {
    try {
      if (coloniaData.id) {
        await peticionService.actualizar('colonia', coloniaData);
      } else {
        await peticionService.crear('colonia', coloniaData);
      }
    } catch (error) {
      console.error("Error saving colonia:", error);
      throw error;
    }
  };
  const deleteColoniaAPI = async (id: number) => {
    try {
      await peticionService.eliminar('colonia', { id });
    } catch (error) {
      console.error("Error deleting colonia:", error);
      throw error;
    }
  };

  const resetColoniaForm = (form: UbicacionForm<Colonia>) => {
    form.id = undefined;
    // form.id_municipio se asigna en el componente
    form.descripcion = '';
    form.paridad = '';
    form.activo = 'S';
    form.id_configuracion = 1;
    //todo: id_configuracion de la sesion
  };

  const editColoniaForm = (colonia: Colonia, form: UbicacionForm<Colonia>) => {
    Object.assign(form, colonia);
  };

  return {
    paises, estados, municipios, colonias,
    selectedPaisId, selectedEstadoId, selectedMunicipioId,
    loadingPaises, loadingEstados, loadingMunicipios, loadingColonias,

    fetchPaisesAPI, savePaisAPI, deletePaisAPI, resetPaisForm, editPaisForm,
    fetchEstadosByPaisAPI, saveEstadoAPI, deleteEstadoAPI, resetEstadoForm, editEstadoForm,
    fetchMunicipiosByEstadoAPI, saveMunicipioAPI, deleteMunicipioAPI, resetMunicipioForm, editMunicipioForm,
    fetchColoniasByMunicipioAPI, saveColoniaAPI, deleteColoniaAPI, resetColoniaForm, editColoniaForm,
  };
}

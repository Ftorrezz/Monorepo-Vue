import { ref, onMounted, watch } from "vue";
import configuracionModulosService from "../services/configuracionModulos.service";
import configuracionParametrosService from "../services/configuracionParametros.service";
import NdAlertasControl from "src/controles/alertas.control";

export default function useConfiguracionParametros() {
    const modulos = ref([]);
    const tablas = ref([]);
    const parametros = ref([]);
    const moduloSeleccionado = ref(null);
    const tablaSeleccionada = ref(null);
    const cargando = ref(false);
    const alertas = new NdAlertasControl();

    const fetchModulos = async () => {
        try {
            cargando.value = true;
            modulos.value = await configuracionModulosService.getModulos();
        } catch (error) {
            console.error("Error al cargar módulos:", error);
        } finally {
            cargando.value = false;
        }
    };

    const fetchTablas = async (moduloId) => {
        try {
            cargando.value = true;
            tablas.value = await configuracionModulosService.getTablasPorModulo(moduloId);
        } catch (error) {
            console.error("Error al cargar tablas:", error);
        } finally {
            cargando.value = false;
        }
    };

    const fetchParametros = async () => {
        if (!moduloSeleccionado.value || !tablaSeleccionada.value) return;
        try {
            cargando.value = true;
            parametros.value = await configuracionParametrosService.getParametros(
                moduloSeleccionado.value.id,
                tablaSeleccionada.value.id
            );
        } catch (error) {
            console.error("Error al cargar parámetros:", error);
        } finally {
            cargando.value = false;
        }
    };

    watch(moduloSeleccionado, (nuevoModulo) => {
        if (nuevoModulo) {
            tablaSeleccionada.value = null;
            fetchTablas(nuevoModulo.id);
        }
    });

    watch(tablaSeleccionada, (nuevaTabla) => {
        if (nuevaTabla) {
            fetchParametros();
        } else {
            parametros.value = [];
        }
    });

    onMounted(() => {
        fetchModulos();
    });

    const guardarParametro = async (item) => {
        try {
            const data = {
                ...item,
                id_modulo: moduloSeleccionado.value.id,
                id_tabla: tablaSeleccionada.value.id
            };

            let res;
            if (data.id) {
                res = await configuracionParametrosService.actualizarParametro(data);
            } else {
                res = await configuracionParametrosService.crearParametro(data);
            }

            if (!res.status) {
                await fetchParametros();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error al guardar parámetro:", error);
            return false;
        }
    };

    const eliminarParametro = async (item) => {
        try {
            const res = await configuracionParametrosService.eliminarParametro(item);
            if (res) {
                await fetchParametros();
            }
        } catch (error) {
            console.error("Error al eliminar parámetro:", error);
        }
    };

    return {
        modulos,
        tablas,
        parametros,
        moduloSeleccionado,
        tablaSeleccionada,
        cargando,
        fetchParametros,
        guardarParametro,
        eliminarParametro
    };
}

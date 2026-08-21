import NdPeticionControl from '../controles/rest.control';
import { useQuasar } from 'quasar';

export function useReportes() {
    const $q = useQuasar();

    const _peticion = new NdPeticionControl();

    const _solicitarReporteBlob = async (endpoint, payload) => {
        const response = await _peticion.invocarMetodo(endpoint, 'post', payload, undefined, [], { responseType: 'blob' });
        return response?.data ?? response;
    };

    const _manejarBlobVentana = (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    };

    const imprimirPlantilla = async (id_plantilla, variables = {}) => {
        try {
            $q.loading.show({ message: 'Generando documento PDF en servidor...' });

            const data = await _solicitarReporteBlob('reporte/plantilla', { id_plantilla, variables });
            _manejarBlobVentana(data);
            return true;
        } catch (error) {
            console.error('Error generando documento:', error);
            $q.notify({ type: 'negative', message: 'Error al generar documento PDF' });
            return false;
        } finally {
            $q.loading.hide();
        }
    };

    const imprimirVacunacion = async (datosVacunacion) => {
        try {
            $q.loading.show({ message: 'Generando certificado de vacunación...' });

            const data = await _solicitarReporteBlob('reporte/vacunacion', datosVacunacion);
            _manejarBlobVentana(data);
            return true;
        } catch (error) {
            console.error('Error generando certificado:', error);
            $q.notify({ type: 'negative', message: 'Error al generar certificado de vacunación' });
            return false;
        } finally {
            $q.loading.hide();
        }
    };

    const imprimirConsulta = async (datosConsulta) => {
        try {
            $q.loading.show({ message: 'Generando reporte de consulta...' });

            const data = await _solicitarReporteBlob('reporte/consulta', datosConsulta);
            _manejarBlobVentana(data);
            return true;
        } catch (error) {
            console.error('Error generando reporte de consulta:', error);
            $q.notify({ type: 'negative', message: 'Error al generar reporte de consulta' });
            return false;
        } finally {
            $q.loading.hide();
        }
    };

    return {
        imprimirPlantilla,
        imprimirVacunacion,
        imprimirConsulta
    };
}

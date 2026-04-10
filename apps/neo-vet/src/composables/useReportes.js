import Api from '../controles/api';
import { useQuasar } from 'quasar';

export function useReportes() {
    const $q = useQuasar();

    const _manejarBlobVentana = (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        window.open(url, '_blank');
        // Revoke URL after a short delay since it's already opened
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    };

    const imprimirPlantilla = async (id_plantilla, variables = {}) => {
        try {
            $q.loading.show({ message: 'Generando documento PDF en servidor...' });

            const response = await Api.post('/reporte/plantilla',
                { id_plantilla, variables },
                { responseType: 'blob' }
            );

            _manejarBlobVentana(response.data);
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

            const response = await Api.post('/reporte/vacunacion',
                datosVacunacion,
                { responseType: 'blob' }
            );

            _manejarBlobVentana(response.data);
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

            const response = await Api.post('/reporte/consulta',
                datosConsulta,
                { responseType: 'blob' }
            );

            _manejarBlobVentana(response.data);
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

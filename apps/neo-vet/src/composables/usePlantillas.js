import { ref } from 'vue'
import { plantillaService } from 'src/services/plantilla.service'
import { usePDFGenerator } from './usePDFGenerator'
import { useI18n } from 'vue-i18n'

export function usePlantillas() {
    const { t } = useI18n()
    const plantillas = ref([])
    const plantillaActual = ref(null)
    const loading = ref(false)

    const { descargarPDF, imprimirPDF } = usePDFGenerator()

    const cargarPlantillasPorModulo = async (modulo) => {
        loading.value = true
        try {
            plantillas.value = await plantillaService.getPlantillasPorModulo(modulo)
        } finally {
            loading.value = false
        }
    }

    const procesarPlantilla = (plantilla, variables) => {
        let contenido = plantilla.contenido_html

        // Reemplazar variables {{variable}}
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g')
            contenido = contenido.replace(regex, value || '')
        })

        // Procesar i18n $t('...') si existe en el HTML
        const i18nRegex = /\{\{\s*\$t\(['"](.+?)['"]\)\s*\}\}/g
        contenido = contenido.replace(i18nRegex, (match, key) => {
            return t(key)
        })

        return contenido
    }

    const generarCertificado = async (codigoPlantilla, variables, opciones = {}) => {
        loading.value = true
        try {
            // Cargar plantilla
            const plantilla = await plantillaService.getPlantillaPorCodigo(codigoPlantilla)
            if (!plantilla) throw new Error(`Plantilla ${codigoPlantilla} no encontrada`)

            // Procesar contenido
            const contenidoProcesado = procesarPlantilla(plantilla, variables)

            // Crear elemento temporal
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = contenidoProcesado
            tempDiv.style.position = 'absolute'
            tempDiv.style.left = '-9999px'
            tempDiv.style.width = '210mm'
            tempDiv.style.minHeight = '297mm'
            tempDiv.style.padding = '20mm'
            tempDiv.style.backgroundColor = 'white'
            document.body.appendChild(tempDiv)

            // Generar PDF
            await descargarPDF(tempDiv, {
                nombreArchivo: opciones.nombreArchivo || `${plantilla.codigo}.pdf`,
                orientacion: plantilla.orientacion,
                tamanoPapel: plantilla.tamano_papel,
                incluirFirma: plantilla.requiere_firma === 'S',
                firmaBase64: variables.firma
            })

            // Limpiar
            document.body.removeChild(tempDiv)
        } finally {
            loading.value = false
        }
    }

    return {
        plantillas,
        plantillaActual,
        loading,
        cargarPlantillasPorModulo,
        procesarPlantilla,
        generarCertificado
    }
}

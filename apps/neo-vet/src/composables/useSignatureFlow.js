import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { usePlantillas } from './usePlantillas'
import Api from 'src/controles/api'
import { useDialogStore } from 'src/stores/DialogoUbicacion'

export function useSignatureFlow(options = {}) {
    const $q = useQuasar()
    const { cargarPlantillaPorId, procesarHtml, generarPDF } = usePlantillas()
    const store = useDialogStore()

    // Callback para cuando se guarda exitosamente
    const onSaved = options.onSaved || (() => { })

    const showFirmaDialog = ref(false)
    const datosFirma = reactive({
        htmlContent: '',
        documentName: '',
        servicio: null,
        atencionId: null
    })

    const visualizarYFirmar = async (servicio, atencion, paciente, idPlantillaManual = null) => {
        let idPlantilla = idPlantillaManual || servicio.id_plantilla || (servicio.plantillas_servicio?.length > 0 ? servicio.plantillas_servicio[0].id_plantilla : null)

        if (!idPlantilla) {
            $q.notify({ type: 'warning', message: 'Este servicio no tiene una plantilla asociada para firmar' })
            return
        }

        try {
            $q.loading.show({ message: 'Preparando previsualización...' })

            const plantilla = await cargarPlantillaPorId(idPlantilla)
            if (!plantilla) throw new Error('No se pudo cargar la plantilla')

            const datosVariables = {
                ...servicio.datos,
                paciente_nombre: paciente?.nombre || '',
                propietario_nombre: paciente?.propietario?.nombre || '',
                fecha_atencion: atencion.fecha || '',
                atencion_numero: atencion.numero || ''
            }

            datosFirma.htmlContent = procesarHtml(plantilla, datosVariables)
            datosFirma.documentName = `Firma_${(servicio.nombre || 'Servicio').replace(/\s+/g, '_')}_${atencion.numero || 'S-N'}`
            datosFirma.servicio = servicio
            datosFirma.atencionId = atencion.id

            showFirmaDialog.value = true
        } catch (error) {
            console.error('Error al preparar firma:', error)
            $q.notify({ type: 'negative', message: 'Error al preparar el documento para firma' })
        } finally {
            $q.loading.hide()
        }
    }

    const procesarGuardadoFirma = async (payload) => {
        const { signatureBase64, htmlElement, name } = payload

        try {
            $q.loading.show({ message: 'Generando PDF firmado y guardando...' })

            // 1. Generar el PDF client-side con la firma
            const pdfInstance = await generarPDF(htmlElement, {
                nombreArchivo: `${name}.pdf`,
                incluirFirma: true,
                firmaBase64: signatureBase64
            })

            const pdfBlob = pdfInstance.output('blob')
            const pdfFile = new File([pdfBlob], `${name}.pdf`, { type: 'application/pdf' })

            // 2. Subir a Cloudinary vía Backend
            const formData = new FormData()
            formData.append('file', pdfFile)
            formData.append('idAtencionServicio', datosFirma.servicio.idBD)

            const headers = {
                'Content-Type': 'multipart/form-data',
                'idsitio': store.id_sitio,
                'idsucursal': store.id_sucursal
            }

            const response = await Api.post('/cloudinary/upload', formData, { headers })

            if (response.data) {
                const nuevoAdjunto = {
                    nombre: response.data.nombre_original || `${name}.pdf`,
                    url: response.data.url,
                    tipo: 'raw',
                    public_id: response.data.public_id
                }

                // Notificar éxito y ejecutar callback
                showFirmaDialog.value = false
                $q.notify({
                    type: 'positive',
                    message: 'Documento firmado y guardado exitosamente',
                    icon: 'cloud_done'
                })

                onSaved(nuevoAdjunto, datosFirma.servicio)
            }
        } catch (error) {
            console.error('Error al guardar documento firmado:', error)
            $q.notify({ type: 'negative', message: 'Error al subir el documento firmado' })
        } finally {
            $q.loading.hide()
        }
    }

    return {
        showFirmaDialog,
        datosFirma,
        visualizarYFirmar,
        procesarGuardadoFirma
    }
}

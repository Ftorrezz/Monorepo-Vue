import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export function usePDFGenerator() {
    const generarPDF = async (elementoHTML, opciones = {}) => {
        const {
            nombreArchivo = 'documento.pdf',
            orientacion = 'portrait',
            tamanoPapel = 'a4',
            incluirFirma = false,
            firmaBase64 = null
        } = opciones

        // Capturar el HTML como imagen
        const canvas = await html2canvas(elementoHTML, {
            scale: 2,
            useCORS: true,
            logging: false
        })

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF(orientacion, 'mm', tamanoPapel)

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Agregar firma si es necesario
        if (incluirFirma && firmaBase64) {
            const firmaY = pdfHeight - 40
            pdf.addImage(firmaBase64, 'PNG', pdfWidth - 60, firmaY, 50, 20)
        }

        return pdf
    }

    const descargarPDF = async (elementoHTML, opciones = {}) => {
        const pdf = await generarPDF(elementoHTML, opciones)
        pdf.save(opciones.nombreArchivo || 'documento.pdf')
    }

    const imprimirPDF = async (elementoHTML, opciones = {}) => {
        const pdf = await generarPDF(elementoHTML, opciones)
        pdf.autoPrint()
        window.open(pdf.output('bloburl'), '_blank')
    }

    return {
        generarPDF,
        descargarPDF,
        imprimirPDF
    }
}

import Swal from 'sweetalert2'
import { Notify, Dialog } from 'quasar'

class NdAlertasControl {

    public mostrarMensaje(tipo: string, titulo: string, mensaje: string): void{

        switch (tipo.toLowerCase()) {
            case 'informacion': {
                this.mostrarNotificacion('info', titulo, mensaje)
                break
            }
            case 'error': {

                this.mostrarNotificacion('negative', titulo, mensaje)
                break;
            }
            case 'advertencia': {
                this.mostrarNotificacion('warning', titulo, mensaje)
                break;
            }
            case 'verificacion': {
                this.mostrarNotificacion('positive', titulo, mensaje)
                break;
            }
        }

    }

    private mostrarNotificacion(type: string, titulo: string, mensaje: string){
        Notify.create({ type, message: titulo, caption: mensaje, position: 'bottom-right'})
    }

    public mostrarConfirmacionEliminacion(mensaje: any = 'el registro', modelo: any): any {

        // Obtener el identificador del modelo (descripción o nombre)
        const identificador = modelo.descripcion || modelo.nombre || '';

        return new Promise((resolve, reject) => {

            Dialog.create({

                title: `¿ Confirma el borrado ${mensaje} ${identificador} ?`,
                message: 'Esta operación no se puede revertir.',
                cancel: {
                    label: 'Cancelar',
                    color: 'negative',
                    unelevated: true,
                    noCaps: true,
                    outline: false,
                    padding: "xs lg",
                    size: "18px"
                },
                ok: {
                    label: 'Si, borrarlo',
                    color: 'green-8',
                    unelevated: true,
                    noCaps: true,
                    outline: false,
                    padding: "xs lg",
                    size: "14px",

                },
                //class: 'dialog-custom-width',
                style: {
                    width: '600px',  // Aquí puedes especificar el ancho deseado
                    maxWidth: '90vw' // Esto es opcional, pero asegura que el diálogo no exceda el 90% del ancho de la ventana
                  }


            })
            .onOk(() => {
                resolve(true); // Resolves with true if user clicks 'Si, borrarlo'
            })
            .onCancel(() => {
                resolve(false); // Resolves with false if user clicks 'Cancelar'
            });
        });
    }
    /*public mostrarConfirmacionEliminacion(mensaje: any = ' el registro'): any {
        return Swal.fire({
            title: '¿ Confirma borrado del registro ?',
            text: 'Esta operación no se puede revertir.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Si, borrarlo!',
            cancelButtonText: 'Cancelar',

        });
    }*/

    public mostrarConfirmacionEliminacionLogica(mensaje: any = ' el registro'): any {
        return Swal.fire({
            title: '¿ Confirma Eliminación ?',
            text: 'Confirma la inactivación del registro',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Si, inactivar!',
            cancelButtonText: 'Cancelar',

        });
    }

    public mostrarConfirmacion(mensaje: string = ''): any {
        return Swal.fire({
            title: 'Esta seguro?',
            text: mensaje,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Si, hazlo!',
            cancelButtonText: 'Cancelar'
        });
    }

    public mostrarMensajeModal(mensaje: string = ''): any {
        return Swal.fire({
            title: 'Información',
            text: mensaje,
            icon: 'info',
            showCancelButton: false,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Ok',
        });
    }
}

export default NdAlertasControl;

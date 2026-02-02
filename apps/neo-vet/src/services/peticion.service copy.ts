import NdPeticionControl from '../controles/rest.control';
import DtoParametros from '../controles/dto.parametros';
import NdAlertasControl from '../controles/alertas.control';

class PeticionService {

  constructor() { }



  /*obtener(unDtoParametros?: DtoParametros) {
    if (this.endPoint !== '') {
      return peticion.invocarMetodo(this.endPoint, 'post', null, unDtoParametros);
    } else {
      return Promise.reject(new Error('Error: El endpoint no puede ser vacío.'));
    }
  }*/

  obtenerGet(endPoint: string, unDtoParametros?: DtoParametros) {

    let peticion = new NdPeticionControl();

    return peticion.invocarMetodo(endPoint, 'get', unDtoParametros);

  }

  crear(endPoint: string, unModelo: any) {

    let peticion = new NdPeticionControl();
    if (endPoint !== '') {
      return peticion.invocarMetodo(endPoint, 'post', unModelo);
    } else {
      return Promise.reject(new Error('Error: El endpoint no puede ser vacío.'));
    }
  }

  actualizar(endPoint: string, unModelo: any) {

    let peticion = new NdPeticionControl();

    if (endPoint !== '') {
      return peticion.invocarMetodo(endPoint, 'put', unModelo);
    } else {
      return Promise.reject(new Error('Error: El endpoint no puede ser vacío.'));
    }
  }

  eliminar(endPoint: string, modelo: any, consultar = false, mensaje: string = '') {

    if (endPoint !== '') {

      let peticion = new NdPeticionControl();
      let alerta = new NdAlertasControl();

      if (consultar) {
        return alerta.mostrarConfirmacionEliminacion(mensaje, modelo)
          .then((respuesta: any) => {

            if (respuesta == true) {
              return peticion.invocarMetodo(endPoint, 'delete', modelo);
            } else {
              return false;
            }
          });
      } else {
        return peticion.invocarMetodo('delete', modelo);
      }

    }
    else return throwError(() => new Error('Error: El endpoint no puede ser vacío.'));

  }

  eliminarLogico(endPoint: string, modelo: any, consultar = false) {

    if (endPoint !== '') {

      let peticion = new NdPeticionControl();
      let alerta = new NdAlertasControl();

      if (consultar) {
        return alerta.mostrarConfirmacionEliminacionLogica()
          .then((respuesta: any) => {
            if (respuesta.isConfirmed) {
              return peticion.invocarMetodo(endPoint, 'delete', modelo);
            } else {
              return false;
            }
          });
      } else {
        return peticion.invocarMetodo('delete', modelo);
      }
    }
    else return throwError(() => new Error('Error: El endpoint no puede ser vacío.'));

  }
}

export default PeticionService;

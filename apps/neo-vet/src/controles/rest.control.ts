
import { DtParametrosReporte, DtoParametros } from "./dto.parametros";
import Api from './api';
import axios, { AxiosResponse } from 'axios';
import NdAlertasControl from "./alertas.control";
import { Router } from "vue-router";

/*Clase para persistencia de los resultados del rest*/
interface Mensaje {
  origen: string;
  mensaje: string;
}
interface Result {
  errores: Mensaje[];
  mensajes: Mensaje[];
  respuesta: object[];
}
//Clase donde se guarda la respuesta del rest
interface Respuesta {
  result: Result[];
  // headers: any;
}

class NdPeticionControl {

  constructor() { }

  public async invocarMetodo(nombreMetodo: string, verbo: string, modelo?: any, parametros?: DtoParametros, atributos?: string[]) {

    let _urlEndPoint = '/' + nombreMetodo;
    // this.infoRequestService.agregarMensaje(_urlEndPoint); // Ajusta esto según tus necesidades

    let headers = {
      'Content-Type': 'application/json',
      'idsitio': 1,
      'offset': '0'
    };

    if (!atributos) atributos = [];

    let payload: any;

    parametros ? payload = JSON.stringify(this.prepararParametros(parametros)) : payload = JSON.stringify(modelo);

    let parametrosUrl = '';
    let dtoParametro: DtoParametros = new DtoParametros();

    switch (verbo) {
      case "get": {
        if (parametros && parametros.filtro) {
          dtoParametro.filtro = parametros.filtro;

          if (parametros.atributos) {
            dtoParametro.atributos = parametros.atributos;
          }
          parametrosUrl = 'filtro/' + JSON.stringify(dtoParametro);
        }
        else {
          if (parametros && parametros.id) {
            parametrosUrl = 'id=' + parametros.id;
          }
        }

        if (parametrosUrl !== '') {
          _urlEndPoint = _urlEndPoint + '/' + parametrosUrl;
        }

        return await Api.get(_urlEndPoint, { headers, withCredentials: false }).then((response: AxiosResponse) => {
          return this.procesarRespuesta(response, _urlEndPoint);
        }).catch((error: any) => {
          return this.procesarRespuestaError(error, _urlEndPoint);
        });
      }
      case "put": {
        _urlEndPoint = _urlEndPoint + '/' + modelo.id;

        return Api.put(_urlEndPoint, payload, { headers, withCredentials: false }).then((response: AxiosResponse) => {
          return this.procesarRespuesta(response, _urlEndPoint);
        }).catch((error: any) => {
          return this.procesarRespuestaError(error, _urlEndPoint);
        });
      }
      case "post": {
        if (parametros) _urlEndPoint = _urlEndPoint + '/filtro';

        return await Api.post(_urlEndPoint, payload, { headers, withCredentials: false }).then((response: AxiosResponse) => {
          return this.procesarRespuesta(response, _urlEndPoint);
        }).catch((error: any) => {
          return this.procesarRespuestaError(error, _urlEndPoint);
        });
      }
      case "delete": {
        _urlEndPoint = _urlEndPoint + '/' + modelo.id;

        return Api.delete(_urlEndPoint, { headers, withCredentials: false }).then((response: AxiosResponse) => {
          return this.procesarRespuesta(response, _urlEndPoint);
        }).catch((error: any) => {
          return this.procesarRespuestaError(error, _urlEndPoint);
        });
      }
      default: {
        return Promise.reject(new TypeError("Error: Acción invalida, se recibió: " + verbo));
      }
    }

  }

  public invocarMetodoReporte(parametros?: DtParametrosReporte) {
    //let _urlEndPoint = this.configuracionBasica.urlservicioimpresion;


  };

  private prepararParametros(parametros: any): Object {
    if (!parametros) parametros = '';
    return { 'filtro': parametros.filtro, 'atributos': parametros.atributos };
  }

  private procesarRespuestaError(error: any, _urlEndPoint: string): any {
    let alertas = new NdAlertasControl;
    // esto mmsg se puede especificar desdeel lado server
    if (error.status == 401) {
      //this.router.push({ path: '/login' });
      alertas.mostrarMensaje('error', 'Error en la solicitud', 'Usuario no autorizado.');
    }
    else {

      /*if (error && error.error[0] && error.error[0].mensajes[0].mensaje > ''){

        alertas.mostrarMensaje(error.error[0].mensajes[0].tipomensaje, error.error[0].mensajes[0].titulo, error.error[0].mensajes[0].mensaje);

      }

      else if (error && error.message) alertas.mostrarMensaje('error', 'Error en la solicitud: ' + error.statusText + ' (Código: ' + error.status + ')', error.message);
      */
      let tipoMensaje = '';
      let titulo = '';
      let mensaje = '';

      if (error?.error?.[0]?.mensajes?.[0]?.mensaje) {
        tipoMensaje = error.error[0].mensajes[0].tipomensaje;
        titulo = error.error[0].mensajes[0].titulo;
        mensaje = error.error[0].mensajes[0].mensaje;
      } else if (error?.response?.data[0]?.mensajes?.[0]?.mensaje) {
        tipoMensaje = error.response.data[0].mensajes[0].tipomensaje;
        titulo = error.response.data[0].mensajes[0].titulo;
        mensaje = error.response.data[0].mensajes[0].mensaje;
      } else {
        tipoMensaje = 'error';
        titulo = 'Error en la solicitud: ' + error.statusText + ' (Código: ' + error.status + ')'
        mensaje = error.message;
      }

      alertas.mostrarMensaje(tipoMensaje, titulo, mensaje);
    }

    //this.infoRequestService.eliminarMensaje(_urlEndPoint);
    //return throwError(() => error);
    return error;
  }

  public procesarRespuesta(respuesta: any, _urlEndPoint: string): Respuesta {
    //this.infoRequestService.eliminarMensaje(_urlEndPoint);
    respuesta = <Respuesta>respuesta.data[0];
    let alertas = new NdAlertasControl;

    if (respuesta !== null) {

      for (let i = 0; i < respuesta.errores.length; i++) {
        alertas.mostrarMensaje('error', 'Error', respuesta.errores[i].mensaje);
      }

      for (let i = 0; i < respuesta.mensajes.length; i++) {
        alertas.mostrarMensaje(respuesta.mensajes[i].tipomensaje, 'Verificación', respuesta.mensajes[i].mensaje);
      }

      return respuesta.elemento;
    }
    else return { result: [] };
  };

}

export default NdPeticionControl;

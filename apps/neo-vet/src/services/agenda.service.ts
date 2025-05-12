generarAgenda(fechaInicio, fechaFin, idSucursal, idSitio, idServicio = null) {
    const params = {
      fechaInicio,
      fechaFin,
      idSucursal,
      idSitio
    };
    
    // Solo incluir idServicio si no es nulo
    if (idServicio !== null) {
      params.idServicio = idServicio;
    }
    
    return api.get('/neo-vet/agenda/generar', { params });
  }


  import { api } from 'boot/axios';

export default {
  obtenerSucursales() {
    return api.get('/neo-auth/sucursal');
  }
};

import { api } from 'boot/axios';

export default {
  obtenerServicios(idSitio) {
    return api.get('/neo-vet/servicio', {
      params: { idSitio }
    });
  }
};
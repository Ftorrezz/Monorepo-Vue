export const reportesConfig = [
  {
    IDENTIFICADOR: 'rep_movimientosgeneral',
    TITULO: 'Movimientos General',
    DESCRIPCION: 'Reporte general de los movimientos realizados, filtrado por los criterios mas comunes.',
    CATEGORIA: 'Operativos',
    FILTROS: [
      { id: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', value: null },
      { id: 'fecha_fin', label: 'Fecha de Fin', type: 'date', value: null },
      {
        id: 'id_sucursal',
        label: 'Sucursal',
        type: 'select',
        options: [ // En un caso real, estas opciones vendrían de una API
          { label: 'Todas', value: 0 },
          { label: 'Sucursal Centro', value: 1 },
          { label: 'Sucursal Norte', value: 2 }
        ],
        value: 0
      }
    ]
  },
  {
    IDENTIFICADOR: 'rep_rendimientomodulo',
    TITULO: 'Rendimiento de Módulos',
    DESCRIPCION: 'Reporte sobre el rendimiento de los módulos de atención.',
    CATEGORIA: 'Rendimiento',
    FILTROS: [
      { id: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', value: null },
      { id: 'fecha_fin', label: 'Fecha de Fin', type: 'date', value: null },
    ]
  },
  {
    IDENTIFICADOR: 'rep_rendimientopersonal',
    TITULO: 'Rendimiento del Personal',
    DESCRIPCION: 'Reporte sobre el rendimiento del personal que atiende.',
    CATEGORIA: 'Rendimiento',
    FILTROS: [
      { id: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', value: null },
      { id: 'fecha_fin', label: 'Fecha de Fin', type: 'date', value: null },
      { id: 'id_usuario', label: 'Usuario Específico (Opcional)', type: 'text', value: '' }
    ]
  },
  {
    IDENTIFICADOR: 'rep_satisfaccion',
    TITULO: 'Niveles de Satisfacción',
    DESCRIPCION: 'Reporte que indica los niveles de satisfacción del cliente.',
    CATEGORIA: 'Calidad de Servicio',
    FILTROS: [
      { id: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', value: null },
      { id: 'fecha_fin', label: 'Fecha de Fin', type: 'date', value: null }
    ]
  },
  {
    IDENTIFICADOR: 'rep_afluenciapersonas',
    TITULO: 'Afluencia de Personas',
    DESCRIPCION: 'Reporte que indica la afluencia de personas en el servicio.',
    CATEGORIA: 'Operativos',
    FILTROS: [
      { id: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date', value: null },
      { id: 'fecha_fin', label: 'Fecha de Fin', type: 'date', value: null }
    ]
  }
];
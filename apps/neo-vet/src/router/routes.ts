import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [
      { path: '',
        name: 'inicio',
        component: () => import('pages/Index.vue'),
        meta: { requireAuth: true } },

      { path: '/color',
        name: 'color',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/color.vue'),
        meta: { requireAuth: false },

      },
      { path: '/sexo',
        name: 'sexo',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/sexo.vue'),
        meta: { requireAuth: false },

      },
      { path: '/habitat',
        name: 'habitat',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/habitat.vue'),
        meta: { requireAuth: false },

      },
      { path: '/especie',
        name: 'especie',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/especie.vue'),
        meta: { requireAuth: false },

      },
      { path: '/razamascota',
        name: 'razamascota',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/raza.vue'),
        meta: { requireAuth: false },

      },
      { path: '/caracter',
        name: 'caracter',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/caracter.vue'),
        meta: { requireAuth: false },

      },
      { path: '/dieta',
        name: 'dieta',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/dieta.vue'),
        meta: { requireAuth: false },

      },
      { path: '/diagnostico',
        name: 'diagnostico',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/diagnostico.vue'),
        meta: { requireAuth: false },

      },
      { path: '/especialidad',
        name: 'especialidad',
        component: () => import('../../../neo-vet/src/pages/configuration/mascota/especialidad.vue'),
        meta: { requireAuth: false },

      },
      { path: '/escolaridad',
        name: 'escolaridad',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/escolaridad.vue'),
        meta: { requireAuth: false },

      },
      { path: '/estadocivil',
        name: 'estadocivil',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/estadocivil.vue'),
        meta: { requireAuth: false },
      },
      { path: '/ocupacion',
        name: 'ocupacion',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/ocupacion.vue'),
        meta: { requireAuth: false },
      },
      { path: '/raza',
        name: 'raza',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/raza.vue'),
        meta: { requireAuth: false },
      },
      { path: '/religion',
        name: 'religion',
        component: () => import('../../../neo-vet/src/pages/configuration/propietario/religion.vue'),
        meta: { requireAuth: false },
      },
      { path: '/ubicacion',
        name: 'ubicacion',
        component: () => import('pages/configuration/general/ubicacion.vue'),
        meta: { requireAuth: false },
      },
      { path: '/servicio',
        name: 'servicio',
        component: () => import('pages/configuration/general/servicio.vue'),
        meta: { requireAuth: false },
      },
      { path: '/tipoprofesional',
        name: 'tipoprofesional',
        component: () => import('pages/configuration/general/tipoprofesional.vue'),
        meta: { requireAuth: false },
      },
      { path: '/templatemanager',
        name: 'templatemanager',
        component: () => import('pages/configuration/template/TemplateManager.vue'),
        meta: { requireAuth: false },
      }

    ],
    //meta: { requireAuth: true },

  },

      { path: '/propietariomascota',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'busquedapropietariomascota', component: () => import('pages/busqueda/BusquedaPropietarioMascota.vue') }],
        meta: { requireAuth: false },

      },

      { path: '/agenda',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'agenda', component: () => import('pages/agenda/Agenda.vue') }],
        meta: { requireAuth: false },

      },
      { path: '/reportes',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'reportes', component: () => import('pages/ReportesPage.vue') }],
        meta: { requireAuth: false },

      },
      { path: '/atencionpaciente',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'atencionpaciente', component: () => import('pages/AtencionPaciente.vue') }],
        meta: { requireAuth: false },

      },
      { path: '/inventario',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'inventario', component: () => import('pages/inventario/inventario.vue') }],
        meta: { requireAuth: false },

      },
      { path: '/ventas',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'ventas', component: () => import('pages/ventas/Ventas.vue') }],
        meta: { requireAuth: false },

      },
      { path: '/pension',
        component: () => import('layouts/Layout.vue'),
        children: [{ path: '', name: 'pension', component: () => import('pages/pension/Pension.vue') }],
        meta: { requireAuth: false },

      },

  {
    path: '/login',
    name: 'login',
    component: () => import('pages/Usuario/Login.vue'),
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },



];

export default routes;

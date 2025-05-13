import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [
      { path: '',
        name: 'inicio',
        component: () => import('pages/Index.vue'),
        meta: { requireAuth: false } },

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

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },



];

export default routes;

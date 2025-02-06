import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/Layout.vue'),
    children: [{ path: '', name: 'inicio', component: () => import('pages/Index.vue') }],
    meta: { requireAuth: true },

  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
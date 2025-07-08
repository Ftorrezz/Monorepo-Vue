import { useQuasar } from 'quasar';

export function useLoading() {
  const $q = useQuasar();

  const showLoading = () => {
    $q.loading.show({
      message: 'Cargando datos...',
      boxClass: 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary',
      spinnerSize: 80,
      customClass: 'loading-spinner-overlay'
    });
  };

  const hideLoading = () => {
    $q.loading.hide();
  };

  return {
    showLoading,
    hideLoading
  };
} 
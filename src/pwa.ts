import { registerSW } from 'virtual:pwa-register';

export const initPwa = () => {
  if (!import.meta.env.PROD) return;

  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('[PWA] App is ready to work offline.');
    },
    onNeedRefresh() {
      console.info('[PWA] New content available. Refresh to update.');
    },
  });
};

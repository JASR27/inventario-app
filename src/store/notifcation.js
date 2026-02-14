import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const isOpen = ref(false);
  const title = ref('');
  const message = ref('');

  function notify(nuevoTitulo, nuevoMensaje) {
    title.value = nuevoTitulo;
    message.value = nuevoMensaje;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return { isOpen, title, message, notify, close };
});
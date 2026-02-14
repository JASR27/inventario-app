<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header" :class="type">
          {{ title }}
        </div>
        <div class="modal-body">
          {{ message }}
        </div>
        <div class="modal-footer">
          <button class="btn-modal" @click="close">Aceptar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

// Estado interno
const isOpen = ref(false)
const title = ref('')
const message = ref('')
const type = ref('info') // 'success', 'error', 'info'

// Función que expondremos
const show = (opts) => {
  title.value = opts.title || 'Notificación'
  message.value = opts.message || ''
  type.value = opts.type || 'info'
  isOpen.value = true
}

const close = () => { isOpen.value = false }

// Exponemos la función para que el padre la use
defineExpose({ show })
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); display: flex; align-items: center;
  justify-content: center; z-index: 9999;
}
.modal-content {
  background: white; border-radius: 12px; width: 90%; max-width: 400px;
  overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.modal-header {
  padding: 1rem; color: white; font-weight: bold; text-align: center;
}
.modal-header.success { background-color: #15803d; }
.modal-header.error { background-color: #b91c1c; }
.modal-header.info { background-color: #f97316; } /* Naranja */

.modal-body { padding: 1.5rem; text-align: center; color: #431407; }
.modal-footer { padding: 1rem; display: flex; justify-content: center; }

.btn-modal {
  background: #f97316; color: white; border: none; padding: 0.6rem 2rem;
  border-radius: 6px; cursor: pointer; font-weight: bold;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
<template>
  <div 
    class="notification-overlay" 
    v-if="store.notifications.length > 0"
    @click.self="closeCurrent"
  >
    <Transition name="modal-bounce" mode="out-in">
      <div 
        :key="store.notifications[0].id" 
        class="modal-card"
        :class="store.notifications[0].type"
      >
        <div class="modal-header-accent">
          <h2 class="modal-header-title">{{ store.notifications[0].title }}</h2>
        </div>
        
        <div class="modal-content">
          <div class="modal-body">
            <p class="message-container">
              <span :class="['type-label', store.notifications[0].type]">
                {{ labels[store.notifications[0].type] || 'Aviso' }}:
              </span> 
              {{ store.notifications[0].message }}
            </p>
          </div>
          
          <div class="modal-footer">
            <button @click="closeCurrent" class="btn-confirm">
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useNotificationStore } from '../../store/useNotificationStore.js';
import { onMounted, onUnmounted } from 'vue';

const store = useNotificationStore();

const labels = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Advertencia',
  info: 'Información'
};

// Función centralizada para cerrar la notificación actual
const closeCurrent = () => {
  if (store.notifications.length > 0) {
    store.removeNotification(store.notifications[0].id);
  }
};

// Cerrar con tecla Escape
const handleEsc = (e) => {
  if (e.key === 'Escape') closeCurrent();
};

onMounted(() => window.addEventListener('keydown', handleEsc));
onUnmounted(() => window.removeEventListener('keydown', handleEsc));
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  cursor: pointer; /* Indica que el fondo es interactivo */
}

.modal-card {
  background: #ffffff;
  width: 92%;
  max-width: 400px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
  cursor: default; /* El cursor vuelve a la normalidad sobre el contenido */
}

.modal-header-accent {
  padding: 20px 24px 10px 24px;
  display: flex;
  justify-content: center;
}

/* Colores de fondo dinámicos */
.success .modal-header-accent { background-color: #10b981; }
.error .modal-header-accent   { background-color: #ef4444; }
.warning .modal-header-accent { background-color: #f59e0b; }
.info .modal-header-accent    { background-color: #3b82f6; }

.modal-header-title {
  margin: 0;
  background: white;
  padding: 8px 20px;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 60%;
  text-align: center;
}

.modal-content {
  padding: 20px 24px 24px 24px;
}

.modal-body {
  margin-bottom: 24px;
  text-align: center;
}

.message-container {
  font-size: 1rem;
  line-height: 1.5;
  color: #4b5563;
}

.type-label {
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-right: 4px;
}

.success .type-label { color: #059669; }
.error .type-label   { color: #dc2626; }
.warning .type-label { color: #d97706; }

.modal-footer {
  display: flex;
  justify-content: center;
}

.btn-confirm {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 12px 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.btn-confirm:hover {
  background-color: #e5e7eb;
  color: #111827;
}

/* Animaciones */
.modal-bounce-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.modal-bounce-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.modal-bounce-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
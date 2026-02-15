<template>
  <div class="modal-panel">
    <h2>Agregar pago</h2>

    <div class="form-column">
      <div class="form-group amount-group">
        <label for="amount">Monto</label>
        <div class="input-with-label">
          <input 
            ref="inputMonto"
            id="amount" 
            type="text" 
            :value="formattedAmount"
            @input="handleInput"
            @click="forceCursorToEnd"
            @keyup="forceCursorToEnd"
            placeholder="0,00"
            inputmode="numeric"
          />
          <span class="currency-label">Bs.</span>
        </div>
        
      </div>

      <div class="form-group">
        <label for="method">Método</label>
        <select id="method" v-model="method">
          <option disabled value="">Seleccione un método</option>
          <option value="CASH">CASH</option>
          <option value="POS">POS</option>
        </select>
      </div>
    </div>

    <div class="button-group">
      <button type="button" @click="$emit('cerrar')">Cerrar</button>
      <button type="button" @click="guardarPago">Guardar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js';

const notificationStore = useNotificationStore();
const rawAmount = ref(0)
const method = ref('')
const inputMonto = ref(null)
const emit = defineEmits(['guardar', 'cerrar'])

// --- LÓGICA DE MÁSCARA ATM ---

const formattedAmount = computed(() => {
  const number = rawAmount.value / 100;
  return number.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

const forceCursorToEnd = () => {
  if (inputMonto.value) {
    const length = inputMonto.value.value.length;
    inputMonto.value.setSelectionRange(length, length);
  }
};

function handleInput(e) {
  // 1. Extraer solo números
  let val = e.target.value.replace(/\D/g, "");
  
  // 2. Quitar ceros a la izquierda para evitar errores de cálculo
  val = val.replace(/^0+/, "");

  // 3. Convertir a número para validar el tope
  const numericValue = val ? parseInt(val) : 0;

  // 4. BLOQUEO ESTRICTO: 
  // Si el valor es mayor a 100.000.000.000 céntimos (1.000.000.000,00 Bs)
  // No actualizamos el estado, manteniendo el valor anterior.
  if (numericValue > 100000000000) {
    // Opcional: Avisar al usuario que llegó al límite
    return; 
  }

  // 5. Actualizar valor si pasó la validación
  rawAmount.value = numericValue;

  // 6. Forzar cursor al final
  nextTick(() => {
    forceCursorToEnd();
  });
}

// --- ACCIONES ---

function guardarPago() {
  const finalAmount = rawAmount.value / 100;

  // Validación de Mínimo
  if (finalAmount < 0.01) {
    notificationStore.addNotification("Monto insuficiente", "El pago mínimo es 0,01 Bs.", "error");
    return;
  }
  
  // Validación de Máximo (Mil millones)
  if (finalAmount > 1000000000) {
    notificationStore.addNotification("Límite excedido", "El máximo permitido es 1.000.000.000 Bs.", "error");
    return;
  }

  if (!method.value) {
    notificationStore.addNotification("Falta información", "Seleccione el método de pago.", "info");
    return;
  }

  emit('guardar', { amount: finalAmount, method: method.value });
  notificationStore.addNotification("Pago Agregado", `Registrado: ${formattedAmount.value} Bs.`, "success");
  emit('cerrar');
}
</script>

<style scoped>
/* Se mantienen tus estilos previos y añadimos estos retoques: */
.modal-panel {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  margin: auto;
  margin-top: 2vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

input {
  text-align: right; /* Alineación a la derecha para estilo contable */
  font-family: 'Courier New', Courier, monospace; /* Opcional: fuente monoespaciada para números */
  font-weight: bold;
}

.limit-hint {
  font-size: 0.7rem;
  color: #065f46;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}


h2 {
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.input-with-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-label {
  font-weight: 600;
  color: #065f46;
}

input,
select {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  flex: 1;
}

input:focus,
select:focus {
  outline: none;
  border-color: #34d399;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button[type="button"] {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

button[type="button"]:first-child {
  background-color: #e5e7eb;
  color: #374151;
}

button[type="button"]:first-child:hover {
  background-color: #d1d5db;
}

button[type="button"]:last-child {
  background-color: #10b981;
  color: white;
}

button[type="button"]:last-child:hover {
  background-color: #059669;
}
</style>

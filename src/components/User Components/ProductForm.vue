<template>
  <div class="product-form">
    <h2>Registrar Producto</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Nombre del Producto:</label>
          <input type="text" id="name" v-model="product.name" required minlength="6" maxlength="50"
            placeholder="Ej: Zapato Deportivo" />
        </div>

        <div class="form-group">
          <label for="description">Descripción:</label>
          <input type="text" id="description" v-model="product.description" required minlength="6" maxlength="50"
            placeholder="Breve descripción del producto..." />
        </div>

        <div class="form-group">
          <label for="buyingPrice">Precio de adquisición:</label>
          <div class="price-input">
            <input type="number" id="buyingPrice" v-model.number="product.buyingPrice" required min="0.01"
              step="0.01" />
            <span class="currency-symbol">$</span>
          </div>
        </div>

        <div class="form-group">
          <label for="sellingPrice">Precio de venta:</label>
          <div class="price-input">
            <input type="number" id="sellingPrice" v-model.number="product.sellingPrice" required min="0.01"
              step="0.01" />
            <span class="currency-symbol">$</span>
          </div>
        </div>

        <div class="form-group">
          <label for="brand">Marca:</label>
          <select id="brand" v-model="product.brandId" required>
            <option value="" disabled>Selecciona una marca</option>
            <option v-for="brand in brands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="button-group">
        <button type="button" @click="resetForm">Limpiar</button>
        <button type="submit">Registrar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '../../store/useNotificationStore.js'

const notificationStore = useNotificationStore()

const product = ref({
  name: "",
  description: "",
  buyingPrice: null,
  sellingPrice: null,
  brandId: "",
})

const brands = ref([])

const fetchBrands = async () => {
  try {
    const response = await fetch("http://localhost:8080/brand")
    if (!response.ok) throw new Error()
    const data = await response.json()
    brands.value = Array.isArray(data) ? data : []
  } catch (error) {
    notificationStore.addNotification("Error", "No se pudieron cargar las marcas.", "error")
  }
}

const handleSubmit = async () => {
  const textRegex = /^[A-Za-z0-9 ._-]{6,50}$/

  // 1. Validaciones de Texto
  if (!textRegex.test(product.value.name) || !textRegex.test(product.value.description)) {
    return notificationStore.addNotification(
      "Formato Inválido",
      "El nombre y descripción deben tener 6-50 caracteres (Letras, números, . - _)",
      "warning"
    )
  }

  // 2. Validación de Precios Positivos
  if (product.value.buyingPrice <= 0 || product.value.sellingPrice <= 0) {
    return notificationStore.addNotification("Error de Precio", "Los precios deben ser mayores a 0.", "warning")
  }

  // 3. Validación Lógica: Compra < Venta
  if (product.value.buyingPrice >= product.value.sellingPrice) {
    return notificationStore.addNotification(
      "Margen de Ganancia",
      "El precio de venta debe ser mayor al precio de adquisición.",
      "error"
    )
  }

  if (!product.value.brandId) {
    return notificationStore.addNotification("Dato Faltante", "Seleccione una marca.", "warning")
  }

  const payload = {
    ...product.value,
    buyingPrice: product.value.buyingPrice.toFixed(2),
    sellingPrice: product.value.sellingPrice.toFixed(2),
  }

  try {
    const response = await fetch("http://localhost:8080/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error()
    
    const data = await response.json()
    notificationStore.addNotification("Éxito", `Producto "${data.name}" registrado correctamente.`, "success")
    resetForm()
  } catch (error) {
    notificationStore.addNotification("Error", "Hubo un problema al registrar el producto.", "error")
  }
}

const resetForm = () => {
  product.value = {
    name: "",
    description: "",
    buyingPrice: null,
    sellingPrice: null,
    brandId: "",
  }
}

onMounted(fetchBrands)
</script>

<style scoped>
/* Se mantienen tus estilos originales */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.product-form {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 700px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #166534;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.product-form label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.product-form input,
.product-form textarea,
.product-form select {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  transition: border-color 0.3s ease;
  resize: vertical;
}

.product-form input:focus,
.product-form textarea:focus,
.product-form select:focus {
  outline: none;
  border-color: #34d399;
}

.product-form select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 8L10 12L14 8' stroke='%23065f46' stroke-width='2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
}

button[type="submit"] {
  background-color: #10b981;
  color: white;
}

button[type="submit"]:hover {
  background-color: #059669;
}

button[type="button"] {
  background-color: #d1fae5;
  color: #065f46;
}

button[type="button"]:hover {
  background-color: #a7f3d0;
}

.price-input {
  display: flex;
  align-items: center;
}

.price-input input {
  flex: 1;
}

.currency-symbol {
  margin-left: 8px;
  font-weight: bold;
  color: #166534;
}
</style>

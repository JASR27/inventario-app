<template>
  <div class="product-form">
    <h2>Registrar Producto</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Nombre del Producto:</label>
          <input type="text" id="name" v-model="product.name" required />
        </div>

        <div class="form-group">
          <label for="description">Descripción:</label>
          <textarea id="description" v-model="product.description" required></textarea>
        </div>

        <div class="form-group">
          <label for="price">Precio:</label>
          <div class="price-input">
            <input
              type="number"
              id="price"
              v-model.number="product.price"
              required
              min="0.01"
              step="0.01"
            />
            <span class="currency-symbol">$</span>
          </div>
        </div>

        <div class="form-group">
          <label for="brand">Marca:</label>
          <select id="brand" v-model="product.brand" required>
            <option value="" disabled>Selecciona una marca</option>
            <option value="Sony">Sony</option>
            <option value="Samsung">Samsung</option>
            <option value="LG">LG</option>
            <option value="Apple">Apple</option>
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

<script>
export default {
  name: "ProductForm",
  data() {
    return {
      product: {
        name: "",
        description: "",
        price: null,
        brand: "",
      },
    };
  },
  methods: {
    handleSubmit() {
      if (this.product.price <= 0 || isNaN(this.product.price)) {
        alert("El precio debe ser un número positivo.");
        return;
      }

      console.log("Datos del producto:", this.product);
      alert(`Producto "${this.product.name}" registrado con éxito`);
      this.resetForm();
    },
    resetForm() {
      this.product = {
        name: "",
        description: "",
        price: null,
        brand: "",
      };
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.product-form {
  background-color: #f0fdf4; /* Fondo verde claro */
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
  color: #166534; /* Título verde oscuro */
}

/* Grid para campos en dos columnas */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

/* Estilos para inputs, textarea y select */
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

/* Estilo personalizado para select */
.product-form select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 8L10 12L14 8' stroke='%23065f46' stroke-width='2'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

/* Botones alineados horizontalmente */
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


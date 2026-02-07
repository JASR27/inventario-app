<template>
  <div class="product-form">
    <h2>Registrar Producto</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Nombre del Producto:</label>
          <input type="text" id="name" v-model="product.name" required minlength="6" maxlength="50"
            pattern="[A-Za-z0-9._-]{6,50}"
            title="Debe tener entre 6 y 50 caracteres. Solo se permiten letras, números y .-_" />
        </div>

        <div class="form-group">
          <label for="description">Descripción:</label>
          <textarea id="description" v-model="product.description" required minlength="6" maxlength="50"
            pattern="[A-Za-z0-9._-]{6,50}"
            title="Debe tener entre 6 y 50 caracteres. Solo se permiten letras, números y .-_"></textarea>
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

<script>
export default {
  name: "ProductForm",
  data() {
    return {
      product: {
        name: "",
        description: "",
        buyingPrice: null,
        sellingPrice: null,
        brandId: "", // ID de la marca seleccionada
      },
      brands: [], // Lista de marcas obtenidas del backend
    };
  },
  methods: {
    handleSubmit() {
      // Validaciones adicionales en JS
      const textRegex = /^[A-Za-z0-9 ._-]{6,50}$/;

      if (
        !textRegex.test(this.product.name) ||
        !textRegex.test(this.product.description)
      ) {
        alert(
          "El nombre y la descripción deben tener entre 6 y 50 caracteres y solo pueden contener letras, números y .-_"
        );
        return;
      }

      if (
        !this.product.buyingPrice ||
        !this.product.sellingPrice ||
        this.product.buyingPrice <= 0 ||
        this.product.sellingPrice <= 0
      ) {
        alert("Los precios deben ser números positivos.");
        return;
      }

      if (!this.product.brandId) {
        alert("Debe seleccionar una marca.");
        return;
      }

      const payload = {
        name: this.product.name,
        description: this.product.description,
        buyingPrice: this.product.buyingPrice.toFixed(2),
        sellingPrice: this.product.sellingPrice.toFixed(2),
        brandId: this.product.brandId,
      };

      fetch("http://localhost:8080/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error al registrar el producto");
          return response.json();
        })
        .then((data) => {
          alert(`Producto "${data.name}" registrado con éxito`);
          this.resetForm();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Hubo un problema al registrar el producto.");
        });
    },
    resetForm() {
      this.product = {
        name: "",
        description: "",
        buyingPrice: null,
        sellingPrice: null,
        brandId: "",
      };
    },
    fetchBrands() {
      fetch("http://localhost:8080/brand")
        .then((response) => {
          if (!response.ok) throw new Error("Error al cargar marcas");
          return response.json();
        })
        .then((data) => {
          this.brands = Array.isArray(data) ? data : [];
        })
        .catch((error) => {
          console.error("Error al obtener marcas:", error);
        });
    },
  },
  mounted() {
    this.fetchBrands();
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.product-form {
  background-color: #f0fdf4;
  /* Fondo verde claro */
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
  /* Título verde oscuro */
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

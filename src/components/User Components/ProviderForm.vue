<template>
  <div class="provider-form">
    <h2>Registrar Proveedor</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Nombre del Proveedor:</label>
          <input type="text" id="name" v-model="provider.name" required />
        </div>

        <div class="form-group">
          <label for="description">Descripción:</label>
          <textarea id="description" v-model="provider.description" required></textarea>
        </div>

        <div class="form-group">
          <label for="nid">NID (Número de Identificación):</label>
          <input
            type="text"
            id="nid"
            v-model="provider.nid"
            required
            pattern="^[A-Za-z0-9\-]+$"
            title="Solo letras, números y guiones"
          />
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
  name: "ProviderForm",
  data() {
    return {
      provider: {
        name: "",
        description: "",
        nid: "",
      },
    };
  },
  methods: {
    handleSubmit() {
      if (!this.provider.nid.match(/^[A-Za-z0-9\-]+$/)) {
        alert("El NID debe contener solo letras, números o guiones.");
        return;
      }

      console.log("Datos del proveedor:", this.provider);
      alert(`Proveedor "${this.provider.name}" registrado con éxito`);
      this.resetForm();
    },
    resetForm() {
      this.provider = {
        name: "",
        description: "",
        nid: "",
      };
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.provider-form {
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

.provider-form h2 {
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

/* Estilos para inputs y textarea */
.provider-form label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.provider-form input,
.provider-form textarea {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  transition: border-color 0.3s ease;
  resize: vertical;
}

.provider-form input:focus,
.provider-form textarea:focus {
  outline: none;
  border-color: #34d399;
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
</style>


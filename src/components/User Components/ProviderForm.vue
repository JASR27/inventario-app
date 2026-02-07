<template>
  <div class="provider-form">
    <h2>Registrar Proveedor</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="name">Nombre del Proveedor:</label>
          <input type="text" id="name" v-model="provider.name" required minlength="6" maxlength="50"
            pattern="[A-Za-z0-9 ._-]{6,50}"
            title="Debe tener entre 6 y 50 caracteres. Solo se permiten letras, números, espacios y .-_" />
        </div>

        <div class="form-group">
          <label for="nid">NID:</label>
          <input type="text" id="nid" v-model="provider.nid" required minlength="6" maxlength="20"
            pattern="[A-Za-z0-9._-]{1,20}"
            title="Debe tener entre 6 y 20 caracteres. Solo se permiten letras, números y .-_" />
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
        nid: "",
      },
    };
  },
  methods: {
    handleSubmit() {
      const nameRegex = /^[A-Za-z0-9 ._-]{6,50}$/;
      const nidRegex = /^[A-Za-z0-9._-]{1,20}$/;

      if (!nameRegex.test(this.provider.name)) {
        alert(
          "El nombre debe tener entre 6 y 50 caracteres y solo puede contener letras, números, espacios y .-_"
        );
        return;
      }

      if (!nidRegex.test(this.provider.nid)) {
        alert(
          "El NID debe tener de 6 a 20 caracteres y solo puede contener letras, números y .-_"
        );
        return;
      }

      const payload = {
        name: this.provider.name,
        nid: this.provider.nid,
      };

      fetch("http://localhost:8080/supplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error al registrar el proveedor");
          return response.json();
        })
        .then((data) => {
          alert(`Proveedor "${data.name}" registrado con éxito`);
          this.resetForm();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Hubo un problema al registrar el proveedor.");
        });
    },
    resetForm() {
      this.provider = {
        name: "",
        nid: "",
      };
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.provider-form {
  background-color: #f0fdf4;
  /* Fondo verde claro */
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 500px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.provider-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #166534;
  /* Título verde oscuro */
}

/* Grid para campos en dos columnas */
.form-grid {

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
  margin-top: 1rem;
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

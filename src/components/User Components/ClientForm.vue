<template>
  <div class="client-form">
    <h2>Registrar Cliente</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <!-- Nombre completo -->
        <div class="form-group">
          <label for="fullName">Nombre Completo:</label>
          <input
            type="text"
            id="fullName"
            v-model="client.fullName"
            required
            minlength="6"
            maxlength="50"
            pattern="[A-Za-z ]{6,50}"
            title="Debe tener entre 6 y 50 caracteres. Solo se permiten letras y espacios"
          />
        </div>

        <!-- NID -->
        <div class="form-group">
          <label for="nid">NID:</label>
          <input
            type="text"
            id="nid"
            v-model="client.nid"
            required
            minlength="6"
            maxlength="20"
            pattern="[A-Za-z0-9._-]{6,20}"
            title="Debe tener entre 6 y 20 caracteres. Solo se permiten letras, números y .-_"
          />
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label for="address">Dirección:</label>
          <textarea
            id="address"
            v-model="client.address"
            required
            minlength="6"
            maxlength="50"
            pattern="[A-Za-z0-9 ._-]{6,50}"
            title="Debe tener entre 6 y 50 caracteres. Solo se permiten letras, números, espacios y .-_"
          ></textarea>
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
  name: "ClientForm",
  data() {
    return {
      client: {
        fullName: "",
        nid: "",
        address: "",
      },
    };
  },
  methods: {
    handleSubmit() {
      const nameRegex = /^[A-Za-z ]{6,50}$/;
      const nidRegex = /^[A-Za-z0-9._-]{6,20}$/;
      const addressRegex = /^[A-Za-z0-9 ._-]{6,50}$/;

      if (!nameRegex.test(this.client.fullName)) {
        alert(
          "El nombre debe tener entre 6 y 50 caracteres y solo puede contener letras y espacios."
        );
        return;
      }

      if (!nidRegex.test(this.client.nid)) {
        alert(
          "El NID debe tener entre 6 y 20 caracteres y solo puede contener letras, números y .-_"
        );
        return;
      }

      if (!addressRegex.test(this.client.address)) {
        alert(
          "La dirección debe tener entre 6 y 50 caracteres y solo puede contener letras, números, espacios y .-_"
        );
        return;
      }

      const payload = {
        fullName: this.client.fullName,
        nid: this.client.nid,
        address: this.client.address,
      };

      fetch("http://localhost:8080/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error al registrar el cliente");
          return response.json();
        })
        .then((data) => {
          alert(`Cliente "${data.fullName}" registrado con éxito`);
          this.resetForm();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Hubo un problema al registrar el cliente.");
        });
    },
    resetForm() {
      this.client = {
        fullName: "",
        nid: "",
        address: "",
      };
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.client-form {
  background-color: #f0fdf4;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Inter", sans-serif;
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.client-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #166534;
  text-align: center;
}

/* Campos en vertical */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.client-form label {
  font-weight: 600;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.client-form input,
.client-form textarea {
  padding: 0.75rem;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #1e293b;
  transition: border-color 0.3s ease;
  resize: vertical;
}

.client-form input:focus,
.client-form textarea:focus {
  outline: none;
  border-color: #34d399;
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

</style>

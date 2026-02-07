<template>
  <div class="user-form">
    <h2>Registrar Usuario</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-group">
          <label for="firstName">Primer Nombre:</label>
          <input type="text" id="firstName" v-model="user.firstName" required minlength="4" maxlength="20"
            pattern="[A-Za-z ]{4,20}" title="Debe tener entre 4 y 20 caracteres. Solo se permiten letras y espacios" />
        </div>

        <div class="form-group">
          <label for="lastName">Primer Apellido:</label>
          <input type="text" id="lastName" v-model="user.lastName" required minlength="4" maxlength="20"
            pattern="[A-Za-z ]{4,20}" title="Debe tener entre 4 y 20 caracteres. Solo se permiten letras y espacios" />
        </div>

        <div class="form-group">
          <label for="nid">NID:</label>
          <input type="text" id="nid" v-model="user.nid" required minlength="6" maxlength="20"
            pattern="[A-Za-z0-9._-]{6,20}"
            title="Debe tener entre 6 y 20 caracteres. Solo se permiten letras, números y .-_" />
        </div>

        <div class="form-group">
          <label for="username">Usuario:</label>
          <input type="text" id="username" v-model="user.username" required minlength="6" maxlength="20"
            pattern="[A-Za-z0-9._-]{6,20}" title="Debe tener entre 6 y 20 caracteres. Solo se permiten letras, números y .-_" />
        </div>

        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="user.password" required minlength="6" maxlength="20"
            pattern="[A-Za-z0-9._\-#$&*@]{6,20}"
            title="Debe tener entre 6 y 20 caracteres. Se permiten letras, números y .-_ $#&*@" />
        </div>

        <div class="form-group">
          <label for="role">Rol:</label>
          <select id="role" v-model="user.role" required>
            <option value="" disabled>Selecciona un rol</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
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
  name: "UserForm",
  data() {
    return {
      user: {
        firstName: "",
        lastName: "",
        nid: "",
        username: "",
        password: "",
        role: "",
      },
    };
  },
  methods: {
    handleSubmit() {
      // Regex de validación
      const nameRegex = /^[A-Za-z ]{4,20}$/;
      const nidRegex = /^[A-Za-z0-9._-]{4,20}$/;
      const usernameRegex = /^[A-Za-z0-9._-]{6,20}$/;
      const passwordRegex = /^[A-Za-z0-9._\-#$&*@]{6,20}$/;

      if (!nameRegex.test(this.user.firstName)) {
        alert("El nombre debe tener entre 4 y 20 caracteres y solo puede contener letras y espacios.");
        return;
      }
      if (!nameRegex.test(this.user.lastName)) {
        alert("El apellido debe tener entre 4 y 20 caracteres y solo puede contener letras y espacios.");
        return;
      }
      if (!nidRegex.test(this.user.nid)) {
        alert("El NID debe tener entre 6 y 20 caracteres y solo puede contener letras, números y .-_");
        return;
      }
      if (!usernameRegex.test(this.user.username)) {
        alert("El usuario debe tener entre 6 y 20 caracteres y solo puede contener letras, números y .-_");
        return;
      }
      if (!passwordRegex.test(this.user.password)) {
        alert("La contraseña debe tener entre 6 y 20 caracteres y puede contener letras, números y .-_ $#&*@");
        return;
      }

      // Normalizar el rol en mayúsculas si el backend lo espera así
      const payload = {
        ...this.user,
        role: this.user.role.toUpperCase(),
      };

      fetch("http://localhost:8080/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error al registrar el usuario");
          return response.json();
        })
        .then((data) => {
          alert(`Usuario "${data.username}" registrado con éxito`);
          this.resetForm();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Hubo un problema al registrar el usuario.");
        });
    },
    resetForm() {
      this.user = {
        firstName: "",
        lastName: "",
        nid: "",
        username: "",
        password: "",
        role: "",
      };
    },
  },
};
</script>



<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");

.user-form {
  background-color: #fff7ed;
  /* Naranja claro */
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

.user-form h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #7c2d12;
  /* Naranja oscuro */
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

/* Estilos para inputs y select */
.user-form label {
  font-weight: 600;
  color: #9a3412;
  margin-bottom: 0.5rem;
}

.user-form input,
.user-form select {
  padding: 0.75rem;
  border: 1px solid #fdba74;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #3b2f2f;
  transition: border-color 0.3s ease;
}

.user-form input:focus,
.user-form select:focus {
  outline: none;
  border-color: #fb923c;
}

/* Estilo personalizado para select */
.user-form select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 8L10 12L14 8' stroke='%239a3412' stroke-width='2'/%3E%3C/svg%3E");
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
  background-color: #f97316;
  color: white;
}

button[type="submit"]:hover {
  background-color: #ea580c;
}

button[type="button"] {
  background-color: #fcd34d;
  color: #78350f;
}

button[type="button"]:hover {
  background-color: #fbbf24;
}
</style>

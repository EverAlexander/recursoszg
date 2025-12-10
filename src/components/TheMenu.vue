<template>
  <div class="menu-sidebar d-flex flex-column align-center" :class="stateSideBar">
    <div class="menu-button mt-5 mb-4">
      <a href="#" @click="stateSideBar = 'inactive'">
        <v-icon icon="mdi-menu mt-1" :size="45"></v-icon>
      </a>
    </div>

    <div class="menu-options mt-3 text-center">
      <template v-if="isLoggedIn">

        <RouterLink to="/" class="d-flex flex-column align-center mb-4">
          <v-icon icon="mdi-home" size="25"></v-icon>
          <span>Inicio</span>
        </RouterLink>

        <v-menu location="end" open-on-hover v-if="user?.rol === 'Administrador'">
          <template v-slot:activator="{ props }">
            <div class="d-flex flex-column align-center mb-4" v-bind="props">
              <v-icon icon="mdi-account" size="20"></v-icon>
              <span>Usuario</span>
            </div>
          </template>

          <v-list density="compact" variant="plain" class="my-list pt-2 pb-2">
            <RouterLink to="/role">
              <v-list-item>
                Roles
              </v-list-item>
            </RouterLink>

            <RouterLink to="/users">
              <v-list-item>
                Integrantes
              </v-list-item>
            </RouterLink>

          </v-list>
        </v-menu>

        <v-menu location="end" open-on-hover v-if="user?.rol === 'Administrador'">
          <template v-slot:activator="{ props }">
            <div class="d-flex flex-column align-center mb-4" v-bind="props">
              <v-icon icon="mdi-clipboard-list" size="20"></v-icon>
              <span>Inventario</span>
            </div>
          </template>

          <v-list density="compact" variant="plain" class="my-list pt-2 pb-2">
            <RouterLink to="/">
              <v-list-item>
                Marcas
              </v-list-item>
            </RouterLink>

            <RouterLink to="/">
              <v-list-item>
                Modelos
              </v-list-item>
            </RouterLink>

            <RouterLink to="/">
              <v-list-item>
                Equipos
              </v-list-item>
            </RouterLink>

          </v-list>
        </v-menu>

        <RouterLink to="/" class="d-flex flex-column align-center mb-4" @click="logout()">
          <v-icon icon="mdi-logout" size="25"></v-icon>
          <span>Cerrar sesión</span>
        </RouterLink>

      </template>


      <template v-else>
        <RouterLink to="/" class="d-flex flex-column align-center mb-4">
          <v-icon icon="mdi-login" size="25"></v-icon>
          <span>Iniciar sesión</span>
        </RouterLink>
        <!-- <RouterLink to="/register" class="d-flex flex-column align-center mb-4">
          <v-icon icon="mdi-account-plus" size="25"></v-icon>
          <span>Registrarse</span>
        </RouterLink> -->
      </template>

      <!--v-if="user?.rol === 'Usuario'" asi dependera del rol que se validara-->


    </div>
  </div>
</template>




<script setup>
import { RouterLink } from "vue-router";
import useMenu from "@/composables/useMenu";
import useAuth from "../composables/useAuth";

const { stateSideBar } = useMenu();
const { isLoggedIn, logout, user } = useAuth();


</script>

<style lang="scss">
@import "@/assets/styles/variables.scss";

.menu-sidebar {
  width: 8rem;
  height: 100vh;
  position: fixed;
  top: 0;
  z-index: 1;
  background: $menu-color;
  font-size: 16px;
}

.menu-sidebar a,
.menu-sidebar div {
  color: white;
}

.menu-options a:hover,
.menu-options div:hover {
  color: #E0E5F1;
  background-color: #474F7A;
  //border-radius: 10px;
}

.my-list {
  background-color: #3C486B !important;
}

.my-list a {
  color: #F0F0F0 !important;
}

.my-list .v-list-item:hover {
  color: white !important;
  background-color: #82B1FF;
}

.inactive {
  left: -8rem;
  animation: linear;
  animation-name: hideMenu;
  animation-duration: 0.4s;
}

@keyframes showMenu {
  0% {
    left: -6rem;
    transform: translateX(-6rem);
  }

  100% {
    left: 0;
    transform: translateX(0);
  }
}
</style>
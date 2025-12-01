import { createRouter, createWebHistory } from "vue-router";
import NotFoundView from "../views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/Brands",
      name: "Brands",
      component: () => import("../views/BrandsView.vue"),
    },
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true }, // add meta field to specify the route requires authentication
    },
    {
      path: "/consola",
      name: "consola",
      component: () => import("../views/GameConsole.vue"),
      meta: { requiresAuth: false }, // add meta field to specify the route requires authentication
    },
    {
      path: "/modelproduct",
      name: "modelproduct",
      component: () => import("../views/ModelProductView.vue"),
      meta: { requiresAuth: false }, // add meta field to specify the route requires authentication
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFoundView,
    },
  ],
});

// add a global beforeEnter guard to check if the route requires authentication and if the user has an access token
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !hasAccessToken()) {
    next("/login");
  } else {
    next();
  }
});

// helper function to check if the user has an access token
function hasAccessToken() {
  const token = localStorage.getItem("access_token");
  return token !== null && token !== undefined;
}

export default router;

<template>
  <q-layout view="hHh Lpr fFf" class="bg-grey-1">
    <q-header borderless class="bg-white text-grey-9 shadow-sm header-border">
      <q-toolbar class="q-px-lg" style="height: 64px">
        <q-toolbar-title class="text-weight-bold font-outfit text-primary logo-text">
          PayFlow
        </q-toolbar-title>

        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-x-md">
          <div class="row items-center q-gutter-x-sm bg-grey-2 q-py-xs q-px-md user-badge">
            <q-avatar size="24px" color="primary" text-color="white" class="text-weight-bold text-caption">
              {{ firstLetter }}
            </q-avatar>
            <span class="text-weight-medium text-caption text-grey-8">{{ authStore.user }}</span>
          </div>

          <q-btn
            flat
            round
            dense
            color="grey-7"
            icon="logout"
            @click="handleLogout"
          >
            <q-tooltip>Cerrar Sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const firstLetter = computed(() => {
  return authStore.user ? authStore.user.charAt(0).toUpperCase() : 'U';
});

const handleLogout = async () => {
  authStore.logout();
  await router.push('/login');
};
</script>

<style scoped lang="scss">
.header-border {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.logo-text {
  font-size: 1.4rem;
  letter-spacing: -0.5px;
}

.user-badge {
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.03);
}
</style>

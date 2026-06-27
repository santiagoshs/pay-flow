<template>
  <q-layout view="lHh Lpr lFf" class="bg-gradient flex flex-center">
    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <q-card class="login-card shadow-3 q-pa-lg">
          <q-card-section class="text-center q-pb-md">
            <div class="logo-text text-weight-bold text-primary">PayFlow</div>
            <div class="text-subtitle2 text-grey-8 q-mt-xs font-outfit">
              {{ isRegister ? 'Crear una nueva cuenta' : 'Ingresa a tu portal financiero' }}
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="handleSubmit" class="q-gutter-y-md">
              <q-input
                v-model="username"
                label="Usuario"
                outlined
                dense
                lazy-rules
                autocomplete="username"
                :rules="[
                  (val) => !!val || 'El usuario es requerido',
                  (val) => val.trim().length >= 4 || 'Debe tener al menos 4 caracteres'
                ]"
                :disable="authStore.loading"
              />

              <q-input
                v-model="password"
                label="Contraseña"
                type="password"
                outlined
                dense
                lazy-rules
                :autocomplete="isRegister ? 'new-password' : 'current-password'"
                :rules="[
                  (val) => !!val || 'La contraseña es requerida',
                  (val) => val.length >= 6 || 'Debe tener al menos 6 caracteres'
                ]"
                :disable="authStore.loading"
              />

              <q-input
                v-if="isRegister"
                v-model="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                outlined
                dense
                lazy-rules
                autocomplete="new-password"
                :rules="[
                  (val) => !!val || 'Debe confirmar su contraseña',
                  (val) => val === password || 'Las contraseñas no coinciden'
                ]"
                :disable="authStore.loading"
              />

              <div v-if="authStore.error" class="text-negative text-caption q-px-sm text-center">
                {{ authStore.error }}
              </div>

              <div class="q-pt-sm">
                <q-btn
                  :label="isRegister ? 'Registrarse' : 'Iniciar Sesión'"
                  type="submit"
                  color="primary"
                  class="full-width action-btn text-weight-bold"
                  :loading="authStore.loading"
                  unelevated
                  no-caps
                />
              </div>

              <div class="text-center q-mt-md">
                <q-btn
                  flat
                  no-caps
                  color="secondary"
                  dense
                  class="text-caption font-outfit"
                  @click="toggleMode"
                  :disable="authStore.loading"
                >
                  {{ isRegister ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí' }}
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const isRegister = ref(false);
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const toggleMode = () => {
  isRegister.value = !isRegister.value;
  username.value = '';
  password.value = '';
  confirmPassword.value = '';
  authStore.clearError();
};

const handleSubmit = async () => {
  authStore.clearError();

  if (isRegister.value) {
    const success = await authStore.register(username.value.trim(), password.value);
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
        position: 'bottom',
      });
      toggleMode();
    }
  } else {
    const success = await authStore.login(username.value.trim(), password.value);
    if (success) {
      $q.notify({
        type: 'positive',
        message: `Bienvenido de nuevo, ${username.value}`,
        position: 'bottom-right',
      });
      await router.push('/payments');
    }
  }
};
</script>

<style scoped lang="scss">
.bg-gradient {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.logo-text {
  font-size: 2.2rem;
  letter-spacing: -1.5px;
  background: linear-gradient(to right, #007aff, #0051a8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.action-btn {
  border-radius: 10px;
  height: 44px;
}
</style>

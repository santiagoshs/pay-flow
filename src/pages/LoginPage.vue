<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="login-card q-pa-lg shadow-2 border-radius-md" style="width: 100%; max-width: 400px">
          <q-card-section class="text-center q-pb-none">
            <div class="text-h5 text-weight-bold text-grey-9">PayFlow</div>
            <div class="text-caption text-grey-6 q-mt-xs">Ingresa tus credenciales para acceder</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="handleLogin" class="q-gutter-md">
              <q-input
                v-model="username"
                label="Usuario"
                outlined
                dense
                lazy-rules
                :rules="[val => !!val || 'El usuario es requerido']"
              />

              <q-input
                v-model="password"
                label="Contraseña"
                type="password"
                outlined
                dense
                lazy-rules
                :rules="[val => !!val || 'La contraseña es requerida']"
              />

              <div class="q-pt-sm">
                <q-btn
                  label="Iniciar Sesión"
                  type="submit"
                  color="primary"
                  class="full-width text-weight-bold"
                  unevaluated
                  no-caps
                />
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

const username = ref('');
const password = ref('');

const handleLogin = () => {
  // Lógica de autenticación se integrará en el siguiente paso con el store
  console.log('Intento de login:', username.value, password.value);
};
</script>

<style scoped lang="scss">
.login-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
</style>

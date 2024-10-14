<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import Main from '@/components/Main.vue';

const router = useRouter();

const navigateToNextPage = () => {
  router.push('/login/member');
};
</script>

<template>
  <Main :headbar="false" :navbar="false" :padded="false" :bg-gray="false">
    <div class="login-container">
      <div class="login-icon">
        <img src="/icons/icon-256x256.png" alt="Banggabda" class="logo" />
      </div>

      <div class="login-name">방갑다</div>

      <Button size="lg" class="login-kakao" @click="navigateToNextPage">
        <i class="fa-solid fa-comment"></i>카카오 로그인
      </Button>
    </div>
  </Main>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80%;
}

.login-icon {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  overflow: hidden;
}

.logo {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  object-fit: cover;
}

.login-name {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 80px;
  font-size: 24px;
  font-weight: bold;
}

.login-kakao {
  width: 80%;
  background-color: #fee500;
  gap: 12px;
}
</style>

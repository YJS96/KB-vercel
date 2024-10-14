<script setup lang="ts">
import { useRouter } from 'vue-router';
import Main from '@/components/Main.vue';
import Button from '@/components/ui/button/Button.vue';

const router = useRouter();

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <Main :headbar="false" :navbar="false" :padded="false" :bg-gray="false">
    <div class="error-container">
      <div class="error-circle">
        <div class="error-number">404</div>
      </div>
      <div class="error-info">페이지를<br />찾을 수 없어요</div>
      <Button @click="goToHome" class="home-button">메인으로 돌아가기</Button>
    </div>
  </Main>
</template>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90%;
}

.error-circle {
  width: 200px;
  height: 200px;
  background-color: #fffdf0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.error-number {
  font-size: 72px;
  font-weight: 700;
  color: hsl(var(--primary));
}

.error-info {
  font-size: 32px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 60px;
}

.home-button {
  font-size: 12px;
}
</style>

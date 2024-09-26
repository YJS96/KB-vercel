<script setup lang="ts">
import { Button } from '@/components/ui/button';
import Main from '@/components/Main.vue';
</script>

<template>
  <Main :headbar="false" :navbar="false" :padded="false" :bg-gray="false">
    <div class="success-container">
      <div class="success-icon">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="success-info">회원 가입이<br />완료되었어요</div>
    </div>
    <Button class="success-button">확인</Button>
  </Main>
</template>

<style scoped>
.success-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80%;
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: var(--css-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  font-size: 28px;
}

.success-info {
  display: flex;
  flex-direction: center;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
}

.success-button {
  left: 5.13%;
  right: 5.13%;
  bottom: 80px;
  position: absolute;
}
</style>

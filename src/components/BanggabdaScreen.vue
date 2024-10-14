<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isLoading = ref(true);
const showContent = ref(false);

onMounted(() => {
  // 컨텐츠를 천천히 나타나게 합니다.
  setTimeout(() => {
    showContent.value = true;
  }, 500);

  // 실제 앱에서는 여기에 필요한 초기 데이터 로딩 로직을 추가할 수 있습니다.
  setTimeout(() => {
    showContent.value = false;
    // 페이드 아웃 애니메이션을 위한 시간을 줍니다.
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  }, 4000); // 4초 후에 로딩 화면을 숨깁니다. 필요에 따라 시간을 조절하세요.
});
</script>

<template>
  <Transition name="fade">
    <div v-if="isLoading" class="splash-screen">
      <div class="background-circles">
        <div class="circle" v-for="i in 3" :key="i"></div>
      </div>
      <Transition name="content-fade">
        <div v-if="showContent" class="content">
          <div class="logo-container">
            <img src="/icons/icon-256x256.png" alt="방갑다 로고" class="logo" />
          </div>
          <h1 class="app-name">방갑다</h1>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f6f7f6;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.background-circles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.circle {
  position: absolute;
  background-color: rgba(255, 255, 0, 0.2);
  border-radius: 50%;
  animation: pulse-and-fade 4s infinite;
}

.circle:nth-child(1) {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 20%;
  animation-delay: 0s;
}

.circle:nth-child(2) {
  width: 400px;
  height: 400px;
  top: 50%;
  left: 60%;
  animation-delay: 1s;
}

.circle:nth-child(3) {
  width: 350px;
  height: 350px;
  top: 70%;
  left: 10%;
  animation-delay: 2s;
}

@keyframes pulse-and-fade {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  border-radius: 24px;
}

.app-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

/* 페이드 인/아웃 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 컨텐츠 페이드 인/아웃 트랜지션 */
.content-fade-enter-active,
.content-fade-leave-active {
  transition:
    opacity 1s ease,
    transform 1s ease;
}

.content-fade-enter-from,
.content-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue';

const threshold = 176; // 새로고침을 트리거하는 당김 거리 (픽셀)
const pullDistance = ref(0);
const startY = ref(0);
const isRefreshing = ref(false);
const showRefreshingMessage = ref(false);

const emit = defineEmits(['refresh']);

const onTouchStart = (e: TouchEvent) => {
  if (!isRefreshing.value) {
    startY.value = e.touches[0].clientY;
  }
};

const onTouchMove = (e: TouchEvent) => {
  if (!isRefreshing.value) {
    const currentY = e.touches[0].clientY;
    pullDistance.value = Math.max(0, currentY - startY.value);
  }
};

const onTouchEnd = () => {
  if (pullDistance.value > threshold && !isRefreshing.value) {
    startRefresh();
  } else {
    pullDistance.value = 0;
  }
};

const startRefresh = () => {
  isRefreshing.value = true;
  pullDistance.value = threshold; // 인디케이터를 완전히 펼친 상태로 유지
  setTimeout(() => {
    showRefreshingMessage.value = true;
    setTimeout(() => {
      refreshContent();
      isRefreshing.value = false;
      showRefreshingMessage.value = false;
      pullDistance.value = 0;
    }, 800);
  }, 0);
};

const refreshContent = () => {
  emit('refresh');
};

const isOverThreshold = computed(() => pullDistance.value > threshold);
const rotationStyle = computed(() => ({
  transform: `rotate(${isOverThreshold.value ? 180 : 0}deg)`,
  transition: 'transform 0.3s ease'
}));
</script>

<template>
  <div
    class="pull-to-refresh"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="pull-to-refresh__indicator" :style="{ height: `${pullDistance / 1.6}px` }">
      <div v-if="!showRefreshingMessage">
        <i class="fa-solid fa-arrow-up" :style="rotationStyle"></i>
        {{ isOverThreshold ? '놓아서 새로고침' : '당겨서 새로고침' }}
      </div>
      <div v-else class="refreshing-message">
        <div class="spinner"></div>
        <span>새로고침 중</span>
      </div>
    </div>
    <div class="content" :style="{ marginTop: showRefreshingMessage ? '32px' : '0' }">
      <!-- <NavBar /> -->
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.pull-to-refresh {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  height: 100vh;
}

.pull-to-refresh__indicator {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 0;
  overflow: hidden;
  transition: height 0.15s ease;
  z-index: 999;
  top: 0 !important;
}

.content {
  transition: margin-top 0.2s ease;
}

i {
  margin-right: 4px;
}

.refreshing-message {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 16px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--white);
  border-top: 2px solid var(--dark-gray);
  border-radius: 100px;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

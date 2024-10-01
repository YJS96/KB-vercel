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
    <div class="content">
      <!-- <NavBar /> -->
      <div class="main-frame" :style="mainStyle">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';

const props = defineProps({
  headbar: {
    type: Boolean,
    default: false
  },
  navbar: {
    type: Boolean,
    default: false
  },
  padded: {
    type: Boolean,
    default: false
  },
  bgGray: {
    type: Boolean,
    default: false
  }
});

const themeStore = useThemeStore();
themeStore.setThemeColor(`${props.bgGray ? '#F6F7F6' : '#FDFDFD'}`);

const mainStyle = computed(() => {
  let height = '100%';
  let margin = '0px';
  if (props.headbar && props.navbar) {
    height = 'calc(100% - 76px - 52px)';
    margin = '52px';
  } else if (!props.headbar && props.navbar) {
    height = 'calc(100% - 76px)';
  } else if (props.headbar && !props.navbar) {
    height = 'calc(100% - 52px)';
    margin = '52px';
  }

  return {
    marginTop: margin,
    backgroundColor: props.bgGray ? '#F6F7F6' : '#FDFDFD',
    padding: props.padded ? '0 5.13%' : '0',
    height: height
  };
});

const router = useRouter();
const threshold = 176; // 새로고침을 트리거하는 당김 거리 (픽셀)
const pullDistance = ref(0);
const startY = ref(0);
const isRefreshing = ref(false);
const showRefreshingMessage = ref(false);

// const emit = defineEmits(['refresh']);

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
      router.go(0);
      // emit('refresh');
      // isRefreshing.value = false;
      // showRefreshingMessage.value = false;
      pullDistance.value = 0;
    }, 350);
  }, 0);
};

const isOverThreshold = computed(() => pullDistance.value > threshold);
const rotationStyle = computed(() => ({
  transform: `rotate(${isOverThreshold.value ? 180 : 0}deg)`,
  transition: 'transform 0.3s ease'
}));
</script>

<style scoped>
.main-frame {
  background-color: var(--background);
  position: absolute;
  width: 100%;
  height: calc(100% - 76px - 52px);
  margin-top: 52px;
  overflow-x: hidden;
  overflow-y: scroll;
  user-select: none;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.main-frame::webkit-scrollbar {
  display: none;
}

.padded {
  padding: 0px 5.13%;
}

.pull-to-refresh {
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  height: 100dvh;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.pull-to-refresh::webkit-scrollbar {
  display: none;
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

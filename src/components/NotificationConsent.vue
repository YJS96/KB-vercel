<script setup lang="ts">
import { ref, inject } from 'vue';
import { requestForToken } from '@/firebase';
import { Button } from '@/components/ui/button';

const fcmToken = inject('fcmToken') as { value: string | null };
const isLoading = ref(false);

const requestNotificationPermission = async () => {
  isLoading.value = true;
  try {
    const token = await requestForToken();
    if (token) {
      fcmToken.value = token;
      alert('알림 수신 동의가 완료되었습니다.');
    } else {
      alert('알림 권한을 허용해주세요.');
    }
  } catch (error) {
    console.error('알림 권한 요청 중 오류 발생:', error);
    alert('알림 설정 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <Button @click="requestNotificationPermission" :disabled="isLoading">
      {{ isLoading ? '처리 중...' : '알림 수신 동의' }}
    </Button>
  </div>
</template>

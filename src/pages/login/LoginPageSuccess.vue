<script setup lang="ts">
import { useSignupStore } from '@/stores/signupStore';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import Main from '@/components/Main.vue';

// Signup 스토어와 Vue Router 인스턴스를 생성합니다.
const signupStore = useSignupStore();
const router = useRouter();

// 확인 버튼 클릭 핸들러를 정의합니다.
const handleConfirm = async () => {
  try {
    // Pinia 스토어의 submitSignup 액션을 호출하여 회원가입을 완료합니다.
    const { success, nextRoute } = await signupStore.submitSignup();
    if (success && nextRoute) {
      console.log('회원가입 정보가 성공적으로 전송되었습니다.');
      // 성공 시 다음 라우트로 이동합니다.
      router.push(nextRoute);
    } else {
      console.error('회원가입 정보 전송에 실패했습니다.');
      // TODO: 사용자에게 에러 메시지 표시
    }
  } catch (error) {
    console.error('회원가입 처리 중 오류가 발생했습니다:', error);
    // TODO: 사용자에게 에러 메시지 표시
  }
};
</script>

<template>
  <Main :headbar="false" :navbar="false" :padded="false" :bg-gray="false">
    <div class="success-container">
      <div class="success-icon"></div>
      <div class="success-info">회원 가입이<br />완료되었어요</div>
    </div>

    <Button class="success-button" @click="handleConfirm">확인</Button>
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
  /* width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: var(--css-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px; */
  margin-bottom: 40px;
  width: 72px;
  opacity: 0;
  height: 72px;
  border-radius: 999px;
  background: var(--css-primary);
  position: relative;
  transform: rotate(45deg);
  animation: checkmarkCircleAnimation 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 100ms;
}

.success-icon:after {
  content: '';
  box-sizing: border-box;
  animation: checkmarkAnimation 0.2s ease-out forwards;
  opacity: 0;
  animation-delay: 200ms;
  position: absolute;
  border-right: 3px solid;
  border-bottom: 3px solid;
  border-color: var(--black);
  bottom: 29px;
  left: 29px;
  height: 20px;
  width: 12px;
}

@keyframes checkmarkCircleAnimation {
  from {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}

@keyframes checkmarkCircleAnimation {
  from {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}
@keyframes checkmarkAnimation {
  0% {
    height: 0;
    width: 0;
    opacity: 0;
  }
  40% {
    height: 0;
    width: 12px;
    opacity: 1;
  }
  100% {
    opacity: 1;
    height: 20px;
  }
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

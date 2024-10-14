<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSignupStore } from '@/stores/signupStore';
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-vue-next';
import { toast } from '@steveyuowo/vue-hot-toast';

// Vue Router와 Signup 스토어 인스턴스를 생성합니다.
const router = useRouter();
const signupStore = useSignupStore();

// 폼 입력값을 위한 반응형 변수들을 생성합니다.
const licenseNumber = ref('');
const isLicenseVerified = ref(false);
const representativeName = ref('');
const pharmacyPhone = ref('');

// 면허 번호 확인 함수
const verifyLicense = () => {
  // 실제 구현에서는 서버에 확인 요청을 보내야 합니다.
  if (licenseNumber.value.trim() !== '') {
    isLicenseVerified.value = true;
  }
};

// 폼의 유효성을 검사하는 computed 속성을 정의합니다.
const isFormValid = computed(
  () =>
    isLicenseVerified.value &&
    representativeName.value.trim() !== '' &&
    pharmacyPhone.value.trim() !== ''
);

// '다음' 버튼 클릭 핸들러를 정의합니다.
const handleNextButtonClick = async () => {
  if (isFormValid.value) {
    signupStore.setUserInfo({
      pharmacistInfo: {
        licenseNumber: licenseNumber.value,
        representativeName: representativeName.value,
        pharmacyPhone: pharmacyPhone.value
      }
    });

    try {
      const { success, nextRoute } = await signupStore.submitSignup();
      if (success) {
        router.push('/success');
      } else {
        toast.error('회원가입에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('회원가입 처리 중 오류가 발생했습니다:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    }
  } else {
    toast.error('모든 필드를 올바르게 입력해주세요.');
  }
};
</script>

<template>
  <HeadBar :back-button="true">회원가입</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="false">
    <div class="login-pharmacist">약사 정보를 <br />입력해주세요</div>

    <div class="pharmacist-container">
      <div class="input-group">
        <Label for="pharmacist-license">면허 번호</Label>
        <div class="license-container">
          <Input
            type="text"
            id="pharmacist-license"
            v-model="licenseNumber"
            placeholder="면허 번호를 입력하세요"
            maxlength="6"
          />
          <Button @click="verifyLicense" :disabled="isLicenseVerified">등록하기</Button>
          <CheckCircle2 v-if="isLicenseVerified" class="text-yellow-500" />
        </div>
      </div>

      <div class="input-group">
        <Label for="pharmacist-representative">대표 약사 성명</Label>
        <Input
          type="text"
          id="pharmacist-representative"
          v-model="representativeName"
          placeholder="대표 약사 성명을 입력"
        />
      </div>

      <div class="input-group">
        <Label for="pharmacy-tel">약국 연락처</Label>
        <Input
          type="text"
          inputmode="numeric"
          id="pharmacy-tel"
          v-model="pharmacyPhone"
          placeholder="ex) 021234567"
          maxlength="11"
        />
      </div>
    </div>

    <Button
      class="next-button"
      variant="default"
      :disabled="!isFormValid"
      @click="handleNextButtonClick"
    >
      다음
    </Button>
  </Main>
</template>

<style scoped>
.login-pharmacist {
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 60px;
  margin-left: 20px;
}

.pharmacist-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  margin-left: 20px;
  margin-right: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;
}

.input-group label {
  margin-bottom: 8px;
}

.license-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.next-button {
  left: 5.13%;
  right: 5.13%;
  bottom: 80px;
  position: absolute;
}
</style>

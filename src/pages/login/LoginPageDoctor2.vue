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

// Vue Router와 Signup 스토어 인스턴스를 생성합니다.
const router = useRouter();
const signupStore = useSignupStore();

// 입력 필드를 위한 반응형 변수들을 생성합니다.
const licenseNumber = ref('');
const isLicenseVerified = ref(false);
const representativeName = ref('');
const hospitalPhone = ref('');

// 면허 번호를 확인하는 함수를 정의합니다.
const verifyLicense = async () => {
  if (licenseNumber.value.trim() !== '') {
    // 실제 구현에서는 서버에 확인 요청을 보내야 합니다.
    isLicenseVerified.value = true;
  }
};

// 폼의 유효성을 검사하는 computed 속성을 정의합니다.
const isFormValid = computed(() => {
  return (
    isLicenseVerified.value &&
    representativeName.value.trim() !== '' &&
    hospitalPhone.value.trim() !== ''
  );
});

// '다음' 버튼 클릭 핸들러를 정의합니다.
const handleNextButtonClick = async () => {
  if (isFormValid.value) {
    // 입력된 의사 정보를 Pinia 스토어에 저장합니다.
    signupStore.setUserInfo({
      doctorInfo: {
        licenseNumber: licenseNumber.value,
        representativeName: representativeName.value,
        hospitalPhone: hospitalPhone.value
      }
    });
    // 성공 페이지로 이동합니다.
    router.push('/success');
  } else {
    console.error('폼이 유효하지 않습니다.');
    // TODO: 사용자에게 유효성 검사 실패 메시지 표시
  }
};
</script>

<template>
  <HeadBar :back-button="true">회원가입</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="false">
    <div class="login-doctor">의사 정보를 <br />입력해주세요</div>

    <div class="doctor-container">
      <div class="input-group">
        <Label for="doctor-license">면허 번호</Label>
        <div class="license-container">
          <Input
            type="text"
            inputmode="numeric"
            id="doctor-license"
            v-model="licenseNumber"
            placeholder="면허 번호 입력하세요"
            maxlength="6"
          ></Input>
          <Button @click="verifyLicense" :disabled="isLicenseVerified">등록하기</Button>
          <CheckCircle2 v-if="isLicenseVerified" class="text-yellow-500" />
        </div>
      </div>

      <div class="input-group">
        <Label for="doctor-representative">대표 원장 성명</Label>
        <Input
          type="text"
          id="doctor-representative"
          v-model="representativeName"
          placeholder="대표 원장 성명 입력"
        ></Input>
      </div>

      <div class="input-group">
        <Label for="hospital-tel">병원 연락처</Label>
        <Input
          type="text"
          inputmode="numeric"
          id="hospital-tel"
          v-model="hospitalPhone"
          placeholder="ex) 021234567"
          maxlength="11"
        ></Input>
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
.login-doctor {
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 60px;
  margin-left: 20px;
}

.doctor-container {
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

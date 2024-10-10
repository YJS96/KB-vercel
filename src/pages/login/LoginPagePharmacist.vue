<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSignupStore } from '@/stores/signupStore';
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Vue Router와 Signup 스토어 인스턴스를 생성합니다.
const router = useRouter();
const signupStore = useSignupStore();

// 폼 입력값을 위한 반응형 변수들을 생성합니다.
const pharmacyName = ref('');
const city = ref('');
const district = ref('');
const neighborhood = ref('');
const detailAddress = ref('');

// 폼의 유효성을 검사하는 computed 속성을 정의합니다.
const isFormValid = computed(() => {
  return (
    pharmacyName.value.trim() !== '' &&
    city.value !== '' &&
    district.value !== '' &&
    neighborhood.value !== '' &&
    detailAddress.value.trim() !== ''
  );
});

// '다음' 버튼 클릭 핸들러를 정의합니다.
const handleNextButtonClick = () => {
  if (isFormValid.value) {
    // 입력된 약사 정보를 Pinia 스토어에 저장합니다.
    signupStore.setUserInfo({
      pharmacistInfo: {
        pharmacyName: pharmacyName.value,
        pharmacyAddress: {
          city: city.value,
          district: district.value,
          neighborhood: neighborhood.value,
          detail: detailAddress.value
        }
      }
    });
    // 다음 페이지(약사 면허 입력 페이지)로 이동합니다.
    router.push('/login/pharmacist/license');
  } else {
    console.error('폼이 유효하지 않습니다.');
    // TODO: 사용자에게 유효성 검사 실패 메시지 표시
  }
};
</script>

<template>
  <HeadBar :back-button="true">회원가입</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="false">
    <div class="login-pharmacist">약사 정보를 <br />입력해주세요</div>

    <div class="pharmacist-container">
      <div class="input-group">
        <Label for="pharmacy-name">약국명</Label>
        <Input
          type="text"
          id="pharmacy-name"
          v-model="pharmacyName"
          placeholder="약국명을 입력해주세요"
        />
      </div>

      <div class="input-group">
        <Label>약국 주소</Label>
        <div class="pharmacy-container">
          <Select v-model="city">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="시" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="seoul"> 서울특별시 </SelectItem>
                <SelectItem value="guangju"> 광주광역시 </SelectItem>
                <SelectItem value="daegu"> 대구광역시 </SelectItem>
                <SelectItem value="busan"> 부산광역시 </SelectItem>
                <SelectItem value="ulsan"> 울산광역시 </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select v-model="district">
            <SelectTrigger class="w-[90px]">
              <SelectValue placeholder="구" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="gangnam"> 강남구 </SelectItem>
                <SelectItem value="guanjin"> 광진구 </SelectItem>
                <SelectItem value="yeongdeongpo"> 영등포구 </SelectItem>
                <SelectItem value="songpa"> 송파구 </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select v-model="neighborhood">
            <SelectTrigger class="w-[90px]">
              <SelectValue placeholder="동" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="seoul"> 무슨구 </SelectItem>
                <SelectItem value="guangju"> 무슨구 </SelectItem>
                <SelectItem value="daegu"> 무슨구 </SelectItem>
                <SelectItem value="busan"> 무슨구 </SelectItem>
                <SelectItem value="ulsan"> 무슨구 </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Input
          type="text"
          id="pharmacist-address"
          v-model="detailAddress"
          placeholder="(상세주소)"
        />
      </div>

      <Button
        class="next-button"
        variant="default"
        :disabled="!isFormValid"
        @click="handleNextButtonClick"
      >
        다음
      </Button>
    </div>
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

.pharmacy-container {
  display: flex;
  justify-content: space-between;
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

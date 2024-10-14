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

// Vue Router와 Signup 스토어 인스턴스 생성
const router = useRouter();
const signupStore = useSignupStore();

// 폼 입력값을 위한 반응형 변수 정의
const memberType = ref('');
const name = ref('');
const phoneNumber = ref('');
const phoneCarrier = ref('');
const residentNumberFront = ref('');
const residentNumberBack = ref('');

// 폼 유효성 검사를 위한 computed 속성 정의
const isFormValid = computed(
  () =>
    memberType.value !== '' &&
    name.value !== '' &&
    phoneNumber.value !== '' &&
    phoneCarrier.value !== '' &&
    residentNumberFront.value.length === 6 &&
    residentNumberBack.value.length === 7
);

// 회원 유형 선택 함수
const selectMemberType = (type: string) => {
  memberType.value = type;
};

// 폼 제출 핸들러
const handleSubmit = async () => {
  if (isFormValid.value) {
    // 입력된 정보를 Pinia 스토어에 저장
    signupStore.setUserInfo({
      memberType: memberType.value,
      commonInfo: {
        name: name.value,
        phoneNumber: phoneNumber.value,
        phoneCarrier: phoneCarrier.value,
        residentNumber: residentNumberFront.value + residentNumberBack.value
      }
    });

    // 선택된 회원 유형에 따라 다른 페이지로 라우팅
    if (memberType.value === '일반 회원') {
      router.push('/login/bank_type');
    } else if (memberType.value === '의사') {
      router.push('/login/doctor');
    } else if (memberType.value === '약사') {
      router.push('/login/pharmacist');
    }
  } else {
    console.error('폼이 유효하지 않습니다.');
    // TODO: 사용자에게 유효성 검사 실패 메시지 표시
  }
};
</script>

<template>
  <HeadBar :back-button="true">회원가입</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="false">
    <div class="login-info">회원 정보를 <br />입력해주세요</div>

    <div class="login-container">
      <div class="member-select-container">
        <Button
          :variant="memberType === '일반 회원' ? 'default' : 'destructive'"
          class="one-third"
          @click="selectMemberType('일반 회원')"
        >
          일반 회원
        </Button>
        <Button
          :variant="memberType === '의사' ? 'default' : 'destructive'"
          class="one-third"
          @click="selectMemberType('의사')"
        >
          의사
        </Button>
        <Button
          :variant="memberType === '약사' ? 'default' : 'destructive'"
          class="one-third"
          @click="selectMemberType('약사')"
        >
          약사
        </Button>
      </div>

      <Label for="name-input">이름</Label>
      <Input type="text" id="name-input" v-model="name" placeholder="이름을 입력해주세요." />

      <Label for="phone-number-input">전화번호</Label>
      <div class="phone-num-tong">
        <Select v-model="phoneCarrier">
          <SelectTrigger class="carrier-select">
            <SelectValue placeholder="통신사" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="skt"> SKT </SelectItem>
              <SelectItem value="kt"> KT </SelectItem>
              <SelectItem value="lg"> LGU+ </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          type="text"
          inputmode="numeric"
          id="phone-number-input"
          v-model="phoneNumber"
          placeholder="전화번호를 입력해주세요."
          maxlength="11"
        />
      </div>

      <Label for="resident-number-input-front">주민등록번호</Label>
      <div class="resident-number-container">
        <Input
          type="text"
          inputmode="numeric"
          id="resident-number-input-front"
          v-model="residentNumberFront"
          placeholder="ex) 990909"
          maxlength="6"
        />
        <div>_</div>
        <Input
          type="password"
          inputmode="numeric"
          id="resident-number-input-back"
          v-model="residentNumberBack"
          maxlength="7"
        />
      </div>
    </div>

    <Button class="next-button" variant="default" :disabled="!isFormValid" @click="handleSubmit">
      다음
    </Button>
  </Main>
</template>

<style scoped>
.login-info {
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 60px;
  margin-left: 20px;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  margin-left: 20px;
  margin-right: 20px;
}

.member-select-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.one-third {
  width: 100%;
}

.phone-num-tong {
  display: flex;
  gap: 12px;
}

.carrier-select {
  width: 80px;
  min-width: 80px;
}

.resident-number-container {
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

#resident-number-input-front,
#resident-number-input-back {
  width: 100%;
}

.next-button {
  left: 5.13%;
  right: 5.13%;
  bottom: 80px;
  position: absolute;
}

label {
  margin-top: 36px;
}
</style>

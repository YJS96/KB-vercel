<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSignupStore } from '@/stores/signupStore';
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import { Button } from '@/components/ui/button';

// 은행 목록 데이터 (로컬에서 관리)
const banks = [
  { name: '국민은행', img: '/images/banks/kb-bank.png' },
  { name: '신한은행', img: '/images/banks/shinhan-bank.png' },
  { name: '하나은행', img: '/images/banks/hana-bank.png' },
  { name: '농협은행', img: '/images/banks/nh-bank.png' },
  { name: '우리은행', img: '/images/banks/woori-bank.png' },
  { name: '기업은행', img: '/images/banks/ibk-bank.png' }
];

// Vue Router와 Signup 스토어 인스턴스를 생성합니다.
const router = useRouter();
const signupStore = useSignupStore();

// 선택된 은행을 저장하는 반응형 변수를 생성합니다.
const selectedBank = ref<{ name: string; img: string } | null>(null);

// 은행을 선택하는 함수를 정의합니다.
const selectBank = (bank: { name: string; img: string }) => {
  selectedBank.value = bank;
};

// '다음' 버튼 클릭 핸들러를 정의합니다.
const handleNextButtonClick = async () => {
  if (selectedBank.value) {
    // 선택된 은행 정보를 Pinia 스토어에 저장합니다.
    signupStore.setUserInfo({
      patientInfo: { bankName: selectedBank.value.name }
    });

    // 다음 페이지로 이동하며, 은행 이미지 정보를 쿼리 파라미터로 전달합니다.
    router.push({
      path: '/login/bank_id',
      query: { bankImg: selectedBank.value.img }
    });
  }
};
</script>

<template>
  <HeadBar :back-button="true">회원가입</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="false">
    <div class="bank-info">계좌 등록을 위해 <br />은행을 선택해주세요</div>

    <div class="bank-container">
      <div
        v-for="bank in banks"
        :key="bank.name"
        class="bank-list"
        :class="{ selected: selectedBank?.name === bank.name }"
        @click="selectBank(bank)"
      >
        <img :src="bank.img" class="bank-icon" />
        {{ bank.name }}
      </div>
    </div>

    <div>
      <Button variant="destructive" size="lg" class="extra-button">기타</Button>
    </div>

    <Button
      class="next-button"
      variant="default"
      :disabled="!selectedBank"
      @click="handleNextButtonClick"
    >
      다음
    </Button>
  </Main>
</template>

<style scoped>
.bank-info {
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 60px;
  margin-left: 20px;
}

.bank-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
  gap: 8px;
  flex-wrap: wrap;
}

.bank-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8%;
  border: 1px solid var(--gray);
  width: 30%;
  height: 100px;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bank-icon {
  width: 52px;
  height: 52px;
}

.extra-button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
}

.bank-list.selected {
  background-color: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.next-button {
  left: 5.13%;
  right: 5.13%;
  bottom: 80px;
  position: absolute;
  transition: all 0.3s ease;
}

.next-button:not(:disabled):hover {
  opacity: 0.9;
}
</style>

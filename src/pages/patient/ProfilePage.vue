<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import NotificationConsent from '@/components/NotificationConsent.vue';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button.vue';
import TimeSelector from '@/components/TimeSelector.vue';
import { useMealTimeStore } from '@/stores/mealtime';
import axiosInstance from '@/api/instance';
import { toast } from '@steveyuowo/vue-hot-toast';

// 은행 정보
const banks = [
  { name: '국민은행', img: '/images/banks/kb-bank.png' },
  { name: '신한은행', img: '/images/banks/shinhan-bank.png' },
  { name: '하나은행', img: '/images/banks/hana-bank.png' },
  { name: '농협은행', img: '/images/banks/nh-bank.png' },
  { name: '우리은행', img: '/images/banks/woori-bank.png' },
  { name: '기업은행', img: '/images/banks/ibk-bank.png' }
];

// 계좌 관련 상태 및 함수
const selectedBank = ref<{ name: string; img: string } | null>(null);

const selectBank = (bank: { name: string; img: string }) => {
  selectedBank.value = bank;
};

const accountNumber = ref('');
const newAccountNumber = ref('');
const accountPassword = ref('');
const bank = ref('');

const handlePasswordInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/\D/g, '').slice(0, 4);
  accountPassword.value = input.value;
};

const isFormValid = computed(() => {
  return (
    selectedBank.value !== null &&
    newAccountNumber.value.trim() !== '' &&
    accountPassword.value.length === 4
  );
});

// 복약 시간 관련 상태 및 함수
const mealTimeStore = useMealTimeStore();
const breakfastTime = ref('');
const lunchTime = ref('');
const dinnerTime = ref('');

/**약 알람 시간 변경 */
const updateMealTimes = async () => {
  mealTimeStore.updateAllMealTimes({
    breakfast: breakfastTime.value,
    lunch: lunchTime.value,
    dinner: dinnerTime.value
  });

  const updateAlarm = {
    morningAlarm: breakfastTime.value,
    lunchAlarm: lunchTime.value,
    dinnerAlarm: dinnerTime.value
  };
  console.log(updateAlarm);
  try {
    const response = await axiosInstance.patch(
      'api/patient/modify/medicineTime?userId=1',
      updateAlarm)
    toast.success('알림시간을 수정했습니다.');
    console.log(response);
  } catch (err) {
    console.log(err);
  }
};

// 알림 관련 함수

const updateAccount = async () => {
  try {
    const updateData = {
      bankNm: selectedBank.value?.name,
      accountNo: newAccountNumber.value,
      accountPw: accountPassword.value
    };

    console.log(updateData);
    const response = await axiosInstance.patch('/api/patient/modify/account?userId=1', updateData);
    console.log(response.data);

    // response.data가 정확히 boolean 값인지 확인
    if (response.data.data === true) {
      toast.success('계좌정보를 수정했습니다');
    } else if (response.data.data === false) {
      toast.error('계좌 비밀번호 틀렸습니다.');
    }
  } catch (err) {
    console.error('계좌 정보 업데이트 실패:', err);
  } finally {
    getUserInfo();
  }
};

/**시간 00:00 형식으로 변환 */
const formatTime = (alarmArray: String[]) => {
  const hours = String(alarmArray[0]).padStart(2, '0');
  const minutes = String(alarmArray[1]).padStart(2, '0'); // 분(minute)
  return `${hours}:${minutes}`;
};
/**계좌정보 수정할 때 초기화해서 들어가게 하기 */
const resetAccountForm = () => {
  selectedBank.value = null;
  newAccountNumber.value = '';
  accountPassword.value = '';
};


const getUserInfo = async () => {
  try {
    const response = await axiosInstance.get(`/api/patient/account?userId=1`);
    bank.value = response.data.data.bankNm;
    accountNumber.value = response.data.data.accountNo;
    breakfastTime.value = formatTime(response.data.data.morningAlarm);
    lunchTime.value = formatTime(response.data.data.lunchAlarm);
    dinnerTime.value = formatTime(response.data.data.dinnerAlarm);
    console.log(response.data); // 응답 데이터를 출력해 확인
  } catch (err) {
    console.log(err);
  }
};

onMounted(async () => {
  getUserInfo();
});


</script>

<template>
  <HeadBar :bg-gray="true">마이페이지</HeadBar>
  <NavBar />
  <Main :headbar="true" :navbar="true" :bg-gray="true">
    <!-- 계좌 정보 섹션 -->
    <ShadowBox :padding-x="24" :padding-y="20" :radius="false">
      <div class="settings-title">내 계좌 정보</div>
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key">은행명</div>
          <div class="settings-value">{{ bank }}</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">계좌번호</div>
          <div class="settings-value">{{ accountNumber }}</div>
        </div>
        <Dialog>
          <DialogTrigger>
            <div class="settings-row">
              <div class="settings-key">계좌 수정</div>
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>계좌 선택</DialogTitle>
            <DialogDescription> 은행을 선택하고 계좌 정보를 입력하세요 </DialogDescription>
            <div class="bank-container">
              <div
                v-for="bank in banks"
                :key="bank.name"
                class="bank-list"
                :class="{ selected: selectedBank?.name === bank.name }"
                @click="selectBank(bank)"
              >
                <img :src="bank.img" class="bank-icon" alt="bank logo" />
                {{ bank.name }}
              </div>
            </div>
            <div>
              <div class="bank-info-container">
                <Label for="bank-id-input">계좌 번호</Label>
                <Input
                  type="text"
                  inputmode="numeric"
                  id="bank-id-input"
                  v-model="newAccountNumber"
                  placeholder="계좌번호를 입력해주세요."
                />
              </div>
              <div class="bank-info-container">
                <Label for="bank-password-input">계좌 비밀번호</Label>
                <Input
                  type="password"
                  inputmode="numeric"
                  id="bank-password-input"
                  v-model="accountPassword"
                  @input="handlePasswordInput"
                  placeholder="(4자리)"
                  maxlength="4"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose @click="resetAccountForm">
                <Button size="lg" @click="updateAccount" :disabled="!isFormValid">계좌 변경</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ShadowBox>

    <!-- 복약 알림 설정 섹션 -->
    <ShadowBox :padding-x="24" :padding-y="20" :radius="false">
      <div class="settings-title">복약 알림 설정</div>
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key">아침</div>
          <div class="settings-value">{{ breakfastTime }}</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">점심</div>
          <div class="settings-value">{{ lunchTime }}</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">저녁</div>
          <div class="settings-value">{{ dinnerTime }}</div>
        </div>
        <Dialog>
          <DialogTrigger>
            <div class="settings-row">
              <div class="settings-key">복약 시간 수정</div>
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>복약 시간 수정</DialogTitle>
            <DialogDescription> 아침, 점심, 저녁 복약 시간을 설정하세요. </DialogDescription>
            <TimeSelector title="아침" v-model="breakfastTime" />
            <TimeSelector title="점심" v-model="lunchTime" />
            <TimeSelector title="저녁" v-model="dinnerTime" />
            <DialogFooter class="modal-footer">
              <DialogClose>
                <Button size="lg" @click="updateMealTimes">저장</Button>
              </DialogClose>
              <DialogClose>
                <Button variant="destructive" size="lg">닫기</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ShadowBox>

    <!-- 알림 설정 섹션 -->
    <ShadowBox :padding-x="24" :padding-y="20" :radius="false">
      <div class="settings-title">알림 설정</div>
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key">알림 수신 동의</div>
          <NotificationConsent />
        </div>
      </div>
    </ShadowBox>

    <!-- 로그아웃 및 회원탈퇴 섹션 -->
    <ShadowBox :padding-x="24" :padding-y="20" :radius="false">
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key logout">로그아웃</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">회원탈퇴</div>
        </div>
      </div>
    </ShadowBox>
  </Main>
</template>

<style scoped>
.settings-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 32px;
}

.settings-frame {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-key {
  font-size: 18px;
  font-weight: 600;
}

.settings-value {
  font-size: 16px;
  color: var(--dark-gray);
}

.logout {
  color: var(--red);
}

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.bank-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.bank-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: 1px solid var(--gray);
  width: 30%;
  height: 96px;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bank-list.selected {
  background-color: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.bank-icon {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.bank-info-container {
  margin-bottom: 20px;
}

.bank-info-container label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
}
</style>

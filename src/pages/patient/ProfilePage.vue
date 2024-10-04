<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { isSupported } from 'firebase/messaging';
import { app as firebaseApp, requestForToken, onMessageListener } from '../../firebase';
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import { useMealTimeStore } from '@/stores/mealtime';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button.vue';
import TimeSelector from '@/components/TimeSelector.vue';

const mealTimeStore = useMealTimeStore();

const breakfastTime = ref(mealTimeStore.breakfast);
const lunchTime = ref(mealTimeStore.lunch);
const dinnerTime = ref(mealTimeStore.dinner);

const fcmToken = ref<string | null>(null);

const updateMealTimes = () => {
  mealTimeStore.updateAllMealTimes({
    breakfast: breakfastTime.value,
    lunch: lunchTime.value,
    dinner: dinnerTime.value
  });
};

const requestNotificationPermission = async () => {
  try {
    const isFirebaseMessagingSupported = await isSupported();
    if (!isFirebaseMessagingSupported) {
      console.log('이 브라우저는 Firebase 클라우드 메시징을 지원하지 않습니다.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await requestForToken();
      if (token) {
        fcmToken.value = token;
        console.log('FCM 토큰:', token);
        // 여기서 토큰을 서버로 전송하거나 저장하는 로직을 추가할 수 있습니다.
      }
    } else if (permission === 'denied') {
      console.log('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      // 사용자에게 브라우저 설정에서 권한을 허용하도록 안내하는 메시지를 표시
    } else {
      console.log('알림 권한 요청에 대한 응답을 받지 못했습니다.');
    }
  } catch (error) {
    console.error('알림 권한을 얻는데 실패했습니다:', error);
  }
};

onMounted(() => {
  breakfastTime.value = mealTimeStore.breakfast;
  lunchTime.value = mealTimeStore.lunch;
  dinnerTime.value = mealTimeStore.dinner;

  // 포그라운드 메시지 리스너 설정
  onMessageListener()
    .then((payload: any) => {
      console.log('Received message while app is in foreground:', payload);
      // 여기에서 알림을 표시하거나 앱 UI를 업데이트하는 로직을 추가할 수 있습니다.
    })
    .catch((err: any) => console.log('Failed to receive foreground message:', err));
});
</script>

<template>
  <HeadBar :bg-gray="true">마이페이지</HeadBar>
  <NavBar />
  <Main :headbar="true" :navbar="true" :bg-gray="true">
    <ShadowBox :padding-x="24" :padding-y="20" :radius="false">
      <div class="settings-title">내 계좌 정보</div>
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key">은행명</div>
          <div class="settings-value">국민은행</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">계좌번호</div>
          <div class="settings-value">123-456-7890</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">계좌수정</div>
          <i class="fa-solid fa-chevron-right"></i>
        </div>
      </div>
    </ShadowBox>
    <ShadowBox :padding-x="24" :padding-y="20" :radius="false">
      <div class="settings-title">복약 알림 설정</div>
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key">아침</div>
          <div class="settings-value">{{ mealTimeStore.breakfast }}</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">점심</div>
          <div class="settings-value">{{ mealTimeStore.lunch }}</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">저녁</div>
          <div class="settings-value">{{ mealTimeStore.dinner }}</div>
        </div>
        <Dialog>
          <DialogTrigger>
            <div class="settings-row">
              <div class="settings-key">복약 시간 수정</div>
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </DialogTrigger>
          <DialogContent>
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
    <ShadowBox :padding-x="24" :padding-y="20" :radius="false">
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key">알림 권한 설정</div>
          <Button @click="requestNotificationPermission">알림 권한 요청</Button>
        </div>
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

.modal-header {
  margin-bottom: 12px;
}

.input-frame {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
</style>

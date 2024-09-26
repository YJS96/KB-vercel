<script setup lang="ts">
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import {
  Dialog,
  // DialogHeader,
  // DialogDescription,
  // DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog'

import Button from '@/components/ui/button/Button.vue';
import TimeSelector from '@/components/TimeSelector.vue';
import { ref } from 'vue';


const breakfastTime = ref('09:00');
const lunchTime = ref('12:00');
const dinnerTime = ref('18:00');

const saveTimes = () => {
  console.log('Saved times:', { breakfastTime: breakfastTime.value, lunchTime: lunchTime.value, dinnerTime: dinnerTime.value });
}

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
      <div class="settings-title">내 계좌 정보</div>
      <div class="settings-frame">
        <div class="settings-row">
          <div class="settings-key">아침</div>
          <div class="settings-value">09:00</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">점심</div>
          <div class="settings-value">12:00</div>
        </div>
        <div class="settings-row">
          <div class="settings-key">저녁</div>
          <div class="settings-value">18:00</div>
        </div>
        <Dialog>
          <DialogTrigger>
            <div class="settings-row">
              <div class="settings-key">복약 시간 수정</div>
              <i class="fa-solid fa-chevron-right"></i>
            </div>
          </DialogTrigger>
          <DialogContent>
            <!-- <DialogHeader>
              <DialogTitle>복약 시간 수정</DialogTitle>
              <DialogDescription>알림 받을 시간을 설정해주세요</DialogDescription>
            </DialogHeader> -->
            <TimeSelector title="아침" v-model="breakfastTime" />
            <TimeSelector title="점심" v-model="lunchTime" />
            <TimeSelector title="저녁" v-model="dinnerTime" />

            <DialogFooter class="modal-footer">
              <Button size="lg">저장</Button>
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
  align-items: center
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
  margin-bottom: 12px
}

.input-frame {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
</style>

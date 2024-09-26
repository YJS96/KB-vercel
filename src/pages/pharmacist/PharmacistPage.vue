<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { QrcodeStream } from 'vue-qrcode-reader';

const router = useRouter();
const isDialogOpen = ref(false);

function onDetect(detectedCodes: Array<{ rawValue: string }>) {
  const prescriptionId = detectedCodes[0]?.rawValue || 'default';
  isDialogOpen.value = false;
  router.push({
    name: '/pharmacistPayment',
    params: { id: prescriptionId }
  });
}

const error = ref('');

function onError(err: Error) {
  error.value = `오류: ${err.message}`;
}
</script>

<template>
  <HeadBar :back-button="false">약사 페이지</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="true">
    <div class="pharmacist-container">
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger asChild>
          <Button class="qr-camera">
            <i class="fa-solid fa-qrcode qr-icon"></i>
            처방전 <br />불러오기
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR 코드 스캔</DialogTitle>
            <DialogDescription>처방전 QR 코드를 스캔해주세요.</DialogDescription>
          </DialogHeader>
          <QrcodeStream @detect="onDetect" @error="onError" />
          <p v-if="error">{{ error }}</p>
        </DialogContent>
      </Dialog>

      <ShadowBox :padding-x="20" :padding-y="20" :margin-bottom="0">
        <div class="recent-list-title">
          <div>최근 처방전 내역</div>
        </div>

        <div class="divider"></div>

        <div class="recent-list">
          <div class="recent-item">
            <div class="recent-info">
              <div class="recent-group">
                <i class="fa-regular fa-file"></i>
                <div class="recent-name">한상민 환자님</div>
              </div>
              <div class="recent-date">24. 09. 10 | 오후 4:18</div>
            </div>
            <div class="recent-status">
              <i class="fa-solid fa-chevron-right"></i>
              <span class="status-text">결제 완료</span>
            </div>
          </div>

          <div class="recent-item">
            <div class="recent-info">
              <div class="recent-group">
                <i class="fa-regular fa-file"></i>
                <div class="recent-name">문환희 환자님</div>
              </div>
              <div class="recent-date">24. 09. 09 | 오전 11:30</div>
            </div>
            <div class="recent-status">
              <i class="fa-solid fa-chevron-right"></i>
              <span class="status-text">결제 완료</span>
            </div>
          </div>

          <div class="recent-item">
            <div class="recent-info">
              <div class="recent-group">
                <i class="fa-regular fa-file"></i>
                <div class="recent-name">김도은 환자님</div>
              </div>
              <div class="recent-date">24. 09. 09 | 오전 11:30</div>
            </div>
            <div class="recent-status">
              <i class="fa-solid fa-chevron-right"></i>
              <span class="status-text">결제 완료</span>
            </div>
          </div>
        </div>
      </ShadowBox>
    </div>
  </Main>
</template>

<style scoped>
.pharmacist-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
}

.qr-camera {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 120px;
  width: 120px;
  background-color: var(--css-primary);
  border: 1px solid var(--nav-gray);
  border-radius: 8px;
  margin-bottom: 40px;
  text-align: center;
  font-size: 16px;
  gap: 10px;
}

.qr-icon {
  font-size: 40px;
  margin-bottom: 5px;
}

.recent-list-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 18px;
}

.divider {
  height: 1px;
  background-color: var(--dark-gray);
  margin-bottom: 16px;
}

.recent-list {
  display: flex;
  flex-direction: column;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recent-item:last-child {
  margin-bottom: 0px;
}

.recent-info {
  display: flex;
  flex-direction: column;
}

.recent-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

/* .middot {
  width: 6px;
  height: 6px;
  border-radius: 100px;
  background-color: var(--black);
} */

.recent-name {
  font-size: 16px;
}

.recent-date {
  font-size: 14px;
  color: var(--dark-gray);
  margin-top: 4px;
  margin-left: 12px;
}

.recent-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.status-text {
  font-size: 14px;
  color: var(--kb-yellow);
}
</style>

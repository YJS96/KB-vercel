<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import Button from '@/components/ui/button/Button.vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { QrcodeStream } from 'vue-qrcode-reader';
import axiosInstance from '@/api/instance';
import { toast } from '@steveyuowo/vue-hot-toast';

// QR 코드 데이터의 타입을 정의합니다.
interface QRData {
  userId: string;
  prescriptionId: string;
  hello: string;
}

// Vue Router를 사용하기 위한 설정
const router = useRouter();

// 다이얼로그 상태를 관리하는 ref
const isDialogOpen = ref(false);

// 최근 처방전 목록을 저장하는 ref
const recentPrescriptions = ref([]);

// QR 코드가 감지되었을 때 실행되는 함수
async function onDetect(detectedCodes: Array<{ rawValue: string }>) {
  const qrDataString = detectedCodes[0]?.rawValue;
  console.log(qrDataString);
  const qrData = JSON.parse(qrDataString);
  console.log(qrData);
  let isValid = false;
  if (qrData) {
    try {
      if (qrData.hello === 'weBangapda') {
        isValid = await validateQRInfo(qrData);
      }
      if (isValid) {
        isDialogOpen.value = false;
        router.push(`/pharmacist/${qrData.prescriptionId}`);
      } else {
        toast.error('잘못된 QR 코드입니다.');
      }
    } catch (err) {
      toast.error('QR 코드 처리 중 오류가 발생했습니다.');
    }
  } else {
    toast.error('QR 코드를 읽을 수 없습니다.');
  }
}

// QR 코드 스캔 중 오류가 발생했을 때 실행되는 함수
function onError(err: Error) {
  toast.error(`QR 스캔 오류: ${err.message}`);
}

// QR 정보 유효성 검사 함수 (실제 구현 필요)
async function validateQRInfo(qrData: QRData) {
  if (qrData.prescriptionId && qrData.userId) return true;
  return false;
}

// 최근 처방전 목록을 가져오는 함수
async function fetchRecentPrescriptions() {
  try {
    const response = await axiosInstance.get('/api/pharmacy/prescription');
    // @ts-ignore
    recentPrescriptions.value = response.data.map((prescription) => ({
      id: prescription.prescriptionId,
      name: prescription.patientName,
      date: formatDate(prescription.createdAt),
      status: prescription.status
    }));
  } catch (err) {
    console.error('최근 처방전 목록을 가져오는 데 실패했습니다:', err);
  }
}

// 날짜 형식을 변환하는 함수
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear().toString().slice(2)}. ${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getDate().toString().padStart(2, '0')} | ${date.getHours() >= 12 ? '오후' : '오전'} ${date.getHours() % 12 || 12}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 컴포넌트가 마운트될 때 최근 처방전 목록을 가져옵니다.
onMounted(fetchRecentPrescriptions);
</script>

<template>
  <HeadBar :back-button="false">약사 페이지</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="true">
    <div class="pharmacist-container">
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger asChild>
          <Button class="qr-camera">
            <div class="qr-icon-container">
              <i class="fa-solid fa-qrcode"></i>
            </div>
            <div class="qr-text">
              <span class="qr-title">처방전 불러오기</span>
              <span class="qr-subtitle">QR 코드를 스캔하세요</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR 코드 스캔</DialogTitle>
          </DialogHeader>
          <QrcodeStream @detect="onDetect" @error="onError" />
        </DialogContent>
      </Dialog>
      {{}}

      <!-- <ShadowBox :padding-x="20" :padding-y="20" :margin-bottom="0">
        <div class="recent-list-title">
          <div>최근 처방전 내역</div>
        </div>
        <div class="divider"></div>
        <div class="recent-list">
          <div
            v-for="prescription in recentPrescriptions"
            :key="prescription.id"
            class="recent-item"
          >
            <div class="recent-info">
              <div class="recent-group">
                <i class="fa-regular fa-file"></i>
                <div class="recent-name">{{ prescription.name }} 환자님</div>
              </div>
              <div class="recent-date">{{ prescription.date }}</div>
            </div>
            <div class="recent-status">
              <i class="fa-solid fa-chevron-right"></i>
              <span class="status-text">{{ prescription.status }}</span>
            </div>
          </div>
        </div>
      </ShadowBox> -->
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
  align-items: center;
  width: 160px;
  height: 140px;
  background: var(--css-primary);
  border-radius: 12px;
  margin-bottom: 20px;
}

.qr-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background-color: var(--css-secondary);
  border-radius: 50%;
  margin-bottom: 20px;
}

.qr-icon-container i {
  font-size: 24px;
  color: var(--black);
}

.qr-text {
  display: flex;
  flex-direction: column;
  color: var(--black);
}

.qr-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.qr-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.error-message {
  color: #ff4b4b;
  margin-top: 10px;
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
  margin-bottom: 0;
}

.recent-info {
  display: flex;
  flex-direction: column;
}

.recent-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

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

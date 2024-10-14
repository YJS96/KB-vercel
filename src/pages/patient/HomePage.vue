<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useFaceIdStore } from '@/stores/faceId';
import { useThemeStore } from '@/stores/theme';
import { toast } from '@steveyuowo/vue-hot-toast';
import '@/assets/toast.css';
import QRCodeVue3 from 'qrcode-vue3';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import Badge from '@/components/Badge.vue';
import {
  Dialog,
  // DialogHeader,
  // DialogDescription,
  // DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Prescription {
  prescriptionPk: number;
  rescriptionNo: Number;
  duration: Number;
  description: string;
  hospitalNm: string;
  phamacyNm: string;
  prescriptionSt: boolean;
  insuranceSt: boolean;
  doctorId: Number;
  userId: Number;
  chemistId: Number;
  createYmd: string;
  hospitalSi: string;
  hospitalGu: string;
  hospitalDong: string;
  hospitalDetailAddress: string | null;
}

interface MedicineIntake {
  medInkPk: number;
  meal: MealType;
  day: [];
  eatSt: boolean;
  userId: number;
  medicineId: number;
  intakeCnt: number;
  medicineNm: string;
  caution: string;
  time: TimeType;
}

interface InjectionIntake {
  injInkPk: number;
  meal: MealType;
  eatSt: boolean;
  day: [];
  userId: number;
  injectionId: number;
  injectionNm: string;
  sideEffect: string;
}

interface Report {
  reportPk: Number;
  prescriptionPk: Number;
  intakeMethod: string;
  food: string;
  exercise: string;
}

enum MealType {
  ANYTIME = 'ANYTIME',
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER'
}

// 타입 정의 예시
const meals: Record<MealType, string> = {
  ANYTIME: '아무 때나',
  BREAKFAST: '아침',
  LUNCH: '점심',
  DINNER: '저녁'
};

enum TimeType {
  AFTER = 'AFTER',
  BEFORE = 'BEFORE'
}

const time: Record<TimeType, string> = {
  AFTER: '식사 후',
  BEFORE: '식사 전'
};

const themeStore = useThemeStore();

const showSummaryDetail = ref(false);
// 임시
const isLoaded = ref(false);

const handleSummaryDetail = () => {
  showSummaryDetail.value = !showSummaryDetail.value;
};

const faceIdStore = useFaceIdStore();

const userName = ref('임시');
faceIdStore.isAuthenticated = false;

const handleFaceIdAuth = () => {
  faceIdStore.authenticate(userName.value);
};

const selectedTab = ref(0);

const base64Audio = 'data:audio/wav;base64,12';

const audioPlayer = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);

const togglePlayPuase = async (content: string | undefined) => {
  try {
    // 오디오 변환 요청
    const res = await axiosInstance.post(`http://localhost:8000/convert`, {
      content: content
    });

    // base64 데이터를 src로 설정
    if (audioPlayer.value) {
      audioPlayer.value.src = `data:audio/wav;base64,${res.data.result}`; // 서버에서 제공하는 오디오 URL로 변경
      //console.log(audioPlayer.value.src);
    }

    if (isPlaying.value && audioPlayer.value) {
      audioPlayer.value.pause();
    } else {
      if (audioPlayer.value) {
        await audioPlayer.value.play(); // play 호출
      }
    }

    isPlaying.value = !isPlaying.value; // 재생 상태 토글
  } catch (err) {
    console.error(err);
  }
};

import axiosInstance from '@/api/instance';
import moment from 'moment';
import 'moment/locale/ko';

const NotRecievedPrescription = ref<Prescription>();

const getNotRecieved = async () => {
  await axiosInstance
    .get('/api/patient/prescription/new/list?userId=2')
    .then((res) => {
      const temp = res.data.data.prescriptionList;
      console.log(temp);
      NotRecievedPrescription.value = temp[temp.length - 1];
      // console.log(NotRecievedPrescription.value);
    })
    .catch((err) => {
      console.log(err);
    });
};

const receivedReport = ref<Report>();

const getReport = async (id: number) => {
  isLoaded.value = false; // 로딩중 화면 표시
  await axiosInstance
    .get(`/api/patient/report/get/${id}?userId=1`)
    .then((res) => {
      receivedReport.value = res.data.data;
      isLoaded.value = true; // 로딩이 완전히 끝나면 로딩중 화면 끝내기.
      //console.log(receivedReport.value);
    })
    .catch((err) => {
      console.log(err);
    });
};

const medicineIntake = ref<MedicineIntake[]>([]);
const injectionIntake = ref<InjectionIntake[]>();

const getIntake = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;

  await axiosInstance
    .get(`/api/medi/taking/list?userId=1&date=${formattedDate}`)
    .then((res) => {
      medicineIntake.value = res.data.data.medicineIntakeList;
    })
    .catch((err) => {
      console.log(err);
    });

  await axiosInstance
    .get(`/api/inj/taking/list?userId=1&date=${formattedDate}`)
    .then((res) => {
      injectionIntake.value = res.data.data.injectionIntakeList;
    })
    .catch((err) => {
      console.log(err);
    });
};

const toggleMediEatSt = async (id: number, st: boolean) => {
  try {
    const response = await axiosInstance.patch(`/api/medi/taking/comp/${id}?userId=1`);
    if (medicineIntake.value) {
      const index = medicineIntake.value.findIndex((item: MedicineIntake) => item.medInkPk === id);
      medicineIntake.value[index].eatSt = !medicineIntake.value[index].eatSt; // 업데이트된 데이터로 교체
    }

    if (!st) {
      toast.success(`약 복용 확인하였습니다`);
    } else {
      toast.error(`약 복용 취소하였습니다`);
    }
  } catch (err) {
    console.log(err);
  }
};

const recentPrescription = ref<Prescription[]>([]);
const reportPrescriptions = ref<Prescription[]>([]);

// const getRecent = async () => {
//   await axiosInstance(`/api/patient/prescription/list?userId=1&pageIndex=0&pageSize=5`)
//     .then((res) => {
//       recentPrescription.value = res.data.data.prescriptionList.slice(0, 3);

//       reportPrescriptions.value = recentPrescription.value
//         .filter((prescription) => prescription.prescriptionSt === true)
//         .slice(0, 5);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

const getRecent = async () => {
  try {
    const response = await axiosInstance(
      `/api/patient/prescription/list?userId=1&pageIndex=0&pageSize=20`
    );
    const data = response.data.data.prescriptionList;

    recentPrescription.value = await data.slice(0, 3);
    reportPrescriptions.value = await data
      .filter((prescription: Prescription) => prescription.prescriptionSt === true)
      .slice(0, 5);
    getReport(data[0].prescriptionPk);
    // console.log(reportPrescriptions.value);
  } catch (err) {
    console.log(err);
  }
};

const qrData = computed(() => ({
  userId: 1,
  prescriptionId: NotRecievedPrescription.value?.prescriptionPk,
  hello: 'weBangapda'
}));

onMounted(async () => {
  if (audioPlayer.value) {
    audioPlayer.value.src = base64Audio;
  }
  themeStore.setThemeColor('#FEDE5B');
  getNotRecieved();
  getIntake();
  getRecent();
});
</script>

<template>
  <NavBar />
  <Main :headbar="false" :navbar="true" :bg-gray="true" style="overflow-y: hidden">
    <div class="top-half">
      <div class="hospital-name">안녕하세요, 최규찬님</div>
      <ShadowBox v-if="NotRecievedPrescription" :height="120" :margin-bottom="0">
        <div class="ticket-left">
          <div>
            <div class="hospital-name">
              {{ NotRecievedPrescription.hospitalNm }}
            </div>
            <div class="hospital-address">
              {{ NotRecievedPrescription.hospitalSi }} {{ NotRecievedPrescription.hospitalGu }}
              {{ NotRecievedPrescription.hospitalDong }}
            </div>
          </div>
          <div class="ticket-date">
            <i class="fa-regular fa-calendar"></i>
            <div class="date-and-time">
              {{ moment(NotRecievedPrescription?.createYmd).format('YY. M. DD. | hh:mm') }}
            </div>
          </div>
        </div>
        <Dialog>
          <DialogTrigger>
            <div class="ticket-right" @click="handleFaceIdAuth">
              <img src="/images/qr-logo.png" alt="" />
              <div class="qr-text">약 받기</div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <div class="qr-content-frame" v-if="faceIdStore.isAuthenticated">
              <QRCodeVue3
                :value="JSON.stringify(qrData)"
                :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
                :imageOptions="{ hideBackgroundDots: false, imageSize: 0, margin: 0 }"
                :dotsOptions="{
                  type: 'square',
                  color: '#000000',
                  gradient: {
                    type: 'linear',
                    rotation: 0,
                    colorStops: [
                      { offset: 0, color: '#000000' },
                      { offset: 1, color: '#000000' }
                    ]
                  }
                }"
                :backgroundOptions="{ color: '#ffffff' }"
                :cornersSquareOptions="{ type: 'square', color: '#000000' }"
                :cornersDotOptions="{ type: undefined, color: '#000000' }"
                fileExt="png"
                myclass="my-qur"
                imgclass="img-qr"
              />
            </div>
            <div class="text-center mt-4" v-else>본인인증을 완료해주세요</div>
            <DialogFooter class="modal-footer">
              <DialogClose>
                <Button variant="destructive" size="lg">닫기</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ShadowBox>
      <div v-else class="blank-top">오늘도 건강한 하루 보내세요!</div>
    </div>
    <div
      class="bottom-half"
      :style="NotRecievedPrescription ? 'height: calc(100% - 252px)' : 'height: calc(100% - 156px)'"
    >
      <div v-if="NotRecievedPrescription" class="notice">
        <img src="/images/tada.svg" />
        <div>아직 조제받지 않은 처방전이 있어요</div>
      </div>
      <div class="flex justify-between">
        <Button variant="destructive" @click="$router.push('/login')">로그인</Button>
        <Button variant="destructive" @click="$router.push('/pharmacist')">약사</Button>
        <Button variant="destructive" @click="$router.push('/doctor')">의사</Button>
      </div>
      <div></div>
      <div></div>
      <ShadowBox :padding-x="20" :padding-y="20">
        <div class="shadow-box-title">오늘 복용 확인</div>
        <div class="summary-short-text" v-if="medicineIntake?.length === 0">
          처방 받은 약이 없습니다.
        </div>
        <div
          v-else
          v-for="intake in medicineIntake"
          class="daily-check-container"
          :key="intake.medicineId"
        >
          <div class="daily-check">
            <div class="daily-check-left">
              <div class="daily-check-text">
                {{ meals[intake.meal] }} {{ time[intake.time] }} 알약 {{ intake.intakeCnt }}개
              </div>
              <Badge v-for="c in intake.caution.split(',')" :key="c">{{ c }}</Badge>
            </div>
            <Button
              :variant="intake.eatSt ? 'destructive' : 'default'"
              @click="toggleMediEatSt(intake.medInkPk, intake.eatSt)"
              >{{ intake.eatSt ? '취소' : '확인' }}
            </Button>
          </div>
          <!-- <div class="daily-check">
            <div class="daily-check-left">
              <div class="daily-check-text">점심 식사 후 알약 3개</div>
              <Badge>졸음</Badge>
            </div>
            <Button
              :variant="medicationStore.afternoon ? 'destructive' : 'default'"
              @click="medicationStore.toggleMedication('afternoon')"
              >{{ medicationStore.afternoon ? '취소' : '확인' }}</Button
            >
          </div>
          <div class="daily-check">
            <div class="daily-check-left">
              <div class="daily-check-text">저녁 식사 후 알약 3개</div>
              <Badge>졸음</Badge>
            </div>
            <Button
              :variant="medicationStore.evening ? 'destructive' : 'default'"
              @click="medicationStore.toggleMedication('evening')"
              >{{ medicationStore.evening ? '취소' : '확인' }}</Button
            >
          </div> -->
        </div>
      </ShadowBox>

      <ShadowBox :padding-x="20" :padding-y="20">
        <div>
          <div class="title-with-arrow" @click="handleSummaryDetail()">
            <div class="shadow-box-title">최규찬님의 건강 리포트</div>
            <i
              v-if="reportPrescriptions.length"
              class="fa-solid fa-chevron-down"
              :class="{ rotate: showSummaryDetail }"
            ></i>
          </div>
          <div v-if="showSummaryDetail && reportPrescriptions.length">
            <div class="tab-select-container">
              <span
                v-for="tabIndex in reportPrescriptions?.length"
                :key="tabIndex - 1"
                class="tab"
                :class="{ selected: tabIndex - 1 === selectedTab }"
                @click="
                  (selectedTab = tabIndex - 1),
                    getReport(reportPrescriptions[tabIndex - 1].prescriptionPk)
                "
                >{{ reportPrescriptions[tabIndex - 1].hospitalNm }}</span
              >
            </div>
            <div></div>
            <div v-if="isLoaded">
              <div>
                <div class="report-top">
                  <div class="flex">
                    <div class="report-icon">
                      <img src="/images/report-pill.svg" alt="" />
                    </div>
                    <div class="flex flex-col justify-center">
                      <span class="report-title">약 복용방법</span>
                      <span class="date-and-time">약에 대한 주의사항을 알려드려요</span>
                    </div>
                  </div>
                  <img
                    src="/images/report-speaker.svg"
                    alt="speaker"
                    @click="togglePlayPuase(receivedReport?.intakeMethod)"
                    :class="{ playing: isPlaying }"
                  />
                </div>
                <div class="report-content mb-5">
                  {{ receivedReport?.intakeMethod }}
                </div>
              </div>
              <!-- <hr class="report-content-bottom" /> -->
              <div>
                <div class="report-top">
                  <div class="flex">
                    <div class="report-icon exercise">
                      <img src="/images/report-workout.svg" alt="" />
                    </div>
                    <div class="flex flex-col justify-center">
                      <span class="report-title">운동 요령</span>
                      <span class="date-and-time">이런 활동을 하면 좋아요</span>
                    </div>
                  </div>
                  <img
                    src="/images/report-speaker.svg"
                    alt="speaker"
                    @click="togglePlayPuase(receivedReport?.exercise)"
                    :class="{ playing: isPlaying }"
                  />
                </div>
                <div class="report-content mb-5">
                  {{ receivedReport?.exercise }}
                </div>
                <!-- <hr class="report-content-bottom" /> -->
              </div>
              <div>
                <div class="report-top">
                  <div class="flex">
                    <div class="report-icon food">
                      <img src="/images/report-food.svg" alt="" />
                    </div>
                    <div class="flex flex-col justify-center">
                      <span class="report-title">식이요법 추천</span>
                      <span class="date-and-time">이런 음식은 피하고 주의하세요</span>
                    </div>
                  </div>
                  <img
                    src="/images/report-speaker.svg"
                    alt="speaker"
                    @click="togglePlayPuase(receivedReport?.food)"
                    :class="{ playing: isPlaying }"
                  />
                </div>
                <div class="report-content">
                  {{ receivedReport?.food }}
                </div>
              </div>
            </div>

            <div v-else>
              <div class="report-title-load">
                <Skeleton class="report-icon-load" />
                <div class="flex flex-col gap-1">
                  <Skeleton class="h-4 w-[124px]" />
                  <Skeleton class="h-4 w-[124px]" />
                </div>
              </div>
              <div class="report-content-load">
                <Skeleton class="h-4 w-full"> </Skeleton>
                <Skeleton class="h-4 w-full"> </Skeleton>
              </div>
            </div>
          </div>
          <div v-else class="summary-short-text">
            처방전을 기반으로 여러 주의사항들을 알려드려요
          </div>
        </div>
      </ShadowBox>

      <ShadowBox :padding-x="20" :padding-y="20">
        <div class="title-with-arrow" @click="$router.push('/prescription')">
          <div class="shadow-box-title">최근 처방전 내역</div>
          <i v-if="recentPrescription.length" class="fa-solid fa-chevron-right"></i>
        </div>
        <div v-if="recentPrescription.length === 0" class="summary-short-text">
          등록된 처방전이 없어요
        </div>
        <div v-else class="prescription-container">
          <div v-for="prescription in recentPrescription" :key="prescription.prescriptionPk">
            <div class="flex justify-between">
              <div class="flex items-center">
                <div class="middot"></div>
                <span class="history-title">{{ prescription.hospitalNm }}</span>
              </div>
              <div class="history-title" :class="{ received: !prescription.prescriptionSt }">
                {{ prescription.prescriptionSt ? '수령완료' : '미수령' }}
              </div>
            </div>
            <div class="history-date">24. 09. 10 | 오후 4:18</div>
          </div>
        </div>
      </ShadowBox>
    </div>
    <audio ref="audioPlayer" @play="isPlaying = true" @pause="isPlaying = false"></audio>
  </Main>
</template>

<style scoped>
.top-half {
  width: 100%;
  background-color: var(--css-primary);
  border-radius: 0 0 16px 16px;
  padding: 36px 5.13% calc(5.13% + 4px);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.notice {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--dark-gray);
  margin-bottom: 16px;
  gap: 2px;
  background-color: var(--gray);
  border-radius: 10px;
}

.ticket-left {
  position: relative;
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 20px;
}

.ticket-right {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 30%;
  background-color: #ffeeab;
  border-radius: 0 10px 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.hospital-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 2px;
}

.hospital-address {
  font-size: 14px;
  color: var(--dark-gray);
}

.date-and-time {
  font-size: 12px;
  color: var(--dark-gray);
}

.ticket-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  columns: var(--dark-gray);
}

.fa-calendar {
  color: var(--dark-gray);
}

.qr-text {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.shadow-box-title {
  font-weight: 600;
  font-size: 18px;
}

.bottom-half {
  padding: 0 5.13% 40px;
  /* height: calc(100% - 236px);*/
  overflow-y: scroll;
  /* padding-top: 20px; */
  margin-top: 20px;
}

.daily-check-container {
  margin-top: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.daily-check {
  display: flex;
  justify-content: space-between;
}

.daily-check-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.daily-check-text {
  font-size: 16px;
}

.title-with-arrow {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.summary-short-text {
  margin-top: 16px;
  font-size: 16px;
}

.prescription-container {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  gap: 16px;
}

.fa-chevron-down {
  transition: transform 0.3s ease;
}

.fa-chevron-down.rotate {
  transform: rotate(180deg);
}

.tab-select-container {
  display: flex;
  margin: 16px 0;
  width: 100%;
  gap: 8px;
  overflow-x: scroll;
  white-space: nowrap;
}

.tab-select-container::-webkit-scrollbar {
  display: none !important;
}

.tab {
  font-size: 12px;
  border-radius: 20px;
  color: var(--css-muted);
  border: 1px solid var(--css-muted);
  padding: 4px 12px;
  transition: all 0.2s ease;
}

.tab:last-child {
  margin-right: 20px;
}
.tab:hover {
  background-color: var(--css-muted);
  color: var(--white);
}

.tab.selected {
  background-color: var(--css-muted);
  color: var(--white);
}

.report-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.report-icon {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background-color: #febbb1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
}

.report-icon-load {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  margin-right: 8px;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
}

.report-title-load {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.report-content {
  font-size: 15px;
}

.report-content-load {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.middot {
  width: 6px;
  height: 6px;
  border-radius: 100px;
  background-color: var(--black);
  margin-right: 6px;
}

.history-title {
  font-size: 16px;
  font-weight: 500;
}

.history-title.received {
  color: var(--red);
}

.history-date {
  margin-left: 12px;
  font-size: 12px;
  color: var(--dark-gray);
}

.qr-content-frame {
  margin-top: 20px;
  margin-bottom: 4px;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 8px;
  border: 1px solid var(--gray);
  border-radius: 4px;
}

.modal-footer {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
}

.report-top img {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.report-top img.playing {
  transform: scale(1.2);
}

.exercise {
  background-color: #fef0e3;
}

.food {
  background-color: #d6ebb5;
}

.report-content-bottom {
  margin: 16px;
  margin-bottom: 20px;
}
</style>

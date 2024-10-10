<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import moment from 'moment';
import { Toaster } from '@steveyuowo/vue-hot-toast';
import '@/assets/toast.css';
import 'moment/locale/ko';
import { useThemeStore } from '@/stores/theme';
import { useMedicationStore } from '@/stores/medication';
import { useMealTimeStore } from '@/stores/mealtime';
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import Badge from '@/components/Badge.vue';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/api/instance';
import { toast } from '@steveyuowo/vue-hot-toast';


interface medicineIntake  {
  medInkPk : Number;
  meal : string;
  day : [];
  eatSt : boolean;
  userId : Number;
  medicineId : Number;
  intakeCnt : Number;
  medicineNm : string;
  caution : string;
}

interface injectionIntake {
  injInkPk : Number;
  meal : string;
  eatSt : boolean;
  day : [];
  userId : Number;
  injectionId : Number;
  injectionNm : string;
  sideEffect : string;
}

const medicationStore = useMedicationStore();
const mealTimeStore = useMealTimeStore();

const themeStore = useThemeStore();
setTimeout(() => {
  themeStore.setThemeColor('#FDFDFD');
}, 10);

const time: Record<"ANYTIME" | "BREAKFAST" | "LUNCH" | "DINNER", string> = {
  "ANYTIME": "매 식사마다",
  "BREAKFAST": "아침",
  "LUNCH": "점심",
  "DINNER": "저녁"
};


const getTimeValue = (key: keyof typeof time): string => {
  return time[key] || "";
};


const timeBA: Record<"AFTER" | "BEFORE", string> = {
  "AFTER" : "식사 후",
  "BEFORE" : "식사 전"
}

const getBAValue = (key: keyof typeof timeBA) :string => {
  return timeBA[key] || "";
};

moment.locale('ko');
const today = moment();
const selectedDate = ref(today);
const calendarContainer = ref<HTMLElement | null>(null);

const dateRange = computed(() => {
  const dates = [];
  for (let i = -14; i < 21; i++) {
    dates.push(moment(today).add(i, 'days'));
  }
  return dates;
});

const selectDate = (date: moment.Moment) => {
  selectedDate.value = date;
  getIntake(date.format('YYYY-MM-DD'));
};

const isSelected = (date: moment.Moment) => {
  return date.isSame(selectedDate.value, 'day');
};

const isSaturday = (date: moment.Moment) => {
  return date.day() === 6;
};

const isSunday = (date: moment.Moment) => {
  return date.day() === 0;
};

const getKoreanWeekday = (date: moment.Moment): string => {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return weekdays[date.day()];
};

const medicineIntakeList = ref();
const injectionIntakeList = ref();

const getIntake = async(date : string) => {
  await axiosInstance.get(`/api/medi/taking/list?userId=1&date=${date}`)
  .then(res => {
    medicineIntakeList.value = res.data.data.medicineIntakeList;
  }).catch(err => {
    console.log(err);
  })

  await axiosInstance.get(`/api/inj/taking/list?userId=1&date=${date}`)
  .then(res => {
    injectionIntakeList.value = res.data.data.injectionIntakeList;
  }).catch(err => {
    console.log(err);
  })
}

const toggleMediEatSt = async(id:number, st:boolean) => {
  try {
    const index = medicineIntakeList.value.findIndex((item:medicineIntake) => item.medInkPk === id);

    if(today.format('YYYY-MM-DD') !== medicineIntakeList.value[index].day.map((num: Number) => String(num).padStart(2, '0')).join('-')){
      toast.error('다른 날짜는 처리할 수 없습니다.');
      return;
    }

    const response = await axiosInstance.patch(`/api/medi/taking/comp/${id}?userId=1`);
    
    if (index !== -1) {
      medicineIntakeList.value[index].eatSt = !medicineIntakeList.value[index].eatSt; // 업데이트된 데이터로 교체
    }

    if (!st) {
        toast.success(`약 복용 확인하였습니다`);
      } else {
        toast.error(`약 복용 취소하였습니다`);
      }
  } catch(err) {
    console.log(err);
  }
}

const toggleInjEatSt = async(id:number, st:boolean) => {
  try {
    const index = injectionIntakeList.value.findIndex((item:injectionIntake) => item.injInkPk === id);

    if(today.format('YYYY-MM-DD') !== injectionIntakeList.value[index].day.map((num: Number) => String(num).padStart(2, '0')).join('-')){
      toast.error('다른 날짜는 처리할 수 없습니다.');
      return;
    }

    const response = await axiosInstance.patch(`/api/inj/taking/comp/${id}?userId=1`);
    
    if (index !== -1) {
      injectionIntakeList.value[index].eatSt = !injectionIntakeList.value[index].eatSt; // 업데이트된 데이터로 교체
    }

    if (!st) {
        toast.success(`약 복용 확인하였습니다`);
      } else {
        toast.error(`약 복용 취소하였습니다`);
      }
  } catch(err) {
    console.log(err);
  }
}

onMounted(() => {
  if (calendarContainer.value) {
    const tomorrowElement = calendarContainer.value.querySelector('.day-frame:nth-child(15)');
    if (tomorrowElement) {
      const containerRect = calendarContainer.value.getBoundingClientRect();
      const tomorrowRect = tomorrowElement.getBoundingClientRect();
      const scrollPosition = tomorrowRect.left - containerRect.left - 24;
      calendarContainer.value.scrollLeft = scrollPosition;
    }
  }
  getIntake(today.format('YYYY-MM-DD'));
});





</script>

<template>
  <Toaster />
  <HeadBar>복용약</HeadBar>
  <NavBar />
  <Main :headbar="true" :navbar="true" :bg-gray="true">
    <div class="calendar-container" ref="calendarContainer">
      <div
        v-for="date in dateRange"
        class="day-frame"
        @click="selectDate(date)"
        :key="date.format('YYYY-MM-DD')"
      >
        <span class="weekday" :class="{ isSaturday: isSaturday(date), isSunday: isSunday(date) }">{{
          getKoreanWeekday(date)
        }}</span>
        <span class="day" :class="{ isSelected: isSelected(date) }">{{ date.format('D') }}</span>
      </div>
    </div>

<!-- 약 -->
    <ShadowBox v-for="intake in medicineIntakeList" :padding-x="20" :padding-y="20" :margin-bottom="12" :radius="false">
      <div class="day-alert-top">
        <div class="meal-and-time">
          <span class="meal">{{getTimeValue(intake.meal)}}</span>
          <span class="meal-time">{{ mealTimeStore.breakfast }}</span>
        </div>
        <Button
          :variant="(intake.eatSt) ? 'destructive' : 'default'"
          @click="toggleMediEatSt(intake.medInkPk, intake.eatSt)"
          >{{ intake.eatSt ? '취소' : '확인' }}
        </Button>
      </div>
      <div class="medicine-list">

        <div class="medicine-info-frame" @click="$router.push(`/medicine/${intake.medicineId}`)">
          <div class="medicine-info-left">
            <div class="medicine-icon-name">
              <div class="medicine-icon"></div>
              <span class="medicine-name">{{ intake.medicineNm }}</span>
            </div>
            <div class="medicine-badge-frame">
              <Badge v-for="c in intake.caution.split(',')">{{ c }}</Badge>
            </div>
          </div>
          <span class="medicine-intake">{{ intake.intakeCnt }}정</span>
        </div>

      </div>
    </ShadowBox>

<!-- 여기부턴 주사제임 -->
    <ShadowBox v-for="intake in injectionIntakeList" :padding-x="20" :padding-y="20" :margin-bottom="12" :radius="false">
      <div class="day-alert-top">
        <div class="meal-and-time">
          <span class="meal">{{getTimeValue(intake.meal)}}</span>
          <span class="meal-time">{{ mealTimeStore.breakfast }}</span>
        </div>
        <Button
          :variant="(intake.eatSt) ? 'destructive' : 'default'"
          @click="toggleInjEatSt(intake.injInkPk, intake.eatSt)"
          >{{ intake.eatSt ? '취소' : '확인' }}
        </Button>
      </div>
      <div class="medicine-list">

        <div class="medicine-info-frame" @click="$router.push(`/injection/${intake.injectionId}`)">
          <div class="medicine-info-left">
            <div class="medicine-icon-name">
              <div class="medicine-icon"></div>
              <span class="medicine-name">{{ intake.injectionNm }}</span>
            </div>
            <div class="medicine-badge-frame">
              <Badge v-for="c in (intake.sideEffect ? intake.sideEffect.split(',').filter(Boolean) : [])" :key="c">
                {{ c }}
              </Badge>
            </div>
          </div>
          <!-- <span class="medicine-intake">{{ intake.intakeCnt }}회</span> -->
        </div>

      </div>
    </ShadowBox>


<!-- 

  <ShadowBox :padding-x="20" :padding-y="20" :margin-bottom="12" :radius="false">
    <div class="day-alert-top">
      <div class="meal-and-time">
        <span class="meal">점심</span>
        <span class="meal-time">{{ mealTimeStore.lunch }}</span>
      </div>
      <Button
      :variant="medicationStore.afternoon ? 'destructive' : 'default'"
      @click="medicationStore.toggleMedication('afternoon')"
      >{{ medicationStore.afternoon ? '취소' : '확인' }}</Button
      >
    </div>
    <div class="medicine-list">
      <div class="medicine-info-frame" @click="$router.push('/medicine/1')">
        <div class="medicine-info-left">
          <div class="medicine-icon-name">
            <div class="medicine-icon">

            </div>
            <span class="medicine-name">코푸정</span>
          </div>
          <div class="medicine-badge-frame">
            <Badge>졸음</Badge>
            <Badge>어지러움</Badge>
          </div>
        </div>
        <span class="medicine-intake">1정</span>
      </div>
    </div>
  </ShadowBox>
  <ShadowBox :padding-x="20" :padding-y="20" :margin-bottom="12" :radius="false">
    <div class="day-alert-top">
      <div class="meal-and-time">
        <span class="meal">저녁</span>
        <span class="meal-time">{{ mealTimeStore.dinner }}</span>
      </div>
      <Button
      :variant="medicationStore.evening ? 'destructive' : 'default'"
      @click="medicationStore.toggleMedication('evening')"
      >{{ medicationStore.evening ? '취소' : '확인' }}</Button
      >
    </div>
    <div class="medicine-list">
      <div class="medicine-info-frame" @click="$router.push('/medicine/1')">
        <div class="medicine-info-left">
          <div class="medicine-icon-name">
            <div class="medicine-icon">

            </div>
            <span class="medicine-name">코푸정</span>
          </div>
          <div class="medicine-badge-frame">
            <Badge>졸음</Badge>
            <Badge>어지러움</Badge>
          </div>
        </div>
        <span class="medicine-intake">1정</span>
      </div>
    </div>
  </ShadowBox>
-->
</Main>
</template>

<style scoped>
.calendar-container {
  width: 100%;
  background-color: var(--white);
  padding: 16px 0 16px 24px;
  display: flex;
  gap: 36px;
  overflow-x: scroll;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;
}

.day-frame {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: var(--dark-gray);
}

.day-frame:last-child {
  margin-right: 48px;
}

.weekday {
  font-size: 16px;
}

.weekday.isSaturday {
  color: var(--blue);
}

.weekday.isSunday {
  color: var(--red);
}

.day {
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.day.isSelected {
  color: var(--black);
  background-color: var(--css-primary);
}

.day-alert-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.meal-and-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meal {
  font-size: 22px;
  font-weight: 600;
}

.meal-time {
  font-size: 12px;
}

.medicine-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.medicine-info-frame {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.medicine-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.medicine-icon-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.medicine-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-color: var(--gray);
  display: flex;
  justify-content: center;
  align-items: center;
}

.medicine-name {
  font-size: 18px;
  font-weight: 500;
}

.medicine-badge-frame {
  display: flex;
  gap: 8px;
}

.medicine-intake {
  font-size: 18px;
  font-weight: 500;
}
</style>

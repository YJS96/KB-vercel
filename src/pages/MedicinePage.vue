<script setup lang="ts">
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue'
import ShadowBox from '@/components/ShadowBox.vue';
import Badge from '@/components/Badge.vue';

import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
setTimeout(() => {
  themeStore.setThemeColor('#FDFDFD')
}, 10);

</script>

<template>
  <HeadBar>복용약</HeadBar>
  <NavBar />
  <Main :headbar="true" :navbar="true" :bg-gray="true">
    <div class="calendar-container">
      <div class="day-frame">
        <span class="weekday">수</span>
        <span class="day" :class="{isToday: true}">11</span>
      </div>
      <div class="day-frame">
        <span class="weekday">목</span>
        <span class="day">12</span>
      </div>
      <div class="day-frame">
        <span class="weekday">금</span>
        <span class="day">13</span>
      </div>
      <div class="day-frame">
        <span class="weekday" :class="{isSaturday: true}">토</span>
        <span class="day" >14</span>
      </div>
      <div class="day-frame">
        <span class="weekday" :class="{isSunday: true}">일</span>
        <span class="day">15</span>
      </div>
      <div class="day-frame">
        <span class="weekday">월</span>
        <span class="day">16</span>
      </div>
      <div class="day-frame">
        <span class="weekday">수</span>
        <span class="day">11</span>
      </div>
      <div class="day-frame">
        <span class="weekday">수</span>
        <span class="day">11</span>
      </div>
      <div class="day-frame">
        <span class="weekday">수</span>
        <span class="day">11</span>
      </div>
      <div class="day-frame">
        <span class="weekday">수</span>
        <span class="day">11</span>
      </div>
    </div>
    <ShadowBox :padding-x="20" :padding-y="20" :margin-bottom="12" :radius="false">
      <div class="day-alert-top">
        <div class="meal-and-time">
          <span class="meal">아침</span>
          <span class="meal-time">오전 09:00</span>
        </div>
        <Button variant="destructive">취소</Button>
      </div>
      <div class="medicine-list">
        <div class="medicine-info-frame" @click="$router.push('/medicine/1')">
          <div class="medicine-info-left">
            <div class="medicine-icon-name">
              <div class="medicine-icon">
                <!-- 아이콘 들어갈 자리 -->
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
  font-size: 18px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  justify-content: center;
  align-items: center;
  
}

.day.isToday {
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

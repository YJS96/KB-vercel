<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue';
import axiosInstance from '@/api/instance';
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';

interface Prescription {
  prescriptionPk: number;
  prescriptionNo: number;
  duration: number;
  description: string;
  prescriptionSt: boolean;
  insuranceSt: boolean;
  doctorId: number | null;
  userId: number | null;
  chemistId: number | null;
}

const prescriptions = ref<Prescription[]>([]);
const pageIndex = ref(0);
const pageSize = 6;
const loading = ref(false);
const hasMore = ref(true);

const fetchPrescriptions = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;

  try {
    const response = await axiosInstance.get(
      `api/patient/prescription/list?userId=1&pageIndex=${pageIndex.value}&pageSize=${pageSize}`
    );
    const newPrescriptions: Prescription[] = response.data.data.prescriptionList;
    prescriptions.value = [...prescriptions.value, ...newPrescriptions];
    pageIndex.value++;
    hasMore.value = newPrescriptions.length === pageSize;
    console.log(response.data.data);
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const handleScroll = () => {
  const scrollContainer = document.querySelector('.scroll-container');

  if (scrollContainer) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading.value) {
      fetchPrescriptions();
    }
  }
};

onMounted(() => {
  fetchPrescriptions();
  const scrollContainer = document.querySelector('.scroll-container');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  const scrollContainer = document.querySelector('.scroll-container');
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
});
</script>

<template>
  <HeadBar :bg-gray="true">처방전</HeadBar>
  <NavBar />
  <Main class="scroll-container" :headbar="true" :navbar="true" :padded="true" :bg-gray="true">
    <ShadowBox
      v-for="prescription in prescriptions"
      :key="prescription.prescriptionPk"
      class="shadow-box"
      :padding-x="20"
      :padding-y="20"
      :height="156"
      @click="$router.push(`/prescription/${prescription.prescriptionPk}`)"
    >
      <div class="presc-top">
        <div>
          <div class="name-hospital">{{ prescription.prescriptionPk }}김성헌 내과의원</div>
          <div class="name-pharm">어린이대공원약국</div>
        </div>
        <div class="name-hospital red">D-3</div>
      </div>
      <div class="presc-bottom">
        <div class="type-date">
          <div class="type">
            <i class="fa-solid fa-virus"></i>
            <span>감기</span>
          </div>
          <span>24. 09. 10 | 오후 4:18</span>
        </div>
        <div class="intake-day">
          <div class="per-day">1일 3회</div>
          <div class="duration">3일치</div>
        </div>
      </div>
    </ShadowBox>
    <div class="infinite-loading" v-if="loading">로딩중</div>
    <div class="infinite-nomore" v-if="!hasMore">더 이상 처방전이 없습니다</div>
  </Main>
</template>

<style scoped>
.shadow-box {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.presc-top {
  display: flex;
  justify-content: space-between;
}

.name-hospital {
  font-size: 20px;
  font-weight: 600;
}

.name-pharm {
  font-size: 14px;
  color: var(--dark-gray);
  margin-top: -2px;
}

.red {
  color: var(--red);
}

.presc-bottom {
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.type-date {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: var(--dark-gray);
}

.type {
  display: flex;
  gap: 4px;
  align-items: center;
}

.intake-day {
  text-align: end;
}

.per-day {
  font-size: 12px;
  color: var(--dark-gray);
}

.duration {
  font-size: 24px;
  font-weight: 600;
  margin-right: -1px;
  margin-top: -3px;
  margin-bottom: -4px;
}

.infinite-loading {
  text-align: center;
  margin-top: 20px;
  color: var(--dark-gray);
}

.infinite-nomore {
  text-align: center;
  margin: 48px 0;
  color: var(--dark-gray);
}
</style>

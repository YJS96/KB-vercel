<script setup lang="ts">
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import axiosInstance from '@/api/instance';
import { onMounted, ref } from 'vue';

interface MedicineDetail {
  medicineNm: string;
  medicineCd: string;
  efficacy: string;
  imageUrl: string;
  unit: string;
  caution: string;
  // 기타 필요한 속성들...
}

const medicineDetails = ref<MedicineDetail | null>(null);

const fetchMedicineDetails = async () => {
  try {
    const response = await axiosInstance.get(`/api/medi/detail/5?userId=5`);
    medicineDetails.value = response.data.data;
    console.log(medicineDetails.value);
  } catch (error) {
    console.error('약 상세 정보를 가져오는데 실패했습니다:', error);
    // 에러 처리 로직 추가 (예: 사용자에게 알림)
  }
};

onMounted(fetchMedicineDetails);

const selectedLeft = ref(true);
</script>

<template>
  <HeadBar :back-button="true" :bg-gray="true">약 상세</HeadBar>
  <NavBar />
  <Main :headbar="true" :navbar="true" :bg-gray="true">
    <div class="detail-frame" v-if="medicineDetails">
      <ShadowBox :padding-y="48" :padding-x="48" :margin-bottom="0" class="detail-container">
        <div class="pill-frame">
          <img :src="medicineDetails.imageUrl" alt="약 이미지" />
        </div>

        <div class="pill-info">
          <div class="pill-name">{{ medicineDetails.medicineNm }}</div>
        </div>
        <div class="effect-frame">
          <div
            v-for="effect in medicineDetails.efficacy.split(',')"
            :key="effect"
            class="effect-badge"
          >
            {{ effect.trim() }}
          </div>
        </div>
      </ShadowBox>
    </div>

    <ShadowBox :radius="false">
      <div class="tab-frame">
        <div class="tab" :class="selectedLeft ? 'selected' : ''" @click="selectedLeft = true">
          복용방법
        </div>
        <div class="tab" :class="selectedLeft ? '' : 'selected'" @click="selectedLeft = false">
          주의사항
        </div>
      </div>
      <!-- 복용방법과 주의사항 탭 내용 수정 -->
      <div v-if="selectedLeft" class="info">
        {{ medicineDetails?.unit }}
      </div>
      <div v-else class="info">
        {{ medicineDetails?.caution }}
      </div>
    </ShadowBox>
  </Main>
</template>

<style scoped>
.detail-frame {
  margin-top: 8px;
  width: 100%;
  padding: 0 5.13%;
  margin-bottom: 24px;
}

.detail-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.pill-frame {
  width: 128px;
  height: 128px;
  background-color: var(--gray);
  border-radius: 12px;
}

.pill-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.pill-company {
  font-size: 16px;
  color: var(--dark-gray);
}

.pill-name {
  font-size: 26px;
  font-weight: 600;
}

.effect-frame {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  row-gap: 8px;
  column-gap: 10px;
}

.effect-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 40px;
  background-color: var(--gray);
}

.tab-frame {
  display: flex;
  height: 48px;
  padding-top: 2px;
}

.tab {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 2px solid var(--white);
  color: var(--dark-gray);
}

.tab.selected {
  color: var(--black);
  border-bottom: 2px solid var(--css-primary);
}

.info {
  padding: 16px 24px;
  font-size: 14px;
}
</style>


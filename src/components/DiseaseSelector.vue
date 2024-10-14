<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/api/instance';  // axios 인스턴스 가져오기

interface Disease {
  diseasePk: number;
  diseaseCd: string;
}

// Props로 선택된 질병 코드를 전달 받음
const props = defineProps<{
  modelValue: string;  // modelValue를 string 타입으로 설정
}>();

const emit = defineEmits(['update:modelValue']);

// 질병 코드 리스트를 저장하는 ref
const diseaseCodes = ref<Disease[]>([]);

// 선택된 질병 코드를 관리하는 computed 속성
const selectedDiseaseCode = computed({
  get: () => props.modelValue,  // string 타입으로 받음
  set: (value: string) => emit('update:modelValue', value),  // string 타입으로 emit
});

// 백엔드에서 질병 코드 리스트를 가져오는 함수
const fetchDiseaseCodes = async () => {
  try {
    const response = await axiosInstance.get('/api/hospital/disease');  // 실제 API 엔드포인트로 변경
    // 응답 데이터에서 diseaseList를 추출
    diseaseCodes.value = response.data.data.diseaseList;
  } catch (error) {
    console.error('Error fetching disease codes:', error);
  }
};

// 컴포넌트가 마운트될 때 질병 코드 리스트를 가져옵니다.
onMounted(() => {
  fetchDiseaseCodes();
});
</script>

<template>
  <Select v-model="selectedDiseaseCode">
    <SelectTrigger>
      <SelectValue :placeholder="selectedDiseaseCode ? diseaseCodes.find(d => d.diseasePk.toString() === selectedDiseaseCode)?.diseaseCd : '질병 코드를 선택하세요'" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="disease in diseaseCodes"
        :key="disease.diseasePk"
        :value="disease.diseasePk.toString()"  
      >
        {{ disease.diseaseCd }} <!-- 화면에 보이는 질병 코드 -->
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<style scoped>
/* 필요에 따라 스타일 추가 */
</style>

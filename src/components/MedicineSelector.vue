<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/api/instance';  // axios 인스턴스 가져오기

interface Medicine {
  medicinePk: number;
  medicineNm: string;
}

// Props로 선택된 약을 전달 받음
const props = defineProps<{
  modelValue: string;  // modelValue를 string 타입으로 설정
}>();

const emit = defineEmits(['update:modelValue', 'update:medicineName']);  // 약 이름을 별도로 emit

// 약 리스트를 저장하는 ref
const medicines = ref<Medicine[]>([]);

// 선택된 약을 관리하는 computed 속성
const selectedMedicine = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    const selectedMedicine = medicines.value.find(m => m.medicinePk.toString() === value);
    
    // 선택된 약의 PK와 이름을 각각 전달
    emit('update:modelValue', value);  // modelValue (선택된 약의 PK)
    emit('update:medicineName', selectedMedicine?.medicineNm || '');  // 선택된 약의 이름
  }
});

// 백엔드에서 약 리스트를 가져오는 함수
const fetchMedicines = async () => {
  try {
    const response = await axiosInstance.get('/api/medi/list');  // 실제 API 경로
    // 받아온 데이터에서 medicineList를 추출
    medicines.value = response.data.data.medicineList;
  } catch (error) {
    console.error('Error fetching medicines:', error);
  }
};

// 컴포넌트가 마운트될 때 약 리스트를 가져옴
onMounted(() => {
  fetchMedicines();
});
</script>

<template>
  <Select v-model="selectedMedicine">
    <SelectTrigger>
      <!-- 선택된 약 이름을 표시, 선택된 값이 없으면 placeholder 표시 -->
      <SelectValue :placeholder="selectedMedicine ? medicines.find(m => m.medicinePk.toString() === selectedMedicine)?.medicineNm : '약 이름을 선택하세요'" />
    </SelectTrigger>
    <SelectContent>
      <!-- 약 리스트에서 id와 name을 사용 -->
      <SelectItem
        v-for="(medicine) in medicines"
        :key="medicine.medicinePk"
        :value="medicine.medicinePk.toString()"  
      >
        {{ medicine.medicineNm }}  <!-- 화면에 보이는 약 이름 -->
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<style scoped>
/* 필요에 따라 스타일 추가 */
</style>

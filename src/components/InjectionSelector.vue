<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/api/instance';  // axios 인스턴스 가져오기

interface Injection {
  injectionPk: number;
  injectionNm: string;
}

// Props로 선택된 주사를 전달 받음
const props = defineProps<{
  modelValue: string;  // modelValue를 string 타입으로 설정
}>();

const emit = defineEmits(['update:modelValue','update:injectionName']);

// 주사 리스트를 저장하는 ref
const injections = ref<Injection[]>([]);

// 선택된 주사를 관리하는 computed 속성
const selectedInjection = computed({
  get: () => props.modelValue,  // string 타입으로 받음
  set: (value: string) => {
    const selectedInjection=injections.value.find(m=>m.injectionPk.toString()===value);
    emit('update:modelValue', value),  // string 타입으로 emit
    emit('update:injectionName',selectedInjection?.injectionNm||'');
  }
});

// 백엔드에서 주사 리스트를 가져오는 함수
const fetchInjections = async () => {
  try {
    const response = await axiosInstance.get('/api/hospital/injection');  // 실제 API 경로
    // 받아온 데이터에서 injectionList를 추출
    injections.value = response.data.data.injectionList;
  } catch (error) {
    console.error('Error fetching injections:', error);
  }
};

// 컴포넌트가 마운트될 때 주사 리스트를 가져옵니다.
onMounted(() => {
  fetchInjections();
});
</script>

<template>
  <Select v-model="selectedInjection">
    <SelectTrigger>
      <!-- 선택된 주사 이름을 표시, 선택된 값이 없으면 placeholder 표시 -->
      <SelectValue :placeholder="selectedInjection ? injections.find(i => i.injectionPk.toString() === selectedInjection)?.injectionNm : '주사 이름을 선택하세요'" />
    </SelectTrigger>
    <SelectContent>
      <!-- 주사 리스트에서 id와 name을 사용 -->
      <SelectItem
        v-for="(injection) in injections"
        :key="injection.injectionPk"
        :value="injection.injectionPk.toString()"  
      >
        {{ injection.injectionNm }}  <!-- 화면에 보이는 주사 이름 -->
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<style scoped>
/* 필요에 따라 스타일 추가 */
</style>

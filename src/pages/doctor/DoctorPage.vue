<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-vue-next';
import axiosInstance from '@/api/instance';
import { toast } from '@steveyuowo/vue-hot-toast';
import DiseaseSelector from '@/components/DiseaseSelector.vue';

// 인터페이스 정의
interface Injection {
  id: string;
  name: string;
  dosePerMorning: number;
  dosePerLunch: number;
  dosePerDinner: number;
  totalDay: number;
  method: string;
}

// 상태 변수 정의
const router = useRouter();
const showInjectionModal = ref(false);
const injections = ref<Injection[]>([]);
const newInjection = ref<Injection>({
  id: '',
  name: '',
  dosePerMorning: 0,
  dosePerLunch: 0,
  dosePerDinner: 0,
  totalDay: 0,
  method: ''
});

const name = ref('');
const residentNumFront = ref('');
const residentNumBack = ref('');
const diseaseCode = ref<string>('');
const description = ref('');

// 주사제 목록
const injectionList = ref<Injection[]>([]);

// 선택된 주사제
const selectedInjection = ref<Injection | null>(null);

// 데이터 로드
onMounted(async () => {
  try {
    const response = await axiosInstance.get('/api/hosipital/injection');
    injectionList.value = response.data;
  } catch (error) {
    console.error('주사제 데이터를 불러오는데 실패했습니다:', error);
    toast.error('데이터 로드 중 오류가 발생했습니다.');
  }
});

// 주사제 선택 함수
const selectInjection = (injection: Injection) => {
  selectedInjection.value = injection;
  newInjection.value = { ...injection };
};

// 주사제 추가 함수
const addInjection = () => {
  if (selectedInjection.value) {
    injections.value.push({ ...newInjection.value });
    selectedInjection.value = null;
    newInjection.value = {
      id: '',
      name: '',
      dosePerMorning: 0,
      dosePerLunch: 0,
      dosePerDinner: 0,
      totalDay: 0,
      method: ''
    };
    showInjectionModal.value = false;
  }
};

// 주사제 제거 함수
const removeInjection = (index: number) => {
  injections.value.splice(index, 1);
};

// 폼 유효성 검사
const isFormValid = computed(
  () =>
    name.value.trim() !== '' &&
    residentNumFront.value.length === 6 &&
    residentNumBack.value.length === 7 &&
    injections.value.length > 0
);

// 주민번호 뒷자리 입력 처리
const handleResidentNumBackInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const cleanedValue = input.value.replace(/\D/g, '');
  residentNumBack.value = cleanedValue.slice(0, 7);
};

// 처방전 등록 함수
const handleNextButtonClick = async () => {
  try {
    const data = {
      userNm: name.value,
      firstNo: residentNumFront.value,
      lastNo: residentNumBack.value,
      duration: 3,
      description: description.value,
      diseasePkList: diseaseCode.value ? [parseInt(diseaseCode.value)] : [],
      injectionIntakeInfoList: injections.value.map((injection) => ({
        injectionPk: injection.id,
        totalDay: injection.totalDay,
        dosePerMorning: injection.dosePerMorning,
        dosePerLunch: injection.dosePerLunch,
        dosePerDinner: injection.dosePerDinner,
        method: injection.method || ''
      }))
    };

    console.log(data);
    const response = await axiosInstance.post('/api/patient/prescription/post?doctorId=1', data);
    console.log(response.data.data);
    if (response.data.data === true) {
      toast.success('처방전을 등록했습니다.');
    }
    if (isFormValid.value) {
      router.push(`/doctor/check/${response.data.data}`);
    }
  } catch (err) {
    toast.error('처방전 등록에 실패했습니다.');
  }
};
</script>

<template>
  <div>
    <HeadBar :back-button="false">처방전</HeadBar>
    <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="true">
      <div class="prescription-container">
        <ShadowBox :padding-x="20" :padding-y="20">
          <div class="prescription-title">처방전</div>

          <div class="prescription-info">
            <Label for="name">이름</Label>
            <Input type="text" id="name" v-model="name" placeholder="이름을 입력하세요" />
          </div>

          <div class="prescription-info">
            <Label for="resident-num-front">주민등록번호</Label>
            <div class="resident-num">
              <Input
                type="text"
                id="resident-num-front"
                v-model="residentNumFront"
                placeholder="ex) 990909"
                inputmode="numeric"
                maxlength="6"
              />
              <div>-</div>
              <div class="resident-num-back">
                <Input
                  type="password"
                  id="resident-num-back"
                  v-model="residentNumBack"
                  @input="handleResidentNumBackInput"
                  placeholder="ex) 1111222"
                  inputmode="numeric"
                  maxlength="7"
                />
              </div>
            </div>
          </div>

          <div class="prescription-info">
            <Label for="disease-code">질병 코드 등록</Label>
            <DiseaseSelector v-model="diseaseCode" />
          </div>

          <div class="prescription-info">
            <Label for="description">조제시 참고사항</Label>
            <Input
              type="text"
              id="disease-code"
              v-model="description"
              placeholder="조제시 참고사항을 입력하세요"
            />
          </div>

          <!-- 주사제 등록 섹션 -->
          <div class="prescription-info">
            <div class="pill-container">
              <Label>주사제 등록</Label>
              <Dialog v-model:open="showInjectionModal">
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <i class="fa-solid fa-plus"></i>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>주사제 등록</DialogTitle>
                    <DialogDescription>새로운 주사제를 등록하세요.</DialogDescription>
                  </DialogHeader>

                  <div class="divider"></div>

                  <div class="injection-form">
                    <Label for="injection-name">주사제 이름</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox">
                          {{ selectedInjection ? selectedInjection.name : '주사제 선택' }}
                          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="주사제 검색..." />
                          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              v-for="injection in injectionList"
                              :key="injection.id"
                              :value="injection.id"
                              @select="() => selectInjection(injection)"
                            >
                              <Check
                                :class="`mr-2 h-4 w-4 ${
                                  selectedInjection?.id === injection.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`"
                              />
                              {{ injection.name }}
                            </CommandItem>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div class="injection-form">
                    <div class="dosage-inputs">
                      <div class="dosage-day">
                        <NumberField :min="0" v-model="newInjection.dosePerMorning">
                          <Label for="dosePerMorning">아침</Label>
                          <NumberFieldContent>
                            <NumberFieldDecrement />
                            <NumberFieldInput />
                            <NumberFieldIncrement />
                          </NumberFieldContent>
                        </NumberField>
                      </div>
                      <div class="dosage-day">
                        <NumberField :min="0" v-model="newInjection.dosePerLunch">
                          <Label for="dosePerLunch">점심</Label>
                          <NumberFieldContent>
                            <NumberFieldDecrement />
                            <NumberFieldInput />
                            <NumberFieldIncrement />
                          </NumberFieldContent>
                        </NumberField>
                      </div>
                      <div class="dosage-day">
                        <NumberField :min="0" v-model="newInjection.dosePerDinner">
                          <Label for="dosePerDinner">저녁</Label>
                          <NumberFieldContent>
                            <NumberFieldDecrement />
                            <NumberFieldInput />
                            <NumberFieldIncrement />
                          </NumberFieldContent>
                        </NumberField>
                      </div>
                    </div>
                  </div>

                  <div class="injection-form">
                    <NumberField :min="0" v-model="newInjection.totalDay">
                      <Label for="totalDay">투여 일수</Label>
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </div>

                  <div class="injection-form">
                    <Label for="method">투여 방법</Label>
                    <Textarea
                      id="method"
                      v-model="newInjection.method"
                      placeholder="투여 방법을 입력하세요."
                    />
                  </div>

                  <div class="dialog-footer">
                    <Button @click="addInjection" size="lg">등록</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div class="divider"></div>

            <div v-if="injections.length > 0" class="injection-list">
              <div v-for="(injection, index) in injections" :key="index" class="injection-item">
                <div class="injection-info">
                  <div class="injection-name">{{ injection.name }}</div>
                  <div class="injection-dosage">
                    아침: {{ injection.dosePerMorning }} / 점심: {{ injection.dosePerLunch }} /
                    저녁: {{ injection.dosePerDinner }}
                  </div>
                  <div>{{ injection.totalDay }} 일</div>
                  <div v-if="injection.method" class="injection-method">{{ injection.method }}</div>
                </div>
                <Button variant="ghost" size="icon" @click="removeInjection(index)">
                  <i class="fa-solid fa-trash"></i>
                </Button>
              </div>
            </div>
          </div>
        </ShadowBox>
      </div>

      <div class="fixed-button">
        <Button size="lg" :disabled="!isFormValid" @click="handleNextButtonClick">
          처방전 등록
        </Button>
      </div>
    </Main>
  </div>
</template>

<style scoped>
.prescription-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 80px;
}

.prescription-title {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
}

.prescription-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 28px;
}

.prescription-info:last-child {
  margin-bottom: 0;
}

.resident-num {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.resident-num-back {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.pill-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.injection-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* margin-top: 16px; */
}

.medicine-form {
  display: flex;
  flex-direction: column;
  /* margin-top: 16px; */
}

.divider {
  height: 1px;
  background-color: var(--dark-gray);
  margin-bottom: 8px;
}

.dosage-inputs {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.dosage-day {
  display: flex;
  flex-direction: column;
}

.dosage-inputs > div {
  flex: 1;
}

.medicine-list {
  max-height: auto;
  overflow-y: auto;
}

.medicine-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px;
  border: 1px solid var(--nav-gray);
  border-radius: 8px;
  margin-bottom: 8px;
}

.medicine-item:last-child {
  margin-bottom: 0;
}

.medicine-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.medicine-name {
  font-weight: 600;
}

.medicine-dosage {
  font-size: 14px;
  color: var(--dark-gray);
}

.medicine-memo {
  font-size: 14px;
  color: var(--dark-gray);
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.fixed-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 100;
  background-color: var(--bg-gray); /* Main 컴포넌트의 배경색과 일치시킵니다 */
  padding: 10px 0;
}

/* 컨텐츠가 fixed 버튼에 가려지지 않도록 패딩 추가 */
.prescription-container {
  padding-bottom: 80px; /* 버튼의 높이 + 여유 공간 */
}
</style>

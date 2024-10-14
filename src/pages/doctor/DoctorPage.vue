<script setup lang="ts">
import { ref, computed } from 'vue';
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

import axiosInstance from '@/api/instance';
import { toast } from '@steveyuowo/vue-hot-toast';
import MedicineSelector from '@/components/MedicineSelector.vue';
import DiseaseSelector from '@/components/DiseaseSelector.vue';
import InjectionSelector from '@/components/InjectionSelector.vue';

interface Medicine {
  name: string;
  medicinePk: string;
  morning: number;
  afternoon: number;
  evening: number;
  days: number;
  memo: string;
}

interface Injection {
  name: string;
  injectionPk: string;
  dosePerMorning: number;
  dosePerLunch: number;
  dosePerDinner: number;
  totalDay: number;
  method: string;
}

const showInjectionModal = ref(false);
const injections = ref<Injection[]>([]); // 주사제 리스트
const newInjection = ref<Injection>({
  name: '',
  injectionPk: '',
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
const medicines = ref<Medicine[]>([]);

const showMedicineModal = ref(false);
const newMedicine = ref<Medicine>({
  name: '',
  medicinePk: '',
  morning: 0,
  afternoon: 0,
  evening: 0,
  days: 0,
  memo: ''
});

const router = useRouter();

const addMedicine = () => {
  medicines.value.push({ ...newMedicine.value });
  newMedicine.value = {
    name: '',
    medicinePk: '',
    morning: 0,
    afternoon: 0,
    evening: 0,
    days: 0,
    memo: ''
  };
  showMedicineModal.value = false;
};

const removeMedicine = (index: number) => {
  medicines.value.splice(index, 1);
};

const addInjection = () => {
  injections.value.push({ ...newInjection.value });
  newInjection.value = {
    name: '',
    injectionPk: '',
    dosePerMorning: 0,
    dosePerLunch: 0,
    dosePerDinner: 0,
    totalDay: 0,
    method: ''
  };
  showInjectionModal.value = false;
};

const removeInjection = (index: number) => {
  injections.value.splice(index, 1);
};

const isFormValid = computed(
  () =>
    name.value.trim() !== '' &&
    residentNumFront.value.length === 6 &&
    residentNumBack.value.length === 7 &&
    medicines.value.length > 0
);

const handleResidentNumBackInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const cleanedValue = input.value.replace(/\D/g, ''); // 숫자만 허용
  residentNumBack.value = cleanedValue.slice(0, 7); // 최대 7자리 숫자만 저장
};

const handleNextButtonClick = async () => {
  try {
    const data = {
      userNm: name.value, // 사용자의 이름
      firstNo: residentNumFront.value, // 주민등록번호 앞자리
      lastNo: residentNumBack.value, // 주민등록번호 뒷자리
      duration: 3, // 처방전 기간
      description: description.value, // 처방전 설명

      // diseaseCode가 비어있지 않으면 parseInt로 변환하고, 그렇지 않으면 빈 배열 처리
      diseasePkList: diseaseCode.value ? [parseInt(diseaseCode.value)] : [],

      // medicineIntakeInfoList: 약 목록이 있을 경우 처리
      medicineIntakeInfoList:
        medicines.value.length > 0
          ? medicines.value.map((medicine) => ({
              medicinePk: medicine.medicinePk ? parseInt(medicine.medicinePk) : null, // 약의 PK 값을 number로 변환, 빈 값 처리
              totalDay: medicine.days,
              dosePerMorning: medicine.morning,
              dosePerLunch: medicine.afternoon,
              dosePerDinner: medicine.evening,
              method: medicine.memo || ''
            }))
          : null,

      // injectionIntakeInfoList: 주사제 목록이 있을 경우 처리
      injectionIntakeInfoList:
        injections.value.length > 0
          ? injections.value.map((injection) => ({
              injectionPk: injection.injectionPk ? parseInt(injection.injectionPk) : null, // 주사제 PK 값을 number로 변환, 빈 값 처리
              totalDay: injection.totalDay,
              dosePerMorning: injection.dosePerMorning,
              dosePerLunch: injection.dosePerLunch,
              dosePerDinner: injection.dosePerDinner,
              method: injection.method || ''
            }))
          : null
    };

    console.log(data); // 디버그를 위한 데이터 확인
    const response = await axiosInstance.post('/api/patient/prescription/post?doctorId=1', data);
    console.log(response.data.data); // PK 값을 확인할 수 있는 부분
    if (response.data.data === true) {
      toast.success('처방전을 등록했습니다.');
      // 라우터로 prescriptionId를 params로 넘김
    }
    if (isFormValid.value) {
      router.push(`/doctor/check/${response.data.data}`);
    }
  } catch (err) {
    toast.error('존재하지 않는 사용자입니다.');
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

          <div class="prescription-info">
            <div class="pill-container">
              <Label>약 등록</Label>
              <Dialog v-model:open="showMedicineModal">
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <i class="fa-solid fa-plus"></i>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>약 등록</DialogTitle>
                    <DialogDescription>새로운 약을 등록하세요.</DialogDescription>
                  </DialogHeader>

                  <div class="divider"></div>

                  <div class="medicine-form">
                    <Label for="medicine-name">약 이름</Label>
                    <MedicineSelector
                      v-model="newMedicine.medicinePk"
                      @update:medicineName="newMedicine.name = $event"
                    />
                    <!-- <Input
                      id="medicine-name"
                      v-model="newMedicine.name"
                      placeholder="약 이름을 입력하세요"
                    /> -->
                  </div>
                  <div class="medicine-form">
                    <div class="dosage-inputs">
                      <div
                        v-for="time in ['morning', 'afternoon', 'evening'] as const"
                        :key="time"
                        class="dosage-day"
                      >
                        <NumberField :id="`dosage-${time}`" :min="0" v-model="newMedicine[time]">
                          <Label :for="`medicine-${time}`">{{
                            { morning: '아침', afternoon: '점심', evening: '저녁' }[time]
                          }}</Label>
                          <NumberFieldContent>
                            <NumberFieldDecrement />
                            <NumberFieldInput />
                            <NumberFieldIncrement />
                          </NumberFieldContent>
                        </NumberField>
                      </div>
                    </div>
                  </div>
                  <div class="medicine-form">
                    <NumberField id="dosage-days" :min="0" v-model="newMedicine.days">
                      <Label for="medicine-days">복용 일수</Label>
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </div>
                  <div class="medicine-form">
                    <Label for="medicine-memo">복용 방법</Label>
                    <Textarea
                      id="medicine-memo"
                      v-model="newMedicine.memo"
                      placeholder="약 복용 방법을 입력하세요."
                    />
                  </div>
                  <div class="dialog-footer">
                    <Button @click="addMedicine" size="lg">등록</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div class="divider"></div>

            <div v-if="medicines.length > 0" class="medicine-list">
              <div v-for="(medicine, index) in medicines" :key="index" class="medicine-item">
                <div class="medicine-info">
                  <div class="medicine-name">{{ medicine.name }}</div>
                  <div class="medicine-dosage">
                    아침: {{ medicine.morning }} 정 / 점심: {{ medicine.afternoon }} 정 / 저녁:
                    {{ medicine.evening }} 정
                  </div>
                  <div>{{ medicine.days }} 일</div>
                  <div v-if="medicine.memo" class="medicine-memo">{{ medicine.memo }}</div>
                </div>
                <Button variant="ghost" size="icon" @click="removeMedicine(index)">
                  <i class="fa-solid fa-trash"></i>
                </Button>
              </div>
            </div>
          </div>
          <!-- 주사제 등록 모달 -->
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

                  <!-- 주사제 이름 입력 -->
                  <div class="medicine-form">
                    <Label for="injection-name">주사제 이름</Label>
                    <InjectionSelector
                      v-model="newInjection.injectionPk"
                      @update:injectionName="newInjection.name = $event"
                    />
                  </div>

                  <!-- 주사제 복용량 입력 -->
                  <div class="medicine-form">
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

                  <!-- 투여 일수 입력 -->
                  <div class="medicine-form">
                    <NumberField :min="0" v-model="newInjection.totalDay">
                      <Label for="totalDay">투여 일수</Label>
                      <NumberFieldContent>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldContent>
                    </NumberField>
                  </div>

                  <!-- 투여 방법 입력 -->
                  <div class="medicine-form">
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

            <!-- 등록된 주사제 리스트 -->
            <div class="divider"></div>
            <div v-if="injections.length > 0" class="medicine-list">
              <div v-for="(injection, index) in injections" :key="index" class="medicine-item">
                <div class="medicine-info">
                  <div class="medicine-name">{{ injection.name }}</div>
                  <div class="medicine-dosage">
                    아침: {{ injection.dosePerMorning }} / 점심: {{ injection.dosePerLunch }} /
                    저녁: {{ injection.dosePerDinner }}
                  </div>
                  <div>{{ injection.totalDay }} 일</div>
                  <div v-if="injection.method" class="medicine-memo">{{ injection.method }}</div>
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
        <Button size="lg" :disabled="!isFormValid" @click="handleNextButtonClick"
          >처방전 등록</Button
        >
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
  position: absolute;
  bottom: 40px;
  left: 20px;
  right: 20px;
  z-index: 10;
}
</style>

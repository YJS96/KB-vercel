<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/api/instance';
import { toast } from '@steveyuowo/vue-hot-toast';
import moment from 'moment';

interface Medicine {
  medicineNm: string;
  unit: string;
  dayCnt: string;
  totalDay: number;
  method: string;
  dosePerMorning: number;
  dosePerLunch: number;
  dosePerDinner: number;
  preMedPk: number;
  price: number;
}

interface Injection {
  injectionNm: string;
  unit: string;
  dayCnt: string;
  totalDay: string;
  method: string;
}

interface User {
  userNm: string;
  firstNo: string;
  lastNo: string;
}

interface Prescription {
  createYmd: string;
  description: string;
  duration: number;
  prescriptionNo: number;
  prescriptionSt: boolean;
}

interface Disease {
  diseaseCd: string;
}

interface Hospital {
  hospitalNm: string;
  hospitalNo: string;
  phoneNo: string;
  faxNo: string;
}

interface Doctor {
  tp: string;
  doctorNo: number;
  doctorNm: string;
}

interface MedicinePrice {
  dayCnt: number;
  dosePerDinner: number;
  dosePerLunch: number;
  dosePerMorning: number;
  medicineNm: string;
  method: string;
  preMedPk: number;
  price: number;
  totalDay: number;
  unit: number;
}

interface InjectionPrice {
  dayCnt: number;
  dosePerDinner: number;
  dosePerLunch: number;
  dosePerMorning: number;
  injectionNm: string;
  method: string;
  preInjPk: number;
  price: number;
  totalDay: number;
  unit: number;
}

// Vue Router와 현재 라우트 정보를 사용하기 위한 설정
const router = useRouter();
const route = useRoute();

// 데이터 초기값 설정
const preMedicineList = ref<Medicine[]>([]);
const preInjectionList = ref<Injection[]>([]);
const user = ref<User | null>(null);
const prescription = ref<Prescription | null>(null);
const disease = ref<Disease | null>(null);
const hospital = ref<Hospital | null>(null);
const doctor = ref<Doctor | null>(null);

// 결제 상세 정보 표시 여부를 관리하는 ref
const showPrescription = ref(false);
const showPaymentDetail = ref(false);

// 처방전 상세 정보와 약품 목록을 저장하는 ref
const prescriptionDetails = ref(null);
const medicineList = ref<MedicinePrice[] | null>();
const injectionList = ref<InjectionPrice[] | null>();

// 총 가격을 계산하는 computed 속성
const totalPrice = computed(() => {
  let total = 0;

  // medicineList의 price 합계
  if (medicineList.value) {
    total += medicineList.value.reduce((sum, medicine) => {
      return (
        sum +
        medicine.price *
          (medicine.dosePerMorning + medicine.dosePerLunch + medicine.dosePerDinner) *
          medicine.totalDay
      );
    }, 0);
  }

  // injectionList의 price 합계
  if (injectionList.value) {
    total += injectionList.value.reduce((sum, injection) => {
      return (
        sum +
        injection.price *
          (injection.dosePerMorning + injection.dosePerLunch + injection.dosePerDinner) *
          injection.totalDay
      );
    }, 0);
  }

  return total;
});

// 결제 상세 정보 표시 토글 함수
const handlePaymentDetail = () => {
  showPaymentDetail.value = !showPaymentDetail.value;
};

const handlePrescriptionDetail = () => {
  showPrescription.value = !showPrescription.value;
};

// 결제 요청 처리 함수
const handlePaymentRequest = async () => {
  if (prescription.value?.prescriptionSt) {
    toast.error('이미 조제된 처방전입니다');
    return;
  }
  try {
    await axiosInstance.patch(`/api/pharmacy/prescription/${route.params.id}?chemistId=1`);
    await axiosInstance.patch(`/api/pay/${route.params.id}?deductedAmount=${totalPrice.value}`);
    toast.success('결제가 완료되었습니다.');
    router.push('/pharmacist');
  } catch (error) {
    toast.error('결제 처리 중 오류가 발생했습니다.');
  }
};

const getPrescriptionDetail = async () => {
  try {
    const response = await axiosInstance.get(`/api/patient/prescription/detail/${route.params.id}`);
    const data = response.data.data;
    console.log(data);
    prescriptionDetails.value = response.data.data;
    medicineList.value = response.data.data.preMedicineList;
    injectionList.value = response.data.data.preInjectionList;

    preMedicineList.value = data.preMedicineList;
    preInjectionList.value = data.preInjectionList;
    user.value = data.user;
    prescription.value = data.prescription;
    disease.value = data.diseaseList[0] || null;
    hospital.value = data.hospital;
    doctor.value = data.doctor;
  } catch (error) {
    toast.error('처방전 정보를 불러오는 데 실패했습니다.');
    router.push('/pharmacist');
  }
};

// 컴포넌트가 마운트될 때 처방전 정보를 가져옵니다.
onMounted(() => {
  getPrescriptionDetail();
});
</script>

<template>
  <HeadBar :back-button="true">처방전 상세</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="true">
    <!-- <div class="notice" v-if="prescriptionDetails?.status === 'COMPLETED'">
      <i class="fa-regular fa-circle-check"></i>
      <div>결제 완료된 처방전이에요</div>
    </div> -->
    <ShadowBox :padding-x="20" :padding-y="20" class="prescription-container">
      <div class="pill-arrow">
        <div class="title-text">약품 내역</div>
      </div>
      <div class="w-full grid grid-cols-8 gap-x-1 font-semibold">
        <div class="col-span-4">약품명</div>
        <div class="text-center">아침</div>
        <div class="text-center">점심</div>
        <div class="text-center">저녁</div>
        <div class="text-center whitespace-nowrap">투여일</div>
      </div>
      <div
        v-for="(medicine, index) in preMedicineList"
        class="w-full grid grid-cols-8 gap-x-1"
        :key="index"
      >
        <div class="col-span-4 truncate">{{ medicine.medicineNm }}</div>
        <div class="text-center">{{ medicine.dosePerMorning }}</div>
        <div class="text-center">{{ medicine.dosePerLunch }}</div>
        <div class="text-center">{{ medicine.dosePerDinner }}</div>
        <div class="text-center">{{ medicine.dayCnt }}</div>
      </div>
    </ShadowBox>

    <ShadowBox :padding-x="20" :padding-y="20">
      <div class="pill-arrow" @click="handlePaymentDetail">
        <div class="title-text">약품 가격</div>
        <i class="fa-solid fa-chevron-down" :class="{ rotate: showPaymentDetail }"></i>
      </div>

      <div class="divider"></div>

      <div v-if="showPaymentDetail">
        <div class="pill-list" v-for="medicine in medicineList" :key="medicine.preMedPk">
          <div class="pill-cost">
            <div>{{ medicine.medicineNm }}</div>
            <div>
              {{
                (
                  (medicine.dosePerMorning + medicine.dosePerLunch + medicine.dosePerDinner) *
                  medicine.totalDay *
                  medicine.price
                ).toLocaleString()
              }}원
            </div>
          </div>
        </div>
        <div class="pill-list" v-for="injection in injectionList" :key="injection.preInjPk">
          <div class="pill-cost">
            <div>{{ injection.injectionNm }}</div>
            <div>
              {{
                (
                  (injection.dosePerMorning + injection.dosePerLunch + injection.dosePerDinner) *
                  injection.totalDay *
                  injection.price
                ).toLocaleString()
              }}원
            </div>
          </div>
        </div>
      </div>
      <div class="pill-arrow" style="margin-bottom: 0">
        <div class="title-text">총 가격</div>
        <div class="title-number">{{ totalPrice.toLocaleString() }}원</div>
      </div>
    </ShadowBox>

    <ShadowBox :padding-x="20" :padding-y="20" class="prescription-container">
      <div class="pill-arrow" @click="handlePrescriptionDetail">
        <div class="title-text">처방전</div>
        <i class="fa-solid fa-chevron-down" :class="{ rotate: showPrescription }"></i>
      </div>
      <div class="w-full text-left -mt-3 -mb-1" v-if="!showPrescription">상세히 볼 수 있어요</div>
      <div v-else class="presc-frame">
        <div class="text-right px-1 mt-1">(환자보관용)</div>
        <div class="presc-header">처&nbsp;&nbsp;&nbsp; 방&nbsp;&nbsp;&nbsp; 전</div>
        <div class="flex justify-between px-1 mb-1">
          <div>보험유형 : 건강보험</div>
          <div>요양기관번호 : {{ hospital?.hospitalNo }}</div>
        </div>
        <table v-if="prescription && hospital && doctor && user">
          <thead>
            <tr>
              <th colspan="2" rowspan="2">교부번호</th>
              <th colspan="2" rowspan="2">
                {{ moment(prescription.createYmd).format('YYYY년 MM월 DD일') }}<br />{{
                  prescription.prescriptionNo
                }}
              </th>
              <th rowspan="4">의료기관</th>
              <th>명칭</th>
              <th>{{ hospital.hospitalNm }}</th>
            </tr>
            <tr>
              <th>전화번호</th>
              <th>{{ hospital.phoneNo }}</th>
            </tr>
            <tr>
              <th rowspan="2">환자</th>
              <th>성명</th>
              <th colspan="2">{{ user.userNm }}</th>
              <th>팩스번호</th>
              <th>{{ hospital.faxNo }}</th>
            </tr>
            <tr>
              <th>주민등록번호</th>
              <th colspan="2">{{ user.firstNo }}-{{ user.lastNo }}</th>
              <th>e-mail주소</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2">질병<br />분류<br />기호</td>
              <td rowspan="2">{{ disease?.diseaseCd }}</td>
              <td rowspan="2">처방<br />의료인의<br />성명</td>
              <td rowspan="2">{{ doctor.doctorNm }}</td>
              <td colspan="2">면허종별</td>
              <td>{{ doctor.tp }}</td>
            </tr>
            <tr>
              <td colspan="2">면허번호</td>
              <td>{{ doctor.doctorNm }}</td>
            </tr>
            <tr>
              <td colspan="7" class="left">
                * 환자의 요구가 있는 때에는 질병분류기호를 기재하지 아니합니다.
              </td>
            </tr>
          </tbody>
        </table>

        <table class="presc-pill-list">
          <thead class="bg-blue-100">
            <tr>
              <th colspan="2">처 방 의 약 품 의 명 칭</th>
              <th>1회<br />투여량</th>
              <th>1일<br />투여횟수</th>
              <th>투약<br />일수</th>
              <th colspan="2">용 법</th>
            </tr>
          </thead>

          <tbody>
            <!-- 각 의약품 리스트 출력 -->
            <tr v-for="(medicine, index) in preMedicineList" :key="index">
              <td colspan="2" class="left">{{ medicine.medicineNm || '' }}</td>
              <td>{{ medicine.unit || '' }}</td>
              <td>{{ medicine.dayCnt || '' }}</td>
              <td>{{ medicine.totalDay || '' }}</td>
              <td colspan="2" class="left">{{ medicine.method || '' }}</td>
            </tr>
            <!-- 빈칸을 유지하는 기본 행 -->
            <tr>
              <td colspan="2"></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colspan="2"></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colspan="2"></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td colspan="2"></td>
              <td></td>
              <td></td>
              <td></td>
              <td colspan="2">조 제 시 참 고 사 항</td>
            </tr>
            <tr>
              <td colspan="5">주사제 처방내역 (원내조제 , 원외처방)</td>
              <td colspan="2">{{ prescription?.description }}</td>
            </tr>
            <tr v-for="(injection, index) in preInjectionList" :key="index">
              <td colspan="2" class="left">{{ injection.injectionNm || '' }}</td>
              <td>{{ injection.unit || '' }}</td>
              <td>{{ injection.dayCnt || '' }}</td>
              <td>{{ injection.totalDay || '' }}</td>
              <td colspan="2" class="left">{{ injection.method || '' }}</td>
            </tr>
            <tr>
              <td colspan="2"></td>
              <td></td>
              <td></td>
              <td></td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
        <table class="no-border-top">
          <thead>
            <tr>
              <td>사용기간</td>
              <td colspan="5">
                교부일로부터 ( &nbsp;&nbsp;{{ prescription?.duration }}&nbsp;&nbsp; )일간
              </td>
              <td colspan="5">*사용기간내에 약국에 제출하여야 합니다.</td>
            </tr>
          </thead>
        </table>

        <table style="border-bottom: none">
          <thead class="bg-blue-100">
            <tr>
              <th colspan="12">의 약 품&nbsp;&nbsp;조 제 내 역</th>
            </tr>
          </thead>
          <tbody class="presc-medicine-table">
            <tr>
              <td rowspan="4" class="no-border-bottom">조<br />제<br />내<br />역</td>
              <td colspan="2">조제기관의명칭</td>
              <td colspan="5"></td>
              <td colspan="4" rowspan="2">처방전의 변경, 수정, 확인<br />대체 시 그 내용 등</td>
            </tr>
            <tr>
              <td colspan="2">조제약사</td>
              <td>성명</td>
              <td colspan="4" style="border-right: 0.8px solid var(--blue)">
                &nbsp;임준수 &nbsp;&nbsp;&nbsp;(서명 또는 날인)
              </td>
            </tr>
            <tr>
              <td colspan="2">조제량</td>
              <td colspan="5"></td>
              <td colspan="4" rowspan="2" class="no-border-bottom"></td>
            </tr>
            <tr>
              <td colspan="2" class="no-border-bottom">조제년월일</td>
              <td
                colspan="5"
                class="no-border-bottom"
                style="border-right: 0.8px solid var(--blue)"
              ></td>
            </tr>
          </tbody>
        </table>
      </div>
    </ShadowBox>

    <Button
      :variant="prescription?.prescriptionSt ? 'destructive' : 'default'"
      size="lg"
      @click="handlePaymentRequest"
      class="mt-10"
      >{{
        prescription?.prescriptionSt ? '조제 완료된 처방전입니다' : '조제 완료 및 결제 요청'
      }}</Button
    >
  </Main>
</template>

<style scoped>
.notice {
  margin-top: 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--kb-yellow);
  gap: 8px;
}

.prescription-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
}

.prescription-title {
  font-size: 24px;
  font-weight: 600;
}

.prescription-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.pill-arrow {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.fa-chevron-down.rotate {
  transform: rotate(180deg);
}

.divider {
  height: 1px;
  background-color: var(--dark-gray);
  margin-bottom: 16px;
}

.title-text {
  font-weight: 600;
  font-size: 18px;
}

.title-number {
  font-weight: 600;
  font-size: 20px;
  color: var(--kb-yellow);
}

.pill-list {
  display: flex;
  flex-direction: column;
  font-weight: 400;
  font-size: 16px;
  color: var(--dark-gray);
  margin-bottom: 16px;
}

.pill-cost {
  display: flex;
  justify-content: space-between;
}

.prescription-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  gap: 12px;
}

.prescription-title {
  font-size: 24px;
  font-weight: 600;
}
.misc-func-frame {
  margin-top: 24px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.misc-func-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.misc-func-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-frame {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background-color: var(--gray);
  display: flex;
  justify-content: center;
  align-items: center;
}
.misc-info-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.misc-info-title {
  font-size: 16px;
  font-weight: 550;
}
.misc-info-desc {
  font-size: 12px;
  color: var(--dark-gray);
}
.presc-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
.detail-frame {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 32px;
}
.detail-container {
  display: flex;
  justify-content: space-between;
  div {
    font-size: 16px;
    color: var(--dark-gray);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  span {
    font-size: 18px;
    font-weight: 550;
  }
}
.seperator {
  width: 100%;
  height: 1px;
  border-bottom: 1px solid var(--gray);
  margin-bottom: 16px;
}

.docu-button-frame {
  width: 100%;
}
.docu-button {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  span {
    font-size: 20px;
    font-weight: 600;
  }
}
.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.carousel-frame {
  display: flex;
  justify-content: center;
  width: calc(100% - 80px);
}
.receipt-frame {
  width: calc(100% - 32px);
  position: relative;
  margin-bottom: 32px;
  margin-top: 12px;
}
.receipt-store {
  font-size: 15px;
  font-weight: 550;
  margin-bottom: -5px;
}
.receipt-price {
  font-size: 28px;
  font-weight: 600;
}
.won {
  font-size: 18px;
  font-weight: 600;
  margin-left: 1.5px;
}
.receipt-top {
  width: calc(100% - 32px);
  border-top: 2px solid var(--black);
  padding: 20px 4px 16px 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.receipt-info-line {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-size: 15px;
}
.receipt-info-left {
  font-weight: 400;
  font-size: 14px;
  color: var(--dark-gray);
}
.dotted-top {
  border-top: 2px dotted var(--dark-gray);
}
.presc-frame {
  margin-top: 16px;
  width: 100%;
  border: 2px solid var(--blue);
  * {
    font-family: 'YESMyoungjo-Regular';
    font-size: 8px;
    font-weight: 500;
  }
}
table {
  width: 100%;
  border-top: 1px solid var(--blue);
  border-bottom: 1px solid var(--blue);
  /* border: 1px solid var(--blue); */
}
th,
td {
  border-right: 0.8px solid var(--blue);
  border-bottom: 0.8px solid var(--blue);
}
th:last-child,
td:last-child {
  border-right: none;
}
tr:last-child td {
  border-bottom: none;
}
tr,
th,
td {
  text-align: center;
  white-space: nowrap;
}
th[rowspan] {
  z-index: 50;
  background-color: var(--white);
  position: relative;
}
td[rowspan] {
  z-index: 50;
  background-color: var(--white);
  position: relative;
}
.presc-header {
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  justify-content: center;
}
.left {
  text-align: left;
  padding-left: 6px;
}
.presc-pill-list {
  * {
    height: 16.5px;
  }
}
.no-border-top {
  border-top: none;
}
.no-border-bottom {
  border-bottom: none;
}
.no-border-right {
  border-right: none;
}

.medicine-detail {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 8px;
  color: var(--dark-gray);
}
</style>

<script setup lang="ts">
import HeadBar from '@/components/HeadBar.vue';
import Main from '@/components/Main.vue';
import ShadowBox from '@/components/ShadowBox.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosInstance from '@/api/instance';
import { toast } from '@steveyuowo/vue-hot-toast';

// 필요한 인터페이스 정의
interface PrescriptionData {
  preMedicineList: Medicine[];
  preInjectionList: Injection[];
  user: User;
  prescription: Prescription;
  diseaseList: Disease[];
  hospital: Hospital;
  doctor: Doctor;
}

// 각 데이터 타입에 대한 인터페이스 정의
interface Medicine {
  medicineNm: string;
  unit: string;
  dayCnt: string;
  totalDay: string;
  method: string;
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

// Vue Router 인스턴스 생성
const route = useRoute();
const router = useRouter();

// 데이터 초기값 설정
const prescriptionId = ref<number>(0);
const preMedicineList = ref<Medicine[]>([]);
const preInjectionList = ref<Injection[]>([]);
const user = ref<User | null>(null);
const prescription = ref<Prescription | null>(null);
const disease = ref<Disease | null>(null);
const hospital = ref<Hospital | null>(null);
const doctor = ref<Doctor | null>(null);
const paymentAmount = ref('');

const formattedPaymentAmount = computed({
  get: () => {
    // 숫자가 아닌 문자를 제거하고 천 단위로 쉼표를 추가
    const num = paymentAmount.value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  set: (value: string) => {
    // 입력된 값에서 쉼표를 제거하고 숫자만 저장
    paymentAmount.value = value.replace(/[^\d]/g, '');
  }
});

// 컴포넌트가 마운트될 때 실행되는 함수
onMounted(() => {
  // 라우트 파라미터에서 처방전 ID를 가져옴
  prescriptionId.value = Number(route.params.id);
  console.log('전달된 처방전 ID:', prescriptionId.value);
  // 처방전 정보를 가져오는 함수 호출
  getUserInfo(prescriptionId.value);
});

// 처방전 정보를 가져오는 함수
const getUserInfo = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/api/patient/prescription/detail/${id}`);
    const data = response.data.data;
    console.log(response.data);

    // 받아온 데이터를 각 ref에 할당
    preMedicineList.value = data.preMedicineList;
    preInjectionList.value = data.preInjectionList;
    user.value = data.user;
    prescription.value = data.prescription;
    disease.value = data.diseaseList[0] || null;
    hospital.value = data.hospital;
    doctor.value = data.doctor;
  } catch (err) {
    console.error(err);
    toast.error('처방전 정보를 불러오는데 실패했습니다.');
  }
};

// 날짜 포맷을 'YYYY년 MM월 DD일'로 변환하는 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일`;
};

// '제 00001 호' 형식으로 변환하는 함수
const formatNumber = (id: number) => {
  const formattedId = String(id).padStart(5, '0');
  return `제 ${formattedId} 호`;
};

// 결제 요청 함수
const requestPayment = async () => {
  const amount = Number(paymentAmount.value);
  if (!amount || isNaN(amount)) {
    toast.error('유효한 금액을 입력해주세요.');
    return;
  }

  try {
    const response = await axiosInstance.post('/api/payment/request', {
      amount: amount,
      prescriptionId: prescriptionId.value
    });

    if (response.data.success) {
      toast.success(`${formattedPaymentAmount.value}원 결제가 환자에게 요청되었습니다.`);
      paymentAmount.value = ''; // 입력 필드 초기화
    } else {
      toast.error('결제 요청에 실패했습니다.');
    }
  } catch (error) {
    console.error('결제 요청 중 오류 발생:', error);
    toast.error('결제 요청에 실패했습니다.');
  }
};

// 의사 페이지로 이동하는 함수
const goToDoctorPage = () => {
  router.push('/doctor');
};
</script>

<template>
  <HeadBar :back-button="true">처방전 보내기</HeadBar>
  <Main :headbar="true" :navbar="false" :padded="true" :bg-gray="true">
    <ShadowBox :padding-x="20" :padding-y="20" class="prescription-container">
      <div class="prescription-title">처방전</div>
      <div class="presc-frame">
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
                {{ formatDate(prescription.createYmd) }}<br />{{ formatNumber(prescriptionId) }}
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
              <td>{{ formatNumber(doctor.doctorNo) }}</td>
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

    <div class="payment-section">
      <Input
        v-model="formattedPaymentAmount"
        type="text"
        placeholder="결제 금액 입력"
        class="payment-input"
      />
      <Button size="lg" @click="requestPayment" class="payment-button">결제 요청</Button>
    </div>

    <Button size="lg" @click="goToDoctorPage" class="confirm-button">처방전 확인</Button>
  </Main>
</template>

<style scoped>
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

.payment-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.payment-input {
  width: 100%;
}

.payment-button {
  width: 100%;
}

.confirm-button {
  width: 100%;
  margin-top: 12px;
}
</style>

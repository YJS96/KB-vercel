<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useFaceIdStore } from '@/stores/faceId';
import { toast } from '@steveyuowo/vue-hot-toast';
import axiosInstance from '@/api/instance';
import html2canvas from 'html2canvas';
import moment from 'moment';
import HeadBar from '@/components/HeadBar.vue';
import NavBar from '@/components/NavBar.vue';
import Main from '@/components/Main.vue';
import '@/assets/toast.css';
import {
  Dialog,
  // DialogHeader,
  // DialogDescription,
  // DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface HospitalBill {
  createYmd: number[];
  hospitalBillPk: number;
  hospitalNm: string;
  hospitalNo: number;
  prescriptionId: number;
  totalPrice: number;
}

interface PharmacyBill {
  createYmd: number[];
  pharmacyBillPk: number;
  pharmacyNm: string;
  pharmacyNo: number;
  prescriptionId: number;
  totalPrice: number;
}

interface Doctor {
  doctorPk: number;
  doctorNm: string;
  tp: string;
  doctorNo: string;
  phoneNo: string;
  gender: 'MALE' | 'FEMALE';
  hospitalId: number | null;
}

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
  createYmd: string;
}

interface Pharmacy {
  pharmacyPk: number;
  pharmacyNm: string;
  phoneNo: string;
  faxNo: string;
  pharmacyNo: number;
  dongId: number | null;
}

interface Hospital {
  hospitalPk: number;
  hospitalNm: string;
  phoneNo: string;
  hospitalNo: number;
  faxNo: string;
  dongId: number | null;
}

interface User {
  userNm: string;
  phoneNo: string;
  gender: 'MALE' | 'FEMALE';
  firstNo: string;
  lastNo: string;
  bankNm: string;
  account: number;
  accountNo: string;
  accountPw: string;
  morningAlarm: string | null;
  lunchAlarm: string | null;
  dinnerAlarm: string | null;
}

interface Chemist {
  chemistPk: number;
  chemistNm: string;
  chemistNo: string;
  phoneNo: string;
  gender: 'MALE' | 'FEMALE';
  pharmacyId: number | null;
}

interface Disease {
  diseasePk: string;
  diseaseCd: string;
}

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

// interface MedicalSystem {
//   doctor: Doctor;
//   prescription: Prescription;
//   pharmacy: Pharmacy;
//   hospital: Hospital;
//   user: User;
//   chemist: Chemist;
// }

const route = useRoute();
const faceIdStore = useFaceIdStore();

const prescId = route.params.id;
const userId = 1;

const prescInfo = ref<Prescription | null>();
const prescDoctor = ref<Doctor | null>();
const prescUser = ref<User | null>();
const prescPharmacy = ref<Pharmacy | null>();
const prescHospital = ref<Hospital | null>();
const prescChemist = ref<Chemist | null>();
const preMedicineList = ref<Medicine[]>([]);
const preInjectionList = ref<Injection[]>([]);
const diseaseList = ref<Disease | null>();

const hospitalBill = ref<HospitalBill | null>();
const pharmacyBill = ref<PharmacyBill | null>();

const userName = ref('임시');
const receiptIndex = ref(0);

const getPrescriptionDetail = async () => {
  try {
    const response = await axiosInstance.get(`api/patient/prescription/detail/${prescId}`);
    const responseData = response.data.data;
    console.log(responseData);
    prescInfo.value = responseData.prescription;
    // console.log(responseData.prescription);
    prescDoctor.value = responseData.doctor;
    prescUser.value = responseData.user;
    prescPharmacy.value = responseData.pharmacy;
    prescHospital.value = responseData.hospital;
    prescChemist.value = responseData.chemist;
    diseaseList.value = responseData.diseaseList[0];
    preMedicineList.value = responseData.preMedicineList;
    preInjectionList.value = responseData.preInjectionList;
  } catch (err) {
    console.log(err);
  }
};

const getHospitalBill = async () => {
  try {
    const response = await axiosInstance.get(
      `api/patient/prescription/hospitalBill/${prescId}?userId=${userId}`
    );
    hospitalBill.value = response.data.data;
    // console.log(response.data.data);
  } catch (err) {
    console.log(err);
  }
};

const getPharmacyBill = async () => {
  try {
    const response = await axiosInstance.get(
      `api/patient/prescription/pharmacyBill/${prescId}?userId=${userId}`
    );
    pharmacyBill.value = response.data.data;
    // console.log(response.data.data);
  } catch (err) {
    console.log(err);
  }
};

const handleReceiptIndex = (idx: number) => {
  receiptIndex.value = idx;
};

faceIdStore.isAuthenticated = true;
const handleFaceIdAuth = () => {
  faceIdStore.authenticate(userName.value);
};

const prescDetail = computed(() => [
  {
    name: '병원명',
    info: prescHospital.value?.hospitalNm
  },
  {
    name: '의사명',
    info: prescDoctor.value?.doctorNm
  },
  {
    name: '약국명',
    info: prescPharmacy.value?.pharmacyNm
  },
  {
    name: '약사명',
    info: prescChemist.value?.chemistNm
  },
  {
    name: '작성일',
    info: prescInfo.value ? moment(prescInfo.value.createYmd).format('YY. M. D.') : null
  },
  {
    name: '처방약',
    info: ''
  }
]);

const handleClaim = async () => {
  if (prescInfo.value?.insuranceSt) {
    toast.error('이미 신청했어요');
    return;
  }
  try {
    const response = await axiosInstance.patch(`/api/insurance/update/${prescId}?userId=1`);
    console.log(response);
    toast.success('청구 신청이 완료되었습니다');
    getPrescriptionDetail();
  } catch (err) {
    console.log(err);
  }
};

const handleReceived = async () => {
  if (prescInfo.value?.prescriptionSt) {
    toast.error('이미 수령했어요');
    return;
  }

  try {
    const response = await axiosInstance.patch(`/api/patient/prescription/${prescId}?userId=1`);
    console.log(response);
    toast.success('약을 수령했습니다');
    getPrescriptionDetail();
  } catch (err) {
    console.log(err);
  }
};

const saveAsImage = async (item: string) => {
  let selector: string;
  let fileName: string;

  if (item === 'presc-frame') {
    selector = '.presc-frame';
    fileName = 'prescription';
  } else if (item === 'carousel-item') {
    if (receiptIndex.value === 0) {
      selector = '.carousel-item-first';
      fileName = 'receipt_hospital';
    } else {
      selector = '.carousel-item-second';
      fileName = 'receipt_pharmacy';
    }
  } else {
    console.error('Invalid item type');
    return;
  }

  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    try {
      const originalCanvas = await html2canvas(element, { scale: 5 });
      const margin = 80;
      const newWidth = originalCanvas.width + margin * 2;
      const newHeight = originalCanvas.height + margin * 2;
      const newCanvas = document.createElement('canvas');
      newCanvas.width = newWidth;
      newCanvas.height = newHeight;
      const ctx = newCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(originalCanvas, margin, margin);
        const image = newCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${fileName}.png`;
        link.click();
      }
    } catch (error) {
      console.error('이미지 저장 중 오류 발생:', error);
    }
  }
};

onMounted(() => {
  getPrescriptionDetail();
  getHospitalBill();
  getPharmacyBill();
});
</script>

<template>
  <HeadBar :back-button="true">상세보기</HeadBar>
  <NavBar />
  <Main :headbar="true" :navbar="true" :padded="true">
    <div class="misc-func-frame">
      <div class="misc-func-container">
        <div class="misc-func-left">
          <div class="icon-frame claim">
            <img src="/images/claim.svg" alt="claim" />
          </div>
          <div class="misc-info-text">
            <span class="misc-info-title">보험금 간편 청구</span>
            <span class="misc-info-desc">방갑다가 복잡한 과정을 대신 해드려요</span>
          </div>
        </div>
        <Button
          @click="handleClaim()"
          :variant="prescInfo?.insuranceSt ? 'destructive' : 'default'"
          >{{ prescInfo?.insuranceSt ? '완료' : '신청' }}</Button
        >
      </div>
      <div class="misc-func-container">
        <div class="misc-func-left">
          <div class="icon-frame check">
            <img src="/images/checkreceived.svg" alt="check" />
          </div>
          <div class="misc-info-text">
            <span class="misc-info-title">약 수령 확인</span>
            <span class="misc-info-desc">방갑다를 사용하지 않았어도 바꿀 수 있어요</span>
          </div>
        </div>
        <Button
          @click="handleReceived()"
          :variant="prescInfo?.prescriptionSt ? 'destructive' : 'default'"
          >{{ prescInfo?.prescriptionSt ? '완료' : '신청' }}</Button
        >
      </div>
    </div>
    <div class="presc-title">처방전 상세</div>
    <div class="detail-frame">
      <div class="detail-container" v-for="info in prescDetail" :key="info.name">
        <span>{{ info.name }}</span>
        <div v-if="info.name != '처방약'">
          <Skeleton v-if="!prescInfo" class="h-7 w-16"></Skeleton>
          {{ info.info }}
        </div>
        <Popover v-else>
          <PopoverTrigger>
            <Button variant="outline"
              >{{ preMedicineList.length + preInjectionList.length }}개</Button
            >
          </PopoverTrigger>
          <PopoverContent class="me-4 flex flex-col gap-2 text-sm text-cssblack">
            <div v-for="(medicine, index) in preMedicineList" :key="index">
              {{ medicine.medicineNm }}
            </div>
            <div v-for="(injection, index) in preInjectionList" :key="index">
              {{ injection.injectionNm }}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <div class="seperator"></div>
    <Dialog>
      <DialogTrigger class="docu-button" @click="handleFaceIdAuth">
        <span>처방전 보기</span>
        <i class="fa-solid fa-chevron-right"></i>
      </DialogTrigger>
      <DialogContent>
        <div v-if="faceIdStore.isAuthenticated" class="presc-frame">
          <div class="text-right px-1 mt-1">(환자보관용)</div>
          <div class="presc-header">처&nbsp;&nbsp;&nbsp; 방&nbsp;&nbsp;&nbsp; 전</div>
          <div class="flex justify-between px-1 mb-1">
            <div>보험유형 : 건강보험</div>
            <div>요양기관번호 : {{ prescHospital?.hospitalNo }}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th colspan="2" rowspan="2">교부번호</th>
                <th colspan="2" rowspan="2">
                  {{ moment(prescInfo?.createYmd).format('YYYY년 MM월 DD일') }}<br />제
                  {{ prescInfo?.prescriptionNo }} 호
                </th>
                <th rowspan="4">의료기관</th>
                <th>명칭</th>
                <th>{{ prescHospital?.hospitalNm }}</th>
              </tr>
              <tr>
                <th>전화번호</th>
                <th>{{ prescHospital?.phoneNo }}</th>
              </tr>
              <tr>
                <th rowspan="2">환자</th>
                <th>성명</th>
                <th colspan="2">{{ prescUser?.userNm }}</th>
                <th>팩스번호</th>
                <th>{{ prescHospital?.faxNo }}</th>
              </tr>
              <tr>
                <th>주민등록번호</th>
                <th colspan="2">
                  {{ prescUser?.firstNo }} - {{ prescUser?.lastNo.substring(0, 1) }}******
                </th>
                <th>e-mail주소</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="2">질병<br />분류<br />기호</td>
                <td rowspan="2">{{ diseaseList?.diseaseCd }}</td>
                <td rowspan="2">처방<br />의료인의<br />성명</td>
                <td rowspan="2">{{ prescDoctor?.doctorNm }}</td>
                <td colspan="2">면허종별</td>
                <td>의사</td>
              </tr>
              <tr>
                <td colspan="2">면허번호</td>
                <td>제 12345 호</td>
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
                <th>1회<br />투여횟수</th>
                <th>투약<br />일수</th>
                <th colspan="2">용 법</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(medicine, index) in preMedicineList" :key="index">
                <td colspan="2" class="left">{{ medicine.medicineNm || '' }}</td>
                <td>{{ medicine.unit || '' }}</td>
                <td>{{ medicine.dayCnt || '' }}</td>
                <td>{{ medicine.totalDay || '' }}</td>
                <td colspan="2" class="left">{{ medicine.method || '' }}</td>
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
                <td colspan="2"></td>
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
                  교부일로부터 ( &nbsp;&nbsp;{{ prescInfo?.duration }}&nbsp;&nbsp; )일간
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
                <td colspan="5">{{ prescPharmacy?.pharmacyNm }}</td>
                <td colspan="4" rowspan="2">처방전의 변경, 수정, 확인<br />대체 시 그 내용 등</td>
              </tr>
              <tr>
                <td colspan="2">조제약사</td>
                <td>성명</td>
                <td colspan="4" style="border-right: 0.8px solid var(--blue)">
                  &nbsp;{{ prescChemist?.chemistNm }} &nbsp;&nbsp;&nbsp;(서명 또는 날인)
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
        <div v-else class="text-center mt-4">본인인증을 완료해주세요</div>
        <DialogFooter class="modal-footer">
          <Button v-if="faceIdStore.isAuthenticated" size="lg" @click="saveAsImage('presc-frame')"
            >이미지로 저장</Button
          >
          <DialogClose>
            <Button variant="destructive" size="lg">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog>
      <DialogTrigger class="docu-button">
        <span>전자영수증 보기</span>
        <i class="fa-solid fa-chevron-right"></i>
      </DialogTrigger>
      <DialogContent>
        <Carousel>
          <CarouselContent class="carousel-frame">
            <CarouselItem class="carousel-item-first">
              <div class="receipt-frame">
                <div class="receipt-store">{{ hospitalBill?.hospitalNm }}</div>
                <div>
                  <span class="receipt-price">{{ hospitalBill?.totalPrice.toLocaleString() }}</span>
                  <span class="won">원</span>
                </div>
              </div>
              <div class="receipt-top">
                <div class="receipt-info-line">
                  <div class="receipt-info-left">승인일시</div>
                  <div>
                    {{ moment(hospitalBill?.createYmd).format('YYYY-MM-DD HH:MM') }}
                  </div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">거래유형</div>
                  <div>승인</div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">할부</div>
                  <div>일시불</div>
                </div>
              </div>
              <div class="receipt-top dotted-top">
                <div class="receipt-info-line">
                  <div class="receipt-info-left">공급가액</div>
                  <div>{{ (2340 - Math.floor((2340 * 0.1) / 10) * 10).toLocaleString() }}원</div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">부가세</div>
                  <div>{{ (Math.floor((2340 * 0.1) / 10) * 10).toLocaleString() }}원</div>
                </div>
              </div>
              <div class="receipt-top dotted-top" style="margin-bottom: 18px">
                <div class="receipt-info-line">
                  <div class="receipt-info-left">가맹점명</div>
                  <div>{{ hospitalBill?.hospitalNm }}</div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">사업자번호</div>
                  <div>{{ hospitalBill?.hospitalNo }}</div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem class="carousel-item-second">
              <div class="receipt-frame">
                <div class="receipt-store">{{ pharmacyBill?.pharmacyNm }}</div>
                <div>
                  <span class="receipt-price">{{ pharmacyBill?.totalPrice.toLocaleString() }}</span>
                  <span class="won">원</span>
                </div>
              </div>
              <div class="receipt-top">
                <div class="receipt-info-line">
                  <div class="receipt-info-left">승인일시</div>
                  <div>
                    {{ moment(pharmacyBill?.createYmd).format('YYYY-MM-DD HH:MM') }}
                  </div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">거래유형</div>
                  <div>승인</div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">할부</div>
                  <div>일시불</div>
                </div>
              </div>
              <div class="receipt-top dotted-top">
                <div class="receipt-info-line">
                  <div class="receipt-info-left">공급가액</div>
                  <div>{{ (2340 - Math.floor((2340 * 0.1) / 10) * 10).toLocaleString() }}원</div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">부가세</div>
                  <div>{{ (Math.floor((2340 * 0.1) / 10) * 10).toLocaleString() }}원</div>
                </div>
              </div>
              <div class="receipt-top dotted-top" style="margin-bottom: 18px">
                <div class="receipt-info-line">
                  <div class="receipt-info-left">가맹점명</div>
                  <div>{{ pharmacyBill?.pharmacyNm }}</div>
                </div>
                <div class="receipt-info-line">
                  <div class="receipt-info-left">사업자번호</div>
                  <div>{{ pharmacyBill?.pharmacyNo }}</div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious @click="handleReceiptIndex(0)" />
          <CarouselNext @click="handleReceiptIndex(1)" />
        </Carousel>
        <DialogFooter class="modal-footer">
          <Button size="lg" @click="saveAsImage('carousel-item')">이미지로 저장</Button>
          <DialogClose>
            <Button variant="destructive" size="lg">닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <div class="h-6"></div>
  </Main>
</template>

<style scoped>
@font-face {
  font-family: 'YESMyoungjo-Regular';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_13@1.0/YESMyoungjo-Regular.woff')
    format('woff');
  font-weight: normal;
  font-style: normal;
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
.claim {
  background-color: #b4c8d5;
}
.check {
  background-color: #ffeeab;
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

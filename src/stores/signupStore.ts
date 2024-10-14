import { defineStore } from 'pinia';
import axiosInstance from '@/api/instance';

// 회원 정보 관련 인터페이스 정의
interface CommonInfo {
  name: string;
  phoneNumber: string;
  phoneCarrier: string;
  residentNumber: string;
}

interface PatientInfo {
  bankName: string;
  accountNumber: string;
  accountPassword: string;
}

interface DoctorInfo {
  hospitalName: string;
  hospitalAddress: {
    city: string;
    district: string;
    neighborhood: string;
    detail: string;
  };
  hospitalType: string;
  licenseNumber: string;
  representativeName: string;
  hospitalPhone: string;
}

interface PharmacistInfo {
  pharmacyName: string;
  pharmacyAddress: {
    city: string;
    district: string;
    neighborhood: string;
    detail: string;
  };
  licenseNumber: string;
  representativeName: string;
  pharmacyPhone: string;
}

interface Terms {
  service: boolean;
  privacy: boolean;
  marketing: boolean;
}

// Pinia 스토어 정의
export const useSignupStore = defineStore('signup', {
  // 스토어의 초기 상태 정의
  state: () => ({
    memberType: '',
    commonInfo: {} as CommonInfo,
    patientInfo: {} as PatientInfo,
    doctorInfo: {} as DoctorInfo,
    pharmacistInfo: {} as PharmacistInfo,
    terms: {} as Terms
  }),

  actions: {
    // 사용자 정보를 설정하는 액션
    setUserInfo(
      userInfo: Partial<{
        memberType: string;
        commonInfo: Partial<CommonInfo>;
        patientInfo: Partial<PatientInfo>;
        doctorInfo: Partial<DoctorInfo>;
        pharmacistInfo: Partial<PharmacistInfo>;
        terms: Partial<Terms>;
      }>
    ) {
      // 각 정보 타입별로 존재하는 경우에만 상태 업데이트
      if (userInfo.memberType) this.memberType = userInfo.memberType;
      if (userInfo.commonInfo) Object.assign(this.commonInfo, userInfo.commonInfo);
      if (userInfo.patientInfo) Object.assign(this.patientInfo, userInfo.patientInfo);
      if (userInfo.doctorInfo) Object.assign(this.doctorInfo, userInfo.doctorInfo);
      if (userInfo.pharmacistInfo) Object.assign(this.pharmacistInfo, userInfo.pharmacistInfo);
      if (userInfo.terms) Object.assign(this.terms, userInfo.terms);
    },

    // 스토어 상태를 초기화하는 액션
    resetState() {
      this.$reset();
    },

    // 회원가입 제출 액션
    async submitSignup() {
      try {
        let endpoint = '';
        let data: any = { ...this.commonInfo };

        // 회원 유형에 따라 엔드포인트와 데이터 설정
        switch (this.memberType) {
          case '일반 회원':
            endpoint = '/api/patient/register';
            data = {
              ...data,
              ...this.patientInfo,
              user_nm: this.commonInfo.name // 일반 회원용 이름 필드
            };
            break;
          case '의사':
            endpoint = '/api/hospital/register';
            data = {
              ...data,
              ...this.doctorInfo,
              doctor_nm: this.commonInfo.name // 의사용 이름 필드
            };
            break;
          case '약사':
            endpoint = '/api/pharmacy/register';
            data = {
              ...data,
              ...this.pharmacistInfo,
              chemist_nm: this.commonInfo.name // 약사용 이름 필드
            };
            break;
          default:
            throw new Error('잘못된 회원 유형입니다.');
        }

        data.terms = this.terms;

        // API 요청 전송
        const response = await axiosInstance.post(endpoint, data);
        if (response.data.success) {
          console.log('회원가입에 성공했어요', response.data);

          this.resetState(); // 상태 초기화

          return { success: true, nextRoute: this.getNextRoute() };
        } else {
          throw new Error(response.data.message || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원가입에 실패했어요', error);

        return { success: false, nextRoute: '' };
      }
    },

    // 회원 유형에 따른 다음 라우트 반환
    getNextRoute() {
      switch (this.memberType) {
        case '일반 회원':
          return '/';
        case '의사':
          return '/doctor';
        case '약사':
          return '/pharmacist';
        default:
          return '/';
      }
    }
  },

  // 상태 지속성 설정 (로컬 스토리지에 저장)
  persist: true
});

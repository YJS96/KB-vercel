import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { toast } from '@steveyuowo/vue-hot-toast';

const firebaseConfig = {
  apiKey: 'AIzaSyAmE7eesdl5WLVKN-xoQD5JUcH4Vf1ex4s',
  authDomain: 'kbank-backend.firebaseapp.com',
  projectId: 'kbank-backend',
  storageBucket: 'kbank-backend.appspot.com',
  messagingSenderId: '505325744639',
  appId: '1:505325744639:web:04843f09853629d93437ca',
  measurementId: 'G-P4BPZ9LN1Y'
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// @ts-ignore
export const requestForToken = async (): Promise<string | null> => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        'BNCnOqfdBm_KSYG37G7TRtXeXU3TqZybnY9so-jIq3VIf37dVJRJrkveugdXGE8AVnsWTE3wVZ1Ic3Dzcoc8KPM'
    });
    if (currentToken) {
      alert(`발급 성공 : ${currentToken}`);
      console.log('current token for client: ', currentToken);
      // 여기서 토큰을 서버로 전송하는 로직을 추가할 수 있습니다.
      return currentToken;
    } else {
      alert('발급 실패');
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.error('토큰 검색 중 오류 발생:', err);
    return null;
  }
};

// 포그라운드 메시지 처리
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);

      if (document.visibilityState === 'visible') {
        const notificationTitle = payload.notification?.title || '제목없음';
        const notificationOptions = {
          body: payload.notification?.body
        };

        // 알림 표시
        new Notification(notificationTitle, notificationOptions);
        // @ts-ignore
        toast.success(notificationOptions?.body);
      }

      resolve(payload);
    });
  });

export { app, messaging };

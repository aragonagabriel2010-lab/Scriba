import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyA9qOqabuw0gjkeKq_IWfc2aF-gy6-dBso',
  authDomain: 'scriba-e735d.firebaseapp.com',
  projectId: 'scriba-e735d',
  storageBucket: 'scriba-e735d.firebasestorage.app',
  messagingSenderId: '166589735519',
  appId: '1:166589735519:web:d635603060f2e6f74b71ea',
  measurementId: 'G-BZCJBT9047',
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app, 'scriba')

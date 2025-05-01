import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { app } from '../firebase'

export async function createUserProfile(userId: string) {
  const db = getFirestore(app)

  const addressRef = doc(db, 'addresses', userId)
  const profileRef = doc(db, 'profiles', userId)

  const [addressSnapshot, profileSnapshot] = await Promise.all([
    getDoc(addressRef),
    getDoc(profileRef),
  ])

  if (!addressSnapshot.exists()) {
    await setDoc(addressRef, {
      userId: userId,
      postalCode: '',
      prefecture: '',
      city: '',
      street: '',
      division: '',
    })
  }

  if (!profileSnapshot.exists()) {
    await setDoc(profileRef, {
      userId: userId,
      familyName: '',
      firstName: '',
      phoneNumber: '',
    })
  }
}

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, QueryDocumentSnapshot, getDoc, doc } from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'
import { db } from '../firebase'
import type { ProfileType } from '../types/ProfileType'
import type { AddressType } from '../types/AddressType'

interface User {
  id: string
  nickname: string
  firstName: string
  familyName: string
  postalCode: string
  prefecture: string
  city: string
  street: string
  division: string
}

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'profiles'))
    users.value = await Promise.all(
      querySnapshot.docs.map(async (profileDoc: QueryDocumentSnapshot<DocumentData>) => {
        const profileData = profileDoc.data() as ProfileType
        const addressDoc = await getDoc(doc(db, 'addresses', profileDoc.id))
        const addressData = addressDoc.data() as AddressType

        return {
          id: profileDoc.id,
          nickname: profileData?.nickname || '',
          firstName: profileData?.firstName || '',
          familyName: profileData?.familyName || '',
          postalCode: addressData?.postalCode || '',
          prefecture: addressData?.prefecture || '',
          city: addressData?.city || '',
          street: addressData?.street || '',
          division: addressData?.division || '',
        }
      }),
    )
  } catch (e: unknown) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <v-container>
    <h1>Admin View</h1>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">ID</th>
          <th class="text-left">Nickname</th>
          <th class="text-left">First Name</th>
          <th class="text-left">Family Name</th>
          <th class="text-left">Postal Code</th>
          <th class="text-left">Prefecture</th>
          <th class="text-left">City</th>
          <th class="text-left">Street</th>
          <th class="text-left">Division</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.nickname }}</td>
          <td>{{ user.firstName }}</td>
          <td>{{ user.familyName }}</td>
          <td>{{ user.postalCode }}</td>
          <td>{{ user.prefecture }}</td>
          <td>{{ user.city }}</td>
          <td>{{ user.street }}</td>
          <td>{{ user.division }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

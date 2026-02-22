import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View } from 'react-native'
import { useAuthStore } from '../store/auth'
import { RootStackParamList } from './types'
import AuthNavigator from './AuthNavigator'
import ClientNavigator from './ClientNavigator'
import AdminNavigator from './AdminNavigator'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const { user, isLoading, isAuthenticated, restoreSession } = useAuthStore()

  useEffect(() => {
    restoreSession()
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1b2d' }}>
        <ActivityIndicator size="large" color="#d69e2e" />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.role === 'ADMIN' ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="Client" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  )
}

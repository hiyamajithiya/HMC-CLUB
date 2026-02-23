import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { PaperProvider } from 'react-native-paper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { theme } from './src/theme'
import RootNavigator from './src/navigation/RootNavigator'
import { useAuthStore } from './src/store/auth'
import { usePushNotifications } from './src/hooks/usePushNotifications'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function AppInner() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  // Requests notification permission and registers device token when user is logged in
  usePushNotifications(isAuthenticated)
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AppInner />
      </PaperProvider>
    </QueryClientProvider>
  )
}

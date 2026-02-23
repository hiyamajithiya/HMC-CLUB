import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ClientStackParamList, ClientTabParamList } from './types'
import DocumentsScreen from '../screens/client/DocumentsScreen'
import AppointmentsScreen from '../screens/client/AppointmentsScreen'
import ProfileScreen from '../screens/client/ProfileScreen'
import NotificationsScreen from '../screens/client/NotificationsScreen'
import FolderDetailScreen from '../screens/client/FolderDetailScreen'
import ChangePasswordScreen from '../screens/client/ChangePasswordScreen'

const Tab = createBottomTabNavigator<ClientTabParamList>()
const Stack = createNativeStackNavigator<ClientStackParamList>()

function ClientTabs() {
  const insets = useSafeAreaInsets()
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#d69e2e',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f1b2d',
          borderTopColor: '#1a2d47',
          paddingBottom: insets.bottom + 5,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'document'
          if (route.name === 'Documents') iconName = focused ? 'document-text' : 'document-text-outline'
          else if (route.name === 'Appointments') iconName = focused ? 'calendar' : 'calendar-outline'
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline'
          else if (route.name === 'Notifications') iconName = focused ? 'notifications' : 'notifications-outline'
          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  )
}

export default function ClientNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f1b2d' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="ClientTabs"
        component={ClientTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FolderDetail"
        component={FolderDetailScreen}
        options={({ route }) => ({ title: route.params.folderName })}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
    </Stack.Navigator>
  )
}

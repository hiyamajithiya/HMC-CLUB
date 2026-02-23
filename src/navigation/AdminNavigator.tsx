import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AdminStackParamList, AdminTabParamList } from './types'
import DashboardScreen from '../screens/admin/DashboardScreen'
import UsersListScreen from '../screens/admin/UsersListScreen'
import AdminDocumentsScreen from '../screens/admin/AdminDocumentsScreen'
import MoreScreen from '../screens/admin/MoreScreen'
import UserCreateScreen from '../screens/admin/UserCreateScreen'
import UserEditScreen from '../screens/admin/UserEditScreen'
import UserDocumentsScreen from '../screens/admin/UserDocumentsScreen'
import AdminUploadScreen from '../screens/admin/AdminUploadScreen'
import AppointmentsListScreen from '../screens/admin/AppointmentsListScreen'
import AppointmentDetailScreen from '../screens/admin/AppointmentDetailScreen'
import ContactsListScreen from '../screens/admin/ContactsListScreen'
import ContactDetailScreen from '../screens/admin/ContactDetailScreen'
import BlogListScreen from '../screens/admin/BlogListScreen'
import BlogCreateScreen from '../screens/admin/BlogCreateScreen'
import BlogEditScreen from '../screens/admin/BlogEditScreen'
import ToolsListScreen from '../screens/admin/ToolsListScreen'
import ToolCreateScreen from '../screens/admin/ToolCreateScreen'
import ToolEditScreen from '../screens/admin/ToolEditScreen'
import DownloadsListScreen from '../screens/admin/DownloadsListScreen'
import DownloadCreateScreen from '../screens/admin/DownloadCreateScreen'
import DownloadEditScreen from '../screens/admin/DownloadEditScreen'
import LeadsListScreen from '../screens/admin/LeadsListScreen'
import SettingsScreen from '../screens/admin/SettingsScreen'
import ChangePasswordScreen from '../screens/client/ChangePasswordScreen'

const Tab = createBottomTabNavigator<AdminTabParamList>()
const Stack = createNativeStackNavigator<AdminStackParamList>()

function AdminTabs() {
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
          let iconName: keyof typeof Ionicons.glyphMap = 'grid'
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline'
          else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline'
          else if (route.name === 'AdminDocuments') iconName = focused ? 'document-text' : 'document-text-outline'
          else if (route.name === 'More') iconName = focused ? 'menu' : 'menu-outline'
          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Users" component={UsersListScreen} />
      <Tab.Screen name="AdminDocuments" component={AdminDocumentsScreen} options={{ title: 'Documents' }} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  )
}

const NATIVE_HEADER = {
  headerShown: true,
  headerStyle: { backgroundColor: '#0f1b2d' },
  headerTintColor: '#ffffff',
  headerTitleStyle: { fontWeight: '600' as const },
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="UserCreate" component={UserCreateScreen} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} />
      <Stack.Screen name="UserDocuments" component={UserDocumentsScreen} />
      <Stack.Screen name="AdminUpload" component={AdminUploadScreen} />
      <Stack.Screen name="AdminFolderDetail" component={require('../screens/client/FolderDetailScreen').default} options={({ route }: any) => ({ ...NATIVE_HEADER, title: route.params.folderName })} />
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="ContactsList" component={ContactsListScreen} />
      <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
      <Stack.Screen name="BlogList" component={BlogListScreen} />
      <Stack.Screen name="BlogCreate" component={BlogCreateScreen} />
      <Stack.Screen name="BlogEdit" component={BlogEditScreen} />
      <Stack.Screen name="ToolsList" component={ToolsListScreen} />
      <Stack.Screen name="ToolCreate" component={ToolCreateScreen} />
      <Stack.Screen name="ToolEdit" component={ToolEditScreen} />
      <Stack.Screen name="DownloadsList" component={DownloadsListScreen} />
      <Stack.Screen name="DownloadCreate" component={DownloadCreateScreen} />
      <Stack.Screen name="DownloadEdit" component={DownloadEditScreen} />
      <Stack.Screen name="LeadsList" component={LeadsListScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ ...NATIVE_HEADER, title: 'Change Password' }} />
      <Stack.Screen name="AdminDocumentViewer" component={require('../screens/client/DocumentViewerScreen').default} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

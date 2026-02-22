import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#d69e2e',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0f1b2d',
          borderTopColor: '#1a2d47',
          paddingBottom: 5,
          height: 60,
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

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f1b2d' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="UserCreate" component={UserCreateScreen} options={{ title: 'Create User' }} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} options={{ title: 'Edit User' }} />
      <Stack.Screen name="UserDocuments" component={UserDocumentsScreen} options={({ route }) => ({ title: `${route.params.userName}'s Documents` })} />
      <Stack.Screen name="AdminUpload" component={AdminUploadScreen} options={{ title: 'Upload Document' }} />
      <Stack.Screen name="AdminFolderDetail" component={require('../screens/client/FolderDetailScreen').default} options={({ route }) => ({ title: route.params.folderName })} />
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} options={{ title: 'Appointments' }} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment Details' }} />
      <Stack.Screen name="ContactsList" component={ContactsListScreen} options={{ title: 'Contacts' }} />
      <Stack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ title: 'Contact Details' }} />
      <Stack.Screen name="BlogList" component={BlogListScreen} options={{ title: 'Blog Posts' }} />
      <Stack.Screen name="BlogCreate" component={BlogCreateScreen} options={{ title: 'New Blog Post' }} />
      <Stack.Screen name="BlogEdit" component={BlogEditScreen} options={{ title: 'Edit Blog Post' }} />
      <Stack.Screen name="ToolsList" component={ToolsListScreen} options={{ title: 'Tools' }} />
      <Stack.Screen name="ToolCreate" component={ToolCreateScreen} options={{ title: 'New Tool' }} />
      <Stack.Screen name="ToolEdit" component={ToolEditScreen} options={{ title: 'Edit Tool' }} />
      <Stack.Screen name="DownloadsList" component={DownloadsListScreen} options={{ title: 'Downloads' }} />
      <Stack.Screen name="DownloadCreate" component={DownloadCreateScreen} options={{ title: 'New Download' }} />
      <Stack.Screen name="DownloadEdit" component={DownloadEditScreen} options={{ title: 'Edit Download' }} />
      <Stack.Screen name="LeadsList" component={LeadsListScreen} options={{ title: 'Leads' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    </Stack.Navigator>
  )
}

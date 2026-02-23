import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native'

// Auth Stack
export type AuthStackParamList = {
  Login: undefined
  AccountSelection: {
    accounts: { id: string; name: string | null; loginId: string | null; role: string }[]
    identifier: string
    password: string
  }
  ForgotPassword: undefined
}

// Client Tab Navigator
export type ClientTabParamList = {
  Dashboard: undefined
  Documents: undefined
  Appointments: undefined
  Profile: undefined
  Notifications: undefined
}

// Client Stack (wraps tabs + detail screens)
export type ClientStackParamList = {
  ClientTabs: NavigatorScreenParams<ClientTabParamList>
  FolderDetail: { folderId: string; folderName: string; userId: string }
  DocumentViewer: { documentId: string; title: string; fileType?: string }
  BookAppointment: undefined
  ChangePassword: undefined
}

// Admin Tab Navigator
export type AdminTabParamList = {
  Dashboard: undefined
  Users: undefined
  AdminDocuments: undefined
  More: undefined
}

// Admin Stack (wraps tabs + detail screens)
export type AdminStackParamList = {
  AdminTabs: NavigatorScreenParams<AdminTabParamList>
  UserCreate: undefined
  UserEdit: { userId: string }
  UserDocuments: { userId: string; userName: string }
  AdminUpload: { userId: string; userName: string }
  AdminFolderDetail: { folderId: string; folderName: string; userId: string }
  AppointmentsList: undefined
  AppointmentDetail: { appointmentId: string }
  ContactsList: undefined
  ContactDetail: { contactId: string }
  BlogList: undefined
  BlogCreate: undefined
  BlogEdit: { blogId: string }
  ToolsList: undefined
  ToolCreate: undefined
  ToolEdit: { toolId: string }
  DownloadsList: undefined
  DownloadCreate: undefined
  DownloadEdit: { downloadId: string }
  LeadsList: undefined
  Settings: undefined
  ChangePassword: undefined
  AdminDocumentViewer: { documentId: string; title: string; fileType?: string }
}

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Client: NavigatorScreenParams<ClientStackParamList>
  Admin: NavigatorScreenParams<AdminStackParamList>
}

// Screen props helpers
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>

export type ClientTabScreenProps<T extends keyof ClientTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<ClientTabParamList, T>,
    NativeStackScreenProps<ClientStackParamList>
  >

export type ClientScreenProps<T extends keyof ClientStackParamList> =
  NativeStackScreenProps<ClientStackParamList, T>

export type AdminTabScreenProps<T extends keyof AdminTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<AdminTabParamList, T>,
    NativeStackScreenProps<AdminStackParamList>
  >

export type AdminScreenProps<T extends keyof AdminStackParamList> =
  NativeStackScreenProps<AdminStackParamList, T>

import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Text, Divider } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/auth'
import type { AdminTabScreenProps } from '../../navigation/types'

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  screen: string
  color: string
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'calendar', label: 'Appointments', screen: 'AppointmentsList', color: '#d69e2e' },
  { icon: 'mail', label: 'Contacts', screen: 'ContactsList', color: '#8b5cf6' },
  { icon: 'newspaper', label: 'Blog Posts', screen: 'BlogList', color: '#3b82f6' },
  { icon: 'construct', label: 'Tools', screen: 'ToolsList', color: '#22c55e' },
  { icon: 'cloud-download', label: 'Downloads', screen: 'DownloadsList', color: '#f59e0b' },
  { icon: 'people', label: 'Leads', screen: 'LeadsList', color: '#ec4899' },
  { icon: 'settings', label: 'Settings', screen: 'Settings', color: '#64748b' },
  { icon: 'lock-closed', label: 'Change Password', screen: 'ChangePassword', color: '#6366f1' },
]

export default function MoreScreen({ navigation }: AdminTabScreenProps<'More'>) {
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>More</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'A').charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text variant="titleSmall" style={styles.name}>{user?.name || 'Admin'}</Text>
            <Text variant="bodySmall" style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {MENU_ITEMS.map((item, index) => (
          <React.Fragment key={item.screen}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
            {index < MENU_ITEMS.length - 1 && <Divider />}
          </React.Fragment>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
  },
  headerTitle: { color: '#fff', fontWeight: '700', marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#d69e2e', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  name: { color: '#fff', fontWeight: '600' },
  email: { color: 'rgba(255,255,255,0.6)' },
  content: { paddingBottom: 40 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16,
    gap: 14,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f1b2d' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 24, marginHorizontal: 20, padding: 14,
    backgroundColor: '#fef2f2', borderRadius: 12, gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#ef4444' },
})

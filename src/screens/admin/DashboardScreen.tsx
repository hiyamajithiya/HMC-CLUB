import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'
import { useAuthStore } from '../../store/auth'
import type { DashboardStats } from '../../types'
import type { AdminTabScreenProps } from '../../navigation/types'

export default function DashboardScreen({ navigation }: AdminTabScreenProps<'Dashboard'>) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchStats() }, [fetchStats]))

  const StatCard = ({ icon, label, value, color }: {
    icon: keyof typeof Ionicons.glyphMap; label: string; value: number; color: string
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.firmLabel}>Himanshu Majithiya &amp; Co.</Text>
        <Text variant="headlineSmall" style={styles.headerTitle}>Dashboard</Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          Welcome, {user?.name || 'Admin'}
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}
        contentContainerStyle={styles.content}
      >
        {stats && (
          <>
            <View style={styles.statsGrid}>
              <StatCard icon="people" label="Users" value={stats.totalUsers} color="#3b82f6" />
              <StatCard icon="document-text" label="Documents" value={stats.totalDocuments} color="#22c55e" />
              <StatCard icon="calendar" label="Appointments" value={stats.totalAppointments} color="#d69e2e" />
              <StatCard icon="mail" label="Contacts" value={stats.totalContacts} color="#8b5cf6" />
            </View>

            {/* Quick actions */}
            <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <QuickAction icon="person-add" label="New User" color="#3b82f6" onPress={() => navigation.navigate('UserCreate')} />
              <QuickAction icon="calendar" label="Appointments" color="#d69e2e" onPress={() => navigation.navigate('AppointmentsList')} />
              <QuickAction icon="mail-unread" label={`Contacts (${stats.unreadContacts})`} color="#8b5cf6" onPress={() => navigation.navigate('ContactsList')} />
              <QuickAction icon="settings" label="Settings" color="#64748b" onPress={() => navigation.navigate('Settings')} />
            </View>

            {/* Alerts */}
            {(stats.pendingAppointments > 0 || stats.unreadContacts > 0) && (
              <View style={styles.alertCard}>
                <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                <Text style={styles.alertText}>
                  {stats.pendingAppointments > 0 && `${stats.pendingAppointments} pending appointments`}
                  {stats.pendingAppointments > 0 && stats.unreadContacts > 0 && ' · '}
                  {stats.unreadContacts > 0 && `${stats.unreadContacts} unread contacts`}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

function QuickAction({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; color: string; onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
  },
  firmLabel: { fontSize: 11, color: '#d69e2e', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { color: '#fff', fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  content: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: '48%', flexGrow: 1,
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    elevation: 1, borderLeftWidth: 4,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: '#0f1b2d', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  sectionTitle: { fontWeight: '700', color: '#0f1b2d', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 12, alignItems: 'center', elevation: 1,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  actionLabel: { fontSize: 11, fontWeight: '600', color: '#0f1b2d', textAlign: 'center' },
  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, gap: 10,
  },
  alertText: { flex: 1, fontSize: 13, color: '#92400e', fontWeight: '500' },
})

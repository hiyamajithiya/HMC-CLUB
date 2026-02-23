import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'
import { useAuthStore } from '../../store/auth'
import type { UserProfile, Appointment, AppointmentStatus } from '../../types'
import type { ClientTabScreenProps } from '../../navigation/types'

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#22c55e',
  COMPLETED: '#3b82f6',
  CANCELLED: '#ef4444',
  NO_SHOW: '#6b7280',
}

export default function ClientDashboardScreen({ navigation }: ClientTabScreenProps<'Dashboard'>) {
  const user = useAuthStore(s => s.user)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [upcoming, setUpcoming] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [profileRes, apptRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/user/appointments', { params: { upcoming: 'true' } }),
      ])
      setProfile(profileRes.data)
      setUpcoming(apptRes.data.slice(0, 3))
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchData() }, [fetchData]))

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.firmLabel}>Himanshu Majithiya &amp; Co.</Text>
        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.userName}>{user?.name || 'Client'}</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        {profile && (
          <View style={styles.statsRow}>
            <StatCard icon="document-text" label="Documents" value={profile._count.documents} color="#3b82f6" />
            <StatCard icon="calendar" label="Total Appts" value={profile._count.appointments} color="#8b5cf6" />
            <StatCard icon="time" label="Upcoming" value={profile.upcomingAppointments} color="#d69e2e" />
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <QuickAction
            icon="calendar-outline"
            label="Book Appointment"
            color="#d69e2e"
            onPress={() => navigation.navigate('BookAppointment')}
          />
          <QuickAction
            icon="document-text-outline"
            label="My Documents"
            color="#3b82f6"
            onPress={() => navigation.navigate('Documents')}
          />
        </View>

        {/* Upcoming appointments */}
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => navigation.navigate('BookAppointment')}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          upcoming.map(a => {
            const date = new Date(a.date)
            const color = STATUS_COLORS[a.status]
            return (
              <View key={a.id} style={styles.apptCard}>
                <View style={styles.apptDateBox}>
                  <Text style={styles.apptDay}>{date.getDate()}</Text>
                  <Text style={styles.apptMonth}>
                    {date.toLocaleDateString('en-IN', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.apptInfo}>
                  <Text style={styles.apptService} numberOfLines={1}>{a.service}</Text>
                  <Text style={styles.apptTime}>{a.timeSlot}</Text>
                </View>
                <View style={[styles.apptBadge, { backgroundColor: `${color}20` }]}>
                  <Text style={[styles.apptStatus, { color }]}>{a.status}</Text>
                </View>
              </View>
            )
          })
        )}

        {/* View all appointments link */}
        {upcoming.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllRow}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Text style={styles.viewAllText}>View all appointments</Text>
            <Ionicons name="chevron-forward" size={16} color="#d69e2e" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: number
  color: string
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function QuickAction({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  color: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
  },
  firmLabel: {
    fontSize: 11,
    color: '#d69e2e',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  greeting: { fontSize: 14, color: '#94a3b8', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#0f1b2d' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2, textAlign: 'center' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f1b2d',
    marginBottom: 12,
  },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    gap: 10,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#0f1b2d', textAlign: 'center' },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    elevation: 1,
    gap: 8,
  },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  bookBtn: {
    marginTop: 8,
    backgroundColor: '#d69e2e',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    gap: 12,
  },
  apptDateBox: {
    width: 44,
    height: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  apptDay: { fontSize: 18, fontWeight: '700', color: '#0f1b2d' },
  apptMonth: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  apptInfo: { flex: 1 },
  apptService: { fontSize: 14, fontWeight: '600', color: '#0f1b2d' },
  apptTime: { fontSize: 12, color: '#64748b', marginTop: 2 },
  apptBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  apptStatus: { fontSize: 10, fontWeight: '700' },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  viewAllText: { fontSize: 13, fontWeight: '600', color: '#d69e2e' },
})

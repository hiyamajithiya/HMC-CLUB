import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, Chip, FAB } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../../api/client'
import type { Appointment, AppointmentStatus } from '../../types'
import type { ClientTabScreenProps } from '../../navigation/types'

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#22c55e',
  COMPLETED: '#3b82f6',
  CANCELLED: '#ef4444',
  NO_SHOW: '#6b7280',
}

const STATUS_ICONS: Record<AppointmentStatus, keyof typeof Ionicons.glyphMap> = {
  PENDING: 'time-outline',
  CONFIRMED: 'checkmark-circle-outline',
  COMPLETED: 'checkmark-done-outline',
  CANCELLED: 'close-circle-outline',
  NO_SHOW: 'alert-circle-outline',
}

export default function AppointmentsScreen({ navigation }: ClientTabScreenProps<'Appointments'>) {
  const insets = useSafeAreaInsets()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filter === 'upcoming') params.upcoming = 'true'
      const { data } = await api.get('/user/appointments', { params })
      setAppointments(data)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [filter])

  useFocusEffect(useCallback(() => { fetchAppointments() }, [fetchAppointments]))

  const filteredAppointments = filter === 'past'
    ? appointments.filter(a => new Date(a.date) < new Date() || a.status === 'COMPLETED' || a.status === 'CANCELLED')
    : appointments

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const date = new Date(item.date)
    const color = STATUS_COLORS[item.status]
    const icon = STATUS_ICONS[item.status]

    return (
      <View style={styles.card}>
        <View style={[styles.statusStrip, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text variant="titleSmall" style={styles.service}>{item.service}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${color}20` }]}>
              <Ionicons name={icon} size={14} color={color} />
              <Text style={[styles.statusText, { color }]}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text variant="bodySmall" style={styles.detailText}>
                {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text variant="bodySmall" style={styles.detailText}>{item.timeSlot}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Appointments</Text>
      </View>

      <View style={styles.filters}>
        {(['all', 'upcoming', 'past'] as const).map(f => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipSelected]}
            textStyle={filter === f ? styles.chipTextSelected : styles.chipText}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAppointments} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No appointments found</Text>
            </View>
          ) : null
        }
        renderItem={renderAppointment}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: 20 + insets.bottom }]}
        onPress={() => navigation.navigate('BookAppointment')}
        color="#fff"
        customSize={52}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  headerTitle: { color: '#fff', fontWeight: '700' },
  filters: { flexDirection: 'row', padding: 16, gap: 8 },
  chip: { backgroundColor: '#e2e8f0' },
  chipSelected: { backgroundColor: '#d69e2e' },
  chipText: { color: '#64748b', fontSize: 12 },
  chipTextSelected: { color: '#fff', fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  fab: { position: 'absolute', right: 20, backgroundColor: '#d69e2e', elevation: 4 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  statusStrip: { width: 4 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  service: { fontWeight: '600', color: '#0f1b2d', flex: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardDetails: { marginTop: 10, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#64748b' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#94a3b8', marginTop: 12 },
})

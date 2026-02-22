import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar, Chip } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface Appointment {
  id: string
  clientName?: string
  clientEmail?: string
  service?: string
  date: string
  time?: string
  status: string
  notes?: string
  createdAt: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  COMPLETED: { bg: '#dcfce7', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
}

export default function AppointmentsListScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/appointments')
      setAppointments(Array.isArray(data) ? data : data.appointments || [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchAppointments() }, [fetchAppointments]))

  const filtered = search
    ? appointments.filter(a =>
        (a.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.clientEmail || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.service || '').toLowerCase().includes(search.toLowerCase())
      )
    : appointments

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getStatusStyle = (status: string) =>
    STATUS_COLORS[status] || STATUS_COLORS.PENDING

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Appointments</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            {appointments.length} total
          </Text>
        </View>
      </View>

      <Searchbar
        placeholder="Search appointments..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAppointments} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No appointments found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status)
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={styles.cardName}>
                    {item.clientName || 'Unknown Client'}
                  </Text>
                  <Text variant="bodySmall" style={styles.cardMeta}>
                    {item.service || 'No service specified'}
                  </Text>
                </View>
                <Chip
                  compact
                  textStyle={{ fontSize: 10, color: statusStyle.text, fontWeight: '700' }}
                  style={{ backgroundColor: statusStyle.bg }}
                >
                  {item.status}
                </Chip>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.cardDateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                </View>
                {item.time && (
                  <View style={styles.cardDateRow}>
                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                    <Text style={styles.cardDate}>{item.time}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  searchBar: { margin: 16, marginBottom: 8, elevation: 2, borderRadius: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardName: { fontWeight: '600', color: '#0f1b2d' },
  cardMeta: { color: '#94a3b8', marginTop: 2 },
  cardBottom: { flexDirection: 'row', gap: 16 },
  cardDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDate: { fontSize: 12, color: '#94a3b8' },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
})

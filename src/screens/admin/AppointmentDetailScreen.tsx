import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface Appointment {
  id: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  service?: string
  date: string
  time?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  COMPLETED: { bg: '#dcfce7', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
}

export default function AppointmentDetailScreen({ navigation, route }: any) {
  const { appointmentId } = route.params
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchAppointment = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/appointments/${appointmentId}`)
      setAppointment(data)
    } catch {
      Alert.alert('Error', 'Failed to load appointment details.')
    } finally {
      setLoading(false)
    }
  }, [appointmentId])

  useFocusEffect(useCallback(() => { fetchAppointment() }, [fetchAppointment]))

  const updateStatus = async (newStatus: string) => {
    setActionLoading(true)
    try {
      await api.patch(`/admin/appointments/${appointmentId}`, { status: newStatus })
      setAppointment(prev => prev ? { ...prev, status: newStatus } : prev)
      Alert.alert('Success', `Appointment marked as ${newStatus.toLowerCase()}.`)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update status.'
      Alert.alert('Error', msg)
    } finally {
      setActionLoading(false)
    }
  }

  const confirmStatusChange = (newStatus: string) => {
    Alert.alert(
      'Confirm',
      `Are you sure you want to mark this appointment as ${newStatus.toLowerCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => updateStatus(newStatus) },
      ]
    )
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  if (loading || !appointment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>Appointment</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d69e2e" />
        </View>
      </View>
    )
  }

  const statusStyle = STATUS_COLORS[appointment.status] || STATUS_COLORS.PENDING

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>Appointment</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAppointment} />}
      >
        {/* Status Badge */}
        <View style={styles.statusRow}>
          <Chip
            textStyle={{ fontSize: 13, color: statusStyle.text, fontWeight: '700' }}
            style={{ backgroundColor: statusStyle.bg }}
          >
            {appointment.status}
          </Chip>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <DetailRow icon="person-outline" label="Client" value={appointment.clientName || 'N/A'} />
          <Divider style={styles.divider} />
          <DetailRow icon="mail-outline" label="Email" value={appointment.clientEmail || 'N/A'} />
          <Divider style={styles.divider} />
          <DetailRow icon="call-outline" label="Phone" value={appointment.clientPhone || 'N/A'} />
          <Divider style={styles.divider} />
          <DetailRow icon="briefcase-outline" label="Service" value={appointment.service || 'N/A'} />
          <Divider style={styles.divider} />
          <DetailRow icon="calendar-outline" label="Date" value={formatDate(appointment.date)} />
          {appointment.time && (
            <>
              <Divider style={styles.divider} />
              <DetailRow icon="time-outline" label="Time" value={appointment.time} />
            </>
          )}
          {appointment.notes && (
            <>
              <Divider style={styles.divider} />
              <DetailRow icon="chatbox-outline" label="Notes" value={appointment.notes} />
            </>
          )}
        </View>

        {/* Action Buttons */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsRow}>
          {appointment.status !== 'CONFIRMED' && (
            <Button
              mode="contained"
              onPress={() => confirmStatusChange('CONFIRMED')}
              loading={actionLoading}
              disabled={actionLoading}
              buttonColor="#3b82f6"
              textColor="#fff"
              style={styles.actionBtn}
              icon="check"
              compact
            >
              Confirm
            </Button>
          )}
          {appointment.status !== 'COMPLETED' && (
            <Button
              mode="contained"
              onPress={() => confirmStatusChange('COMPLETED')}
              loading={actionLoading}
              disabled={actionLoading}
              buttonColor="#22c55e"
              textColor="#fff"
              style={styles.actionBtn}
              icon="checkmark-done"
              compact
            >
              Complete
            </Button>
          )}
          {appointment.status !== 'CANCELLED' && (
            <Button
              mode="contained"
              onPress={() => confirmStatusChange('CANCELLED')}
              loading={actionLoading}
              disabled={actionLoading}
              buttonColor="#ef4444"
              textColor="#fff"
              style={styles.actionBtn}
              icon="close"
              compact
            >
              Cancel
            </Button>
          )}
        </View>

        {/* Timestamps */}
        <Text style={styles.timestamp}>
          Created: {formatDate(appointment.createdAt)}
        </Text>
      </ScrollView>
    </View>
  )
}

function DetailRow({ icon, label, value }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color="#94a3b8" style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
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
  content: { padding: 16, paddingBottom: 40 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusRow: { alignItems: 'flex-start', marginBottom: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    elevation: 1, marginBottom: 20,
  },
  detailRow: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  detailLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { fontSize: 14, color: '#0f1b2d', marginTop: 2, fontWeight: '500' },
  divider: { backgroundColor: '#f1f5f9' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0f1b2d', marginBottom: 10 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  actionBtn: { borderRadius: 8 },
  timestamp: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 },
})

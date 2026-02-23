import React, { useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../api/client'
import type { ClientScreenProps } from '../../navigation/types'

const SERVICES = [
  'Income Tax Return',
  'GST Filing',
  'Tax Audit',
  'Company Registration',
  'TDS/TCS Filing',
  'ROC Compliance',
  'Consultation',
  'Other',
]

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

function toISODate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('-')
  return `${yyyy}-${mm}-${dd}`
}

export default function BookAppointmentScreen({ navigation }: ClientScreenProps<'BookAppointment'>) {
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [message, setMessage] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsLoaded, setSlotsLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchSlots = useCallback(async (isoDate: string) => {
    setSlotsLoading(true)
    setSlotsLoaded(false)
    setTimeSlot('')
    setSlots([])
    try {
      const { data } = await api.get('/user/available-slots', { params: { date: isoDate } })
      setSlots(data.slots || [])
      setSlotsLoaded(true)
    } catch {
      Alert.alert('Error', 'Failed to load available time slots. Please try again.')
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text)
    setDate(formatted)
    setTimeSlot('')
    setSlots([])
    setSlotsLoaded(false)

    if (formatted.length === 10) {
      const iso = toISODate(formatted)
      const parsed = new Date(iso)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (isNaN(parsed.getTime())) {
        Alert.alert('Invalid Date', 'Please enter a valid date.')
        return
      }
      if (parsed < today) {
        Alert.alert('Invalid Date', 'Please select a future date.')
        return
      }
      fetchSlots(iso)
    }
  }

  const handleSubmit = async () => {
    if (!service) return Alert.alert('Required', 'Please select a service.')
    if (date.length !== 10) return Alert.alert('Required', 'Please enter a valid date (DD-MM-YYYY).')
    if (!timeSlot) return Alert.alert('Required', 'Please select an available time slot.')

    const isoDate = toISODate(date)
    setSubmitting(true)
    try {
      await api.post('/user/appointments', {
        service,
        date: isoDate,
        timeSlot,
        message: message.trim() || undefined,
      })
      Alert.alert(
        'Appointment Booked!',
        `Your ${service} appointment has been booked for ${date} at ${timeSlot}.\n\nWe will confirm shortly.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to book appointment. Please try again.'
      Alert.alert('Error', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.firmLabel}>Himanshu Majithiya &amp; Co.</Text>
          <Text style={styles.headerTitle}>Book Appointment</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Service selection */}
        <Text style={styles.label}>Service <Text style={styles.required}>*</Text></Text>
        <View style={styles.chipGrid}>
          {SERVICES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.serviceChip, service === s && styles.chipSelected]}
              onPress={() => setService(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, service === s && styles.chipTextSelected]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date input */}
        <Text style={[styles.label, { marginTop: 20 }]}>Date <Text style={styles.required}>*</Text></Text>
        <View style={[styles.inputWrapper, date.length > 0 && date.length < 10 && styles.inputError]}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={handleDateChange}
            placeholder="DD-MM-YYYY"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
        <Text style={styles.hint}>Tap a date to see available slots from our calendar</Text>

        {/* Time slot section */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          Available Time Slots <Text style={styles.required}>*</Text>
        </Text>

        {slotsLoading && (
          <View style={styles.slotsLoading}>
            <ActivityIndicator size="small" color="#d69e2e" />
            <Text style={styles.slotsLoadingText}>Checking availability...</Text>
          </View>
        )}

        {!slotsLoading && slotsLoaded && slots.length === 0 && (
          <View style={styles.noSlots}>
            <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            <Text style={styles.noSlotsText}>No slots available for this date.</Text>
            <Text style={styles.noSlotsHint}>Please try a different date.</Text>
          </View>
        )}

        {!slotsLoading && slots.length > 0 && (
          <View style={styles.chipGrid}>
            {slots.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, timeSlot === t && styles.chipSelected]}
                onPress={() => setTimeSlot(t)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, timeSlot === t && styles.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!slotsLoaded && !slotsLoading && (
          <Text style={styles.hint}>Enter a date above to see available slots</Text>
        )}

        {/* Message */}
        <Text style={[styles.label, { marginTop: 20 }]}>Message (optional)</Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Any specific requirements or notes..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Book Appointment</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  firmLabel: { fontSize: 10, color: '#d69e2e', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 2 },
  content: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10, letterSpacing: 0.3 },
  required: { color: '#ef4444' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  timeChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#e2e8f0', backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#d69e2e', borderColor: '#d69e2e' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 14, minHeight: 52,
  },
  inputError: { borderColor: '#ef4444' },
  textAreaWrapper: { alignItems: 'flex-start', paddingVertical: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#0f1b2d', paddingVertical: 0 },
  textArea: { minHeight: 72 },
  hint: { fontSize: 11, color: '#94a3b8', marginTop: 4, marginLeft: 2 },
  slotsLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  slotsLoadingText: { fontSize: 13, color: '#64748b' },
  noSlots: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  noSlotsText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  noSlotsHint: { fontSize: 12, color: '#94a3b8' },
  submitBtn: {
    marginTop: 28, backgroundColor: '#d69e2e', borderRadius: 14,
    height: 54, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})

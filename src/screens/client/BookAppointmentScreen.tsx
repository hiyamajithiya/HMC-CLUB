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
import DateTimePicker from '@react-native-community/datetimepicker'
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

function toISODateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BookAppointmentScreen({ navigation }: ClientScreenProps<'BookAppointment'>) {
  const [service, setService] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [timeSlot, setTimeSlot] = useState('')
  const [message, setMessage] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsLoaded, setSlotsLoaded] = useState(false)
  const [slotsError, setSlotsError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchSlots = useCallback(async (isoDate: string) => {
    setSlotsLoading(true)
    setSlotsLoaded(false)
    setSlotsError('')
    setTimeSlot('')
    setSlots([])
    try {
      const { data } = await api.get('/user/available-slots', { params: { date: isoDate } })
      setSlots(data.slots || [])
      setSlotsLoaded(true)
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Could not load available slots. Please check your connection and try again.'
      setSlotsError(msg)
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios') // keep open on iOS, close on Android
    if (date) {
      setSelectedDate(date)
      setTimeSlot('')
      setSlots([])
      setSlotsLoaded(false)
      setSlotsError('')
      fetchSlots(toISODateStr(date))
    }
  }

  const handleSubmit = async () => {
    if (!service) return Alert.alert('Required', 'Please select a service.')
    if (!selectedDate) return Alert.alert('Required', 'Please select a date.')
    if (!timeSlot) return Alert.alert('Required', 'Please select an available time slot.')

    setSubmitting(true)
    try {
      await api.post('/user/appointments', {
        service,
        date: toISODateStr(selectedDate),
        timeSlot,
        message: message.trim() || undefined,
      })
      Alert.alert(
        'Appointment Booked!',
        `Your ${service} appointment has been booked for ${formatDisplayDate(selectedDate)} at ${timeSlot}.\n\nWe will confirm shortly.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to book appointment. Please try again.'
      Alert.alert('Error', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* Date picker */}
        <Text style={[styles.label, { marginTop: 20 }]}>Date <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={20} color={selectedDate ? '#0f1b2d' : '#94a3b8'} />
          <Text style={[styles.dateBtnText, !selectedDate && styles.dateBtnPlaceholder]}>
            {selectedDate ? formatDisplayDate(selectedDate) : 'Tap to select a date'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#94a3b8" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || today}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={today}
            onChange={handleDateChange}
            themeVariant="light"
          />
        )}

        {/* iOS close button */}
        {showDatePicker && Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.iosDateDone} onPress={() => setShowDatePicker(false)}>
            <Text style={styles.iosDateDoneText}>Done</Text>
          </TouchableOpacity>
        )}

        {/* Time slot section */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          Available Time Slots <Text style={styles.required}>*</Text>
        </Text>

        {slotsLoading && (
          <View style={styles.slotsLoading}>
            <ActivityIndicator size="small" color="#d69e2e" />
            <Text style={styles.slotsLoadingText}>Checking calendar availability...</Text>
          </View>
        )}

        {!slotsLoading && slotsError !== '' && (
          <View style={styles.slotsError}>
            <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
            <Text style={styles.slotsErrorText}>{slotsError}</Text>
            {selectedDate && (
              <TouchableOpacity onPress={() => fetchSlots(toISODateStr(selectedDate))} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!slotsLoading && slotsLoaded && slots.length === 0 && (
          <View style={styles.noSlots}>
            <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            <Text style={styles.noSlotsText}>No slots available for this date.</Text>
            <Text style={styles.noSlotsHint}>Please select a different date.</Text>
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

        {!slotsLoaded && !slotsLoading && !slotsError && (
          <Text style={styles.hint}>Select a date above to see available slots</Text>
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
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  dateBtnText: { flex: 1, fontSize: 15, color: '#0f1b2d', fontWeight: '500' },
  dateBtnPlaceholder: { color: '#94a3b8', fontWeight: '400' },
  iosDateDone: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: '#d69e2e',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  iosDateDoneText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    paddingHorizontal: 14, minHeight: 52,
  },
  textAreaWrapper: { alignItems: 'flex-start', paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, color: '#0f1b2d', paddingVertical: 0 },
  textArea: { minHeight: 72 },
  hint: { fontSize: 11, color: '#94a3b8', marginTop: 4, marginLeft: 2 },
  slotsLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  slotsLoadingText: { fontSize: 13, color: '#64748b' },
  slotsError: {
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap',
  },
  slotsErrorText: { flex: 1, fontSize: 13, color: '#ef4444', lineHeight: 18 },
  retryBtn: { marginTop: 8, backgroundColor: '#ef4444', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  retryBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
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

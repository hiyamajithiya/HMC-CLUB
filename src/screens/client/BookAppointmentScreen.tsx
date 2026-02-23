import React, { useState } from 'react'
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

const TIME_SLOTS = [
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
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
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!service) return Alert.alert('Required', 'Please select a service.')
    if (date.length !== 10) return Alert.alert('Required', 'Please enter a valid date (DD-MM-YYYY).')
    if (!timeSlot) return Alert.alert('Required', 'Please select a time slot.')

    const isoDate = toISODate(date)
    const parsed = new Date(isoDate)
    if (isNaN(parsed.getTime())) return Alert.alert('Invalid Date', 'Please enter a valid date.')
    if (parsed < new Date(new Date().setHours(0, 0, 0, 0))) {
      return Alert.alert('Invalid Date', 'Please select a future date.')
    }

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
        `Your ${service} appointment has been booked for ${date} at ${timeSlot}. We will confirm shortly.`,
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

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
            onChangeText={t => setDate(formatDateInput(t))}
            placeholder="DD-MM-YYYY"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>
        <Text style={styles.hint}>Enter date in DD-MM-YYYY format</Text>

        {/* Time slot selection */}
        <Text style={[styles.label, { marginTop: 20 }]}>Time Slot <Text style={styles.required}>*</Text></Text>
        <View style={styles.chipGrid}>
          {TIME_SLOTS.map(t => (
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
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit button */}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firmLabel: {
    fontSize: 10,
    color: '#d69e2e',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 2 },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  required: { color: '#ef4444' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: '#d69e2e', borderColor: '#d69e2e' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputError: { borderColor: '#ef4444' },
  textAreaWrapper: { alignItems: 'flex-start', paddingVertical: 12 },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f1b2d',
    paddingVertical: 0,
  },
  textArea: { minHeight: 80 },
  hint: { fontSize: 11, color: '#94a3b8', marginTop: 4, marginLeft: 2 },
  submitBtn: {
    marginTop: 28,
    backgroundColor: '#d69e2e',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})

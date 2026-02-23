import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../api/client'

const ROLES = ['ADMIN', 'CLIENT'] as const

// Auto-format digits into dd-mm-yyyy as user types
function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

// Convert dd-mm-yyyy to yyyy-mm-dd for API (new Date() parses ISO correctly)
function toISODate(ddmmyyyy: string): string | undefined {
  const parts = ddmmyyyy.split('-')
  if (parts.length !== 3 || parts[2].length !== 4) return undefined
  return `${parts[2]}-${parts[1]}-${parts[0]}`
}

export default function UserCreateScreen({ navigation }: any) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'CLIENT'>('CLIENT')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [services, setServices] = useState('')
  const [saving, setSaving] = useState(false)

  const isDobRequired = role === 'CLIENT'

  const handleDateChange = (text: string) => {
    setDateOfBirth(formatDateInput(text))
  }

  const handleSubmit = async () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Name and Password are required.')
      return
    }
    if (isDobRequired && dateOfBirth.length < 10) {
      Alert.alert('Validation Error', 'Date of Birth/Incorporation is required for clients. Please enter it in dd-mm-yyyy format.')
      return
    }
    if (dateOfBirth.length > 0 && dateOfBirth.length < 10) {
      Alert.alert('Validation Error', 'Please enter a complete date in dd-mm-yyyy format.')
      return
    }

    const isoDate = dateOfBirth.length === 10 ? toISODate(dateOfBirth) : undefined
    if (dateOfBirth.length === 10 && !isoDate) {
      Alert.alert('Validation Error', 'Invalid date. Please use dd-mm-yyyy format.')
      return
    }

    setSaving(true)
    try {
      await api.post('/admin/users', {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        loginId: loginId.trim() || undefined,
        password,
        role,
        dateOfBirth: isoDate,
        services: services.trim() ? services.split(',').map(s => s.trim()) : undefined,
      })
      Alert.alert('Success', 'User created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create user.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>Create User</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Login ID"
          value={loginId}
          onChangeText={setLoginId}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Password *"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />

        {/* Role Selector */}
        <Text style={styles.label}>Role</Text>
        <View style={styles.roleRow}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, role === r && styles.roleChipActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label={isDobRequired ? 'Date of Birth / Incorporation * (dd-mm-yyyy)' : 'Date of Birth / Incorporation (dd-mm-yyyy)'}
          value={dateOfBirth}
          onChangeText={handleDateChange}
          mode="outlined"
          style={styles.input}
          keyboardType="number-pad"
          placeholder="09-06-1983"
          maxLength={10}
          outlineColor={isDobRequired && !dateOfBirth ? '#ef4444' : '#e2e8f0'}
          activeOutlineColor="#d69e2e"
          right={
            dateOfBirth.length === 10
              ? <TextInput.Icon icon="check-circle" color="#22c55e" />
              : isDobRequired
              ? <TextInput.Icon icon="calendar" color="#d69e2e" />
              : undefined
          }
        />
        {isDobRequired && !dateOfBirth && (
          <Text style={styles.fieldHint}>Required for client accounts</Text>
        )}

        <TextInput
          label="Services (comma-separated)"
          value={services}
          onChangeText={setServices}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          buttonColor="#d69e2e"
          textColor="#fff"
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Create User
        </Button>
      </ScrollView>
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
  input: { marginBottom: 4, backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, marginTop: 8 },
  fieldHint: { fontSize: 12, color: '#ef4444', marginBottom: 12, marginTop: 2, marginLeft: 4 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleChip: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  roleChipActive: { borderColor: '#d69e2e', backgroundColor: '#fef3c7' },
  roleChipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  roleChipTextActive: { color: '#d69e2e' },
  submitBtn: { marginTop: 12, borderRadius: 10 },
})

import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

const ROLES = ['ADMIN', 'CLIENT'] as const

export default function UserEditScreen({ navigation, route }: any) {
  const { userId } = route.params
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'CLIENT'>('CLIENT')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [services, setServices] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/users/${userId}`)
      setName(data.name || '')
      setEmail(data.email || '')
      setPhone(data.phone || '')
      setLoginId(data.loginId || '')
      setRole(data.role || 'CLIENT')
      setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '')
      setServices(Array.isArray(data.services) ? data.services.join(', ') : '')
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load user details.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useFocusEffect(useCallback(() => { fetchUser() }, [fetchUser]))

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required.')
      return
    }
    setSaving(true)
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        loginId: loginId.trim() || undefined,
        role,
        dateOfBirth: dateOfBirth.trim() || undefined,
        services: services.trim() ? services.split(',').map(s => s.trim()) : undefined,
      }
      if (password.trim()) {
        payload.password = password.trim()
      }
      await api.patch(`/admin/users/${userId}`, payload)
      Alert.alert('Success', 'User updated successfully.')
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to update user.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>Edit User</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d69e2e" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>Edit User</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUser} />}
      >
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
          label="New Password (leave blank to keep)"
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
          label="Date of Birth (YYYY-MM-DD)"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
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
          Save Changes
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('UserDocuments', { userId, userName: name })}
          style={styles.docsBtn}
          textColor="#0f1b2d"
          icon="folder-outline"
        >
          View Documents
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
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, marginTop: 4 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleChip: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  roleChipActive: { borderColor: '#d69e2e', backgroundColor: '#fef3c7' },
  roleChipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  roleChipTextActive: { color: '#d69e2e' },
  submitBtn: { marginTop: 8, borderRadius: 10 },
  docsBtn: { marginTop: 12, borderRadius: 10, borderColor: '#e2e8f0' },
})

import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { api } from '../../api/client'

export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/user/change-password', { currentPassword, newPassword })
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to change password'
      Alert.alert('Error', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="bodyMedium" style={styles.description}>
        Enter your current password and choose a new one (minimum 6 characters).
      </Text>

      <TextInput
        mode="outlined"
        label="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry={!showCurrent}
        left={<TextInput.Icon icon="lock" />}
        right={<TextInput.Icon icon={showCurrent ? 'eye-off' : 'eye'} onPress={() => setShowCurrent(!showCurrent)} />}
        style={styles.input}
        outlineColor="#e2e8f0"
        activeOutlineColor="#d69e2e"
      />

      <TextInput
        mode="outlined"
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!showNew}
        left={<TextInput.Icon icon="lock-reset" />}
        right={<TextInput.Icon icon={showNew ? 'eye-off' : 'eye'} onPress={() => setShowNew(!showNew)} />}
        style={styles.input}
        outlineColor="#e2e8f0"
        activeOutlineColor="#d69e2e"
      />

      <TextInput
        mode="outlined"
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showNew}
        left={<TextInput.Icon icon="lock-check" />}
        style={styles.input}
        outlineColor="#e2e8f0"
        activeOutlineColor="#d69e2e"
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
        buttonColor="#d69e2e"
        textColor="#fff"
        labelStyle={{ fontWeight: '700' }}
      >
        Change Password
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  description: { color: '#64748b', marginBottom: 24 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  button: { marginTop: 8, borderRadius: 8, paddingVertical: 4 },
})

import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../api/client'
import type { AuthScreenProps } from '../../navigation/types'

export default function ForgotPasswordScreen({ navigation }: AuthScreenProps<'ForgotPassword'>) {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      Alert.alert('Error', 'Please enter your email or login ID')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { identifier: identifier.trim() })
      setSent(true)
    } catch (error: any) {
      // Always show success to prevent email enumeration
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </View>
          <Text variant="headlineMedium" style={styles.title}>Forgot Password</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Himanshu Majithiya & Co.</Text>
        </View>

        <View style={styles.card}>
          {sent ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              </View>
              <Text variant="titleMedium" style={styles.successTitle}>Check your email</Text>
              <Text variant="bodyMedium" style={styles.successText}>
                If an account exists with this email/login ID, you will receive a password reset link shortly.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={styles.button}
                buttonColor="#d69e2e"
                textColor="#fff"
              >
                Return to Login
              </Button>
            </View>
          ) : (
            <>
              <Text variant="titleLarge" style={styles.cardTitle}>Reset your password</Text>
              <Text variant="bodyMedium" style={styles.cardSubtitle}>
                Enter your email or login ID and we'll send you a reset link
              </Text>

              <TextInput
                mode="outlined"
                label="Email or Login ID"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                outlineColor="#e2e8f0"
                activeOutlineColor="#d69e2e"
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#d69e2e"
                textColor="#fff"
                icon="email"
                labelStyle={{ fontWeight: '700' }}
              >
                Send Reset Link
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1b2d' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backText: { color: 'rgba(255,255,255,0.8)', marginLeft: 8 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#d69e2e', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { color: '#fff', fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  cardTitle: { fontWeight: '700', color: '#0f1b2d', marginBottom: 4 },
  cardSubtitle: { color: '#64748b', marginBottom: 20 },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  button: { marginTop: 8, borderRadius: 8, paddingVertical: 4 },
  successContainer: { alignItems: 'center', paddingVertical: 16 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontWeight: '700', color: '#0f1b2d', marginBottom: 8 },
  successText: { color: '#64748b', textAlign: 'center', marginBottom: 24 },
})

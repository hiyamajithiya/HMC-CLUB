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
import { useAuthStore } from '../../store/auth'
import { isMultiAccount } from '../../types'
import type { AuthScreenProps } from '../../navigation/types'

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your login ID/email and password')
      return
    }

    setLoading(true)
    try {
      const result = await login(identifier.trim(), password)
      if (isMultiAccount(result)) {
        navigation.navigate('AccountSelection', {
          accounts: result.accounts,
          identifier: identifier.trim(),
          password,
        })
      }
      // If direct login, auth store updates and RootNavigator switches automatically
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Login failed'
      Alert.alert('Login Failed', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding Section */}
        <View style={styles.brandSection}>
          {/* Logo mark */}
          <View style={styles.logoMark}>
            <Text style={styles.logoInitials}>HM</Text>
            <View style={styles.logoAmpersand}>
              <Text style={styles.logoAmpersandText}>&amp;</Text>
            </View>
          </View>

          {/* Firm name */}
          <Text style={styles.firmName}>Himanshu Majithiya</Text>
          <View style={styles.firmNameRow}>
            <View style={styles.ampLine} />
            <Text style={styles.firmAmp}>&amp; Co.</Text>
            <View style={styles.ampLine} />
          </View>
          <Text style={styles.firmTagline}>Chartered Accountants</Text>

          {/* Divider */}
          <View style={styles.brandDivider} />
          <Text style={styles.portalLabel}>CLIENT PORTAL</Text>
        </View>

        {/* Sign In Card */}
        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <Text variant="titleLarge" style={styles.cardTitle}>
            Welcome Back
          </Text>
          <Text variant="bodyMedium" style={styles.cardSubtitle}>
            Sign in to your account
          </Text>

          <TextInput
            mode="outlined"
            label="Login ID or Email"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            outlineColor="#e2e8f0"
            activeOutlineColor="#d69e2e"
            disabled={loading}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            outlineColor="#e2e8f0"
            activeOutlineColor="#d69e2e"
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#d69e2e"
            textColor="#fff"
            labelStyle={{ fontWeight: '700', fontSize: 16 }}
          >
            Sign In
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>himanshumajithiya.com</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* — Branding — */
  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#d69e2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 6,
    shadowColor: '#d69e2e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    position: 'relative',
  },
  logoInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  logoAmpersand: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0a1628',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d69e2e',
  },
  logoAmpersandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d69e2e',
  },
  firmName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  firmNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  ampLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(214,158,46,0.35)',
    maxWidth: 40,
  },
  firmAmp: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d69e2e',
    letterSpacing: 0.5,
  },
  firmTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  brandDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#d69e2e',
    borderRadius: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  portalLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 3,
    fontWeight: '600',
  },

  /* — Card — */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    paddingTop: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#d69e2e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0f1b2d',
    marginBottom: 4,
    marginTop: 4,
  },
  cardSubtitle: {
    color: '#64748b',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 4,
  },
  forgotLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    color: '#d69e2e',
    fontWeight: '600',
    fontSize: 14,
  },

  /* — Footer — */
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    marginTop: 20,
    letterSpacing: 0.5,
  },
})

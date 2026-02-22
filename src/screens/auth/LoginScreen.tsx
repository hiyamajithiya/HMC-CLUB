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
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </View>
          <Text variant="headlineMedium" style={styles.title}>
            HMC Club
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Himanshu Majithiya & Co.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Sign In
          </Text>
          <Text variant="bodyMedium" style={styles.cardSubtitle}>
            Enter your login ID or email
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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1b2d',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#d69e2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#0f1b2d',
    marginBottom: 4,
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
})

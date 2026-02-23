import React, { useState } from 'react'
import { View, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../../store/auth'
import type { AuthScreenProps } from '../../navigation/types'

export default function AccountSelectionScreen({ route, navigation }: AuthScreenProps<'AccountSelection'>) {
  const { accounts, identifier, password } = route.params
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const login = useAuthStore(s => s.login)

  const handleSelect = async (userId: string) => {
    setSelectedId(userId)
    setLoading(true)
    try {
      await login(identifier, password, userId)
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Login failed'
      Alert.alert('Error', message)
    } finally {
      setLoading(false)
      setSelectedId(null)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>HM&amp;Co</Text>
          </View>
          <Text style={styles.brandName}>Himanshu Majithiya &amp; Co.</Text>
        </View>
        <Text variant="headlineSmall" style={styles.title}>Select Account</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Multiple accounts found. Choose one to continue.
        </Text>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.accountCard}
            onPress={() => handleSelect(item.id)}
            disabled={loading}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#d69e2e" />
            </View>
            <View style={styles.accountInfo}>
              <Text variant="titleMedium" style={styles.accountName}>
                {item.name || 'Unnamed'}
              </Text>
              <Text variant="bodySmall" style={styles.accountId}>
                {item.loginId || 'No Login ID'} · {item.role}
              </Text>
            </View>
            {loading && selectedId === item.id ? (
              <Button loading disabled textColor="#d69e2e">{''}</Button>
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1b2d' },
  header: { padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  brandBadge: {
    backgroundColor: '#d69e2e', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  brandBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  brandName: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  title: { color: '#fff', fontWeight: '700', marginBottom: 4 },
  subtitle: { color: 'rgba(255,255,255,0.7)' },
  list: { padding: 24 },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: { flex: 1 },
  accountName: { fontWeight: '600', color: '#0f1b2d' },
  accountId: { color: '#64748b', marginTop: 2 },
})

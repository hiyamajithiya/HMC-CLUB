import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Notifications</Text>
      </View>
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={48} color="#94a3b8" />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptyText}>
          You'll receive notifications when new documents are shared or appointment statuses change.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  headerTitle: { color: '#fff', fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { color: '#0f1b2d', fontWeight: '600', fontSize: 16, marginTop: 16 },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 8 },
})

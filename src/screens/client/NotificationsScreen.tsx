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
      <View style={styles.body}>
        <Ionicons name="notifications-off-outline" size={52} color="#94a3b8" />
        <Text style={styles.emptyText}>No notifications yet</Text>
        <Text style={styles.subText}>
          You'll receive alerts here for appointments, documents, and updates.
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#475569' },
  subText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },
})

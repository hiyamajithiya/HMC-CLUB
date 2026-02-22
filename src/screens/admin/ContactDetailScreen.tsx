import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  service?: string
  message?: string
  isRead: boolean
  createdAt: string
}

export default function ContactDetailScreen({ navigation, route }: any) {
  const { contactId } = route.params
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const fetchContact = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/contacts/${contactId}`)
      setContact(data)
    } catch {
      Alert.alert('Error', 'Failed to load contact details.')
    } finally {
      setLoading(false)
    }
  }, [contactId])

  useFocusEffect(useCallback(() => { fetchContact() }, [fetchContact]))

  const markAsRead = async () => {
    setMarking(true)
    try {
      await api.patch(`/admin/contacts/${contactId}`, { isRead: true })
      setContact(prev => prev ? { ...prev, isRead: true } : prev)
      Alert.alert('Success', 'Contact marked as read.')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to update contact.'
      Alert.alert('Error', msg)
    } finally {
      setMarking(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading || !contact) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>Contact</Text>
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
        <Text variant="headlineSmall" style={styles.headerTitle}>Contact</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchContact} />}
      >
        {/* Read Status */}
        <View style={[styles.statusBanner, contact.isRead ? styles.readBanner : styles.unreadBanner]}>
          <Ionicons
            name={contact.isRead ? 'checkmark-circle' : 'mail-unread'}
            size={18}
            color={contact.isRead ? '#166534' : '#92400e'}
          />
          <Text style={[styles.statusText, { color: contact.isRead ? '#166534' : '#92400e' }]}>
            {contact.isRead ? 'Read' : 'Unread'}
          </Text>
        </View>

        {/* Contact Details Card */}
        <View style={styles.card}>
          <DetailRow icon="person-outline" label="Name" value={contact.name} />
          <Divider style={styles.divider} />
          <DetailRow icon="mail-outline" label="Email" value={contact.email || 'N/A'} />
          <Divider style={styles.divider} />
          <DetailRow icon="call-outline" label="Phone" value={contact.phone || 'N/A'} />
          <Divider style={styles.divider} />
          <DetailRow icon="briefcase-outline" label="Service" value={contact.service || 'N/A'} />
        </View>

        {/* Message */}
        {contact.message && (
          <View style={styles.messageCard}>
            <Text style={styles.messageLabel}>Message</Text>
            <Text style={styles.messageText}>{contact.message}</Text>
          </View>
        )}

        {/* Mark as Read Button */}
        {!contact.isRead && (
          <Button
            mode="contained"
            onPress={markAsRead}
            loading={marking}
            disabled={marking}
            buttonColor="#d69e2e"
            textColor="#fff"
            style={styles.readBtn}
            contentStyle={{ paddingVertical: 6 }}
            icon="check"
          >
            Mark as Read
          </Button>
        )}

        <Text style={styles.timestamp}>Received: {formatDate(contact.createdAt)}</Text>
      </ScrollView>
    </View>
  )
}

function DetailRow({ icon, label, value }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color="#94a3b8" style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
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
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 16,
  },
  readBanner: { backgroundColor: '#dcfce7' },
  unreadBanner: { backgroundColor: '#fef3c7' },
  statusText: { fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    elevation: 1, marginBottom: 16,
  },
  detailRow: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  detailLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' },
  detailValue: { fontSize: 14, color: '#0f1b2d', marginTop: 2, fontWeight: '500' },
  divider: { backgroundColor: '#f1f5f9' },
  messageCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    elevation: 1, marginBottom: 16,
  },
  messageLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  messageText: { fontSize: 14, color: '#0f1b2d', lineHeight: 22 },
  readBtn: { borderRadius: 10, marginBottom: 16 },
  timestamp: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 },
})

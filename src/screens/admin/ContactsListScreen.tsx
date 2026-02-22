import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar } from 'react-native-paper'
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

export default function ContactsListScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/contacts')
      setContacts(Array.isArray(data) ? data : data.contacts || [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchContacts() }, [fetchContacts]))

  const filtered = search
    ? contacts.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.service || '').toLowerCase().includes(search.toLowerCase())
      )
    : contacts

  const unreadCount = contacts.filter(c => !c.isRead).length

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Contacts</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            {contacts.length} total{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
          </Text>
        </View>
      </View>

      <Searchbar
        placeholder="Search contacts..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchContacts} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="mail-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No contacts found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.isRead && styles.cardUnread]}
            onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}
          >
            <View style={styles.cardLeft}>
              {!item.isRead && <View style={styles.unreadDot} />}
              <View style={[styles.avatar, !item.isRead ? { backgroundColor: '#ede9fe' } : { backgroundColor: '#f1f5f9' }]}>
                <Ionicons
                  name="person"
                  size={18}
                  color={!item.isRead ? '#8b5cf6' : '#94a3b8'}
                />
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text
                variant="titleSmall"
                style={[styles.cardName, !item.isRead && { fontWeight: '700' }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.cardService} numberOfLines={1}>
                {item.service || item.email || 'No service'}
              </Text>
              {item.message && (
                <Text variant="bodySmall" style={styles.cardMessage} numberOfLines={1}>
                  {item.message}
                </Text>
              )}
            </View>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </TouchableOpacity>
        )}
      />
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
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  searchBar: { margin: 16, marginBottom: 8, elevation: 2, borderRadius: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#8b5cf6' },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#8b5cf6', marginRight: 6,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontWeight: '600', color: '#0f1b2d' },
  cardService: { color: '#64748b', marginTop: 1, fontSize: 12 },
  cardMessage: { color: '#94a3b8', marginTop: 2, fontSize: 12 },
  cardDate: { fontSize: 11, color: '#94a3b8' },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
})

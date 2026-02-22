import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar, Chip } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  toolName?: string
  tool?: { name: string }
  verified: boolean
  downloadDate?: string
  createdAt: string
}

export default function LeadsListScreen({ navigation }: any) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/leads')
      setLeads(Array.isArray(data) ? data : data.leads || [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchLeads() }, [fetchLeads]))

  const filtered = search
    ? leads.filter(l =>
        (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.toolName || l.tool?.name || '').toLowerCase().includes(search.toLowerCase())
      )
    : leads

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
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
          <Text variant="headlineSmall" style={styles.headerTitle}>Leads</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>{leads.length} total</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Search leads..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLeads} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No leads found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.leadAvatar}>
                <Text style={styles.leadAvatarText}>
                  {(item.name || 'L').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text variant="titleSmall" style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text variant="bodySmall" style={styles.cardEmail} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>
              <Chip
                compact
                textStyle={{
                  fontSize: 10,
                  color: item.verified ? '#166534' : '#92400e',
                  fontWeight: '700',
                }}
                style={{
                  backgroundColor: item.verified ? '#dcfce7' : '#fef3c7',
                }}
              >
                {item.verified ? 'Verified' : 'Unverified'}
              </Chip>
            </View>
            <View style={styles.cardBottom}>
              {(item.toolName || item.tool?.name) && (
                <View style={styles.toolBadge}>
                  <Ionicons name="construct-outline" size={12} color="#3b82f6" />
                  <Text style={styles.toolText}>{item.toolName || item.tool?.name}</Text>
                </View>
              )}
              <Text style={styles.cardDate}>
                {formatDate(item.downloadDate || item.createdAt)}
              </Text>
            </View>
          </View>
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
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  leadAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fce7f3', justifyContent: 'center', alignItems: 'center',
  },
  leadAvatarText: { fontSize: 16, fontWeight: '700', color: '#ec4899' },
  cardInfo: { flex: 1, marginLeft: 10 },
  cardName: { fontWeight: '600', color: '#0f1b2d' },
  cardEmail: { color: '#94a3b8', marginTop: 1 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  toolText: { fontSize: 11, color: '#3b82f6', fontWeight: '600' },
  cardDate: { fontSize: 11, color: '#94a3b8' },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
})

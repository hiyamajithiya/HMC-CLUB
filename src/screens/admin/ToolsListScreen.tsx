import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar, FAB, Chip } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface Tool {
  id: string
  name: string
  shortDescription?: string
  version?: string
  category?: string
  toolType?: string
  price?: number
  isActive: boolean
  createdAt: string
}

export default function ToolsListScreen({ navigation }: any) {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchTools = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/tools')
      setTools(Array.isArray(data) ? data : data.tools || [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchTools() }, [fetchTools]))

  const filtered = search
    ? tools.filter(t =>
        (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(search.toLowerCase())
      )
    : tools

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Tools</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>{tools.length} total</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Search tools..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTools} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="construct-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No tools found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ToolEdit', { toolId: item.id })}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="construct" size={22} color="#22c55e" />
            </View>
            <View style={styles.cardInfo}>
              <Text variant="titleSmall" style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.cardMeta} numberOfLines={1}>
                {[item.category, item.version, item.toolType].filter(Boolean).join(' · ') || 'No details'}
              </Text>
            </View>
            <View style={styles.cardRight}>
              <Chip
                compact
                textStyle={{
                  fontSize: 10,
                  color: item.isActive ? '#166534' : '#991b1b',
                  fontWeight: '700',
                }}
                style={{
                  backgroundColor: item.isActive ? '#dcfce7' : '#fee2e2',
                }}
              >
                {item.isActive ? 'Active' : 'Inactive'}
              </Chip>
              {item.price !== undefined && item.price > 0 && (
                <Text style={styles.priceTag}>${item.price}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('ToolCreate')}
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
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontWeight: '600', color: '#0f1b2d' },
  cardMeta: { color: '#94a3b8', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  priceTag: { fontSize: 12, fontWeight: '700', color: '#d69e2e' },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#d69e2e', borderRadius: 28,
  },
})

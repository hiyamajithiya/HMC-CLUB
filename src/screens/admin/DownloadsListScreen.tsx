import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar, FAB } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface Download {
  id: string
  title: string
  description?: string
  fileName?: string
  fileSize?: number
  category?: string
  downloadCount?: number
  createdAt: string
}

export default function DownloadsListScreen({ navigation }: any) {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchDownloads = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/downloads')
      setDownloads(Array.isArray(data) ? data : data.downloads || [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchDownloads() }, [fetchDownloads]))

  const filtered = search
    ? downloads.filter(d =>
        (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.category || '').toLowerCase().includes(search.toLowerCase())
      )
    : downloads

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

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
          <Text variant="headlineSmall" style={styles.headerTitle}>Downloads</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>{downloads.length} total</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Search downloads..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDownloads} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="cloud-download-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No downloads found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DownloadEdit', { downloadId: item.id })}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="cloud-download" size={22} color="#f59e0b" />
            </View>
            <View style={styles.cardInfo}>
              <Text variant="titleSmall" style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.cardMeta} numberOfLines={1}>
                {[item.category, formatFileSize(item.fileSize)].filter(Boolean).join(' · ') || 'No details'}
              </Text>
            </View>
            <View style={styles.cardRight}>
              {item.downloadCount !== undefined && (
                <View style={styles.countBadge}>
                  <Ionicons name="download-outline" size={12} color="#64748b" />
                  <Text style={styles.countText}>{item.downloadCount}</Text>
                </View>
              )}
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('DownloadCreate')}
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
    backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontWeight: '600', color: '#0f1b2d' },
  cardMeta: { color: '#94a3b8', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  countText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  cardDate: { fontSize: 11, color: '#94a3b8' },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#d69e2e', borderRadius: 28,
  },
})

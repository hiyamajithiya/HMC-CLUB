import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar, FAB, Chip } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface BlogPost {
  id: string
  title: string
  excerpt?: string
  category?: string
  tags?: string[]
  coverImage?: string
  published: boolean
  createdAt: string
  updatedAt?: string
}

export default function BlogListScreen({ navigation }: any) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/blog')
      setPosts(Array.isArray(data) ? data : data.posts || [])
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchPosts() }, [fetchPosts]))

  const filtered = search
    ? posts.filter(p =>
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
      )
    : posts

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
          <Text variant="headlineSmall" style={styles.headerTitle}>Blog Posts</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>{posts.length} total</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Search posts..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPosts} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="newspaper-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No blog posts found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BlogEdit', { blogId: item.id })}
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.excerpt && (
                  <Text variant="bodySmall" style={styles.cardExcerpt} numberOfLines={2}>
                    {item.excerpt}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.cardBottom}>
              <Chip
                compact
                textStyle={{
                  fontSize: 10,
                  color: item.published ? '#166534' : '#92400e',
                  fontWeight: '700',
                }}
                style={{
                  backgroundColor: item.published ? '#dcfce7' : '#fef3c7',
                }}
              >
                {item.published ? 'Published' : 'Draft'}
              </Chip>
              {item.category && (
                <Chip
                  compact
                  textStyle={{ fontSize: 10, color: '#3b82f6', fontWeight: '600' }}
                  style={{ backgroundColor: '#dbeafe' }}
                >
                  {item.category}
                </Chip>
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
        onPress={() => navigation.navigate('BlogCreate')}
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
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  cardTop: { flexDirection: 'row', marginBottom: 10 },
  cardTitle: { fontWeight: '600', color: '#0f1b2d' },
  cardExcerpt: { color: '#94a3b8', marginTop: 4, lineHeight: 18 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDate: { fontSize: 11, color: '#94a3b8', marginLeft: 'auto' },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#d69e2e', borderRadius: 28,
  },
})

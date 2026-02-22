import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'
import type { User } from '../../types'
import type { AdminTabScreenProps } from '../../navigation/types'

export default function AdminDocumentsScreen({ navigation }: AdminTabScreenProps<'AdminDocuments'>) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      // Only show client users for document management
      setUsers(data.filter((u: User) => u.role === 'CLIENT'))
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchUsers() }, [fetchUsers]))

  const filtered = search
    ? users.filter(u =>
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    )
    : users

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Documents</Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          Select a client to manage their documents
        </Text>
      </View>

      <Searchbar
        placeholder="Search clients..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UserDocuments', {
              userId: item.id,
              userName: item.name || 'User',
            })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.info}>
              <Text variant="titleSmall" style={styles.name}>{item.name || 'Unnamed'}</Text>
              <Text variant="bodySmall" style={styles.meta}>{item.email || item.loginId}</Text>
            </View>
            <Ionicons name="folder-open-outline" size={22} color="#d69e2e" />
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
  },
  headerTitle: { color: '#fff', fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  searchBar: { margin: 16, marginBottom: 8, elevation: 2, borderRadius: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#d69e2e' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '600', color: '#0f1b2d' },
  meta: { color: '#94a3b8', marginTop: 2 },
})

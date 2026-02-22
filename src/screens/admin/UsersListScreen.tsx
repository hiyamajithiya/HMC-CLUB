import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, Searchbar, FAB, Chip } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'
import type { User } from '../../types'
import type { AdminTabScreenProps } from '../../navigation/types'

export default function UsersListScreen({ navigation }: AdminTabScreenProps<'Users'>) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data)
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
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.loginId || '').toLowerCase().includes(search.toLowerCase())
    )
    : users

  const roleColor = (role: string) => {
    if (role === 'ADMIN') return '#3b82f6'
    if (role === 'STAFF') return '#8b5cf6'
    return '#22c55e'
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Users</Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>{users.length} total</Text>
      </View>

      <Searchbar
        placeholder="Search users..."
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
            style={styles.userCard}
            onPress={() => navigation.navigate('UserEdit', { userId: item.id })}
          >
            <View style={[styles.avatar, { backgroundColor: roleColor(item.role) + '20' }]}>
              <Text style={[styles.avatarText, { color: roleColor(item.role) }]}>
                {(item.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text variant="titleSmall" style={styles.userName}>{item.name || 'Unnamed'}</Text>
              <Text variant="bodySmall" style={styles.userMeta}>
                {item.loginId || item.email || 'No identifier'}
              </Text>
            </View>
            <View style={styles.userRight}>
              <Chip
                compact
                textStyle={{ fontSize: 10, color: roleColor(item.role), fontWeight: '700' }}
                style={{ backgroundColor: roleColor(item.role) + '15' }}
              >
                {item.role}
              </Chip>
              {!item.isActive && (
                <Text style={styles.inactiveTag}>Inactive</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('UserCreate')}
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
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontWeight: '600', color: '#0f1b2d' },
  userMeta: { color: '#94a3b8', marginTop: 2 },
  userRight: { alignItems: 'flex-end', gap: 4 },
  inactiveTag: { fontSize: 10, color: '#ef4444', fontWeight: '600' },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#d69e2e', borderRadius: 28,
  },
})

import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Text } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'
import type { Document, DocumentFolder } from '../../types'
import type { ClientScreenProps } from '../../navigation/types'

export default function FolderDetailScreen({ route, navigation }: ClientScreenProps<'FolderDetail'>) {
  const { folderId, userId } = route.params
  const [documents, setDocuments] = useState<Document[]>([])
  const [subfolders, setSubfolders] = useState<DocumentFolder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [docsRes, foldersRes] = await Promise.all([
        api.get('/documents', { params: { folderId } }),
        api.get('/folders', { params: { parentId: folderId, userId } }),
      ])
      setDocuments(docsRes.data)
      setSubfolders(foldersRes.data)
    } catch {
      Alert.alert('Error', 'Failed to load folder contents')
    } finally {
      setLoading(false)
    }
  }, [folderId, userId])

  useFocusEffect(useCallback(() => { fetchData() }, [fetchData]))

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[
          ...subfolders.map(f => ({ ...f, _type: 'folder' as const })),
          ...documents.map(d => ({ ...d, _type: 'doc' as const })),
        ]}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>This folder is empty</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (item._type === 'folder') {
            const folder = item as unknown as DocumentFolder
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.push('FolderDetail', {
                  folderId: folder.id,
                  folderName: folder.name,
                  userId: folder.userId,
                })}
              >
                <Ionicons name="folder" size={32} color="#d69e2e" />
                <View style={styles.info}>
                  <Text variant="titleSmall" style={styles.name}>{folder.name}</Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {folder._count.documents} docs · {folder._count.children} folders
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )
          }
          const doc = item as unknown as Document
          return (
            <TouchableOpacity style={styles.card}>
              <View style={styles.docIcon}>
                <Ionicons name="document-text" size={24} color="#0f1b2d" />
              </View>
              <View style={styles.info}>
                <Text variant="titleSmall" style={styles.name} numberOfLines={1}>{doc.title}</Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {formatSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Ionicons name="download-outline" size={20} color="#d69e2e" />
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '600', color: '#0f1b2d' },
  meta: { color: '#94a3b8', marginTop: 2 },
  docIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#94a3b8', marginTop: 12 },
})

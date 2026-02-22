import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Text, FAB, Chip } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface Document {
  id: string
  title: string
  fileName: string
  fileSize?: number
  mimeType?: string
  folder?: string
  createdAt: string
}

export default function UserDocumentsScreen({ navigation, route }: any) {
  const { userId, userName } = route.params
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/documents?userId=${userId}`)
      const docs = Array.isArray(data) ? data : data.documents || []
      setDocuments(docs)

      // Extract unique folders
      const folderSet = new Set<string>()
      docs.forEach((d: Document) => {
        if (d.folder) folderSet.add(d.folder)
      })
      setFolders(Array.from(folderSet))
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useFocusEffect(useCallback(() => { fetchDocuments() }, [fetchDocuments]))

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (mimeType?: string): keyof typeof Ionicons.glyphMap => {
    if (!mimeType) return 'document-outline'
    if (mimeType.startsWith('image/')) return 'image-outline'
    if (mimeType.includes('pdf')) return 'document-text-outline'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'grid-outline'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document-outline'
    return 'document-outline'
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
          <Text variant="headlineSmall" style={styles.headerTitle}>Documents</Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>{userName}</Text>
        </View>
      </View>

      {/* Folders Section */}
      {folders.length > 0 && (
        <View style={styles.foldersRow}>
          {folders.map(folder => (
            <Chip
              key={folder}
              icon="folder"
              style={styles.folderChip}
              textStyle={{ fontSize: 12, color: '#d69e2e' }}
            >
              {folder}
            </Chip>
          ))}
        </View>
      )}

      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDocuments} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="folder-open-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No documents found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.docCard}>
            <View style={styles.docIcon}>
              <Ionicons name={getFileIcon(item.mimeType)} size={24} color="#d69e2e" />
            </View>
            <View style={styles.docInfo}>
              <Text variant="titleSmall" style={styles.docTitle} numberOfLines={1}>
                {item.title || item.fileName}
              </Text>
              <Text variant="bodySmall" style={styles.docMeta}>
                {formatFileSize(item.fileSize)}
                {item.folder ? ` · ${item.folder}` : ''}
                {` · ${formatDate(item.createdAt)}`}
              </Text>
            </View>
          </View>
        )}
      />

      <FAB
        icon="upload"
        label="Upload"
        style={styles.fab}
        color="#fff"
        onPress={() => navigation.navigate('AdminUpload', { userId, userName })}
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
  foldersRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },
  folderChip: { backgroundColor: '#fef3c7' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  docCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, elevation: 1,
  },
  docIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center',
  },
  docInfo: { flex: 1, marginLeft: 12 },
  docTitle: { fontWeight: '600', color: '#0f1b2d' },
  docMeta: { color: '#94a3b8', marginTop: 2 },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#d69e2e', borderRadius: 28,
  },
})

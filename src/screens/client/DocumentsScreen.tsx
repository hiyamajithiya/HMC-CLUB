import React, { useState, useCallback } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native'
import { Text, Chip, Searchbar, FAB } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'
import type { Document, DocumentFolder, DocCategory } from '../../types'
import type { ClientTabScreenProps } from '../../navigation/types'

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Tax Returns', value: 'TAX_RETURNS' },
  { label: 'Audit Reports', value: 'AUDIT_REPORTS' },
  { label: 'GST Returns', value: 'GST_RETURNS' },
  { label: 'Compliance', value: 'COMPLIANCE' },
  { label: 'Invoices', value: 'INVOICES' },
  { label: 'Other', value: 'OTHER' },
]

const FILE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'application/pdf': 'document-text',
  'image/jpeg': 'image',
  'image/png': 'image',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'grid',
  'application/vnd.ms-excel': 'grid',
  'text/csv': 'grid',
}

export default function DocumentsScreen({ navigation }: ClientTabScreenProps<'Documents'>) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { folderId: 'root' }
      if (category !== 'ALL') params.category = category

      const [docsRes, foldersRes] = await Promise.all([
        api.get('/documents', { params }),
        api.get('/folders'),
      ])
      setDocuments(docsRes.data)
      setFolders(foldersRes.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [category])

  useFocusEffect(useCallback(() => { fetchData() }, [fetchData]))

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const filteredDocs = search
    ? documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    : documents

  const renderFolder = ({ item }: { item: DocumentFolder }) => (
    <TouchableOpacity
      style={styles.folderCard}
      onPress={() => navigation.navigate('FolderDetail', {
        folderId: item.id,
        folderName: item.name,
        userId: item.userId,
      })}
    >
      <Ionicons name="folder" size={32} color="#d69e2e" />
      <View style={styles.folderInfo}>
        <Text variant="titleSmall" style={styles.folderName}>{item.name}</Text>
        <Text variant="bodySmall" style={styles.folderMeta}>
          {item._count.documents} docs · {item._count.children} folders
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  )

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity style={styles.docCard}>
      <View style={styles.docIcon}>
        <Ionicons
          name={FILE_ICONS[item.fileType] || 'document'}
          size={24}
          color="#0f1b2d"
        />
      </View>
      <View style={styles.docInfo}>
        <Text variant="titleSmall" style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
        <Text variant="bodySmall" style={styles.docMeta}>
          {formatSize(item.fileSize)} · {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="download-outline" size={20} color="#d69e2e" />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Documents</Text>
      </View>

      {/* Search */}
      <Searchbar
        placeholder="Search documents..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      {/* Category chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        renderItem={({ item }) => (
          <Chip
            selected={category === item.value}
            onPress={() => setCategory(item.value)}
            style={[styles.chip, category === item.value && styles.chipSelected]}
            textStyle={category === item.value ? styles.chipTextSelected : styles.chipText}
          >
            {item.label}
          </Chip>
        )}
      />

      {/* Content */}
      <FlatList
        data={[...folders.map(f => ({ ...f, _type: 'folder' as const })), ...filteredDocs.map(d => ({ ...d, _type: 'doc' as const }))]}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No documents found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          item._type === 'folder'
            ? renderFolder({ item: item as unknown as DocumentFolder })
            : renderDocument({ item: item as unknown as Document })
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: { color: '#fff', fontWeight: '700' },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  chipContainer: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  chip: { backgroundColor: '#e2e8f0', marginRight: 6 },
  chipSelected: { backgroundColor: '#d69e2e' },
  chipText: { color: '#64748b', fontSize: 12 },
  chipTextSelected: { color: '#fff', fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  folderInfo: { flex: 1, marginLeft: 12 },
  folderName: { fontWeight: '600', color: '#0f1b2d' },
  folderMeta: { color: '#94a3b8', marginTop: 2 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: { flex: 1, marginLeft: 12 },
  docTitle: { fontWeight: '600', color: '#0f1b2d' },
  docMeta: { color: '#94a3b8', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#94a3b8', marginTop: 12 },
})

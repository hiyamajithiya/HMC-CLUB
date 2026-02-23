import React, { useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Text, Chip, Searchbar } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { api, getAccessToken, API_BASE_URL } from '../../api/client'
import type { Document, DocumentFolder } from '../../types'
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
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'text/csv': 'grid',
}

const EXT_MAP: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/csv': '.csv',
}

export default function DocumentsScreen({ navigation }: ClientTabScreenProps<'Documents'>) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null)

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
    } catch {
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

  /** Download (or use cache) and open via system share sheet */
  const openDocument = async (item: Document) => {
    if (loadingDocId) return
    setLoadingDocId(item.id)
    try {
      const token = await getAccessToken()
      if (!token) {
        Alert.alert('Error', 'Not authenticated. Please log in again.')
        return
      }

      const ext = EXT_MAP[item.fileType] || ''
      const destUri = `${FileSystem.cacheDirectory}doc_${item.id}${ext}`

      // Use cached file if it exists
      const info = await FileSystem.getInfoAsync(destUri)
      let localUri = destUri

      if (!info.exists) {
        const dl = FileSystem.createDownloadResumable(
          `${API_BASE_URL}/api/documents/${item.id}/download`,
          destUri,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const result = await dl.downloadAsync()
        if (!result || result.status !== 200) throw new Error('Download failed')
        localUri = result.uri
      }

      const isAvailable = await Sharing.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert('Not supported', 'Sharing is not available on this device.')
        return
      }
      await Sharing.shareAsync(localUri, { dialogTitle: item.title })
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to open document. Please try again.')
    } finally {
      setLoadingDocId(null)
    }
  }

  /** Show three-dot action menu */
  const showMenu = (item: Document) => {
    Alert.alert(
      item.title,
      'Choose an action',
      [
        {
          text: 'View / Open',
          onPress: () => openDocument(item),
        },
        {
          text: 'Share',
          onPress: () => openDocument(item),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    )
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

  const renderDocument = ({ item }: { item: Document }) => {
    const isLoading = loadingDocId === item.id
    return (
      <View style={styles.docCard}>
        {/* Left: icon */}
        <View style={styles.docIcon}>
          <Ionicons
            name={FILE_ICONS[item.fileType] || 'document'}
            size={24}
            color="#0f1b2d"
          />
        </View>

        {/* Middle: info — tapping opens directly */}
        <TouchableOpacity
          style={styles.docInfo}
          onPress={() => openDocument(item)}
          activeOpacity={0.7}
          disabled={!!loadingDocId}
        >
          <Text style={styles.docTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.docMeta}>
            {formatSize(item.fileSize)} · {new Date(item.createdAt).toLocaleDateString('en-IN')}
          </Text>
        </TouchableOpacity>

        {/* Right: three-dot menu or spinner */}
        {isLoading ? (
          <ActivityIndicator size="small" color="#d69e2e" style={styles.menuBtn} />
        ) : (
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => showMenu(item)}
            disabled={!!loadingDocId}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.firmLabel}>Himanshu Majithiya &amp; Co.</Text>
        <Text variant="headlineSmall" style={styles.headerTitle}>My Documents</Text>
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
        style={styles.chipList}
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
        data={[
          ...folders.map(f => ({ ...f, _type: 'folder' as const })),
          ...filteredDocs.map(d => ({ ...d, _type: 'doc' as const })),
        ]}
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
  firmLabel: {
    fontSize: 11,
    color: '#d69e2e',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: { color: '#fff', fontWeight: '700' },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  chipList: { flexShrink: 0, flexGrow: 0 },
  chipContainer: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { backgroundColor: '#e2e8f0', marginRight: 4 },
  chipSelected: { backgroundColor: '#d69e2e' },
  chipText: { color: '#64748b', fontSize: 12 },
  chipTextSelected: { color: '#fff', fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 80 },
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
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 4,
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
    flexShrink: 0,
  },
  docInfo: { flex: 1, marginLeft: 12 },
  docTitle: { fontWeight: '600', color: '#0f1b2d', fontSize: 14 },
  docMeta: { color: '#94a3b8', marginTop: 2, fontSize: 12 },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#94a3b8', marginTop: 12 },
})

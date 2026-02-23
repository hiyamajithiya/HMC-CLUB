import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import WebView from 'react-native-webview'
import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { getAccessToken, API_BASE_URL } from '../../api/client'
import type { ClientScreenProps } from '../../navigation/types'

type DownloadStatus = 'idle' | 'downloading' | 'done' | 'error'
type DisplayMode = 'pdf' | 'image' | 'other'

const EXT_MAP: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
}

function getDisplayMode(fileType?: string): DisplayMode {
  if (!fileType) return 'other'
  if (fileType === 'application/pdf') return 'pdf'
  if (fileType.startsWith('image/')) return 'image'
  return 'other'
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function DocumentViewerScreen({ navigation, route }: ClientScreenProps<'DocumentViewer'>) {
  const { documentId, title, fileType } = route.params
  const [status, setStatus] = useState<DownloadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [localUri, setLocalUri] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const displayMode = getDisplayMode(fileType)

  useEffect(() => {
    downloadDocument()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function downloadDocument() {
    setStatus('downloading')
    setProgress(0)
    try {
      const token = await getAccessToken()
      if (!token) {
        setStatus('error')
        setErrorMsg('Not authenticated. Please log in again.')
        return
      }

      const ext = EXT_MAP[fileType || ''] || ''
      const url = `${API_BASE_URL}/api/documents/${documentId}/download`
      const destUri = `${FileSystem.cacheDirectory}doc_${documentId}${ext}`

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        destUri,
        { headers: { Authorization: `Bearer ${token}` } },
        (dp) => {
          if (dp.totalBytesExpectedToDownload > 0) {
            setProgress(dp.totalBytesWritten / dp.totalBytesExpectedToDownload)
          }
        }
      )

      const result = await downloadResumable.downloadAsync()
      if (!result || result.status !== 200) {
        setStatus('error')
        setErrorMsg('Failed to download document. Please try again.')
        return
      }

      setLocalUri(result.uri)
      setStatus('done')
    } catch (err: any) {
      console.error('Download error:', err)
      setStatus('error')
      setErrorMsg(err?.message || 'Download failed. Please try again.')
    }
  }

  async function handleShare() {
    if (!localUri) return
    try {
      const isAvailable = await Sharing.isAvailableAsync()
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.')
        return
      }
      await Sharing.shareAsync(localUri, { dialogTitle: `Share ${title}` })
    } catch {
      Alert.alert('Error', 'Failed to share document.')
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        {status === 'done' && (
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={22} color="#d69e2e" />
          </TouchableOpacity>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Downloading */}
        {status === 'downloading' && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#d69e2e" />
            <Text style={styles.statusText}>Loading document...</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
        )}

        {/* PDF — WebView (native on iOS, Android WebView may vary) */}
        {status === 'done' && localUri && displayMode === 'pdf' && (
          <>
            <WebView
              source={{ uri: localUri }}
              style={styles.webview}
              originWhitelist={['*']}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              scalesPageToFit={true}
            />
            {/* Android fallback hint + share button */}
            {Platform.OS === 'android' && (
              <View style={styles.pdfBar}>
                <Text style={styles.pdfBarHint}>Can't view? Tap share to open in PDF reader.</Text>
                <TouchableOpacity style={styles.pdfShareBtn} onPress={handleShare}>
                  <Ionicons name="open-outline" size={16} color="#fff" />
                  <Text style={styles.pdfShareBtnText}>Open</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Image */}
        {status === 'done' && localUri && displayMode === 'image' && (
          <ScrollView
            contentContainerStyle={styles.imageContainer}
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: localUri }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.75 }}
              resizeMode="contain"
            />
          </ScrollView>
        )}

        {/* Other file types */}
        {status === 'done' && localUri && displayMode === 'other' && (
          <View style={styles.centered}>
            <View style={styles.docIconBig}>
              <Ionicons name="document-text" size={64} color="#d69e2e" />
            </View>
            <Text style={styles.docTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.readyText}>Document downloaded</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Share / Open with App</Text>
            </TouchableOpacity>
            <Text style={styles.hintText}>
              Open with Word, Excel or your preferred document app
            </Text>
          </View>
        )}

        {/* Error */}
        {status === 'error' && (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={56} color="#ef4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={downloadDocument} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
  shareBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(214,158,46,0.2)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  body: { flex: 1, backgroundColor: '#f8fafc' },
  webview: { flex: 1, backgroundColor: '#fff' },
  pdfBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  pdfBarHint: { flex: 1, fontSize: 12, color: '#94a3b8' },
  pdfShareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#d69e2e', paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 8,
  },
  pdfShareBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  imageContainer: {
    flexGrow: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  statusText: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  progressBarBg: {
    width: '80%', height: 6,
    backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden',
  },
  progressBarFill: { height: 6, backgroundColor: '#d69e2e', borderRadius: 3 },
  progressPct: { fontSize: 14, color: '#94a3b8' },
  docIconBig: {
    width: 100, height: 100, borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center', alignItems: 'center',
  },
  docTitle: {
    fontSize: 16, fontWeight: '700', color: '#0f1b2d',
    textAlign: 'center', lineHeight: 22,
  },
  readyText: { fontSize: 13, color: '#22c55e', fontWeight: '600' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#d69e2e', paddingHorizontal: 28,
    paddingVertical: 14, borderRadius: 14, marginTop: 8, elevation: 3,
  },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  hintText: { fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18 },
  errorText: { fontSize: 15, color: '#ef4444', textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ef4444', paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 10, marginTop: 8,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})

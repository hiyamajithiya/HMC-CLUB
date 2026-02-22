import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

export default function DownloadEditScreen({ navigation, route }: any) {
  const { downloadId } = route.params
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [fileName, setFileName] = useState('')
  const [downloadCount, setDownloadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchDownload = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/downloads/${downloadId}`)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setCategory(data.category || '')
      setFileName(data.fileName || '')
      setDownloadCount(data.downloadCount || 0)
    } catch {
      Alert.alert('Error', 'Failed to load download details.')
    } finally {
      setLoading(false)
    }
  }, [downloadId])

  useFocusEffect(useCallback(() => { fetchDownload() }, [fetchDownload]))

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.')
      return
    }
    setSaving(true)
    try {
      await api.patch(`/admin/downloads/${downloadId}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      })
      Alert.alert('Success', 'Download updated successfully.')
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to update download.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>Edit Download</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#d69e2e" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>Edit Download</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDownload} />}
      >
        {/* File Info Card */}
        <View style={styles.fileInfoCard}>
          <View style={styles.fileInfoIcon}>
            <Ionicons name="document-attach" size={28} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fileInfoName} numberOfLines={1}>{fileName || 'No file'}</Text>
            <Text style={styles.fileInfoMeta}>{downloadCount} downloads</Text>
          </View>
        </View>

        <TextInput
          label="Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={[styles.input, { minHeight: 80 }]}
          multiline
          numberOfLines={3}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Category"
          value={category}
          onChangeText={setCategory}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          buttonColor="#d69e2e"
          textColor="#fff"
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
        >
          Save Changes
        </Button>
      </ScrollView>
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
  content: { padding: 16, paddingBottom: 40 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fileInfoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    elevation: 1, marginBottom: 16,
  },
  fileInfoIcon: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center',
  },
  fileInfoName: { fontSize: 14, fontWeight: '600', color: '#0f1b2d' },
  fileInfoMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  submitBtn: { marginTop: 8, borderRadius: 10 },
})

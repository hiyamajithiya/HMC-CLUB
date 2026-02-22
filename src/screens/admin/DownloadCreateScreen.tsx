import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { api } from '../../api/client'

export default function DownloadCreateScreen({ navigation }: any) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null)
  const [saving, setSaving] = useState(false)

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0])
      }
    } catch {
      Alert.alert('Error', 'Failed to pick file.')
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.')
      return
    }
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a file.')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      if (description.trim()) formData.append('description', description.trim())
      if (category.trim()) formData.append('category', category.trim())

      const fileUri = Platform.OS === 'ios'
        ? selectedFile.uri.replace('file://', '')
        : selectedFile.uri

      formData.append('file', {
        uri: fileUri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream',
      } as any)

      await api.post('/admin/downloads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })

      Alert.alert('Success', 'Download created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create download.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>Create Download</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* File Picker */}
        <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
          <Ionicons
            name={selectedFile ? 'document-attach' : 'cloud-upload-outline'}
            size={36}
            color="#d69e2e"
          />
          {selectedFile ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
              <Text style={styles.fileSizeTxt}>{formatFileSize(selectedFile.size)}</Text>
            </View>
          ) : (
            <Text style={styles.pickerText}>Tap to select a file</Text>
          )}
        </TouchableOpacity>

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
          disabled={saving || !selectedFile}
          buttonColor="#d69e2e"
          textColor="#fff"
          style={styles.submitBtn}
          contentStyle={{ paddingVertical: 6 }}
          icon="upload"
        >
          Create Download
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
  filePicker: {
    backgroundColor: '#fff', borderRadius: 12, padding: 32,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed',
    marginBottom: 16, gap: 8,
  },
  fileName: { fontSize: 14, fontWeight: '600', color: '#0f1b2d', maxWidth: 240 },
  fileSizeTxt: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  pickerText: { fontSize: 14, color: '#94a3b8' },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  submitBtn: { marginTop: 8, borderRadius: 10 },
})

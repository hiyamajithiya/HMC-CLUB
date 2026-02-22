import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../api/client'

const CATEGORIES = ['Technology', 'Business', 'Marketing', 'Finance', 'Legal', 'General'] as const

export default function BlogCreateScreen({ navigation }: any) {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.')
      return
    }
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Content is required.')
      return
    }
    setSaving(true)
    try {
      await api.post('/admin/blog', {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        category: category || undefined,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()) : undefined,
        coverImage: coverImage.trim() || undefined,
      })
      Alert.alert('Success', 'Blog post created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create post.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>Create Blog Post</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content_wrap}>
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
          label="Excerpt"
          value={excerpt}
          onChangeText={setExcerpt}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={2}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Content *"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          style={[styles.input, { minHeight: 160 }]}
          multiline
          numberOfLines={8}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />

        {/* Category Selector */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.categoryChip, category === c && styles.categoryChipActive]}
              onPress={() => setCategory(category === c ? '' : c)}
            >
              <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Cover Image URL"
          value={coverImage}
          onChangeText={setCoverImage}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
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
          Create Post
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
  content_wrap: { padding: 16, paddingBottom: 40 },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  categoryChipActive: { borderColor: '#d69e2e', backgroundColor: '#fef3c7' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  categoryChipTextActive: { color: '#d69e2e' },
  submitBtn: { marginTop: 8, borderRadius: 10 },
})

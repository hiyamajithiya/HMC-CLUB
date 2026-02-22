import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

const CATEGORIES = ['Technology', 'Business', 'Marketing', 'Finance', 'Legal', 'General'] as const

export default function BlogEditScreen({ navigation, route }: any) {
  const { blogId } = route.params
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchPost = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/blog/${blogId}`)
      setTitle(data.title || '')
      setExcerpt(data.excerpt || '')
      setContent(data.content || '')
      setCategory(data.category || '')
      setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '')
      setCoverImage(data.coverImage || '')
      setPublished(!!data.published)
    } catch {
      Alert.alert('Error', 'Failed to load blog post.')
    } finally {
      setLoading(false)
    }
  }, [blogId])

  useFocusEffect(useCallback(() => { fetchPost() }, [fetchPost]))

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.')
      return
    }
    setSaving(true)
    try {
      await api.put(`/admin/blog/${blogId}`, {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        category: category || undefined,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()) : undefined,
        coverImage: coverImage.trim() || undefined,
        published,
      })
      Alert.alert('Success', 'Blog post updated successfully.')
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to update post.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async () => {
    const newState = !published
    setSaving(true)
    try {
      await api.put(`/admin/blog/${blogId}`, { published: newState })
      setPublished(newState)
      Alert.alert('Success', `Post ${newState ? 'published' : 'unpublished'}.`)
    } catch (err: any) {
      Alert.alert('Error', 'Failed to toggle publish status.')
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
          <Text variant="headlineSmall" style={styles.headerTitle}>Edit Post</Text>
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
        <Text variant="headlineSmall" style={styles.headerTitle}>Edit Post</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content_wrap}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPost} />}
      >
        {/* Publish Toggle */}
        <TouchableOpacity style={styles.publishToggle} onPress={togglePublish}>
          <View style={[styles.toggleDot, published ? styles.toggleDotActive : null]} />
          <Text style={[styles.toggleText, published ? { color: '#166534' } : { color: '#92400e' }]}>
            {published ? 'Published' : 'Draft'}
          </Text>
          <Text style={styles.toggleHint}>Tap to {published ? 'unpublish' : 'publish'}</Text>
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
  content_wrap: { padding: 16, paddingBottom: 40 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  publishToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    elevation: 1, marginBottom: 16,
  },
  toggleDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#fbbf24',
  },
  toggleDotActive: { backgroundColor: '#22c55e' },
  toggleText: { fontSize: 14, fontWeight: '700' },
  toggleHint: { fontSize: 11, color: '#94a3b8', marginLeft: 'auto' },
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

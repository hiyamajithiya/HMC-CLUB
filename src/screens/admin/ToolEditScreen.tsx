import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

const TOOL_TYPES = ['WEB', 'DESKTOP', 'MOBILE', 'CLI', 'API'] as const
const LICENSE_TYPES = ['FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE'] as const

export default function ToolEditScreen({ navigation, route }: any) {
  const { toolId } = route.params
  const [name, setName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [version, setVersion] = useState('')
  const [category, setCategory] = useState('')
  const [toolType, setToolType] = useState('')
  const [price, setPrice] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [features, setFeatures] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchTool = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/tools/${toolId}`)
      setName(data.name || '')
      setShortDescription(data.shortDescription || '')
      setLongDescription(data.longDescription || '')
      setVersion(data.version || '')
      setCategory(data.category || '')
      setToolType(data.toolType || '')
      setPrice(data.price !== undefined && data.price !== null ? String(data.price) : '')
      setLicenseType(data.licenseType || '')
      setFeatures(Array.isArray(data.features) ? data.features.join(', ') : '')
      setIsActive(data.isActive !== false)
    } catch {
      Alert.alert('Error', 'Failed to load tool details.')
    } finally {
      setLoading(false)
    }
  }, [toolId])

  useFocusEffect(useCallback(() => { fetchTool() }, [fetchTool]))

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required.')
      return
    }
    setSaving(true)
    try {
      await api.put(`/admin/tools/${toolId}`, {
        name: name.trim(),
        shortDescription: shortDescription.trim() || undefined,
        longDescription: longDescription.trim() || undefined,
        version: version.trim() || undefined,
        category: category.trim() || undefined,
        toolType: toolType || undefined,
        price: price ? parseFloat(price) : undefined,
        licenseType: licenseType || undefined,
        features: features.trim() ? features.split(',').map(f => f.trim()) : undefined,
        isActive,
      })
      Alert.alert('Success', 'Tool updated successfully.')
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to update tool.'
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
          <Text variant="headlineSmall" style={styles.headerTitle}>Edit Tool</Text>
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
        <Text variant="headlineSmall" style={styles.headerTitle}>Edit Tool</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTool} />}
      >
        {/* Active Toggle */}
        <TouchableOpacity
          style={styles.activeToggle}
          onPress={() => setIsActive(!isActive)}
        >
          <View style={[styles.toggleDot, isActive ? styles.toggleDotActive : null]} />
          <Text style={[styles.toggleText, isActive ? { color: '#166534' } : { color: '#991b1b' }]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.toggleHint}>Tap to toggle</Text>
        </TouchableOpacity>

        <TextInput
          label="Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Short Description"
          value={shortDescription}
          onChangeText={setShortDescription}
          mode="outlined"
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Long Description"
          value={longDescription}
          onChangeText={setLongDescription}
          mode="outlined"
          style={[styles.input, { minHeight: 100 }]}
          multiline
          numberOfLines={4}
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />
        <TextInput
          label="Version"
          value={version}
          onChangeText={setVersion}
          mode="outlined"
          style={styles.input}
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

        {/* Tool Type Selector */}
        <Text style={styles.label}>Tool Type</Text>
        <View style={styles.chipRow}>
          {TOOL_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, toolType === t && styles.chipActive]}
              onPress={() => setToolType(toolType === t ? '' : t)}
            >
              <Text style={[styles.chipText, toolType === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Price"
          value={price}
          onChangeText={setPrice}
          mode="outlined"
          style={styles.input}
          keyboardType="decimal-pad"
          outlineColor="#e2e8f0"
          activeOutlineColor="#d69e2e"
        />

        {/* License Type Selector */}
        <Text style={styles.label}>License Type</Text>
        <View style={styles.chipRow}>
          {LICENSE_TYPES.map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.chip, licenseType === l && styles.chipActive]}
              onPress={() => setLicenseType(licenseType === l ? '' : l)}
            >
              <Text style={[styles.chipText, licenseType === l && styles.chipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Features (comma-separated)"
          value={features}
          onChangeText={setFeatures}
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
  activeToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    elevation: 1, marginBottom: 16,
  },
  toggleDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444',
  },
  toggleDotActive: { backgroundColor: '#22c55e' },
  toggleText: { fontSize: 14, fontWeight: '700' },
  toggleHint: { fontSize: 11, color: '#94a3b8', marginLeft: 'auto' },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  chipActive: { borderColor: '#d69e2e', backgroundColor: '#fef3c7' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  chipTextActive: { color: '#d69e2e' },
  submitBtn: { marginTop: 8, borderRadius: 10 },
})

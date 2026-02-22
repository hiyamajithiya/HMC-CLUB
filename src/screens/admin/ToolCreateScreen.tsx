import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../api/client'

const TOOL_TYPES = ['WEB', 'DESKTOP', 'MOBILE', 'CLI', 'API'] as const
const LICENSE_TYPES = ['FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE'] as const

export default function ToolCreateScreen({ navigation }: any) {
  const [name, setName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [version, setVersion] = useState('')
  const [category, setCategory] = useState('')
  const [toolType, setToolType] = useState('')
  const [price, setPrice] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [features, setFeatures] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required.')
      return
    }
    setSaving(true)
    try {
      await api.post('/admin/tools', {
        name: name.trim(),
        shortDescription: shortDescription.trim() || undefined,
        longDescription: longDescription.trim() || undefined,
        version: version.trim() || undefined,
        category: category.trim() || undefined,
        toolType: toolType || undefined,
        price: price ? parseFloat(price) : undefined,
        licenseType: licenseType || undefined,
        features: features.trim() ? features.split(',').map(f => f.trim()) : undefined,
      })
      Alert.alert('Success', 'Tool created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create tool.'
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
        <Text variant="headlineSmall" style={styles.headerTitle}>Create Tool</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
          Create Tool
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

import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native'
import { Text, TextInput, Button, Divider } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'

interface SmtpSettings {
  host: string
  port: string
  secure: boolean
  user: string
  password: string
  fromName: string
  fromEmail: string
}

interface SocialSettings {
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
  github: string
}

export default function SettingsScreen({ navigation }: any) {
  const [activeSection, setActiveSection] = useState<'smtp' | 'social' | null>(null)

  // SMTP state
  const [smtp, setSmtp] = useState<SmtpSettings>({
    host: '', port: '587', secure: false,
    user: '', password: '', fromName: '', fromEmail: '',
  })

  // Social state
  const [social, setSocial] = useState<SocialSettings>({
    facebook: '', twitter: '', instagram: '',
    linkedin: '', youtube: '', github: '',
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const [smtpRes, socialRes] = await Promise.allSettled([
        api.get('/admin/settings/smtp'),
        api.get('/admin/settings/social'),
      ])
      if (smtpRes.status === 'fulfilled' && smtpRes.value.data) {
        const d = smtpRes.value.data
        setSmtp({
          host: d.host || '',
          port: d.port ? String(d.port) : '587',
          secure: !!d.secure,
          user: d.user || '',
          password: d.password || '',
          fromName: d.fromName || '',
          fromEmail: d.fromEmail || '',
        })
      }
      if (socialRes.status === 'fulfilled' && socialRes.value.data) {
        const d = socialRes.value.data
        setSocial({
          facebook: d.facebook || '',
          twitter: d.twitter || '',
          instagram: d.instagram || '',
          linkedin: d.linkedin || '',
          youtube: d.youtube || '',
          github: d.github || '',
        })
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchSettings() }, [fetchSettings]))

  const saveSmtp = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings/smtp', {
        host: smtp.host.trim(),
        port: parseInt(smtp.port) || 587,
        secure: smtp.secure,
        user: smtp.user.trim(),
        password: smtp.password,
        fromName: smtp.fromName.trim(),
        fromEmail: smtp.fromEmail.trim(),
      })
      Alert.alert('Success', 'SMTP settings saved successfully.')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save SMTP settings.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  const saveSocial = async () => {
    setSaving(true)
    try {
      await api.post('/admin/settings/social', {
        facebook: social.facebook.trim() || undefined,
        twitter: social.twitter.trim() || undefined,
        instagram: social.instagram.trim() || undefined,
        linkedin: social.linkedin.trim() || undefined,
        youtube: social.youtube.trim() || undefined,
        github: social.github.trim() || undefined,
      })
      Alert.alert('Success', 'Social media settings saved successfully.')
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save social settings.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  const updateSmtp = (key: keyof SmtpSettings, value: string | boolean) => {
    setSmtp(prev => ({ ...prev, [key]: value }))
  }

  const updateSocial = (key: keyof SocialSettings, value: string) => {
    setSocial(prev => ({ ...prev, [key]: value }))
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSettings} />}
      >
        {/* SMTP Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setActiveSection(activeSection === 'smtp' ? null : 'smtp')}
        >
          <View style={[styles.sectionIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="mail" size={20} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>SMTP Settings</Text>
            <Text style={styles.sectionSubtitle}>Configure email delivery</Text>
          </View>
          <Ionicons
            name={activeSection === 'smtp' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#94a3b8"
          />
        </TouchableOpacity>

        {activeSection === 'smtp' && (
          <View style={styles.sectionContent}>
            <TextInput
              label="SMTP Host"
              value={smtp.host}
              onChangeText={(v) => updateSmtp('host', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="Port"
              value={smtp.port}
              onChangeText={(v) => updateSmtp('port', v)}
              mode="outlined"
              style={styles.input}
              keyboardType="number-pad"
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />

            {/* Secure Toggle */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => updateSmtp('secure', !smtp.secure)}
            >
              <Text style={styles.toggleLabel}>Use SSL/TLS</Text>
              <View style={[styles.toggleDot, smtp.secure && styles.toggleDotActive]} />
              <Text style={styles.toggleValue}>{smtp.secure ? 'Yes' : 'No'}</Text>
            </TouchableOpacity>

            <TextInput
              label="Username"
              value={smtp.user}
              onChangeText={(v) => updateSmtp('user', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="Password"
              value={smtp.password}
              onChangeText={(v) => updateSmtp('password', v)}
              mode="outlined"
              style={styles.input}
              secureTextEntry
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="From Name"
              value={smtp.fromName}
              onChangeText={(v) => updateSmtp('fromName', v)}
              mode="outlined"
              style={styles.input}
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="From Email"
              value={smtp.fromEmail}
              onChangeText={(v) => updateSmtp('fromEmail', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />

            <Button
              mode="contained"
              onPress={saveSmtp}
              loading={saving}
              disabled={saving}
              buttonColor="#d69e2e"
              textColor="#fff"
              style={styles.saveBtn}
              contentStyle={{ paddingVertical: 6 }}
            >
              Save SMTP Settings
            </Button>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Social Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setActiveSection(activeSection === 'social' ? null : 'social')}
        >
          <View style={[styles.sectionIcon, { backgroundColor: '#fce7f3' }]}>
            <Ionicons name="share-social" size={20} color="#ec4899" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <Text style={styles.sectionSubtitle}>Manage social media links</Text>
          </View>
          <Ionicons
            name={activeSection === 'social' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#94a3b8"
          />
        </TouchableOpacity>

        {activeSection === 'social' && (
          <View style={styles.sectionContent}>
            <TextInput
              label="Facebook URL"
              value={social.facebook}
              onChangeText={(v) => updateSocial('facebook', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="facebook" />}
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="Twitter / X URL"
              value={social.twitter}
              onChangeText={(v) => updateSocial('twitter', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="twitter" />}
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="Instagram URL"
              value={social.instagram}
              onChangeText={(v) => updateSocial('instagram', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="instagram" />}
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="LinkedIn URL"
              value={social.linkedin}
              onChangeText={(v) => updateSocial('linkedin', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="linkedin" />}
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="YouTube URL"
              value={social.youtube}
              onChangeText={(v) => updateSocial('youtube', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="youtube" />}
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />
            <TextInput
              label="GitHub URL"
              value={social.github}
              onChangeText={(v) => updateSocial('github', v)}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="github" />}
              outlineColor="#e2e8f0"
              activeOutlineColor="#d69e2e"
            />

            <Button
              mode="contained"
              onPress={saveSocial}
              loading={saving}
              disabled={saving}
              buttonColor="#d69e2e"
              textColor="#fff"
              style={styles.saveBtn}
              contentStyle={{ paddingVertical: 6 }}
            >
              Save Social Settings
            </Button>
          </View>
        )}
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
  content: { paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 16,
  },
  sectionIcon: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#0f1b2d' },
  sectionSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  sectionContent: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 16,
  },
  divider: { backgroundColor: '#f1f5f9', height: 1 },
  input: { marginBottom: 12, backgroundColor: '#fff' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, marginBottom: 12,
  },
  toggleLabel: { flex: 1, fontSize: 14, color: '#0f1b2d', fontWeight: '500' },
  toggleDot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#e2e8f0',
  },
  toggleDotActive: { backgroundColor: '#22c55e' },
  toggleValue: { fontSize: 13, color: '#64748b', fontWeight: '600', minWidth: 24 },
  saveBtn: { marginTop: 4, borderRadius: 10 },
})

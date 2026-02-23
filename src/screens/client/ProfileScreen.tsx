import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native'
import { Text, Button, Divider } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../api/client'
import { useAuthStore } from '../../store/auth'
import type { UserProfile } from '../../types'
import type { ClientTabScreenProps } from '../../navigation/types'

export default function ProfileScreen({ navigation }: ClientTabScreenProps<'Profile'>) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const logout = useAuthStore(s => s.logout)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/user/profile')
      setProfile(data)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchProfile() }, [fetchProfile]))

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.firmLabel}>Himanshu Majithiya &amp; Co.</Text>
        <Text variant="headlineSmall" style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProfile} />}
        contentContainerStyle={styles.content}
      >
        {profile && (
          <>
            {/* Avatar and name */}
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(profile.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text variant="titleLarge" style={styles.name}>{profile.name || 'User'}</Text>
              <Text variant="bodyMedium" style={styles.email}>{profile.email}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile._count.documents}</Text>
                <Text style={styles.statLabel}>Documents</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile._count.appointments}</Text>
                <Text style={styles.statLabel}>Appointments</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile.upcomingAppointments}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <InfoRow icon="call-outline" label="Phone" value={profile.phone || 'Not set'} />
              <Divider />
              <InfoRow icon="shield-checkmark-outline" label="Role" value={profile.role} />
              <Divider />
              <InfoRow icon="calendar-outline" label="Member since" value={new Date(profile.createdAt).toLocaleDateString()} />
              {profile.services.length > 0 && (
                <>
                  <Divider />
                  <InfoRow icon="briefcase-outline" label="Services" value={profile.services.join(', ')} />
                </>
              )}
            </View>

            {/* Actions */}
            <Button
              mode="outlined"
              icon="lock-reset"
              onPress={() => navigation.navigate('ChangePassword')}
              style={styles.actionBtn}
              textColor="#0f1b2d"
            >
              Change Password
            </Button>

            <Button
              mode="contained"
              icon="logout"
              onPress={handleLogout}
              style={styles.logoutBtn}
              buttonColor="#ef4444"
              textColor="#fff"
            >
              Sign Out
            </Button>

            {/* Firm branding footer */}
            <View style={styles.brandFooter}>
              <View style={styles.brandFooterBadge}>
                <Text style={styles.brandFooterBadgeText}>HM&amp;Co</Text>
              </View>
              <Text style={styles.brandFooterText}>himanshumajithiya.com</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#64748b" />
      <View style={styles.infoContent}>
        <Text variant="bodySmall" style={styles.infoLabel}>{label}</Text>
        <Text variant="bodyMedium" style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#0f1b2d',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  firmLabel: { fontSize: 11, color: '#d69e2e', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { color: '#fff', fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#d69e2e', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontWeight: '700', color: '#0f1b2d' },
  email: { color: '#64748b', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center', elevation: 1,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#d69e2e' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 4, elevation: 1, marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  infoContent: { flex: 1 },
  infoLabel: { color: '#94a3b8', fontSize: 11 },
  infoValue: { color: '#0f1b2d', fontWeight: '500' },
  actionBtn: { marginBottom: 12, borderColor: '#e2e8f0', borderRadius: 8 },
  logoutBtn: { borderRadius: 8 },
  brandFooter: { alignItems: 'center', marginTop: 28, gap: 6 },
  brandFooterBadge: {
    backgroundColor: '#0f1b2d', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  brandFooterBadgeText: { fontSize: 12, fontWeight: '800', color: '#d69e2e', letterSpacing: 0.5 },
  brandFooterText: { fontSize: 11, color: '#94a3b8' },
})

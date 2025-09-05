import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('ログイン成功:', result.user.displayName);
      onAuthSuccess();
    } catch (error: any) {
      console.error('ログインエラー:', error);
      Alert.alert(
        'ログインエラー',
        'Googleアカウントでのログインに失敗しました。再度お試しください。'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🧠</Text>
        <Text style={styles.title}>BrainPatch</Text>
        <Text style={styles.subtitle}>開発者向けメモアプリ</Text>
        
        <View style={styles.features}>
          <Text style={styles.featureItem}>📱 スマホでメモ → PCで確認</Text>
          <Text style={styles.featureItem}>🔄 リアルタイム同期</Text>
          <Text style={styles.featureItem}>📝 開発向けテンプレート</Text>
          <Text style={styles.featureItem}>🔍 高速検索</Text>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.loginButtonText}>
            🔍 Googleアカウントでログイン
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          ログインすることで、すべてのデバイス間でメモが同期されます
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  features: {
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 280,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
});
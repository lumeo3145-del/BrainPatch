import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Memo, MemoInput } from './types';
import * as Database from './services/database';
import { TemplateSelector } from './components/TemplateSelector';
import { MemoTemplate } from './services/templates';

export default function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'bug', 'feature', 'idea', 'note', 'todo'] as const;
  const priorities = ['low', 'medium', 'high'] as const;

  const [newMemo, setNewMemo] = useState<MemoInput>({
    title: '',
    content: '',
    category: 'note',
    priority: 'medium',
    tags: [],
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        await Database.initDatabase();
        
        // AsyncStorageからSQLiteにデータ移行
        await Database.migrateFromAsyncStorage();
        
        await loadMemos();
      } catch (error) {
        console.error('Error initializing app:', error);
        Alert.alert('エラー', 'アプリの初期化に失敗しました');
      }
    };
    initApp();
  }, []);

  const loadMemos = async () => {
    try {
      const allMemos = await Database.getAllMemos();
      setMemos(allMemos);
    } catch (error) {
      console.error('Error loading memos:', error);
      Alert.alert('エラー', 'メモの読み込みに失敗しました');
    }
  };

  const handleAddMemo = async () => {
    if (!newMemo.title.trim() || !newMemo.content.trim()) {
      Alert.alert('エラー', 'タイトルと内容の両方を入力してください');
      return;
    }

    try {
      await Database.createMemo(newMemo);
      setNewMemo({
        title: '',
        content: '',
        category: 'note',
        priority: 'medium',
        tags: [],
      });
      setIsAddModalVisible(false);
      loadMemos();
    } catch (error) {
      console.error('Error adding memo:', error);
      Alert.alert('エラー', 'メモの追加に失敗しました');
    }
  };

  const handleEditMemo = async () => {
    if (!editingMemo || !newMemo.title.trim() || !newMemo.content.trim()) {
      Alert.alert('エラー', 'タイトルと内容の両方を入力してください');
      return;
    }

    try {
      await Database.updateMemo(editingMemo.id, newMemo);
      setEditingMemo(null);
      setNewMemo({
        title: '',
        content: '',
        category: 'note',
        priority: 'medium',
        tags: [],
      });
      loadMemos();
    } catch (error) {
      console.error('Error updating memo:', error);
      Alert.alert('エラー', 'メモの更新に失敗しました');
    }
  };

  const handleDeleteMemo = (memo: Memo) => {
    Alert.alert(
      'メモを削除',
      `「${memo.title}」を削除してもよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await Database.deleteMemo(memo.id);
              loadMemos();
            } catch (error) {
              console.error('Error deleting memo:', error);
              Alert.alert('エラー', 'メモの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      loadMemos();
    } else {
      try {
        const searchResults = await Database.searchMemos(query);
        setMemos(searchResults);
      } catch (error) {
        console.error('Error searching memos:', error);
        Alert.alert('エラー', 'メモの検索に失敗しました');
      }
    }
  };

  const filteredMemos = selectedCategory === 'all' 
    ? memos 
    : memos.filter(memo => memo.category === selectedCategory);

  const openEditModal = (memo: Memo) => {
    setEditingMemo(memo);
    setNewMemo({
      title: memo.title,
      content: memo.content,
      category: memo.category,
      priority: memo.priority,
      tags: memo.tags,
    });
    setIsAddModalVisible(true);
  };

  const closeModal = () => {
    setIsAddModalVisible(false);
    setEditingMemo(null);
    setNewMemo({
      title: '',
      content: '',
      category: 'note',
      priority: 'medium',
      tags: [],
    });
  };

  const handleTemplateSelect = (template: MemoTemplate) => {
    setNewMemo(template.template);
    setIsAddModalVisible(true);
  };

  const openTemplateSelector = () => {
    setIsTemplateModalVisible(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return 'bug-outline';
      case 'feature': return 'bulb-outline';
      case 'idea': return 'lightbulb-outline';
      case 'note': return 'document-text-outline';
      case 'todo': return 'checkbox-outline';
      default: return 'document-outline';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'all': return 'すべて';
      case 'bug': return 'バグ';
      case 'feature': return '機能';
      case 'idea': return 'アイデア';
      case 'note': return 'ノート';
      case 'todo': return 'TODO';
      default: return category;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD93D';
      case 'low': return '#6BCF7F';
      default: return '#DDD';
    }
  };

  const renderMemo = ({ item }: { item: Memo }) => (
    <View style={styles.memoItem}>
      <View style={styles.memoHeader}>
        <View style={styles.memoInfo}>
          <Ionicons name={getCategoryIcon(item.category)} size={20} color="#666" />
          <Text style={styles.memoTitle} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={styles.memoActions}>
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
            <Ionicons name="pencil-outline" size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteMemo(item)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.memoContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.memoFooter}>
        <Text style={styles.memoCategory}>{getCategoryLabel(item.category)}</Text>
        <Text style={styles.memoDate}>
          {new Date(item.updatedAt).toLocaleDateString('ja-JP')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🧠 BrainPatch</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.templateButton}
            onPress={openTemplateSelector}
          >
            <Ionicons name="library-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="メモを検索..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive
            ]}>
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredMemos}
        renderItem={renderMemo}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.memoList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>まだメモがありません</Text>
            <Text style={styles.emptyStateSubtext}>+ ボタンをタップして最初のメモを作成しましょう</Text>
          </View>
        }
      />

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancelText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingMemo ? 'メモを編集' : '新しいメモ'}
            </Text>
            <TouchableOpacity onPress={editingMemo ? handleEditMemo : handleAddMemo}>
              <Text style={styles.modalSaveText}>
                {editingMemo ? '更新' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>タイトル</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="メモのタイトルを入力..."
              value={newMemo.title}
              onChangeText={(text) => setNewMemo({ ...newMemo, title: text })}
            />

            <Text style={styles.fieldLabel}>内容</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="メモの内容を入力..."
              value={newMemo.content}
              onChangeText={(text) => setNewMemo({ ...newMemo, content: text })}
              multiline
              numberOfLines={8}
            />

            <Text style={styles.fieldLabel}>カテゴリー</Text>
            <View style={styles.optionContainer}>
              {categories.slice(1).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.optionButton,
                    newMemo.category === category && styles.optionButtonActive
                  ]}
                  onPress={() => setNewMemo({ ...newMemo, category })}
                >
                  <Ionicons name={getCategoryIcon(category)} size={18} color={
                    newMemo.category === category ? 'white' : '#666'
                  } />
                  <Text style={[
                    styles.optionButtonText,
                    newMemo.category === category && styles.optionButtonTextActive
                  ]}>
                    {getCategoryLabel(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>優先度</Text>
            <View style={styles.optionContainer}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.optionButton,
                    newMemo.priority === priority && styles.optionButtonActive
                  ]}
                  onPress={() => setNewMemo({ ...newMemo, priority })}
                >
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
                  <Text style={[
                    styles.optionButtonText,
                    newMemo.priority === priority && styles.optionButtonTextActive
                  ]}>
                    {getPriorityLabel(priority)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <TemplateSelector
        visible={isTemplateModalVisible}
        onClose={() => setIsTemplateModalVisible(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  templateButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  memoList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  memoItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  memoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  actionButton: {
    marginLeft: 8,
    padding: 4,
  },
  memoContent: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 12,
  },
  memoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoCategory: {
    fontSize: 12,
    color: '#6C757D',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  memoDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6C757D',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#ADB5BD',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6C757D',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 16,
  },
  titleInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  contentInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: 'white',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { developmentTemplates, MemoTemplate } from '../services/templates';

interface TemplateSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MemoTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'bug': return 'バグ';
      case 'feature': return '機能';
      case 'idea': return 'アイデア';
      case 'note': return 'ノート';
      case 'todo': return 'TODO';
      default: return category;
    }
  };
  const renderTemplate = ({ item }: { item: MemoTemplate }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => {
        onSelectTemplate(item);
        onClose();
      }}
    >
      <View style={styles.templateHeader}>
        <Text style={styles.templateName}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={20} color="#007AFF" />
      </View>
      <Text style={styles.templateDescription}>{item.description}</Text>
      <View style={styles.templateMeta}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.template.category) }]}>
          <Text style={styles.categoryBadgeText}>{getCategoryLabel(item.template.category)}</Text>
        </View>
        <Text style={styles.templateTags}>
          {item.template.tags.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return '#FF6B6B';
      case 'feature': return '#4ECDC4';
      case 'note': return '#45B7D1';
      case 'todo': return '#96CEB4';
      case 'idea': return '#FECA57';
      default: return '#DDD';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.title}>テンプレートを選択</Text>
          <View style={styles.placeholder} />
        </View>
        
        <FlatList
          data={developmentTemplates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.templateList}
          showsVerticalScrollIndicator={false}
        />
        
        <TouchableOpacity
          style={styles.blankTemplate}
          onPress={() => {
            onClose();
          }}
        >
          <Ionicons name="add-outline" size={24} color="#007AFF" />
          <Text style={styles.blankTemplateText}>空のメモで開始</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

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
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  placeholder: {
    width: 60,
  },
  templateList: {
    padding: 20,
  },
  templateItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  templateDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
    lineHeight: 20,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  templateTags: {
    fontSize: 12,
    color: '#ADB5BD',
    fontStyle: 'italic',
  },
  blankTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  blankTemplateText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
});
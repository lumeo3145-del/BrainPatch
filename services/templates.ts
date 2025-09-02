import { MemoInput } from '../types';

export interface MemoTemplate {
  id: string;
  name: string;
  description: string;
  template: MemoInput;
}

export const developmentTemplates: MemoTemplate[] = [
  {
    id: 'bug-report',
    name: 'バグレポート',
    description: 'バグを報告するためのテンプレート',
    template: {
      title: '🐛 [バグ] ',
      content: `## 概要
バグの簡潔な説明

## 再現手順
1. 
2. 
3. 

## 期待する動作
本来どうあるべきか

## 実際の動作
実際に何が起こるか

## 環境
- OS: 
- ブラウザ/デバイス: 
- バージョン: 

## 追加情報
その他の関連情報`,
      category: 'bug',
      priority: 'medium',
      tags: ['バグ', '要調査'],
    },
  },
  {
    id: 'feature-request',
    name: '機能リクエスト',
    description: '新機能のアイデアを整理するテンプレート',
    template: {
      title: '✨ [機能] ',
      content: `## 課題・背景
この機能で解決される問題は何か？

## 提案する解決策
機能の詳細な説明

## ユーザーストーリー
- [ユーザー種別]として、[目標]したい。なぜなら[利益]だから

## 受け入れ基準
- [ ] 
- [ ] 
- [ ] 

## 技術的考慮事項
- 実装の複雑さ: 低/中/高
- 依存関係: 
- 潜在的な問題: 

## 優先度・影響度
- ビジネス影響: 低/中/高
- ユーザー影響: 低/中/高`,
      category: 'feature',
      priority: 'medium',
      tags: ['機能', '改善'],
    },
  },
  {
    id: 'code-review',
    name: 'コードレビューノート',
    description: 'コードレビューのフィードバック用テンプレート',
    template: {
      title: '👀 [レビュー] ',
      content: `## ファイル/PR: 
[リンクまたはファイルパス]

## 総合評価
- コード品質: ⭐⭐⭐⭐⭐
- テストカバレッジ: ⭐⭐⭐⭐⭐
- ドキュメント: ⭐⭐⭐⭐⭐

## 良い点
- 
- 

## 改善点
- 
- 

## アクションアイテム
- [ ] 
- [ ] 
- [ ] 

## コードサンプル
\`\`\`javascript
// 修正前

// 修正後
\`\`\``,
      category: 'note',
      priority: 'medium',
      tags: ['コードレビュー', 'フィードバック'],
    },
  },
  {
    id: 'learning-note',
    name: '学習ノート',
    description: '学習内容や気づきを記録するテンプレート',
    template: {
      title: '📚 [学習] ',
      content: `## トピック・技術
何について学んだか？

## 重要な概念
- 
- 
- 

## コード例
\`\`\`javascript
// サンプルコード
\`\`\`

## 参考資料
- [リンク1](url)
- [リンク2](url)

## 疑問点・さらに調べること
- 
- 

## 実用的な応用
現在のプロジェクトでどう活用できるか？`,
      category: 'note',
      priority: 'low',
      tags: ['学習', 'ドキュメント'],
    },
  },
  {
    id: 'meeting-notes',
    name: '会議ノート',
    description: '会議の記録用テンプレート',
    template: {
      title: '🤝 [会議] ',
      content: `## 会議詳細
- **日時**: ${new Date().toLocaleDateString('ja-JP')}
- **参加者**: 
- **時間**: 

## アジェンダ
1. 
2. 
3. 

## 主な議論内容
- 

## 決定事項
- [ ] 
- [ ] 

## アクションアイテム
- [ ] [担当者] - タスク内容 - 期限: 
- [ ] [担当者] - タスク内容 - 期限: 

## 次のステップ
- 
- 

## フォローアップ必要事項
- `,
      category: 'note',
      priority: 'medium',
      tags: ['会議', 'アクションアイテム'],
    },
  },
  {
    id: 'troubleshooting',
    name: 'トラブルシューティングログ',
    description: 'トラブルシューティングの手順を追跡するテンプレート',
    template: {
      title: '🔧 [トラブルシューティング] ',
      content: `## 問題の説明
何が動作していないか？

## エラーメッセージ
\`\`\`
エラーメッセージをここに貼り付け
\`\`\`

## 調査手順
1. 
2. 
3. 

## 調査結果
- 
- 

## 解決策
何が問題を解決したか？

## 予防策
今後同じ問題を避けるには？

## 所要時間
約X時間

## 関連する問題
- 
- `,
      category: 'bug',
      priority: 'high',
      tags: ['トラブルシューティング', '解決済み'],
    },
  },
];
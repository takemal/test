// ==UserScript==
// @name         ampriテスト
// @namespace    http://tampermonkey.net/
// @version      5.0
// @author       Tora
// @description  ampriテスト
// @match        https://ampuri.github.io/bc-normal-seed-tracking/*
// @grant        none
// ==/UserScript==
/*
 * ▼ 機能一覧
 * ① 自動翻訳機能
 * ② 闇目等の位置表示機能
 * ③ シード保存機能（日付付き）
 * ④ 計画モード機能
 * ⑤ ガチャ間レア被り時の移動先表示機能
 * ⑥ テーブルヘッダー固定機能
 * ⑦ テーブルやアイテムの見た目変更（ヘッダー・赤枠・文字色等）
 * ⑧ イベガチャテーブルの追加
 *
 * ▼ 注意事項（必ずお読みください）：
 * ・本スクリプトは個人利用を目的として作成されたものです。
 * ・トラブルを避けるため、作成者無許可での再配布・転載・販売・第三者への共有は禁止とさせていただきます。
 * ・これらの注意書きを編集/削除しないでください。
 *
 * ▼ 更新履歴
 * v5.0 -   イベガチャテーブル(β版)の追加
 * v4.1 -   計画モードにおけるルート保存・継承・削除機能
 * v4.0 -   計画モード追加/ガチャ間レア被り時の移動先表示機能/UI変更
 * ~v3.0 -  自動翻訳機能/闇目等位置表示機能/シード保存機能/UI変更
 *
 */

(function () {
  'use strict';

  // ==================== 設定・定数定義 ====================

  // 英語から日本語への置換ルール一覧
  const replacements = [
    // ガチャ種類
    { from: /^Normal$/, to: 'ノーマルガチャ' },
    { from: /^Normal\+$/, to: 'ノーマルガチャ＋' },
    { from: /^Catfruit$/, to: 'マタタビガチャ' },
    { from: /^Catseye$/, to: '猫目ガチャ' },
    { from: /^Lucky Ticket$/, to: '福引ガチャ' },
    { from: /^Lucky Ticket G$/, to: '福引ガチャG' },

    // ちびキャラ
    { from: /\bLi'l Titan Cat\b/g, to: 'ちび巨神ネコ' },
    { from: /\bLi'l Lizard Cat\b/g, to: 'ちびトカゲネコ' },
    { from: /\bLi'l Fish Cat\b/g, to: 'ちびネコフィッシュ' },
    { from: /\bLi'l Bird Cat\b/g, to: 'ちびネコノトリ' },
    { from: /\bLi'l Cow Cat\b/g, to: 'ちびウシネコ' },
    { from: /\bLi'l Gross Cat\b/g, to: 'ちびキモネコ' },
    { from: /\bLi'l Axe Cat\b/g, to: 'ちびバトルネコ' },
    { from: /\bLi'l Tank Cat\b/g, to: 'ちびタンクネコ' },
    { from: /\bLi'l Cat\b/g, to: 'ちびネコ' },

    // ノーマル
    { from: /\bSuperfeline\b/g, to: 'ネコ超人' },
    { from: /\bTitan Cat\b/g, to: '巨神ネコ' },
    { from: /\bLizard Cat\b/g, to: 'トカゲネコ' },
    { from: /\bFish Cat\b/g, to: 'ネコフィッシュ' },
    { from: /\bBird Cat\b/g, to: 'ネコノトリ' },
    { from: /\bCow Cat\b/g, to: 'ウシネコ' },
    { from: /\bGross Cat\b/g, to: 'キモネコ' },
    { from: /\bAxe Cat\b/g, to: 'バトルネコ' },
    { from: /\bTank Cat\b/g, to: 'タンクネコ' },

    // 強化
    { from: /\bStudy\b/g, to: '勉強力' },
    { from: /\bResearch\b/g, to: '研究力' },
    { from: /\bAccounting\b/g, to: '会計力' },
    { from: /\bCat Energy\b/g, to: '統率力' },
    { from: /\bWorker Cat Rate\b/g, to: '働きネコ仕事効率' },
    { from: /\bWorker Cat Wallet\b/g, to: '働きネコお財布' },
    { from: /\bBase Defense\b/g, to: '城体力' },
    { from: /\bCat Cannon Attack\b/g, to: '砲攻撃力' },
    { from: /\bCat Cannon Charge\b/g, to: '砲チャージ' },

    // XP
    { from: /\b5K XP\b/g, to: '5千XP' },
    { from: /\b10K XP\b/g, to: '1万XP' },
    { from: /\b30K XP\b/g, to: '3万XP' },
    { from: /\b50K XP\b/g, to: '5万XP' },
    { from: /\b100K XP\b/g, to: '10万XP' },
    { from: /\b200K XP\b/g, to: '20万XP' },
    { from: /\b500K XP\b/g, to: '50万XP' },
    { from: /\b1M XP\b/g, to: '100万XP' },

    // マタタビ
    { from: /\bBlue Catfruit Seed\b/g, to: '青マタタビの種' },
    { from: /\bBlue Catfruit\b/g, to: '青マタタビ' },
    { from: /\bPurple Catfruit Seed\b/g, to: '紫マタタビの種' },
    { from: /\bPurple Catfruit\b/g, to: '紫マタタビ' },
    { from: /\bYellow Catfruit Seed\b/g, to: '黄マタタビの種' },
    { from: /\Yellow Catfruit\b/g, to: '黄マタタビ' },
    { from: /\bRed Catfruit Seed\b/g, to: '赤マタタビの種' },
    { from: /\bRed Catfruit\b/g, to: '赤マタタビ' },
    { from: /\bGreen Catfruit Seed\b/g, to: '緑マタタビの種' },
    { from: /\bGreen Catfruit\b/g, to: '緑マタタビ' },
    { from: /\bEpic Catfruit\b/g, to: '虹マタタビ' },

    // 猫目
    { from: /\bDark Catseye\b/g, to: '闇猫目' },
    { from: /\bUber Rare Catseye\b/g, to: '超激レア猫目' },
    { from: /\bSuper Rare Catseye\b/g, to: '激レア猫目' },
    { from: /\bRare Catseye\b/g, to: 'レア猫目' },
    { from: /\bSpecial Catseye\b/g, to: 'EX猫目' },

    // アイテム
    { from: /\bCatamin A\b/g, to: 'ビタンA' },
    { from: /\bCatamin B\b/g, to: 'ビタンB' },
    { from: /\bCatamin C\b/g, to: 'ビタンC' },
    { from: /\bSpeed Up\b/g, to: 'スピダ' },
    { from: /\bCat CPU\b/g, to: 'ニャンピュ' },
    { from: /\bRich Cat\b/g, to: 'ネコボン' },
    { from: /\bCat Jobs\b/g, to: 'おかめはちもく' },
    { from: /\bSniper the Cat\b/g, to: 'スニャイパー' },
    { from: /\bTreasure Radar\b/g, to: 'トレジャーレーダー' },

    // 干渉回避
    { from: /\bCat\b/g, to: 'ネコ' },
  ];

    // ==================== イベガチャ構造 ====================
    const DEFAULT_NORMAL = [
        'XP5千',
    ];
    const DEFAULT_RARE = [
        'スピダ',
        'ニャンピュ',
        'XP1万',
        'XP3万',
    ];
    const DEFAULT_SUPER = [
        'ネコボン',
        'おかめはちもく',
        'スニャイパー',
        'XP10万',
    ];
    const DEFAULT_LEGEND = [
        'XP100万',
    ];

    const GACHA_CONFIG = {
        school: {
            name: 'にゃんこ学園2025',
            rate: [999, 5999, 8499, 9999, 9999],
            characters: [DEFAULT_NORMAL, DEFAULT_RARE, DEFAULT_SUPER, ['幼馴染にゃん子', 'おてんばネコライオン','ネコクバンケシ','ネコ委員長' ], []],
            guaranteedRate: [1499],
            guaranteedCharacters: [ ['幼馴染にゃん子', 'おてんばネコライオン','ネコクバンケシ','ネコ委員長' ]],
        },
        chineseNew: {
            name: '春節2025',
            rate: [999, 5999, 8999, 9999, 9999],
            characters: [DEFAULT_NORMAL, DEFAULT_RARE, DEFAULT_SUPER, ['N204ねこシシマイ', '爆竹ネコ','ネコ小籠包' ], []],
            guaranteedRate: [1199],
            guaranteedCharacters: [ ['N204ねこシシマイ', '爆竹ネコ','ネコ小籠包' ]],
        },
        bikkuri: {
            name: 'ビックリマンコラボ2024',
            rate: [799, 4799, 6799, 8799, 9999],
            characters: [DEFAULT_NORMAL, DEFAULT_RARE, DEFAULT_SUPER, ['ネコの助', 'ネコデビル','ネコ若神子' ], ['天使男ジャック','十字架天使']],
            guaranteedRate: [1999,3199],
            guaranteedCharacters: [ ['ネコの助', 'ネコデビル','ネコ若神子' ], ['天使男ジャック','十字架天使']],
        },
        survival: {
            name: 'サバイバル2024',
            rate: [1399, 6399, 9399, 9999, 9999],
            characters: [DEFAULT_NORMAL, DEFAULT_RARE, DEFAULT_SUPER, ['N206ネコホタテ', 'イワシ','イカ' ], []],
            guaranteedRate: [599],
            guaranteedCharacters: [['N206ネコホタテ', 'イワシ','イカ' ]],
        },
        summer: {
            name: '夏休み2024',
            rate: [249, 6499, 8799, 9799, 9999],
            characters: [['ねこ農家'], DEFAULT_RARE, DEFAULT_SUPER, ['N202ホタルネコ', 'クワガタネコ','カブトネコ' ], DEFAULT_LEGEND],
            guaranteedRate: [999],
            guaranteedCharacters: [['N202ホタルネコ', 'クワガタネコ','カブトネコ' ]],
        },
        jundeBride: {
            name: 'ジューンブライド2024',
            rate: [799, 5799, 8799, 9799, 9999],
            characters: [DEFAULT_NORMAL, DEFAULT_RARE, DEFAULT_SUPER, ['N205ネコ花嫁', 'N203ネコピエロ', 'N201ネコソシスト'], DEFAULT_LEGEND],
            guaranteedRate: [999],
            guaranteedCharacters: [['N205ネコ花嫁', 'N203ネコピエロ', 'N201ネコソシスト']],
        },
    };
    // ==================== シード処理 ====================
    class SeedProcessor {
        constructor() {
            this.cache = new Map();
            this.allSeeds = [];
            this.isProcessing = false;
        }

        // XORShift32の最適化版（インライン化）
        xorshift32(x) {
            x = (x ^ (x << 13)) >>> 0;
            x = (x ^ (x >>> 17)) >>> 0;
            x = (x ^ (x << 15)) >>> 0;
            return x;
        }

        // TypedArrayを使用した高速シード生成
        generateAllSeedsOptimized(currentSeed, count) {
            const cacheKey = `${currentSeed}_${count}`;
            if (this.cache.has(cacheKey)) {
                console.log('キャッシュからシードを取得');
                return this.cache.get(cacheKey);
            }

            const totalSteps = 2 * count + 1;
            console.time('シード生成時間');

            // Uint32Arrayを使用してメモリ効率を向上
            const seeds = new Uint32Array(totalSteps);
            let seed = currentSeed;

            // ループ展開で高速化
            let i = 0;
            const remainderStart = totalSteps - (totalSteps % 4);

            // 4つずつ処理（ループ展開）
            for (; i < remainderStart; i += 4) {
                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i] = seed;

                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i + 1] = seed;

                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i + 2] = seed;

                seed = (seed ^ (seed << 13)) >>> 0;
                seed = (seed ^ (seed >>> 17)) >>> 0;
                seed = (seed ^ (seed << 15)) >>> 0;
                seeds[i + 3] = seed;
            }

            // 残りを処理
            for (; i < totalSteps; i++) {
                seed = this.xorshift32(seed);
                seeds[i] = seed;
            }

            // 通常の配列に変換
            this.allSeeds = Array.from(seeds);

            console.timeEnd('シード生成時間');

            // キャッシュに保存（最大5つまで）
            if (this.cache.size >= 5) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(cacheKey, this.allSeeds);

            return this.allSeeds;
        }
    }

    // ==================== イベントシード履歴管理 ====================
class EventSeedHistory {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = 50;
        this.isApplyingHistory = false;
    }

    add(seed, gachaKey) {
        if (this.isApplyingHistory) {
            return;
        }

        const entry = { seed: seed.toString(), gachaKey, timestamp: Date.now() };

        if (this.history.length > 0 &&
            this.history[this.history.length - 1].seed === entry.seed &&
            this.history[this.history.length - 1].gachaKey === entry.gachaKey) {
            return;
        }

        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        this.history.push(entry);

        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        console.log('履歴追加:', entry, '現在のインデックス:', this.currentIndex);
        this.updateButtons();
    }

    canGoBack() {
        return this.currentIndex > 0;
    }

    canGoForward() {
        return this.currentIndex < this.history.length - 1;
    }

    goBack() {
        if (this.canGoBack()) {
            this.currentIndex--;
            const entry = this.history[this.currentIndex];
            console.log('戻る実行:', entry);
            this.applyHistoryEntry(entry);
            this.updateButtons();
            return entry;
        }
        console.log('戻れません');
        return null;
    }

    goForward() {
        if (this.canGoForward()) {
            this.currentIndex++;
            const entry = this.history[this.currentIndex];
            console.log('進む実行:', entry);
            this.applyHistoryEntry(entry);
            this.updateButtons();
            return entry;
        }
        console.log('進めません');
        return null;
    }

    applyHistoryEntry(entry) {
    console.log('履歴適用開始:', entry);

    this.isApplyingHistory = true;

    try {
        const seedInput = document.getElementById('custom-seed');
        const gachaSelect = document.getElementById('custom-gacha');

        if (seedInput) {
            seedInput.value = entry.seed;
            console.log('シード入力更新:', entry.seed);
        }
        if (gachaSelect) {
            gachaSelect.value = entry.gachaKey;
            console.log('ガチャ選択更新:', entry.gachaKey);
        }

        // グローバル変数を更新
        window.currentGachaKey = entry.gachaKey;

        // シードキャッシュを強制クリア
        if (window.seedProcessor) {
            window.seedProcessor.cache.clear();
            console.log('シードキャッシュクリア');
        }

        // テーブル更新は1回だけ実行
        console.log('テーブル更新実行:', entry.seed, entry.gachaKey);
        setTimeout(() => {
            updateTable(entry.seed, entry.gachaKey);
        }, 10);

    } finally {
        // 履歴適用完了後にフラグをOFF
        setTimeout(() => {
            this.isApplyingHistory = false;
        }, 100);
    }
}

    updateButtons() {
        const backBtn = document.getElementById('history-back');
        const forwardBtn = document.getElementById('history-forward');

        console.log('ボタン更新:', {
            canGoBack: this.canGoBack(),
            canGoForward: this.canGoForward(),
            currentIndex: this.currentIndex,
            historyLength: this.history.length
        });

        if (backBtn) {
            backBtn.disabled = !this.canGoBack();
            backBtn.style.opacity = this.canGoBack() ? '1' : '0.5';
        }

        if (forwardBtn) {
            forwardBtn.disabled = !this.canGoForward();
            forwardBtn.style.opacity = this.canGoForward() ? '1' : '0.5';
        }

    }

    getCurrentEntry() {
        return this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
    }

    debugHistory() {
        console.log('履歴デバッグ:', {
            history: this.history,
            currentIndex: this.currentIndex,
            canGoBack: this.canGoBack(),
            canGoForward: this.canGoForward()
        });
    }
}

    // ==================== 変数 ====================
  // グローバル変数・フラグ
  let specialItemsDisplayed = false;
  let isPlanMode = false;
  let ticketCounts = { N: 0, F: 0, G: 0, E: 0 };
  let ticketColumnIndexMap = {};
  let timeoutId = null;
  let isEventGachaEnabled = false;
  let eventGachaColumnAdded = false;
  let hasUnsavedChanges = false;
  let lastSavedState = null;
  let hiddenEventGachaSelections = []; // イベガチャオフ時の選択項目保持用
  let updateTimeout = null;

  // HTML要素のID定数
  const SPECIAL_ITEMS_CONTAINER_ID = 'special-items-container';
  const SEED_SAVE_CONTAINER_ID = 'seed-save-container';
  const PLAN_DATA_STORAGE_KEY = 'nyanko-plan-data';
  const MAX_SAVED_SEEDS = 30;

  // 処理状態管理用のフラグ
  let isEventGachaProcessing = false;
  let eventGachaCheckboxReady = false;
  let eventGachaColumnReady = false;

    // イベガチャ系
    const seedProcessor = new SeedProcessor();
    const seedHistory = new EventSeedHistory();
    window.seedProcessor = seedProcessor; // 追加
    window.seedHistory = seedHistory; // 追加
    window.currentGachaKey = Object.keys(GACHA_CONFIG)[0];
    let currentGachaKey = Object.keys(GACHA_CONFIG)[0];

  // 特別アイテムの表示件数管理
  const displayCounts = {
    闇猫目: 10,
    トレジャーレーダー: 10,
    ビタンC: 10,
  };

  // ガチャ別のスロット配列定義
  const gachaSlots = {
    福引ガチャ: [
      'ちび巨神ネコ',
      'ちびトカゲネコ',
      'ちびネコフィッシュ',
      'ちびネコノトリ',
      'ちびウシネコ',
      'ちびキモネコ',
      'ちびバトルネコ',
      'ちびタンクネコ',
      'ちびネコ',
      'スピダ',
      'スピダ',
      'スピダ',
      'ニャンピュ',
      'ニャンピュ',
      '1万XP',
      '1万XP',
      '1万XP',
      '3万XP',
      '3万XP',
      '3万XP',
    ],
    マタタビガチャ: [
      'スピダ',
      'ニャンピュ',
      '1万XP',
      '3万XP',
      '5万XP',
      '紫マタタビの種',
      '赤マタタビの種',
      '青マタタビの種',
      '緑マタタビの種',
      '黄マタタビの種',
    ],
    猫目ガチャ: ['1万XP', '3万XP', 'EX猫目', 'レア猫目'],
  };

  // 除外対象アイテム（これらが出た場合は引き直し）
  const excludeItems = ['スピダ', 'ニャンピュ', '1万XP', '3万XP'];

  // ==================== シード保存機能 ====================

  /**
   * ローカルストレージから保存済みシードを取得
   */
  function getSavedSeeds() {
    const saved = localStorage.getItem('nyanko-saved-seeds');
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * シードを保存（日時付きで最大10件まで）
   */
  function saveSeed(seed) {
    let seeds = getSavedSeeds();
    const now = new Date();
    const dateStr = `(${String(now.getFullYear()).slice(-2)}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')})`;
    const seedData = seed + dateStr;

    if (!seeds.includes(seedData)) {
      seeds.unshift(seedData);
      if (seeds.length > 10) {
        seeds = seeds.slice(0, 10);
      }
      localStorage.setItem('nyanko-saved-seeds', JSON.stringify(seeds));
    }
    return seeds;
  }

  /**
   * 指定したシードを削除
   */
  function deleteSeed(seed) {
    let seeds = getSavedSeeds();
    seeds = seeds.filter((s) => s !== seed);
    localStorage.setItem('nyanko-saved-seeds', JSON.stringify(seeds));
    return seeds;
  }

  /**
   * URLから現在のシードを取得
   */
  function getCurrentSeed() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('seed') || '';
  }

  /**
   * 指定したシードのURLに遷移
   */
  function navigateToSeed(seed) {
    const url = new URL(window.location);
    url.searchParams.set('seed', seed.replace(/\(.*?\)/g, ''));
    window.location.href = url.toString();
  }

  // ==================== テキスト置換機能 ====================

  /**
   * DOMノード内のテキストを再帰的に置換
   */
  function replaceTextInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      replacements.forEach((rule) => {
        node.textContent = node.textContent.replace(rule.from, rule.to);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (const child of node.childNodes) {
        replaceTextInNode(child);
      }
    }
  }

  /**
   * 背景色が赤のセルのリンク色を黄色に変更
   */
  function updateLinkColors() {
    document.querySelectorAll('td').forEach((td) => {
      const bgColor = getComputedStyle(td).backgroundColor;
      if (bgColor === 'rgb(255, 0, 0)') {
        td.querySelectorAll('a').forEach((a) => {
          a.style.color = '#FFFF00';
        });
      }
    });
  }

  /**
   * 特定のテキスト（1万XP、3万XP、ニャンピュ、スピダ）の色を変更
   */
  function updateTextColors() {
    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];

    document.querySelectorAll('td').forEach((td) => {
      const text = td.textContent.trim();
      if (targetTexts.some((target) => text.includes(target))) {
        const linkOrSpan = td.querySelector('a, span');
        if (linkOrSpan) {
          linkOrSpan.style.color = '#d2691e';
        } else {
          td.style.color = '#d2691e';
        }
      }
    });
  }

  /**
   * 計画モード用の特別アイテム色変更
   */
  function updateSpecialItemColors() {
    if (!isPlanMode) return;

    const specialTexts = ['闇猫目', 'トレジャーレーダー', 'ビタンC'];

    // CSS クラス操作で一括処理
    const selectedTds = document.querySelectorAll('td.selected-td');

    // 既存の特別アイテムクラスを一括削除
    document.querySelectorAll('.special-item-selected').forEach((element) => {
      element.classList.remove('special-item-selected');
    });

    // スタイル追加（初回のみ）
    if (!document.getElementById('special-item-selected')) {
      const style = document.createElement('style');
      style.id = 'special-item-selected';
      style.textContent = `
            .special-item-selected {
             color: #ff4500 !important;
             font-weight: bold;
             font-size: 1.1em;
             }
            `;
      document.head.appendChild(style);
    }

    // 選択されたセルのみを処理
    selectedTds.forEach((td) => {
      const text = td.textContent.trim();
      if (specialTexts.some((target) => text.includes(target))) {
        const linkOrSpan = td.querySelector('a, span');
        if (linkOrSpan) {
          linkOrSpan.classList.add('special-item-selected');
        }
      }
    });
  }

  /**
   * 全体的なテキスト置換とスタイル更新を実行
   */
  function replaceAll() {
    replaceTextInNode(document.body);
    updateLinkColors();
    updateTextColors();
    addIconsToSpecificItems();
    makeStickyHeaders();
  }

  // ==================== ポップアップ表示機能 ====================

  /**
   * ポップアップを表示
   */
  function showModernPopup(message, targetElement, options = {}) {
      const {
          maxWidth = 280, // 初期値280
          time = 5000
      } = options;

    // 既存のポップアップ削除
    const existingPopup = document.querySelector('.star-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // ポップアップコンテナ
    const popup = document.createElement('div');
    popup.className = 'star-popup';
    popup.style.cssText = `
        position: fixed;
        background: #2c3e50;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-family: 'Segoe UI', Arial, sans-serif;
        line-height: 1.4;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        white-space: pre-line;
        border: 1px solid #34495e;
        backdrop-filter: blur(10px);
        animation: slideIn 0.2s ease-out;
    `;
      popup.style.maxWidth = `${maxWidth}px`;

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 4px;
        right: 8px;
        background: none;
        border: none;
        color: #ecf0f1;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: background-color 0.2s;
    `;

    closeButton.onmouseover = () => {
        closeButton.style.backgroundColor = 'rgba(231, 76, 60, 0.8)';
    };
    closeButton.onmouseout = () => {
        closeButton.style.backgroundColor = 'transparent';
    };
    closeButton.onclick = (e) => {
        e.stopPropagation();
        popup.remove();
    };

    // メッセージコンテナ
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        padding-right: 24px;
        font-weight: 500;
    `;
    messageContainer.textContent = message;

    popup.appendChild(closeButton);
    popup.appendChild(messageContainer);

    // 一時的に非表示で追加してサイズを取得
    popup.style.visibility = 'hidden';
    document.body.appendChild(popup);

    // ターゲット要素の位置を取得（ビューポート相対）
    const targetRect = targetElement.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    // ビューポートのサイズを取得
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 基本位置：ターゲット要素の下中央
    let left = targetRect.left + (targetRect.width / 2) - (popupRect.width / 2);
    let top = targetRect.bottom + 10;

    // 画面右端を超える場合の調整
    if (left + popupRect.width > viewportWidth - 10) {
        left = viewportWidth - popupRect.width - 10;
    }

    // 画面左端を超える場合の調整
    if (left < 10) {
        left = 10;
    }

    // 画面下端を超える場合は上に表示
    if (top + popupRect.height > viewportHeight - 10) {
        top = targetRect.top - popupRect.height - 10;

        // 上に表示しても画面上端を超える場合
        if (top < 10) {
            // ターゲット要素の右側に表示
            left = targetRect.right + 10;
            top = targetRect.top;

            // 右側でも画面を超える場合は左側に
            if (left + popupRect.width > viewportWidth - 10) {
                left = targetRect.left - popupRect.width - 10;
            }
        }
    }

    // 最終位置を設定（fixedなのでスクロール位置は不要）
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
    popup.style.visibility = 'visible';

    // 初期5秒後に自動で閉じる
    setTimeout(() => {
        if (popup && popup.parentNode) {
            popup.remove();
        }
    }, time);

    // 背景クリックで閉じる
    const handleOutsideClick = (e) => {
        if (!popup.contains(e.target)) {
            popup.remove();
            document.removeEventListener('click', handleOutsideClick);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
    }, 100);
}

  // ==================== 特別アイテム抽出・表示機能 ====================

  /**
   * 闇猫目、トレジャーレーダー、ビタンCを抽出
   */
  function extractSpecialItems() {
    const items = {
      闇猫目: [],
      トレジャーレーダー: [],
      ビタンC: [],
    };

    const selector = isPlanMode ? 'span' : 'a';
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const text = element.textContent;
      let itemType = null;

      if (text.includes('闇猫目')) itemType = '闇猫目';
      else if (text.includes('トレジャーレーダー')) itemType = 'トレジャーレーダー';
      else if (text.includes('ビタンC')) itemType = 'ビタンC';

      if (itemType) {
        const td = element.closest('td');
        const tr = td?.closest('tr');
        const prevTr = tr?.previousElementSibling;
        const label = prevTr?.querySelector('td')?.textContent?.trim();
        if (label) items[itemType].push(label);
      }
    });

    // 重複を除去し、数字の昇順でソート
    Object.keys(items).forEach((key) => {
      items[key] = [...new Set(items[key])].sort((a, b) => {
        const matchA = a.match(/^(\d+)(.*)$/);
        const matchB = b.match(/^(\d+)(.*)$/);

        if (matchA && matchB) {
          const numA = parseInt(matchA[1]);
          const numB = parseInt(matchB[1]);
          const strA = matchA[2];
          const strB = matchB[2];

          if (numA !== numB) {
            return numA - numB;
          }
          return strA.localeCompare(strB);
        }

        return a.localeCompare(b);
      });
    });

    return items;
  }

  /**
   * 特別アイテムのリストをテーブル上部に表示
   */
  function displaySpecialItemsAboveTarget(items) {
    const existingContainer = document.getElementById(SPECIAL_ITEMS_CONTAINER_ID);
    const target = document.querySelector('.css-o2j9ze');

    if (!target || !target.parentNode) {
      if (existingContainer) {
        existingContainer.remove();
        specialItemsDisplayed = false;
      }
      return;
    }

    const hasItems = Object.values(items).some((arr) => arr.length > 0);
    if (!hasItems) {
      if (existingContainer) {
        existingContainer.remove();
        specialItemsDisplayed = false;
      }
      return;
    }

    if (existingContainer) {
      existingContainer.remove();
    }

    const container = document.createElement('div');
    container.id = SPECIAL_ITEMS_CONTAINER_ID;
    container.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 16px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 16px;
        `;

    Object.entries(items).forEach(([itemType, labels]) => {
      if (labels.length > 0) {
        const itemSection = document.createElement('div');
        itemSection.style.marginBottom = '16px';

        const header = document.createElement('div');
        header.style.cssText = `
                    font-weight: bold;
                    color: #333333;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                `;

        const headerText = document.createElement('span');
        headerText.textContent = `${itemType} (${labels.length}件)`;
        header.appendChild(headerText);

        // 10件以上ある場合は展開ボタンを表示
        if (labels.length > displayCounts[itemType]) {
          const expandBtn = document.createElement('button');
          expandBtn.textContent = '+';
          expandBtn.style.cssText = `
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        width: 24px;
                        height: 24px;
                        font-size: 14px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    `;
          expandBtn.onclick = () => {
            displayCounts[itemType] += 10;
            const currentItems = extractSpecialItems();
            displaySpecialItemsAboveTarget(currentItems);
          };
          header.appendChild(expandBtn);
        }

        const labelsList = document.createElement('div');
        labelsList.style.cssText = `line-height: 1.6;`;

        const displayLabels = labels.slice(0, displayCounts[itemType]);
        displayLabels.forEach((label, index) => {
          const labelSpan = document.createElement('span');
          labelSpan.textContent = label;
          labelSpan.style.cssText = `
                        display: inline-block;
                        background: white;
                        border: 1px solid #ced4da;
                        border-radius: 4px;
                        padding: 4px 8px;
                        margin: 3px 6px 3px 0;
                        font-size: 14px;
                        color: #495057;
                        min-width: 40px;
                        text-align: center;
                    `;
          labelsList.appendChild(labelSpan);
        });

        itemSection.appendChild(header);
        itemSection.appendChild(labelsList);
        container.appendChild(itemSection);
      }
    });

    try {
      target.insertAdjacentElement('beforebegin', container);
      specialItemsDisplayed = true;
    } catch (err) {
      console.error('挿入エラー:', err);
    }
  }

  // ==================== シード保存UI機能 ====================

  /**
   * シード保存・管理UIを作成
   */
  function createSeedSaveUI() {
    const subtitles = document.querySelectorAll('h6.MuiTypography-subtitle2');
    if (subtitles.length < 2) return;

    const secondSubtitle = subtitles[1];
    const existingContainer = document.getElementById(SEED_SAVE_CONTAINER_ID);

    if (existingContainer) {
      const seedList = existingContainer.querySelector('#seed-list');
      if (seedList) {
        const savedSeeds = getSavedSeeds();
        updateSeedList(seedList, savedSeeds);
      }
      return;
    }

    const seedContainer = document.createElement('div');
    seedContainer.id = SEED_SAVE_CONTAINER_ID;
    seedContainer.style.cssText = `margin-bottom: 16px;`;

    // 保存ボタン
    const saveButton = document.createElement('button');
    saveButton.textContent = '現在のシードを保存';
    saveButton.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            font-family: inherit;
            margin-bottom: 8px;
            display: block;
        `;

    saveButton.onclick = () => {
      const currentSeed = getCurrentSeed();
      if (currentSeed) {
        const seeds = saveSeed(currentSeed);
        const seedList = document.getElementById('seed-list');
        if (seedList) {
          updateSeedList(seedList, seeds);
        }
        alert(`シード "${currentSeed}" を保存しました\n※キャッシュの削除やシークレットモードの利用では保存維持されません。`);
      } else {
        alert('シードが見つかりません');
      }
    };

    // シードリスト表示エリア
    const seedListRow = document.createElement('div');
    seedListRow.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

    const seedListLabel = document.createElement('div');
    seedListLabel.style.cssText = `
            font-weight: bold;
            font-size: 14px;
            color: #333;
            flex-shrink: 0;
        `;
    seedListLabel.textContent = '保存済みのシード(最大10件)：';

    const seedList = document.createElement('div');
    seedList.id = 'seed-list';
    seedList.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            flex: 1;
        `;

    const savedSeeds = getSavedSeeds();
    updateSeedList(seedList, savedSeeds);

    seedListRow.appendChild(seedListLabel);
    seedListRow.appendChild(seedList);
    seedContainer.appendChild(saveButton);
    seedContainer.appendChild(seedListRow);

    secondSubtitle.parentNode.insertBefore(seedContainer, secondSubtitle);
  }

  /**
   * シードリストのUIを更新
   */
  function updateSeedList(container, seeds) {
    container.innerHTML = '';

    if (seeds.length === 0) {
      const noSeedsMsg = document.createElement('span');
      noSeedsMsg.textContent = '保存済みのシードはありません';
      noSeedsMsg.style.cssText = `
                color: #666;
                font-style: italic;
                font-size: 14px;
            `;
      container.appendChild(noSeedsMsg);
      return;
    }

    seeds.forEach((seed) => {
      const seedButtonContainer = document.createElement('div');
      seedButtonContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 4px;
                background: #e3f2fd;
                border: 1px solid #90caf9;
                border-radius: 4px;
                padding: 2px;
            `;

      const seedButton = document.createElement('button');
      seedButton.textContent = seed;
      seedButton.style.cssText = `
                background: transparent;
                border: none;
                padding: 4px 16px;
                font-size: 14px;
                cursor: pointer;
                color: #1976d2;
                font-family: monospace;
                transition: background-color 0.2s;
                border-radius: 2px;
            `;

      seedButton.onmouseover = () => {
        seedButton.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
      };
      seedButton.onmouseout = () => {
        seedButton.style.backgroundColor = 'transparent';
      };
      seedButton.onclick = () => {
        navigateToSeed(seed);
      };

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '×';
      deleteButton.style.cssText = `
                background: #f44336;
                color: white;
                border: none;
                border-radius: 3px;
                width: 20px;
                height: 18px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            `;

      deleteButton.onmouseover = () => {
        deleteButton.style.backgroundColor = '#d32f2f';
      };
      deleteButton.onmouseout = () => {
        deleteButton.style.backgroundColor = '#f44336';
      };
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`シード "${seed}" を削除しますか？`)) {
          const updatedSeeds = deleteSeed(seed);
          updateSeedList(container, updatedSeeds);
        }
      };

      seedButtonContainer.appendChild(seedButton);
      seedButtonContainer.appendChild(deleteButton);
      container.appendChild(seedButtonContainer);
    });
  }

  /**
   * デバウンス機能付きの更新処理
   */
  function debouncedUpdate() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      const items = extractSpecialItems();
      displaySpecialItemsAboveTarget(items);
      if (!document.getElementById(SEED_SAVE_CONTAINER_ID)) {
        createSeedSaveUI();
      }
      makeStickyHeaders();
    }, 100);
  }

  // ==================== シード計算・スロット機能 ====================

  /**
   * XORShift32アルゴリズムによる疑似乱数生成
   */
  function xorshift32(x) {
    x = (x ^ (x << 13)) >>> 0;
    x = (x ^ (x >>> 17)) >>> 0;
    x = (x ^ (x << 15)) >>> 0;
    return x;
  }

  /**
   * シードを指定ステップ数進める
   */
  function advanceSeed(seed, steps) {
    let currentSeed = seed >>> 0;
    for (let i = 0; i < steps; i++) {
      currentSeed = xorshift32(currentSeed);
    }
    return currentSeed;
  }

  /**
   * URLから現在のシードを取得
   */
  function getCurrentSeedFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const seedStr = urlParams.get('seed');
    return seedStr ? parseInt(seedStr, 10) : 0;
  }

  /**
   * テーブルのヘッダー値を取得
   */
  function getThValue(tableIndex, columnIndex) {
    const tables = document.querySelectorAll('table');
    if (tableIndex < tables.length) {
      const ths = tables[tableIndex].querySelectorAll('thead th');
      if (columnIndex < ths.length) {
        return ths[columnIndex].textContent.trim();
      }
    }
    return '不明';
  }

  /**
   * スロット計算（レア被り時の排出予測）
   * 初期スロット：最初に選ばれたスロット
   * 最終スロット：実際に排出されるアイテム
   * 繰り返し回数：レア被りによる引き直し回数
   */
  function calculateSlot(seed, gachaType) {
    if (!gachaSlots[gachaType]) {
      return { slot: '不明', repeatCount: 0 };
    }

    let currentSlots = [...gachaSlots[gachaType]];
    let currentSeed = seed;
    let repeatCount = 0;
    let initialSlot = null;
    let finalSlot = null;

    while (true) {
      const slotIndex = currentSeed % currentSlots.length;
      const selectedSlot = currentSlots[slotIndex];

      if (initialSlot === null) {
        initialSlot = selectedSlot;
      }

      //   console.log(
      //     `繰り返し${repeatCount}: シード${currentSeed}, 配列長${currentSlots.length}, インデックス${slotIndex}, スロット${selectedSlot}`
      //   );

      if (initialSlot !== selectedSlot) {
        finalSlot = selectedSlot;
        break;
      }

      currentSlots.splice(slotIndex, 1);
      currentSeed = xorshift32(currentSeed);
      repeatCount++;

      if (currentSlots.length === 0) {
        finalSlot = '配列が空になりました';
        break;
      }
    }

    return {
      initialSlot: initialSlot,
      finalSlot: finalSlot,
      repeatCount: repeatCount,
    };
  }



// ==================== イベントシード保存機能 ====================

function getSavedEventSeeds() {
    const saved = localStorage.getItem('event-seeds');
    return saved ? JSON.parse(saved) : [];
}

function handleSaveEventSeed() {
    const seedInput = document.getElementById('custom-seed');
    const gachaSelect = document.getElementById('custom-gacha');

    if (!seedInput || !gachaSelect) {
        alert('シードまたはガチャ種が選択されていません');
        return;
    }

    const currentSeed = seedInput.value.trim();
    const currentGacha = gachaSelect.value;

    if (!currentSeed) {
        alert('シードを入力してください');
        return;
    }

    const seeds = saveEventSeed(currentSeed, currentGacha);
    const seedList = document.getElementById('event-seed-list');
    if (seedList) {
        updateEventSeedList(seedList, seeds);
    }
alert(`シード "${currentSeed}" を保存しました。\n※キャッシュの削除やシークレットモードの利用では保存維持されません。`);
}

function saveEventSeed(seed, gachaKey) {
    let seeds = getSavedEventSeeds();
    const now = new Date();
    const dateStr = `(${String(now.getFullYear()).slice(-2)}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')})`;
    const gachaName = GACHA_CONFIG[gachaKey] ? GACHA_CONFIG[gachaKey].name : gachaKey;
    const seedData = {
        seed: seed,
        gachaKey: gachaKey,
        gachaName: gachaName,
        date: dateStr,
        displayText: `${seed} - ${gachaName}${dateStr}`
    };

    // 既存のシードかチェック（シードとガチャ種の組み合わせ）
    const existingIndex = seeds.findIndex(s => s.seed === seed && s.gachaKey === gachaKey);
    if (existingIndex === -1) {
        seeds.unshift(seedData);
        if (seeds.length > 3) {
            seeds = seeds.slice(0, 3);
        }
        localStorage.setItem('event-seeds', JSON.stringify(seeds));
    }
    return seeds;
}

function deleteEventSeed(seedData) {
    let seeds = getSavedEventSeeds();
    seeds = seeds.filter((s) => !(s.seed === seedData.seed && s.gachaKey === seedData.gachaKey));
    localStorage.setItem('event-seeds', JSON.stringify(seeds));
    return seeds;
}

function updateEventSeedList(container, seeds) {
    container.innerHTML = '';

    if (seeds.length === 0) {
        const noSeedsMsg = document.createElement('span');
        noSeedsMsg.textContent = '保存済みのシードはありません';
        noSeedsMsg.style.cssText = `
            color: #666;
            font-style: italic;
            font-size: 12px;
        `;
        container.appendChild(noSeedsMsg);
        return;
    }

    seeds.forEach((seedData) => {
        const seedButtonContainer = document.createElement('div');
        seedButtonContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
            background: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 4px;
            padding: 2px 6px;
            margin: 2px 0;
        `;

        const seedButton = document.createElement('button');
        seedButton.textContent = seedData.displayText;
        seedButton.style.cssText = `
            background: transparent;
            border: none;
            padding: 4px 8px;
            margin: 0px;
            font-size: 14px;
            cursor: pointer;
            color: #1976d2;
            font-family: monospace;
            transition: background-color 0.2s;
            border-radius: 2px;
            flex: 1;
            text-align: left;
        `;

        seedButton.onmouseover = () => {
            seedButton.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
        };
        seedButton.onmouseout = () => {
            seedButton.style.backgroundColor = 'transparent';
        };
        seedButton.onclick = () => {
            document.getElementById('custom-seed').value = seedData.seed;
            document.getElementById('custom-gacha').value = seedData.gachaKey;
            window.currentGachaKey = seedData.gachaKey;
            updateTable(seedData.seed, seedData.gachaKey);
            EventSeedHistory.add(seedData.seed, seedData.gachaKey);
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '×';
        deleteButton.style.cssText = `
            background: #f44336;
            color: white;
            border: none;
            border-radius: 3px;
            width: 18px;
            height: 16px;
            font-size: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
            margin: 0px;
            padding: 0px;
        `;

        deleteButton.onmouseover = () => {
            deleteButton.style.backgroundColor = '#d32f2f';
        };
        deleteButton.onmouseout = () => {
            deleteButton.style.backgroundColor = '#f44336';
        };
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`シード "${seedData.displayText}" を削除しますか？`)) {
                const updatedSeeds = deleteEventSeed(seedData);
                updateEventSeedList(container, updatedSeeds);
            }
        };

        seedButtonContainer.appendChild(seedButton);
        seedButtonContainer.appendChild(deleteButton);
        container.appendChild(seedButtonContainer);
    });
}



    // ==================== テーブルユーティリティ関数 ====================

    // 連続するレアのテーブル位置を検出
    function findConsecutiveRares(gachaKey) {
        const consecutiveRares = [];

        for (let i = 1; i <= 100; i++) {
            const detailsA = getSlotDetails(`${i}A`, gachaKey);
            const detailsB = getSlotDetails(`${i}B`, gachaKey);

            // A側がレアの場合
            if (detailsA && detailsA.rank === 'rare') {
                // 次のテーブル位置を確認
                let nextTableNumber, nextSuffix;
                if (i === 100) {
                    // 100Aの場合は100Bと比較
                    nextTableNumber = `${i}B`;
                    nextSuffix = 'B';
                } else {
                    nextTableNumber = `${i+1}A`;
                    nextSuffix = 'A';
                }

                const nextDetails = getSlotDetails(nextTableNumber, gachaKey);
                if (nextDetails && nextDetails.rank === 'rare' && detailsA.character === nextDetails.character) {
                    consecutiveRares.push({
                        current: `${i}A`,
                        next: nextTableNumber,
                        nextSuffix: nextSuffix,
                        character: detailsA.character,
                        nextCharacter: detailsA.nextCharacter
                    });
                }
            }

            // B側がレアの場合
            if (detailsB && detailsB.rank === 'rare') {
                // 次のテーブル位置を確認
                let nextTableNumber, nextSuffix;
                if (i === 100) {
                    // 100Bは最後なので比較なし
                    continue;
                } else {
                    nextTableNumber = `${i+1}B`;
                    nextSuffix = 'B';
                }

                const nextDetails = getSlotDetails(nextTableNumber, gachaKey);
                if (nextDetails && nextDetails.rank === 'rare' && detailsB.character === nextDetails.character) {
                    consecutiveRares.push({
                        current: `${i}B`,
                        next: nextTableNumber,
                        nextSuffix: nextSuffix,
                        character: detailsB.character,
                        nextCharacter: detailsB.nextCharacter
                    });
                }
            }
        }

        return consecutiveRares;
    }

    function getTableIndexes(tableNumber) {
        const match = tableNumber.match(/^(\d+)([AB])$/);
        if (!match) return null;

        const num = parseInt(match[1]);
        const suffix = match[2];

        if (suffix === 'A') {
            const baseIndex = (num - 1) * 2;
            return [baseIndex, baseIndex + 1];
        } else {
            const baseIndex = (num - 1) * 2 + 1;
            return [baseIndex, baseIndex + 1];
        }
    }

    // スロット詳細取得
    function getSlotDetails(tableNumber, gachaKey) {
        const indexes = getTableIndexes(tableNumber);
        if (!indexes || indexes[0] >= seedProcessor.allSeeds.length || indexes[1] >= seedProcessor.allSeeds.length) {
            return null;
        }

        const rareSeed = seedProcessor.allSeeds[indexes[0]];
        const charSeed = seedProcessor.allSeeds[indexes[1]];

        const config = GACHA_CONFIG[gachaKey];
        const rareValue = rareSeed % 10000;

        // rankを算出
        let rank = 'normal';
        if (rareValue <= config.rate[0]) {
            rank = 'normal';
        } else if (rareValue > config.rate[0] && rareValue <= config.rate[1]) {
            rank = 'rare';
        } else if (rareValue > config.rate[1] && rareValue <= config.rate[2]) {
            rank = 'super';
        } else if (rareValue > config.rate[2] && rareValue <= config.rate[3]) {
            rank = 'uber';
        } else if (rareValue > config.rate[3] && rareValue <= config.rate[4]) {
            rank = 'legend';
        }

        let characters = config.characters[0];

        for (let i = 0; i < config.rate.length; i++) {
            if (rareValue <= config.rate[i]) {
                characters = config.characters[i];
                break;
            }
        }

        const charIndex = charSeed % characters.length;
        const character = characters[charIndex];

        let nextCharacter = '';
        let nextSeed = null;
        // レア被り用のキャラ（rareランクのみ）
        if(rank === 'rare'){
            nextSeed = advanceSeed(charSeed, 1);
            const nextCharacters = characters.filter((char) => char !== character);
            const nextCharIndex = nextSeed % nextCharacters.length;
            nextCharacter = nextCharacters[nextCharIndex];
        }

        return {
            tableNumber,
            rareSeed,
            charSeed,
            rareValue,
            character,
            rank,
            charIndex,
            gachaKey,
            nextCharacter,
            nextSeed
        };
    }

    // 確定スロット詳細取得
    function getGuaranteedSlotDetails(tableNumber, gachaKey) {
        const indexes = getTableIndexes(tableNumber);
        if (!indexes || indexes[0] >= seedProcessor.allSeeds.length || indexes[1] >= seedProcessor.allSeeds.length) {
            return null;
        }

        const rareSeed = seedProcessor.allSeeds[indexes[0]];
        const charSeed = seedProcessor.allSeeds[indexes[1]];

        const config = GACHA_CONFIG[gachaKey];
        const rareValue = rareSeed % (config.guaranteedRate[config.guaranteedRate.length - 1] + 1);

        let characters = config.guaranteedCharacters[0];

        for (let i = 0; i < config.guaranteedRate.length; i++) {
            if (rareValue <= config.guaranteedRate[i]) {
                characters = config.guaranteedCharacters[i];
                break;
            }
        }

        const charIndex = charSeed % characters.length;
        const character = characters[charIndex];

        return {
            tableNumber,
            rareSeed,
            charSeed,
            rareValue,
            character,
            charIndex,
            gachaKey,
        };
    }

    // 10連時の排出キャラ
    function getTenConsecutiveDetails(tableNumber, gachaKey) {
        const indexes = getTableIndexes(tableNumber);
        if (!indexes || indexes[0] >= seedProcessor.allSeeds.length || indexes[1] >= seedProcessor.allSeeds.length) {
            return null;
        }

        const seed = seedProcessor.allSeeds[indexes[0]];

        const config = GACHA_CONFIG[gachaKey];

        const rareValue = seed % (config.guaranteedRate[config.guaranteedRate.length - 1] + 1);
        let rareRankMaru = ''
        if(config.guaranteedRate.length>1){
            const rareRank = config.guaranteedRate.findIndex(rate => rareValue <= rate) + 1;
            const MARU_NUMBERS = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩',];
            rareRankMaru = rareRank ? MARU_NUMBERS[rareRank - 1] : '';
        }


        let characters = []

        for (let i = 0; i < config.guaranteedRate.length; i++) {
           const charIndex = seed % config.guaranteedCharacters[i].length
           characters = [...characters, config.guaranteedCharacters[i][charIndex]];
        }

        return {
            tableNumber,
            seed,
            rareRank: rareRankMaru,
            characters,
            gachaKey,
        };
    }

    // 全セルをクリアする関数
    function clearAllCells() {
        for (let i = 1; i <= 100; i++) {
            clearCell(`${i}A`);
            clearCell(`${i}B`);
        }
    }

    // 個別セルをクリアする関数
function clearCell(tableNumber) {
    const cell = document.getElementById(`cat-${tableNumber}`);
    const score = document.getElementById(`score-${tableNumber}`);

    if (cell) {
        cell.innerHTML = '&nbsp;';
        cell.className = 'cat rank-normal';
    }
    if (score) {
        score.innerHTML = '&nbsp;';
        score.className = 'score rank-normal';
    }
}

    // 次の位置を計算するヘルパー関数
    function getNextPosition(tableNumber) {
        const match = tableNumber.match(/^(\d+)([AB])$/);
        if (!match) return '';

        const num = parseInt(match[1]);
        const suffix = match[2];

        if (suffix === 'A') {
            return `${num + 1}B`;
        } else {
            return `${num + 2}A`;
        }
    }

// テーブルセルを更新する関数
function updateTableCell(tableNumber, gachaKey, consecutiveRareNexts, consecutiveRares) {
    const details = getSlotDetails(tableNumber, gachaKey);
    const cell = document.getElementById(`cat-${tableNumber}`);
    const score = document.getElementById(`score-${tableNumber}`);
    const guaranteedDetails = getGuaranteedSlotDetails(tableNumber, gachaKey);
    const guaranteedCell = document.getElementById(`guaranteed-cat-${tableNumber}`);
    const guaranteedScore = document.getElementById(`guaranteed-score-${tableNumber}`);
    const tenConsecutiveDetails = getTenConsecutiveDetails(tableNumber, gachaKey);
    const tenConsecutiveCell = document.getElementById(`ten-confirm-${tableNumber}`);


    if (!cell || !details) return;

    // ランクに応じた背景色を設定
    cell.className = `cat rank-${details.rank}`;
    if (score) {
        score.className = `score rank-${details.rank}`;
    }

    // セル内容の設定
    const isConsecutiveNext = consecutiveRareNexts.has(tableNumber);
    if (isConsecutiveNext && details.rank === 'rare') {
        // 連続レアの後方位置の場合（元のコードと同じ仕様）
        const rareInfo = consecutiveRares.find(cr => cr.next === tableNumber);
        if (rareInfo) {
            const nextPos = getNextPosition(tableNumber);
            const nextDetails = getSlotDetails(nextPos, gachaKey);
            const isReRollAgain = nextDetails && nextDetails.character === details.nextCharacter;
            if (tableNumber.endsWith('A')) {
                // A側の場合は現在位置+1でB列に変更
                if (score) {
                    score.innerHTML = `<span class="char-click" data-char-seed="${details.charSeed}">${details.character}</span>`;
                }
                cell.innerHTML = `<span class="next-char-click" data-next-seed="${details.nextSeed}">${details.nextCharacter} -> ${nextPos}${isReRollAgain ? "R" : ""}</span>`;
            } else {
                // B側の場合は現在位置+2でA列に変更
                if (score) {
                    score.innerHTML = `<span class="char-click" data-char-seed="${details.charSeed}">${details.character}</span>`;
                }
                cell.innerHTML = `<span class="next-char-click" data-next-seed="${details.nextSeed}"><- ${nextPos}${isReRollAgain ? "R" : ""} ${details.nextCharacter}</span>`;
            }
        }
    } else {
        // 通常の表示
        if (score) {
            score.innerHTML = '&nbsp;';
        }
        cell.innerHTML = `<span class="char-click" data-char-seed="${details.charSeed}">${details.character}</span>`;
    }

    if(guaranteedScore){
            guaranteedScore.innerHTML = '&nbsp;';
        }
        guaranteedCell.innerHTML = `<span class="char-click" data-char-seed="${guaranteedDetails.charSeed}">${guaranteedDetails.character}</span>`;

       tenConsecutiveCell.innerHTML = `<span >${tenConsecutiveDetails.rareRank !== "" ? `10連開始▶︎確定テーブル位置で${tenConsecutiveDetails.rareRank}排出</br>` : ""}<span class="char-click" data-char-seed="${tenConsecutiveDetails.seed}">排出▶︎${formatCharacterList(tenConsecutiveDetails.characters)}</span></span>`;
    }

function formatCharacterList(characters) {
  if (!Array.isArray(characters)) return '';

  if (characters.length === 1) {
    // 要素が1つだけならそのまま表示
    return characters[0];
  }

  // 複数ある場合は ①:〜、②:〜形式に変換
  const labels = '①②③④⑤⑥⑦⑧⑨⑩';

  return characters.map((char, i) => {
    return `${labels[i]}: ${char}`;
  }).join('');
}


    // テーブルをクリアする関数
    function clearTable() {
        clearAllCells();
    }

    // 改善されたテーブル更新関数
function updateTable(seed, gachaKey) {
    if (!seed) {
        clearTable();
        return;
    }

    console.log('イベガチャテーブル更新開始:', seed, gachaKey);

    try {
        // 数値変換を確実に行う
        const numericSeed = parseInt(seed);
        if (isNaN(numericSeed)) {
            console.error('無効なシード値:', seed);
            return;
        }

        // グローバル変数も更新
        window.currentGachaKey = gachaKey;

        // キャッシュクリアを強制実行
        seedProcessor.cache.clear();

        // シードを生成（100Bまでなので201個のシードが必要）
        seedProcessor.generateAllSeedsOptimized(numericSeed, 100);

        // まず全てのセルをクリア（状態をリセット）
        clearAllCells();

        // 連続するレアを検出
        const consecutiveRares = findConsecutiveRares(gachaKey);
        const consecutiveRareNexts = new Set(consecutiveRares.map(cr => cr.next));

        console.log('連続レア検出:', consecutiveRares);

        // 各テーブル位置のキャラクターを計算して表示
        for (let i = 1; i <= 100; i++) {
            updateTableCell(`${i}A`, gachaKey, consecutiveRareNexts, consecutiveRares);
            updateTableCell(`${i}B`, gachaKey, consecutiveRareNexts, consecutiveRares);
        }

        // *** 改善：レアキャラクターに⭐アイコンを追加 ***
        addEventGachaStarIcons(gachaKey);

        console.log('イベガチャテーブル更新完了');

    } catch (error) {
        console.error('イベガチャテーブル更新エラー:', error);
        alert('テーブル更新中にエラーが発生しました: ' + error.message);
    }
}
/**
 * イベガチャテーブルのレアキャラクターに⭐アイコンを追加
 */
function addEventGachaStarIcons(gachaKey) {

    for (let i = 1; i <= 100; i++) {
        addStarIconToEventGachaCell(`${i}A`, gachaKey);
        addStarIconToEventGachaCell(`${i}B`, gachaKey);
    }
}

/**
 * 個別セルに⭐アイコンを追加（イベガチャ用）
 */
function addStarIconToEventGachaCell(tableNumber, gachaKey) {
    const details = getSlotDetails(tableNumber, gachaKey);
    const cell = document.getElementById(`cat-${tableNumber}`);

    if (!cell || !details) return;

    // レアランクで、連続レアの後方でない場合のみアイコンを追加
    if (details.rank === 'rare') {
        // 既にアイコンがある場合はスキップ
        if (cell.querySelector('.custom-icon')) {
            return;
        }

        // 連続レアの後方位置かチェック
        const consecutiveRares = findConsecutiveRares(gachaKey);
        const consecutiveRareNexts = new Set(consecutiveRares.map(cr => cr.next));
        const isConsecutiveNext = consecutiveRareNexts.has(tableNumber);

        // 連続レアの後方でない場合のみアイコンを追加
        if (!isConsecutiveNext) {
            const icon = document.createElement('span');
            icon.textContent = '⭐';
            icon.className = 'custom-icon event-gacha-icon';
            icon.style.cssText = `
                margin-left: 5px;
                cursor: pointer;
                font-size: 16px;
                color: #ffd700;
                user-select: none;
                display: inline-block;
                z-index: 100;
                position: relative;
            `;

            // クリックイベントを設定
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                let message = `■レア被り時の移動先`;
                message += `\n排出：${details.nextCharacter}`;
                message += `\n次のテーブル位置：${getNextPosition(details.tableNumber)}`;

                showModernPopup(message, icon);
            });

            cell.appendChild(icon);
        }
    }
}


  // ==================== アイコン機能 ====================

  /**
   * 特定のアイテム（1万XP、3万XP、ニャンピュ、スピダ）にクリック可能なアイコンを追加
   */
  function addIconsToSpecificItems() {
    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];
    let foundCount = 0;

    const tables = document.querySelectorAll('table');

    tables.forEach((table, tableIndex) => {
      const tbody = table.querySelector('tbody');
      if (!tbody) {
        console.log(`テーブル ${tableIndex}: tbodyが見つかりません`);
        return;
      }

      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.forEach((row, rowIndex) => {
        // 左テーブルは奇数行、右テーブルは偶数行が対象
        let shouldAddIcon = false;

        if (tableIndex === 0 && rowIndex % 2 === 1) {
          shouldAddIcon = true;
          //console.log(`テーブル0: 行${rowIndex} - 奇数行のため対象`);
        } else if (tableIndex === 1 && rowIndex % 2 === 0) {
          shouldAddIcon = true;
          //console.log(`テーブル1: 行${rowIndex} - 偶数行のため対象`);
        } else {
          //console.log(`テーブル${tableIndex}: 行${rowIndex} - 対象外`);
        }

        if (!shouldAddIcon) return;

        const tds = row.querySelectorAll('td');
        tds.forEach((td, tdIndex) => {
          const text = td.textContent.trim();
          const matchedText = targetTexts.find((target) => text === target || text === target + '⭐');

          if (matchedText) {
            //console.log(`対象テキスト発見: ${matchedText}, テーブル${tableIndex}, 行${rowIndex}, td${tdIndex}`);
            foundCount++;

            if (td.querySelector('.custom-icon')) {
              //console.log('既にアイコンあり、スキップ');
              return;
            }

            // アイコンを作成
            const icon = document.createElement('span');
            icon.textContent = '⭐';
            icon.className = 'custom-icon';
            icon.style.cssText = `
                            margin-left: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            color: #ffd700;
                            user-select: none;
                            display: inline-block;
                            z-index: 100;
                            position: relative;
                        `;

            // ★ 通常モードか計画モードかでイベント設定を分岐
            if (isPlanMode) {
              // 計画モード用のイベント（バッチ処理で後から設定される）
              //console.log(`計画モード用アイコン追加: ${matchedText}`);
            } else {
              // 通常モード用のイベント（即座に設定）
              icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const currentSeed = getCurrentSeedFromURL();
                let steps = rowIndex + 1;
                const advancedSeed = advanceSeed(currentSeed, steps);
                const thValue = getThValue(tableIndex, tdIndex + 1);

                let slotInfo = null;
                if (gachaSlots[thValue]) {
                  slotInfo = calculateSlot(advancedSeed, thValue);
                }

                const actualRowNumber = Math.floor(rowIndex / 2) + 1;
                const totalSteps = slotInfo ? rowIndex + slotInfo.repeatCount : actualRowNumber;
                const nextTableNumber = Math.ceil(totalSteps / 2) + 1;
                const nextTableSuffix = totalSteps % 2 === 0 ? 'B' : 'A';
                const nextTablePosition = `${nextTableNumber}${nextTableSuffix}`;

                let message = `■レア被り時の移動先`;
                message += `\n排出：${slotInfo?.finalSlot || '不明'}`;
                message += `\n次のテーブル位置：${nextTablePosition}`;

                showModernPopup(message, icon);
              });
              //console.log(`通常モード用アイコン追加: ${matchedText}`);
            }

            td.appendChild(icon);
            //console.log(`アイコン追加完了: ${matchedText}, テーブル${tableIndex}, 行${rowIndex}`);
          }
        });
      });
    });

    // console.log(`addIconsToSpecificItems 完了。対象テキスト数: ${foundCount}`);
  }

  // ==================== 計画モード機能 ====================
  /**
   * DOM要素の存在を待機するPromise
   */
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      function check() {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`要素が見つかりません: ${selector}`));
          return;
        }

        requestAnimationFrame(check);
      }

      check();
    });
  }
  /**
   * イベガチャ列の作成完了を待機
   */
  function waitForEventGachaColumn() {
    return new Promise((resolve) => {
      function checkColumn() {
        const eventHeaders = document.querySelectorAll('th[data-event-gacha="true"]');
        const eventCells = document.querySelectorAll('td[data-event-gacha="true"]');

        if (eventHeaders.length > 0 && eventCells.length > 0) {
          eventGachaColumnReady = true;
          resolve(true);
          return;
        }

        requestAnimationFrame(checkColumn);
      }

      checkColumn();
    });
  }

  /**
   * 通常モードと計画モードを切り替え
   */
  function toggleMode() {
    const button = document.getElementById('mode-toggle-btn');
    const currentMode = isPlanMode ? '計画モード' : '通常モード';
    const nextMode = isPlanMode ? '通常モード' : '計画モード';

    // ボタンを無効化
    button.disabled = true;
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';

    console.log(`${currentMode} → ${nextMode} 切り替え開始`);

    // 計画モードから通常モードに切り替える場合のみ未保存確認
    if (isPlanMode && hasUnsavedChanges) {
      const shouldSwitch = confirm('未保存の計画データがあります。通常モードに切り替えてもいいでしょうか？');
      if (!shouldSwitch) {
        // キャンセル時はボタンを有効化して処理を中断
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        console.log('モード切り替えをキャンセルしました');
        return;
      }
    }

    // ローディングポップアップを表示
    const loadingMessage = `${nextMode}に切り替え中...`;
    showLoadingPopup(loadingMessage);

    // モード切り替え処理を非同期で実行
    setTimeout(() => {
      try {
        // ここでモードフラグを変更
        isPlanMode = !isPlanMode;
        button.textContent = isPlanMode ? '計画モード' : '通常モード';

        if (isPlanMode) {
          console.log('計画モード開始');
          enterPlanModeWithLoading();
        } else {
          console.log('通常モード開始');
          exitPlanModeWithLoading();
        }
      } catch (error) {
        console.error('モード切り替えエラー:', error);
        hideLoadingPopup();

        // エラー時はフラグを戻してボタンを有効化
        isPlanMode = !isPlanMode;
        button.textContent = isPlanMode ? '計画モード' : '通常モード';
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';

        alert('モード切り替えに失敗しました。ページをリロードしてください。');
      }
    }, 100);
  }

  /**
   * 計画モードに移行
   */
/**
 * 改善版：計画モード移行処理（イベガチャ状態保持）
 */
async function enterPlanModeWithLoading() {
    // *** 改善：通常モードでのイベガチャ状態を保存 ***
    const wasEventGachaEnabled = isEventGachaEnabled;

    // 初期化
    eventGachaColumnAdded = false;
    hiddenEventGachaSelections = [];
    isEventGachaProcessing = false;
    eventGachaCheckboxReady = false;
    eventGachaColumnReady = false;

    ticketCounts = { N: 0, F: 0, G: 0, E: 0 };
    ticketColumnIndexMap = {};
    createTicketCounter();
    convertLinksToSpans();

    // ルート保存ボタンを作成
    createRouteManagementButtons();

    // *** 改善：イベガチャテーブルの表示状態を維持 ***
    // チェックが入っていない場合のみ非表示にする
    if (!wasEventGachaEnabled) {
        hideEventGachaTable();
    }

    // イベガチャチェックボックスは既に存在するはずなので、状態のみ復元
    const eventCheckbox = document.getElementById('event-gacha-checkbox');
    if (eventCheckbox) {
        // *** 改善：通常モードでの状態を保持 ***
        eventCheckbox.checked = wasEventGachaEnabled;
        isEventGachaEnabled = wasEventGachaEnabled;
        eventGachaCheckboxReady = true;
        console.log(`イベガチャ状態を保持: ${wasEventGachaEnabled}`);
    } else {
        // 存在しない場合は作成
        await addEventGachaCheckbox();
        // 作成後に状態を設定
        const newEventCheckbox = document.getElementById('event-gacha-checkbox');
        if (newEventCheckbox) {
            newEventCheckbox.checked = wasEventGachaEnabled;
            isEventGachaEnabled = wasEventGachaEnabled;
        }
    }

    const tables = document.querySelectorAll('table');

    window.batchOperations = [];

    // バッチ処理を順次実行
    await new Promise((resolve) => {
        requestAnimationFrame(() => {
            tables.forEach((table, tableIndex) => {
                processTableForPlanMode(table, tableIndex);
            });

            requestAnimationFrame(async () => {
                console.log(`バッチ処理開始: ${window.batchOperations.length}件の操作`);
                executeBatchOperations();

                requestAnimationFrame(async () => {
                    updateTicketDisplay();
                    updateTextColors();

                    // 保存済みデータがあれば復元
                    const currentSeed = getCurrentSeed();
                    if (currentSeed) {
                        await restorePlanState(currentSeed);
                    }

                    // *** 改善：復元処理後にイベガチャ状態をチェック ***
                    const finalEventGachaState = checkAndRestoreEventGachaState();

                    // *** 改善：イベガチャが有効な場合は列を追加 + テーブル表示 ***
                    if (finalEventGachaState) {
                        addEventGachaColumn();
                        showEventGachaTable(); // テーブルも表示
                        console.log('計画モード移行時：イベガチャ列追加 + テーブル表示');
                    }

                    // 変更検知を開始
                    lastSavedState = JSON.stringify(getCurrentPlanState());
                    hasUnsavedChanges = false;

                    resolve();
                });
            });
        });
    });

    finishModeSwitch();
}
/**
 * イベガチャ状態の最終チェックと復元
 */
function checkAndRestoreEventGachaState() {
    // チケットカウントからイベガチャの必要性をチェック
    const hasEventTickets = ticketCounts.E > 0;

    // 隠れた選択項目があるかチェック
    const hasHiddenSelections = hiddenEventGachaSelections && hiddenEventGachaSelections.length > 0;

    // イベガチャが必要と判定される場合
    const shouldEnableEventGacha = hasEventTickets || hasHiddenSelections;
        const eventCheckbox = document.getElementById('event-gacha-checkbox');
    if(eventCheckbox.checked){
                    isEventGachaEnabled = true;
    }

    if (shouldEnableEventGacha && !isEventGachaEnabled) {
        // 自動的にイベガチャを有効化

        if (eventCheckbox) {
            eventCheckbox.checked = true;
            isEventGachaEnabled = true;
            console.log('イベガチャを自動有効化しました（選択項目検出）');
        }
    }

    return isEventGachaEnabled;
}

  /**
   * 改善されたバッチ処理実行（DocumentFragment使用）
   */
  function executeBatchOperations() {
    const startTime = performance.now();

    // DocumentFragmentを使用してDOM操作を最小化
    const fragments = new Map();

    // 親ノード別にグループ化
    window.batchOperations.forEach((operation) => {
      const parent = operation.oldElement.parentNode;
      if (!fragments.has(parent)) {
        fragments.set(parent, []);
      }
      fragments.get(parent).push(operation);
    });

    // 親ノード別に一括処理
    fragments.forEach((operations, parent) => {
      operations.forEach((operation) => {
        parent.replaceChild(operation.newElement, operation.oldElement);
      });
    });

    // イベント設定を一括実行（requestAnimationFrameで分割）
    const setupEvents = window.batchOperations.filter((op) => op.setupEvent);
    const chunkSize = 50; // 一度に処理する数

    function processEventChunk(startIndex) {
      const endIndex = Math.min(startIndex + chunkSize, setupEvents.length);

      for (let i = startIndex; i < endIndex; i++) {
        setupEvents[i].setupEvent();
      }

      if (endIndex < setupEvents.length) {
        requestAnimationFrame(() => processEventChunk(endIndex));
      }
    }

    if (setupEvents.length > 0) {
      requestAnimationFrame(() => processEventChunk(0));
    }

    const endTime = performance.now();
    console.log(`最適化バッチ処理完了: ${window.batchOperations.length}件 (${(endTime - startTime).toFixed(2)}ms)`);

    window.batchOperations = [];
  }

  function finishModeSwitch() {
    const button = document.getElementById('mode-toggle-btn');

    // 少し遅延を入れてみる
    setTimeout(() => {
      hideLoadingPopup();

      // ボタンを有効化
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';

      console.log(`${isPlanMode ? '計画' : '通常'}モード切り替え完了`);
    }, 500); // 0.5秒の最小表示時間を確保
  }

  /**
   * チケットカウンター表示エリアを作成
   */
  function createTicketCounter() {
    const existingCounter = document.getElementById('ticket-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    const counter = document.createElement('div');
    counter.id = 'ticket-counter';
    counter.style.cssText = `
        position: fixed;
        inset: auto 1.5rem 1.5rem auto;
        background-color: #ffffffee;
        border: 1px solid #007bff;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        font-size: 0.95rem;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(6px);
        color: #333;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        display: flex;
        gap: 1rem;
        align-items: center;
        max-width: 95vw;
        white-space: nowrap;
    `;

    // 初期状態で4つ全て表示
    counter.innerHTML = `
        <div>Nチケ：0</div>
        <div>福チケ：0</div>
        <div>Gチケ：0</div>
        <div>イベチケ：0↑</div>
    `;
    document.body.appendChild(counter);
  }

  /**
   * aタグをspanに変換（計画モード用）
   */
  /**
 * aタグをspanに変換（計画モード用）
 */
function convertLinksToSpans() {
  const allLinks = document.querySelectorAll('table a');

  // 全てのtdのイベントを無効化（イベガチャテーブル以外）
  const allTds = document.querySelectorAll('table td:not([id^="cat-"]):not([id^="guaranteed-"]):not([id^="ten-confirm-"])');
  allTds.forEach((td) => {
    td.removeAttribute('onclick');
    td.onclick = null;

    ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach((eventType) => {
      td.addEventListener(
        eventType,
        function (e) {
          if (!isPlanMode) return;
          // イベガチャテーブル内のクリックは除外
          if (e.target.closest('.custom-table-container')) return;

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        },
        true
      );
    });
  });

  allLinks.forEach((a, index) => {
    const span = document.createElement('span');
    span.textContent = a.textContent;
    span.className = a.className;
    span.style.cssText = a.style.cssText;
    span.dataset.originalHref = a.href;
    span.dataset.modeSwitch = 'true';
    a.parentNode.replaceChild(span, a);
  });
}

  /**
   * 計画モード用のテーブル処理
   */
  function processTableForPlanMode(table, tableIndex) {
    // 列インデックスとチケットタイプの対応を登録
    const ths = table.querySelectorAll('thead th');
    ticketColumnIndexMap[tableIndex] = {};

    ths.forEach((th, i) => {
      const text = th.textContent.trim();
      if (text.includes('ノーマルガチャ') || text.includes('猫目ガチャ') || text.includes('マタタビガチャ')) {
        ticketColumnIndexMap[tableIndex][i] = 'N';
      } else if (text.includes('福引ガチャG')) {
        ticketColumnIndexMap[tableIndex][i] = 'G';
      } else if (text.includes('福引ガチャ')) {
        ticketColumnIndexMap[tableIndex][i] = 'F';
      }
    });

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isRightTable = tableIndex === 1 || table.previousElementSibling?.tagName === 'TABLE';

    if (isRightTable) {
      // 右テーブルの処理
      let i = 0;
      while (i < rows.length) {
        const currentRow = rows[i];
        if (currentRow.querySelector('td[colspan]')) {
          i++;
          continue;
        }

        const upperRow = currentRow;
        const lowerRow = rows[i + 1];
        if (!upperRow || !lowerRow) {
          i++;
          continue;
        }

        const upperTds = Array.from(upperRow.querySelectorAll('td'));
        const lowerTds = Array.from(lowerRow.querySelectorAll('td'));

        lowerTds.forEach((td, tdIndex) => {
          const headerIndex = tdIndex + 1;
          const ticketType = ticketColumnIndexMap[tableIndex][headerIndex];
          if (!ticketType) return;

          const correspondingUpperTd = upperTds[tdIndex + 1];
          // バッチ処理に追加（DOM操作は後で一括実行）
          addToBatch(td, correspondingUpperTd, ticketType, tableIndex, i, tdIndex);
        });
        i += 2;
      }
    } else {
      // 左テーブルの処理
      for (let i = 0; i < rows.length; i += 2) {
        const upperRow = rows[i];
        const lowerRow = rows[i + 1];
        if (!upperRow || !lowerRow) continue;

        const upperTds = Array.from(upperRow.querySelectorAll('td'));
        const lowerTds = Array.from(lowerRow.querySelectorAll('td'));

        lowerTds.forEach((td, tdIndex) => {
          const headerIndex = tdIndex + 1;
          const ticketType = ticketColumnIndexMap[tableIndex][headerIndex];
          if (!ticketType) return;

          const correspondingUpperTd = upperTds[tdIndex + 1];
          // バッチ処理に追加
          addToBatch(td, correspondingUpperTd, ticketType, tableIndex, i / 2, tdIndex);
        });
      }
    }
  }
  /**
   * バッチ処理キューに追加
   */
  function addToBatch(lowerTd, upperTd, ticketType, tableIndex, rowPairIndex, tdIndex) {
    // 新しい要素を事前に作成
    const newLowerTd = lowerTd.cloneNode(true);
    let newUpperTd = upperTd ? upperTd.cloneNode(true) : null;

    // データ属性を設定
    newLowerTd.dataset.ticketType = ticketType;
    newLowerTd.dataset.planMode = 'true';
    if (newUpperTd) {
      newUpperTd.dataset.ticketType = ticketType;
      newUpperTd.dataset.planMode = 'true';
    }

    // イベント設定関数を事前に準備
    const setupEvent = () => {
      setupEventForBatchedElement(newLowerTd, newUpperTd, ticketType, tableIndex, rowPairIndex, tdIndex);
    };

    // バッチキューに追加
    window.batchOperations.push({ oldElement: lowerTd, newElement: newLowerTd, setupEvent });

    if (upperTd && newUpperTd) {
      window.batchOperations.push({ oldElement: upperTd, newElement: newUpperTd, setupEvent: null });
    }
  }
  /**
   * バッチ処理後のイベント設定
   */
  function setupEventForBatchedElement(newLowerTd, newUpperTd, ticketType, tableIndex, rowPairIndex, tdIndex) {
    // アイコンのイベント設定
    const icon = newLowerTd.querySelector('.custom-icon');
    if (icon) {
      const row = newLowerTd.closest('tr');
      const tbody = row.closest('tbody');
      const allRows = Array.from(tbody.querySelectorAll('tr'));
      const currentRowIndex = allRows.indexOf(row);

      const shouldHaveIcon =
        (tableIndex === 0 && currentRowIndex % 2 === 1) || (tableIndex === 1 && currentRowIndex % 2 === 0);

      if (shouldHaveIcon) {
        const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];
        const text = newLowerTd.textContent.trim();
        const matchedText = targetTexts.find((target) => text === target || text === target + '⭐');

        if (matchedText) {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const currentSeed = getCurrentSeedFromURL();
            const steps = currentRowIndex + 1;
            const advancedSeed = advanceSeed(currentSeed, steps);
            const tr = newLowerTd.closest('tr');
            const tdIndex = Array.from(tr.querySelectorAll('td')).indexOf(newLowerTd);
            const adjustedTdIndex = Math.max(tdIndex, 0);
            const thValue = getThValue(tableIndex, adjustedTdIndex + 1);

            let slotInfo = null;
            if (gachaSlots[thValue]) {
              slotInfo = calculateSlot(advancedSeed, thValue);
            }

            const actualRowNumber = Math.floor(currentRowIndex / 2) + 1;
            const totalSteps = slotInfo ? currentRowIndex + slotInfo.repeatCount : actualRowNumber;
            const nextTableNumber = Math.ceil(totalSteps / 2) + 1;
            const nextTableSuffix = totalSteps % 2 === 0 ? 'B' : 'A';
            const nextTablePosition = `${nextTableNumber}${nextTableSuffix}`;

            const message = `■レア被り時の移動先\n排出：${slotInfo?.finalSlot || '不明'}\n次のテーブル位置：${nextTablePosition}`;
            showModernPopup(message, icon);
          });
        }
      } else {
        icon.remove();
      }
    }

    // セルクリックイベント設定
    const handleCellClick = (e) => {
      if (!isPlanMode || e.target.classList.contains('custom-icon')) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const isSelected = newLowerTd.classList.contains('selected-td');
      ticketCounts[ticketType] += isSelected ? -1 : 1;

      newLowerTd.classList.toggle('selected-td', !isSelected);
      if (newUpperTd) {
        newUpperTd.classList.toggle('selected-td-top', !isSelected);
      }

      // デバウンス処理で更新を最適化
      debouncedUpdateAfterSelection();
    };

    [newLowerTd, newUpperTd].forEach((td) => {
      if (!td) return;
      td.style.cursor = 'pointer';
      td.addEventListener('click', handleCellClick, { capture: true });
    });
  }

  // デバウンス処理を追加

  function debouncedUpdateAfterSelection() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(() => {
      updateTicketDisplay();
      updateSpecialItemColors();
      checkForChanges();
    }, 16); // 約60fps相当
  }



  /**
   * イベガチャを有効化するPromise
   */
  async function enableEventGacha() {
    if (isEventGachaProcessing) {
      console.log('イベガチャ処理中のため待機');
      return false;
    }

    isEventGachaProcessing = true;
    console.log('イベガチャ有効化開始');

    try {
      // チェックボックスの準備完了を待機
      if (!eventGachaCheckboxReady) {
        await waitForElement('#event-gacha-checkbox');
      }

      const eventCheckbox = document.getElementById('event-gacha-checkbox');
      if (!eventCheckbox) {
        throw new Error('イベガチャチェックボックスが見つかりません');
      }

      // チェックボックスを有効にする
      eventCheckbox.checked = true;
      isEventGachaEnabled = true;

      // changeイベントを発火
      const changeEvent = new Event('change', { bubbles: true });
      eventCheckbox.dispatchEvent(changeEvent);

      // イベガチャ列の作成完了を待機
      await waitForEventGachaColumn();

      // console.log('イベガチャ有効化完了');
      return true;
    } catch (error) {
      console.error('イベガチャ有効化エラー:', error);
      return false;
    } finally {
      isEventGachaProcessing = false;
    }
  }

  /**
   * イベガチャチェックボックス変更時の処理
   */
  function setupEventGachaCheckbox() {
    const eventGachaCheckbox = document.getElementById('event-gacha-checkbox');
    if (!eventGachaCheckbox) return;

    // 既存のイベントを削除
    eventGachaCheckbox.removeEventListener('change', handleEventGachaChange);

    // 新しいイベントを追加
    eventGachaCheckbox.addEventListener('change', handleEventGachaChange);
  }
  /**
   * イベガチャチェックボックス変更ハンドラ
   */
// ==================== 通常モード用イベガチャチェックボックス機能 ====================

/**
 * 通常モード・計画モード両方でイベガチャチェックボックスを追加
 */
/**
 * 通常モード・計画モード両方でイベガチャチェックボックスを追加
 */
async function addEventGachaCheckbox() {
    // 既存のチェックボックスが存在する場合は何もしない
    if (document.getElementById('event-gacha-checkbox')) {
        eventGachaCheckboxReady = true;
        return;
    }

    try {
        // バナーコンテナを待機
        const bannersContainer = document.querySelectorAll('h6.MuiTypography-root.MuiTypography-subtitle2.css-c7dfze')[2];
        if (!bannersContainer) {
            throw new Error('バナーコンテナが見つかりません');
        }

        const checkboxContainer = bannersContainer.nextElementSibling;
        if (!checkboxContainer) {
            throw new Error('チェックボックスコンテナが見つかりません');
        }

        // イベガチャのチェックボックスを作成
        const eventGachaLabel = document.createElement('label');
        eventGachaLabel.style.cssText = 'display: flex; align-items: center;';

        const eventGachaCheckbox = document.createElement('input');
        eventGachaCheckbox.type = 'checkbox';
        eventGachaCheckbox.id = 'event-gacha-checkbox';
        eventGachaCheckbox.style.cssText = 'margin-right: 8px; width: 20px; height: 20px;';

        const eventGachaText = document.createElement('p');
        eventGachaText.className = 'MuiTypography-root MuiTypography-body1 css-9l3uo3';
        eventGachaText.textContent = 'イベガチャ';

        eventGachaLabel.appendChild(eventGachaCheckbox);
        eventGachaLabel.appendChild(eventGachaText);
        checkboxContainer.appendChild(eventGachaLabel);

        // 初期状態は常にオフ
        eventGachaCheckbox.checked = false;
        isEventGachaEnabled = false;

        // イベント設定
        setupEventGachaCheckbox();

        eventGachaCheckboxReady = true;
    } catch (error) {
        console.error('イベガチャチェックボックス作成エラー:', error);
        eventGachaCheckboxReady = false;
    }
}

/**
 * イベガチャチェックボックス変更ハンドラ（通常・計画モード共通）
 */
function handleEventGachaChange() {
    const checkbox = document.getElementById('event-gacha-checkbox');
    if (!checkbox) return;

    isEventGachaEnabled = checkbox.checked;
    console.log(`イベガチャ状態変更: ${isEventGachaEnabled} (モード: ${isPlanMode ? '計画' : '通常'})`);

    if (isEventGachaEnabled) {
        if (isPlanMode) {
            // 計画モード：列を追加し、状態を復元
            addEventGachaColumn();
            // 復元は必ず実行
            restoreHiddenEventGachaSelections();
            showEventGachaTable();
        } else {
            // 通常モード：イベガチャテーブルを表示

            showEventGachaTable();
        }
    } else {
        if (isPlanMode) {
            // 計画モード：現在の状態を必ず保存してから列を削除
            saveCurrentEventGachaSelections();
            removeEventGachaColumnOnly();
            hideEventGachaTable();
        } else {
            // 通常モード：イベガチャテーブルを非表示
            hideEventGachaTable();
        }
    }

    if (isPlanMode) {
        updateTicketDisplay();
        setTimeout(checkForChanges, 100);
    }
}


/**
 * 通常モード用：イベガチャテーブルを表示
 */
function showEventGachaTable() {
    // 既に表示されている場合は何もしない
    if (document.querySelector('.custom-table-container')) {
        return;
    }

    const mainContainer = document.querySelector('.css-o2j9ze');
    if (!mainContainer) {
        console.error('メインコンテナが見つかりません');
        return;
    }

    // 新しいカスタムテーブルコンテナを作成
    const customContainer = document.createElement('div');
    customContainer.className = 'custom-table-container';

    // タイトル行を作成（説明ボタン付き）
    const titleRow = document.createElement('div');
    titleRow.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        gap: 10px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'イベガチャテーブル(β版)';
    title.style.cssText = `
        margin: 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    `;

    // 説明ボタン（？マーク）
    const helpButton = document.createElement('button');
    helpButton.innerHTML = '?';
    helpButton.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgb(44, 62, 80) !important;
        color: white;
        border: none;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    `;

    helpButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#0056b3';
    });

    helpButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#007bff';
    });

    // 説明ボタンのクリックイベント
    helpButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showEventGachaHelp(this);
    });

    titleRow.appendChild(title);
    titleRow.appendChild(helpButton);

    // 入力セクション作成
    const inputSection = createInputSectionWithHistory();

    // カスタムテーブル作成
    const customTable = createCustomTable();

    // カスタムコンテナに要素を追加
    customContainer.appendChild(titleRow);
    customContainer.appendChild(inputSection);
    customContainer.appendChild(customTable);

    // メインコンテナにカスタムコンテナを追加
    mainContainer.appendChild(customContainer);

    // イベントリスナーを正しく設定
    setupEventGachaTableListeners();

    // 初期の履歴ボタン状態を設定
    seedHistory.updateButtons();

    console.log('イベガチャテーブルを表示しました');
}

/**
 * イベガチャテーブルの説明ポップアップを表示
 */
function showEventGachaHelp(targetElement) {
    const helpMessage = `■ イベガチャテーブルについて

【注意】
・β版であり数量限定アイテムには未対応です。
・今後の最新ガチャはアイテム配列が変更する可能性があります。

【基本機能】
・イベガチャのテーブル表示
・ガチャ被り時の移動先予測
・シード保存・履歴機能
・オリジナルガチャ配列設定

【各列の説明】
・#：テーブル位置
・A/B列：排出されるキャラクター
・単体確定A/B：確定ガチャでの排出キャラ
・10連時確定：10連ガチャ時の確定キャラ
`;

    showModernPopup(helpMessage, targetElement, { maxWidth: 400, time: 10000 });
}



/**
 * イベガチャテーブル専用のイベントリスナー設定（修正版）
 */
function setupEventGachaTableListeners() {
    console.log('イベガチャテーブル用イベントリスナー設定開始');

    // 検索ボタンのイベント
    const searchBtn = document.getElementById('custom-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const seed = document.getElementById('custom-seed').value.trim();
            const gacha = document.getElementById('custom-gacha').value;

            if (!seed) {
                alert('シードを入力してください');
                return;
            }

            if (!/^\d+$/.test(seed)) {
                alert('シードは数値で入力してください');
                return;
            }

            console.log('検索実行:', seed, gacha);
            window.currentGachaKey = gacha;
            updateTable(seed, gacha);
            seedHistory.add(seed, gacha);
        });
        console.log('検索ボタンにイベント設定完了');
    }

    // 保存ボタンのイベント
    const saveBtn = document.getElementById('save-seed');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveEventSeed);
        console.log('保存ボタンにイベント設定完了');
    }

    // 履歴ボタンのイベント
    const backBtn = document.getElementById('history-back');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            console.log('戻るボタンクリック');
            seedHistory.goBack();
        });
        console.log('戻るボタンにイベント設定完了');
    }

    const forwardBtn = document.getElementById('history-forward');
    if (forwardBtn) {
        forwardBtn.addEventListener('click', function() {
            console.log('進むボタンクリック');
            seedHistory.goForward();
        });
        console.log('進むボタンにイベント設定完了');
    }

    // ガチャ種変更のイベント
    const gachaSelect = document.getElementById('custom-gacha');
    if (gachaSelect) {
        gachaSelect.addEventListener('change', function() {
            const seed = document.getElementById('custom-seed').value.trim();
            window.currentGachaKey = this.value;
            if (seed) {
                updateTable(seed, window.currentGachaKey);
                seedHistory.add(seed, window.currentGachaKey);
            }
        });
        console.log('ガチャ選択にイベント設定完了');
    }

    // Enterキーでの検索
    const seedInput = document.getElementById('custom-seed');
    if (seedInput) {
        seedInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('custom-search').click();
            }
        });
        console.log('シード入力にEnterキーイベント設定完了');
    }

    // 動的に追加されるキャラクタークリック用のイベント委譲
    document.addEventListener('click', function(e) {
        // カスタムテーブル内のクリックのみ処理
        if (!e.target.closest('.custom-table-container')) return;

        // キャラクタークリック処理
        if (e.target.classList.contains('char-click')) {
            const charSeed = e.target.getAttribute('data-char-seed');
            if (charSeed) {
                document.getElementById('custom-seed').value = charSeed;
                updateTable(charSeed, window.currentGachaKey);
                seedHistory.add(charSeed, window.currentGachaKey);
            }
        }

        // nextキャラクタークリック処理
        if (e.target.classList.contains('next-char-click')) {
            const nextSeed = e.target.getAttribute('data-next-seed');
            if (nextSeed) {
                document.getElementById('custom-seed').value = nextSeed;
                updateTable(nextSeed, window.currentGachaKey);
                seedHistory.add(nextSeed, window.currentGachaKey);
            }
        }
    });

    console.log('イベガチャテーブル用イベントリスナー設定完了');
}


/**
 * 通常モード用：イベガチャテーブルを非表示
 */
function hideEventGachaTable() {
    const customContainer = document.querySelector('.custom-table-container');
    if (customContainer) {
        customContainer.remove();
        console.log('イベガチャテーブルを非表示にしました');
    }
}

  /**
   * 現在のイベガチャ選択項目を保存
   */
function saveCurrentEventGachaSelections() {
    // 既存の隠れた選択項目をベースとして保持
    const existingSelections = [...(hiddenEventGachaSelections || [])];

    // 現在表示されている選択項目を取得
    const currentSelections = [];

    document.querySelectorAll('.selected-event-td').forEach((td) => {
        const row = td.closest('tr');
        const table = td.closest('table');
        const tableIndex = Array.from(document.querySelectorAll('table')).indexOf(table);

        // 前の行（上の行）からペア番号を取得
        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));
        const currentRowIndex = allRows.indexOf(row);
        const prevRow = allRows[currentRowIndex - 1];
        const labelCell = prevRow ? prevRow.querySelector('td[rowspan]') : null;
        const labelText = labelCell ? labelCell.textContent.trim() : '';
        const pairNumber = labelText ? parseInt(labelText.match(/(\d+)/)?.[1]) : 0;

        if (pairNumber > 0) {
            const eventInfo = {
                tableIndex,
                pairNumber,
                selectedItem: td.textContent.trim(),
            };
            currentSelections.push(eventInfo);
        }
    });

    // 現在の選択項目で既存を更新
    currentSelections.forEach(current => {
        const existingIndex = existingSelections.findIndex(existing =>
            existing.tableIndex === current.tableIndex &&
            existing.pairNumber === current.pairNumber
        );

        if (existingIndex >= 0) {
            existingSelections[existingIndex] = current;
        } else {
            existingSelections.push(current);
        }
    });

    hiddenEventGachaSelections = existingSelections;
    console.log('イベガチャ選択項目を保存（改善版）:', hiddenEventGachaSelections);
}


  /**
   * 隠れていたイベガチャ選択項目を復元
   */
async function restoreHiddenEventGachaSelections() {
    if (!hiddenEventGachaSelections || hiddenEventGachaSelections.length === 0) {
        console.log('復元する隠れたイベガチャ選択項目がありません');
        return;
    }

    console.log('隠れていたイベガチャ選択項目を復元（改善版）:', hiddenEventGachaSelections);

    // 少し待ってからDOM操作を実行
    await new Promise(resolve => setTimeout(resolve, 100));

    // 現在表示されているテーブルの範囲を取得
    const tables = document.querySelectorAll('table');
    const visiblePairRanges = [];

    tables.forEach((table, tableIndex) => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const allRows = Array.from(tbody.querySelectorAll('tr'));
        let maxPairNumber = 0;

        allRows.forEach((row) => {
            const labelCell = row.querySelector('td[rowspan]');
            if (labelCell) {
                const labelText = labelCell.textContent.trim();
                const match = labelText.match(/(\d+)/);
                if (match) {
                    const pairNumber = parseInt(match[1]);
                    maxPairNumber = Math.max(maxPairNumber, pairNumber);
                }
            }
        });

        visiblePairRanges[tableIndex] = maxPairNumber;
    });

    let restoredCount = 0;

    hiddenEventGachaSelections.forEach((eventInfo, index) => {
        console.log(`イベガチャ復元試行 ${index}:`, eventInfo);

        // 表示範囲外のアイテムはスキップ
        if (eventInfo.pairNumber > visiblePairRanges[eventInfo.tableIndex]) {
            console.log(
                `表示範囲外のためスキップ: イベガチャペア${eventInfo.pairNumber} (最大表示: ${visiblePairRanges[eventInfo.tableIndex]})`
            );
            return;
        }

        const success = restoreSingleEventGachaSelection(eventInfo, tables);
        if (success) {
            restoredCount++;
        }
    });

    console.log(`イベガチャ復元完了: ${restoredCount}/${hiddenEventGachaSelections.length}件`);

    // チケットカウントを更新
    ticketCounts.E = restoredCount;
    updateTicketDisplay();
}
/**
 * 単一のイベガチャ選択項目を復元するヘルパー関数
 */
function restoreSingleEventGachaSelection(eventInfo, tables) {
    try {
        const table = tables[eventInfo.tableIndex];
        if (!table) {
            console.warn(`テーブル ${eventInfo.tableIndex} が見つかりません`);
            return false;
        }

        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // ペア番号から下の行を特定
        let targetLowerRow = null;

        if (eventInfo.tableIndex === 1) {
            // 右テーブルの処理
            const nonEmptyRows = allRows.filter((r) => !r.querySelector('td[colspan]'));
            const targetNonEmptyIndex = (eventInfo.pairNumber - 1) * 2 + 1;

            if (targetNonEmptyIndex < nonEmptyRows.length) {
                targetLowerRow = nonEmptyRows[targetNonEmptyIndex];
            }
        } else {
            // 左テーブルの処理
            const targetRowIndex = (eventInfo.pairNumber - 1) * 2 + 1;
            targetLowerRow = allRows[targetRowIndex];
        }

        if (!targetLowerRow) {
            console.warn(`対象の下行が見つかりません: ペア${eventInfo.pairNumber}`);
            return false;
        }

        const allTableRows = Array.from(tbody.querySelectorAll('tr'));
        const lowerRowIndex = allTableRows.indexOf(targetLowerRow);
        const targetUpperRow = allTableRows[lowerRowIndex - 1];

        if (!targetUpperRow) {
            console.warn(`対象の上行が見つかりません`);
            return false;
        }

        // イベガチャセルを取得
        const lowerEventCell = targetLowerRow.querySelector('td[data-event-gacha="true"][data-cell-type="lower"]');
        const upperEventCell = targetUpperRow.querySelector('td[data-event-gacha="true"][data-cell-type="upper"]');

        if (lowerEventCell && upperEventCell) {
            // セル内容と状態を設定
            lowerEventCell.textContent = eventInfo.selectedItem;
            upperEventCell.textContent = '←より先に引く';

            lowerEventCell.classList.add('selected-event-td');
            upperEventCell.classList.add('selected-event-td-top');

            // ボーダースタイルを設定
            upperEventCell.style.borderBottom = 'none';
            lowerEventCell.style.borderTop = 'none';

            console.log(`イベガチャ復元成功: ${eventInfo.selectedItem} (ペア${eventInfo.pairNumber})`);
            return true;
        } else {
            console.warn('イベガチャセルが見つかりません:', {
                lowerEventCell: !!lowerEventCell,
                upperEventCell: !!upperEventCell,
            });
            return false;
        }
    } catch (error) {
        console.error('イベガチャ復元エラー:', error, eventInfo);
        return false;
    }
}
  /**
   * イベガチャ列のみ削除（選択状態は保持）
   */
  function removeEventGachaColumnOnly() {
    // イベガチャヘッダーを削除
    document.querySelectorAll('th[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // イベガチャセルを削除
    document.querySelectorAll('td[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // 空行のcolspanを元に戻す
    const emptyRows = document.querySelectorAll('td.css-19m26or[data-original-colspan]');
    emptyRows.forEach((td) => {
      const originalColspan = td.dataset.originalColspan;
      if (originalColspan) {
        td.setAttribute('colspan', originalColspan);
        delete td.dataset.originalColspan;
      }
    });

    eventGachaColumnAdded = false;
    console.log('イベガチャ列を削除しました（カウントは保持）');
  }

  /**
   * イベガチャチェックボックスを削除
   */
  function removeEventGachaCheckbox() {
    const checkbox = document.getElementById('event-gacha-checkbox');
    if (checkbox) {
      checkbox.closest('label').remove();
    }
    isEventGachaEnabled = false;
    eventGachaColumnAdded = false;
    removeEventGachaColumn();
  }

  /**
   * テーブルにイベガチャ列を追加
   */
  function addEventGachaColumn() {
    if (eventGachaColumnAdded) return;

    const tables = document.querySelectorAll('.css-o2j9ze > table');

    tables.forEach((table, tableIndex) => {
      // ヘッダーに列を追加
      const thead = table.querySelector('thead tr');
      if (thead) {
        const eventHeader = document.createElement('th');
        eventHeader.className = 'css-12tmn22';
        eventHeader.textContent = 'イベガチャ';
        eventHeader.style.whiteSpace = 'nowrap';
        eventHeader.style.backgroundColor = '#2c3e50';
        eventHeader.style.color = 'white';
        eventHeader.style.fontWeight = '600';
        eventHeader.style.fontSize = '14px';
        eventHeader.style.padding = '14px 12px';
        eventHeader.style.textAlign = 'center';
        eventHeader.style.border = 'none';
        eventHeader.style.position = 'sticky';
        eventHeader.style.top = '0';
        eventHeader.style.zIndex = '1001';
        eventHeader.dataset.eventGacha = 'true';
        thead.appendChild(eventHeader);
      }

      // 既存の空行のcolspanを1増やす
      const emptyRows = table.querySelectorAll('td.css-19m26or[colspan]');
      emptyRows.forEach((td) => {
        const currentColspan = parseInt(td.getAttribute('colspan')) || 5;
        td.setAttribute('colspan', currentColspan + 1);
        // 元のcolspan値を保存
        if (!td.dataset.originalColspan) {
          td.dataset.originalColspan = currentColspan;
        }
      });

      // 各行に空のセルを追加
      const tbody = table.querySelector('tbody');
      if (tbody) {
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // テーブル構造を判定
        const isRightTable = tableIndex === 1 || table.previousElementSibling?.tagName === 'TABLE';

        if (isRightTable) {
          // 右テーブルの処理
          let i = 0;
          let pairIndex = 0;

          while (i < rows.length) {
            const currentRow = rows[i];

            // colspan のある行（空行）をスキップ
            if (currentRow.querySelector('td[colspan]')) {
              i++;
              continue;
            }

            const upperRow = currentRow;
            const lowerRow = rows[i + 1];

            if (!upperRow || !lowerRow) {
              i++;
              continue;
            }

            // 上のセル
            const upperEventCell = document.createElement('td');
            upperEventCell.className = 'css-159psa';
            upperEventCell.innerHTML = '&nbsp;';
            upperEventCell.dataset.eventGacha = 'true';
            upperEventCell.dataset.tableIndex = tableIndex;
            upperEventCell.dataset.pairIndex = pairIndex;
            upperEventCell.dataset.cellType = 'upper';
            upperEventCell.style.backgroundColor = 'white';
            upperEventCell.style.borderBottom = 'none';
            upperRow.appendChild(upperEventCell);

            // 下のセル
            const lowerEventCell = document.createElement('td');
            lowerEventCell.className = 'css-159psa';
            lowerEventCell.innerHTML = '&nbsp;';
            lowerEventCell.dataset.eventGacha = 'true';
            lowerEventCell.dataset.tableIndex = tableIndex;
            lowerEventCell.dataset.pairIndex = pairIndex;
            lowerEventCell.dataset.cellType = 'lower';
            lowerEventCell.style.backgroundColor = 'white';
            lowerEventCell.style.borderTop = 'none';
            lowerRow.appendChild(lowerEventCell);

            // イベント設定
            setupEventGachaCellClick(upperEventCell, lowerEventCell, tableIndex, pairIndex);
            setupEventGachaCellClick(lowerEventCell, upperEventCell, tableIndex, pairIndex);

            i += 2;
            pairIndex++;
          }
        } else {
          // 左テーブルの処理
          let pairIndex = 0;

          for (let i = 0; i < rows.length; i += 2) {
            const upperRow = rows[i];
            const lowerRow = rows[i + 1];

            if (!upperRow || !lowerRow) continue;

            // 上のセル
            const upperEventCell = document.createElement('td');
            upperEventCell.className = 'css-159psa';
            upperEventCell.innerHTML = '&nbsp;';
            upperEventCell.dataset.eventGacha = 'true';
            upperEventCell.dataset.tableIndex = tableIndex;
            upperEventCell.dataset.pairIndex = pairIndex;
            upperEventCell.dataset.cellType = 'upper';
            upperEventCell.style.backgroundColor = 'white';
            upperEventCell.style.borderBottom = 'none';
            upperRow.appendChild(upperEventCell);

            // 下のセル
            const lowerEventCell = document.createElement('td');
            lowerEventCell.className = 'css-159psa';
            lowerEventCell.innerHTML = '&nbsp;';
            lowerEventCell.dataset.eventGacha = 'true';
            lowerEventCell.dataset.tableIndex = tableIndex;
            lowerEventCell.dataset.pairIndex = pairIndex;
            lowerEventCell.dataset.cellType = 'lower';
            lowerEventCell.style.backgroundColor = 'white';
            lowerEventCell.style.borderTop = 'none';
            lowerRow.appendChild(lowerEventCell);

            // イベント設定
            setupEventGachaCellClick(upperEventCell, lowerEventCell, tableIndex, pairIndex);
            setupEventGachaCellClick(lowerEventCell, upperEventCell, tableIndex, pairIndex);

            pairIndex++;
          }
        }
      }

      // チケットカラムマップを更新
      const headerCount = table.querySelectorAll('thead th').length;
      ticketColumnIndexMap[tableIndex][headerCount - 1] = 'E';
    });

    eventGachaColumnAdded = true;
    updateTicketDisplay();
  }

  /**
   * テーブルからイベガチャ列を削除
   */
  function removeEventGachaColumn() {
    // イベガチャヘッダーを削除
    document.querySelectorAll('th[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // イベガチャセルを削除
    document.querySelectorAll('td[data-event-gacha="true"]').forEach((element) => {
      element.remove();
    });

    // 空行のcolspanを元に戻す
    const emptyRows = document.querySelectorAll('td.css-19m26or[data-original-colspan]');
    emptyRows.forEach((td) => {
      const originalColspan = td.dataset.originalColspan;
      if (originalColspan) {
        td.setAttribute('colspan', originalColspan);
        delete td.dataset.originalColspan;
      }
    });

    // チケットカウントをリセット
    ticketCounts.E = 0;
    updateTicketDisplay();

    eventGachaColumnAdded = false;
  }
  /**
   * イベガチャセルのクリックイベントを設定
   */
  function setupEventGachaCellClick(clickedCell, pairedCell, tableIndex, pairIndex) {
    clickedCell.style.cursor = 'pointer';

    clickedCell.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const lowerCell = clickedCell.dataset.cellType === 'lower' ? clickedCell : pairedCell;
      const upperCell = clickedCell.dataset.cellType === 'upper' ? clickedCell : pairedCell;

      const currentText = lowerCell.textContent.trim();

      if (currentText !== '' && currentText !== '\u00A0') {
        lowerCell.innerHTML = '&nbsp;';
        upperCell.innerHTML = '&nbsp;';

        upperCell.classList.remove('selected-event-td-top');
        lowerCell.classList.remove('selected-event-td');
        upperCell.style.backgroundColor = 'white';
        lowerCell.style.backgroundColor = 'white';
        upperCell.style.borderBottom = 'none';
        lowerCell.style.borderTop = 'none';

        ticketCounts.E -= 1;
        updateTicketDisplay();

        // 変更を検知
        setTimeout(checkForChanges, 100);
        return;
      }

      showEventGachaOptions(clickedCell, upperCell, lowerCell, tableIndex, pairIndex);
    });
  }
  /**
   * イベガチャ選択肢ポップアップを表示
   */
  function showEventGachaOptions(targetCell, upperCell, lowerCell, tableIndex, pairIndex) {
    // 既存のポップアップを削除
    const existingPopup = document.querySelector('.event-gacha-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];

    // ポップアップを作成
    const popup = document.createElement('div');
    popup.className = 'event-gacha-popup';
    popup.style.cssText = `
        position: absolute;
        background: #2c3e50;
        color: white;
        border: 1px solid #34495e;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10002;
        padding: 16px;
        min-width: 220px;
        font-family: 'Segoe UI', Arial, sans-serif;
        backdrop-filter: blur(10px);
    `;

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 4px;
        right: 8px;
        background: none;
        border: none;
        color: #ecf0f1;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 3px;
        transition: background-color 0.2s;
    `;

    closeButton.addEventListener('mouseenter', function () {
      this.style.backgroundColor = 'rgba(231, 76, 60, 0.8)';
    });

    closeButton.addEventListener('mouseleave', function () {
      this.style.backgroundColor = 'transparent';
    });

    closeButton.addEventListener('click', function (e) {
      e.stopPropagation();
      popup.remove();
    });

    // ボタンコンテナ（2×2レイアウト）
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
        padding-right: 20px;
    `;

    // 各選択肢のボタンを作成
    targetTexts.forEach((text) => {
      const optionButton = document.createElement('button');
      optionButton.textContent = text;
      optionButton.style.cssText = `
            padding: 12px 16px;
            border: 1px solid #4a5568;
            background: #4a5568;
            color: white;
            cursor: pointer;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

      optionButton.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#5a6578';
        this.style.borderColor = '#5a6578';
      });

      optionButton.addEventListener('mouseleave', function () {
        this.style.backgroundColor = '#4a5568';
        this.style.borderColor = '#4a5568';
      });

      optionButton.addEventListener('click', function () {
        // 上のセル
        upperCell.textContent = '←より先に引く';

        // 下のセル
        lowerCell.textContent = text;

        // 両方のセルをイベガチャ専用クラス設定
        upperCell.classList.add('selected-event-td-top');
        lowerCell.classList.add('selected-event-td');

        // 中間のボーダーを消す
        upperCell.style.borderBottom = 'none';
        lowerCell.style.borderTop = 'none';

        // チケットカウントを増加
        ticketCounts.E += 1;
        updateTicketDisplay();

        setTimeout(checkForChanges, 100);

        // ポップアップを閉じる
        popup.remove();
      });

      buttonContainer.appendChild(optionButton);
    });

    // 注意書きコンテナ
    const noteContainer = document.createElement('div');
    noteContainer.style.cssText = `
        border-top: 1px solid #4a5568;
        padding-top: 12px;
        font-size: 12px;
        line-height: 1.4;
        color: #bdc3c7;
        text-align: left;
    `;
    noteContainer.innerHTML = `
        イベガチャでノマロのシードは進みません。<br>レア被り判定のみ共有
    `;

    // 要素を組み立て
    popup.appendChild(closeButton);
    popup.appendChild(buttonContainer);
    popup.appendChild(noteContainer);

    // まず一時的にDOMに追加してサイズを取得
    popup.style.visibility = 'hidden';
    document.body.appendChild(popup);

    // ポップアップの位置を計算
    const targetRect = targetCell.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // 基本位置：クリックしたセルの右下
    let left = targetRect.right + 10;
    let top = targetRect.top;

    // 画面右端を超える場合は左側に表示
    if (left + popupRect.width > window.innerWidth - 10) {
      left = targetRect.left - popupRect.width - 10;
    }

    // 画面下端を超える場合は上にずらす
    if (top + popupRect.height > window.innerHeight - 10) {
      top = window.innerHeight - popupRect.height - 10;
    }

    // 画面上端を超えないように調整
    if (top < 10) {
      top = 10;
    }

    // 画面左端を超えないように調整
    if (left < 10) {
      left = 10;
    }

    // スクロール位置を考慮して最終位置を設定
    popup.style.left = `${left + scrollX}px`;
    popup.style.top = `${top + scrollY}px`;
    popup.style.visibility = 'visible';

    // 外部クリックで閉じる
    const handleOutsideClick = (e) => {
      if (!popup.contains(e.target) && e.target !== targetCell) {
        popup.remove();
        document.removeEventListener('click', handleOutsideClick);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  }

  /**
   * メモリリーク防止のためのクリーンアップ処理
   */
  function cleanupEventListeners() {
    // 既存のイベントリスナーをクリア
    document.querySelectorAll('td[data-plan-mode]').forEach((td) => {
      const newTd = td.cloneNode(true);
      td.parentNode.replaceChild(newTd, td);
    });

    // グローバル変数のクリーンアップ
    if (window.batchOperations) {
      window.batchOperations.length = 0;
    }

    // タイムアウトのクリーンアップ
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }

    console.log('イベントリスナーとメモリをクリーンアップ完了');
  }

  /**
   * 計画モードを終了
   */
function exitPlanModeWithLoading() {
    // *** 改善：計画モードでのイベガチャ状態を保存 ***
    const wasEventGachaEnabledInPlan = isEventGachaEnabled;

    cleanupEventListeners();

    const routeManagementContainer = document.getElementById('route-management-container');
    if (routeManagementContainer) {
        routeManagementContainer.remove();
    }

    const counter = document.getElementById('ticket-counter');
    if (counter) {
        counter.remove();
    }

    // *** 改善：イベガチャ列の削除 ***
    if (wasEventGachaEnabledInPlan) {
        removeEventGachaColumnOnly();
    }

    // *** 改善：チェックボックスは削除せず、状態のみ保持 ***
    const eventCheckbox = document.getElementById('event-gacha-checkbox');
    if (eventCheckbox) {
        // 計画モードでの状態を保持
        eventCheckbox.checked = wasEventGachaEnabledInPlan;
        isEventGachaEnabled = wasEventGachaEnabledInPlan;

        console.log(`通常モード復帰時のイベガチャ状態: ${wasEventGachaEnabledInPlan}`);
    }

    requestAnimationFrame(() => {
        const spans = document.querySelectorAll('span[data-mode-switch]');
        spans.forEach((span) => {
            const a = document.createElement('a');
            a.textContent = span.textContent;
            a.className = span.className;
            a.style.cssText = span.style.cssText;
            a.href = span.dataset.originalHref;
            span.parentNode.replaceChild(a, span);
        });

        document.querySelectorAll('.special-item-selected').forEach((element) => {
            element.classList.remove('special-item-selected');
        });

        requestAnimationFrame(() => {
            const planModeTds = document.querySelectorAll('td[data-plan-mode]');
            planModeTds.forEach((td) => {
                td.classList.remove('selected-td', 'selected-td-top');
                td.removeAttribute('data-plan-mode');
                td.removeAttribute('data-ticket-type');

                const newTd = td.cloneNode(true);
                td.parentNode.replaceChild(newTd, td);
            });

            const allTds = document.querySelectorAll('table td');
            allTds.forEach((td) => {
                const newTd = td.cloneNode(true);
                td.parentNode.replaceChild(newTd, td);
            });

            requestAnimationFrame(() => {
                restoreIconEvents();

                // *** 改善：通常モードに戻った時の処理 ***
                if (wasEventGachaEnabledInPlan) {
                    // イベガチャが有効だった場合はテーブルを表示
                    setTimeout(() => {
                        showEventGachaTable();
                    }, 100);
                } else {
                    // イベガチャが無効だった場合はテーブルを非表示
                    hideEventGachaTable();
                }

                hasUnsavedChanges = false;
                lastSavedState = null;
                hiddenEventGachaSelections = [];

                finishModeSwitch();
            });
        });
    });
}

  /**
   * 星マークアイコンのイベントを復元（通常モード用）
   */
  function restoreIconEvents() {
    // console.log('星マークイベント復元開始');
    const targetTexts = ['1万XP', '3万XP', 'ニャンピュ', 'スピダ'];
    let restoredCount = 0;

    const tables = document.querySelectorAll('table');

    tables.forEach((table, tableIndex) => {
      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.forEach((row, rowIndex) => {
        // 左テーブルは奇数行、右テーブルは偶数行が対象
        let shouldHaveIcon = false;
        if (tableIndex === 0 && rowIndex % 2 === 1) {
          shouldHaveIcon = true;
        } else if (tableIndex === 1 && rowIndex % 2 === 0) {
          shouldHaveIcon = true;
        }

        if (!shouldHaveIcon) return;

        const tds = row.querySelectorAll('td');
        tds.forEach((td, tdIndex) => {
          const text = td.textContent.trim();
          const matchedText = targetTexts.find((target) => text === target || text === target + '⭐');

          if (matchedText) {
            // 既存のアイコンを確認
            let icon = td.querySelector('.custom-icon');

            if (!icon) {
              // アイコンが存在しない場合は作成
              icon = document.createElement('span');
              icon.textContent = '⭐';
              icon.className = 'custom-icon';
              icon.style.cssText = `
                                margin-left: 5px;
                                cursor: pointer;
                                font-size: 16px;
                                color: #ffd700;
                                user-select: none;
                                display: inline-block;
                                z-index: 1000;
                                position: relative;
                            `;
              td.appendChild(icon);
            }

            // イベントリスナーを再設定（通常モード用）
            // 既存のイベントをクリア
            const newIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(newIcon, icon);

            newIcon.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();

              const currentSeed = getCurrentSeedFromURL();
              let steps = rowIndex + 1;
              const advancedSeed = advanceSeed(currentSeed, steps);
              const thValue = getThValue(tableIndex, tdIndex + 1);

              let slotInfo = null;
              if (gachaSlots[thValue]) {
                slotInfo = calculateSlot(advancedSeed, thValue);
              }

              const actualRowNumber = Math.floor(rowIndex / 2) + 1;
              const totalSteps = slotInfo ? rowIndex + slotInfo.repeatCount : actualRowNumber;
              const nextTableNumber = Math.ceil(totalSteps / 2) + 1;
              const nextTableSuffix = totalSteps % 2 === 0 ? 'B' : 'A';
              const nextTablePosition = `${nextTableNumber}${nextTableSuffix}`;

              let message = `■レア被り時の移動先`;
              message += `\n排出：${slotInfo?.finalSlot || '不明'}`;
              message += `\n次のテーブル位置：${nextTablePosition}`;

              showModernPopup(message, newIcon);
            });

            restoredCount++;
            //console.log(`星マークイベント復元: ${matchedText}, テーブル${tableIndex}, 行${rowIndex}`);
          }
        });
      });
    });

    // console.log(`星マークイベント復元完了: ${restoredCount}個のアイコン`);
  }

  /**
   * チケットカウント表示を更新
   */
  function updateTicketDisplay() {
    const counter = document.getElementById('ticket-counter');
    if (counter) {
      // 常に4つ表示（イベガチャの状態に関係なく）
      const children = counter.children;

      if (children.length >= 4) {
        children[0].textContent = `Nチケ：${ticketCounts.N}`;
        children[1].textContent = `福チケ：${ticketCounts.F}`;
        children[2].textContent = `Gチケ：${ticketCounts.G}`;
        children[3].textContent = `イベチケ：${ticketCounts.E}↑`;
      } else {
        // 要素が不足している場合は再作成
        counter.innerHTML = `
                <div>Nチケ：${ticketCounts.N}</div>
                <div>福チケ：${ticketCounts.F}</div>
                <div>Gチケ：${ticketCounts.G}</div>
                <div>イベチケ：${ticketCounts.E}↑</div>
            `;
      }
      //   console.log('カウンター更新:', ticketCounts);
    } else {
      console.log('カウンターが見つかりません');
    }
  }

  // ==================== 計画モード保存機能 ====================

  /**
   * 計画データをローカルストレージに保存
   */
  function savePlanData(seed, planData, showConfirm = true) {
    let savedPlans = getSavedPlanData();

    // 既存データの確認
    const existingData = savedPlans[seed];
    if (existingData && showConfirm) {
      if (!confirm(`シード "${seed}" のルートデータが既に存在します。上書きしますか？`)) {
        return false;
      }
    }

    // 新しいデータを追加
    savedPlans[seed] = {
      ...planData,
      savedAt: new Date().toISOString(),
    };

    // 件数制限チェック
    const seedKeys = Object.keys(savedPlans);
    if (seedKeys.length > MAX_SAVED_SEEDS) {
      const sortedSeeds = seedKeys.sort((a, b) => {
        return new Date(savedPlans[a].savedAt) - new Date(savedPlans[b].savedAt);
      });

      const toDelete = sortedSeeds.slice(0, seedKeys.length - MAX_SAVED_SEEDS);
      toDelete.forEach((seedToDelete) => {
        delete savedPlans[seedToDelete];
      });

      if (toDelete.length > 0) {
        console.log(`容量制限により${toDelete.length}件の古いデータを削除しました`);
      }
    }

    try {
      localStorage.setItem(PLAN_DATA_STORAGE_KEY, JSON.stringify(savedPlans));

      // 保存成功をマーク
      hasUnsavedChanges = false;
      lastSavedState = JSON.stringify(getCurrentPlanState());
      updateSaveButtonState(); // ボタン状態を即座に更新

      if (showConfirm) {
        alert(`シード "${seed}" のルートを保存しました\n※キャッシュの削除やシークレットモードの利用では保存維持されません。`);
      }

      //   console.log('保存完了:', seed, planData);
      return true;
    } catch (error) {
      console.error('保存エラー:', error);
      if (showConfirm) {
        alert('保存に失敗しました');
      }
      return false;
    }
  }

  /**
   * 保存済み計画データを取得
   */
  function getSavedPlanData() {
    const saved = localStorage.getItem(PLAN_DATA_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  }

  /**
   * ルート管理ボタンを作成（横並び3つ）
   */
  function createRouteManagementButtons() {
    // 既存のボタンを削除
    document.getElementById('save-route-btn')?.remove();
    document.getElementById('delete-route-btn')?.remove();
    document.getElementById('inherit-route-btn')?.remove();

    // ボタンコンテナを作成
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'route-management-container';
    buttonContainer.style.cssText = `
        position: fixed;
        top: 60px;
        right: 12px;
        z-index: 10000;
        display: flex;
        gap: 8px;
        font-family: inherit;
    `;

    // ルート削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.id = 'delete-route-btn';
    deleteButton.textContent = 'ルートを削除';
    deleteButton.style.cssText = `
        padding: 8px 16px;
        background-color: #dc3545;
        color: white;
        font-size: 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    deleteButton.onclick = clearCurrentRoute;

    // ルート継承ボタン
    const inheritButton = document.createElement('button');
    inheritButton.id = 'inherit-route-btn';
    inheritButton.textContent = 'ルートを継承';
    inheritButton.style.cssText = `
        padding: 8px 16px;
        background-color: #17a2b8;
        color: white;
        font-size: 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    inheritButton.onclick = () => {
      if (hasUnsavedChanges) {
        alert('未保存の変更があります。先にルートを保存してください。');
        return;
      }
      showInheritRouteDialog();
    };

    // ルート保存ボタン
    const saveButton = document.createElement('button');
    saveButton.id = 'save-route-btn';
    saveButton.textContent = 'ルートを保存';
    saveButton.style.cssText = `
        padding: 8px 16px;
        background-color: #28a745;
        color: white;
        font-size: 14px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `;
    saveButton.onclick = () => {
      const currentSeed = getCurrentSeed();
      if (currentSeed && isPlanMode) {
        const planData = getCurrentPlanState();
        if (planData) {
          savePlanData(currentSeed, planData);
        } else {
          alert('保存する計画データがありません');
        }
      } else {
        alert('計画モードでない、またはシードが取得できません');
      }
    };

    // ボタンをコンテナに追加
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(inheritButton);
    buttonContainer.appendChild(saveButton);

    // コンテナをページに追加
    document.body.appendChild(buttonContainer);

    // 継承ボタンの状態を更新
    updateInheritButtonState();
  }

  /**
   * 継承ボタンの状態を更新
   */
  function updateInheritButtonState() {
    const inheritButton = document.getElementById('inherit-route-btn');
    if (inheritButton) {
      if (hasUnsavedChanges) {
        inheritButton.style.backgroundColor = '#6c757d';
        inheritButton.style.cursor = 'not-allowed';
        inheritButton.style.opacity = '0.6';
      } else {
        inheritButton.style.backgroundColor = '#17a2b8';
        inheritButton.style.cursor = 'pointer';
        inheritButton.style.opacity = '1';
      }
    }
  }

  /**
   * 保存ボタンの状態を更新（継承ボタン状態も更新）
   */
  function updateSaveButtonState() {
    const saveButton = document.getElementById('save-route-btn');
    if (saveButton) {
      if (hasUnsavedChanges) {
        saveButton.style.backgroundColor = '#ff6b35';
        saveButton.textContent = 'ルートを保存 (未保存)';
      } else {
        saveButton.style.backgroundColor = '#28a745';
        saveButton.textContent = 'ルートを保存';
      }
    }

    // 継承ボタンの状態も更新
    updateInheritButtonState();
  }

  /**
   * 現在のルートを削除（表示上のみ、キャッシュは保持）
   */
  function clearCurrentRoute() {
    if (!isPlanMode) {
      alert('計画モードではありません');
      return;
    }

    if (confirm('現在選択している項目をすべて削除しますか？')) {
      // 選択状態をクリア
      document.querySelectorAll('.selected-td').forEach((td) => {
        td.classList.remove('selected-td');
        td.removeAttribute('data-ticket-type');
      });

      document.querySelectorAll('.selected-td-top').forEach((td) => {
        td.classList.remove('selected-td-top');
        td.removeAttribute('data-ticket-type');
      });

      // イベガチャの選択もクリア
      document.querySelectorAll('.selected-event-td').forEach((td) => {
        td.classList.remove('selected-event-td');
        td.innerHTML = '&nbsp;';
      });

      document.querySelectorAll('.selected-event-td-top').forEach((td) => {
        td.classList.remove('selected-event-td-top');
        td.innerHTML = '&nbsp;';
        td.style.backgroundColor = 'white';
        td.style.borderBottom = 'none';
      });

      // チケットカウントをリセット
      ticketCounts = { N: 0, F: 0, G: 0, E: 0 };
      updateTicketDisplay();
      updateSpecialItemColors();

      // 変更状態を更新
      setTimeout(checkForChanges, 100);

      console.log('ルート表示をクリアしました');
    }
  }

  /**
   * ルート継承ダイアログを表示
   */
  function showInheritRouteDialog() {
    if (!isPlanMode) {
      alert('計画モードではありません');
      return;
    }

    // 既存のダイアログを削除
    const existingDialog = document.querySelector('.inherit-route-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    // ダイアログのオーバーレイ
    const overlay = document.createElement('div');
    overlay.className = 'inherit-route-dialog';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(5px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // ダイアログボックス
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        min-width: 320px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // タイトル
    const title = document.createElement('h3');
    title.textContent = 'ルート継承';
    title.style.cssText = `
        margin: 0 0 16px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
    `;

    // 説明文
    const description = document.createElement('p');
    description.textContent = '次のテーブル位置を選択してください：';
    description.style.cssText = `
        margin: 0 0 16px 0;
        color: #666;
        font-size: 14px;
        line-height: 1.4;
    `;

    // 入力エリア
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
    `;

    // 数字入力
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.min = '1';
    numberInput.max = '999';
    numberInput.value = '1';
    numberInput.style.cssText = `
        width: 80px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        text-align: center;
    `;

    // A/B選択
    const abSelect = document.createElement('select');
    abSelect.style.cssText = `
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
    `;

    const optionA = document.createElement('option');
    optionA.value = 'A';
    optionA.textContent = 'A';

    const optionB = document.createElement('option');
    optionB.value = 'B';
    optionB.textContent = 'B';

    abSelect.appendChild(optionA);
    abSelect.appendChild(optionB);

    inputContainer.appendChild(numberInput);
    inputContainer.appendChild(abSelect);

    // ボタンエリア
    const buttonArea = document.createElement('div');
    buttonArea.style.cssText = `
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    `;

    // キャンセルボタン
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    `;
    cancelButton.onclick = () => overlay.remove();

    // OKボタン
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    `;
    okButton.onclick = () => {
      const targetNumber = parseInt(numberInput.value);
      const targetSuffix = abSelect.value;

      if (targetNumber >= 1 && targetNumber <= 999) {
        overlay.remove();
        executeRouteInheritance(targetNumber, targetSuffix);
      } else {
        alert('1～999の数字を入力してください');
      }
    };

    // 要素を組み立て
    buttonArea.appendChild(cancelButton);
    buttonArea.appendChild(okButton);

    dialog.appendChild(title);
    dialog.appendChild(description);
    dialog.appendChild(inputContainer);
    dialog.appendChild(buttonArea);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // フォーカスを数字入力に設定
    numberInput.focus();
    numberInput.select();

    // Enterキーでも実行
    numberInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        okButton.click();
      }
    });

    // 外部クリックで閉じる
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  /**
   * ルート継承を実行
   */
  function executeRouteInheritance(targetNumber, targetSuffix) {
    console.log(`ルート継承実行: ${targetNumber}${targetSuffix}`);

    const currentSeed = getCurrentSeedFromURL();
    const steps = (targetNumber - 1) * 2 + (targetSuffix === 'B' ? 1 : 0);
    const newSeed = advanceSeed(currentSeed, steps);

    // 【重要】継承時は保存データを含めた完全な状態を取得
    const currentState = getCurrentPlanState(true); // 継承フラグを有効化

    if (!currentState || (!currentState.selectedCells?.length && !currentState.eventGachaSelections?.length)) {
      alert('継承する選択項目がありません');
      return;
    }

    console.log('継承前の現在状態:', currentState);

    // 継承対象の判定
    const targetPosition = targetNumber * 10 + (targetSuffix === 'A' ? 0 : 1);
    console.log(`継承開始位置: ${targetNumber}${targetSuffix}, 判定用position値: ${targetPosition}`);

    const shiftAmount = targetPosition - 10; // 1A = 10
    console.log(`シフト量計算: ${targetPosition} - 10 = ${shiftAmount}`);

    // より効率的な位置計算関数
    const processItems = (items, isEventGacha = false) => {
      return items
        .filter((item) => {
          const suffix = item.tableIndex === 0 ? 'A' : 'B';
          const position = item.pairNumber * 10 + (suffix === 'A' ? 0 : 1);
          return position >= targetPosition;
        })
        .map((item) => {
          if (targetSuffix === 'A') {
            return {
              ...item,
              pairNumber: Math.max(1, item.pairNumber - (targetNumber - 1)),
            };
          } else {
            const originalPosition = item.pairNumber * 10 + (item.tableIndex === 0 ? 0 : 1);
            const newPosition = originalPosition - shiftAmount;
            const newPairNumber = Math.floor(newPosition / 10);
            const newTableIndex = newPosition % 10 === 0 ? 0 : 1;

            return newPairNumber >= 1
              ? {
                  ...item,
                  pairNumber: newPairNumber,
                  tableIndex: newTableIndex,
                }
              : null;
          }
        })
        .filter((item) => item !== null);
    };

    const shiftedCells = processItems(currentState.selectedCells || []);
    const shiftedEventGacha = processItems(currentState.eventGachaSelections || [], true);

    // チケットカウントを効率的に再計算
    const newTicketCounts = { N: 0, F: 0, G: 0, E: 0 };

    shiftedCells.forEach((cell) => {
      const ticketType = cell.ticketType || getTicketTypeFromColumnName(cell.columnName);
      if (newTicketCounts[ticketType] !== undefined) {
        newTicketCounts[ticketType]++;
      }
    });

    newTicketCounts.E += shiftedEventGacha.length;

    console.log('継承後のチケットカウント:', newTicketCounts);

    // 新しい計画データを作成
    const newPlanData = {
      ticketCounts: newTicketCounts,
      selectedCells: shiftedCells,
      eventGachaSelections: shiftedEventGacha,
      isEventGachaEnabled: newTicketCounts.E > 0,
    };

    if (shiftedCells.length > 0 || shiftedEventGacha.length > 0) {
      const success = savePlanData(newSeed.toString(), newPlanData, true);

      if (success) {
        const totalItems = shiftedCells.length + shiftedEventGacha.length;
        const ticketSummary = Object.entries(newTicketCounts)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => {
            const typeName =
              {
                N: 'ノーマル',
                F: '福引',
                G: 'G福引',
                E: 'イベント',
              }[type] || type;
            return `${typeName}: ${count}枚`;
          })
          .join(', ');

        let message = `ルート継承完了\n新シード: ${newSeed}\nチケット: ${ticketSummary || 'なし'}`;
        message += '\n\n新しいシードのページに遷移しますか？';

        const shouldNavigate = confirm(message);

        if (shouldNavigate) {
          const url = new URL(window.location);
          url.searchParams.set('seed', newSeed.toString());
          window.location.href = url.toString();
        }
      } else {
        alert('ルートの保存に失敗しました');
      }
    } else {
      alert('継承可能な項目がありませんでした');
    }
  }

  /**
   * 現在の計画状態を取得
   */
  function getTicketTypeFromColumnName(columnName) {
    if (!columnName) return 'N';

    console.log(`チケットタイプ判定: カラム名 "${columnName}"`);

    // より詳細なマッピング
    if (columnName.includes('福引ガチャG')) {
      console.log('→ G福引と判定');
      return 'G';
    }
    if (columnName.includes('福引ガチャ')) {
      console.log('→ 福引と判定');
      return 'F';
    }
    if (columnName.includes('イベガチャ')) {
      console.log('→ イベントと判定');
      return 'E';
    }
    if (
      columnName.includes('ノーマルガチャ') ||
      columnName.includes('猫目ガチャ') ||
      columnName.includes('マタタビガチャ')
    ) {
      console.log('→ ノーマルと判定');
      return 'N';
    }

    console.log('→ デフォルトでノーマルと判定');
    return 'N';
  }

  /**
   * 現在の計画状態を取得
   * 基本的に現在の表示状態を正として扱い、継承時のみ保存データを活用
   */
  function getCurrentPlanState(forInheritance = false) {
    if (!isPlanMode) return null;

    const planData = {
      ticketCounts: { ...ticketCounts },
      selectedCells: [],
      eventGachaSelections: [],
      isEventGachaEnabled: isEventGachaEnabled,
    };

    // 一度だけテーブル情報を取得してキャッシュ
    const tables = Array.from(document.querySelectorAll('table'));
    const tableHeaders = tables.map((table) =>
      Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim())
    );

    // 継承時のみ保存データを活用、それ以外は表示項目のみ
    if (forInheritance) {
      // 継承時：保存データから全選択項目を取得
      const currentSeed = getCurrentSeed();
      const savedPlans = getSavedPlanData();
      const savedPlan = savedPlans[currentSeed];

      if (savedPlan && savedPlan.selectedCells) {
        // 保存済みデータをそのまま使用
        planData.selectedCells = [...savedPlan.selectedCells];

        // 現在表示されている選択項目で部分的に更新
        document.querySelectorAll('.selected-td').forEach((td) => {
          const row = td.closest('tr');
          const table = td.closest('table');
          const tableIndex = tables.indexOf(table);

          if (tableIndex === -1) return;

          const tbody = table.querySelector('tbody');
          const allRows = Array.from(tbody.querySelectorAll('tr'));
          const currentRowIndex = allRows.indexOf(row);

          const { pairNumber, isUpperRow, actualCellIndex } = analyzeRowStructure(row, allRows, currentRowIndex, td);
          const columnName = tableHeaders[tableIndex][actualCellIndex + 1] || '';
          const ticketType = td.dataset.ticketType || getTicketTypeFromColumnName(columnName);

          // 既存項目を更新または新規追加
          const existingIndex = planData.selectedCells.findIndex(
            (item) =>
              item.tableIndex === tableIndex &&
              item.pairNumber === pairNumber &&
              item.isUpperRow === isUpperRow &&
              item.columnName === columnName
          );

          const cellData = {
            tableIndex,
            pairNumber,
            isUpperRow,
            columnName,
            actualCellIndex,
            ticketType,
            text: td.textContent.trim(),
          };

          if (existingIndex >= 0) {
            planData.selectedCells[existingIndex] = cellData;
          } else {
            planData.selectedCells.push(cellData);
          }
        });
      } else {
        // 保存データがない場合は表示項目のみ
        planData.selectedCells = getCurrentVisibleSelections(tables, tableHeaders);
      }

      // 【修正】イベガチャも継承時は保存データを活用
      if (savedPlan && savedPlan.eventGachaSelections) {
        // 保存済みイベガチャデータをベースに使用
        planData.eventGachaSelections = [...savedPlan.eventGachaSelections];

        // 現在表示されているイベガチャ選択項目で部分的に更新
        const currentVisibleEventSelections = [];
        document.querySelectorAll('.selected-event-td').forEach((td) => {
          const { tableIndex, pairNumber } = getEventGachaInfo(td, tables);
          currentVisibleEventSelections.push({
            tableIndex,
            pairNumber,
            selectedItem: td.textContent.trim(),
          });
        });

        // 表示中の項目で保存データを更新
        currentVisibleEventSelections.forEach((visibleEvent) => {
          const existingIndex = planData.eventGachaSelections.findIndex(
            (savedEvent) =>
              savedEvent.tableIndex === visibleEvent.tableIndex && savedEvent.pairNumber === visibleEvent.pairNumber
          );

          if (existingIndex >= 0) {
            planData.eventGachaSelections[existingIndex] = visibleEvent;
          } else {
            planData.eventGachaSelections.push(visibleEvent);
          }
        });
      } else {
        // 保存データがない場合は表示項目のみ
        planData.eventGachaSelections = getCurrentVisibleEventSelections(tables);
      }
    } else {
      // 通常時：表示項目のみを使用（削除・選択解除を正しく反映）
      planData.selectedCells = getCurrentVisibleSelections(tables, tableHeaders);

      // 通常時のイベガチャ処理
      if (isEventGachaEnabled) {
        planData.eventGachaSelections = getCurrentVisibleEventSelections(tables);
      } else if (hiddenEventGachaSelections?.length > 0) {
        planData.eventGachaSelections = [...hiddenEventGachaSelections];
      }
    }

    return planData;
  }

  /**
   * 現在表示されているイベガチャ選択項目を取得するヘルパー関数
   */
  function getCurrentVisibleEventSelections(tables) {
    const selections = [];

    document.querySelectorAll('.selected-event-td').forEach((td) => {
      const { tableIndex, pairNumber } = getEventGachaInfo(td, tables);

      selections.push({
        tableIndex,
        pairNumber,
        selectedItem: td.textContent.trim(),
      });
    });

    return selections;
  }

  /**
   * 現在表示されている選択項目を取得するヘルパー関数
   */
  function getCurrentVisibleSelections(tables, tableHeaders) {
    const selections = [];

    document.querySelectorAll('.selected-td').forEach((td) => {
      const row = td.closest('tr');
      const table = td.closest('table');
      const tableIndex = tables.indexOf(table);

      if (tableIndex === -1) return;

      const tbody = table.querySelector('tbody');
      const allRows = Array.from(tbody.querySelectorAll('tr'));
      const currentRowIndex = allRows.indexOf(row);

      const { pairNumber, isUpperRow, actualCellIndex } = analyzeRowStructure(row, allRows, currentRowIndex, td);
      const columnName = tableHeaders[tableIndex][actualCellIndex + 1] || '';
      const ticketType = td.dataset.ticketType || getTicketTypeFromColumnName(columnName);

      selections.push({
        tableIndex,
        pairNumber,
        isUpperRow,
        columnName,
        actualCellIndex,
        ticketType,
        text: td.textContent.trim(),
      });
    });

    return selections;
  }

  /**
   * ヘルパー関数を分離して再利用
   */
  function analyzeRowStructure(row, allRows, currentRowIndex, td) {
    const hasRowspanCell = row.querySelector('td[rowspan]');

    if (hasRowspanCell) {
      const labelText = hasRowspanCell.textContent.trim();
      return {
        pairNumber: parseInt(labelText.match(/(\d+)/)[1]),
        isUpperRow: true,
        actualCellIndex: Array.from(row.querySelectorAll('td')).indexOf(td) - 1,
      };
    } else {
      const prevRow = allRows[currentRowIndex - 1];
      const labelCell = prevRow?.querySelector('td[rowspan]');
      const labelText = labelCell?.textContent.trim() || '';
      return {
        pairNumber: labelText ? parseInt(labelText.match(/(\d+)/)[1]) : 0,
        isUpperRow: false,
        actualCellIndex: Array.from(row.querySelectorAll('td')).indexOf(td),
      };
    }
  }

  /**
   * イベガチャ情報取得のヘルパー関数
   */
  function getEventGachaInfo(td, tables) {
    const row = td.closest('tr');
    const table = td.closest('table');
    const tableIndex = tables.indexOf(table);
    const tbody = table.querySelector('tbody');
    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const currentRowIndex = allRows.indexOf(row);
    const prevRow = allRows[currentRowIndex - 1];
    const labelCell = prevRow ? prevRow.querySelector('td[rowspan]') : null;
    const labelText = labelCell ? labelCell.textContent.trim() : '';
    const pairNumber = labelText ? parseInt(labelText.match(/(\d+)/)[1]) : 0;

    return { tableIndex, pairNumber };
  }

  /**
   * 保存済みデータから計画状態を復元
   */
  async function restorePlanState(seed) {
    const savedPlans = getSavedPlanData();
    const planData = savedPlans[seed];

    if (!planData) {
      console.log(`シード ${seed} の保存データが見つかりません`);
      return false;
    }

    console.log(`シード ${seed} の計画データを復元中...`, planData);

    // チケットカウントを先に復元
    if (planData.ticketCounts) {
      ticketCounts = { ...planData.ticketCounts };
      console.log('復元されたチケットカウント:', ticketCounts);
    }

    const hasEventTickets = ticketCounts.E > 0;
    const hasEventGachaSelections = planData.eventGachaSelections && planData.eventGachaSelections.length > 0;

    console.log(`イベガチャ復元判定:`, {
      hasEventTickets,
      hasEventGachaSelections,
    });

    // イベガチャ選択項目がある場合は隠れた選択項目として設定
    if (hasEventGachaSelections) {
      hiddenEventGachaSelections = [...planData.eventGachaSelections];
      console.log('イベガチャ選択項目を隠れた選択項目として設定:', hiddenEventGachaSelections);
    }

    // イベチケがある場合はイベガチャを有効化
    if (hasEventTickets) {
      console.log(`イベチケが${ticketCounts.E}枚あるため、イベガチャを有効化します`);
      const success = await enableEventGacha();
      if (!success) {
        console.error('イベガチャの有効化に失敗しました');
      }
    } else {
      // イベチケがない場合は無効のまま
      isEventGachaEnabled = false;
      hiddenEventGachaSelections = [];
      console.log('イベチケがないため、イベガチャは無効のままです');
    }

    // 通常セルの復元
    if (planData.selectedCells) {
      await restoreSelectedCells(planData.selectedCells);
    }

    // イベガチャ選択項目の復元
    if (hasEventTickets && hasEventGachaSelections && isEventGachaEnabled) {
      console.log('イベガチャ選択項目の表示復元を実行');
      await restoreHiddenEventGachaSelections();
    }

    updateTicketDisplay();
    updateSpecialItemColors();

    // 復元完了をマーク
    hasUnsavedChanges = false;
    lastSavedState = JSON.stringify(getCurrentPlanState());

    console.log(`シード ${seed} の計画データ復元完了`);
    console.log('復元後のチケットカウント:', ticketCounts);
    console.log('復元後の隠れたイベガチャ選択:', hiddenEventGachaSelections);

    return true;
  }

  /**
   * 変更検知用の状態チェック
   */
  function checkForChanges() {
    if (!isPlanMode) return;

    try {
      const currentState = JSON.stringify(getCurrentPlanState());
      const hasChanges = currentState !== lastSavedState;

      if (hasChanges !== hasUnsavedChanges) {
        hasUnsavedChanges = hasChanges;
        updateSaveButtonState();
      }
    } catch (error) {
      console.warn('状態チェックでエラーが発生しました:', error);
      // エラーが発生した場合は変更ありとして扱う
      if (!hasUnsavedChanges) {
        hasUnsavedChanges = true;
        updateSaveButtonState();
      }
    }
  }
  /**
   * 選択されたセルを復元
   */
  async function restoreSelectedCells(selectedCells) {
    return new Promise((resolve) => {
      selectedCells.forEach((cellInfo, index) => {
        // console.log(`セル復元 ${index}:`, cellInfo);

        const tables = document.querySelectorAll('table');
        const table = tables[cellInfo.tableIndex];
        if (!table) {
          console.warn(`テーブル ${cellInfo.tableIndex} が見つかりません`);
          return;
        }

        // ヘッダーから正しいカラムインデックスを取得
        const headers = Array.from(table.querySelectorAll('thead th'));
        const columnIndex = headers.findIndex((th) => th.textContent.trim() === cellInfo.columnName);
        if (columnIndex === -1) {
          console.warn(`カラム "${cellInfo.columnName}" が見つかりません`);
          return;
        }

        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // ペア番号と上下位置から対象行を特定
        let targetRow = null;

        // 右テーブルの場合は空行を考慮
        if (cellInfo.tableIndex === 1) {
          const nonEmptyRows = allRows.filter((r) => !r.querySelector('td[colspan]'));
          const targetPairIndex = (cellInfo.pairNumber - 1) * 2;
          const targetRowInPair = cellInfo.isUpperRow ? 0 : 1;
          const targetNonEmptyIndex = targetPairIndex + targetRowInPair;

          if (targetNonEmptyIndex < nonEmptyRows.length) {
            targetRow = nonEmptyRows[targetNonEmptyIndex];
          }
        } else {
          const targetRowIndex = (cellInfo.pairNumber - 1) * 2 + (cellInfo.isUpperRow ? 0 : 1);
          targetRow = allRows[targetRowIndex];
        }

        if (!targetRow) {
          console.warn(`対象行が見つかりません: ペア${cellInfo.pairNumber}, 上下=${cellInfo.isUpperRow}`);
          return;
        }

        // セルを特定（rowspan構造を考慮）
        let targetCell = null;
        const hasRowspanCell = targetRow.querySelector('td[rowspan]');

        if (hasRowspanCell) {
          const cells = Array.from(targetRow.querySelectorAll('td'));
          targetCell = cells[columnIndex];
        } else {
          const cells = Array.from(targetRow.querySelectorAll('td'));
          targetCell = cells[columnIndex - 1];
        }

        if (!targetCell) {
          console.warn(`セルが見つかりません: 行=${targetRow}, カラム=${columnIndex}`);
          return;
        }

        // セルを選択状態にする
        targetCell.classList.add('selected-td');
        targetCell.dataset.ticketType = cellInfo.ticketType;
        targetCell.dataset.planMode = 'true';

        // 対応する上のセルを選択（下の行の場合）
        if (!cellInfo.isUpperRow) {
          const tbody = targetRow.closest('tbody');
          const allTableRows = Array.from(tbody.querySelectorAll('tr'));
          const currentRowIndex = allTableRows.indexOf(targetRow);
          const upperRow = allTableRows[currentRowIndex - 1];

          if (upperRow) {
            const upperHasRowspan = upperRow.querySelector('td[rowspan]');
            let upperCell = null;

            if (upperHasRowspan) {
              const upperCells = Array.from(upperRow.querySelectorAll('td'));
              upperCell = upperCells[columnIndex];
            } else {
              const upperCells = Array.from(upperRow.querySelectorAll('td'));
              upperCell = upperCells[columnIndex - 1];
            }

            if (upperCell) {
              upperCell.classList.add('selected-td-top');
              upperCell.dataset.ticketType = cellInfo.ticketType;
              upperCell.dataset.planMode = 'true';
              //   console.log(`上セルも選択: "${upperCell.textContent.trim()}"`);
            }
          }
        }
      });

      resolve();
    });
  }

  /**
   * ページ離脱確認を無効化（自動保存なし）
   */
  function setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
      if (isPlanMode && hasUnsavedChanges) {
        // 自動保存は行わず、確認のみ
        e.preventDefault();
        e.returnValue = '未保存の計画データがあります。ページを離れますか？';
        return e.returnValue;
      }
    });
  }
  // ==================== ローディングUI機能 ====================

  /**
   * ローディングポップアップを表示
   */
  function showLoadingPopup(message = 'モード切り替え中...') {
    // 既存のローディングポップアップを削除
    const existingPopup = document.querySelector('.loading-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // ローディングポップアップコンテナ
    const loadingPopup = document.createElement('div');
    loadingPopup.className = 'loading-popup';
    loadingPopup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;

    // ローディングカードを作成
    const loadingCard = document.createElement('div');
    loadingCard.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 2.5rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            text-align: center;
            min-width: 280px;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

    // グラデーションオーバーレイ
    const overlay = document.createElement('div');
    overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: shimmer 2s infinite;
        `;

    // スピナー（CSS animation）
    const spinner = document.createElement('div');
    spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 3px solid #ffffff;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
        `;

    // メッセージテキスト
    const messageText = document.createElement('div');
    messageText.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        `;
    messageText.textContent = message;

    // サブテキスト
    const subText = document.createElement('div');
    subText.style.cssText = `
            font-size: 13px;
            opacity: 0.9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        `;
    subText.textContent = 'しばらくお待ちください...';

    // 要素を組み立て
    loadingCard.appendChild(overlay);
    loadingCard.appendChild(spinner);
    loadingCard.appendChild(messageText);
    loadingCard.appendChild(subText);
    loadingPopup.appendChild(loadingCard);

    // CSSアニメーションを追加（まだ存在しない場合）
    if (!document.getElementById('loading-animations')) {
      const style = document.createElement('style');
      style.id = 'loading-animations';
      style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(0.9); }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(loadingPopup);
    return loadingPopup;
  }

  /**
   * ローディングポップアップを閉じる
   */
  function hideLoadingPopup() {
    const loadingPopup = document.querySelector('.loading-popup');
    if (loadingPopup) {
      // フェードアウトアニメーション
      loadingPopup.style.animation = 'fadeOut 0.3s ease-out forwards';

      setTimeout(() => {
        if (loadingPopup.parentNode) {
          loadingPopup.remove();
        }
      }, 300);
    }
  }

  // ==================== テーブルヘッダー固定機能 ====================

  /**
   * theadに固定スタイルを適用
   */
  function makeStickyHeaders() {
    const tables = document.querySelectorAll('.css-o2j9ze table');

    tables.forEach((table) => {
      const thead = table.querySelector('thead');
      if (!thead) return;

      // thead固定
      thead.style.position = 'sticky';
      thead.style.top = '0';
      thead.style.zIndex = '1000';
      thead.style.backgroundColor = '#2c3e50';
      thead.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

      // thセルのスタイル変更
      const thCells = thead.querySelectorAll('th');
      thCells.forEach((th, index) => {
        // 既存のクラススタイルに追加
        th.style.backgroundColor = '#2c3e50';
        th.style.whiteSpace = 'nowrap';
        th.style.color = 'white';
        th.style.fontWeight = '600';
        th.style.fontSize = '14px';
        th.style.padding = '14px 12px';
        th.style.textAlign = 'center';
        th.style.border = 'none';
        th.style.position = 'sticky';
        th.style.top = '0';
        th.style.zIndex = '1001';
        th.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        th.style.letterSpacing = '0.3px';
        th.style.transition = 'background-color 0.2s ease';

        // ホバー効果
        th.addEventListener('mouseenter', function () {
          this.style.backgroundColor = '#34495e';
        });

        th.addEventListener('mouseleave', function () {
          this.style.backgroundColor = '#2c3e50';
        });
      });

      // テーブル自体の設定
      table.style.borderSpacing = '0';
    });
  }

  // ==================== イベント監視・初期化 ====================

  /**
   * DOM変更を監視してテキスト置換と更新を実行
   */
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    let shouldUpdateHeader = false;

    for (const mutation of mutations) {
      const isOwnChange = Array.from(mutation.addedNodes).some(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE &&
          (node.id === SPECIAL_ITEMS_CONTAINER_ID || node.id === SEED_SAVE_CONTAINER_ID)
      );

      if (!isOwnChange) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            replaceTextInNode(node);
            shouldUpdate = true;

            if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === 'TABLE' || node.querySelector('table'))) {
              shouldUpdateHeader = true;
            }
          }
        });
      }
    }

    if (shouldUpdate) {
      updateLinkColors();
      updateTextColors();
      //addIconsToSpecificItems();
      debouncedUpdate();
    }

    if (shouldUpdateHeader) {
      setTimeout(() => {
        makeStickyHeaders();
      }, 100);
    }
  });

  /**
   * ページ読み込み完了時の初期化処理
   */
  window.addEventListener('load', () => {
      loadOriginalGachaData();
    replaceAll();
    const items = extractSpecialItems();
    displaySpecialItemsAboveTarget(items);

    setTimeout(() => {
      createSeedSaveUI();
      makeStickyHeaders();
        addEventGachaCheckbox();

      // URL変更検知とページ離脱確認を設定
      setupBeforeUnload();
    }, 500);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });




  // ==================== CSS・UI要素 ====================

  // ポップアップ用CSSアニメーション
  if (!document.getElementById('star-popup-style')) {
    const style = document.createElement('style');
    style.id = 'star-popup-style';
    style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .star-popup {
                transform-origin: center top;
            }
        `;
    document.head.appendChild(style);
  }

  // 計画モード用CSSスタイル
  if (!document.getElementById('plan-mode-style')) {
    const style = document.createElement('style');
    style.id = 'plan-mode-style';
    style.textContent = `
        .selected-td {
            box-shadow:
                inset -3px 0 0 #228B22,
                inset 0 -3px 0 #228B22,
                inset 3px 0 0 #228B22 !important;
            background-color: #98fb98 !important;
            color: black !important;
            border-top: none !important;
        }
        .selected-td-top {
            box-shadow:
                inset 0 3px 0 #228B22,
                inset -3px 0 0 #228B22,
                inset 3px 0 0 #228B22 !important;
            background-color: #98fb98 !important;
            color: black !important;
            border-bottom: none !important;
        }
        .selected-td * {
            color: black !important;
        }
        .selected-td-top * {
            color: black !important;
        }
        .selected-event-td {
            box-shadow:
                inset -3px 0 0 #0000cd,
                inset 0 -3px 0 #0000cd,
                inset 3px 0 0 #0000cd !important;
            background-color: #00ffff !important;
            color: black !important;
            border-top: none !important;
        }
        .selected-event-td-top {
            box-shadow:
                inset 0 3px 0 #0000cd,
                inset -3px 0 0 #0000cd,
                inset 3px 0 0 #0000cd !important;
            background-color: #00ffff !important;
            color: #ff4500 !important;
            border-top: none !important;
            font-weight:600
        }
        .selected-event-td * {
            color: black !important;
        }
        .selected-event-td-top * {
            color: black !important;
        }
    `;
    document.head.appendChild(style);
  }

  const style = document.createElement('style');
  style.id = 'ampri-padding-style';
  style.textContent = `
    .css-51h3jl,
    .css-1dwlwmy,
    .css-15uto1k,
    .css-159psa,
    .css-fb12zs {
        padding: 2px 8px !important;
        min-width: 100px;
    }
    `;
  document.head.appendChild(style);
    style.textContent = `
        .custom-table-container {
            margin-left: 20px !important;
            min-width: 400px;
        }

        .custom-input-section {
            margin-bottom: 20px !important;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
        }

        .custom-input-row {
            display: flex;
            align-items: center;
            margin-bottom: 10px !important;
        }

        .custom-input-row label {
            width: 100px;
            margin-right: 10px;
        }

        .custom-input-row input, .custom-input-row select {
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 3px;
            margin-right: 10px;
        }

        .custom-search-btn {
            padding: 6px 16px;
            background-color: #007bff;
            font-size: 13px !important;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }

        .custom-search-btn:hover {
            background-color: #0056b3;
        }

        .history-btn {
            padding: 5px 10px;
            margin: 0 5px;
            background-color: #6c757d;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
        }

        .history-btn:hover:not(:disabled) {
            background-color: #545b62;
        }

        .history-btn:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }


        .custom-table {
            border-collapse: collapse;
            width: 100%;
            font-size: 12px;
        }

        .custom-table th {
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
        }

        .custom-table td {
            border: 1px solid #ccc;
            padding: 4px;
            text-align: center;
        }

        .custom-table .row-header {
            background-color: #f8f8f8;
            font-weight: bold;
        }

        .custom-table .cat {
            border-top: none;
            background-color: #fff;
            min-height: 20px;
            font-size: 10px;
        }
        .right-double {
            border-right: 3px double #aaa !important;
        }
        .custom-table .guaranteed-score {
            min-height: 20px;
            min-width:160px;
            border-bottom: none;
        }
        .custom-table .guaranteed-cat {
            min-height: 20px;
            border-top: none;
        }
        .custom-table .ten-confirm {
            min-width:400px;
            border-bottom: none;
            text-align:start;
        }

        .custom-table .score {
            min-height: 20px;
            min-width:120px;
            border-bottom: none;
        }

        .char-click {
            cursor: pointer;
            color: #007bff;
            text-decoration: underline;
        }

        .char-click:hover {
            color: #0056b3;
        }

        .next-char-click {
            cursor: pointer;
            color: #dc3545;
            text-decoration: underline;
            font-weight: bold;
        }

        .next-char-click:hover {
            color: #a71e2a;
        }

        /* ランク別背景色 */
        .rank-normal {
            background-color: rgb(238, 238, 238) !important;
        }

        .rank-rare {
            background-color: white !important;
        }

        .rank-super {
            background-color: gold !important;
        }

        .rank-uber {
            background-color: red !important;
        }

        .rank-legend {
            background-color: darkviolet !important;
        }

        /* uber/legendの文字色 */
        .rank-uber .char-click,
        .rank-uber .next-char-click {
            color: rgb(255, 255, 0) !important;
        }

        .rank-legend .char-click,
        .rank-legend .next-char-click {
            color: rgb(255, 255, 0) !important;
        }
    `;
    document.head.appendChild(style);


    // 新しいカスタムテーブルコンテナを作成
    const customContainer = document.createElement('div');
    customContainer.className = 'custom-table-container';

    // タイトルを作成
    const title = document.createElement('h3');
    title.textContent = 'イベガチャテーブル(β版)';
    title.style.marginBottom = '10px';
    title.style.color = '#333';
// 10連表示用のフラグ
let isTenConsecutiveEnabled = false;

    // 履歴ボタン付き入力セクション作成




// 10連表示切り替えハンドラ
function handleTenConsecutiveToggle() {
    const checkbox = document.getElementById('ten-consecutive-checkbox');
    if (!checkbox) return;

    isTenConsecutiveEnabled = checkbox.checked;
    console.log(`10連表示状態変更: ${isTenConsecutiveEnabled}`);

    // テーブルの10連列の表示/非表示を切り替え
    toggleTenConsecutiveColumn();
}

// 10連列の表示/非表示を切り替える関数
function toggleTenConsecutiveColumn() {
    const tenConsecutiveElements = document.querySelectorAll('.ten-consecutive-column');

    tenConsecutiveElements.forEach(element => {
        element.style.display = isTenConsecutiveEnabled ? 'table-cell' : 'none';
    });
}
/**
 * イベガチャシードの初期値設定
 */
function setInitialEventGachaSeed() {
    const seedInput = document.getElementById('custom-seed');
    if (!seedInput) return;

    // 保存されたシードから最新のものを取得
    const savedSeeds = getSavedEventSeeds();

    let initialSeed = '100';
    let initialGachaKey = Object.keys(GACHA_CONFIG)[0];

    if (savedSeeds.length > 0) {
        // 最新の保存済みシードを使用
        const latestSeed = savedSeeds[0];
        initialSeed = latestSeed.seed;
        initialGachaKey = latestSeed.gachaKey;

        console.log(`最新の保存済みシードを復元: ${initialSeed} (${latestSeed.gachaName})`);
    } else {
        console.log('デフォルト値100を設定');
    }

    // 値を設定
    seedInput.value = initialSeed;

    // ガチャ種も復元
    const gachaSelect = document.getElementById('custom-gacha');
    if (gachaSelect) {
        gachaSelect.value = initialGachaKey;
        window.currentGachaKey = initialGachaKey;
    }

    // *** 改善：初期値設定後にテーブルを自動更新 ***
    setTimeout(() => {
        console.log('初期テーブル表示開始:', initialSeed, initialGachaKey);
        updateTable(initialSeed, initialGachaKey);
    }, 100);
}



    const inputSection = createInputSectionWithHistory();

    // テーブルを作成する関数
function createCustomTable() {
    const table = document.createElement('table');
    table.className = 'custom-table';
    table.cellSpacing = '0';

    // ヘッダー作成
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>#</th>
        <th>A列</th>
        <th>単体確定A</th>
        <th>B列</th>
        <th>単体確定B</th>
        <th>#</th>
        <th class="ten-consecutive-column" style="display: none;">10連時確定</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ボディ作成
    const tbody = document.createElement('tbody');

    // 各ペアごとに処理
    for (let i = 1; i <= 100; i++) {
        // 上の行（score行）
        const upperRow = document.createElement('tr');
        if (i === 1) {
            upperRow.innerHTML = `
                <td rowspan="2" class="row-header">${i}A</td>
                <td class="score" id="score-${i}A">&nbsp;</td>
                <td class="guaranteed-score right-double" id="guaranteed-score-${i}A">&nbsp;</td>
                <td colspan="3">&nbsp;</td>
                <td class="ten-confirm ten-consecutive-column" id="ten-confirm-${i}A" style="display: none;">&nbsp;</td>
            `;
        } else {
            upperRow.innerHTML = `
                <td rowspan="2" class="row-header">${i}A</td>
                <td class="score" id="score-${i}A">&nbsp;</td>
                <td class="guaranteed-score right-double" id="guaranteed-score-${i}A">&nbsp;</td>
                <td class="cat" id="cat-${i-1}B">&nbsp;</td>
                <td class="guaranteed-cat" id="guaranteed-cat-${i-1}B">&nbsp;</td>
                <td class="ten-confirm ten-consecutive-column" id="ten-confirm-${i}A" style="display: none;">&nbsp;</td>
            `;
        }
        tbody.appendChild(upperRow);

        // 下の行（cat行）
        const lowerRow = document.createElement('tr');
        lowerRow.innerHTML = `
            <td class="cat" id="cat-${i}A">&nbsp;</td>
            <td class="guaranteed-cat right-double" id="guaranteed-cat-${i}A">&nbsp;</td>
            <td class="score" id="score-${i}B">&nbsp;</td>
            <td class="guaranteed-score" id="guaranteed-score-${i}B">&nbsp;</td>
            <td rowspan="2" class="row-header">${i}B</td>
            <td class="ten-confirm ten-consecutive-column" id="ten-confirm-${i}B" style="display: none;">&nbsp;</td>
        `;
        tbody.appendChild(lowerRow);
    }

    // 最後のB側キャット行
    const finalRow = document.createElement('tr');
    finalRow.innerHTML = `
        <td colspan="3" class="right-double">&nbsp;</td>
        <td class="cat" id="cat-100B">&nbsp;</td>
        <td class="guaranteed-cat" id="guaranteed-cat-100B">&nbsp;</td>
        <td>&nbsp;</td>
        <td class="ten-consecutive-column" style="display: none;">&nbsp;</td>
    `;
    tbody.appendChild(finalRow);

    table.appendChild(tbody);
    return table;
}





    // カスタムテーブル作成
    const customTable = createCustomTable();

function handleEventGachaTableClick(e) {

    if (e.target && e.target.textContent === '?') {
        showEventGachaHelp(e.target);
        return;
    }

    // 10連チェックボックスの処理
    if (e.target && e.target.id === 'ten-consecutive-checkbox') {
        handleTenConsecutiveToggle();
        return;
    }

    if (e.target && e.target.id === 'custom-search') {
        const seed = document.getElementById('custom-seed').value.trim();
        const gacha = document.getElementById('custom-gacha').value;

        if (!seed) {
            alert('シードを入力してください');
            return;
        }

        if (!/^\d+$/.test(seed)) {
            alert('シードは数値で入力してください');
            return;
        }

        window.currentGachaKey = gacha;
        updateTable(seed, gacha);
        seedHistory.add(seed, gacha);
    }

    if (e.target && e.target.id === 'save-seed') {
        handleSaveEventSeed();
    }

    // 履歴ボタンのクリック処理
    if (e.target && e.target.id === 'history-back') {
        seedHistory.goBack();
    }

    if (e.target && e.target.id === 'history-forward') {
        seedHistory.goForward();
    }

    // キャラクタークリック処理
    if (e.target && e.target.classList.contains('char-click')) {
        const charSeed = e.target.getAttribute('data-char-seed');
        if (charSeed) {
            document.getElementById('custom-seed').value = charSeed;
            updateTable(charSeed, window.currentGachaKey);
            seedHistory.add(charSeed, window.currentGachaKey);
        }
    }

    // nextキャラクタークリック処理
    if (e.target && e.target.classList.contains('next-char-click')) {
        const nextSeed = e.target.getAttribute('data-next-seed');
        if (nextSeed) {
            document.getElementById('custom-seed').value = nextSeed;
            updateTable(nextSeed, window.currentGachaKey);
            seedHistory.add(nextSeed, window.currentGachaKey);
        }
    }
}

/**
 * チェンジイベントハンドラ
 */
function handleEventGachaTableChange(e) {
    if (e.target && e.target.id === 'custom-gacha') {
        const seed = document.getElementById('custom-seed').value.trim();
        window.currentGachaKey = e.target.value;
        if (seed) {
            updateTable(seed, window.currentGachaKey);
            seedHistory.add(seed, window.currentGachaKey);
        }
    }
}

/**
 * キープレスイベントハンドラ
 */
function handleEventGachaTableKeypress(e) {
    if (e.target && e.target.id === 'custom-seed' && e.key === 'Enter') {
        document.getElementById('custom-search').click();
    }
}
    // イベントリスナーを追加
function setupEventListeners() {
    // 既存のイベントリスナーを削除（重複防止）
    document.removeEventListener('click', handleEventGachaTableClick);
    document.removeEventListener('change', handleEventGachaTableChange);
    document.removeEventListener('keypress', handleEventGachaTableKeypress);

    // 新しいイベントリスナーを追加
    document.addEventListener('click', handleEventGachaTableClick);
    document.addEventListener('change', handleEventGachaTableChange);
    document.addEventListener('keypress', handleEventGachaTableKeypress);
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'custom-search') {
            const seed = document.getElementById('custom-seed').value.trim();
            const gacha = document.getElementById('custom-gacha').value;

            if (!seed) {
                alert('シードを入力してください');
                return;
            }

            if (!/^\d+$/.test(seed)) {
                alert('シードは数値で入力してください');
                return;
            }

            window.currentGachaKey = gacha;
            updateTable(seed, gacha);

            // 履歴に追加
            seedHistory.add(seed, gacha);
        }
        if (e.target && e.target.id === 'save-seed') {
            handleSaveEventSeed();
        }
        // 履歴ボタンのクリック処理
        if (e.target && e.target.id === 'history-back') {
            console.log('戻るボタンクリック');
            seedHistory.debugHistory(); // デバッグ情報出力
            seedHistory.goBack();
        }

        if (e.target && e.target.id === 'history-forward') {
            console.log('進むボタンクリック');
            seedHistory.debugHistory(); // デバッグ情報出力
            seedHistory.goForward();
        }

        // キャラクタークリック処理
        if (e.target && e.target.classList.contains('char-click')) {
            const charSeed = e.target.getAttribute('data-char-seed');
            if (charSeed) {
                document.getElementById('custom-seed').value = charSeed;
                updateTable(charSeed, window.currentGachaKey);
                seedHistory.add(charSeed, window.currentGachaKey);
            }
        }

        // nextキャラクタークリック処理
        if (e.target && e.target.classList.contains('next-char-click')) {
            const nextSeed = e.target.getAttribute('data-next-seed');
            if (nextSeed) {
                document.getElementById('custom-seed').value = nextSeed;
                updateTable(nextSeed, window.currentGachaKey);
                seedHistory.add(nextSeed, window.currentGachaKey);
            }
        }
    });

    // ガチャ種変更時のイベントリスナー
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id === 'custom-gacha') {
            const seed = document.getElementById('custom-seed').value.trim();
            window.currentGachaKey = e.target.value;
            if (seed) {
                updateTable(seed, window.currentGachaKey);
                seedHistory.add(seed, window.currentGachaKey);
            }
        }
    });

    // Enterキーでの検索
    document.addEventListener('keypress', function(e) {
        if (e.target && e.target.id === 'custom-seed' && e.key === 'Enter') {
            document.getElementById('custom-search').click();
        }
    });
}

  // モード切り替えボタンを設置
  if (!document.getElementById('mode-toggle-btn')) {
    const modeButton = document.createElement('button');
    modeButton.id = 'mode-toggle-btn';
    modeButton.textContent = '通常モード';
    modeButton.style.cssText = `
            position: fixed;
            top: 12px;
            right: 12px;
            z-index: 10000;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            font-size: 14px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        `;
    modeButton.onclick = toggleMode;
    document.body.appendChild(modeButton);
  }


// オリジナルガチャ管理用変数
let originalGachaData = {};
let editingGachaKey = null;

/**
 * ローカルストレージからオリジナルガチャデータを読み込み
 */
function loadOriginalGachaData() {
    const saved = localStorage.getItem('original-gacha-data');
    if (saved) {
        originalGachaData = JSON.parse(saved);
        // GACHA_CONFIGに追加
        Object.assign(GACHA_CONFIG, originalGachaData);
    }
}

/**
 * オリジナルガチャデータをローカルストレージに保存
 */
function saveOriginalGachaData() {
    localStorage.setItem('original-gacha-data', JSON.stringify(originalGachaData));
}

/**
 * ガチャ選択欄に+ボタンを追加
 */
function addPlusButtonToGachaSelect() {
    const gachaSelect = document.querySelector('#custom-gacha');
    if (!gachaSelect) {
        console.warn('ガチャ選択要素が見つかりません');
        return;
    }

    const gachaRow = gachaSelect.closest('.custom-input-row');
    if (!gachaRow) {
        console.warn('ガチャ行要素が見つかりません');
        return;
    }
    if (!gachaRow || gachaRow.querySelector('.add-gacha-btn')) return;

    const plusButton = document.createElement('button');
    plusButton.className = 'add-gacha-btn';
    plusButton.innerHTML = '+';
    plusButton.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #007bff;
        color: white;
        border: none;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    `;

    plusButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#0056b3';
    });

    plusButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#007bff';
    });

    plusButton.addEventListener('click', showOriginalGachaCreator);

    gachaRow.appendChild(plusButton);
}

/**
 * オリジナルガチャ作成画面を表示
 */
function showOriginalGachaCreator() {
    // 既存のダイアログを削除
    const existingDialog = document.querySelector('.original-gacha-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // オーバーレイ作成
    const overlay = document.createElement('div');
    overlay.className = 'original-gacha-dialog';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
    `;

    // メインコンテナ
    const container = document.createElement('div');
    container.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // 左側：ガチャ一覧
    const leftPanel = createGachaListPanel();

    // 右側：編集フォーム
    const rightPanel = createGachaEditPanel();

    container.appendChild(leftPanel);
    container.appendChild(rightPanel);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // 外部クリックで閉じる
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });

    // ガチャ一覧を更新
    updateGachaList();
}

/**
 * ガチャ一覧パネルを作成
 */
function createGachaListPanel() {
    const panel = document.createElement('div');
    panel.style.cssText = `
        width: 300px;
        padding: 20px;
        border-right: 1px solid #eee;
        background: #f8f9fa;
    `;

    const title = document.createElement('h3');
    title.textContent = 'オリジナルガチャ一覧';
    title.style.cssText = `
        margin: 0 0 16px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    `;

    const gachaList = document.createElement('div');
    gachaList.id = 'original-gacha-list';
    gachaList.style.cssText = `
        min-height: 200px;
    `;

    const newButton = document.createElement('button');
    newButton.textContent = '新しいガチャを作成';
    newButton.style.cssText = `
        width: 100%;
        padding: 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 16px;
        font-size: 14px;
    `;
    newButton.addEventListener('click', () => {
        editingGachaKey = null;
        clearGachaForm();
    });

    panel.appendChild(title);
    panel.appendChild(gachaList);
    panel.appendChild(newButton);

    return panel;
}

/**
 * ガチャ編集パネルを作成
 */
function createGachaEditPanel() {
    const panel = document.createElement('div');
    panel.style.cssText = `
        width: 600px;
        padding: 20px;
    `;

    const title = document.createElement('h3');
    title.textContent = 'ガチャ設定（JSON形式）';
    title.style.cssText = `
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
    `;

    const form = document.createElement('div');
    form.id = 'gacha-edit-form';
    form.innerHTML = `
        <div class="form-group">
            <label>ガチャ設定（JSON形式）:</label>
            <textarea id="gacha-json-input" placeholder="JSON形式でガチャ設定を入力してください"></textarea>
            <div class="json-help">
                <small style="color: #666;">
                ※ 入力例：<br>
                name: ガチャ名<br>
                rate: [ノーマル, レア, 激レア, 超激レア, 伝説] の確率レート<br>
                characters: 各レアリティのキャラクター配列<br>
                guaranteedRate: 確定枠の確率レート<br>
                guaranteedCharacters: 確定枠のキャラクター配列
                </small>
            </div>
        </div>

        <div class="form-group">
            <label>プレビュー:</label>
            <div id="json-preview" class="json-preview">
                JSONを入力すると、ここにプレビューが表示されます
            </div>
        </div>

        <div class="form-buttons">
            <button id="save-gacha" class="save-btn">保存</button>
            <button id="cancel-gacha" class="cancel-btn">キャンセル</button>
            <button id="delete-gacha" class="delete-btn" style="display: none;">削除</button>
            <button id="format-json" class="format-btn">整形フォーマット</button>
        </div>
    `;

    // CSS追加
    if (!document.getElementById('json-gacha-styles')) {
        const style = document.createElement('style');
        style.id = 'json-gacha-styles';
        style.textContent = `
            .form-group {
                margin-bottom: 16px;
            }
            .form-group label {
                display: block;
                margin-bottom: 4px;
                font-weight: 500;
                color: #333;
            }
            #gacha-json-input {
                width: 100%;
                height: 300px;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                font-family: 'Courier New', monospace;
                box-sizing: border-box;
                resize: vertical;
                background: #f8f9fa;
            }
            .json-help {
                margin-top: 8px;
                padding: 8px;
                background: #f0f0f0;
                border-radius: 4px;
            }
            .json-preview {
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #f8f9fa;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                max-height: 200px;
                overflow-y: auto;
                white-space: pre-wrap;
                color: #333;
            }
            .json-preview.error {
                background: #ffe6e6;
                color: #d32f2f;
            }
            .json-preview.success {
                background: #e8f5e8;
                color: #2e7d32;
            }
            .form-buttons {
                display: flex;
                gap: 12px;
                margin-top: 24px;
            }
            .save-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
            }
            .cancel-btn {
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
            }
            .delete-btn {
                background: #dc3545;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
            }
            .format-btn {
                background: #17a2b8;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
            }
            .gacha-item {
                padding: 12px;
                margin-bottom: 8px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .gacha-item:hover {
                background: #f0f0f0;
            }
            .gacha-item.selected {
                background: #e7f3ff;
                border-color: #007bff;
            }
        `;
        document.head.appendChild(style);
    }

    // 初期値を設定
    setTimeout(() => {
        const defaultGachaData = {
            name: 'にゃんこ学園2025',
            rate: [999, 5999, 8499, 9999, 9999],
            characters: [
                ['XP5千'],
                [
                    'スピダ',
                    'ニャンピュ',
                    'XP1万',
                    'XP3万',
                ],
                [
                    'ネコボン',
                    'おかめはちもく',
                    'スニャイパー',
                    'XP10万',
                ],
                ['幼馴染にゃん子', 'おてんばネコライオン','ネコクバンケシ','ネコ委員長'],
                []
            ],
            guaranteedRate: [1499],
            guaranteedCharacters: [['幼馴染にゃん子', 'おてんばネコライオン','ネコクバンケシ','ネコ委員長']]
        };

        const jsonInput = document.getElementById('gacha-json-input');
        if (jsonInput) {
            jsonInput.value = JSON.stringify(defaultGachaData, null, 2);
            updateJsonPreview();
        }

        // イベントリスナー設定
        document.getElementById('save-gacha').addEventListener('click', saveGachaFromJson);
        document.getElementById('cancel-gacha').addEventListener('click', () => {
            document.querySelector('.original-gacha-dialog').remove();
        });
        document.getElementById('delete-gacha').addEventListener('click', deleteGacha);
        document.getElementById('format-json').addEventListener('click', formatJson);

        // リアルタイムプレビュー
        jsonInput.addEventListener('input', updateJsonPreview);
    }, 100);

    panel.appendChild(title);
    panel.appendChild(form);

    return panel;
}
/**
 * JSONプレビューを更新
 */
function updateJsonPreview() {
    const jsonInput = document.getElementById('gacha-json-input');
    const preview = document.getElementById('json-preview');

    if (!jsonInput || !preview) return;

    const jsonText = jsonInput.value.trim();

    if (!jsonText) {
        preview.textContent = 'JSONを入力すると、ここにプレビューが表示されます';
        preview.className = 'json-preview';
        return;
    }

    try {
        const parsedData = JSON.parse(jsonText);

        // バリデーション
        const validation = validateGachaData(parsedData);

        if (validation.isValid) {
            preview.textContent = `✓ 有効なガチャデータです\n\nガチャ名: ${parsedData.name}\nレート設定: ${parsedData.rate ? parsedData.rate.join(', ') : '未設定'}\nキャラクター数: ${parsedData.characters ? parsedData.characters.map(chars => chars.length).join(', ') : '未設定'}`;
            preview.className = 'json-preview success';
        } else {
            preview.textContent = `❌ エラー:\n${validation.errors.join('\n')}`;
            preview.className = 'json-preview error';
        }
    } catch (error) {
        preview.textContent = `❌ JSON形式エラー:\n${error.message}`;
        preview.className = 'json-preview error';
    }
}

/**
 * ガチャデータのバリデーション
 */
function validateGachaData(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string') {
        errors.push('name（ガチャ名）が必要です');
    }

    if (!Array.isArray(data.rate) || data.rate.length !== 5) {
        errors.push('rate は5つの数値の配列である必要があります');
    } else {
        data.rate.forEach((rate, index) => {
            if (typeof rate !== 'number' || rate < 0 || rate > 9999) {
                errors.push(`rate[${index}] は 0-9999 の数値である必要があります`);
            }
        });
    }

    if (!Array.isArray(data.characters) || data.characters.length !== 5) {
        errors.push('characters は5つの配列の配列である必要があります');
    } else {
        data.characters.forEach((chars, index) => {
            if (!Array.isArray(chars)) {
                errors.push(`characters[${index}] は配列である必要があります`);
            }
        });
    }

    if (data.guaranteedRate && !Array.isArray(data.guaranteedRate)) {
        errors.push('guaranteedRate は配列である必要があります');
    }

    if (data.guaranteedCharacters && !Array.isArray(data.guaranteedCharacters)) {
        errors.push('guaranteedCharacters は配列である必要があります');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * JSONフォーマット
 */
function formatJson() {
    const jsonInput = document.getElementById('gacha-json-input');
    if (!jsonInput) return;

    try {
        const parsedData = JSON.parse(jsonInput.value);
        jsonInput.value = JSON.stringify(parsedData, null, 2);
        updateJsonPreview();
    } catch (error) {
        alert('JSON形式エラー: ' + error.message);
    }
}

/**
 * JSONからガチャを保存
 */
function saveGachaFromJson() {
    const jsonInput = document.getElementById('gacha-json-input');
    if (!jsonInput) return;

    try {
        const gachaData = JSON.parse(jsonInput.value);

        // バリデーション
        const validation = validateGachaData(gachaData);
        if (!validation.isValid) {
            alert('エラー:\n' + validation.errors.join('\n'));
            return;
        }

        // キーを決定
        let key = editingGachaKey;
        if (!key) {
            // 新規作成の場合
            let counter = 1;
            while (originalGachaData[`original${counter}`] || GACHA_CONFIG[`original${counter}`]) {
                counter++;
            }
            key = `original${counter}`;
        }

        // 保存
        originalGachaData[key] = gachaData;
        GACHA_CONFIG[key] = gachaData;
        saveOriginalGachaData();

        // ガチャ選択欄を更新
        updateGachaSelectOptions();

        // 一覧を更新
        updateGachaList();

        alert(`ガチャ「${gachaData.name}」を保存しました\n※キャッシュの削除やシークレットモードの利用では保存維持されません。`);

    } catch (error) {
        alert('JSON形式エラー: ' + error.message);
    }
}

/**
 * ガチャデータをフォームに読み込み（JSON版）
 */
function loadGachaToForm(key, gacha) {
    editingGachaKey = key;

    const jsonInput = document.getElementById('gacha-json-input');
    if (jsonInput) {
        jsonInput.value = JSON.stringify(gacha, null, 2);
        updateJsonPreview();
    }

    // 削除ボタンを表示
    const deleteButton = document.getElementById('delete-gacha');
    if (deleteButton) {
        deleteButton.style.display = 'inline-block';
    }
}

/**
 * フォームをクリア（JSON版）
 */
function clearGachaForm() {
    editingGachaKey = null;

    // デフォルトデータを設定
    const defaultGachaData = {
        name: 'にゃんこ学園2025',
        rate: [999, 5999, 8499, 9999, 9999],
        characters: [
            ['XP5千'],
            [
                'スピダ',
                'ニャンピュ',
                'XP1万',
                'XP3万',
            ],
            [
                'ネコボン',
                'おかめはちもく',
                'スニャイパー',
                'XP10万',
            ],
            ['幼馴染にゃん子', 'おてんばネコライオン','ネコクバンケシ','ネコ委員長'],
            ['XP100万']
        ],
        guaranteedRate: [1499],
        guaranteedCharacters: [['幼馴染にゃん子', 'おてんばネコライオン','ネコクバンケシ','ネコ委員長']]
    };

    const jsonInput = document.getElementById('gacha-json-input');
    if (jsonInput) {
        jsonInput.value = JSON.stringify(defaultGachaData, null, 2);
        updateJsonPreview();
    }

    // 削除ボタンを非表示
    const deleteButton = document.getElementById('delete-gacha');
    if (deleteButton) {
        deleteButton.style.display = 'none';
    }

    // 選択状態をクリア
    document.querySelectorAll('.gacha-item').forEach(el => el.classList.remove('selected'));
}

/**
 * ガチャ一覧を更新
 */
function updateGachaList() {
    const listContainer = document.getElementById('original-gacha-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    Object.keys(originalGachaData).forEach(key => {
        const gacha = originalGachaData[key];
        const item = document.createElement('div');
        item.className = 'gacha-item';
        item.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${gacha.name}</div>
            <div style="font-size: 12px; color: #666;">キー: ${key}</div>
        `;

        item.addEventListener('click', () => {
            // 選択状態を更新
            document.querySelectorAll('.gacha-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');

            // フォームに読み込み
            loadGachaToForm(key, gacha);
        });

        listContainer.appendChild(item);
    });

    if (Object.keys(originalGachaData).length === 0) {
        listContainer.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">作成済みガチャはありません</div>';
    }
}




/**
 * ガチャを削除
 */
function deleteGacha() {
    if (!editingGachaKey) return;

    if (confirm(`ガチャ「${originalGachaData[editingGachaKey].name}」を削除しますか？`)) {
        delete originalGachaData[editingGachaKey];
        delete GACHA_CONFIG[editingGachaKey];
        saveOriginalGachaData();
        updateGachaSelectOptions();
        updateGachaList();
        clearGachaForm();
        alert('ガチャを削除しました');
    }
}

/**
 * ガチャ選択欄のオプションを更新
 */
function updateGachaSelectOptions() {
    const select = document.getElementById('custom-gacha');
    if (!select) return;

    // 現在の選択値を保存
    const currentValue = select.value;

    // オリジナルガチャのオプションを削除
    const optionsToRemove = [];
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.startsWith('original')) {
            optionsToRemove.push(select.options[i]);
        }
    }
    optionsToRemove.forEach(option => option.remove());

    // オリジナルガチャのオプションを追加
    Object.keys(originalGachaData).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = originalGachaData[key].name;
        select.appendChild(option);
    });

    // 選択値を復元
    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    }
}

// 既存の関数を修正せずに、新しい関数を作成
function createInputSectionWithHistory() {
    const inputSection = document.createElement('div');
    inputSection.className = 'custom-input-section';

    // シード入力欄
    const seedRow = document.createElement('div');
    seedRow.className = 'custom-input-row';
    seedRow.innerHTML = `
        <label for="custom-seed">シード:</label>
        <input type="text" id="custom-seed" placeholder="シードを入力">
        <button class="custom-search-btn" id="custom-search">検索</button>
    `;

    // ガチャ種選択
    const gachaRow = document.createElement('div');
    gachaRow.className = 'custom-input-row';
    gachaRow.innerHTML = `
        <label for="custom-gacha">ガチャ種:</label>
        <select id="custom-gacha"></select>
    `;

    const select = gachaRow.querySelector('#custom-gacha');
    for (const key in GACHA_CONFIG) {
        const config = GACHA_CONFIG[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = config.name;
        select.appendChild(option);
    }

    // 保存されたシード表示欄
    const savedSeedsRow = document.createElement('div');
    savedSeedsRow.className = 'custom-input-row';
    savedSeedsRow.innerHTML = `
        <div>
            <label>保存済み:</label>
            <div style="font-size: 12px; color: gray; margin-bottom: 4px;">※3件まで</div>
        </div>
        <div id="event-seed-list" style="flex: 1; min-height: 20px;"></div>
    `;

    // 10連チェックボックスを追加
    const tenRow = document.createElement('div');
    tenRow.className = 'custom-input-row';
    tenRow.innerHTML = `
        <div style="display: flex; align-items: center">
            <label>10連時確定:</label>
            <input type="checkbox" id="ten-consecutive-checkbox" style="margin-right: 5px; width:20px; height:20px">
        </div>
    `;

    // 履歴操作行（10連チェックボックスを追加）
    const historyRow = document.createElement('div');
    historyRow.className = 'custom-input-row';
    historyRow.innerHTML = `
        <div style="display: flex; justify-content: space-between; width: 100%;">
            <div>
                <button class="history-btn" id="history-back" title="前のシード">←</button>
                <button class="history-btn" id="history-forward" title="次のシード">→</button>
            </div>
            <div>
                <button class="custom-search-btn" id="save-seed">保存</button>
            </div>
        </div>
    `;

    inputSection.appendChild(seedRow);
    inputSection.appendChild(gachaRow);
    inputSection.appendChild(savedSeedsRow);
    inputSection.appendChild(tenRow);
    inputSection.appendChild(historyRow);


    // +ボタンを追加とイベント設定
    setTimeout(() => {
        addPlusButtonToGachaSelect();
        loadOriginalGachaData();
        updateGachaSelectOptions();

        // 10連チェックボックスのイベント設定
        const tenCheckbox = document.getElementById('ten-consecutive-checkbox');
        if (tenCheckbox) {
            tenCheckbox.addEventListener('change', handleTenConsecutiveToggle);
        }

        setInitialEventGachaSeed();
        const seedList = document.getElementById('event-seed-list');
        if (seedList) {
            const seeds = getSavedEventSeeds();
            updateEventSeedList(seedList, seeds);
        }
    }, 100);

    return inputSection;
}

})();

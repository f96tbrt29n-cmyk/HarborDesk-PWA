// 全37通常海域の攻略Wiki敵編成表。scripts/audit-map-air.pyによる2026-10-07取得。
// 本隊用制空値。全掲載司令部レベル・ゲージ段階を含む。基地用には流用しない。
const HD_MAP_AIR_DATA={
 "1-1": {
  "source": "https://wikiwiki.jp/kancolle/鎮守府海域/1-1",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵偵察艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐ハ級",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B： 敵はぐれ艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐ハ級、駆逐ハ級",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C：ボス 敵主力艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級、駆逐ハ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   }
  }
 },
 "1-2": {
  "source": "https://wikiwiki.jp/kancolle/鎮守府海域/1-2",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐ロ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐ロ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐ロ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐ロ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 敵水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級、駆逐ロ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級、駆逐ロ級、駆逐ロ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ホ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ヘ級、駆逐ハ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E：ボス 敵主力艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級、軽巡ホ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級、軽巡ホ級、雷巡チ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級、雷巡チ級、雷巡チ級、駆逐ハ級、駆逐ハ級",
      "air": 0
     }
    ]
   }
  }
 },
 "1-3": {
  "source": "https://wikiwiki.jp/kancolle/鎮守府海域/1-3",
  "checkedAt": "2026-10-07",
  "nodes": {
   "C": {
    "label": "C： 敵前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級、駆逐ハ級、駆逐ハ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級、駆逐ハ級、駆逐ハ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "パターン5と同じ",
      "air": 0
     },
     {
      "name": "パターン7",
      "enemy": "軽巡ヘ級、駆逐ハ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級、駆逐ハ級、駆逐ハ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級、駆逐ハ級、駆逐ハ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "パターン5と同じ",
      "air": 0
     },
     {
      "name": "パターン7",
      "enemy": "軽巡ヘ級、駆逐ハ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 敵支援艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級、雷巡チ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級、重巡リ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J：ボス 敵主力艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級、軽巡ヘ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級、雷巡チ級、軽巡ヘ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級、雷巡チ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   }
  }
 },
 "1-4": {
  "source": "https://wikiwiki.jp/kancolle/鎮守府海域/1-4",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵偵察艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級、軽巡ヘ級、駆逐ハ級、駆逐ハ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級、軽巡ヘ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 敵偵察艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級、軽巡ヘ級、駆逐ハ級、駆逐ハ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級、軽巡ヘ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 敵前衛任務部隊I軍",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級、軽母ヌ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 16
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級、軽母ヌ級、重巡リ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 16
     },
     {
      "name": "パターン3",
      "enemy": "パターン2と同じ",
      "air": 16
     }
    ]
   },
   "I": {
    "label": "I： 敵前衛任務部隊II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 8
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級、軽母ヌ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 16
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級、軽母ヌ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 16
     }
    ]
   },
   "J": {
    "label": "J： 敵支援打撃任務群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級、雷巡チ級、雷巡チ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級、軽母ヌ級、軽巡ヘ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 8
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級、軽母ヌ級、軽母ヌ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 16
     }
    ]
   },
   "L": {
    "label": "L：ボス 敵機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級、重巡リ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 10
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級、重巡リ級、軽巡ヘ級、駆逐ハ級、駆逐ハ級、駆逐ハ級",
      "air": 10
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級、軽母ヌ級、重巡リ級、軽巡ヘ級、駆逐ロ級、駆逐ロ級",
      "air": 18
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級、軽母ヌ級、重巡リ級、軽巡ヘ級、駆逐ハ級、駆逐ハ級",
      "air": 18
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級、空母ヲ級、重巡リ級、軽巡ヘ級、駆逐ハ級、駆逐ハ級",
      "air": 20
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級、空母ヲ級、重巡リ級、軽巡ヘ級、駆逐ニ級、駆逐ニ級",
      "air": 20
     }
    ]
   }
  }
 },
 "1-5": {
  "source": "https://wikiwiki.jp/kancolle/鎮守府海域/1-5",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A：対潜戦 敵偵察潜水艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵通商破壊高速水上艦隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D：対潜戦 敵潜水艦隊B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水ヨ級elite、潜水ヨ級、潜水ヨ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E：対潜戦 敵潜水艦隊C群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F：対潜戦 敵潜水艦隊A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 敵通商破壊高速水上艦隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "I": {
    "label": "I： 敵侵攻機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "パターン1と同編成",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 23
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 28
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 23
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 28
     },
     {
      "name": "パターン7",
      "enemy": "空母ヲ級flagship、軽巡ヘ級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 28
     }
    ]
   },
   "J": {
    "label": "J：ボス*6 敵通商破壊主力潜水艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級flagship、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水ソ級flagship、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン7",
      "enemy": "潜水ソ級flagship、潜水ヨ級elite、潜水ヨ級elite、潜水カ級",
      "air": 0
     }
    ]
   }
  }
 },
 "1-6": {
  "source": "https://wikiwiki.jp/kancolle/鎮守府海域/1-6",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 任務部隊C群前衛部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、軽母ヌ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン5",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C：対潜戦 通商破壊潜水艦隊II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "パターン2と同じ",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "パターン5と同じ",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D：航空戦 任務部隊A群機動部隊(第二波)",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 48
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 48
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 47
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 71
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 76
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 132
     }
    ]
   },
   "E": {
    "label": "E：対潜戦 通商破壊潜水艦隊III群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F：航空戦 任務部隊C群機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級elite、重巡リ級elite、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 27
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 48
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、重巡リ級elite、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 28
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、重巡リ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 47
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、軽母ヌ級、重巡リ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 36
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、重巡リ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 52
     },
     {
      "name": "パターン7",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 52
     },
     {
      "name": "パターン8",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 55
     }
    ]
   },
   "I": {
    "label": "I：対潜戦 通商破壊潜水艦隊I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "パターン3と同じ",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 任務部隊A群機動部隊本隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship、軽巡ヘ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 28
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、軽母ヌ級、軽母ヌ級、駆逐イ級後期型、駆逐イ級後期型、輸送ワ級",
      "air": 44
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、軽母ヌ級、軽母ヌ級、軽母ヌ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 52
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級、軽母ヌ級、軽母ヌ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 108
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級、軽母ヌ級、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 100
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級改flagship、軽母ヌ級、軽母ヌ級、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 118
     }
    ]
   },
   "K": {
    "label": "K： 任務部隊支援水上打撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ト級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級elite、軽巡ト級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "パターン2と同じ",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、戦艦ル級elite、軽巡ト級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "パターン4と同じ",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L：航空戦 任務部隊A群機動部隊(第一波)",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 47
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級",
      "air": 71
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級",
      "air": 76
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級",
      "air": 132
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級elite、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級",
      "air": 135
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship（艦載機白）、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級、駆逐イ級",
      "air": 192
     }
    ]
   }
  }
 },
 "2-1": {
  "source": "https://wikiwiki.jp/kancolle/南西諸島海域/2-1",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵上陸船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、軽巡ホ級elite、輸送ワ級、輸送ワ級、駆逐イ級、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite、軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、駆逐イ級、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級elite、軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 24
     }
    ]
   },
   "C": {
    "label": "C： 敵前衛部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級elite、軽巡ヘ級、軽巡ヘ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級elite、軽巡ヘ級、軽巡ヘ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級elite、重巡リ級elite、軽巡ヘ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 敵護衛空母群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級、軽母ヌ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 16
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite、軽母ヌ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 32
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 48
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 48
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、軽巡ホ級elite、駆逐イ級、駆逐イ級",
      "air": 48
     },
     {
      "name": "パターン6",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 48
     }
    ]
   },
   "F": {
    "label": "F： 敵機動部隊群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級、空母ヲ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 20
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級elite、空母ヲ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 37
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級elite、空母ヲ級elite、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 54
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級elite、空母ヲ級elite、重巡リ級elite、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 54
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級elite、空母ヲ級elite、重巡リ級elite、軽巡ホ級elite、駆逐イ級、駆逐イ級",
      "air": 54
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級elite、空母ヲ級elite、重巡リ級elite、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 54
     }
    ]
   },
   "H": {
    "label": "H：ボス 敵主力部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級、空母ヲ級、軽母ヌ級、重巡リ級、駆逐イ級、駆逐イ級",
      "air": 18
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級elite、空母ヲ級、軽母ヌ級、重巡リ級、駆逐イ級、駆逐イ級",
      "air": 18
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級elite、空母ヲ級elite、軽母ヌ級elite、重巡リ級、駆逐イ級、駆逐イ級",
      "air": 51
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級elite、空母ヲ級elite、空母ヲ級elite、重巡リ級、駆逐イ級、駆逐イ級",
      "air": 54
     },
     {
      "name": "パターン5",
      "enemy": "戦艦ル級elite、空母ヲ級elite、空母ヲ級elite、重巡リ級elite、駆逐イ級、駆逐イ級",
      "air": 54
     },
     {
      "name": "パターン6",
      "enemy": "戦艦ル級elite、空母ヲ級elite、空母ヲ級elite、重巡リ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 54
     }
    ]
   }
  }
 },
 "2-2": {
  "source": "https://wikiwiki.jp/kancolle/南西諸島海域/2-2",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵上陸船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級、輸送ワ級、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、輸送ワ級、輸送ワ級、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級elite、輸送ワ級elite、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "輸送ワ級elite、輸送ワ級elite、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 敵上陸船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級、輸送ワ級、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、輸送ワ級、輸送ワ級、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級elite、輸送ワ級elite、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "輸送ワ級elite、輸送ワ級elite、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級、雷巡チ級、雷巡チ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、雷巡チ級、雷巡チ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級elite、雷巡チ級elite、雷巡チ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 敵水上打撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級、戦艦ル級、軽巡ホ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級elite、戦艦ル級、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級elite、戦艦ル級elite、重巡リ級elite、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K：ボス 敵通商破壊機動部隊 主力艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、重巡リ級elite、軽巡ホ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級elite、重巡リ級elite、軽巡ホ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級elite、重巡リ級elite、重巡リ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級elite、重巡リ級elite、重巡リ級elite、軽巡ヘ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 27
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級elite、戦艦ル級elite、戦艦ル級elite、軽巡ヘ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 27
     }
    ]
   }
  }
 },
 "2-3": {
  "source": "https://wikiwiki.jp/kancolle/南西諸島海域/2-3",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵前衛警戒部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "パターン4と同じ",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵前衛警戒部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級elite、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "パターン4と同じ",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 敵水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級elite、雷巡チ級、雷巡チ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、雷巡チ級、雷巡チ級、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級elite、雷巡チ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 敵巡洋艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "雷巡チ級elite、重巡リ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級elite、重巡リ級、雷巡チ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級elite、重巡リ級elite、雷巡チ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級elite、重巡リ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "重巡リ級elite、重巡リ級elite、雷巡チ級elite、軽巡ヘ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K： 敵巡洋艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "雷巡チ級elite、重巡リ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級elite、重巡リ級、雷巡チ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級elite、重巡リ級elite、雷巡チ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級elite、重巡リ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "重巡リ級elite、重巡リ級elite、雷巡チ級elite、軽巡ヘ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M： 敵揚陸艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級elite、輸送ワ級、輸送ワ級、輸送ワ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、輸送ワ級、輸送ワ級、輸送ワ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級elite、輸送ワ級elite、輸送ワ級、輸送ワ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、輸送ワ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ホ級elite、輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "N": {
    "label": "N：ボス 敵主力打撃群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級elite、空母ヲ級、軽母ヌ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 18
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級elite、空母ヲ級elite、軽母ヌ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 35
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級elite、空母ヲ級elite、軽母ヌ級elite、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 51
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級elite、空母ヲ級elite、軽母ヌ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 51
     },
     {
      "name": "パターン5",
      "enemy": "戦艦ル級flagship、空母ヲ級elite、軽母ヌ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 51
     },
     {
      "name": "パターン6",
      "enemy": "戦艦ル級flagship、空母ヲ級elite、軽母ヌ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級",
      "air": 51
     },
     {
      "name": "パターン7",
      "enemy": "戦艦ル級flagship、空母ヲ級elite、軽母ヌ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 51
     },
     {
      "name": "パターン8",
      "enemy": "戦艦ル級flagship、空母ヲ級elite、空母ヲ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 54
     }
    ]
   }
  }
 },
 "2-4": {
  "source": "https://wikiwiki.jp/kancolle/南西諸島海域/2-4",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵前衛巡洋艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級elite、重巡リ級、重巡リ級、軽巡ホ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級elite、重巡リ級elite、重巡リ級、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級elite、重巡リ級elite、重巡リ級、軽巡ヘ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級elite、重巡リ級elite、重巡リ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵侵攻高速軽快部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 前衛機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、軽母ヌ級、重巡リ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 32
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 48
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 48
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 48
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 48
     },
     {
      "name": "パターン6",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 47
     }
    ]
   },
   "I": {
    "label": "I： 敵精鋭水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "パターン5と同じ",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L： 敵機動部隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級elite、空母ヲ級elite、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 54
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 55
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 55
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、重巡リ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     }
    ]
   },
   "M": {
    "label": "M： 敵機動部隊A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級elite、空母ヲ級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 54
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 55
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、戦艦ル級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 55
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     }
    ]
   },
   "P": {
    "label": "P：ボス 敵侵攻中核水上打撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級elite、戦艦ル級elite、戦艦ル級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級elite、戦艦ル級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、戦艦ル級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   }
  }
 },
 "2-5": {
  "source": "https://wikiwiki.jp/kancolle/南西諸島海域/2-5",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵侵攻前衛艦隊B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵侵攻前衛艦隊A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 23
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、重巡リ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "E": {
    "label": "E： 敵侵攻重巡戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 敵侵攻水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級elite、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 敵侵攻水上打撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、重巡リ級flagship、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、重巡リ級flagship、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L： 敵侵攻機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級elite、軽母ヌ級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 51
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 52
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 52
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、軽母ヌ級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 76
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、軽母ヌ級elite、戦艦ル級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 76
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、軽母ヌ級flagship、軽母ヌ級elite、戦艦ル級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 75
     },
     {
      "name": "パターン7",
      "enemy": "空母ヲ級flagship、軽母ヌ級flagship、軽母ヌ級flagship、戦艦ル級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 74
     }
    ]
   },
   "O": {
    "label": "O：ボス 敵侵攻中核艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、戦艦ル級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 28
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 28
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 28
     }
    ]
   }
  }
 },
 "3-1": {
  "source": "https://wikiwiki.jp/kancolle/北方海域/3-1",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵哨戒艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵通商破壊侵入水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 敵北方支援任務部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite、重巡リ級elite、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、重巡リ級elite、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン6",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "F": {
    "label": "F： 敵北方任務部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G：ボス 敵北方侵攻艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、輸送ワ級elite",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、輸送ワ級elite",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級flagship、駆逐ロ級後期型、駆逐ロ級後期型、輸送ワ級elite",
      "air": 28
     }
    ]
   }
  }
 },
 "3-2": {
  "source": "https://wikiwiki.jp/kancolle/北方海域/3-2",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵北方遊撃任務部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級elite、重巡リ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級elite、重巡リ級elite、軽巡ヘ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級elite、重巡リ級elite、重巡リ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級elite、重巡リ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン6",
      "enemy": "軽母ヌ級elite、重巡リ級elite、重巡リ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     }
    ]
   },
   "C": {
    "label": "C： 敵水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "雷巡チ級elite、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 敵北方水上打撃艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級elite、重巡リ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級elite、戦艦ル級elite、重巡リ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 敵北方攻撃任務群 先遣護衛戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ホ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K： 敵北方攻撃任務群 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級elite、空母ヲ級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 54
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 55
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、戦艦ル級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 55
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級elite、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、戦艦ル級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、戦艦ル級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 56
     }
    ]
   },
   "L": {
    "label": "L：ボス 敵キス島包囲艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、輸送ワ級、輸送ワ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、駆逐ハ級後期型、駆逐ハ級後期型、輸送ワ級、輸送ワ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ヘ級elite、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型、輸送ワ級elite",
      "air": 0
     }
    ]
   }
  }
 },
 "3-3": {
  "source": "https://wikiwiki.jp/kancolle/北方海域/3-3",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、重巡リ級elite、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、重巡リ級elite、軽巡ト級elite(A)、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B： 敵北方巡洋艦戦隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ト級elite(A)、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵北方護衛空母群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 72
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、軽母ヌ級elite、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 71
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、軽母ヌ級elite、重巡リ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 71
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、軽母ヌ級elite、重巡リ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 70
     }
    ]
   },
   "G": {
    "label": "G： 敵北方機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級elite、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 52
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級elite、軽巡ホ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 52
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級elite、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 52
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 52
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、軽母ヌ級flagship、戦艦ル級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 51
     }
    ]
   },
   "K": {
    "label": "K： 敵北方巡洋艦戦隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ト級elite(A)、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ト級elite(A)、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、雷巡チ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、重巡リ級flagship、雷巡チ級flagship、軽巡ト級elite(A)、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "重巡リ級flagship、重巡リ級flagship、雷巡チ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M：ボス 敵深海北方泊地艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級elite、軽母ヌ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級elite、軽母ヌ級elite、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級elite、軽母ヌ級elite、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 24
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽母ヌ級elite、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 24
     },
     {
      "name": "パターン5",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽母ヌ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     }
    ]
   }
  }
 },
 "3-4": {
  "source": "https://wikiwiki.jp/kancolle/北方海域/3-4",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵北方艦隊 哨戒部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ト級elite(A)、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ト級elite(A)、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B： 敵北方艦隊 哨戒部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ト級elite(A)、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ト級elite(A)、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵北方艦隊 前衛部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級elite、軽母ヌ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級elite、軽母ヌ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽母ヌ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "G": {
    "label": "G： 敵北方艦隊 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級elite、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 28
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 28
     }
    ]
   },
   "H": {
    "label": "H： 敵北方艦隊 重水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、雷巡チ級elite、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M： 敵北方艦隊 泊地防衛部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽母ヌ級flagship、軽母ヌ級flagship、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 46
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽母ヌ級flagship、軽母ヌ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 46
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、軽母ヌ級flagship、軽母ヌ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 46
     }
    ]
   },
   "N": {
    "label": "N： 敵北方艦隊 泊地防衛部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽母ヌ級flagship、軽母ヌ級flagship、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 46
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽母ヌ級flagship、軽母ヌ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 46
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、軽母ヌ級flagship、軽母ヌ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 46
     }
    ]
   },
   "P": {
    "label": "P：ボス 深海棲艦 北方艦隊中枢",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ハ級後期型",
      "air": 56
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship",
      "air": 56
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、戦艦ル級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 56
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級flagship、戦艦ル級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 28
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ハ級後期型",
      "air": 28
     }
    ]
   }
  }
 },
 "3-5": {
  "source": "https://wikiwiki.jp/kancolle/北方海域/3-5",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 北方前衛警戒部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、戦艦タ級elite、重巡リ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、戦艦タ級elite、重巡リ級elite、重巡リ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、重巡リ級flagship、戦艦タ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 北方派遣任務部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship、戦艦タ級flagship、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 112
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship、戦艦タ級flagship、重巡リ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 112
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship、空母ヲ級flagship（艦載機白）、戦艦タ級flagship、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 186
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship、戦艦タ級flagship、重巡リ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 112
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級改flagship、空母ヲ級flagship（艦載機白）、空母ヲ級flagship、戦艦タ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 214
     }
    ]
   },
   "E": {
    "label": "E： 北方遊撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、駆逐ハ級後期型、駆逐ハ級後期型、潜水カ級flagship、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン2 最終形態",
      "enemy": "軽母ヌ級flagship、戦艦ル級flagship、戦艦ル級flagship、駆逐ハ級後期型、駆逐ハ級後期型、潜水カ級flagship",
      "air": 23
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "軽母ヌ級flagship、戦艦ル級flagship、戦艦ル級flagship、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級flagship",
      "air": 23
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、駆逐ハ級後期型、駆逐イ級後期型、駆逐イ級後期型、潜水カ級flagship",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 北方増援部隊前衛A",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、重巡リ級elite、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2 最終形態",
      "enemy": "軽巡ヘ級flagship、重巡リ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、雷巡チ級elite、雷巡チ級elite、雷巡チ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、重巡リ級elite、雷巡チ級elite、雷巡チ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 北方増援部隊前衛B",
    "patterns": [
     {
      "name": "パターン2 最終形態",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、重巡リ級elite、駆逐ハ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級elite、軽巡ト級elite(A)、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、重巡リ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 23
     },
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、重巡リ級elite、軽巡ト級elite(A)、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 北方AL泊地",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "北方棲姫（前哨戦 強）、護衛要塞（A）、護衛要塞（B）、重巡リ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 134
     },
     {
      "name": "パターン2",
      "enemy": "北方棲姫（前哨戦 強）、護衛要塞（A）、護衛要塞（B）、護衛要塞（C）、護衛要塞（B）、護衛要塞（C）",
      "air": 221
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "北方棲姫（最終形態 強）、護衛要塞（A）、護衛要塞（B）、護衛要塞（C）、護衛要塞（B）、護衛要塞（C）",
      "air": 254
     },
     {
      "name": "パターン4",
      "enemy": "北方棲姫（前哨戦 弱）、護衛要塞（A）、護衛要塞（B）、重巡リ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 130
     },
     {
      "name": "パターン5",
      "enemy": "北方棲姫（前哨戦 弱）、護衛要塞（A）、護衛要塞（B）、護衛要塞（C）、護衛要塞（B）、護衛要塞（C）",
      "air": 217
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "北方棲姫（最終形態 弱）、護衛要塞（A）、護衛要塞（B）、護衛要塞（C）、護衛要塞（B）、護衛要塞（C）",
      "air": 250
     }
    ]
   },
   "K": {
    "label": "K：ボス 北方増援部隊主力",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ツ級、輸送ワ級elite、輸送ワ級elite、戦艦ル級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2 最終形態",
      "enemy": "軽巡ツ級、輸送ワ級flagship、輸送ワ級flagship、戦艦タ級flagship、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ツ級、輸送ワ級elite、輸送ワ級elite、戦艦ル級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "軽巡ツ級、輸送ワ級flagship、輸送ワ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ツ級、輸送ワ級elite、輸送ワ級elite、戦艦タ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   }
  }
 },
 "4-1": {
  "source": "https://wikiwiki.jp/kancolle/西方海域/4-1",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、雷巡チ級elite、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、雷巡チ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵哨戒艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ヘ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ヘ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D：対潜戦 （通常消費） 敵東方潜水艦隊 警戒隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級、潜水カ級、潜水カ級、軽巡ホ級elite、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、軽巡ホ級elite、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級、軽巡ホ級elite、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵増援強襲輸送船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級flagship、輸送ワ級elite、輸送ワ級elite、戦艦ル級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、戦艦ル級elite、戦艦ル級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、戦艦ル級flagship、戦艦ル級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 東方艦隊 先遣戦艦部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級elite、戦艦タ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級elite、戦艦タ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級elite、戦艦タ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 敵深海連合巡洋艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J：ボス 敵深海連合部隊 司令部艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級elite、重巡リ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽母ヌ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン5",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽母ヌ級elite、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン6",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽母ヌ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   }
  }
 },
 "4-2": {
  "source": "https://wikiwiki.jp/kancolle/西方海域/4-2",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵東方前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、重巡リ級elite、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B：対潜戦 （通常消費） 敵潜水教導艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、軽巡ト級elite(A)、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級、軽巡ト級elite(A)、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級、軽巡ト級elite(A)",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵東方艦隊 遊撃戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "D": {
    "label": "D： 敵空母機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 52
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級elite、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 52
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 52
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 56
     }
    ]
   },
   "E": {
    "label": "E： 敵東方艦隊 遊撃戦隊分遣隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、軽巡ホ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "G": {
    "label": "G： 敵東方艦隊 上陸輸送船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級flagship、輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H：対潜戦 敵潜水哨戒部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L：ボス 敵東方艦隊 強襲上陸主力艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、空母ヲ級elite、輸送ワ級、輸送ワ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 27
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、空母ヲ級flagship、輸送ワ級elite、輸送ワ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 28
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級flagship、空母ヲ級flagship、輸送ワ級flagship、輸送ワ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 28
     }
    ]
   }
  }
 },
 "4-3": {
  "source": "https://wikiwiki.jp/kancolle/西方海域/4-3",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A：対潜戦 （通常消費） 敵東方潜水艦隊 哨戒分遣集団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、軽巡ト級elite(A)",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、軽巡ト級elite(A)、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C：対潜戦 （通常消費）敵東方潜水艦隊 哨戒主力集団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 敵東方哨戒艦隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ヘ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 敵東方空母機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、戦艦タ級elite、軽巡ホ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 47
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦タ級elite、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 52
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦タ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 52
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、軽母ヌ級flagship、戦艦タ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 51
     }
    ]
   },
   "G": {
    "label": "G： 敵東方哨戒艦隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 敵東方空母機動部隊 分遣群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、戦艦タ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、戦艦タ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、戦艦タ級elite、重巡リ級elite、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級flagship、戦艦タ級elite、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級flagship、戦艦タ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     }
    ]
   },
   "I": {
    "label": "I： 敵東方艦隊 増援戦艦部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、戦艦タ級elite、軽母ヌ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級elite、軽母ヌ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級flagship、戦艦タ級elite、軽母ヌ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン4",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽母ヌ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "L": {
    "label": "L： 敵哨戒艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ヘ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ヘ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級elite、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "N": {
    "label": "N：ボス 敵東方港湾基地",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "港湾棲姫（前哨戦）、駆逐イ級、輸送ワ級、輸送ワ級",
      "air": 80
     },
     {
      "name": "パターン2",
      "enemy": "港湾棲姫（前哨戦）、駆逐イ級、駆逐イ級、輸送ワ級、輸送ワ級",
      "air": 80
     },
     {
      "name": "パターン3",
      "enemy": "港湾棲姫（前哨戦）、軽巡ト級elite(A)、駆逐イ級、駆逐イ級、輸送ワ級、輸送ワ級",
      "air": 80
     },
     {
      "name": "パターン4",
      "enemy": "港湾棲姫（前哨戦）、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐イ級、輸送ワ級、輸送ワ級",
      "air": 80
     },
     {
      "name": "パターン5",
      "enemy": "港湾棲姫（前哨戦）、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型、輸送ワ級、輸送ワ級",
      "air": 80
     },
     {
      "name": "パターン6",
      "enemy": "港湾棲姫（前哨戦）、軽母ヌ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、輸送ワ級、輸送ワ級",
      "air": 103
     }
    ]
   }
  }
 },
 "4-4": {
  "source": "https://wikiwiki.jp/kancolle/西方海域/4-4",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 敵東方哨戒艦隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ヘ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B： 敵東方哨戒艦隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵潜水艦哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 敵東方空母機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、戦艦タ級elite、軽巡ホ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 47
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽母ヌ級elite、戦艦タ級elite、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 47
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦タ級elite、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 52
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、軽母ヌ級elite、戦艦タ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 52
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship、軽母ヌ級flagship、戦艦タ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 51
     }
    ]
   },
   "G": {
    "label": "G： 敵東方艦隊 新鋭戦艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽母ヌ級elite、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽母ヌ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     }
    ]
   },
   "H": {
    "label": "H： 敵東方艦隊 残存部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐イ級、潜水ヨ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ト級elite(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、戦艦ル級flagship、重巡リ級flagship、重巡リ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、戦艦ル級flagship、重巡リ級flagship、重巡リ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 28
     }
    ]
   },
   "I": {
    "label": "I： 敵東方中枢艦隊 護衛戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K：ボス 敵東方中枢艦隊 旗艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、戦艦タ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、輸送ワ級",
      "air": 23
     },
     {
      "name": "パターン2",
      "enemy": "装甲空母姫、戦艦タ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、輸送ワ級",
      "air": 48
     },
     {
      "name": "パターン3",
      "enemy": "装甲空母姫、戦艦タ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 48
     }
    ]
   }
  }
 },
 "4-5": {
  "source": "https://wikiwiki.jp/kancolle/西方海域/4-5",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B：対潜戦 東洋方面潜水艦隊 哨戒線Cライン",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級elite、潜水ヨ級、潜水ヨ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級elite、潜水ヨ級elite、潜水ヨ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級elite、潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D：対潜戦 東洋方面潜水艦隊 哨戒線Bライン",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級flagship、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級flagship、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水ヨ級flagship、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 東洋方面艦隊 威力偵察部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級改flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級改flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級改flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F：対潜戦 東洋方面潜水艦隊 哨戒線Aライン",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 東洋方面艦隊 威力偵察部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級改flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級改flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級改flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 東洋方面艦隊 新編水上打撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級改flagship、戦艦タ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級改flagship、戦艦タ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級改flagship、戦艦タ級elite、戦艦タ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 東洋方面艦隊 突撃水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "雷巡チ級flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "雷巡チ級flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "雷巡チ級flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K： 深海東洋艦隊 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡棲鬼(A)、空母ヲ級flagship(艦載機白)、空母ヲ級flagship、戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship",
      "air": 112
     },
     {
      "name": "パターン2",
      "enemy": "軽巡棲鬼(A)、空母ヲ級flagship(艦載機白)、空母ヲ級flagship、戦艦ル級改flagship、戦艦ル級flagship、軽巡ヘ級flagship",
      "air": 112
     },
     {
      "name": "パターン3",
      "enemy": "軽巡棲鬼(B)、空母ヲ級flagship、戦艦ル級改flagship、戦艦ル級改flagship、重巡ネ級elite、軽巡ヘ級flagship",
      "air": 28
     },
     {
      "name": "パターン4",
      "enemy": "軽巡棲鬼(B)、空母ヲ級flagship(艦載機白)、空母ヲ級flagship、戦艦ル級改flagship、戦艦ル級改flagship、軽巡ヘ級flagship",
      "air": 112
     },
     {
      "name": "パターン5",
      "enemy": "軽巡棲鬼(B)、空母ヲ級flagship(艦載機白)、空母ヲ級flagship(艦載機白)、戦艦ル級改flagship、戦艦ル級改flagship、軽巡ヘ級flagship",
      "air": 168
     }
    ]
   },
   "N": {
    "label": "N： 東洋方面艦隊 後方兵站部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級flagship、輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "O": {
    "label": "O：対潜戦 深海東洋方面増援潜水艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級elite、潜水ソ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級elite、潜水ソ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "S": {
    "label": "S： 深海東洋方面増援艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 23
     }
    ]
   },
   "T": {
    "label": "T：ボス リランカ島港湾守備隊 ゲージ撃破後の出現率は パターン1:2:3=2:3:5",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "港湾棲姫、護衛要塞(B)、護衛要塞(C)、戦艦ル級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 138
     },
     {
      "name": "パターン2",
      "enemy": "港湾棲姫、護衛要塞(B)、護衛要塞(C)、戦艦ル級改flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 138
     },
     {
      "name": "パターン3",
      "enemy": "港湾棲姫、護衛要塞(B)、護衛要塞(C)、戦艦ル級改flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 138
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "港湾棲姫(最終形態)、護衛要塞(A)、戦艦ル級改flagship、重巡ネ級elite、輸送ワ級elite、輸送ワ級elite",
      "air": 82
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "港湾棲姫(最終形態)、護衛要塞(B)、戦艦ル級改flagship、重巡ネ級elite、輸送ワ級flagship、輸送ワ級elite",
      "air": 82
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "港湾棲姫(最終形態)、護衛要塞(A)、護衛要塞(B)、戦艦ル級改flagship、重巡ネ級elite、輸送ワ級flagship",
      "air": 111
     }
    ]
   }
  }
 },
 "5-1": {
  "source": "https://wikiwiki.jp/kancolle/南方海域/5-1",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵南方前衛哨戒艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ホ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 敵南方空母機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship、空母ヲ級elite、軽母ヌ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 79
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、軽母ヌ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 80
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、軽母ヌ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 80
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship、空母ヲ級flagship、軽母ヌ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 79
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship、軽母ヌ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 135
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship（艦載機白）、軽母ヌ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 191
     }
    ]
   },
   "E": {
    "label": "E：対潜戦 (エフェクトなし) 敵潜水艦南方哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 敵南方任務部隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite、重巡ネ級、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite、重巡ネ級elite、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "戦艦タ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 敵南方任務部隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、戦艦タ級elite、軽母ヌ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽母ヌ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽母ヌ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "J": {
    "label": "J：ボス 敵南方前線司令艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級flagship、戦艦タ級flagship、戦艦タ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship（艦載機白）、戦艦タ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 84
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship（艦載機白）、戦艦タ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 168
     }
    ]
   }
  }
 },
 "5-2": {
  "source": "https://wikiwiki.jp/kancolle/南方海域/5-2",
  "checkedAt": "2026-10-07",
  "nodes": {
   "C": {
    "label": "C：空襲戦 敵任務部隊 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機白)、空母ヲ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 112
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機白)、空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 168
     }
    ]
   },
   "D": {
    "label": "D： 敵任務部隊 随伴部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite、潜水カ級、軽巡ホ級flagship、駆逐イ級、駆逐イ級、輸送ワ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵任務部隊 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機白)、戦艦タ級elite、軽巡ヘ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機白)、戦艦タ級flagship、軽巡ヘ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機白)、戦艦タ級flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     }
    ]
   },
   "F": {
    "label": "F： 敵任務部隊 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     }
    ]
   },
   "I": {
    "label": "I：航空戦 敵任務部隊 機動部隊本隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship、空母ヲ級改flagship、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 204
     },
     {
      "name": "パターン2",
      "enemy": "空母棲鬼(艦載機赤)、重巡ネ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 117
     },
     {
      "name": "パターン3",
      "enemy": "空母棲鬼(艦載機赤)、空母ヲ級改flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 219
     }
    ]
   },
   "K": {
    "label": "K： 敵任務部隊 随伴護衛戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L：空襲戦 敵任務部隊 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機白)、空母ヲ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 112
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機白)、空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 168
     }
    ]
   },
   "O": {
    "label": "O：ボス 敵任務部隊 機動部隊本隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship、重巡ネ級、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 102
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship、重巡ネ級elite、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 102
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship、重巡ネ級elite、重巡ネ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 102
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship、重巡ネ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 102
     },
     {
      "name": "パターン5",
      "enemy": "空母棲鬼(艦載機赤)、重巡ネ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 117
     }
    ]
   }
  }
 },
 "5-3": {
  "source": "https://wikiwiki.jp/kancolle/南方海域/5-3",
  "checkedAt": "2026-10-07",
  "nodes": {
   "C": {
    "label": "C： 敵鉄底海峡任務部隊 哨戒隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "I": {
    "label": "I：夜戦 敵鉄底海峡任務部隊 重巡戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級elite、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ホ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J：夜戦 敵任務部隊 前衛哨戒隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、重巡ネ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K：夜戦 敵鉄底海峡任務部隊 増援艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡ネ級、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡ネ級elite、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡ネ級elite、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M： 敵任務部隊 増援部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級elite、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 108
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級elite、重巡ネ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 108
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 108
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship（艦載機白）、軽母ヌ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 107
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship（艦載機白）、軽母ヌ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 191
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship（艦載機白）、空母ヲ級flagship（艦載機白）、空母ヲ級flagship（艦載機白）、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 252
     }
    ]
   },
   "N": {
    "label": "N：夜戦 敵南方支援艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "雷巡チ級flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "P": {
    "label": "P：夜戦 敵泊地投錨中 輸送船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "輸送ワ級flagship、輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、輸送ワ級flagship、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "Q": {
    "label": "Q：ボス 敵南方艦隊 旗艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "南方棲戦姫、軽巡ツ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 47
     },
     {
      "name": "パターン2",
      "enemy": "南方棲戦姫、雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 47
     },
     {
      "name": "パターン3",
      "enemy": "南方棲戦姫、軽母ヌ級flagship、軽母ヌ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 93
     }
    ]
   }
  }
 },
 "5-4": {
  "source": "https://wikiwiki.jp/kancolle/南方海域/5-4",
  "checkedAt": "2026-10-07",
  "nodes": {
   "C": {
    "label": "C： 敵南方増援部隊 前方警戒艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 敵鉄底海峡哨戒隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F：夜戦 深海水上打撃群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、重巡リ級elite、重巡リ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、重巡リ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 敵南方増援部隊 機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、重巡ネ級、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 206
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、戦艦タ級flagship、駆逐ハ級後期型、駆逐イ級、駆逐イ級",
      "air": 206
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級",
      "air": 206
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 206
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 206
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ハ級後期型",
      "air": 206
     }
    ]
   },
   "H": {
    "label": "H：夜戦 敵鉄底海峡巡洋艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、軽巡ヘ級elite、軽巡ホ級elite、駆逐ハ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級elite、軽巡ヘ級elite、軽巡ホ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級elite、重巡リ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J：夜戦 敵泊地投錨中 輸送船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級elite、輸送ワ級、輸送ワ級、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "輸送ワ級elite、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "輸送ワ級flagship、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L： 敵南方増援部隊 本隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "P": {
    "label": "P：ボス 敵南方増援部隊 本隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級flagship、軽母ヌ級flagship(艦載機赤)、戦艦ル級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 93
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級flagship、軽母ヌ級flagship(艦載機赤)、戦艦ル級flagship、重巡ネ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 93
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級flagship、軽母ヌ級flagship(艦載機赤)、戦艦ル級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 93
     },
     {
      "name": "パターン4",
      "enemy": "輸送ワ級flagship、軽母ヌ級flagship(艦載機赤)、戦艦ル級flagship、重巡ネ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 93
     },
     {
      "name": "パターン5",
      "enemy": "輸送ワ級flagship、軽母ヌ級flagship(艦載機赤)、戦艦タ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 93
     },
     {
      "name": "パターン6",
      "enemy": "輸送ワ級flagship、軽母ヌ級flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 93
     }
    ]
   }
  }
 },
 "5-5": {
  "source": "https://wikiwiki.jp/kancolle/南方海域/5-5",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B：対潜戦 深海南方潜水艦隊 哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 敵哨戒水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G：夜戦 敵哨戒重巡戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級elite、重巡リ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、重巡リ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 敵機動部隊 C群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 46
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship、軽母ヌ級flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 125
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship、空母ヲ級改flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 204
     }
    ]
   },
   "J": {
    "label": "J： 敵機動部隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship、軽母ヌ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水カ級",
      "air": 125
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship、空母ヲ級改flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水カ級",
      "air": 204
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship、空母ヲ級改flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水カ級elite",
      "air": 204
     }
    ]
   },
   "K": {
    "label": "K： 敵機動部隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship、軽母ヌ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 125
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship、空母ヲ級改flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 204
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship、空母ヲ級改flagship、軽母ヌ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 227
     }
    ]
   },
   "M": {
    "label": "M：夜戦 敵新鋭戦艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "N": {
    "label": "N： 深海南方任務部隊 重水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "雷巡チ級flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "P": {
    "label": "P： 深海南方任務部隊 水上打撃群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 94
     },
     {
      "name": "パターン2",
      "enemy": "戦艦レ級、戦艦ル級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 94
     },
     {
      "name": "パターン3",
      "enemy": "戦艦レ級、戦艦ル級flagship、戦艦ル級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 94
     },
     {
      "name": "パターン4",
      "enemy": "戦艦レ級elite、戦艦ル級flagship、戦艦ル級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 107
     },
     {
      "name": "パターン5",
      "enemy": "戦艦レ級elite、戦艦ル級flagship、戦艦ル級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 107
     },
     {
      "name": "パターン6",
      "enemy": "戦艦レ級elite、重巡ネ級elite、重巡ネ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 107
     }
    ]
   },
   "S": {
    "label": "S：ボス 深海南方任務部隊 本隊 ゲージ破壊\"前\"の出現率は パターン 1:2:3:4:5=25:15:26:10:24*11 ゲージ破壊\"後\"の出現率は パターン 6:7:8=27:34:39*12",
    "patterns": [
     {
      "name": "パターン1 クリア前のみ",
      "enemy": "南方棲戦姫、空母ヲ級flagship(艦載機白)、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 131
     },
     {
      "name": "パターン2 クリア前のみ",
      "enemy": "空母ヲ級改flagship、南方棲戦姫、重巡ネ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 149
     },
     {
      "name": "パターン3 クリア前のみ",
      "enemy": "空母ヲ級改flagship、空母ヲ級改flagship、南方棲戦姫、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 251
     },
     {
      "name": "パターン4 クリア前のみ",
      "enemy": "南方棲戦姫、戦艦レ級elite、戦艦レ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 261
     },
     {
      "name": "パターン5 クリア前のみ",
      "enemy": "南方棲戦姫、戦艦レ級elite、戦艦レ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 261
     },
     {
      "name": "パターン6 クリア後のみ",
      "enemy": "空母ヲ級flagship(艦載機白)、戦艦レ級elite、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 191
     },
     {
      "name": "パターン7 クリア後のみ",
      "enemy": "空母ヲ級改flagship、空母ヲ級flagship、戦艦レ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級elite",
      "air": 237
     },
     {
      "name": "パターン8 クリア後のみ",
      "enemy": "戦艦レ級elite、戦艦タ級flagship、空母ヲ級flagship(艦載機白)、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級elite",
      "air": 191
     }
    ]
   }
  }
 },
 "5-6": {
  "source": "https://wikiwiki.jp/kancolle/南方海域/5-6",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 深海南方部隊 前方遊撃哨戒群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、潜水カ級",
      "air": 0
     }
    ]
   },
   "A1": {
    "label": "A1： 深海南方方面 先遣偵察戦隊 I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "A2": {
    "label": "A2： 深海南方方面 先遣偵察戦隊 II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型、潜水ヨ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B：対潜戦 深海南方潜水艦隊 前方哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C：空襲戦 深海南方方面 基地航空隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "飛行場姫(空襲)(F)",
      "air": 32
     },
     {
      "name": "パターン2",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 103
     },
     {
      "name": "パターン3",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(空襲)(F)",
      "air": 64
     },
     {
      "name": "パターン4",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 135
     },
     {
      "name": "パターン5",
      "enemy": "飛行場姫(空襲)(A)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 137
     },
     {
      "name": "パターン6",
      "enemy": "飛行場姫(空襲)(A)、飛行場姫(空襲)(F)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 169
     }
    ]
   },
   "C1": {
    "label": "C1：空襲戦 深海南方方面 基地航空隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "飛行場姫(空襲)(F)",
      "air": 32
     },
     {
      "name": "パターン2",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 103
     },
     {
      "name": "パターン3",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(空襲)(F)",
      "air": 64
     },
     {
      "name": "パターン4",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 135
     },
     {
      "name": "パターン5",
      "enemy": "飛行場姫(空襲)(A)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 137
     },
     {
      "name": "パターン6",
      "enemy": "飛行場姫(空襲)(A)、飛行場姫(空襲)(F)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 169
     }
    ]
   },
   "C2": {
    "label": "C2： 深海南方根拠地隊 水雷艇集団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "PT小鬼群(D)、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(A)、PT小鬼群(A)",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "PT小鬼群(D)、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(A)、PT小鬼群(A)、PT小鬼群(A)",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "PT小鬼群(D)、PT小鬼群(D)、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(A)、PT小鬼群(A)",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D：空襲戦 深海南方方面 基地航空隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "飛行場姫(空襲)(F)",
      "air": 32
     },
     {
      "name": "パターン2",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 103
     },
     {
      "name": "パターン3",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(空襲)(F)",
      "air": 64
     },
     {
      "name": "パターン4",
      "enemy": "飛行場姫(空襲)(F)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 135
     },
     {
      "name": "パターン5",
      "enemy": "飛行場姫(空襲)(A)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 137
     },
     {
      "name": "パターン6",
      "enemy": "飛行場姫(空襲)(A)、飛行場姫(空襲)(F)、飛行場姫(空襲)(F)、飛行場姫(偵察)(A)",
      "air": 169
     }
    ]
   },
   "G": {
    "label": "G：第一ボス(輸送) 深海南方艦隊 ラエ増援阻止集団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "南方棲戦姫、雷巡チ級flagship、雷巡チ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 47
     },
     {
      "name": "パターン2",
      "enemy": "南方棲戦姫、軽母ヌ級elite(B)(艦載機白)、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 116
     },
     {
      "name": "パターン3 ゲージ破壊後",
      "enemy": "軽母ヌ級flagship(C)(艦載機赤)、輸送ワ級flagship、雷巡チ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 93
     }
    ]
   },
   "H": {
    "label": "H：対潜戦 深海潜水艦隊 ラバウル哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 深海南方任務部隊 前方哨戒群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、潜水ヨ級",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K：対潜戦 深海潜水艦隊 東南哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "K1": {
    "label": "K1：空襲戦 深海南方任務部隊 艦載機群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 108
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite(B)(艦載機白)、軽母ヌ級elite(B)(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 138
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、軽母ヌ級flagship(C)(艦載機赤)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 177
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 216
     }
    ]
   },
   "K2": {
    "label": "K2：空襲戦 深海南方任務部隊 艦載機群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 202
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、軽母ヌ級elite(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 271
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 310
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、軽母ヌ級elite(B)(艦載機白)、戦艦レ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 392
     }
    ]
   },
   "L": {
    "label": "L： 深海南方任務部隊 機動部隊 III群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite(B)(艦載機白)、軽母ヌ級elite(B)(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 138
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 108
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、軽母ヌ級elite(B)(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 177
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 216
     }
    ]
   },
   "N": {
    "label": "N：第二ボス(戦力) 深海南方任務部隊 機動部隊 II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 202
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、戦艦レ級、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 202
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 310
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 323
     }
    ]
   },
   "P": {
    "label": "P：深海南方任務部隊 前衛艦隊 II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡ネ級、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、重巡ネ級、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、重巡ネ級elite、重巡ネ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "Q": {
    "label": "Q： 深海南方任務部隊 前衛艦隊 I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 0
     }
    ]
   },
   "Q1": {
    "label": "Q1：空襲戦 深海南方任務部隊 艦載機群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、軽母ヌ級elite(B)(艦載機白)、戦艦レ級、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 271
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、軽母ヌ級flagship(B)(艦載機白)、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 185
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、軽巡ツ級elite、駆逐ハ級後期型elite、駆逐ハ級後期型elite、潜水ヨ級elite",
      "air": 216
     }
    ]
   },
   "Q2": {
    "label": "Q2：対潜戦 深海潜水艦隊 機動部隊随伴 II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水ヨ級elite、潜水ヨ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級flagship、潜水ヨ級flagship、潜水ヨ級elite、潜水ヨ級elite、潜水カ級",
      "air": 0
     }
    ]
   },
   "T": {
    "label": "T：深海南方任務部隊 随伴補給部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級elite、輸送ワ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、輸送ワ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "U": {
    "label": "U： 深海南方任務部隊 新鋭戦艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、重巡ネ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "V": {
    "label": "V： 深海南方任務部隊 機動部隊 I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、軽母ヌ級elite(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 271
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級",
      "air": 216
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、潜水ヨ級elite",
      "air": 216
     }
    ]
   },
   "W": {
    "label": "W：対潜戦 深海潜水艦隊 機動部隊随伴 I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水ヨ級elite、潜水ヨ級elite、潜水ヨ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級flagship、潜水ヨ級flagship、潜水ヨ級elite、潜水ヨ級elite、潜水カ級",
      "air": 0
     }
    ]
   },
   "X": {
    "label": "X：空襲戦 深海南方任務部隊 艦載機群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 218
     },
     {
      "name": "パターン2",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 312
     },
     {
      "name": "パターン3",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 325
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "南太平洋空母棲姫-壊(A)、空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、軽巡ツ級flagship、駆逐ハ級後期型elite、駆逐ハ級後期型elite",
      "air": 328
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "南太平洋空母棲姫-壊(A)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、戦艦レ級elite、駆逐ハ級後期型elite、駆逐ハ級後期型elite",
      "air": 434
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "南太平洋空母棲姫-壊(A)、空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、駆逐ハ級後期型elite、駆逐ハ級後期型elite",
      "air": 435
     },
     {
      "name": "パターン7 クリア後",
      "enemy": "南太平洋空母棲姫(A)、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 110
     },
     {
      "name": "パターン8 クリア後",
      "enemy": "南太平洋空母棲姫(A)、軽母ヌ級flagship(B)(艦載機白)、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 187
     },
     {
      "name": "パターン9 クリア後",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 218
     }
    ]
   },
   "Z": {
    "label": "Z：第三ボス(戦力) 深海南方任務部隊 機動部隊主力",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 312
     },
     {
      "name": "パターン2",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 325
     },
     {
      "name": "パターン3",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 325
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "南太平洋空母棲姫-壊(A)、空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、軽巡ツ級flagship、駆逐ハ級後期型elite、駆逐ハ級後期型elite",
      "air": 328
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "南太平洋空母棲姫-壊(A)、空母ヲ級改flagship(B)(艦載機白)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、駆逐ハ級後期型elite、駆逐ハ級後期型elite",
      "air": 435
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "南太平洋空母棲姫-壊(A)、空母ヲ級改flagship(B)(艦載機白)、戦艦レ級elite、戦艦レ級elite、駆逐ハ級後期型elite、駆逐ハ級後期型elite",
      "air": 434
     },
     {
      "name": "パターン7 クリア後",
      "enemy": "南太平洋空母棲姫(A)、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 110
     },
     {
      "name": "パターン8 クリア後",
      "enemy": "南太平洋空母棲姫(A)、軽母ヌ級flagship(B)(艦載機白)、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 187
     },
     {
      "name": "パターン9 クリア後",
      "enemy": "南太平洋空母棲姫(A)、空母ヲ級改flagship(B)(艦載機白)、重巡ネ級、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 218
     }
    ]
   }
  }
 },
 "6-1": {
  "source": "https://wikiwiki.jp/kancolle/中部海域/6-1",
  "checkedAt": "2026-10-07",
  "nodes": {
   "C": {
    "label": "C： 中部海域 敵遊撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、軽母ヌ級flagship、重巡リ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 23
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、軽母ヌ級flagship、重巡リ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、軽母ヌ級flagship、重巡リ級flagship、軽巡ツ級、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 23
     }
    ]
   },
   "D": {
    "label": "D： 中部海域哨戒戦 D地点",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、駆逐ハ級elite、駆逐ハ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 中部海域哨戒戦 F地点",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、駆逐ハ級elite、駆逐ハ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、駆逐ニ級elite、駆逐ニ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、輸送ワ級elite、輸送ワ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、軽巡ト級elite(A)、駆逐ニ級elite、駆逐ニ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 中部海域哨戒戦 H地点",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、駆逐ハ級elite、駆逐ハ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、駆逐ハ級elite、駆逐ハ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級elite、雷巡チ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "I": {
    "label": "I： 敵機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母棲鬼(艦載機白)、空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 180
     },
     {
      "name": "パターン2",
      "enemy": "空母棲鬼(艦載機白)、重巡リ級flagship、重巡リ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 96
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機白)、空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 168
     }
    ]
   },
   "J": {
    "label": "J： 中部海域 敵輸送船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級flagship、輸送ワ級flagship、軽巡ヘ級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K：ボス 敵回航中空母",
    "patterns": [
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ヘ級elite、軽巡ツ級、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 84
     },
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ツ級elite、軽巡ツ級elite、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 84
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 84
     }
    ]
   }
  }
 },
 "6-2": {
  "source": "https://wikiwiki.jp/kancolle/中部海域/6-2",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵攻略支援部隊A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽母ヌ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽母ヌ級elite、軽母ヌ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 48
     }
    ]
   },
   "C": {
    "label": "C： 敵攻略支援部隊B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、重巡リ級elite、重巡リ級elite、軽母ヌ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 24
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、戦艦ル級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 46
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、軽母ヌ級elite、重巡リ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 24
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級flagship、戦艦ル級flagship、重巡リ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 23
     }
    ]
   },
   "F": {
    "label": "F： 敵空母機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機白)、空母ヲ級flagship(艦載機白)、軽巡ツ級elite、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 168
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機白)、軽巡ツ級、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 84
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機白)、重巡リ級flagship、軽巡ツ級、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 84
     }
    ]
   },
   "H": {
    "label": "H： 敵高速水上打撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、重巡リ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、重巡リ級flagship、重巡リ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "I": {
    "label": "I： 敵任務部隊B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ツ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽母ヌ級flagship、軽巡ツ級、駆逐ハ級後期型、駆逐ニ級後期型",
      "air": 23
     }
    ]
   },
   "J": {
    "label": "J： 敵任務部隊A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級改flagship、戦艦ル級elite、戦艦ル級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship、戦艦ル級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 102
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級改flagship、戦艦ル級flagship、軽母ヌ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 24
     }
    ]
   },
   "K": {
    "label": "K： 敵攻略部隊本体",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "輸送ワ級flagship、戦艦ル級改flagship、軽巡ツ級elite、軽巡ツ級elite、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "輸送ワ級flagship、空母ヲ級flagship(艦載機白)、戦艦ル級改flagship、軽巡ツ級elite、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 84
     }
    ]
   }
  }
 },
 "6-3": {
  "source": "https://wikiwiki.jp/kancolle/中部海域/6-3",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 泊地哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C：対潜戦 深海潜水艦隊 梯形陣の出現率は 単横陣の2~3倍ほど",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級elite、潜水ヨ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 深海ピケット艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "パターン1と同じ",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "パターン3と同じ",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "パターン5と同じ",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 深海哨戒水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ツ級elite、雷巡チ級elite、雷巡チ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 深海中部水上打撃群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡ネ級elite、軽巡ト級elite(A)、軽巡ホ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "パターン1と同じ",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡ネ級elite、軽巡ト級elite(A)、軽巡ト級elite(A)、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "パターン3と同じ",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "重巡ネ級elite、重巡リ級elite、軽巡ト級elite(A)、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "パターン5と同じ",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J：ボス 留守泊地旗艦艦隊 クリア後の 各編成出現率*6 パターン1:2:3:4:5 =約6:7:11:15:61",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦タ級flagship、重巡リ級flagship、軽巡ヘ級flagship、駆逐棲姫(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦タ級flagship、重巡リ級flagship、重巡リ級flagship、駆逐棲姫(A)、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦タ級flagship、重巡リ級flagship、重巡リ級flagship、駆逐棲姫(A)、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "戦艦タ級flagship、重巡リ級flagship、重巡リ級flagship、駆逐棲姫(A)、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "戦艦タ級flagship、戦艦タ級flagship、重巡リ級flagship、駆逐棲姫(A)、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 0
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "駆逐棲姫(B)、戦艦タ級flagship、戦艦タ級flagship、重巡リ級flagship、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 0
     }
    ]
   }
  }
 },
 "6-4": {
  "source": "https://wikiwiki.jp/kancolle/中部海域/6-4",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 中部海域哨戒水雷戦隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "軽巡ホ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "軽巡ヘ級flagship、雷巡チ級flagship、雷巡チ級flagship、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B： 中部海域哨戒水雷戦隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "軽巡ホ級flagship、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 離島防衛低速戦艦部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、軽母ヌ級",
      "air": 8
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、軽母ヌ級elite",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、軽母ヌ級",
      "air": 8
     },
     {
      "name": "パターン4",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、軽母ヌ級elite",
      "air": 24
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、軽母ヌ級elite",
      "air": 24
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ニ級後期型、駆逐ニ級後期型、軽母ヌ級elite",
      "air": 24
     }
    ]
   },
   "D": {
    "label": "D：空襲戦 離島陸上航空隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "離島棲姫(陸爆弱)",
      "air": 59
     },
     {
      "name": "パターン2",
      "enemy": "離島棲姫(陸爆強)",
      "air": 82
     }
    ]
   },
   "E": {
    "label": "E： 中部海域哨戒遊撃部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "重巡リ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F：空襲戦 離島陸上航空隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "離島棲姫(陸爆弱)",
      "air": 59
     },
     {
      "name": "パターン2",
      "enemy": "離島棲姫(A)",
      "air": 78
     },
     {
      "name": "パターン3",
      "enemy": "離島棲姫(陸爆強)",
      "air": 82
     }
    ]
   },
   "G": {
    "label": "G：空襲戦 離島陸上航空隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "離島棲姫(陸爆弱)",
      "air": 59
     },
     {
      "name": "パターン2",
      "enemy": "離島棲姫(陸爆強)",
      "air": 82
     }
    ]
   },
   "H": {
    "label": "H： 離島防衛低速戦艦部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、軽母ヌ級elite",
      "air": null
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、軽母ヌ級elite",
      "air": 24
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、軽母ヌ級flagship",
      "air": 23
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、軽母ヌ級flagship",
      "air": 23
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "戦艦ル級flagship、戦艦ル級flagship、軽巡ヘ級flagship、駆逐ニ級後期型、駆逐ニ級後期型、軽母ヌ級flagship",
      "air": 23
     }
    ]
   },
   "I": {
    "label": "I：空襲戦 離島混成航空隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "離島棲姫(A)、軽母ヌ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 101
     },
     {
      "name": "パターン2",
      "enemy": "離島棲姫(陸爆強)、軽母ヌ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 105
     }
    ]
   },
   "J": {
    "label": "J： 任務部隊 I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(艦載機白)、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 108
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(艦載機白)、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 108
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(艦載機白赤)、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 126
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦ル級改flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 132
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "空母棲姫(艦載機赤)、戦艦ル級改flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 129
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "空母棲姫(艦載機赤)、戦艦ル級改flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 129
     }
    ]
   },
   "K": {
    "label": "K： 任務部隊 II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship、戦艦タ級elite、重巡リ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 28
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機白赤)、戦艦タ級elite、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 100
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship(艦載機赤)、戦艦タ級elite、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 103
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(艦載機白)、戦艦タ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 108
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "空母ヲ級改flagship(艦載機白赤)、戦艦タ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 126
     }
    ]
   },
   "L": {
    "label": "L： 増援護衛空母部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、重巡リ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 46
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 46
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 46
     }
    ]
   },
   "M": {
    "label": "M：対潜戦 中部海域潜水哨戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級、潜水ソ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級、潜水ソ級、潜水ソ級",
      "air": 0
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級、潜水ソ級",
      "air": 0
     }
    ]
   },
   "N": {
    "label": "N：ボス 離島守備隊 各編成の出現率は 均等ではなく、 突破済司令部Lv120で パターン2～6が 8:25:25:25:17程度*5",
    "patterns": [
     {
      "name": "パターン1 前哨戦",
      "enemy": "離島棲姫(A)、砲台小鬼(B)、砲台小鬼(A)、駆逐イ級後期型、駆逐イ級後期型",
      "air": 78
     },
     {
      "name": "パターン2 前哨戦",
      "enemy": "離島棲姫(B)、砲台小鬼(B)、砲台小鬼(A)、集積地棲姫(A)、軽巡ホ級flagship",
      "air": 34
     },
     {
      "name": "パターン3 前哨戦",
      "enemy": "離島棲姫(A)、砲台小鬼(C)、砲台小鬼(B)、砲台小鬼(A)、集積地棲姫(A)、輸送ワ級flagship",
      "air": 112
     },
     {
      "name": "パターン4 前哨戦",
      "enemy": "離島棲姫(B)、砲台小鬼(C)、砲台小鬼(B)、砲台小鬼(A)、集積地棲姫-壊(A)、軽巡ホ級flagship",
      "air": 48
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "離島棲姫(B)、砲台小鬼(C)、砲台小鬼(B)、砲台小鬼(A)、集積地棲姫-壊(A)、輸送ワ級flagship",
      "air": 48
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "離島棲姫(B)、砲台小鬼(C)、砲台小鬼(B)、砲台小鬼(A)、集積地棲姫-壊(A)、軽巡ヘ級flagship",
      "air": 48
     }
    ]
   }
  }
 },
 "6-5": {
  "source": "https://wikiwiki.jp/kancolle/中部海域/6-5",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A： 先遣任務部隊 前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン7",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン8 最終形態",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     },
     {
      "name": "パターン9 最終形態",
      "enemy": "軽巡ヘ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、軽巡ホ級flagship、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 0
     }
    ]
   },
   "B": {
    "label": "B：対潜戦 深海潜水艦隊 前方展開部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "潜水カ級flagship、潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 先遣任務部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、軽巡ツ級、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 132
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 132
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級、重巡ネ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 132
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、軽巡ツ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 132
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 132
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級elite、重巡ネ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 132
     },
     {
      "name": "パターン7 最終形態",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、軽巡ツ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 132
     },
     {
      "name": "パターン8 最終形態",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 132
     },
     {
      "name": "パターン9 最終形態",
      "enemy": "空母ヲ級改flagship(艦載機赤)、戦艦タ級flagship、重巡ネ級elite、重巡ネ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 132
     }
    ]
   },
   "D": {
    "label": "D： 深海護衛空母部隊 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 46
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、重巡ネ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 46
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 46
     }
    ]
   },
   "E": {
    "label": "E：対潜戦 深海潜水艦隊 精鋭群狼部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "潜水ソ級flagship、潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F： 深海巡洋艦戦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "重巡リ級改flagship、雷巡チ級flagship、雷巡チ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G：空襲戦 深海任務部隊 艦載機群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母棲姫(艦載機白)、空母ヲ級flagship(艦載機赤)、重巡リ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 209
     },
     {
      "name": "パターン2",
      "enemy": "空母棲姫(艦載機白)、空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 312
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "空母棲姫(艦載機白)、空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、軽巡ツ級elite、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 312
     }
    ]
   },
   "H": {
    "label": "H：空襲戦 深海任務部隊 艦載機群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship(艦載機赤)、重巡リ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 103
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 206
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "空母棲姫(艦載機白)、空母ヲ級flagship(艦載機赤)、軽巡ツ級elite、駆逐ニ級後期型、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 209
     }
    ]
   },
   "I": {
    "label": "I： 深海護衛空母部隊 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 46
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 46
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "軽母ヌ級flagship、軽母ヌ級flagship、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 46
     }
    ]
   },
   "J": {
    "label": "J：夜戦 深海護衛空母部隊 C群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級flagship、軽巡ヘ級flagship、軽巡ツ級、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 23
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、軽巡ヘ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 23
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "軽母ヌ級flagship、軽巡ヘ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 23
     }
    ]
   },
   "M": {
    "label": "M：ボス 任務部隊 主力群 ゲージ破壊後の出現率 パターン1: 60% パターン2: 40%",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母棲姫(艦載機白)、空母ヲ級flagship(艦載機赤)、重巡リ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 209
     },
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、重巡リ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 209
     },
     {
      "name": "パターン2",
      "enemy": "空母棲姫(艦載機白)、空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、軽巡ツ級elite、駆逐ハ級後期型、駆逐ハ級後期型",
      "air": 312
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、重巡リ級flagship、重巡リ級flagship、駆逐ハ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 312
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "空母棲姫(艦載機白)、空母ヲ級flagship(艦載機赤)、空母ヲ級flagship(艦載機赤)、軽巡ツ級elite、駆逐ニ級後期型、駆逐ニ級後期型",
      "air": 312
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "軽巡ヘ級flagship、重巡リ級flagship、重巡リ級flagship、駆逐ハ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 312
     }
    ]
   }
  }
 },
 "7-1": {
  "source": "https://wikiwiki.jp/kancolle/南西海域/7-1",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 敵通商破壊侵入艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、重巡ネ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 23
     }
    ]
   },
   "C": {
    "label": "C： 敵通商破壊侵入 高速機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級flagship（艦載機白）、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級flagship（艦載機白）、重巡ネ級elite、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級flagship（艦載機白）、戦艦タ級flagship、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 84
     }
    ]
   },
   "D": {
    "label": "D：対潜戦 深海潜水艦隊 II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ソ級elite、潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "F": {
    "label": "F：対潜戦 深海潜水艦隊 III群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級elite、潜水ヨ級、潜水ヨ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ヨ級elite、潜水ヨ級、潜水ヨ級、潜水ヨ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水ヨ級、潜水ヨ級",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 敵哨戒部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H：対潜戦 深海潜水艦隊 I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ヨ級elite、潜水ヨ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水ヨ級elite、潜水ヨ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級elite、潜水ヨ級elite、潜水ヨ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ソ級elite、潜水ヨ級elite、潜水ヨ級、潜水ヨ級",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水ソ級elite、潜水ソ級elite、潜水ヨ級、潜水ヨ級",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K：ボス*7 深海潜水艦隊集団 旗艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級flagship、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級flagship、潜水ヨ級elite、潜水ヨ級elite",
      "air": 0
     }
    ]
   }
  }
 },
 "7-2": {
  "source": "https://wikiwiki.jp/kancolle/南西海域/7-2",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 深海任務部隊 前方侵入水雷戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、軽巡ツ級、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C：対潜戦 セレベス海方面哨戒潜水艦 I群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E：対潜戦 セレベス海方面哨戒潜水艦 II群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G：ボス*3 セレベス海方面 旗艦哨戒潜水艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級elite、潜水カ級、潜水カ級、輸送ワ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級elite、潜水カ級elite、潜水カ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級flagship、潜水カ級elite、潜水カ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4 クリア後",
      "enemy": "潜水ソ級elite、潜水カ級、潜水カ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5 クリア後",
      "enemy": "潜水ソ級elite、潜水カ級elite、潜水カ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン6 クリア後",
      "enemy": "潜水ソ級flagship、潜水カ級elite、潜水カ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H：空襲戦 深海任務部隊 主力機動部隊群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(艦載機白)、軽母ヌ級elite(艦載機白)、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 177
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(艦載機白)、軽母ヌ級elite(艦載機白)、軽母ヌ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 185
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(艦載機白)、軽母ヌ級elite(艦載機白)、軽母ヌ級、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 185
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(艦載機白赤)、軽母ヌ級elite(艦載機白)、軽母ヌ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 219
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級改flagship(艦載機白赤)、軽母ヌ級flagship(艦載機白)、軽母ヌ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 227
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級改flagship(艦載機赤)、軽母ヌ級flagship(艦載機白)、軽母ヌ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 233
     },
     {
      "name": "パターン7",
      "enemy": "空母ヲ級改flagship(艦載機赤)、軽母ヌ級flagship(艦載機赤)、軽母ヌ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 249
     },
     {
      "name": "パターン8",
      "enemy": "空母ヲ級改flagship(艦載機赤)、軽母ヌ級改flagship(艦載機赤)、軽母ヌ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 263
     }
    ]
   },
   "I": {
    "label": "I： 深海任務部隊 前衛哨戒群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 深海任務部隊 強襲揚陸部隊群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "戦艦ル級flagship、軽巡ホ級flagship、輸送ワ級、輸送ワ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "戦艦ル級flagship、軽巡ホ級flagship、輸送ワ級elite、輸送ワ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "戦艦ル級flagship、軽巡ホ級flagship、輸送ワ級flagship、輸送ワ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、輸送ワ級flagship、輸送ワ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M：ボス 深海任務部隊 主力機動部隊群 ゲージ消滅後はパターン8のみ ゲージ攻略中は司令部Lv依存 -Lv106以下は全パターン出現 -Lv107以上はパターン1~7のみ",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "空母ヲ級改flagship(艦載機白)、軽母ヌ級elite(艦載機白)、重巡ネ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 177
     },
     {
      "name": "パターン2",
      "enemy": "空母ヲ級改flagship(艦載機白)、軽母ヌ級elite(艦載機白)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 177
     },
     {
      "name": "パターン3",
      "enemy": "空母ヲ級改flagship(艦載機白赤)、軽母ヌ級elite(艦載機白)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 195
     },
     {
      "name": "パターン4",
      "enemy": "空母ヲ級改flagship(艦載機白赤)、軽母ヌ級flagship(艦載機白)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 203
     },
     {
      "name": "パターン5",
      "enemy": "空母ヲ級改flagship(艦載機赤)、軽母ヌ級flagship(艦載機白)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 209
     },
     {
      "name": "パターン6",
      "enemy": "空母ヲ級改flagship(艦載機赤)、軽母ヌ級flagship(艦載機赤)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 225
     },
     {
      "name": "パターン7",
      "enemy": "空母ヲ級改flagship(艦載機赤)、軽母ヌ級改flagship(艦載機赤)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 239
     },
     {
      "name": "パターン8",
      "enemy": "空母ヲ級改flagship(艦載機白)、軽母ヌ級elite(艦載機白)、重巡ネ級、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 177
     }
    ]
   }
  }
 },
 "7-3": {
  "source": "https://wikiwiki.jp/kancolle/南西海域/7-3",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B： 深海東方部隊 魚雷艇戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐イ級後期型、PT小鬼群(B)、PT小鬼群(B)",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐イ級後期型、PT小鬼群(B)、PT小鬼群(B)、PT小鬼群(B)",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐イ級後期型、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(B)",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 深海東方部隊 前衛駆逐艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐ロ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐ロ級後期型、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 深海5,500t級軽巡洋艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、駆逐ロ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E：ボス 深海東方部隊 精鋭駆逐隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級、駆逐ロ級",
      "air": 0
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "駆逐ロ級後期型elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J：対潜戦 深海潜水艦隊 海峡警戒線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ヨ級elite、潜水カ級、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ヨ級flagship、潜水カ級、潜水カ級",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M： 深海東方部隊 巡洋艦戦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、重巡リ級flagship、雷巡チ級、雷巡チ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、重巡リ級flagship、雷巡チ級elite、雷巡チ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、重巡リ級flagship、雷巡チ級elite、雷巡チ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "N": {
    "label": "N： 深海東方部隊 空母機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級改elite(艦載機鳥白)、軽母ヌ級改elite(艦載機鳥白)、戦艦タ級elite、軽巡ツ級、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 212
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級改elite(艦載機鳥白)、軽母ヌ級改elite(艦載機鳥白)、戦艦タ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 212
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級改flagship(艦載機鳥赤)、軽母ヌ級改elite(艦載機鳥白)、戦艦タ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 238
     }
    ]
   },
   "P": {
    "label": "P：ボス 深海東方部隊 海峡封鎖部隊旗艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "重巡ネ級elite、軽巡ツ級elite、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   }
  }
 },
 "7-4": {
  "source": "https://wikiwiki.jp/kancolle/南西海域/7-4",
  "checkedAt": "2026-10-07",
  "nodes": {
   "B": {
    "label": "B：対潜戦 深海潜水艦隊 哨戒集団 B群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級flagship、潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C：対潜戦 深海潜水艦隊 哨戒集団 C群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級flagship、潜水カ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級flagship、潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級flagship、潜水カ級flagship、潜水カ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D：空襲戦 深海任務部隊 艦載機群 パターン5はクリア後出現せず",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 131
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 214
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 214
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 321
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級改elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite",
      "air": 346
     }
    ]
   },
   "E": {
    "label": "E：空襲戦 深海任務部隊 艦載機群 パターン6はクリア後出現せず",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 115
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 131
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級、駆逐ロ級後期型elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite",
      "air": 214
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 131
     },
     {
      "name": "パターン5",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 214
     },
     {
      "name": "パターン6",
      "enemy": "軽母ヌ級改elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite",
      "air": 239
     }
    ]
   },
   "G": {
    "label": "G：対潜戦 深海潜水艦隊 哨戒集団 A群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     }
    ]
   },
   "H": {
    "label": "H： 深海任務部隊 空母機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 214
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 321
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級改elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 239
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級改elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 346
     }
    ]
   },
   "J": {
    "label": "J： 深海任務部隊 特殊任務部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、潜水ソ級flagship、潜水ソ級flagship、潜水ソ級flagship",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級flagship、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級flagship、潜水ソ級flagship、潜水ソ級flagship",
      "air": 0
     }
    ]
   },
   "K": {
    "label": "K：対潜戦 深海潜水艦隊 哨戒集団 旗艦群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水新棲姫(E)、潜水ソ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水新棲姫(A)、潜水ソ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水新棲姫(A)、潜水ソ級elite、潜水ソ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水新棲姫(A)、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水新棲姫(B)、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L： 深海任務部隊 船団攻撃集団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐イ級後期型、駆逐イ級、駆逐イ級、潜水ソ級elite、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐イ級後期型、駆逐イ級、駆逐イ級、潜水ソ級flagship、潜水ソ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、潜水ソ級flagship、潜水ソ級flagship",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M：空襲戦 深海任務部隊 艦載機群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "ヒ船団棲姫(A)、軽母ヌ級elite(艦載機鳥白)、軽母ヌ級elite(艦載機鳥白)、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級elite",
      "air": 345
     },
     {
      "name": "パターン2",
      "enemy": "ヒ船団棲姫(B)、軽母ヌ級改elite(艦載機鳥白)、軽母ヌ級elite(艦載機鳥白)、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級elite",
      "air": 329
     },
     {
      "name": "パターン3",
      "enemy": "ヒ船団棲姫(A)、軽母ヌ級改elite(艦載機鳥白)、軽母ヌ級elite(艦載機鳥白)、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 325
     },
     {
      "name": "パターン4",
      "enemy": "ヒ船団棲姫(B)、軽母ヌ級改elite(艦載機鳥白)、軽母ヌ級改elite(艦載機鳥白)、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 309
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "ヒ船団棲姫-壊(A)、軽母ヌ級改elite(艦載機鳥白)、軽母ヌ級改elite(艦載機鳥白)、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 366
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "ヒ船団棲姫-壊(B)、軽母ヌ級改elite(艦載機鳥白)、軽母ヌ級改elite(艦載機鳥白)、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite",
      "air": 369
     }
    ]
   },
   "P": {
    "label": "P：ボス 深海 ヒ船団棲姫船団",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "ヒ船団棲姫(A)、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 93
     },
     {
      "name": "パターン2",
      "enemy": "ヒ船団棲姫(B)、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級elite、潜水ソ級elite、潜水ソ級elite",
      "air": 97
     },
     {
      "name": "パターン3",
      "enemy": "ヒ船団棲姫(A)、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級elite、潜水ソ級elite",
      "air": 93
     },
     {
      "name": "パターン4",
      "enemy": "ヒ船団棲姫(B)、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級elite、潜水ソ級elite",
      "air": 97
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "ヒ船団棲姫-壊(A)、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型、潜水ソ級flagship、潜水ソ級elite",
      "air": 154
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "ヒ船団棲姫-壊(B)、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite、潜水ソ級flagship、潜水ソ級elite",
      "air": 157
     }
    ]
   }
  }
 },
 "7-5": {
  "source": "https://wikiwiki.jp/kancolle/南西海域/7-5",
  "checkedAt": "2026-10-07",
  "nodes": {
   "A": {
    "label": "A：空襲戦 深海基地航空隊 ジャワ展開部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "飛行場姫(陸爆中)",
      "air": 48
     },
     {
      "name": "パターン2",
      "enemy": "飛行場姫(鳥黒弱)、飛行場姫(陸爆弱)",
      "air": 169
     },
     {
      "name": "パターン3",
      "enemy": "飛行場姫(鳥黒弱)、飛行場姫(陸爆中)",
      "air": 183
     },
     {
      "name": "パターン4",
      "enemy": "飛行場姫(鳥黒強)、飛行場姫(鳥黒弱)、飛行場姫(陸爆弱)",
      "air": 335
     }
    ]
   },
   "B": {
    "label": "B：対潜戦 マカッサル海峡 深海哨戒群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "C": {
    "label": "C： 深海連合混成艦隊 駆逐隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐ロ級後期型elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐ロ級後期型elite、駆逐ロ級後期型elite、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "D": {
    "label": "D： 深海連合混成艦隊 前衛艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ホ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ホ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ホ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、軽巡ホ級flagship、軽巡ホ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "E": {
    "label": "E： 深海連合混成艦隊 哨戒艇部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐イ級後期型、駆逐イ級、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(A)",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐イ級後期型、駆逐イ級後期型、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(A)",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "駆逐イ級後期型、駆逐イ級、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(A)、PT小鬼群(A)",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "駆逐イ級後期型、駆逐イ級後期型、PT小鬼群(D)、PT小鬼群(C)、PT小鬼群(B)、PT小鬼群(A)",
      "air": 0
     }
    ]
   },
   "G": {
    "label": "G： 深海連合混成艦隊 警戒隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   },
   "J": {
    "label": "J： 深海連合混成艦隊 ジャワ防衛線",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型elite、駆逐イ級後期型、駆逐イ級、駆逐イ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、駆逐ロ級後期型elite、駆逐ロ級後期型elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽母ヌ級elite、駆逐ロ級後期型elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 24
     },
     {
      "name": "パターン4",
      "enemy": "重巡リ級flagship、軽巡ヘ級flagship、軽母ヌ級elite(艦載機白)、駆逐ロ級後期型elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite",
      "air": 69
     }
    ]
   },
   "K": {
    "label": "K：第1ボス(戦力) 深海連合混成艦隊 主力艦隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ト級elite(A)、重巡リ級elite、重巡リ級elite、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ト級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "軽巡ト級elite(A)、重巡リ級flagship、重巡リ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "軽巡ト級flagship、重巡リ級flagship、重巡リ級flagship、軽巡ツ級elite、駆逐ロ級後期型、駆逐ロ級後期型",
      "air": 0
     }
    ]
   },
   "L": {
    "label": "L： 深海連合混成艦隊 遊撃戦力",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "駆逐イ級後期型、駆逐イ級後期型、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "駆逐イ級後期型elite、駆逐イ級後期型elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "M": {
    "label": "M： 深海連合混成艦隊 脱出残存部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽巡ヘ級改flagship(A)、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "軽巡ヘ級改flagship(B)、駆逐イ級後期型elite、駆逐イ級後期型elite",
      "air": 0
     }
    ]
   },
   "N": {
    "label": "N：対潜戦 深海潜水艦隊 ジャワ海哨戒群",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン3",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン4",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン5",
      "enemy": "潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン6",
      "enemy": "潜水カ級flagship、潜水カ級flagship、潜水カ級elite、潜水カ級elite、潜水カ級elite",
      "air": 0
     },
     {
      "name": "パターン7",
      "enemy": "潜水カ級flagship、潜水カ級flagship、潜水カ級flagship、潜水カ級elite、潜水カ級elite",
      "air": 0
     }
    ]
   },
   "Q": {
    "label": "Q：第2ボス(戦力) 深海連合混成艦隊 クラガン陣地",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "砲台小鬼(B)、飛行場姫(陸爆中)、集積地棲姫II(B)、PT小鬼群(C)、PT小鬼群(B)、輸送ワ級",
      "air": 95
     },
     {
      "name": "パターン2",
      "enemy": "砲台小鬼(B)、飛行場姫(陸爆中)、集積地棲姫II-壊(B)、PT小鬼群(C)、輸送ワ級、輸送ワ級",
      "air": 114
     },
     {
      "name": "パターン3",
      "enemy": "砲台小鬼(B)、砲台小鬼(A)、飛行場姫(陸爆中)、集積地棲姫II(B)、PT小鬼群(D)、PT小鬼群(C)",
      "air": 95
     },
     {
      "name": "パターン4",
      "enemy": "砲台小鬼(B)、砲台小鬼(A)、飛行場姫(陸爆中)、集積地棲姫II-壊(B)、PT小鬼群(D)、輸送ワ級elite",
      "air": 114
     },
     {
      "name": "パターン5 最終形態",
      "enemy": "砲台小鬼(B)、砲台小鬼(A)、飛行場姫(陸爆中)、集積地棲姫II-壊(B)、PT小鬼群(C)、輸送ワ級",
      "air": 114
     },
     {
      "name": "パターン6 最終形態",
      "enemy": "砲台小鬼(B)、砲台小鬼(B)、砲台小鬼(A)、飛行場姫(陸爆中)、集積地棲姫II-壊(B)、PT小鬼群(D)",
      "air": 114
     }
    ]
   },
   "R": {
    "label": "R： 深海連合混成艦隊 増援機動部隊",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "軽母ヌ級elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、重巡ネ級、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 214
     },
     {
      "name": "パターン2",
      "enemy": "軽母ヌ級elite(艦載機黒)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 107
     },
     {
      "name": "パターン3",
      "enemy": "軽母ヌ級改elite(艦載機黒)、軽母ヌ級elite(艦載機黒)、重巡ネ級elite、軽巡ツ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 239
     },
     {
      "name": "パターン4",
      "enemy": "軽母ヌ級改elite(艦載機黒)、軽母ヌ級改elite(艦載機黒)、重巡ネ級elite、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite",
      "air": 264
     }
    ]
   },
   "T": {
    "label": "T：第3ボス(戦力) 深海連合混成艦隊 残存部隊旗艦",
    "patterns": [
     {
      "name": "パターン1",
      "enemy": "バタビア沖棲姫(A)、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン2",
      "enemy": "バタビア沖棲姫(B)、軽巡ヘ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン3 最終形態",
      "enemy": "バタビア沖棲姫-壊(A)、軽巡ヘ級flagship、軽巡ツ級、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン4 最終形態",
      "enemy": "バタビア沖棲姫-壊(B)、軽巡ヘ級flagship、軽巡ツ級elite、駆逐ロ級後期型elite、駆逐ロ級後期型elite",
      "air": 0
     },
     {
      "name": "パターン5 クリア後",
      "enemy": "バタビア沖棲姫-壊(A)、軽巡ヘ級elite、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     },
     {
      "name": "パターン6 クリア後",
      "enemy": "バタビア沖棲姫-壊(B)、軽巡ヘ級flagship、駆逐イ級後期型、駆逐イ級後期型",
      "air": 0
     }
    ]
   }
  }
 }
};

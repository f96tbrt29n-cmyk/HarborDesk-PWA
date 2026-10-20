# 保存5キーの変更経路監査

基準442e5e5。F/E/R/P/Sは下記JSONの対象5キー。コード上の経路と旧自然失敗の実行証拠を分ける。既存テスト欄は対応する範囲であり、全経路の全失敗分岐が検証済みという意味ではない。

| 入口/ソース | 実行条件・対象 | 保存/削除と既存テスト | 旧失敗の証拠 |
|---|---|---|---|
| rosterSave / editor / delete / undo (`ship-roster.js`) | フォーム保存、削除、canonical修正 / R | setItem(JSON array); 行削除もキー自体は残る / ship-master-compatibility.spec.js | 旧失敗はfixture直接投入。UI編集/削除の操作記録なし |
| rosterMigrateMasterIds -> roster rendering (`ship-roster.js`) | masterId未設定で名前から解決できた行がある時だけ / R | setItem(changed rows); 読取りfallback[]ならchanged=false / ship-master-compatibility.spec.js: legacy roster and saved fleets migrate | 旧fixtureはmasterIdあり。新文書での呼出し監査なし |
| saveCustomFleets; 各保存ボタン/艦隊再連携 (`custom-fleets.js; fleet-suggester.js; fleet-loadout-planner.js; fleet-loadout-optimizer.js; owned-equipment-planner.js`) | 対象map/fleet編集や保存を明示操作 / F | setItem(JSON object); UI行削除/undoも再保存 / owned-equipment-planner.spec.js; route-completion-2-5.spec.js | 旧fixture直接保存を確認。再読込後のUI保存操作は記録なし |
| cfMigrateMasterIds -> module setup (`custom-fleets.js`) | masterId欠損が解決できchanged=true / F | setItem(JSON object); 全削除ではない / ship-master-compatibility.spec.js: legacy roster and saved fleets migrate | 旧fixtureの各艦にmasterIdあり。監査なしなので未実行断定不可 |
| hdSave(HD_EQUIP_KEY); equipment form/delete/undo (`advanced-tools.js`) | 利用者の台帳操作、同期からのhdSave呼出し / E | setItem(JSON array); plan/manual行保持は同期側merge / release-smoke.spec.js: complete equipment sync preserves user plans at zero owned count | 旧fixture直接setItemで装備投入。UI台帳操作の記録なし |
| hdFCState -> hdFCLoadAll -> hdFCSaveAll (`fleet-calculator.js`) | 選択map/fleetのstateがない時に初期値作成 / P | 読取り成功ならallへ追加してsetItem。修正前はgetItem例外も{}になり他プラン消失を隔離再現 / planner-storage-read.test.cjs; planner-storage-read.spec.js | 別件欠陥を確認/修正。旧失敗は実nullであり、この例外経路の実行証拠なし |
| hdFCSaveState / hdFCMutate / hdFCReset / hdFCImportOwnedPlan (`fleet-calculator.js`) | 入力変更、reset確認、signatureが新しい提案取込 / P | read-modify-setItem。resetはall内のkey削除後setItemでlocalStorage.removeItemではない / planner-storage-read.spec.js; fleet-loadout-planner.spec.js; route-completion-2-5.spec.js | 旧提案取込の保存は再読込前に確認。再読込後の操作呼出し不明 |
| hdFCRefreshSyncedHq -> hd:kancolle-sync / storage (`fleet-calculator.js`) | 同期HQが既知、保存値と差がある時 / P | all読取り後変更があればsetItem / preflight-sync-refresh.spec.js; route-completion-2-5.spec.js | 旧fixtureは直接Sを投入し、イベント取込の記録なし。監査欠測を未実行の証明にしない |
| hdKcApplyImport -> hdKcMergeRoster / hdKcMergeEquipment / hdKcApplyDecks (`kancolle-import.js`) | 解析済previewとoption/完全・部分レコードに応じて適用。自動受信は重複/古いreceipt拒否 / R,E,F,S | roster/equipment merge、linked fleet refresh、最後にS setItem。remove/clearなし。途中write例外の全キーtransactionではない / sync-receive-ui.spec.js; release-smoke.spec.js; ship-master-compatibility.spec.js | 旧PWA fixtureはこのimportを使わず直接投入。runtime呼出しの包括監査なし |
| applyボタン / clipboard / 許可originのpostMessage / window.name / hash受信 (`kancolle-import.js`) | 形式・payload/receipt検証、bridgeのcaptureId等を確認 / R,E,F,S | hdKcApplyImportへ到達。起動時name/hash検査自体は有効payloadなしでは保存しない / sync-receive-ui.spec.js; release-smoke.spec.js | 旧traceに有効な受信操作/payloadの証拠なし。旧資料は全messageの不在証明ではない |
| importBackup -> hdApplyBackupTransaction -> hdApplyBackupLocalStorage (`advanced-tools.js`) | localStorage payload解析、非空/互換性/整合性、確認と安全snapshot後。低層helperの直接呼出しはUI確認を伴わない / F,E,R,P,S | HarborDesk接頭辞の欠落キーをremoveItem、payloadをsetItem。明示的な全体置換 / backup.spec.js; release-smoke.spec.js: backup restore preview/compatibility/integrity/concurrent locks | 旧traceにimport/confirm/restoreの操作なし。ただし低層呼出しの実行履歴はない |
| hdPHRestoreSnapshot -> hdPHRestoreTransaction -> hdPHApplyHarborData (`personal-home.js`) | 保存済ID、利用者確認、安全snapshot作成。低層helperは直接呼出し可能 / F,E,R,P,S | payloadにないHarborDeskキーをremoveItem、各値setItem / release-smoke.spec.js: snapshot restore transaction rolls back partial writes / internal restore lock | 旧失敗で実行した証拠なし |
| 復元validation/適用例外 -> captured beforeを再適用 (`advanced-tools.js; personal-home.js`) | restore処理で失敗した時だけ / F,E,R,P,S | 同じremoveItem/setItem helperでrollback、失敗時は警告。一般読取り障害で自動初期化しない / release-smoke.spec.js: snapshot restore transaction rolls back partial writes | 復元入口自体の証拠なし。rollback実行と断定不可 |
| fleet/snapshot evaluate、専用retentionFixture (`tests/pwa-cached-reload.spec.js; tests/night-policy-reload.spec.js`) | 新しい隔離contextで同期風データを投入、proposal import / F,E,R,P,S | 直接setItem + saveCustomFleets + hdFCImportOwnedPlan。旧対象fixtureはclear/removeなし / pwa-cached-reload.spec.js; night-policy-reload.spec.js | 旧traceの再読込前5文字列確認に対応。新人工対照のremoveは別context/別実行 |
| newContext/newPage/teardown/retry (`Playwright context fixture`) | 各試行で独立context。storageState指定/永続profile指定なし / F,E,R,P,S | ブラウザー側の領域作成/廃棄。JSのStorage監査対象外 / 既存fixture-lifecycle-audit.json / original-context-options.json | 旧失敗は同じcontext/page/origin記録。teardownや別originを原因とする証拠なし |

キー名・機械可読の一覧は [pr152-storage-write-paths.json](pr152-storage-write-paths.json)。

今回確認した別件欠陥はプランナー読取り例外後の上書き。旧5nullはAPIが実nullを返しており、読取り例外経路が原因とはしない。元のnull/JSON parse fallback、同期の途中書込み例外等は別の未検証範囲で、包括的な保存安全性を宣言しない。

製品でNative Storageへの直接property代入/delete/Object.assign等は見つからなかった。backup作成のdata.localStorage[k]代入は通常object。別realm、ブラウザー内部の領域破棄/異常、外部操作、計測欠落はメソッド監査だけでは除外できない。旧traceのorigin/contextが同じである事実を尊重し、切替を推測しない。

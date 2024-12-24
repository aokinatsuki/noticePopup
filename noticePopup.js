/**
 * jQuery Plugin: noticePopup - カスタム通知ポップアップ
 *
 * このプラグインを使用すると、簡単に通知ポップアップを作成できます。
 * サーバーサイドの監視と手動で通知を追加する機能をサポートします。
 *
 * 使用例:
 *
 * 1. サーバー通知を自動的に監視する:
 *    $.noticePopup({
 *        isServerSide: true,
 *        url: '/api/notifications',
 *        color: 'green',
 *        interval: 30000 // 30秒ごとにサーバーを監視
 *    });
 *
 * 2. 手動で通知を追加する:
 *    $.noticePopup('showNotice', {
 *        color: 'blue'
 *    }, 0, 'タイトル', '手動で追加された通知メッセージです。');
 *
 * 3. すべての通知を削除する:
 *    $.noticePopup('destroy');
 *
 * オプション:
 * - isServerSide: サーバー通知を有効にするかどうか (デフォルト: false)
 * - url: サーバー通知を取得するURL (必須: isServerSide = trueの場合)
 * - func: カスタムコールバック関数
 * - id: ポップアップのユニークなID (デフォルト: 'notice_popup')
 * - color: ポップアップの色を指定 ('default', 'green', 'blue' など)
 * - size: ポップアップのサイズ ('sm', 'md', 'lg' など)
 * - titleShow: タイトルを表示するかどうか (デフォルト: true)
 * - msgShow: メッセージを表示するかどうか (デフォルト: true)
 * - interval: サーバー監視の間隔 (ミリ秒, デフォルト: 60000)
 */

(function($) {
    const defaults = {
        isServerSide: false, // サーバー監視を有効にするか
        url: "", // サーバー通知を取得するURL
        func: () => {}, // カスタム処理
        id: 'notice_popup', // ポップアップID
        color: "default", // ポップアップの色
        size: "md", // ポップアップのサイズ
        titleShow: true, // タイトルを表示するか
        msgShow: true, // メッセージを表示するか
        interval: 60000 // デフォルトの監視間隔 (ミリ秒)
    };

    const popupState = {
        popupCount: 0, // 現在のポップアップ数を追跡
    };

    const methods = {
        /**
         * 初期化処理
         * @param {Object} options - ユーザー設定
         */
        init: function(options) {
            const settings = $.extend({}, defaults, options);
            if (settings.isServerSide && (!settings.url || settings.url.length === 0)) {
                console.error("Error[noticePopup]: isServerSide is true but url is null");
                return;
            }

            if (settings.isServerSide) {
                setInterval(() => {
                    methods._checkServerNotifications(settings);
                }, settings.interval);
            }

            return this;
        },

        /**
         * サーバー通知を取得する
         * @param {Object} settings - 現在の設定
         */
        _checkServerNotifications: function(settings) {
            $.ajax({
                type: 'GET',
                url: settings.url,
                dataType: "json",
                success: function(res) {
                    if (res && res.length > 0) {
                        $.each(res, function(idx, val) {
                            methods.showNotice(settings, idx, val.title, val.message);
                        });
                    }
                },
                error: function(err) {
                    console.error("Error[noticePopup]: Ajax request failed", err);
                }
            });
        },

        /**
         * 通知を表示する
         * @param {Object} settings - 現在の設定
         * @param {number} idx - 通知のインデックス
         * @param {string} title - 通知のタイトル
         * @param {string} msg - 通知のメッセージ
         */
        showNotice: function(settings, idx = 0, title = "", msg = "") {
            methods._createPopup(settings, popupState.popupCount, title, msg);
            $(`#${settings.id}_${popupState.popupCount}`).fadeIn(500).trigger("noticeMsgText");
            methods._adjustPopupPosition(settings);
            popupState.popupCount++;
        },

        /**
         * HTMLを生成する
         * @param {Object} settings - 現在の設定
         * @param {number} idx - 通知のインデックス
         * @param {string} title - 通知のタイトル
         * @param {string} msg - 通知のメッセージ
         */
        _createPopup: function(settings, idx = 0, title = "", msg = "") {
            if ($(`#${settings.id}_${idx}`).length === 0) {
                const html = `
                    <div class="notice_popup" id="${settings.id}_${idx}" data-prefix="${settings.id}">
                        <span class="batsu"></span>
                        <div class="notice_popup_content color-${settings.color} py-3">
                            ${settings.titleShow ? `<div class="title">${title}</div>` : ''}
                            ${settings.msgShow ? `<div class="message">${msg}</div>` : ''}
                        </div>
                    </div>`;
                $(html).prependTo("body");
            }
        },

        /**
         * ポップアップの位置を調整する
         * @param {Object} settings - 現在の設定
         */
        _adjustPopupPosition: function(settings) {
            const popupHeight = $(".notice_popup").outerHeight();
            const bottomOffset = 1.5 * popupHeight * popupState.popupCount;
            $(`#${settings.id}_${popupState.popupCount - 1}`).css('bottom', `${bottomOffset}px`);
        },

        /**
         * 全てのポップアップを削除する
         */
        destroy: function() {
            $(".notice_popup").remove();
            popupState.popupCount = 0;
        }
    };

    // jQueryプラグインとして登録
    $.noticePopup = function(methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            return methods.init.apply(this, arguments);
        } else {
            $.error(`Method ${methodOrOptions} does not exist on jQuery.noticePopup`);
        }
    };

    // 動的要素にイベントをバインド
    $(document).on("click", ".batsu", function() {
        const popup = $(this).parent(".notice_popup");

        // プレフィックスidを取得
        const popupId = popup.attr('data-prefix');

        popup.fadeOut(500, function() {
            $(this).remove();

            popupState.popupCount--;

            let last = null;
            // 残りのポップアップ位置を再調整
            $(".notice_popup").each(function(index) {
                last = $(this);
                // id振り直し
                $(this).attr("id", `${popupId}_${index}`);
                $(this).css('bottom', `${1.5 * $(this).outerHeight() * (index + 1)}px`);
            });
            if(last !== null){
                last.css('bottom', "1rem");
            }
        });
    });
})(jQuery);

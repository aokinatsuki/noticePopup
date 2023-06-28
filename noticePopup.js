// **各classについて**


// **独自イベントについて**
// 表示時: noticeShowBefore, noticeShowAfter
// メッセージ内容追加イベント: noticeMsgText

// **外から呼び出せるメソッドについて**
// const 変数 = new noticePopup();
// 変数.init() のように呼び出せます
// 初期設定: init() option{isServerSide: ポップアップの判別をajax経由にするか(Bool), url: isServerSideがtrueの場合はurl指定, func: isServerSideがfalseの場合のチェック処理 ()=>{処理}, id: ポップアップ自体につける独自id, color: 色指定, size: sm・md・lg（ポップアップのサイズ指定）, titleShow: タイトルエリア表示(Bool), msgShow: メッセージエリア表示(Bool)}
// 破壊用: destroy() ※必ず更新するnodeを渡す※

const noticePopup = function(){
    // デフォルトのオプション設定
    const defaultOption = {
        isServerSide: false,
        url: "",
        func: ()=>{},
        id: 'notice_popup',
        color: "default",
        size: "md",
        titleShow: true,
        msgShow: true
    };

    let setOptionlist = {};

    // カスタム色設定可能なもの
    /**
     * red
     * green
     * default
     */

    // 初期設定
    noticePopup.prototype.init = function(options={}){
        let setOption = {};
        $.each(Object.keys(defaultOption), function(idx, val){
            // 独自で設定があればその設定をセットする
            setOption[val] = val in options ? options[val] : defaultOption[val];
        });
        setOptionlist = setOption;

        // サーバーサイド指定だが、urlなしのためエラーを返す
        if(setOptionlist.isServerSide && (setOptionlist.url.length === 0 || setOptionlist.url === undefined)){
            return error_log("Error[noticePopup]: isServerSide is true but url is null");
        }

        init(setOption);
    }
    // 破壊
    noticePopup.prototype.destroy = function(elm=null){

    }

    function init(options){
        monitor(options);
        // 10秒ごとに監視
        setInterval(function(){
            console.log("10秒経ちました");
            monitor(options);
        },10000);
    }

    // データ監視ajax処理
    function monitor(options){
        let notices = "";
        if(options.isServerSide){
            let res = $.ajax({
                type: 'GET',
                url: options.url,
                async: false,
                datatype: "json"
            }).responseText;
            notices = $.parseJSON(res);
        } else {
            notices = options.func;
        }

        if(notices.length > 0){
            $('.notice_popup').trigger('noticeShowBefore');

            $.each(notices, function(idx, val){
                show_notice(val.title, val.message, idx);
            })

            $('.notice_popup').trigger('noticeShowAfter');
        }
    }

    // 通知情報表示処理
    function show_notice(title="", msg="", idx=0){
        init_create_html(idx, title, msg);

        $(`#${setOptionlist.id}_${idx}`).trigger("show");

        $(`#${setOptionlist.id}_${idx}`).trigger('noticeMsgText');

        setTimeout(function(){
            $(`#${setOptionlist.id}_${idx}`).trigger("hide");
        }, 8000);
    }

    // 通知の吹き出しのhtml生成(初回に呼び出す処理)
    function init_create_html(idx=0, title="", msg=""){
        // まだ生成していない場合はhtml生成
        if($(`#${setOptionlist.id}_${idx}`).length === 0){
            let html = `<div class="notice_popup" id="${setOptionlist.id}_${idx}">`;
            html += '<span class="batsu"></span>';
            html += `<div class="notice_popup_content color-${setOptionlist.color} mb-5 py-3">`;
            if(setOptionlist.titleShow){
                html += '<div class="title">'+ title +'</div>';
            }
            if(setOptionlist.msgShow){
                html += '<div class="message">'+ msg +'</div>';
            }
            html += '</div>';
            html += '</div>';
            $(html).appendTo("#gen_maincontent");
        }
    }

    // ×ボタン押下
    $(document).on("click", ".batsu", function(){
        $(this).parent(".notice_popup").trigger("hide");
    })

    // 表示処理
    $(document).on("show", ".notice_popup", function(){
        $(this).fadeIn(500);
    })

    // 非表示処理
    $(document).on("hide", ".notice_popup", function(){
        $(this).fadeOut(500);
    })

    // エラーログ用
    function error_log(msg=''){
        // 指定のメッセージがある場合はそれをログに出す
        if(msg.length > 0){
            console.error(msg);
        }

        // 破壊の時に指定のnodeが渡されていない場合はエラー
        if(isDeleteFlg){
            isDeleteFlg = false;
            console.error('Error[noticePopup]: not select destroy node');
        }

        return;
    }
}

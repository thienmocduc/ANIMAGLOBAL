/* ============================================================
   AnimaCare Chat System — Customer ↔ KTV Messaging
   IIFE, no imports. Depends on window.AnimaChat, window.AnimaConversations
   ============================================================ */
(function () {
  "use strict";

  var POLL_MS = 5000;
  var _pollTimer = null;
  var _currentConvId = null;
  var _lastMsgTs = null;

  function t(vi, en) { return (document.documentElement.lang || "vi") === "vi" ? vi : en; }

  /* ---------- helpers ---------- */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function ce(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html) el.innerHTML = html;
    return el;
  }

  /* ---------- inject styles once ---------- */
  function injectStyles() {
    if (qs("#ac-chat-css")) return;
    var s = ce("style"); s.id = "ac-chat-css";
    s.textContent = [
      ".ac-chat-panel{position:fixed;top:0;right:-400px;width:380px;height:100%;background:#0A1218;color:#F8F2E0;display:flex;flex-direction:column;z-index:9999;box-shadow:-4px 0 24px rgba(0,0,0,.5);transition:right .3s ease;font-family:sans-serif}",
      ".ac-chat-panel.open{right:0}",
      ".ac-chat-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#0d1820;border-bottom:1px solid #1a2a36}",
      ".ac-chat-hdr h3{margin:0;font-size:15px;color:#00C896}",
      ".ac-chat-hdr button{background:none;border:none;color:#F8F2E0;font-size:22px;cursor:pointer}",
      ".ac-chat-msgs{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:6px}",
      ".ac-msg{max-width:75%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.4;word-wrap:break-word}",
      ".ac-msg.customer{align-self:flex-end;background:#00C896;color:#0A1218;border-bottom-right-radius:4px}",
      ".ac-msg.ktv{align-self:flex-start;background:#1a2a36;color:#F8F2E0;border-bottom-left-radius:4px}",
      ".ac-msg .ac-meta{font-size:10px;opacity:.6;margin-top:3px}",
      ".ac-chat-input{display:flex;padding:10px 12px;gap:8px;background:#0d1820;border-top:1px solid #1a2a36}",
      ".ac-chat-input input{flex:1;padding:8px 12px;border:1px solid #1a2a36;border-radius:8px;background:#111e28;color:#F8F2E0;font-size:13px;outline:none}",
      ".ac-chat-input input:focus{border-color:#00C896}",
      ".ac-chat-input button{background:#00C896;color:#0A1218;border:none;border-radius:8px;padding:8px 16px;font-weight:700;cursor:pointer}",
      ".ac-conv-item{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#111e28;border-radius:10px;margin-bottom:6px;cursor:pointer;transition:background .2s}",
      ".ac-conv-item:hover{background:#1a2a36}",
      ".ac-conv-item .name{font-size:13px;font-weight:600;color:#F8F2E0}",
      ".ac-conv-item .last{font-size:11px;color:#8a9bae;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}",
      ".ac-unread{background:#00C896;color:#0A1218;font-size:10px;font-weight:700;border-radius:50%;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center}",
      ".ac-chat-panel.readonly .ac-chat-input{display:none}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---------- panel DOM ---------- */
  function ensurePanel() {
    if (qs("#ac-chat-panel")) return qs("#ac-chat-panel");
    injectStyles();
    var panel = ce("div", "ac-chat-panel"); panel.id = "ac-chat-panel";
    panel.innerHTML =
      '<div class="ac-chat-hdr"><h3 id="ac-chat-name"></h3><button id="ac-chat-close">&times;</button></div>' +
      '<div class="ac-chat-msgs" id="ac-chat-msgs"></div>' +
      '<div class="ac-chat-input"><input id="ac-chat-txt" placeholder="' + t("Nhập tin nhắn...", "Type a message...") + '"/><button id="ac-chat-send">' + t("Gửi", "Send") + '</button></div>';
    document.body.appendChild(panel);
    qs("#ac-chat-close").onclick = closeChatPanel;
    qs("#ac-chat-send").onclick = function () { _sendFromInput(); };
    qs("#ac-chat-txt").addEventListener("keydown", function (e) { if (e.key === "Enter") _sendFromInput(); });
    return panel;
  }

  function _sendFromInput() {
    var inp = qs("#ac-chat-txt"); if (!inp) return;
    var msg = inp.value.trim(); if (!msg) return;
    var p = ensurePanel();
    var sid = p.dataset.senderId, stype = p.dataset.senderType, sname = p.dataset.senderName;
    if (!sid || !_currentConvId) return;
    sendChatMessage(_currentConvId, sid, stype, sname, msg);
    inp.value = "";
  }

  /* ---------- open / close ---------- */
  function openChatPanel(conversationId, otherName, otherType, opts) {
    var p = ensurePanel();
    _currentConvId = conversationId;
    qs("#ac-chat-name").textContent = otherName;
    qs("#ac-chat-msgs").innerHTML = "";
    _lastMsgTs = null;
    opts = opts || {};
    p.dataset.senderId = opts.senderId || "";
    p.dataset.senderType = opts.senderType || "";
    p.dataset.senderName = opts.senderName || "";
    p.classList.toggle("readonly", !!opts.readonly);
    setTimeout(function () { p.classList.add("open"); }, 10);
    _loadMessages(conversationId);
    _startPoll();
  }

  function closeChatPanel() {
    var p = qs("#ac-chat-panel");
    if (p) p.classList.remove("open");
    _currentConvId = null;
    _stopPoll();
  }

  /* ---------- load & render messages ---------- */
  async function _loadMessages(convId) {
    if (!window.AnimaChat) return;
    try {
      var q = window.AnimaChat.from("chat_messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
      if (_lastMsgTs) q = q.gt("created_at", _lastMsgTs);
      var res = await q;
      var msgs = (res.data || []);
      if (!msgs.length) return;
      var container = qs("#ac-chat-msgs"); if (!container) return;
      msgs.forEach(function (m) {
        var cls = m.sender_type === "customer" ? "customer" : "ktv";
        var div = ce("div", "ac-msg " + cls);
        div.innerHTML = '<div>' + _esc(m.message) + '</div><div class="ac-meta">' + _esc(m.sender_name) + " · " + _fmtTime(m.created_at) + "</div>";
        container.appendChild(div);
      });
      _lastMsgTs = msgs[msgs.length - 1].created_at;
      container.scrollTop = container.scrollHeight;
    } catch (e) { console.error("chat load err", e); }
  }

  function _esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function _fmtTime(iso) {
    try { var d = new Date(iso); return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch (_) { return ""; }
  }

  /* ---------- polling ---------- */
  function _startPoll() { _stopPoll(); _pollTimer = setInterval(function () { if (_currentConvId) _loadMessages(_currentConvId); }, POLL_MS); }
  function _stopPoll() { if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; } }

  /* ---------- startConversation ---------- */
  async function startConversation(customerId, customerName, ktvId, ktvName, bookingId) {
    if (!window.AnimaConversations) return null;
    try {
      var existing = await window.AnimaConversations.from("conversations").select("*")
        .eq("customer_id", customerId).eq("ktv_id", ktvId).limit(1).single();
      if (existing.data) return existing.data;
      var ins = await window.AnimaConversations.from("conversations").insert({
        customer_id: customerId, customer_name: customerName,
        ktv_id: ktvId, ktv_name: ktvName,
        booking_id: bookingId || null, status: "active",
        last_message: "", unread_customer: 0, unread_ktv: 0
      }).select().single();
      return ins.data;
    } catch (e) { console.error("startConversation err", e); return null; }
  }

  /* ---------- sendChatMessage ---------- */
  async function sendChatMessage(conversationId, senderId, senderType, senderName, message) {
    if (!window.AnimaChat) return null;
    try {
      var res = await window.AnimaChat.from("chat_messages").insert({
        conversation_id: conversationId, sender_id: senderId,
        sender_type: senderType, sender_name: senderName, message: message
      }).select().single();
      var unreadCol = senderType === "customer" ? "unread_ktv" : "unread_customer";
      var upd = {}; upd.last_message = message; upd[unreadCol] = window.AnimaConversations ? 1 : 0;
      if (window.AnimaConversations) {
        await window.AnimaConversations.from("conversations").update(upd).eq("id", conversationId);
      }
      if (_currentConvId === conversationId) _loadMessages(conversationId);
      return res.data;
    } catch (e) { console.error("sendChatMessage err", e); return null; }
  }

  /* ---------- renderChatList ---------- */
  async function renderChatList(containerId, userId, userType) {
    var box = document.getElementById(containerId); if (!box || !window.AnimaConversations) return;
    try {
      var col = userType === "customer" ? "customer_id" : "ktv_id";
      var res = await window.AnimaConversations.from("conversations").select("*").eq(col, userId).order("updated_at", { ascending: false });
      var convs = res.data || [];
      box.innerHTML = "";
      if (!convs.length) { box.innerHTML = '<p style="color:#8a9bae;text-align:center;padding:20px">' + t("Chưa có cuộc trò chuyện", "No conversations yet") + "</p>"; return; }
      convs.forEach(function (c) {
        var otherName = userType === "customer" ? c.ktv_name : c.customer_name;
        var otherType = userType === "customer" ? "ktv" : "customer";
        var unread = userType === "customer" ? c.unread_customer : c.unread_ktv;
        var item = ce("div", "ac-conv-item");
        item.innerHTML = '<div><div class="name">' + _esc(otherName) + '</div><div class="last">' + _esc(c.last_message || "") + "</div></div>" +
          (unread > 0 ? '<span class="ac-unread">' + unread + "</span>" : "");
        item.onclick = function () {
          if (window.AnimaConversations) {
            var reset = {}; reset[userType === "customer" ? "unread_customer" : "unread_ktv"] = 0;
            window.AnimaConversations.from("conversations").update(reset).eq("id", c.id).then(function () { renderChatList(containerId, userId, userType); });
          }
          openChatPanel(c.id, otherName, otherType, { senderId: userId, senderType: userType, senderName: userType === "customer" ? c.customer_name : c.ktv_name });
        };
        box.appendChild(item);
      });
    } catch (e) { console.error("renderChatList err", e); }
  }

  /* ---------- renderAdmChats ---------- */
  async function renderAdmChats() {
    injectStyles();
    var box = document.getElementById("admin-chats-container"); if (!box || !window.AnimaConversations) return;
    try {
      var res = await window.AnimaConversations.from("conversations").select("*").order("updated_at", { ascending: false });
      var convs = res.data || [];
      box.innerHTML = "";
      if (!convs.length) { box.innerHTML = '<p style="color:#8a9bae;text-align:center;padding:20px">' + t("Không có cuộc trò chuyện", "No conversations") + "</p>"; return; }
      convs.forEach(function (c) {
        var item = ce("div", "ac-conv-item");
        item.innerHTML = '<div><div class="name">' + _esc(c.customer_name) + " ↔ " + _esc(c.ktv_name) + '</div><div class="last">' + _esc(c.last_message || t("Chưa có tin nhắn", "No messages")) + "</div></div>" +
          '<span style="font-size:10px;color:#8a9bae">' + _fmtTime(c.updated_at) + "</span>";
        item.onclick = function () {
          openChatPanel(c.id, c.customer_name + " ↔ " + c.ktv_name, "admin", { readonly: true });
        };
        box.appendChild(item);
      });
    } catch (e) { console.error("renderAdmChats err", e); }
  }

  /* ---------- expose on window ---------- */
  window.openChatPanel = openChatPanel;
  window.closeChatPanel = closeChatPanel;
  window.startConversation = startConversation;
  window.sendChatMessage = sendChatMessage;
  window.renderChatList = renderChatList;
  window.renderAdmChats = renderAdmChats;
})();

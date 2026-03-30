/* ============================================================
   AnimaCare Chat System — Customer <-> KTV Messaging
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
      '<div class="ac-chat-input"><input id="ac-chat-txt" placeholder="' + t("Nh\u1EADp tin nh\u1EAFn...", "Type a message...") + '"/><button id="ac-chat-send">' + t("G\u1EEDi", "Send") + '</button></div>';
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
  function _loadMessages(convId) {
    if (!window.AnimaChat) return;
    AnimaChat.getMessages(convId).then(function(msgs) {
      msgs = msgs || [];
      // Filter to only new messages if we have a last timestamp
      if (_lastMsgTs) {
        msgs = msgs.filter(function(m) { return m.created_at > _lastMsgTs; });
      }
      if (!msgs.length) return;
      var container = qs("#ac-chat-msgs"); if (!container) return;
      msgs.forEach(function (m) {
        var cls = m.sender_type === "customer" ? "customer" : "ktv";
        var div = ce("div", "ac-msg " + cls);
        div.innerHTML = '<div>' + _esc(m.message) + '</div><div class="ac-meta">' + _esc(m.sender_name) + " \u00B7 " + _fmtTime(m.created_at) + "</div>";
        container.appendChild(div);
      });
      _lastMsgTs = msgs[msgs.length - 1].created_at;
      container.scrollTop = container.scrollHeight;
    }).catch(function(e) { console.error("chat load err", e); });
  }

  function _esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function _fmtTime(iso) {
    try { var d = new Date(iso); return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch (_) { return ""; }
  }

  /* ---------- polling ---------- */
  function _startPoll() { _stopPoll(); _pollTimer = setInterval(function () { if (_currentConvId) _loadMessages(_currentConvId); }, POLL_MS); }
  function _stopPoll() { if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; } }

  /* ---------- startConversation ---------- */
  function startConversation(customerId, customerName, ktvId, ktvName, bookingId) {
    if (!window.AnimaConversations) return Promise.resolve(null);
    return AnimaConversations.find(customerId, ktvId).then(function(existing) {
      if (existing) return existing;
      return AnimaConversations.create({
        customer_id: customerId, customer_name: customerName,
        ktv_id: ktvId, ktv_name: ktvName,
        booking_id: bookingId || null, status: "active",
        last_message: "", unread_customer: 0, unread_ktv: 0
      });
    }).catch(function(e) { console.error("startConversation err", e); return null; });
  }

  /* ---------- sendChatMessage ---------- */
  function sendChatMessage(conversationId, senderId, senderType, senderName, message) {
    if (!window.AnimaChat) return Promise.resolve(null);
    return AnimaChat.send({
      conversation_id: conversationId, sender_id: senderId,
      sender_type: senderType, sender_name: senderName, message: message
    }).then(function(res) {
      var unreadCol = senderType === "customer" ? "unread_ktv" : "unread_customer";
      var upd = { last_message: message };
      upd[unreadCol] = 1;
      if (window.AnimaConversations) {
        AnimaConversations.update(conversationId, upd);
      }
      if (_currentConvId === conversationId) _loadMessages(conversationId);
      return res;
    }).catch(function(e) { console.error("sendChatMessage err", e); return null; });
  }

  /* ---------- renderChatList ---------- */
  function renderChatList(containerId, userId, userType) {
    var box = document.getElementById(containerId); if (!box || !window.AnimaConversations) return;
    var col = userType === "customer" ? "customer_id" : "ktv_id";
    AnimaConversations.getAll({ filter: col + '=eq.' + encodeURIComponent(userId) }).then(function(convs) {
      convs = convs || [];
      box.innerHTML = "";
      if (!convs.length) { box.innerHTML = '<p style="color:#8a9bae;text-align:center;padding:20px">' + t("Ch\u01B0a c\u00F3 cu\u1ED9c tr\u00F2 chuy\u1EC7n", "No conversations yet") + "</p>"; return; }
      convs.forEach(function (c) {
        var otherName = userType === "customer" ? c.ktv_name : c.customer_name;
        var otherType = userType === "customer" ? "ktv" : "customer";
        var unread = userType === "customer" ? c.unread_customer : c.unread_ktv;
        var item = ce("div", "ac-conv-item");
        item.innerHTML = '<div><div class="name">' + _esc(otherName) + '</div><div class="last">' + _esc(c.last_message || "") + "</div></div>" +
          (unread > 0 ? '<span class="ac-unread">' + unread + "</span>" : "");
        item.onclick = function () {
          if (window.AnimaConversations) {
            var reset = {};
            reset[userType === "customer" ? "unread_customer" : "unread_ktv"] = 0;
            AnimaConversations.update(c.id, reset).then(function () { renderChatList(containerId, userId, userType); });
          }
          openChatPanel(c.id, otherName, otherType, { senderId: userId, senderType: userType, senderName: userType === "customer" ? c.customer_name : c.ktv_name });
        };
        box.appendChild(item);
      });
    }).catch(function(e) { console.error("renderChatList err", e); });
  }

  /* ---------- renderAdmChats ---------- */
  function renderAdmChats() {
    injectStyles();
    var box = document.getElementById("admin-chats-container"); if (!box || !window.AnimaConversations) return;
    AnimaConversations.getAll().then(function(convs) {
      convs = convs || [];
      box.innerHTML = "";
      if (!convs.length) { box.innerHTML = '<p style="color:#8a9bae;text-align:center;padding:20px">' + t("Kh\u00F4ng c\u00F3 cu\u1ED9c tr\u00F2 chuy\u1EC7n", "No conversations") + "</p>"; return; }
      convs.forEach(function (c) {
        var item = ce("div", "ac-conv-item");
        item.innerHTML = '<div><div class="name">' + _esc(c.customer_name) + " \u2194 " + _esc(c.ktv_name) + '</div><div class="last">' + _esc(c.last_message || t("Ch\u01B0a c\u00F3 tin nh\u1EAFn", "No messages")) + "</div></div>" +
          '<span style="font-size:10px;color:#8a9bae">' + _fmtTime(c.updated_at) + "</span>";
        item.onclick = function () {
          openChatPanel(c.id, c.customer_name + " \u2194 " + c.ktv_name, "admin", { readonly: true });
        };
        box.appendChild(item);
      });
    }).catch(function(e) { console.error("renderAdmChats err", e); });
  }

  /* ---------- expose on window ---------- */
  window.openChatPanel = openChatPanel;
  window.closeChatPanel = closeChatPanel;
  window.startConversation = startConversation;
  window.sendChatMessage = sendChatMessage;
  window.renderChatList = renderChatList;
  window.renderAdmChats = renderAdmChats;
})();

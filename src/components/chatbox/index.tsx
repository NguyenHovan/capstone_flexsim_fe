import React, { useRef, useState, useEffect } from "react";
import { Button, Input, Space, Tabs, Badge, Spin, Tooltip } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { ChatService } from "../../services/chat.service";

type Msg = { id: string; role: "user" | "assistant"; text: string };

function extractText(resp: any): string {
  if (resp == null) return "Không có dữ liệu trả về.";
  if (typeof resp === "string") return resp;
  return (
    resp.reply ??
    resp.message ??
    resp.data ??
    (typeof resp.text === "string" ? resp.text : JSON.stringify(resp))
  );
}

function useChat(apiCall: (message: string) => Promise<any>) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const id = Date.now().toString();
    setMessages((prev) => [...prev, { id, role: "user", text }]);
    setLoading(true);
    try {
      const raw = await apiCall(text);
      const answer = extractText(raw);
      setMessages((prev) => [
        ...prev,
        { id: id + "-ai", role: "assistant", text: answer },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: id + "-err",
          role: "assistant",
          text:
            e?.response?.data?.message || e?.message || "Có lỗi khi gọi API.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight; // auto-scroll bottom
  }, [messages, loading]);

  return { messages, loading, send, scrollRef };
}

const ChatWindow: React.FC<{
  placeholder: string;
  hook: ReturnType<typeof useChat>;
}> = ({ placeholder, hook }) => {
  const { messages, loading, send, scrollRef } = hook;
  const [input, setInput] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    send(text);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        flex: "1 1 0",
      }}
    >
      <div
        ref={scrollRef}
        style={{
          padding: 10,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          scrollbarGutter: "stable",
          WebkitOverflowScrolling: "touch",
          background: "#fafafa",
          border: "1px solid #f0f0f0",
          borderRadius: 8,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={
              m.role === "user"
                ? {
                    maxWidth: "78%",
                    margin: "6px 0 6px auto",
                    background: "#1677ff",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "8px 10px",
                    boxShadow: "0 4px 12px rgba(22,119,255,0.25)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }
                : {
                    maxWidth: "78%",
                    margin: "6px 0",
                    background: "#fff",
                    color: "#111",
                    borderRadius: 10,
                    padding: "8px 10px",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }
            }
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div
            style={{
              maxWidth: "78%",
              margin: "6px 0",
              background: "#fff",
              color: "#111",
              borderRadius: 10,
              padding: "8px 10px",
              border: "1px solid #f0f0f0",
              opacity: 0.9,
            }}
          >
            <Space>
              <Spin size="small" /> Đang trả lời...
            </Space>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flex: "0 0 auto",
        }}
      >
        <Input.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoSize={{ minRows: 1, maxRows: 4 }}
        />
        <Tooltip title="Gửi (Enter)">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!input.trim()}
          />
        </Tooltip>
      </div>
    </div>
  );
};

const FloatingDualChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<"gemini" | "gpt">("gemini");

  const geminiHook = useChat(ChatService.gemini);
  const gptHook = useChat(ChatService.gpt);

  const [unread, setUnread] = useState(0);
  const prevGemLen = useRef(0);
  const prevGPTLen = useRef(0);

  useEffect(() => {
    if (!open) {
      const aiNew =
        geminiHook.messages
          .slice(prevGemLen.current)
          .filter((m) => m.role === "assistant").length +
        gptHook.messages
          .slice(prevGPTLen.current)
          .filter((m) => m.role === "assistant").length;
      setUnread((u) => u + aiNew);
    }
    prevGemLen.current = geminiHook.messages.length;
    prevGPTLen.current = gptHook.messages.length;
  }, [geminiHook.messages, gptHook.messages, open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  return (
    <>
      <Badge count={unread} offset={[-4, 10]}>
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          onClick={() => setOpen((v) => !v)}
          style={{
            position: "fixed",
            right: 20,
            bottom: 24,
            zIndex: 9999,
            height: 56,
            width: 56,
            borderRadius: 28,
            boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
          }}
        />
      </Badge>

      {open && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 90,
            zIndex: 9999,
            width: "min(360px, calc(100vw - 24px))",
            height: "min(520px, calc(100vh - 24px))",
            borderRadius: 16,
            background: "#fff",
            boxShadow:
              "0 16px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Topbar */}
          <div
            style={{
              padding: "10px 12px",
              background:
                "linear-gradient(135deg, rgba(24,144,255,0.15), rgba(114,46,209,0.15))",
              borderBottom: "1px solid rgba(5,5,5,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space>
              <MessageOutlined />
              <span style={{ fontWeight: 700 }}>AI Chatbox</span>
            </Space>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Content (flex column full height) */}
          <div
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <Tabs
              activeKey={active}
              onChange={(k) => setActive(k as "gemini" | "gpt")}
              tabBarStyle={{ marginBottom: 8 }}
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
              items={[
                {
                  key: "gemini",
                  label: (
                    <Space>
                      <ThunderboltOutlined style={{ color: "#722ED1" }} />
                      Gemini
                    </Space>
                  ),
                  children: (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 400,
                      }}
                    >
                      <ChatWindow
                        placeholder="Nhập tin nhắn cho Gemini..."
                        hook={geminiHook}
                      />
                    </div>
                  ),
                },
                {
                  key: "gpt",
                  label: (
                    <Space>
                      <RobotOutlined style={{ color: "#1677FF" }} />
                      ChatGPT
                    </Space>
                  ),
                  children: (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                      }}
                    >
                      <ChatWindow
                        placeholder="Nhập tin nhắn cho ChatGPT..."
                        hook={gptHook}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingDualChat;

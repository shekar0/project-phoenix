import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, GenerateResponse, HistoryItem } from '../../services/api.service';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;        // text content (prompt or status)
  imageUrl?: string;       // generated image URL
  status?: string;
  qualityScore?: number;
  timestamp: Date;
  loading?: boolean;
  error?: string;
  style?: string;
  genType?: 'image' | 'video';
  jobId?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
}

@Component({
  selector: 'app-generate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gemini-layout">

      <!-- ─── SIDEBAR ─── -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">

        <div class="sidebar-header">
          <button class="sidebar-toggle" (click)="sidebarCollapsed = !sidebarCollapsed"
                  title="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <button *ngIf="!sidebarCollapsed" class="new-chat-btn" (click)="startNewConversation()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>New creation</span>
          </button>
        </div>

        <div *ngIf="!sidebarCollapsed" class="sidebar-section-label">Recent</div>

        <div *ngIf="!sidebarCollapsed" class="sidebar-conversations">
          <div *ngFor="let conv of conversations; let i = index"
               class="sidebar-conv-wrapper"
               [class.active]="i === activeConversationIndex">
            <button class="sidebar-conv-item"
                    [class.active]="i === activeConversationIndex"
                    (click)="switchConversation(i)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <span class="conv-title">{{ conv.title }}</span>
            </button>
            <button class="conv-delete-btn" title="Delete chat"
                    (click)="deleteConversation(i, $event)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>

          <!-- Loading skeleton for history -->
          <div *ngIf="historyLoading" class="sidebar-loading">
            <div class="skeleton-line" *ngFor="let s of [1,2,3]"></div>
          </div>
        </div>

        <div *ngIf="!sidebarCollapsed" class="sidebar-footer">
          <div class="sidebar-footer-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            <span>Settings &amp; help</span>
          </div>
        </div>
      </aside>

      <!-- ─── MAIN CONTENT ─── -->
      <main class="main-content">

        <!-- Top bar  -->
        <div class="topbar">
          <div class="topbar-title">
            <span class="brand-name">Project Phoenix</span>
          </div>
          <div class="topbar-actions">
            <div class="model-selector" (click)="showModelMenu = !showModelMenu">
              <span class="model-label">{{ selectedModel }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <!-- Model dropdown -->
            <div *ngIf="showModelMenu" class="model-dropdown">
              <button *ngFor="let m of models"
                      class="model-option"
                      [class.selected]="m === selectedModel"
                      (click)="selectedModel = m; showModelMenu = false">
                <span>{{ m }}</span>
                <svg *ngIf="m === selectedModel" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Chat / Conversation area -->
        <div class="chat-area" #chatArea>

          <!-- Transition overlay while switching chats -->
          <div *ngIf="switchingChat" class="chat-transition">
            <div class="transition-loader">
              <div class="transition-dot"></div>
              <div class="transition-dot"></div>
              <div class="transition-dot"></div>
            </div>
            <p class="transition-text">Loading conversation...</p>
          </div>

          <!-- Empty state -->
          <div *ngIf="currentMessages.length === 0 && !loading && !switchingChat" class="empty-state">
            <div class="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#emptyGrad)" stroke-width="1.5">
                <defs>
                  <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1"/>
                    <stop offset="100%" stop-color="#a855f7"/>
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 class="empty-title">What would you like to create?</h2>
            <p class="empty-subtitle">Describe an image or video and AI will bring it to life</p>

            <!-- Quick suggestion chips -->
            <div class="suggestion-chips">
              <button *ngFor="let chip of suggestions"
                      class="suggestion-chip"
                      (click)="prompt = chip; generate()">
                <span class="chip-icon">{{ chip.split(' ')[0] === 'A' ? '✨' : '🎨' }}</span>
                {{ chip }}
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div *ngFor="let msg of currentMessages; let i = index"
               class="message-row"
               [class.user-row]="msg.role === 'user'"
               [class.ai-row]="msg.role === 'ai'">

            <!-- User message -->
            <div *ngIf="msg.role === 'user'" class="message user-message">
              <div class="message-bubble user-bubble">
                {{ msg.content }}
              </div>
            </div>

            <!-- AI message -->
            <div *ngIf="msg.role === 'ai'" class="message ai-message">
              <div class="ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div class="ai-content">
                <!-- Loading state -->
                <div *ngIf="msg.loading" class="ai-loading">
                  <div class="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <p class="loading-text">Creating your {{ msg.genType || 'image' }}...</p>
                </div>

                <!-- Error state -->
                <div *ngIf="msg.error" class="ai-error">
                  <div class="error-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                    </svg>
                    Generation Failed
                  </div>
                  <p class="error-detail">{{ msg.error }}</p>
                </div>

                <!-- Image result -->
                <div *ngIf="msg.imageUrl && !msg.loading" class="ai-image-result">
                  <img [src]="msg.imageUrl" [alt]="msg.content"
                       class="generated-image"
                       loading="lazy"
                       (load)="onImageLoad($event)" />
                </div>

                <!-- Video processing -->
                <div *ngIf="msg.genType === 'video' && msg.status === 'processing' && !msg.loading" class="video-processing">
                  <div class="video-badge">🎬 Video is being generated</div>
                  <p class="video-job">Job ID: {{ msg.jobId }}</p>
                </div>

                <!-- Action bar under AI response -->
                <div *ngIf="!msg.loading && (msg.imageUrl || msg.error)" class="ai-actions">
                  <button class="action-btn" title="Like">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
                    </svg>
                  </button>
                  <button class="action-btn" title="Dislike">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
                    </svg>
                  </button>
                  <button class="action-btn" title="Regenerate" (click)="regenerate(msg)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                    </svg>
                  </button>
                  <button *ngIf="msg.imageUrl" class="action-btn" title="Share" (click)="shareImage(msg)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
                    </svg>
                  </button>
                  <button class="action-btn" title="More">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── BOTTOM INPUT BAR ─── -->
        <div class="input-container">
          <div class="input-bar">
            <!-- Style selector pills -->
            <div class="input-top-row" *ngIf="showStyleBar">
              <div class="style-pills">
                <button *ngFor="let s of styles"
                        class="style-pill"
                        [class.active]="selectedStyle === s.value"
                        (click)="selectedStyle = selectedStyle === s.value ? '' : s.value">
                  {{ s.icon }} {{ s.label }}
                </button>
              </div>
            </div>

            <div class="input-main-row">
              <textarea
                #promptInput
                [(ngModel)]="prompt"
                (keydown.enter)="onEnterPress($event)"
                rows="1"
                class="prompt-textarea"
                placeholder="Describe what you want to create..."
                (input)="autoResize($event)"
              ></textarea>

              <div class="input-actions">
                <!-- Tools toggle -->
                <button class="input-tool-btn" (click)="showStyleBar = !showStyleBar" title="Styles & Tools">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                  </svg>
                  <span>Tools</span>
                </button>

                <!-- Type toggle -->
                <div class="type-toggle">
                  <button class="type-option" [class.active]="genType === 'image'" (click)="genType = 'image'">
                    🖼️
                  </button>
                  <button class="type-option" [class.active]="genType === 'video'" (click)="genType = 'video'">
                    🎬
                  </button>
                </div>

                <!-- Send button -->
                <button class="send-btn"
                        [disabled]="loading || !prompt.trim()"
                        (click)="generate()">
                  <svg *ngIf="!loading" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                  </svg>
                  <svg *ngIf="loading" class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <p class="disclaimer">AI-generated content may not be accurate. Verify important details.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════════
       GEMINI-STYLE LAYOUT
       ═══════════════════════════════════════════════════════ */

    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .gemini-layout {
      display: flex;
      height: 100vh;
      background: #eef2f6;
      color: #1e293b;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* ─── SIDEBAR ─────────────────────────────────────── */

    .sidebar {
      width: 280px;
      min-width: 280px;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid rgba(148, 163, 184, 0.2);
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 64px;
      min-width: 64px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 8px;
      border-radius: 10px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-toggle:hover {
      background: rgba(59, 130, 246, 0.08);
      color: #1e293b;
    }

    .new-chat-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      color: #1e293b;
      padding: 10px 18px;
      border-radius: 24px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.25s;
      white-space: nowrap;
      flex: 1;
    }

    .new-chat-btn:hover {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.35);
    }

    .sidebar-section-label {
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 20px 8px;
    }

    .sidebar-conversations {
      flex: 1;
      overflow-y: auto;
      padding: 0 8px;
    }

    .sidebar-conv-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .sidebar-conv-wrapper:hover {
      background: rgba(59, 130, 246, 0.06);
    }

    .sidebar-conv-wrapper.active {
      background: rgba(59, 130, 246, 0.12);
    }

    .sidebar-conv-wrapper:hover .conv-delete-btn {
      opacity: 1;
    }

    .sidebar-conv-item {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      color: #475569;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .sidebar-conv-item:hover {
      color: #1e293b;
    }

    .sidebar-conv-item.active {
      color: #1d4ed8;
    }

    .conv-delete-btn {
      position: absolute;
      right: 6px;
      opacity: 0;
      background: none;
      border: none;
      color: #64748b;
      padding: 6px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .conv-delete-btn:hover {
      background: rgba(248, 113, 113, 0.15);
      color: #f87171;
    }

    .conv-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sidebar-loading {
      padding: 12px 16px;
    }

    .skeleton-line {
      height: 14px;
      border-radius: 6px;
      background: linear-gradient(90deg, rgba(59,130,246,0.06) 25%, rgba(59,130,246,0.12) 50%, rgba(59,130,246,0.06) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: 12px;
    }

    .skeleton-line:nth-child(2) { width: 75%; }
    .skeleton-line:nth-child(3) { width: 60%; }

    .sidebar-footer {
      padding: 12px 8px;
      border-top: 1px solid rgba(148, 163, 184, 0.15);
    }

    .sidebar-footer-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sidebar-footer-item:hover {
      background: rgba(59, 130, 246, 0.06);
      color: #475569;
    }

    /* ─── MAIN CONTENT ────────────────────────────────── */

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      position: relative;
    }

    /* ─── TOP BAR ─────────────────────────────────────── */

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.15);
    }

    .brand-name {
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .topbar-actions {
      position: relative;
    }

    .model-selector {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
      background: rgba(59, 130, 246, 0.06);
    }

    .model-selector:hover {
      background: rgba(59, 130, 246, 0.12);
      color: #1e293b;
    }

    .model-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 14px;
      padding: 6px;
      min-width: 200px;
      z-index: 50;
      box-shadow: 0 20px 50px rgba(30, 41, 59, 0.12);
    }

    .model-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13.5px;
      color: #475569;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.15s;
    }

    .model-option:hover {
      background: rgba(59, 130, 246, 0.08);
      color: #1e293b;
    }

    .model-option.selected {
      color: #2563eb;
    }

    /* ─── CHAT AREA ───────────────────────────────────── */

    .chat-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px 0;
      scroll-behavior: smooth;
    }

    /* ─── EMPTY STATE ─────────────────────────────────── */

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px 24px;
      text-align: center;
    }

    .empty-state-icon {
      margin-bottom: 24px;
      opacity: 0.6;
      animation: float 4s ease-in-out infinite;
    }

    .empty-title {
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }

    .empty-subtitle {
      font-size: 15px;
      color: #64748b;
      margin-bottom: 40px;
    }

    .suggestion-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      max-width: 700px;
    }

    .suggestion-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 16px;
      font-size: 13.5px;
      color: #475569;
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.2);
      cursor: pointer;
      transition: all 0.25s;
    }

    .suggestion-chip:hover {
      background: rgba(59, 130, 246, 0.08);
      border-color: rgba(59, 130, 246, 0.3);
      color: #1d4ed8;
      transform: translateY(-2px);
    }

    .chip-icon {
      font-size: 16px;
    }

    /* ─── MESSAGE ROWS ────────────────────────────────── */

    .message-row {
      padding: 0 24px;
      margin-bottom: 8px;
      animation: messageSlideIn 0.35s ease-out;
    }

    .message {
      max-width: 820px;
      margin: 0 auto;
    }

    /* User message */
    .user-message {
      display: flex;
      justify-content: flex-end;
    }

    .user-bubble {
      background: rgba(59, 130, 246, 0.1);
      color: #1e293b;
      padding: 14px 20px;
      border-radius: 22px 22px 6px 22px;
      font-size: 14.5px;
      line-height: 1.6;
      max-width: 70%;
      word-break: break-word;
      border: 1px solid rgba(59, 130, 246, 0.15);
    }

    /* AI message */
    .ai-message {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .ai-avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-top: 2px;
    }

    .ai-content {
      flex: 1;
      min-width: 0;
    }

    /* Loading dots */
    .ai-loading {
      padding: 8px 0;
    }

    .loading-dots {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }

    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      animation: dotPulse 1.4s ease-in-out infinite;
    }

    .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

    .loading-text {
      font-size: 13.5px;
      color: #64748b;
    }

    /* Error */
    .ai-error {
      padding: 4px 0;
    }

    .error-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #f87171;
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.2);
      margin-bottom: 8px;
    }

    .error-detail {
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.5;
    }

    /* Generated image */
    .ai-image-result {
      margin: 8px 0 4px;
    }

    .generated-image {
      max-width: 100%;
      max-height: 520px;
      border-radius: 16px;
      object-fit: contain;
      cursor: pointer;
      transition: transform 0.3s ease;
      box-shadow: 0 10px 40px rgba(30, 41, 59, 0.15);
    }

    .generated-image:hover {
      transform: scale(1.01);
    }

    /* Video processing */
    .video-processing {
      padding: 4px 0;
    }

    .video-badge {
      font-size: 14px;
      font-weight: 500;
      color: #fbbf24;
      margin-bottom: 4px;
    }

    .video-job {
      font-size: 12px;
      color: #64748b;
    }

    /* Action bar */
    .ai-actions {
      display: flex;
      gap: 2px;
      margin-top: 10px;
    }

    .action-btn {
      background: none;
      border: none;
      color: #64748b;
      padding: 8px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      background: rgba(59, 130, 246, 0.08);
      color: #2563eb;
    }

    /* ─── INPUT CONTAINER ─────────────────────────────── */

    .input-container {
      padding: 0 24px 16px;
    }

    .input-bar {
      max-width: 820px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 26px;
      overflow: hidden;
      transition: border-color 0.25s;
      box-shadow: 0 4px 20px rgba(30, 41, 59, 0.06);
    }

    .input-bar:focus-within {
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input-top-row {
      padding: 12px 16px 4px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }

    .style-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .style-pill {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      color: #64748b;
      background: rgba(59, 130, 246, 0.04);
      border: 1px solid rgba(148, 163, 184, 0.15);
      cursor: pointer;
      transition: all 0.2s;
    }

    .style-pill:hover {
      background: rgba(59, 130, 246, 0.08);
      color: #1e293b;
    }

    .style-pill.active {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.35);
      color: #1d4ed8;
    }

    .input-main-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 12px 8px 12px 20px;
    }

    .prompt-textarea {
      flex: 1;
      background: none;
      border: none;
      color: #1e293b;
      font-size: 15px;
      font-family: 'Inter', system-ui, sans-serif;
      resize: none;
      outline: none;
      line-height: 1.5;
      max-height: 150px;
      min-height: 24px;
    }

    .prompt-textarea::placeholder {
      color: #94a3b8;
    }

    .input-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .input-tool-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 13px;
      color: #64748b;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .input-tool-btn:hover {
      background: rgba(59, 130, 246, 0.08);
      color: #1e293b;
    }

    .type-toggle {
      display: flex;
      background: rgba(59, 130, 246, 0.06);
      border-radius: 14px;
      padding: 2px;
    }

    .type-option {
      padding: 6px 8px;
      border-radius: 12px;
      font-size: 14px;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      opacity: 0.5;
    }

    .type-option.active {
      background: rgba(59, 130, 246, 0.15);
      opacity: 1;
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3b82f6;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
      background: #2563eb;
    }

    .send-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      box-shadow: none;
    }

    .disclaimer {
      text-align: center;
      font-size: 11.5px;
      color: #475569;
      margin-top: 10px;
    }

    /* ─── CHAT TRANSITION ─────────────────────────────── */

    .chat-transition {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      animation: fadeIn 0.15s ease-out;
    }

    .transition-loader {
      display: flex;
      gap: 8px;
    }

    .transition-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.5);
      animation: dotPulse 1.2s ease-in-out infinite;
    }

    .transition-dot:nth-child(2) { animation-delay: 0.15s; }
    .transition-dot:nth-child(3) { animation-delay: 0.3s; }

    .transition-text {
      font-size: 13.5px;
      color: #64748b;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ─── ANIMATIONS ──────────────────────────────────── */

    @keyframes messageSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes dotPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }

    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ─── SCROLLBAR ────────────────────────────────────── */

    .chat-area::-webkit-scrollbar { width: 6px; }
    .chat-area::-webkit-scrollbar-track { background: transparent; }
    .chat-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .chat-area::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

    .sidebar-conversations::-webkit-scrollbar { width: 4px; }
    .sidebar-conversations::-webkit-scrollbar-track { background: transparent; }
    .sidebar-conversations::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

    /* ─── RESPONSIVE ──────────────────────────────────── */

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .topbar { padding: 10px 16px; }
      .chat-area { padding: 16px 0; }
      .message-row { padding: 0 16px; }
      .input-container { padding: 0 12px 12px; }
      .empty-title { font-size: 24px; }
      .suggestion-chips { padding: 0 12px; }
      .input-tool-btn span { display: none; }
    }
  `],
})
export class GenerateComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatArea') chatAreaRef!: ElementRef;
  @ViewChild('promptInput') promptInputRef!: ElementRef;

  prompt = '';
  genType: 'image' | 'video' = 'image';
  selectedStyle = '';
  loading = false;
  sidebarCollapsed = false;
  showStyleBar = false;
  showModelMenu = false;
  historyLoading = false;
  switchingChat = false;

  selectedModel = 'Gemini 2.5 Flash';
  models = ['Gemini 2.5 Flash', 'Gemini 2.5 Pro', 'Gemini 2.0 Flash'];

  styles = [
    { label: 'Photorealistic', icon: '📷', value: 'Photorealistic' },
    { label: 'Digital Art',    icon: '🎨', value: 'Digital Art' },
    { label: 'Anime',         icon: '🌸', value: 'Anime' },
    { label: 'Oil Painting',  icon: '🖌️', value: 'Oil Painting' },
    { label: '3D Render',     icon: '🧊', value: '3D Render' },
    { label: 'Watercolor',    icon: '💧', value: 'Watercolor' },
  ];

  suggestions = [
    'A futuristic city floating in the clouds at sunset',
    'A photorealistic dragon made of crystal',
    'An enchanted forest with glowing mushrooms at night',
    'A steampunk cat reading a book in a library',
  ];

  conversations: Conversation[] = [];
  activeConversationIndex = 0;
  private shouldScroll = false;

  get currentMessages(): ChatMessage[] {
    if (this.conversations.length === 0 || this.switchingChat) return [];
    return this.conversations[this.activeConversationIndex]?.messages || [];
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    // Create a default initial conversation
    this.conversations.push({
      id: this.uid(),
      title: 'New creation',
      messages: [],
      timestamp: new Date(),
    });

    // Load history from backend
    this.loadHistory();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.api.getHistory().subscribe({
      next: (res) => {
        const items = res.data || [];
        // Group history items as past conversations
        items.forEach((item: HistoryItem) => {
          this.conversations.push({
            id: item.id,
            title: item.prompt.substring(0, 40) + (item.prompt.length > 40 ? '...' : ''),
            messages: [
              {
                role: 'user',
                content: item.prompt,
                timestamp: new Date(item.created_at),
                style: item.style,
                genType: item.type as 'image' | 'video',
              },
              {
                role: 'ai',
                content: 'Generated ' + item.type,
                imageUrl: item.output_url || undefined,
                status: 'completed',
                timestamp: new Date(item.created_at),
                genType: item.type as 'image' | 'video',
              },
            ],
            timestamp: new Date(item.created_at),
          });
        });
        this.historyLoading = false;
      },
      error: () => {
        this.historyLoading = false;
      },
    });
  }

  startNewConversation(): void {
    this.conversations.unshift({
      id: this.uid(),
      title: 'New creation',
      messages: [],
      timestamp: new Date(),
    });
    this.activeConversationIndex = 0;
  }

  switchConversation(index: number): void {
    if (index === this.activeConversationIndex) return;

    // Show a brief transition to avoid blank black screen
    this.switchingChat = true;
    this.activeConversationIndex = index;

    // Use requestAnimationFrame for a minimal but smooth transition
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.switchingChat = false;
        this.shouldScroll = true;
      }, 80);
    });
  }

  deleteConversation(index: number, event: Event): void {
    event.stopPropagation(); // Don't trigger switchConversation

    // Don't allow deleting the last conversation
    if (this.conversations.length <= 1) {
      // Just clear its messages instead
      this.conversations[0].title = 'New creation';
      this.conversations[0].messages = [];
      return;
    }

    this.conversations.splice(index, 1);

    // Adjust activeConversationIndex
    if (this.activeConversationIndex >= this.conversations.length) {
      this.activeConversationIndex = this.conversations.length - 1;
    } else if (index < this.activeConversationIndex) {
      this.activeConversationIndex--;
    } else if (index === this.activeConversationIndex) {
      // Switched to a new active, show transition
      this.switchingChat = true;
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.switchingChat = false;
          this.shouldScroll = true;
        }, 80);
      });
    }
  }

  generate(): void {
    if (!this.prompt.trim() || this.loading) return;

    const conv = this.conversations[this.activeConversationIndex];

    // Update conversation title if first message
    if (conv.messages.length === 0) {
      conv.title = this.prompt.substring(0, 40) + (this.prompt.length > 40 ? '...' : '');
    }

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: this.prompt,
      timestamp: new Date(),
      style: this.selectedStyle,
      genType: this.genType,
    };
    conv.messages.push(userMsg);

    // Add loading AI message
    const aiMsg: ChatMessage = {
      role: 'ai',
      content: '',
      timestamp: new Date(),
      loading: true,
      genType: this.genType,
    };
    conv.messages.push(aiMsg);

    this.shouldScroll = true;

    const request = {
      prompt: this.prompt,
      style: this.selectedStyle,
      resolution: '1024x1024',
      aspect_ratio: '1:1',
    };

    const savedPrompt = this.prompt;
    this.prompt = '';
    this.loading = true;

    // Reset textarea height
    if (this.promptInputRef) {
      this.promptInputRef.nativeElement.style.height = 'auto';
    }

    const obs = this.genType === 'image'
      ? this.api.generateImage(request)
      : this.api.generateVideo(request);

    obs.subscribe({
      next: (res: GenerateResponse) => {
        aiMsg.loading = false;
        aiMsg.imageUrl = res.output_url || undefined;
        aiMsg.status = res.status;
        aiMsg.qualityScore = res.quality_score || undefined;
        aiMsg.jobId = res.job_id || undefined;
        aiMsg.content = 'Generated from: ' + savedPrompt;
        this.loading = false;
        this.shouldScroll = true;
      },
      error: (err) => {
        aiMsg.loading = false;
        aiMsg.error = err.error?.detail || err.message || 'Generation failed';
        this.loading = false;
        this.shouldScroll = true;
      },
    });
  }

  regenerate(msg: ChatMessage): void {
    // Find the user message before this AI message
    const conv = this.conversations[this.activeConversationIndex];
    const aiIndex = conv.messages.indexOf(msg);
    if (aiIndex > 0) {
      const userMsg = conv.messages[aiIndex - 1];
      if (userMsg.role === 'user') {
        this.prompt = userMsg.content;
        this.genType = userMsg.genType || 'image';
        this.selectedStyle = userMsg.style || '';
        this.generate();
      }
    }
  }

  shareImage(msg: ChatMessage): void {
    if (msg.imageUrl) {
      navigator.clipboard.writeText(msg.imageUrl).catch(() => {});
    }
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.opacity = '1';
  }

  onEnterPress(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.generate();
    }
  }

  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatAreaRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (_) {}
  }

  private uid(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}

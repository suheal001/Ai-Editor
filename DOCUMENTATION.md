# AI Collaborative Editor Documentation

This document provides a comprehensive overview of the AI Collaborative Editor application, including its architecture, technology stack, core features, and key components.

---

## 1. Introduction

The AI Collaborative Editor is a modern web application designed to enhance the writing process with powerful AI capabilities. It combines a rich-text editor with an intelligent AI assistant that can help with content generation, text improvement, and real-time web searches. The application is built with a focus on user experience, responsiveness, and modularity.

---

## 2. Technology Stack

This project leverages a modern, type-safe, and efficient technology stack to deliver a high-quality user experience.

-   **Frontend Framework:** **React 18** with TypeScript for building a dynamic and type-safe user interface.
-   **Build Tool:** **Vite** provides a fast and lean development experience with features like Hot Module Replacement (HMR).
-   **Styling:** **Tailwind CSS** is used for utility-first styling, allowing for rapid and consistent UI development.
-   **UI Components:** **shadcn/ui** provides a set of beautifully designed, accessible, and customizable components built on top of Radix UI and Tailwind CSS.
-   **Text Editor:** **Tiptap** is a headless, framework-agnostic rich-text editor that is highly extensible and customizable. We use it with the `StarterKit` extension for basic formatting.
-   **AI Integration:**
    -   **Google Gemini:** The core AI model used for text generation, summarization, grammar correction, and other language tasks. The `@google/generative-ai` SDK is used to interact with the API.
    -   **Serper:** A low-latency search API used to provide the AI assistant with real-time web search capabilities for answering queries about recent events or specific topics.
-   **Routing:** **React Router DOM** is used for client-side routing, enabling navigation between different pages (like the main editor and the 404 page).
-   **State Management:** Primarily uses React's built-in hooks (`useState`, `useEffect`). For asynchronous operations like API calls, we could integrate a library like TanStack Query in the future if needed.
-   **Icons:** **Lucide React** for a comprehensive and clean set of SVG icons.

---

## 3. Project Structure

The codebase is organized into logical directories to ensure maintainability and scalability.

```
/
├── public/             # Static assets (favicon, images)
├── src/
│   ├── components/     # Reusable React components
│   │   ├── ui/         # Unmodified shadcn/ui components
│   │   ├── AIEditModal.tsx
│   │   ├── ApiKeyDialog.tsx
│   │   ├── ChatSidebar.tsx
│   │   ├── Editor.tsx
│   │   ├── FloatingToolbar.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks (e.g., use-media-query.ts)
│   ├── lib/            # Helper functions and API clients
│   │   ├── gemini.ts   # Logic for interacting with the Gemini API
│   │   ├── serper.ts   # Logic for interacting with the Serper API
│   │   └── utils.ts    # Utility functions (e.g., cn for classnames)
│   ├── pages/          # Top-level page components
│   │   ├── Index.tsx   # The main editor page
│   │   └── NotFound.tsx# The 404 error page
│   ├── App.tsx         # Main application component with routing setup
│   ├── globals.css     # Global styles and Tailwind CSS directives
│   └── main.tsx        # The entry point of the application
├── .env.local.example  # Example for environment variables
├── DOCUMENTATION.md    # This file
├── index.html          # The main HTML file
├── package.json        # Project dependencies and scripts
└── tailwind.config.ts  # Tailwind CSS configuration
```

---

## 4. Core Features

### 4.1. Rich-Text Editor

-   **Implementation:** The editor is built using **Tiptap**.
-   **File:** `src/components/Editor.tsx`
-   **Description:** It provides a clean, prose-styled writing surface. It's configured to be editable only after a valid Gemini API key is provided, ensuring that AI features are available when the user starts writing.

### 4.2. AI-Powered Text Selection Toolbar

-   **Implementation:** A floating `BubbleMenu` from Tiptap that appears when text is selected.
-   **File:** `src/components/FloatingToolbar.tsx`
-   **Description:** When a user highlights text, a small toolbar appears with three options:
    1.  **Shorten:** Makes the selected text more concise.
    2.  **Improve:** Enhances the clarity, flow, and vocabulary of the text.
    3.  **Fix Grammar:** Corrects spelling and grammatical errors.
-   Each action sends a specific prompt with the selected text to the Gemini API.

### 4.3. AI Suggestion Modal

-   **Implementation:** A dialog component that displays the AI's suggested change.
-   **File:** `src/components/AIEditModal.tsx`
-   **Description:** After an AI action from the floating toolbar is triggered, this modal appears, showing a side-by-side comparison of the original text and the AI's suggestion. The user can then choose to accept the change (which replaces the text in the editor) or cancel.

### 4.4. AI Assistant Chat Sidebar

-   **Implementation:** A persistent chat interface available on the side of the editor.
-   **File:** `src/components/ChatSidebar.tsx`
-   **Description:** This is the central hub for interacting with the AI assistant. It has two primary modes:
    1.  **Document Context:** Users can ask questions or give commands related to the content of the editor (e.g., "Write an introduction for this document"). The AI receives the current document content for context.
    2.  **Web Search:** If a query starts with keywords like "search," "find," or "what is," the application first uses the **Serper API** to get real-time web search results. These results are then passed to the Gemini API to synthesize a comprehensive answer. This allows the AI to answer questions about current events.

### 4.5. API Key Management

-   **Implementation:** A dialog that appears on the first launch.
-   **File:** `src/components/ApiKeyDialog.tsx`
-   **Description:** To use the AI features, users must provide their own Google Gemini API key. This dialog prompts the user for their key, which is then stored securely in the browser's `localStorage`. It is never sent to any server other than Google's. If an invalid key is detected, it is automatically cleared, and the dialog reappears.

### 4.6. Responsive Design

-   **Implementation:** Uses a custom hook `useMediaQuery` and responsive shadcn/ui components.
-   **Files:** `src/pages/Index.tsx`, `src/hooks/use-media-query.ts`
-   **Description:** The application layout adapts to different screen sizes. On desktop, it features a resizable split-panel view for the editor and chat sidebar. On mobile, the editor takes up the full screen, and the chat sidebar is accessible via a slide-up `Drawer`.

---

## 5. Environment Variables

To run the application with all features enabled, you need to set up the following environment variables. Create a `.env.local` file in the root of the project and add the following:

-   `VITE_SERPER_API_KEY`: Your API key from [serper.dev](https://serper.dev/). This is required for the web search functionality in the AI Assistant.

*Note: The Google Gemini API key is managed through the UI and stored in `localStorage`, so it does not need to be in the `.env.local` file.*

---

## 6. How to Run Locally

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    -   Create a file named `.env.local` in the project root.
    -   Add your `VITE_SERPER_API_KEY` to this file.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open your browser to `http://localhost:8080` (or the port specified in the terminal).
6.  The application will prompt you to enter your Google Gemini API key to enable AI features.
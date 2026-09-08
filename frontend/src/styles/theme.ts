import { StyleSheet } from "react-native";

export type ThemeName = "snow" | "solar";

export const themeColors = {
  snow: {
    background: "#F4FAFF",
    surface: "#FFFFFF",
    surfaceSoft: "#E8F4FC",
    surfaceStrong: "#DDEFFA",

    text: "#10243A",
    muted: "#60758A",
    subtleText: "#7B91A5",

    accent: "#2878B8",
    accentStrong: "#1D639D",

    border: "#C9DFEE",

    userBubble: "#D9EEFC",
    aiBubble: "#FFFFFF",

    card: "#FFFFFF",
    cardSoft: "#EAF5FC",

    input: "#FFFFFF",

    danger: "#B84455",
    loading: "#2878B8",

    markdownHeading: "#163B5C",
    markdownAccent: "#2878B8",
    codeBackground: "#E8F2F8",
  },

  solar: {
    background: "#070B16",
    surface: "#101827",
    surfaceSoft: "#162033",
    surfaceStrong: "#1B2940",

    text: "#F2F5FF",
    muted: "#96A3BA",
    subtleText: "#73819A",

    accent: "#C45A6B",
    accentStrong: "#9B3042",

    border: "rgba(160, 180, 255, 0.15)",

    userBubble: "rgba(255,255,255,0.09)",
    aiBubble: "rgba(24, 35, 60, 0.88)",

    card: "rgba(19, 28, 48, 0.94)",
    cardSoft: "rgba(29, 43, 70, 0.85)",

    input: "rgba(14, 22, 38, 0.95)",

    danger: "#A83D50",
    loading: "#C45A6B",

    markdownHeading: "#FFFFFF",
    markdownAccent: "#C7D4FF",
    codeBackground: "#0B1220",
  },
};

export function createMarkdownStyles(theme: ThemeName) {
  const colors = themeColors[theme];

  return StyleSheet.create({
    body: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },

    heading1: {
      color: colors.markdownHeading,
      fontSize: 24,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 10,
    },

    heading2: {
      color: colors.markdownAccent,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 8,
    },

    heading3: {
      color: colors.markdownAccent,
      fontSize: 17,
      fontWeight: "700",
      marginTop: 6,
      marginBottom: 6,
    },

    strong: {
      color: colors.markdownHeading,
      fontWeight: "700",
    },

    em: {
      color: colors.markdownAccent,
      fontStyle: "italic",
    },

    bullet_list: {
      marginTop: 4,
      marginBottom: 8,
    },

    ordered_list: {
      marginTop: 4,
      marginBottom: 8,
    },

    list_item: {
      marginBottom: 5,
    },

    paragraph: {
      marginTop: 0,
      marginBottom: 10,
    },

    code_inline: {
      backgroundColor: colors.codeBackground,
      color: colors.markdownAccent,
      paddingHorizontal: 5,
      borderRadius: 5,
    },

    code_block: {
      backgroundColor: colors.codeBackground,
      color: colors.markdownAccent,
      padding: 12,
      borderRadius: 10,
      marginVertical: 8,
    },

    blockquote: {
      backgroundColor:
        theme === "snow"
          ? "rgba(40,120,184,0.06)"
          : "rgba(255,255,255,0.04)",

      borderLeftWidth: 3,

      borderLeftColor: colors.accentStrong,

      paddingLeft: 10,

      marginVertical: 8,
    },
  });
}

export function createStyles(theme: ThemeName) {
  const colors = themeColors[theme];

  return StyleSheet.create({
    introContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },

    introIcon: {
      fontSize: 64,
      marginBottom: 12,
    },

    introTitle: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
    },

    introSubtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 6,
    },

    keyboardContainer: {
      flex: 1,
    },

    container: {
      flex: 1,
      paddingTop: 60,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },

    historyButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },

    historyButtonText: {
      color: colors.text,
      fontSize: 22,
    },

    titleContainer: {
      alignItems: "center",
    },

    title: {
      fontSize: 25,
      fontWeight: "700",
      color: colors.text,
    },

    subtitle: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 2,
    },

    newChatButton: {
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
    },

    newChatText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },

    historyPanel: {
      position: "absolute",
      top: 115,
      left: 16,
      right: 16,
      maxHeight: 550,
      zIndex: 10,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    menuTabs: {
      flexDirection: "row",
      gap: 20,
      marginBottom: 18,
    },

    menuTab: {
      paddingBottom: 6,
    },

    menuTabText: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: "600",
    },

    activeMenuTab: {
      color: colors.text,
    },

    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },

    historyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },

    clearHistoryButton: {
      backgroundColor: colors.surfaceStrong,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },

    clearHistoryText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },

    noChats: {
      color: colors.muted,
      paddingVertical: 20,
      textAlign: "center",
    },

    chatItem: {
      backgroundColor: colors.surfaceSoft,
      padding: 14,
      borderRadius: 14,
      marginBottom: 8,
    },

    chatItemText: {
      color: colors.text,
      fontSize: 14,
    },

    chatArea: {
      flex: 1,
    },

    chatContent: {
      paddingBottom: 10,
    },

    aiMessageContainer: {
      width: "100%",
      marginBottom: 12,
    },

    userBubble: {
      backgroundColor: colors.userBubble,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 20,
      marginBottom: 12,
      alignSelf: "flex-end",
      maxWidth: "82%",
      borderWidth: theme === "snow" ? 1 : 0,
      borderColor: colors.border,
    },

    aiBubble: {
      backgroundColor: colors.aiBubble,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 20,
      marginBottom: 12,
      width: "100%",
    },

    userMessageText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },

    buildCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 16,
      marginBottom: 14,
      width: "100%",
    },

    buildCardHeader: {
      marginBottom: 4,
    },

    buildName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
    },

    buildUseCase: {
      color: colors.muted,
      fontSize: 13,
      marginTop: 4,
    },

    buildDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    },

    specRow: {
      marginBottom: 11,
    },

    specLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 3,
    },

    specValue: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },

    priceBox: {
      backgroundColor: colors.cardSoft,
      padding: 13,
      borderRadius: 14,
      marginTop: 6,
    },

    priceLabel: {
      color: colors.muted,
      fontSize: 12,
    },

    priceValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 4,
    },

buildActions: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  marginTop: 15,
},

iconAction: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 10,
},

iconActionText: {
  fontSize: 12,
  fontWeight: "500",
  marginTop: 6,
},

saveBuildButton: {
  flex: 1,
  backgroundColor: colors.accentStrong,
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
},

shareBuildButton: {
  flex: 1,
  backgroundColor: colors.surfaceStrong,
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.border,
},

savedShareButton: {
  flex: 1,
},

deleteBuildButton: {
  flex: 1,
  backgroundColor: colors.danger,
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
},

buildActionText: {
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: 13,
},
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 10,
    },

    loadingText: {
      color: colors.muted,
      fontSize: 13,
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      marginTop: 10,
      marginBottom: 20,
    },

    input: {
      flex: 1,
      minHeight: 50,
      maxHeight: 120,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 14,
    },

   sendButton: {
    backgroundColor:
      theme === "solar"
        ? "#121C2E"
        : colors.accentStrong,

    minHeight: 52,
    paddingHorizontal: 21,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,

    borderWidth: theme === "solar" ? 1.5 : 0,
    borderColor:
      theme === "solar"
        ? "rgba(160, 180, 255, 0.22)"
        : "transparent",
  },

    sendButtonDisabled: {
      opacity: 0.5,
    },

    sendButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
  });
}
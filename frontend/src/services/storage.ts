import AsyncStorage from "@react-native-async-storage/async-storage";
import { Build, Chat } from "../types";

const CHATS_KEY = "pc_builder_chats";
const SAVED_BUILDS_KEY = "pc_builder_saved_builds";

// ===============================
// CHAT STORAGE
// ===============================

export async function loadChats(): Promise<Chat[]> {
  try {
    const storedChats = await AsyncStorage.getItem(CHATS_KEY);

    if (!storedChats) {
      return [];
    }

    return JSON.parse(storedChats);
  } catch (error) {
    console.error("Failed to load chats:", error);
    return [];
  }
}

export async function saveChats(chats: Chat[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      CHATS_KEY,
      JSON.stringify(chats)
    );
  } catch (error) {
    console.error("Failed to save chats:", error);
  }
}

// ===============================
// SAVED BUILD STORAGE
// ===============================

export async function loadSavedBuilds(): Promise<Build[]> {
  try {
    const storedBuilds = await AsyncStorage.getItem(
      SAVED_BUILDS_KEY
    );

    if (!storedBuilds) {
      return [];
    }

    return JSON.parse(storedBuilds);
  } catch (error) {
    console.error("Failed to load saved builds:", error);
    return [];
  }
}

export async function saveSavedBuilds(
  builds: Build[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SAVED_BUILDS_KEY,
      JSON.stringify(builds)
    );
  } catch (error) {
    console.error("Failed to save saved builds:", error);
  }
}
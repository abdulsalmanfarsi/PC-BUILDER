import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Build, Chat } from "../types";

import { createStyles } from "../styles/theme";

import { useTheme } from "../context/ThemeContext";

import BuildCard from "./BuildCard";


type HistoryPanelProps = {
  showSavedBuilds: boolean;

  setShowSavedBuilds: (
    value: boolean
  ) => void;

  chats: Chat[];

  savedBuilds: Build[];

  clearAllHistory: () => void;

  openChat: (
    chat: Chat
  ) => void;

  onShareBuild: (
    build: Build
  ) => void;

  onDeleteBuild: (
    build: Build
  ) => void;
};


export default function HistoryPanel({
  showSavedBuilds,
  setShowSavedBuilds,
  chats,
  savedBuilds,
  clearAllHistory,
  openChat,
  onShareBuild,
  onDeleteBuild,
}: HistoryPanelProps) {

  const { theme } = useTheme();

  const styles = createStyles(theme);


  return (
    <View style={styles.historyPanel}>

      <View style={styles.menuTabs}>

        <Pressable
          style={styles.menuTab}

          onPress={() =>
            setShowSavedBuilds(false)
          }
        >
          <Text
            style={[
              styles.menuTabText,

              !showSavedBuilds &&
                styles.activeMenuTab,
            ]}
          >
            Chats
          </Text>
        </Pressable>


        <Pressable
          style={styles.menuTab}

          onPress={() =>
            setShowSavedBuilds(true)
          }
        >
          <Text
            style={[
              styles.menuTabText,

              showSavedBuilds &&
                styles.activeMenuTab,
            ]}
          >
            Saved Builds
          </Text>
        </Pressable>

      </View>


      {!showSavedBuilds ? (

        <>

          <View style={styles.historyHeader}>

            <Text style={styles.historyTitle}>
              Conversations
            </Text>


            {chats.length > 0 && (

              <Pressable
                style={styles.clearHistoryButton}

                onPress={clearAllHistory}
              >
                <Text style={styles.clearHistoryText}>
                  Clear All
                </Text>
              </Pressable>

            )}

          </View>


          <ScrollView>

            {chats.length === 0 ? (

              <Text style={styles.noChats}>
                No previous conversations
              </Text>

            ) : (

              chats.map((chat) => (

                <Pressable
                  key={chat.id}

                  style={styles.chatItem}

                  onPress={() =>
                    openChat(chat)
                  }
                >

                  <Text
                    style={styles.chatItemText}

                    numberOfLines={1}
                  >
                    {chat.title}
                  </Text>

                </Pressable>

              ))

            )}

          </ScrollView>

        </>

      ) : (

        <>

          <Text style={styles.historyTitle}>
            Saved Builds
          </Text>


          <ScrollView>

            {savedBuilds.length === 0 ? (

              <Text style={styles.noChats}>
                No saved builds yet
              </Text>

            ) : (

              savedBuilds.map(
                (build, index) => (

                  <BuildCard
                    key={`${build.Name}-${index}`}

                    build={build}

                    index={index}

                    saved={true}

                    onShare={onShareBuild}

                    onDelete={onDeleteBuild}
                  />

                )
              )

            )}

          </ScrollView>

        </>

      )}

    </View>
  );
}
import React from "react";

import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";

import Markdown from "react-native-markdown-display";

import {
  Message,
  Build,
} from "../types";

import {
  parseBuilds,
  removeBuildSections,
} from "../utils/buildParser";

import {
  createMarkdownStyles,
  createStyles,
  themeColors,
} from "../styles/theme";

import {
  useTheme,
} from "../context/ThemeContext";

import BuildCard from "./BuildCard";


type ChatMessagesProps = {
  messages: Message[];
  loading: boolean;
  loadingMessage: string;

  scrollViewRef: React.RefObject<ScrollView | null>;

  onSaveBuild: (build: Build) => void;
  onShareBuild: (build: Build) => void;
};


export default function ChatMessages({
  messages,
  loading,
  loadingMessage,
  scrollViewRef,
  onSaveBuild,
  onShareBuild,
}: ChatMessagesProps) {

  const { theme } = useTheme();

  const styles =
    createStyles(theme);

  const markdownStyles =
    createMarkdownStyles(theme);

  const colors =
    themeColors[theme];


  return (
    <ScrollView
      style={styles.chatArea}

      contentContainerStyle={
        styles.chatContent
      }

      ref={scrollViewRef}

      keyboardShouldPersistTaps="handled"

      onContentSizeChange={() =>
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        })
      }
    >

      {messages.map((msg, index) => {

        if (msg.role === "assistant") {

          const text =
            msg.content;

          const builds =
            parseBuilds(text);

          const normalText =
            removeBuildSections(text);


          return (
            <View
              key={index}

              style={
                styles.aiMessageContainer
              }
            >

              {normalText ? (

                <View
                  style={
                    styles.aiBubble
                  }
                >

                  <Markdown
                    style={
                      markdownStyles
                    }
                  >
                    {normalText}
                  </Markdown>

                </View>

              ) : null}


              {builds.map(
                (build, buildIndex) => (

                  <BuildCard
                    key={`${build.Name}-${buildIndex}`}

                    build={build}

                    index={buildIndex}

                    onSave={
                      onSaveBuild
                    }

                    onShare={
                      onShareBuild
                    }
                  />

                )
              )}

            </View>
          );
        }


        return (
          <View
            key={index}

            style={
              styles.userBubble
            }
          >

            <Text
              style={
                styles.userMessageText
              }
            >
              {msg.content}
            </Text>

          </View>
        );

      })}


      {loading && (

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="small"

            color={
              colors.loading
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            {loadingMessage}
          </Text>

        </View>

      )}

    </ScrollView>
  );
}
import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import MarketSetup from "../../src/components/MarketSetup";

import { askAI } from "../../src/services/api";

import {
  createStyles,
  themeColors,
} from "../../src/styles/theme";

import {
  useTheme,
} from "../../src/context/ThemeContext";

import {
  Build,
  Chat,
  Message,
  UserMarket,
} from "../../src/types";

import ChatInput from "../../src/components/ChatInput";
import ChatMessages from "../../src/components/ChatMessages";
import HistoryPanel from "../../src/components/HistoryPanel";


const SAVED_BUILDS_KEY = "saved_builds";

const CHATS_KEY = "pc_builder_chats";

const USER_MARKET_KEY = "user_market";


const loadingMessages = [
  "Please wait... this might take a minute",
  "AI is working on your answer",
  "Hang tight... your answer is being polished",
  "Searching for the latest prices",
  "Almost there...",
];


export default function Index() {

  const router = useRouter();

  const { theme } = useTheme();

  const styles = createStyles(theme);

  const colors = themeColors[theme];


  const [question, setQuestion] =
    useState("");


  const [messages, setMessages] =
    useState<Message[]>([]);


  const [history, setHistory] =
    useState<any>(null);


  const [loading, setLoading] =
    useState(false);


  const [chats, setChats] =
    useState<Chat[]>([]);


  const [
    currentChatId,
    setCurrentChatId,
  ] = useState<string | null>(null);


  const [
    showHistory,
    setShowHistory,
  ] = useState(false);


  const [
    showSavedBuilds,
    setShowSavedBuilds,
  ] = useState(false);


  const [
    loadingMessageIndex,
    setLoadingMessageIndex,
  ] = useState(0);


  const [
    savedBuilds,
    setSavedBuilds,
  ] = useState<Build[]>([]);


  // ==========================================
  // MARKET STATE
  // ==========================================

  const [market, setMarket] =
    useState<UserMarket | null>(null);


  const [
    marketLoaded,
    setMarketLoaded,
  ] = useState(false);


  const scrollViewRef =
    useRef<ScrollView>(null);


  // ==========================================
  // INTRO
  // ==========================================

  const [showIntro, setShowIntro] =
    useState(true);


  const fadeAnim =
    useRef(
      new Animated.Value(0)
    ).current;


  const scaleAnim =
    useRef(
      new Animated.Value(0.8)
    ).current;


  // ==========================================
  // INTRO ANIMATION
  // ==========================================

  useEffect(() => {

    Animated.parallel([

      Animated.timing(
        fadeAnim,
        {
          toValue: 1,

          duration: 800,

          useNativeDriver: true,
        }
      ),

      Animated.spring(
        scaleAnim,
        {
          toValue: 1,

          friction: 4,

          useNativeDriver: true,
        }
      ),

    ]).start();


    const timer = setTimeout(() => {

      setShowIntro(false);

    }, 1800);


    return () =>
      clearTimeout(timer);

  }, []);


  // ==========================================
  // LOAD APP DATA
  // ==========================================

  useEffect(() => {

    loadChats();

    loadSavedBuilds();

    loadMarket();

  }, []);


  // ==========================================
  // LOADING MESSAGE ROTATION
  // ==========================================

  useEffect(() => {

    if (!loading) {

      setLoadingMessageIndex(0);

      return;

    }


    const interval =
      setInterval(() => {

        setLoadingMessageIndex(
          (prev) =>
            (prev + 1) %
            loadingMessages.length
        );

      }, 3000);


    return () =>
      clearInterval(interval);

  }, [loading]);


  // ==========================================
  // MARKET
  // ==========================================

  async function loadMarket() {

    try {

      const savedMarket =
        await AsyncStorage.getItem(
          USER_MARKET_KEY
        );


      if (savedMarket) {

        setMarket(
          JSON.parse(savedMarket)
        );

      }

    } catch (error) {

      console.log(
        "Could not load market:",
        error
      );

    } finally {

      setMarketLoaded(true);

    }
  }


  async function handleMarketSetup(
    selectedMarket: UserMarket
  ) {

    try {

      await AsyncStorage.setItem(
        USER_MARKET_KEY,
        JSON.stringify(selectedMarket)
      );


      setMarket(selectedMarket);

    } catch (error) {

      console.log(
        "Could not save market:",
        error
      );

    }
  }


  // ==========================================
  // CHAT HISTORY
  // ==========================================

  async function loadChats() {

    try {

      const savedChats =
        await AsyncStorage.getItem(
          CHATS_KEY
        );


      if (savedChats) {

        setChats(
          JSON.parse(savedChats)
        );

      }

    } catch (error) {

      console.log(
        "Could not load chats:",
        error
      );

    }
  }


  async function saveChats(
    updatedChats: Chat[]
  ) {

    try {

      await AsyncStorage.setItem(
        CHATS_KEY,
        JSON.stringify(updatedChats)
      );


      setChats(updatedChats);

    } catch (error) {

      console.log(
        "Could not save chats:",
        error
      );

    }
  }


  // ==========================================
  // SAVED BUILDS
  // ==========================================

  async function loadSavedBuilds() {

    try {

      const storedBuilds =
        await AsyncStorage.getItem(
          SAVED_BUILDS_KEY
        );


      if (storedBuilds) {

        setSavedBuilds(
          JSON.parse(storedBuilds)
        );

      }

    } catch (error) {

      console.log(
        "Failed to load saved builds:",
        error
      );

    }
  }


  async function saveBuild(
    build: Build
  ) {

    try {

      const alreadySaved =
        savedBuilds.some(
          (savedBuild) =>
            savedBuild.Name ===
              build.Name &&
            savedBuild.CPU ===
              build.CPU &&
            savedBuild.GPU ===
              build.GPU
        );


      if (alreadySaved) {

        Alert.alert(
          "Already Saved",
          "This build is already in your saved builds."
        );

        return;
      }


      const updatedBuilds = [
        ...savedBuilds,
        build,
      ];


      await AsyncStorage.setItem(
        SAVED_BUILDS_KEY,
        JSON.stringify(updatedBuilds)
      );


      setSavedBuilds(
        updatedBuilds
      );


      Alert.alert(
        "Build Saved",
        "This build has been saved successfully."
      );

    } catch (error) {

      console.log(
        "Failed to save build:",
        error
      );

    }
  }


  async function deleteBuild(
    build: Build
  ) {

    try {

      const updatedBuilds =
        savedBuilds.filter(
          (savedBuild) =>
            !(
              savedBuild.Name ===
                build.Name &&

              savedBuild.CPU ===
                build.CPU &&

              savedBuild.GPU ===
                build.GPU
            )
        );


      await AsyncStorage.setItem(
        SAVED_BUILDS_KEY,
        JSON.stringify(updatedBuilds)
      );


      setSavedBuilds(
        updatedBuilds
      );

    } catch (error) {

      console.log(
        "Failed to delete build:",
        error
      );

    }
  }


  // ==========================================
  // SHARE BUILD
  // ==========================================

  async function shareBuild(
    build: Build
  ) {

    try {

      const shareText =
        `🖥️ ${build.Name || "PC Build"}

🎯 Use Case: ${
          build["Use Case"] ||
          "Not specified"
        }

⚙️ CPU: ${
          build.CPU ||
          "Not specified"
        }

🎮 GPU: ${
          build.GPU ||
          "Not specified"
        }

🧩 Motherboard: ${
          build.Motherboard ||
          "Not specified"
        }

🧠 RAM: ${
          build.RAM ||
          "Not specified"
        }

💾 Storage: ${
          build.Storage ||
          "Not specified"
        }

⚡ PSU: ${
          build.PSU ||
          "Not specified"
        }

❄️ Cooler: ${
          build.Cooler ||
          "Not specified"
        }

🖥️ Case: ${
          build.Case ||
          "Not specified"
        }

💰 Estimated Total: ${
          build["Estimated Total"] ||
          "Not specified"
        }

Built with RigCraft`;


      await Share.share({

        message:
          shareText,

      });

    } catch (error) {

      console.log(
        "Failed to share build:",
        error
      );

    }
  }


  // ==========================================
  // SEND QUESTION
  // ==========================================

  async function sendQuestion() {

    if (
      !question.trim() ||
      loading ||
      !market
    ) {

      return;

    }


    const currentQuestion =
      question.trim();


    const userMessage: Message = {

      role: "user",

      content:
        currentQuestion,

    };


    setMessages((prev) => [

      ...prev,

      userMessage,

    ]);


    setQuestion("");

    setLoading(true);


    try {

      const data =
        await askAI(

          currentQuestion,

          history,

          market

        );


      setHistory(
        data.history
      );


      const aiMessage: Message = {

        role: "assistant",

        content:
          data.answer,

      };


      const updatedMessages = [

        ...messages,

        userMessage,

        aiMessage,

      ];


      setMessages(
        updatedMessages
      );


      let updatedChatId =
        currentChatId;


      if (!updatedChatId) {

        updatedChatId =
          Date.now().toString();


        const newChat: Chat = {

          id:
            updatedChatId,


          title:

            currentQuestion.length > 35

              ? currentQuestion.substring(
                  0,
                  35
                ) + "..."

              : currentQuestion,


          messages:
            updatedMessages,


          history:
            data.history,

        };


        const updatedChats = [

          newChat,

          ...chats,

        ];


        setCurrentChatId(
          updatedChatId
        );


        await saveChats(
          updatedChats
        );

      } else {

        const updatedChats =
          chats.map(

            (chat) =>

              chat.id === updatedChatId

                ? {

                    ...chat,

                    messages:
                      updatedMessages,

                    history:
                      data.history,

                  }

                : chat

          );


        await saveChats(
          updatedChats
        );

      }

    } catch (error) {

      const errorMessage: Message = {

        role:
          "assistant",


        content:

          "Error: " +

          (

            error instanceof Error

              ? error.message

              : String(error)

          ),

      };


      const updatedMessages = [

        ...messages,

        userMessage,

        errorMessage,

      ];


      setMessages(
        updatedMessages
      );

    } finally {

      setLoading(false);

    }
  }


  // ==========================================
  // NEW CONVERSATION
  // ==========================================

  function newConversation() {

    setMessages([]);

    setHistory(null);

    setCurrentChatId(null);

    setShowHistory(false);

    setShowSavedBuilds(false);

  }


  // ==========================================
  // CLEAR HISTORY
  // ==========================================

  async function clearAllHistory() {

    try {

      await AsyncStorage.removeItem(
        CHATS_KEY
      );


      setChats([]);

      setMessages([]);

      setHistory(null);

      setCurrentChatId(null);

      setShowHistory(false);

    } catch (error) {

      console.log(
        "Could not clear chat history:",
        error
      );

    }
  }


  // ==========================================
  // OPEN CHAT
  // ==========================================

  function openChat(
    chat: Chat
  ) {

    setMessages(
      chat.messages
    );


    setHistory(
      chat.history
    );


    setCurrentChatId(
      chat.id
    );


    setShowHistory(false);

  }


  // ==========================================
  // WAIT FOR MARKET TO LOAD
  // ==========================================

  if (!marketLoaded) {

    return null;

  }


  // ==========================================
  // FIRST LAUNCH MARKET SETUP
  // ==========================================

  if (!market) {

    return (

      <MarketSetup
        onComplete={
          handleMarketSetup
        }
      />

    );

  }


  // ==========================================
  // INTRO SCREEN
  // ==========================================

  if (showIntro) {

    return (

      <View
        style={
          styles.introContainer
        }
      >

        <Animated.View

          style={{

            opacity:
              fadeAnim,


            transform: [

              {

                scale:
                  scaleAnim,

              },

            ],


            alignItems:
              "center",

          }}

        >

          <Text
            style={
              styles.introIcon
            }
          >
            🖥️
          </Text>


          <Text
            style={
              styles.introTitle
            }
          >
            RigCraft
          </Text>

        </Animated.View>

      </View>

    );

  }


  // ==========================================
  // BACKGROUND IMAGE
  // ==========================================

const backgroundImage =
  theme === "solar"
    ? require("../../assets/images/space-background.png")
    : require("../../assets/images/snow-background.png");

const backgroundOverlay =
  theme === "solar"
    ? "rgba(5, 9, 18, 0.72)"
    : "rgba(245, 250, 255, 0.70)";

  // ==========================================
  // MAIN APP
  // ==========================================

  return (

    <ImageBackground

      source={
        backgroundImage
      }

      style={{
        flex: 1,
      }}

      resizeMode="cover"

    >

      {/* BACKGROUND OVERLAY */}

      <View

        style={{

          flex: 1,

          backgroundColor:
            backgroundOverlay,

        }}

      >

        <KeyboardAvoidingView

          style={
            styles.keyboardContainer
          }

          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }

        >

          <View

            style={[

              styles.container,

              {

                backgroundColor:
                  "transparent",

              },

            ]}

          >


            {/* HEADER */}

            <View
              style={
                styles.header
              }
            >


              {/* HISTORY */}

              <Pressable

                style={
                  styles.historyButton
                }

                onPress={() => {

                  setShowHistory(
                    !showHistory
                  );

                  setShowSavedBuilds(
                    false
                  );

                }}

              >

                <Text
                  style={
                    styles.historyButtonText
                  }
                >
                  ☰
                </Text>

              </Pressable>


              {/* APP TITLE */}

              <View
                style={
                  styles.titleContainer
                }
              >

                <Text
                  style={
                    styles.title
                  }
                >
                  RigCraft
                </Text>


                <Text
                  style={
                    styles.subtitle
                  }
                >
                  AI Hardware Advisor
                </Text>

              </View>


              {/* SETTINGS + NEW */}

              <View
                style={{

                  flexDirection:
                    "row",

                  alignItems:
                    "center",

                  gap:
                    8,

                }}
              >

                <Pressable

                  onPress={() =>
                    router.push(
                      "/(tabs)/settings"
                    )
                  }

                  style={{

                    width:
                      44,

                    height:
                      44,

                    borderRadius:
                      22,

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    backgroundColor:
                      colors.surfaceSoft,

                    borderWidth:
                      1,

                    borderColor:
                      colors.border,

                  }}

                >

                  <Text
                    style={{

                      color:
                        colors.text,

                      fontSize:
                        19,

                    }}
                  >
                    ⚙
                  </Text>

                </Pressable>


                <Pressable

                  style={
                    styles.newChatButton
                  }

                  onPress={
                    newConversation
                  }

                >

                  <Text
                    style={
                      styles.newChatText
                    }
                  >
                    New
                  </Text>

                </Pressable>

              </View>

            </View>


            {/* HISTORY PANEL */}

            {showHistory && (

              <HistoryPanel

                showSavedBuilds={
                  showSavedBuilds
                }


                setShowSavedBuilds={
                  setShowSavedBuilds
                }


                chats={
                  chats
                }


                savedBuilds={
                  savedBuilds
                }


                clearAllHistory={
                  clearAllHistory
                }


                openChat={
                  openChat
                }


                onShareBuild={
                  shareBuild
                }


                onDeleteBuild={
                  deleteBuild
                }

              />

            )}


            {/* CHAT */}

            <ChatMessages

              messages={
                messages
              }


              loading={
                loading
              }


              loadingMessage={
                loadingMessages[
                  loadingMessageIndex
                ]
              }


              scrollViewRef={
                scrollViewRef
              }


              onSaveBuild={
                saveBuild
              }


              onShareBuild={
                shareBuild
              }

            />


            {/* INPUT */}

            <ChatInput

              question={
                question
              }


              setQuestion={
                setQuestion
              }


              loading={
                loading
              }


              onSend={
                sendQuestion
              }

            />

          </View>

        </KeyboardAvoidingView>

      </View>

    </ImageBackground>

  );

}
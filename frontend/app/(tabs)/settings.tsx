import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useRouter,
} from "expo-router";

import {
  UserMarket,
} from "../../src/types";

import {
  useTheme,
} from "../../src/context/ThemeContext";


const USER_MARKET_KEY = "user_market";


const MARKETS: UserMarket[] = [
  {
    country: "India",
    currency: "INR",
    currencySymbol: "₹",
  },
  {
    country: "United States",
    currency: "USD",
    currencySymbol: "$",
  },
  {
    country: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
  },
  {
    country: "Canada",
    currency: "CAD",
    currencySymbol: "C$",
  },
  {
    country: "Australia",
    currency: "AUD",
    currencySymbol: "A$",
  },
  {
    country: "Germany",
    currency: "EUR",
    currencySymbol: "€",
  },
  {
    country: "France",
    currency: "EUR",
    currencySymbol: "€",
  },
];


export default function Settings() {

  const router = useRouter();


  const {
    theme,
    setTheme,
  } = useTheme();


  const [market, setMarket] =
    useState<UserMarket | null>(null);


  const [marketModalVisible, setMarketModalVisible] =
    useState(false);


  useEffect(() => {
    loadMarket();
  }, []);


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

    }

  }


  async function changeMarket(
    selectedMarket: UserMarket
  ) {

    try {

      await AsyncStorage.setItem(
        USER_MARKET_KEY,
        JSON.stringify(selectedMarket)
      );


      setMarket(selectedMarket);


      setMarketModalVisible(false);

    } catch (error) {

      console.log(
        "Could not save market:",
        error
      );

    }

  }


  const isSnow =
    theme === "snow";


  const colors = isSnow
    ? {
        background: "#F4FAFF",
        surface: "#FFFFFF",
        surfaceSoft: "#EAF5FF",
        text: "#14213D",
        muted: "#61738B",
        border: "#CFE3F4",
        accent: "#2878B8",
      }
    : {
        background: "#090B14",
        surface: "#121622",
        surfaceSoft: "#191F30",
        text: "#F4F7FF",
        muted: "#9099AE",
        border: "#273149",
        accent: "#9A6CFF",
      };


  const isWeb =
    Platform.OS === "web";


  function handleBack() {

    if (router.canGoBack()) {

      router.back();

    } else {

      router.replace("/");

    }

  }


  return (

    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 60,
        paddingHorizontal: 20,
      }}
    >

      {/* WEB BACK BUTTON */}

      {isWeb && (

        <Pressable
          onPress={handleBack}

          style={{
            alignSelf: "flex-start",

            paddingVertical: 10,

            paddingHorizontal: 14,

            borderRadius: 12,

            backgroundColor: colors.surface,

            borderWidth: 1,

            borderColor: colors.border,

            marginBottom: 20,
          }}
        >

          <Text
            style={{
              color: colors.text,

              fontSize: 15,

              fontWeight: "600",
            }}
          >
            ← Back
          </Text>

        </Pressable>

      )}


      <Text
        style={{
          color: colors.text,
          fontSize: 30,
          fontWeight: "700",
          marginBottom: 6,
        }}
      >
        Settings
      </Text>


      <Text
        style={{
          color: colors.muted,
          fontSize: 14,
          marginBottom: 32,
        }}
      >
        Customize RigCraft
      </Text>


      {/* MARKET */}

      <Text
        style={{
          color: colors.muted,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1,
          marginBottom: 10,
        }}
      >
        MARKET
      </Text>


      <Pressable
        onPress={() =>
          setMarketModalVisible(true)
        }

        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 18,
          borderRadius: 18,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >

        <View>

          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Country
          </Text>


          <Text
            style={{
              color: colors.muted,
              fontSize: 14,
              marginTop: 4,
            }}
          >
            {market?.country || "Not selected"}
          </Text>

        </View>


        <Text
          style={{
            color: colors.accent,
            fontSize: 24,
          }}
        >
          ›
        </Text>

      </Pressable>


      {/* APPEARANCE */}

      <Text
        style={{
          color: colors.muted,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 1,
          marginBottom: 10,
        }}
      >
        APPEARANCE
      </Text>


      {/* SNOW */}

      <Pressable
        onPress={() =>
          setTheme("snow")
        }

        style={{
          backgroundColor:
            theme === "snow"
              ? colors.surfaceSoft
              : colors.surface,

          borderWidth: 2,

          borderColor:
            theme === "snow"
              ? colors.accent
              : colors.border,

          padding: 18,
          borderRadius: 18,
          marginBottom: 12,
        }}
      >

        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            fontWeight: "700",
          }}
        >
          ❄️ Snow
        </Text>


        <Text
          style={{
            color: colors.muted,
            fontSize: 14,
            marginTop: 5,
          }}
        >
          A clean, soft blue-white appearance.
        </Text>

      </Pressable>


      {/* SOLAR */}

      <Pressable
        onPress={() =>
          setTheme("solar")
        }

        style={{
          backgroundColor:
            theme === "solar"
              ? colors.surfaceSoft
              : colors.surface,

          borderWidth: 2,

          borderColor:
            theme === "solar"
              ? colors.accent
              : colors.border,

          padding: 18,
          borderRadius: 18,
        }}
      >

        <Text
          style={{
            color: colors.text,
            fontSize: 17,
            fontWeight: "700",
          }}
        >
          🌌 Solar System
        </Text>


        <Text
          style={{
            color: colors.muted,
            fontSize: 14,
            marginTop: 5,
          }}
        >
          A deep space appearance inspired by the cosmos.
        </Text>

      </Pressable>


      {/* MARKET MODAL */}

      <Modal
        visible={marketModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setMarketModalVisible(false)
        }
      >

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
        >

          <View
            style={{
              backgroundColor:
                colors.surface,

              borderTopLeftRadius: 28,

              borderTopRightRadius: 28,

              padding: 20,

              maxHeight: "75%",
            }}
          >

            <Text
              style={{
                color: colors.text,
                fontSize: 21,
                fontWeight: "700",
                marginBottom: 15,
              }}
            >
              Select your country
            </Text>


            <FlatList
              data={MARKETS}

              keyExtractor={(item) =>
                item.country
              }

              renderItem={({ item }) => (

                <Pressable
                  onPress={() =>
                    changeMarket(item)
                  }

                  style={{
                    paddingVertical: 18,

                    borderBottomWidth: 1,

                    borderBottomColor:
                      colors.border,
                  }}
                >

                  <Text
                    style={{
                      color: colors.text,

                      fontSize: 16,

                      fontWeight: "600",
                    }}
                  >
                    {item.country}
                  </Text>

                </Pressable>

              )}
            />


            <Pressable
              onPress={() =>
                setMarketModalVisible(false)
              }

              style={{
                paddingVertical: 18,
                alignItems: "center",
              }}
            >

              <Text
                style={{
                  color: colors.accent,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Cancel
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

    </View>

  );

}
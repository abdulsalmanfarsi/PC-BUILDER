import {
  Pressable,
  Text,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { useState } from "react";

import { Build } from "../types";

import { createStyles } from "../styles/theme";

import { useTheme } from "../context/ThemeContext";


type BuildCardProps = {
  build: Build;
  index: number;
  saved?: boolean;
  onSave?: (build: Build) => void;
  onShare: (build: Build) => void;
  onDelete?: (build: Build) => void;
};


export default function BuildCard({
  build,
  index,
  saved = false,
  onSave,
  onShare,
  onDelete,
}: BuildCardProps) {

  const { theme } = useTheme();

  const styles = createStyles(theme);


  const [liked, setLiked] = useState(false);

  const [disliked, setDisliked] = useState(false);


  const iconColor =
    theme === "snow"
      ? "#61738B"
      : "#AAB4C5";


  const activeColor =
    theme === "snow"
      ? "#2878B8"
      : "#9A6CFF";


  function handleLike() {

    setLiked(!liked);

    if (!liked) {
      setDisliked(false);
    }

  }


  function handleDislike() {

    setDisliked(!disliked);

    if (!disliked) {
      setLiked(false);
    }

  }


  return (
    <View
      key={`${build.Name}-${index}`}
      style={styles.buildCard}
    >

      <View style={styles.buildCardHeader}>

        <Text style={styles.buildName}>
          {build.Name || "PC Build"}
        </Text>

        <Text style={styles.buildUseCase}>
          {build["Use Case"] || "PC Build"}
        </Text>

      </View>


      <View style={styles.buildDivider} />


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>CPU</Text>

        <Text style={styles.specValue}>
          {build.CPU || "Not specified"}
        </Text>
      </View>


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>GPU</Text>

        <Text style={styles.specValue}>
          {build.GPU || "Not specified"}
        </Text>
      </View>


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>
          Motherboard
        </Text>

        <Text style={styles.specValue}>
          {build.Motherboard || "Not specified"}
        </Text>
      </View>


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>RAM</Text>

        <Text style={styles.specValue}>
          {build.RAM || "Not specified"}
        </Text>
      </View>


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>
          Storage
        </Text>

        <Text style={styles.specValue}>
          {build.Storage || "Not specified"}
        </Text>
      </View>


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>PSU</Text>

        <Text style={styles.specValue}>
          {build.PSU || "Not specified"}
        </Text>
      </View>


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>
          Cooler
        </Text>

        <Text style={styles.specValue}>
          {build.Cooler || "Not specified"}
        </Text>
      </View>


      <View style={styles.specRow}>
        <Text style={styles.specLabel}>Case</Text>

        <Text style={styles.specValue}>
          {build.Case || "Not specified"}
        </Text>
      </View>


      <View style={styles.priceBox}>

        <Text style={styles.priceLabel}>
          Estimated Total
        </Text>

        <Text style={styles.priceValue}>
          {build["Estimated Total"] ||
            "Not specified"}
        </Text>

      </View>


      {/* NORMAL BUILD ACTIONS */}

      {!saved && (

        <View style={styles.buildActions}>

          {onSave && (

            <Pressable
              style={styles.iconAction}
              onPress={() => onSave(build)}
            >

              <Feather
                name="copy"
                size={22}
                color={iconColor}
              />

              <Text
                style={[
                  styles.iconActionText,
                  { color: iconColor },
                ]}
              >
                Save
              </Text>

            </Pressable>

          )}


          <Pressable
            style={styles.iconAction}
            onPress={() => onShare(build)}
          >

            <Feather
              name="share-2"
              size={22}
              color={iconColor}
            />

            <Text
              style={[
                styles.iconActionText,
                { color: iconColor },
              ]}
            >
              Share
            </Text>

          </Pressable>


          <Pressable
            style={styles.iconAction}
            onPress={handleLike}
          >

            <Feather
              name="thumbs-up"
              size={22}
              color={
                liked
                  ? activeColor
                  : iconColor
              }
            />

            <Text
              style={[
                styles.iconActionText,
                {
                  color:
                    liked
                      ? activeColor
                      : iconColor,
                },
              ]}
            >
              Like
            </Text>

          </Pressable>


          <Pressable
            style={styles.iconAction}
            onPress={handleDislike}
          >

            <Feather
              name="thumbs-down"
              size={22}
              color={
                disliked
                  ? activeColor
                  : iconColor
              }
            />

            <Text
              style={[
                styles.iconActionText,
                {
                  color:
                    disliked
                      ? activeColor
                      : iconColor,
                },
              ]}
            >
              Dislike
            </Text>

          </Pressable>

        </View>

      )}


      {/* SAVED BUILD ACTIONS */}

      {saved && (

        <View style={styles.buildActions}>

          <Pressable
            style={styles.iconAction}
            onPress={() => onShare(build)}
          >

            <Feather
              name="share-2"
              size={27}
              color={iconColor}
            />

            <Text
              style={[
                styles.iconActionText,
                { color: iconColor },
              ]}
            >
              Share
            </Text>

          </Pressable>


          {onDelete && (

            <Pressable
              style={styles.iconAction}
              onPress={() => onDelete(build)}
            >

              <Feather
                name="trash-2"
                size={27}
                color="#DC2626"
              />

              <Text
                style={[
                  styles.iconActionText,
                  { color: "#DC2626" },
                ]}
              >
                Delete
              </Text>

            </Pressable>

          )}

        </View>

      )}

    </View>
  );
}
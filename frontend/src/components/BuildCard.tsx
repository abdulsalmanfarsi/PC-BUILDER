import { Pressable, Text, View } from "react-native";

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


      <View style={styles.buildActions}>

        {!saved && onSave && (

          <Pressable
            style={styles.saveBuildButton}
            onPress={() => onSave(build)}
          >
            <Text style={styles.buildActionText}>
              💾 Save
            </Text>
          </Pressable>

        )}


        <Pressable
          style={[
            styles.shareBuildButton,
            saved && styles.savedShareButton,
          ]}
          onPress={() => onShare(build)}
        >
          <Text style={styles.buildActionText}>
            📤 Share
          </Text>
        </Pressable>


        {saved && onDelete && (

          <Pressable
            style={styles.deleteBuildButton}
            onPress={() => onDelete(build)}
          >
            <Text style={styles.buildActionText}>
              🗑 Delete
            </Text>
          </Pressable>

        )}

      </View>

    </View>
  );
}
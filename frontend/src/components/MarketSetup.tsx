import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";

import { UserMarket } from "../types";

type MarketOption = UserMarket;

const MARKETS: MarketOption[] = [
  { country: "India", currency: "INR", currencySymbol: "₹" },
  { country: "United States", currency: "USD", currencySymbol: "$" },
  { country: "United Kingdom", currency: "GBP", currencySymbol: "£" },
  { country: "Canada", currency: "CAD", currencySymbol: "C$" },
  { country: "Australia", currency: "AUD", currencySymbol: "A$" },
  { country: "Germany", currency: "EUR", currencySymbol: "€" },
  { country: "France", currency: "EUR", currencySymbol: "€" },
];

interface MarketSetupProps {
  onComplete: (market: UserMarket) => void;
}

export default function MarketSetup({
  onComplete,
}: MarketSetupProps) {
  const [selectedMarket, setSelectedMarket] =
    useState<MarketOption | null>(null);

  const [modalVisible, setModalVisible] =
    useState(false);

  function selectMarket(market: MarketOption) {
    setSelectedMarket(market);
    setModalVisible(false);
  }

  function handleContinue() {
    if (!selectedMarket) return;

    onComplete(selectedMarket);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🖥️</Text>

      <Text style={styles.title}>
        PC Builder AI
      </Text>

      <Text style={styles.subtitle}>
        Select your market to get relevant
        component availability and pricing.
      </Text>

      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={
            selectedMarket
              ? styles.selectorText
              : styles.placeholder
          }
        >
          {selectedMarket
            ? `${selectedMarket.country} • ${selectedMarket.currency} (${selectedMarket.currencySymbol})`
            : "Select your country / market"}
        </Text>

        <Text style={styles.arrow}>⌄</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedMarket && styles.disabledButton,
        ]}
        disabled={!selectedMarket}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>
          Continue
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Select your market
            </Text>

            <FlatList
              data={MARKETS}
              keyExtractor={(item) => item.country}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.marketItem}
                  onPress={() => selectMarket(item)}
                >
                  <Text style={styles.marketCountry}>
                    {item.country}
                  </Text>

                  <Text style={styles.marketCurrency}>
                    {item.currency} ({item.currencySymbol})
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#0F172A",
  },

  logo: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 40,
    lineHeight: 23,
  },

  selector: {
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E293B",
  },

  selectorText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  placeholder: {
    color: "#94A3B8",
    fontSize: 16,
  },

  arrow: {
    color: "#94A3B8",
    fontSize: 24,
  },

  continueButton: {
    marginTop: 20,
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.45,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modal: {
    maxHeight: "75%",
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 16,
  },

  marketItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },

  marketCountry: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  marketCurrency: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 14,
  },

  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },

  cancelText: {
    color: "#94A3B8",
    fontSize: 16,
  },
});
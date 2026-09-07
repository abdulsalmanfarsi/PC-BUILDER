import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppTheme = "snow" | "solar";

type ThemeContextType = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => Promise<void>;
  loaded: boolean;
};

const ThemeContext =
  createContext<ThemeContextType | null>(null);

const THEME_KEY = "rigcraft_theme";

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<AppTheme>("solar");

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  async function loadTheme() {
    try {
      const savedTheme =
        await AsyncStorage.getItem(THEME_KEY);

      if (
        savedTheme === "snow" ||
        savedTheme === "solar"
      ) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.log(
        "Could not load theme:",
        error
      );
    } finally {
      setLoaded(true);
    }
  }

  async function setTheme(
    newTheme: AppTheme
  ) {
    try {
      await AsyncStorage.setItem(
        THEME_KEY,
        newTheme
      );

      setThemeState(newTheme);
    } catch (error) {
      console.log(
        "Could not save theme:",
        error
      );
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        loaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
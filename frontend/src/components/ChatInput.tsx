import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createStyles,
  themeColors,
} from "../styles/theme";

import {
  useTheme,
} from "../context/ThemeContext";


type ChatInputProps = {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  onSend: () => void;
};


export default function ChatInput({
  question,
  setQuestion,
  loading,
  onSend,
}: ChatInputProps) {

  const { theme } = useTheme();

  const styles =
    createStyles(theme);

  const colors =
    themeColors[theme];

  const canSend =
    question.trim().length > 0 &&
    !loading;


  return (
    <View
      style={styles.inputContainer}
    >

      <TextInput
        style={styles.input}

        placeholder="Ask about PC builds..."

        placeholderTextColor={
          colors.muted
        }

        value={question}

        onChangeText={setQuestion}

        multiline

        editable={!loading}
      />


      <Pressable
        style={[
          styles.sendButton,

          !canSend &&
            styles.sendButtonDisabled,
        ]}

        onPress={onSend}

        disabled={!canSend}
      >

        {loading ? (

          <ActivityIndicator
            color="#FFFFFF"
          />

        ) : (

          <Text
            style={
              styles.sendButtonText
            }
          >
            Send
          </Text>

        )}

      </Pressable>

    </View>
  );
}
import HeaderDropDown from "@/components/HeaderDropDown";
import MessageInput from "@/components/MessageInput";
import { defaultStyles } from "@/constants/Styles";
import { keyStorage, storage } from "@/utils/storage";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { FlashList } from "@shopify/flash-list";
import ChatMessage from "@/components/ChatMessage";
import { Message, Role } from "@/utils/interfaces";
import MessageIdeas from "@/components/MessageIdeas";
import { addChat, addMessage, getMessages } from "@/utils/database";
import OpenAI from "react-native-openai";
import { useAuth } from "@/hooks/Auth";

const ChatPage = () => {
  const [height, setHeight] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  let { id } = useLocalSearchParams<{ id: string }>();

  const { user } = useAuth();

  const [apiKey] = useMMKVString("apikey", keyStorage);
  const [gptVersion, setGptVersion] = useMMKVString("gptVersion", storage);
  const [organization] = useMMKVString("org", keyStorage);

  if (!apiKey || apiKey === "" || !organization || organization === "") {
    return <Redirect href={"/(auth)/(modal)/settings"} />;
  }

  const [chatId, _setChatId] = useState(id);
  const chatIdRef = useRef(chatId);
  // https://stackoverflow.com/questions/55265255/react-usestate-hook-event-handler-using-initial-state
  function setChatId(id: string) {
    chatIdRef.current = id;
    _setChatId(id);
  }

  useEffect(() => {
    if (id) {
      getMessages(id).then((res) => {
        setMessages(res);
      });
    }
  }, [id]);

  const openAI = useMemo(
    () =>
      new OpenAI({
        apiKey: "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",
        organization: "org-RcM6wXatk5mGpGM3wUdO0p58",
      }),
    []
  );

  useEffect(() => {
    const handleNewMessage = (payload: any) => {
      // console.log("🚀 ~ handleNewMessage ~ payload:", payload)
      setMessages((messages) => {
        const newMessage: string | undefined =
          payload.choices[0]?.delta?.content;

        console.log("🚀 ~ setMessages ~ newMessage:", newMessage);

        console.log("🚀 ~ setMessages ~ messages:", messages);

        if (newMessage && messages.length > 0) {
          console.log({ messages });

          messages[messages.length - 1].content += newMessage;
          return [...messages];
        }
        if (payload.choices[0]?.finishReason && messages.length > 0) {
          // save the last message

          addMessage(chatIdRef.current ?? "", {
            content: messages[messages.length - 1].content,
            role: Role.Bot,
          });
        }
        return messages;
      });
    };

    openAI.chat.addListener("onChatMessageReceived", handleNewMessage);

    return () => {
      openAI.chat.removeListener("onChatMessageReceived");
    };
  }, []);

  const onGptVersionChange = (version: string) => {
    setGptVersion(version);
  };

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height / 2);
  };

  const getCompletion = async (text: string) => {
    console.log(text);

    if (messages.length === 0) {
      console.log({ user });

      addChat(text, user?.id ?? "").then((res) => {
        const chatID = res;
        setChatId(chatID.toString());
        addMessage(chatID, { content: text, role: Role.User });
      });
    }

    setMessages([
      ...messages,
      { role: Role.User, content: text },
      { role: Role.Bot, content: "" },
    ]);
    messages.push();

    openAI.chat.stream({
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      model: gptVersion == "4" ? "gpt-4" : "gpt-3.5-turbo",
    });
  };

  return (
    <View style={defaultStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <HeaderDropDown
              title="ChatGPT"
              items={[
                { key: "3.5", title: "GPT-3.5", icon: "bolt" },
                { key: "4", title: "GPT-4", icon: "sparkles" },
              ]}
              onSelect={onGptVersionChange}
              selected={gptVersion}
            />
          ),
        }}
      />
      <View style={styles.page} onLayout={onLayout}>
        {messages.length == 0 && (
          <View style={[styles.logoContainer, { marginTop: height / 2 - 100 }]}>
            <Image
              source={require("@/assets/images/logo-white.png")}
              style={styles.image}
            />
          </View>
        )}
        <FlashList
          showsVerticalScrollIndicator={false}
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          contentContainerStyle={{ paddingTop: 30, paddingBottom: 150 }}
          keyboardDismissMode="on-drag"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={70}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
        }}
      >
        {messages.length === 0 && <MessageIdeas onSelectCard={getCompletion} />}
        <MessageInput onShouldSend={getCompletion} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 50,
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "cover",
  },
  page: {
    flex: 1,
  },
});
export default ChatPage;

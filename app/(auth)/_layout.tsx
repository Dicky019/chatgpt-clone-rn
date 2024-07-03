import Colors from "@/constants/Colors";
import { keyStorage } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Alert, TouchableOpacity } from "react-native";
import { useMMKVString } from "react-native-mmkv";

const Layout = () => {
  const router = useRouter();
  const [key] = useMMKVString("apikey", keyStorage);
  const [organization] = useMMKVString("org", keyStorage);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: Colors.selected },
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modal)/settings"
        options={{
          headerTitle: "Settings",
          presentation: "modal",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.selected },
          headerRight: !(key && organization)
            ? undefined
            : () => (
                <TouchableOpacity
                  onPress={() => {
                    if (!(key && organization && router.canGoBack())) {
                      Alert.alert("Error", "Your Key Empty");
                    }
                    router.back();
                  }}
                  style={{
                    backgroundColor: Colors.line_color,
                    borderRadius: 20,
                    padding: 4,
                  }}
                >
                  <Ionicons
                    name="close-outline"
                    size={16}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
              ),
        }}
      />
      <Stack.Screen
        name="(modal)/image/[url]"
        options={{
          headerTitle: "",
          presentation: "fullScreenModal",
          headerBlurEffect: "dark",
          headerStyle: { backgroundColor: "rgba(0,0,0,0.4)" },
          headerTransparent: true,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ borderRadius: 20, padding: 4 }}
            >
              <Ionicons name="close-outline" size={28} color={"#fff"} />
            </TouchableOpacity>
          ),
        }}
      />
      {/* <Stack.Screen
            name="(modal)/purchase"
            options={{
              headerTitle: '',
              presentation: 'fullScreenModal',
              headerShadowVisible: false,
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{ borderRadius: 20, padding: 4 }}>
                  <Ionicons name="close-outline" size={28} color={Colors.greyLight} />
                </TouchableOpacity>
              ),
            }}
          /> */}
    </Stack>
  );
};

export default Layout;

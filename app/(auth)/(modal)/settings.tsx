import { ListContainer, ListItem } from "@/components/ListItem";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useAuth } from "@/hooks/Auth";
import { keyStorage } from "@/utils/storage";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
// import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { supabase } from "@/utils/supabase";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const Page = () => {
  const [key, setKey] = useMMKVString("apikey", keyStorage);
  const [organization, setOrganization] = useMMKVString("org", keyStorage);

  const [apiKey, setApiKey] = useState(key ?? "");
  const [org, setOrg] = useState(organization ?? "");
  const router = useRouter();

  const { signOut, user } = useAuth();
  console.log({ user });

  const saveApiKey = async () => {
    setKey(apiKey);
    setOrganization(org);
    router.navigate("/(auth)/(drawer)");
  };

  const removeApiKey = async () => {
    setKey("");
    setOrganization("");
  };

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("-");
  const [avatarUrl, setAvatarUrl] = useState(
    "https://picsum.photos/seed/696/3000/2000"
  );

  useEffect(() => {
    if (user) getProfile();
  }, [user]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("user")
        .select(`name, image_url`)
        .eq("id", user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.name);
        setAvatarUrl(data.image_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    name,
    image_url,
  }: {
    name: string;
    image_url: string;
  }) {
    try {
      setLoading(true);
      if (!user) throw new Error("No user on the session!");

      const updates = {
        id: user.id,
        name,
        image_url,
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(updates)
        .returns();

      console.log({ data });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      const { error } = await signOut();
      if (error) {
        Alert.alert(error.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <Image
        style={{
          height: 150,
          width: 150,
          marginHorizontal: "auto",
          marginVertical: 12,
          borderRadius: 150 / 2,
        }}
        source={avatarUrl}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />

      <View style={{ marginVertical: 20 }}>
        {/* <Text style={styles.label}>Account</Text> */}
        <ListContainer>
          <ListItem
            icon={
              <MaterialIcons name="alternate-email" size={24} color="black" />
            }
            title={user?.email ?? "-"}
            hasPage={true}
          />
          <ListItem
            icon={<MaterialIcons name="person" size={24} color="black" />}
            title={username}
            hasPage={true}
          />
          <ListItem
            icon={<MaterialIcons name="key" size={24} color="black" />}
            title="API key"
            hasPage={true}
          />
          <ListItem
            icon={<Octicons name="organization" size={24} color="black" />}
            title="Your organization"
            hasPage={true}
          />
          <ListItem
            subContentStyle={{
              borderBottomWidth: 0,
              borderBottomColor: "transparent",
            }}
            icon={<MaterialIcons name="logout" size={24} color="black" />}
            title="Logout"
            onPress={logout}
          />
        </ListContainer>
      </View>

      {/* {key && key !== "" && (
        <>
          <TouchableOpacity
            style={[defaultStyles.btn, { backgroundColor: Colors.primary }]}
            onPress={removeApiKey}
          >
            <Text style={styles.buttonText}>Remove API Key</Text>
          </TouchableOpacity>
        </>
      )} */}

      {(!key || key === "") && (
        <>
          <Text style={styles.label}>API Key & Organization:</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter your API key"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={org}
            onChangeText={setOrg}
            placeholder="Your organization"
            autoCorrect={false}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[defaultStyles.btn, { backgroundColor: Colors.primary }]}
            onPress={saveApiKey}
          >
            <Text style={styles.buttonText}>Save API Key</Text>
          </TouchableOpacity>
        </>
      )}

      {/* <TouchableOpacity
        style={[
          defaultStyles.btn,
          { backgroundColor: Colors.primary, marginVertical: 16 },
        ]}
        onPress={signOut}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity> */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    textTransform: "uppercase",
    paddingVertical: 12,
    fontWeight: "600",
    fontSize: 16,
    color: Colors.text_color,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
export default Page;

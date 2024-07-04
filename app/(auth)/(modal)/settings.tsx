import { ListContainer, ListItem } from "@/components/ListItem";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useAuth } from "@/hooks/Auth";
import { keyStorage } from "@/utils/storage";
import { MaterialIcons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { ScrollView } from "react-native-gesture-handler";
import { supabase } from "@/utils/supabase";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const Page = () => {
  const { signOut, user, setUser } = useAuth();

  const [key, setKey] = useMMKVString("apikey", keyStorage);
  const [organization, setOrganization] = useMMKVString("org", keyStorage);

  const [apiKey, setApiKey] = useState(key ?? "");
  const [org, setOrg] = useState(organization ?? "");

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name ?? "-");
  const [avatarUrl, setAvatarUrl] = useState(user?.imageUrl ?? "-");

  const router = useRouter();

  const isEmptyKeyOrg = key === "" && organization === "";

  const [editAccount, setEditAccount] = useState(false);
  const [editKey, setEditKey] = useState(isEmptyKeyOrg);

  const saveApiKey = async () => {
    setKey(apiKey);
    setOrganization(org);
    router.navigate("/(auth)/(drawer)");
  };

  const removeApiKey = async () => {
    setEditKey(true);
    setApiKey("");
    setOrg("");
  };

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

  async function updateAccount() {
    try {
      if (!user) throw new Error("No user on the session!");

      setLoading(true);
      const updates = {
        id: user.id,
        name,
      };
      const { error, status } = await supabase
        .from("user")
        .upsert(updates)
        .returns();

      if (error) {
        console.log({ error });

        Alert.alert("Error", error.message);
        return;
      }

      if (error && status !== 406) {
        throw error;
      }

      const { data } = await supabase
        .from("user")
        .select(`name`)
        .eq("id", user.id)
        .single();

      console.log("🚀 ~ updateAccount ~ userUpdate:", data);
      if (data) {
        const { name } = data as {
          name: string;
        };

        setName(name);
        setUser(name, user.imageUrl);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
      setEditAccount(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{
          margin: "auto",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 64,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        style={styles.imageProfil}
        source={avatarUrl}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />

      {/* <Avatar avatarUrl={avatarUrl} /> */}

      <View style={{ marginVertical: 16 }}>
        <TouchableOpacity
          onPress={() => {
            setEditAccount((edit) => !edit);
          }}
          style={styles.labelView}
        >
          <Text style={styles.label}>Account</Text>
          <View style={styles.iconLabel}>
            <MaterialIcons name="edit" size={16} color={Colors.grey} />
          </View>
        </TouchableOpacity>
        <ListContainer>
          <ListItem
            textInput={{
              value: user?.email ?? "-",
            }}
            isEdit={false}
            icon={
              <MaterialIcons
                name="alternate-email"
                size={24}
                color={Colors.text_color}
              />
            }
            title={user?.email ?? "-"}
          />
          <ListItem
            textInput={{
              value: name,
              onChangeText: setName,
              placeholder: "Enter your Name",
              autoCorrect: false,
              autoCapitalize: "none",
            }}
            isEdit={editAccount}
            icon={
              <MaterialIcons
                name="person"
                size={24}
                color={Colors.text_color}
              />
            }
            title={name}
          />
        </ListContainer>
      </View>

      {editAccount && (
        <TouchableOpacity
          style={[
            defaultStyles.btn,
            { backgroundColor: Colors.primary, marginBottom: 8 },
          ]}
          onPress={updateAccount}
        >
          <Text style={styles.buttonText}>Save Account</Text>
        </TouchableOpacity>
      )}

      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => {
            setEditKey((key) => !key);
          }}
          style={styles.labelView}
        >
          <Text style={styles.label}>API Key & Organization</Text>
          <View style={styles.iconLabel}>
            <MaterialIcons name="edit" size={16} color={Colors.grey} />
          </View>
        </TouchableOpacity>
        <ListContainer>
          <ListItem
            textInput={{
              value: apiKey,
              onChangeText: setApiKey,
              placeholder: "Enter your API key",
              autoCorrect: false,
              autoCapitalize: "none",
            }}
            isEdit={editKey}
            icon={
              <MaterialIcons name="key" size={24} color={Colors.text_color} />
            }
            title="API key"
          />
          <ListItem
            textInput={{
              value: org,
              onChangeText: setOrg,
              placeholder: "Enter your API key",
              autoCorrect: false,
              autoCapitalize: "none",
            }}
            isEdit={editKey}
            icon={
              <Octicons
                name="organization"
                size={24}
                color={Colors.text_color}
              />
            }
            title="Your organization"
          />
        </ListContainer>
      </View>

      {editKey && (
        <TouchableOpacity
          style={[
            defaultStyles.btn,
            { backgroundColor: Colors.primary, marginTop: 8 },
          ]}
          onPress={saveApiKey}
        >
          <Text style={styles.buttonText}>Save Key</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          defaultStyles.btn,
          { backgroundColor: Colors.primary, marginTop: 8 },
        ]}
        onPress={removeApiKey}
      >
        <Text style={styles.buttonText}>Remove Key</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          defaultStyles.btn,
          { backgroundColor: Colors.primary, marginVertical: 16 },
        ]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// import * as ContextMenu from "zeego/context-menu";
// function Avatar({ avatarUrl }: { avatarUrl: string }) {
//   return (
//     <ContextMenu.Root>
//       <ContextMenu.Trigger>
//         <Image
//           style={styles.imageProfil}
//           source={avatarUrl}
//           placeholder={{ blurhash }}
//           contentFit="cover"
//           transition={1000}
//         />
//       </ContextMenu.Trigger>
//       <ContextMenu.Content
//         alignOffset={0}
//         avoidCollisions
//         collisionPadding={0}
//         loop={false}
//       >
//         <ContextMenu.Preview>
//           {() => (
//             <View
//               style={{
//                 padding: 16,
//                 height: 200,
//               }}
//             >
//               <Image
//                 style={styles.imageProfil}
//                 source={avatarUrl}
//                 placeholder={{ blurhash }}
//                 contentFit="cover"
//                 transition={1000}
//               />
//             </View>
//           )}
//         </ContextMenu.Preview>

//         <ContextMenu.Item key={"Galery"} onSelect={() => {}}>
//           <ContextMenu.ItemTitle>Galery</ContextMenu.ItemTitle>
//           <ContextMenu.ItemIcon
//             ios={{
//               name: "photo",
//               pointSize: 18,
//             }}
//           />
//         </ContextMenu.Item>
//         <ContextMenu.Item key={"Camera"} onSelect={() => {}}>
//           <ContextMenu.ItemTitle>Camera</ContextMenu.ItemTitle>
//           <ContextMenu.ItemIcon
//             ios={{
//               name: "camera",
//               pointSize: 18,
//             }}
//           />
//         </ContextMenu.Item>
//       </ContextMenu.Content>
//     </ContextMenu.Root>
//   );
// }

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
  labelView: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  iconLabel: {
    backgroundColor: Colors.line_color,
    borderRadius: 20,
    padding: 6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  imageProfil: {
    height: 150,
    width: 150,
    marginHorizontal: "auto",
    // marginVertical: 12,
    marginTop: 12,
    borderRadius: 150 / 2,
  },
});

export default Page;

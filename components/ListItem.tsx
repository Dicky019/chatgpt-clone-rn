import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { GestureResponderEvent, View, ViewStyle, Text } from "react-native";

export const ListContainer = React.memo(
  (props: { style?: ViewStyle; children: any }) => {
    return (
      <View
        style={[
          { backgroundColor: Colors.settings_list_bg, borderRadius: 10 },
          props.style,
        ]}
      >
        {props.children}
      </View>
    );
  }
);

export interface IListItemProp {
  icon: ReactNode;
  title: string;
  style?: ViewStyle;
  hasPage?: ReactNode;
  subContentStyle?: ViewStyle;
  onPress?: (event: GestureResponderEvent) => void;
}

export const ListItem = React.memo((props: IListItemProp) => {
  return (
    <View
      onTouchEnd={props.onPress}
      style={[{ flexDirection: "row", alignItems: "center" }, props.style]}
    >
      <View style={{ margin: 15 }}>{props.icon}</View>
      <View
        style={[
          {
            flex: 1,
            borderBottomColor: Colors.line_color,
            borderBottomWidth: 0.5,
            paddingVertical: 15,
            flexDirection: "row",
            paddingRight: 10,
            justifyContent: "space-between",
          },
          props.subContentStyle,
        ]}
      >
        <Text
          style={{ fontSize: 18, color: Colors.bold_text, fontWeight: "500" }}
        >
          {props.title}
        </Text>
        {props.hasPage && (
          <MaterialIcons
            name="change-circle"
            size={24}
            color="black"
            style={{ opacity: 0.6, marginHorizontal: 8 }}
          />
        )}
      </View>
    </View>
  );
});

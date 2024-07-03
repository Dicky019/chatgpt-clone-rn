import { Message, Role } from "@/utils/interfaces";
import { supabase } from "./supabase";

export const addChat = async (title: string) => {
  const { data, error } = await supabase
    .from("chats")
    .insert({ title })
    .select("id") // Select the id field of the inserted row
    .single(); // Ensure only a single row is returned

  if (error) throw error;
  return data.id;
};

export const getChats = async () => {
  const { data, error } = await supabase.from("chats").select("*");

  if (error) throw error;
  return data;
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId);
  console.log("🚀 ~ getMessages ~ data:", data);

  if (error) throw error;
  return data.map((message: any) => ({
    ...message,
    role: message.role === "bot" ? Role.Bot : Role.User,
  }));
};

export const addMessage = async (
  chatId: string,
  { content, role, imageUrl, prompt }: Message
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      content,
      role: role === Role.Bot ? "bot" : "user",
      imageUrl: imageUrl || "",
      prompt: prompt || "",
    })
    .returns();

  if (error) throw error;
  return data;
};

export const deleteChat = async (chatId: string) => {
  const { data, error } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId);

  if (error) throw error;
  return data;
};

export const renameChat = async (chatId: string, title: string) => {
  const { data, error } = await supabase
    .from("chats")
    .update({ title })
    .eq("id", chatId);

  if (error) throw error;
  return data;
};

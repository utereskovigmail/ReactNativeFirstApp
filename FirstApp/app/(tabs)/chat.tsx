import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";

const HUB_URL ='https://p32-native.itstep.click/chat';

interface Message {
    id: string;
    text: string;
    timestamp: string;
}

export default function Chat() {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>("");

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(HUB_URL)
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                setIsConnected(true);
                setIsLoading(false);

                newConnection.on("Send", (messageText: string) => {
                    const newMsg: Message = {
                        id: Math.random().toString(),
                        text: messageText,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                    setMessages((prevMessages) => [...prevMessages, newMsg]);
                });
            })
            .catch((error) => {
                console.error("SignalR Connection Error: ", error);
                setIsLoading(false);
            });

        return () => {
            if (newConnection) {
                newConnection.off("Send");
                newConnection.stop();
            }
        };
    }, []);

    const handleSendMessage = async () => {
        if (!inputText.trim() || !connection || !isConnected) return;

        try {
            await connection.invoke("Send", inputText);
            setInputText("");
        } catch (error) {
            console.error("Failed to send message: ", error);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0066cc" />
                <Text className="mt-3 text-base text-gray-500">Connecting to chat live stream...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >s
                {/* Header Block */}
                <View className="pt-4 px-4 pb-3 bg-white border-b border-gray-200">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">Live Chat</Text>
                    <View className="flex-row items-center">
                        <View className={`w-2.5 h-2.5 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className="text-sm text-gray-500">{isConnected ? "Connected" : "Disconnected"}</Text>
                    </View>
                </View>

                {/* Message Thread List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }} // Content container style maps better inline
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    renderItem={({ item }) => (
                        <View className="bg-white rounded-xl p-3 my-1 max-w-[85%] self-start border border-gray-200">
                            <Text className="text-base text-gray-800 leading-5">{item.text}</Text>
                            <Text className="text-xs text-gray-400 mt-1">{item.timestamp}</Text>
                        </View>
                    )}
                />

                {/* Text Entry Footer Bar */}
                <View className="flex-row px-3 py-3 bg-white border-t border-gray-200 items-end">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 mr-2 text-base text-gray-800 max-h-[100px]"
                        placeholder="Type your message..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        className={`bg-[#0066cc] rounded-2xl px-5 py-2.5 justify-center items-center ${!inputText.trim() ? 'opacity-60' : 'opacity-100'}`}
                        onPress={handleSendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Text className="text-white text-sm font-semibold">Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// app/index.tsx
import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { ActivityIndicator, View } from "react-native";

export default function IndexGater() {
    // Grab the token or auth status from your Redux store
    // (Adjust the selector string to match your exact Redux slice structure)
    const { token, isLoading } = useSelector((state: any) => state.auth || {});

    // If Redux is still figuring things out, show a quick loader
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // If there is an active token, automatically send them to the main feed
    // If not, send them straight to the login screen inside your (auth) layout
    return token ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
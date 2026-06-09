import { SafeAreaView } from 'react-native-safe-area-context';
import NetworkLogger from "react-native-network-logger";


export default function LoggerScreen(){
    return (
        <>
            <SafeAreaView style={{flex: 1}}>
                <NetworkLogger/>
            </SafeAreaView>
        </>
    );
}
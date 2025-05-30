import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
//Expo-router gestiona las direcciones
import { Slot, SplashScreen, Stack} from 'expo-router';
//Native Wind
import "../global.css"
//Fonts
import { useFonts } from 'expo-font'

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  //Importamos las fuentes
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  //Investigar bien esta linea
  useEffect(() => {
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error])

  if(!fontsLoaded && !error) return null;

  return (
    <Stack>
      <Stack.Screen name='index' options={{headerShown : false}} />
      <Stack.Screen name='(auth)' options={{headerShown : false}} /> 
      <Stack.Screen name='(tabs)' options={{headerShown : false}}/>
      <Stack.Screen name='(medTabs)' options={{headerShown : false}}/>
    </Stack>
  )
}

export default RootLayout
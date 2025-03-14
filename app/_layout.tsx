import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
//Expo-router gestiona las direcciones
import { Slot} from 'expo-router';
//Native Wind
import "../global.css"

const RootLayout = () => {
  return (
    <Slot />
  )
}

export default RootLayout
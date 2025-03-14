import { Tabs, Redirect} from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';



export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Usa un fondo transparente en iOS para mostrar el efecto de desenfoque
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="book"
        options={{
          title: 'Agendar',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown : false
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
        }}
      />
    </Tabs>
  );
}
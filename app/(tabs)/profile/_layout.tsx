import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true, // Muestra el encabezado en las pantallas internas
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Perfil', // Título de la pantalla principal de perfil
        }}
      />
    </Stack>
  );
}
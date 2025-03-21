import { Tabs } from 'expo-router';
import React from 'react';
import { ImageSourcePropType, Platform } from 'react-native';
import { Text, View, Image } from 'react-native';
import { icons } from '../../constants'; // Exportar los iconos por medio de sus definiciones en constants
import tailwindConfig from '../../tailwind.config'; // Exportar los estilos configurados en tailwind


// TypeScript es un lenguaje estáticamente tipado por lo cual tengo que definir los props
type TabIconProps = {
  icon: ImageSourcePropType; // Tipo para la propiedad `icon`
  color: string; // Tipo para la propiedad `color`
  name: string; // Tipo para la propiedad `name`
  focused: boolean; // Tipo para la propiedad `focused`
};

const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    <View className='items-center justify-center gap-2' style={{ width: 80}}>
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-6 h-6'
      />  
      <Text
        className={`${focused ? 'font-extrabold' : 'font-normal'} text-xs`}
        style={{ color: color}}
      >
        {name}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#1372DF',
        tabBarInactiveTintColor: '#CDCDE0',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#161622',
          paddingTop: 10,
          borderTopWidth: 1,
          height: 80,
        },
      }}>
      <Tabs.Screen
        name="book"
        options={{
          title: 'Agendar',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.plus}
              color={color}
              name="Agendar"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.profile}
              color={color}
              name="Perfil"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.bookmark}
              color={color}
              name="Ajustes"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}


import { Tabs, Redirect} from 'expo-router';
import React from 'react';
import { ImageComponent, ImageSourcePropType, Platform } from 'react-native';
import {Text, View, Image } from 'react-native'
import {icons} from '../../constants';

//TypeScrypt es un lenguaje estaticamente tipado por lo cual tengo que definir los props
type TabIconProps = {
  icon: ImageSourcePropType; // Tipo para la propiedad `icon`
  color: string; // Tipo para la propiedad `color`
  name: string; // Tipo para la propiedad `name`
  focused: boolean; // Tipo para la propiedad `focused`
};

const TabIcon = ({icon, color, name, focused} : TabIconProps) => {
  return(
    <View className='items-center justify-center gap-2'> 
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-6 h-6'
      />
      <Text className={`${focused ? 'font-semibold' : 'font-normal'} text-xs`}>
        {name}
      </Text>
    </View>
  )
}


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
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
          //Añadir icono
          tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Agendar"
                focused={focused}
              />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({color, focused}) => (
            <TabIcon
              icon={icons.profile}
              color={color}
              name="Perfil"
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({color, focused}) => (
            <TabIcon
              icon={icons.bookmark}
              color={color}
              name="Ajustes"
              focused={focused}
            />
          )
        }}
      />
    </Tabs>
  );
}

//Estilos de contenedotes, etc, etc
const styles = {
  tabContainer: {
    flexDirection: 'row', // Asegura que el texto se comporte correctamente en una fila
    alignItems: 'center', // Centra verticalmente el texto
  },
  tabText: {
    flexShrink: 1, // Permite que el texto se reduzca para caber en el espacio disponible
    flexWrap: 'wrap', // Permite que el texto se envuelva en múltiples líneas si es necesario
  },
};
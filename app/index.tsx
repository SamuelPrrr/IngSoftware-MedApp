import React from 'react'
import { StatusBar } from 'react-native';
import {Text, View, Image } from 'react-native'
import { Link, Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { icons } from '../constants'; 
import { useFonts } from 'expo-font'
import CustomButton from '@/components/CustomButton';

//Index que nos redirige a tabs, debido a que estamos usando Stacks
export default function Index() {
  return(
    //SafeAreaView nos permite hace un view que se ajusta automaticamente al dispositivo, evitando notch por ejemplo en el iphone
  <SafeAreaView className="bg-primary h-full">
    <ScrollView contentContainerStyle={{ height: '100%' }}>

      <View className='w-full items-center h-full px-4 pt-20'>
        <Image
          source={icons.logo} 
          className='w-[110px] h-[110px]'
          resizeMode='contain'
          />
        <View className='relative mt-5'>
          <Text className='text-3xl text-white font-bold text-center'>Bienvenido/a a {' '}<Text className='text-secondary'>MedApp</Text></Text>
        </View>

        <View className="mt-20">

        <View className="flex-row items-center mb-7">
          <Image
            source={icons.citas} 
            className="w-6 h-6 mr-2" 
            resizeMode="contain"
          />
          <Text className="text-base font-normal text-gray-100">
            Agenda citas médicas fácil y rápido
          </Text>
        </View>

        <View className="flex-row items-center mb-7">
          <Image
            source={icons.profile2} 
            className="w-6 h-6 mr-2"
            resizeMode="contain"
          />
          <Text className="text-base font-normal text-gray-100">
            Información en perfil personalizado
          </Text>
        </View>

        <View className="flex-row items-center mb-7">
          <Image
            source={icons.ficha} 
            className="w-6 h-6 mr-2"
            resizeMode="contain"
          />
          <Text className="text-base font-normal text-gray-100">
            Generación de fichas médicas
          </Text>
        </View>

      
        <View className="flex-row items-center mb-7">
          <Image
            source={icons.cardiograma} 
            className="w-6 h-6 mr-2"
            resizeMode="contain"
          />
          <Text className="text-base font-normal text-gray-100">
            Historial de citas
          </Text>
        </View>


        <View className="flex-row items-center mb-7">
          <Image
            source={icons.notificacion} 
            className="w-6 h-6 mr-2"
            resizeMode="contain"
          />
          <Text className="text-base font-normal text-gray-100">
            Notificaciones
          </Text>
        </View>

        <View className="flex-row items-center mb-7">
          <Image
            source={icons.seguridad} 
            className="w-6 h-6 mr-2"
            resizeMode="contain"
          />
          <Text className="text-base font-normal text-gray-100">
            Seguridad en tus datos
          </Text>
        </View>
    </View>

    <CustomButton 
      title = "Inicia sesión"
      handlePress = { () => router.push('/(auth)/sign-in')}
      containerStyles="w-full mt-7"
    />

      <View className='justify-center pt-5 flex-row gap-2'>
        <Text className='text-lg text-gray-100 font-normal'>¿No tienes una cuenta?</Text>
            <Link className='text-lg text-secondary font-normal' href={"/sign-up"}>Registrate</Link>
        </View>
    
    </View>
    </ScrollView>

    {/*Podemos aplicar opciones a nuestra status bar del celular*/}
    <StatusBar backgroundColor={'#161622'}/>
  </SafeAreaView>
  );
} 
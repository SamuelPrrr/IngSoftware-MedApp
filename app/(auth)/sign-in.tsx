import { View, Text, Image, ScrollView, StatusBar, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' 
import { icons } from '../../constants'; 
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import { storeAuthToken }from '@/services/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignIn = () => {

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter();

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Por favor, ingresa todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      // Realiza la petición de login a tu backend
      const response = await axios.post('http://localhost:8080/auth/login', {
        correo: form.email,
        password: form.password,
      });

      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        // Guarda el token con AsyncStorage y mi metodo creado (Checar esto)
        await storeAuthToken(response.data.token);
        //await AsyncStorage.setItem('authToken', response.data.token); //Aqui lo obtengo directamente y sin la función
        // Redirige al usuario a la pantalla principal después del login
        const token = await AsyncStorage.getItem('authToken');
        const route = await axios.get("http://localhost:8080/auth/route", {
            headers: { Authorization: `Bearer ${token}`}
        });
        Alert.alert('Bienvenido', 'Inicio de sesión exitoso');
        router.push(route.data.data); // Redirige a la página principal o dashboard
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Verifica los campos o intenta más tarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className='items-start px-10'>
          <Image
            source={icons.logo} 
            className='w-[110px] h-[110px]'
            resizeMode='contain'
          />
        </View>
        <View className='w-full h-full px-10'>
          <Text className='text-2xl text-white font-semibold mt-10'>Iniciar sesión</Text>

          {/*Formulario*/}
          <FormField
            title="E-mail"
            value={form.email}
            placeholder="Ingresa tu e-mail"
            handleChangeText={(e) => setForm({...form, email: e})}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Contraseña"
            value={form.password}
            placeholder="Ingresa tu contraseña"
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles="mt-7"
          />

          <CustomButton 
            title="Inicia sesión"
            handlePress={submit}
            containerStyles="w-full mt-10"
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-gray-100 font-normal'>
              ¿No tienes una cuenta?
            </Text>
            <Link className='text-lg text-secondary font-normal' href={"/sign-up"}>Regístrate</Link>
          </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor={'#161622'}/>
    </SafeAreaView>
  )
}

export default SignIn;

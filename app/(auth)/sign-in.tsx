import { View, Text, Image, ScrollView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' 
import { icons } from '../../constants'; 
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';


const SignIn = () => {

    //Estudiar snippets
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = () => {

  }

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className='items-center'>
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
            title = "Inicia sesión"
            handlePress = { submit }
            containerStyles ="w-full mt-10"
            isLoading = {isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-gray-100 font-normal'>
               ¿No tienes una cuenta?
            </Text>
            <Link className='text-lg text-secondary font-normal' href={"/sign-up"}>Registrate</Link>
          </View>
        </View>
      </ScrollView>
      <StatusBar backgroundColor={'#161622'}/>
    </SafeAreaView>
  )
}

export default SignIn
import { View, Text, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context' 
import { icons } from '../../constants'; 
import FormField from '@/components/FormField';


const SignIn = () => {
    //Estudiar snippets
    const [form, setForm] = useState({
      email: '',
      password: '',
    })

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
          <Text className='text-2xl text-white font-semibold mt-10'>Iniciar Sesión</Text>

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

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn
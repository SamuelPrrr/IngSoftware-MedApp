import { View, Text, Image, ScrollView, StatusBar, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import Checkbox from 'expo-checkbox'
import axios from 'axios'
import { storeAuthToken, getAuthToken, removeAuthToken } from '../../services/authStorage';  // Función para guardar el token

const SignUp = () => {
    const [form, setForm] = useState({
        nombre: '',
        email: '',
        telefono: '',
        sexo: '', 
        password: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async () => {
        if (!form.sexo) {
            Alert.alert('Error', 'Por favor selecciona tu género');
            return;
        }
        
        setIsSubmitting(true)
        try {
            const response = await axios.post('http://localhost:8080/auth/register', {
                nombre: form.nombre,
                correo: form.email,
                password: form.password,
                sexo: form.sexo,
                telefono: form.telefono
            })

            if (response.data.error) {
                Alert.alert('Error', response.data.message)
            } else {

                Alert.alert('Bienvenido', 'Usuario registrado correctamente',[
                    {
                    text: 'Iniciar sesión',
                    onPress: () => router.push('/sign-in') // Redirige al usuario a la pantalla de inicio de sesión
                    }
                ]
                )
            }
        } catch (error) {
            console.error(error)
            Alert.alert('Error', 'Verifica los campos o intentalo más tarde')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGenderChange = (gender: string) => {
        setForm({...form, sexo: gender});
    };

    return (
        <SafeAreaView className='bg-primary h-full'>
            <ScrollView>
                <View className='items-center'>
                    <Image
                        source={icons.logo}
                        className='w-[110px] h-[110px]'
                        resizeMode='contain'
                    />
                </View>
                <View className='w-full h-full px-10'>
                    <Text className='text-2xl text-white font-semibold mt-10'>Registrarse</Text>

                    <FormField
                        title="Nombre"
                        value={form.nombre}
                        placeholder="Ingresa tu nombre"
                        handleChangeText={(e) => setForm({...form, nombre: e})}
                        autoCapitalize='words'
                        otherStyles="mt-7"
                    />

                    <FormField
                        title="E-mail"
                        value={form.email}
                        placeholder="Ingresa tu e-mail"
                        handleChangeText={(e) => setForm({...form, email: e})}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Teléfono"
                        value={form.telefono}
                        placeholder="Ingresa tu número"
                        handleChangeText={(e) => setForm({...form, telefono: e})}
                        otherStyles="mt-7"
                        keyboardType="phone-pad"
                    />

                    {/* Sección de Género con checkbox */}
                    <View className='mt-7'>
                        <Text className='text-base text-gray-100 font-medium'>Género</Text>
                        <View className='flex-row mt-5 ml-12'>
                            {/* Checkbox Masculino */}
                            <View className='flex-row items-center mr-10'>
                                <Checkbox
                                    value={form.sexo === 'Masculino'}
                                    onValueChange={() => handleGenderChange('Masculino')}
                                    color={form.sexo === 'Masculino' ? '#1372DF' : undefined}
                                    className='mr-2'
                                />
                                <Text className='text-base text-gray-100 font-medium'>Masculino</Text>
                            </View>

                            {/* Checkbox Femenino */}
                            <View className='flex-row items-center'>
                                <Checkbox
                                    value={form.sexo === 'Femenino'}
                                    onValueChange={() => handleGenderChange('Femenino')}
                                    color={form.sexo === 'Femenino' ? '#1372DF' : undefined}
                                    className='mr-2'
                                />
                                <Text className='text-base text-gray-100 font-medium'>Femenino</Text>
                            </View>
                        </View>
                    </View>

                    <FormField
                        title="Contraseña"
                        value={form.password}
                        placeholder="Ingresa tu contraseña"
                        handleChangeText={(e) => setForm({...form, password: e})}
                        otherStyles="mt-7"
                    />

                    <CustomButton
                        title="Registrarse"
                        handlePress={submit}
                        containerStyles="w-full mt-10"
                        isLoading={isSubmitting}
                    />

                    <View className='justify-center pt-5 flex-row gap-2'>
                        <Text className='text-lg text-gray-100 font-normal'>
                            ¿Ya tienes una cuenta?
                        </Text>
                        <Link className='text-lg text-secondary font-normal' href={"/sign-in"}>Inicia sesión</Link>
                    </View>
                </View>
            </ScrollView>
            <StatusBar backgroundColor={'#161622'} />
        </SafeAreaView>
    )
}

export default SignUp
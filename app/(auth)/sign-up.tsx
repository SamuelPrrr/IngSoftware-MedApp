import { View, Text, Image, ScrollView, StatusBar, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { Link } from 'expo-router'
import axios from 'axios' // Asegúrate de tener axios instalado

const SignUp = () => {

    // Estado local para almacenar los datos del formulario
    const [form, setForm] = useState({
        nombre: '',
        direccion: '',
        email: '',
        password: '',
    })

    // Estado para controlar si el formulario está siendo enviado
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Función para manejar el envío del formulario
    const submit = async () => {
        setIsSubmitting(true) // Indicamos que el formulario está siendo procesado
        try {
            // Realizamos la solicitud POST al backend para registrar el nuevo usuario
            const response = await axios.post('http://localhost:8080/api/v1/usuario/register', {
                nombre: form.nombre,  // Enviamos el nombre
                direccion: form.direccion, // Enviamos la dirección
                correo: form.email,  // Enviamos el correo
                contraseña: form.password,  // Enviamos la contraseña
            })

            // Si el backend responde con un error (correo ya registrado)
            if (response.data.error) {
                Alert.alert('Error', response.data.message)  // Mostramos el mensaje de error
            } else {
                // Si el registro fue exitoso, mostramos un mensaje de éxito
                Alert.alert('Bienvenido', 'Usuario registrado correctamente')
            }
        } catch (error) {
            console.error(error)
            Alert.alert('Error', 'Verifica los campos o intentalo más tarde')
        } finally {
            setIsSubmitting(false) // Restablecemos el estado de envío del formulario
        }
    }

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

                    {/*Formulario de registro*/}
                    <FormField
                        title="Nombre"
                        value={form.nombre}
                        placeholder="Ingresa tu nombre"
                        handleChangeText={(e) => setForm({...form, nombre: e})}
                        autoCapitalize='words'
                        otherStyles="mt-7"
                    />

                    <FormField
                        title="Dirección"
                        value={form.direccion}
                        placeholder="Ingresa tu dirección"
                        handleChangeText={(e) => setForm({...form, direccion: e})}
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
                        title="Contraseña"
                        value={form.password}
                        placeholder="Ingresa tu contraseña"
                        handleChangeText={(e) => setForm({...form, password: e})}
                        otherStyles="mt-7"
                    />

                    <CustomButton
                        title="Registrarse"
                        handlePress={submit} // Al hacer clic en este botón, se ejecutará la función submit
                        containerStyles="w-full mt-10"
                        isLoading={isSubmitting} // Muestra un indicador de carga mientras se envía el formulario
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

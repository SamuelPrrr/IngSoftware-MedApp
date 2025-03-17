import { View, Text, TextInput, TextInputProps, Pressable } from 'react-native'
import React, { useState } from 'react'

//Estudiar los componentes de esto
type FormFieldProps = {
    title: string;
    value: string;
    placeholder?: string; // Hacer opcional
    handleChangeText: (text: string) => void; // Corregir el nombre y el tipo
    otherStyles?: string; // Hacer opcional
    keyboardType?: TextInputProps['keyboardType']; // Tipo correcto para keyboardType
  };

const FormField = ({title, value, placeholder, handleChangeText, otherStyles}: FormFieldProps) => {
    const [showPassword, setShowPassword] = useState(false)

  return (
    <View className={`space-y-2 ${otherStyles}`}>

      <Text className='text-base text-gray-100 font-medium'>{title}</Text>

      <View className="mt-5 border-2 border-black w-full h-16 px-4 bg-black-100 
      rounded-2xl focus:border-secondary items-center">
        <TextInput className='flex-1 text-white font-semibold text-base'
            value={value}
            placeholder={placeholder}
            placeholderTextColor={'#7b7b8b'}
            onChangeText={handleChangeText}
            secureTextEntry={title=== 'Password' && !showPassword } >
        </TextInput>
    </View>
    </View>
  )
}

export default FormField


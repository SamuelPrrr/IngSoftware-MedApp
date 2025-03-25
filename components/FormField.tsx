import { View, Text, TextInput, TextInputProps, Pressable, TouchableOpacity, Image } from 'react-native'
import React, { useState} from 'react'
import { icons } from '../constants'

//Define los datos, es una especie de constructor
type FormFieldProps = {
    title: string;
    value: string;
    placeholder?: string; 
    //Propiedad que hace una función callback que se pasa como prop al componente FormField
    handleChangeText: (text: string) => void; 
    otherStyles?: string; 
    keyboardType?: TextInputProps['keyboardType']; // Tipo correcto para keyboardType
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; // Nueva prop
  };

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, autoCapitalize = 'none'}: FormFieldProps) => {
    const [showPassword, setShowPassword] = useState(false)

  return (
    <View className={`space-y-2 ${otherStyles}`}>

      <Text className='text-base text-gray-100 font-medium'>{title}</Text>

      <View className="mt-5 border-2 border-black w-full h-16 px-4 bg-black-100 
      rounded-2xl focus:border-secondary items-center flex-row">
        <TextInput className='flex-1 text-white font-semibold text-base'
            value={value}
            placeholder={placeholder}
            placeholderTextColor={'#7b7b8b'}
            onChangeText={handleChangeText}
            autoCapitalize={autoCapitalize} // Aplicamos la prop aquí
            secureTextEntry={title === 'Contraseña' && !showPassword } >
        </TextInput>

        {title ===  'Contraseña' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image 
                source={!showPassword ? icons.eyeHide : icons.eye} className='w-6 h-6' resizeMode='contain' 
              />
          </TouchableOpacity>
        )}
    </View>
    </View>
  )
}

export default FormField


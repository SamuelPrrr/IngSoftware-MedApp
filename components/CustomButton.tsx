//TouchableOpacity es un componente que ocupamos para la creación de botones
import { TouchableOpacity, Text } from 'react-native'
import React from 'react'
import { isLoading } from 'expo-font'


// TypeScript es un lenguaje estáticamente tipado por lo cual tengo que definir los props
type CustomButtonProps = {
    title: string; // Usa 'string' en lugar de 'String'
    handlePress: () => void; // Define un tipo específico para la función
    containerStyles?: string; // Usa 'string' para los estilos
    textStyles?: string; // Usa 'string' para los estilos
    isLoading?: boolean; // Hace que 'isLoading' sea opcional
  };

const CustomButton = ({title, handlePress, containerStyles, textStyles, isLoading}: CustomButtonProps) => {
  return (
    <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        className={`bg-secondary rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
        disabled={isLoading}
    >
    <Text className={`text-primary font-semibold text-lg ${textStyles}`}>{ title }</Text>
    </TouchableOpacity>
  )
}

export default CustomButton
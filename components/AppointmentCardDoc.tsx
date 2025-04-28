import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { icons } from '@/constants';

interface AppointmentCardProps {
  appointment: {
    id: string;
    fechaHora: string;
    paciente?: {  // Hacer paciente opcional
      nombre: string;
      sexo: string;
    };
    estado: string;
    motivo?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

const AppointmentCardDoc: React.FC<AppointmentCardProps> = ({ 
appointment, 
onConfirm, 
onCancel 
}) => {
// Proporciona valores por defecto
const paciente = appointment.paciente || { 
  nombre: 'Paciente no especificado', 
  sexo: '' 
};

const pan = React.useRef(new Animated.ValueXY()).current;

const panResponder = React.useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 100) {
        onConfirm();
      } else if (gesture.dx < -100) {
        onCancel();
      }
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false
      }).start();
    }
  })
).current;

return (
  <Animated.View
    {...panResponder.panHandlers}
    style={[{
      transform: [{ translateX: pan.x }]
    }]}
    className="bg-black-200 p-4 rounded-lg my-2 mx-4"
  >
    <View className="flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-white font-semibold">{paciente.nombre}</Text>
        <Text className="text-gray-400">{paciente.sexo}</Text>
        <Text className="text-gray-300 mt-2">
            {new Date(appointment.fechaHora).toLocaleString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
        </Text>
      </View>
      <View className="flex-row">
        <TouchableOpacity 
          onPress={onConfirm}
          className="bg-green-500 p-2 rounded-full mr-2"
        >
          <Image source={icons.checkmark} className="w-4 h-4" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onCancel}
          className="bg-red-500 p-2 rounded-full"
        >
          <Image source={icons.close} className="w-4 h-4" />
        </TouchableOpacity>
      </View>
    </View>
    <View className={`mt-2 h-1 rounded-full ${
      appointment.estado === 'CONFIRMADA' ? 'bg-terciary' :
      appointment.estado === 'COMPLETADA' ? 'bg-secondary' :
      appointment.estado === 'CANCELADA' ? 'bg-error' : 'bg-yellow-500'
    }`} />
  </Animated.View>
);
};

export default AppointmentCardDoc;
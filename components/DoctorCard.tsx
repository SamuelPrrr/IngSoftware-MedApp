import { View, Text, TouchableOpacity, Image } from 'react-native';
import { icons } from '@/constants';

type DoctorCardProps = {
  doctor: {
    id: string;
    name: string;
    specialty: string;
    horaInicio: string;
    horaFin: string;
    imageUrl?: string;
    sexo: 'Masculino' | 'Femenino'; // Acepta texto completo
  };
  isSelected?: boolean;
  onPress?: () => void;
  showSchedule?: boolean;
};

const DoctorCard = ({ 
  doctor, 
  isSelected = false, 
  onPress, 
  showSchedule = true 
}: DoctorCardProps) => {
  // Determinar título e ícono según sexo (ahora con texto completo)
  const titulo = doctor.sexo === 'Femenino' ? 'Dra.' : 'Dr.';
  const iconoDoctor = doctor.sexo === 'Femenino' ? icons.doctorFemale : icons.doctorMale;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 mb-2 rounded-lg border-2 ${
        isSelected ? 'border-terciary bg-black-200' : 'border-gray-700'
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        {/* Imagen del doctor */}
        <Image
          source={doctor.imageUrl ? { uri: doctor.imageUrl } : iconoDoctor}
          className="w-8 h-8 mr-3 mt-5"
          resizeMode="contain"
        />
        
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">
            {titulo} {doctor.name}
          </Text>
          <Text className="text-gray-400">{doctor.specialty}</Text>
          
          {showSchedule && (
            <View className="flex-row items-center mt-1">
              <Image 
                source={icons.clock} 
                className="w-4 h-4 mr-1" 
                style={{ tintColor: '#9CA3AF' }} 
              />
              <Text className="text-gray-400 text-sm">
                {doctor.horaInicio} - {doctor.horaFin}
              </Text>
            </View>
          )}
        </View>
        
        {isSelected && (
          <Image 
            source={icons.checkmark} 
            className="w-8 h-8 ml-2 mt-4" 
            resizeMode='contain'
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default DoctorCard;
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { icons } from '@/constants';

type PatientCardProps = {
    patient: {
      idUsuario: number;  
      nombre: string;     
      edad: number;
      sexo: string;     
      telefono: string;
      altura?: number;
      peso?: number;
      imageUrl?: string;
      correo?: string;    
    };
    isSelected?: boolean;
    onPress?: () => void;
    showDetails?: boolean;
  };

const PatientCard = ({ 
  patient, 
  isSelected = false, 
  onPress, 
  showDetails = true 
}: PatientCardProps) => {
  // Determinar título según sexo
  const titulo = patient.sexo === 'Femenino' ? 'Sra.' : 'Sr.';
  
  // Calcular IMC si hay datos de peso y altura
  const imc = patient.peso && patient.altura 
    ? (patient.peso / ((patient.altura / 100) ** 2)).toFixed(1)
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 mb-2 rounded-lg border-2 ${
        isSelected ? 'border-terciary bg-black-200' : 'border-gray-700'
      }`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        {/* Imagen del paciente */}
        <Image
          source={patient.imageUrl ? { uri: patient.imageUrl } : 
                  patient.sexo === 'Femenino' ? icons.profile : icons.profile}
          className="w-12 h-12 mr-3 rounded-full justify-center" 
          resizeMode="cover"
        />
        
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">
            {patient.nombre}
          </Text>

          <View className="flex-row items-center mt-1">
            <Image 
              source={icons.date} 
              className="w-4 h-4 mr-1" 
              style={{ tintColor: '#9CA3AF' }} 
            />
            <Text className="text-gray-400 text-sm mr-3">
              {patient.edad}
            </Text>
            
            {imc && (
              <>
                <Image 
                  source={icons.weight} 
                  className="w-4 h-4 mr-1" 
                  style={{ tintColor: '#9CA3AF' }} 
                />
                <Text className="text-gray-400 text-sm">
                  IMC: {imc}
                </Text>
              </>
            )}
          </View>
          
          {showDetails && (
            <View className="mt-2">
              <View className="flex-row items-center">
                <Image 
                  source={icons.phone} 
                  className="w-4 h-4 mr-1" 
                  style={{ tintColor: '#9CA3AF' }} 
                />
                <Text className="text-gray-400 text-sm">
                  {patient.telefono}
                </Text>
              </View>
              
              {patient.sexo && (
                <View className="flex-row items-center mt-1">
                  <Image 
                    source={icons.profile2} 
                    className="w-4 h-4 mr-1" 
                    style={{ tintColor: '#9CA3AF' }} 
                  />
                  <Text className="text-gray-400 text-sm">
                    Sexo: {patient.sexo} 
                  </Text>
                </View>
              )}
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

export default PatientCard;
import { View, Text, Image, ScrollView, StatusBar, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import AppointmentCard from '@/components/AppointmentCard';

type TabType = 'info' | 'medicamentos' | 'citas';
type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada';

interface User {
  nombre: string;
  correo: string;
  altura: string;
  peso: string;
  edad: string;
  sexo: string;
}

interface Appointment {
  id: string;
  fechaHora: string;
  medico: {
    nombre: string;
    especialidad: string;
    id: number;
  };
  estado: AppointmentStatus;
  motivo: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateData = async () => {
    if (!user) {
      Alert.alert('Error', 'Intentalo mas tarde');
      return;
    }
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de autenticación');
        return;
      }

      const response = await axios.get('http://localhost:8080/api/pacientes/profile', { 
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.error) {
        Alert.alert('Error', response.data.message);
        return;
      }

      setUser(response.data.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/pacientes/citas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mappedAppointments = response.data.data.map((cita: any) => ({
        id: cita.id.toString(),
        fechaHora: cita.fechaHora,
        medico: {
          nombre: cita.medico.nombre,
          especialidad: cita.medico.especialidad,
          id: cita.medico.id
        },
        estado: cita.estado.toLowerCase() as AppointmentStatus,
        motivo: cita.motivo
      }));
      
      setAppointments(mappedAppointments);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      await axios.put(
        `http://localhost:8080/api/pacientes/citas/${appointmentId}/confirmar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAppointments();
      Alert.alert('Éxito', 'Cita confirmada correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo confirmar la cita');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      await axios.put(
        `http://localhost:8080/api/pacientes/citas/${appointmentId}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAppointments();
      Alert.alert('Éxito', 'Cita cancelada correctamente');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cancelar la cita');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAppointments();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View className="w-full px-6 mt-6">
            {user ? (
              <View className="space-y-4">
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.mail} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Correo:</Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">{user.correo}</Text>
                </View>

                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image
                      source={user?.sexo === "Masculino" ? icons.male : icons.female} 
                      className="w-5 h-5 mr-2" 
                      resizeMode="contain"
                    />
                    <Text className="text-base font-medium text-gray-100">Sexo:</Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">{user.sexo}</Text>
                </View>

                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.foot} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Altura:</Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">
                    {user.altura || 'No especificado'}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.weight} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Peso:</Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">
                    {user.peso || 'No especificado'}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.date} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Edad:</Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">
                    {user.edad || 'No especificado'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-lg text-gray-400 text-center mt-8">Cargando información...</Text>
            )}
          </View>
        );
      case 'medicamentos':
        return (
          <View className="w-full px-10 mt-8 items-center">
            <View className="w-full max-w-md">
              <Text className="text-lg text-white font-medium text-center">Aquí irá la lista de medicamentos</Text>
            </View>
          </View>
        );
      case 'citas':
        return (
          <View className="w-full mt-4">
            {appointments.length === 0 ? (
              <Text className="text-gray-400 text-center mt-8">No tienes citas programadas</Text>
            ) : (
              appointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={{
                    id: appointment.id,
                    fechaHora: appointment.fechaHora,
                    medico: {  // Pass the full medico object
                      nombre: appointment.medico.nombre,
                      especialidad: appointment.medico.especialidad
                    },
                    estado: appointment.estado,
                    motivo: appointment.motivo
                  }}
                  onConfirm={() => handleConfirmAppointment(appointment.id)}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                />
              ))
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="items-center mt-6">
          <Image source={icons.profile} className="w-[100px] h-[100px]" resizeMode="contain" />
          <Text className="text-2xl text-white font-semibold mt-4">{user?.nombre || 'Usuario'}</Text>
        </View>

        <View className="flex-row justify-center mt-6 border-b border-gray-700 mx-4">
          <TouchableOpacity 
            className={`px-6 pb-3 ${activeTab === 'info' ? 'border-b-2 border-secondary' : ''}`}
            onPress={() => setActiveTab('info')}
          >
            <Text className={`text-lg ${activeTab === 'info' ? 'text-secondary font-semibold' : 'text-gray-400'}`}>
              Info.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`px-6 pb-3 ${activeTab === 'medicamentos' ? 'border-b-2 border-secondary' : ''}`}
            onPress={() => setActiveTab('medicamentos')}
          >
            <Text className={`text-lg ${activeTab === 'medicamentos' ? 'text-secondary font-semibold' : 'text-gray-400'}`}>
              Medicamentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`px-6 pb-3 ${activeTab === 'citas' ? 'border-b-2 border-secondary' : ''}`}
            onPress={() => setActiveTab('citas')}
          >
            <Text className={`text-lg ${activeTab === 'citas' ? 'text-secondary font-semibold' : 'text-gray-400'}`}>
              Citas
            </Text>
          </TouchableOpacity>
        </View>

        {renderContent()}

        <CustomButton 
          title="Actualizar datos"
          handlePress={updateData}
          containerStyles="mt-10 w-2/4 mx-auto"
          isLoading={isSubmitting}
        />
      </ScrollView>
      <StatusBar backgroundColor={'#161622'} />
    </SafeAreaView>
  );
};

export default Profile;
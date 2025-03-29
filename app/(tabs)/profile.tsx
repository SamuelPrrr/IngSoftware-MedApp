import { View, Text, Image, ScrollView, StatusBar, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';

type TabType = 'info' | 'medicamentos' | 'citas';

const Profile = () => {
  interface User {
    nombre: string;
    correo: string;
    altura: string;
    peso: string;
    edad: string;
    sexo: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const router = useRouter();

  //Botón
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateData = async () => {
      if (!user) {
        Alert.alert('Error', 'Intentalo mas tarde');
        return;
      }
  }
  

  useEffect(() => {
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
  
    fetchUserData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
  return (
    <View className="w-full px-6 mt-6">
      {user ? (
        <View className="space-y-4">
          {/* Fila 1: Correo y Sexo */}
          <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
            <View className="flex-row items-center">
              <Image
                source={icons.mail} 
                className="w-5 h-5 mr-2" 
                resizeMode="contain"
              />
              <Text className="text-base font-medium text-gray-100">Correo:</Text>
            </View>
            <Text className="text-base font-normal text-gray-300">{user.correo}</Text>
          </View>

          {/* Fila 2: Sexo */}
          <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
            <View className="flex-row items-center">
              <Image
                source={user?.sexo === "Masculino" ? icons.male : 
                  user?.sexo === "Femenino" ? icons.female : 
                  icons.male} 
                className="w-5 h-5 mr-2" 
                resizeMode="contain"
              />
              <Text className="text-base font-medium text-gray-100">Sexo:</Text>
            </View>
            <Text className="text-base font-normal text-gray-300">{user.sexo}</Text>
          </View>

          {/* Fila 3: Altura */}
          <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
            <View className="flex-row items-center">
              <Image
                source={icons.foot}  // Asegúrate de tener este icono
                className="w-5 h-5 mr-2" 
                resizeMode="contain"
              />
              <Text className="text-base font-medium text-gray-100">Altura:</Text>
            </View>
            <Text className="text-base font-normal text-gray-300">
              {user.altura || 'No especificado'}
            </Text>
          </View>

          {/* Fila 4: Peso */}
          <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
            <View className="flex-row items-center">
              <Image
                source={icons.weight}  // Asegúrate de tener este icono
                className="w-5 h-5 mr-2" 
                resizeMode="contain"
              />
              <Text className="text-base font-medium text-gray-100">Peso:</Text>
            </View>
            <Text className="text-base font-normal text-gray-300">
              {user.peso || 'No especificado'}
            </Text>
          </View>

          {/* Fila 5: Edad */}
          <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
            <View className="flex-row items-center">
              <Image
                source={icons.date}  // Asegúrate de tener este icono
                className="w-5 h-5 mr-2" 
                resizeMode="contain"
              />
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
          <View className="w-full px-10 mt-8 items-center">
            <View className="w-full max-w-md">
              <Text className="text-lg text-white font-medium text-center">Aquí irá el historial de citas</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Sección superior común (foto y nombre) */}
        <View className="items-center mt-6">
          <Image source={icons.profile} className="w-[100px] h-[100px]" resizeMode="contain" />
          <Text className="text-2xl text-white font-semibold mt-4">{user?.nombre || 'Usuario'}</Text>
        </View>

        {/* Nuevo NavBar de secciones - Centrado */}
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

        {/* Contenido dinámico según la pestaña seleccionada */}
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
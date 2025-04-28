import { View, Text, Image, ScrollView, StatusBar, Alert, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import AppointmentCardPac from '@/components/AppointmentCardPac';

type TabType = 'info' | 'medicamentos' | 'citas';
type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

interface User {
  nombre: string;
  correo: string;
  altura: string;
  peso: string;
  edad: string;
  sexo: string;
  direccion?: string;  // Añadir dirección
  idUsuario?: number;
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

interface MedicamentoRecetado {
  idMedicamentoEnReceta: number;
  medicamento: {
    idMedicamento: number;
    nombre: string;
    presentacion: string;
    tipo: string;
  };
  frecuencia: string;
  numeroDias: number;
  cantidadDosis: string;
  dosisActual: number;
  numDosis: number;
  receta: {
    idReceta: number;
    anotaciones: string;
    cita: {
      idCita: number;
      fechaHora: string;
      estado: string;
    };
  };
  proximaDosis?: string;
  tiempoRestante?: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicamentos, setMedicamentos] = useState<MedicamentoRecetado[]>([]);
  const [activeMedicamento, setActiveMedicamento] = useState<number | null>(null);
  const [timers, setTimers] = useState<Record<number, NodeJS.Timeout>>({});
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
  altura: '',
  peso: '',
  edad: '',
  direccion: ''
});

  // 1. Función para obtener y guardar el ID del usuario
  const getUserId = async (): Promise<number> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/pacientes/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.data?.idUsuario) {
        throw new Error("ID de usuario no encontrado en la respuesta");
      }

      await AsyncStorage.setItem('userId', response.data.data.idUsuario.toString());
      return response.data.data.idUsuario;
    } catch (error) {
      console.error('Error al obtener ID:', error);
      throw error;
    }
  };

  // 2. Cargar datos del usuario
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/pacientes/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.data);
      console.log("Datos de usuario cargados:", response.data.data);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    }
  };

  // 3. Cargar citas
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
        estado: cita.estado as AppointmentStatus,
        motivo: cita.motivo
      }));
      
      setAppointments(mappedAppointments);
    } catch (error: any) {
      console.error('Error al cargar citas:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al cargar citas');
    }
  };

  // 4. Cargar medicamentos (con useCallback para evitar recreación)
  const fetchMedicamentos = useCallback(async () => {
    try {
      const userId = await getUserId();
      console.log("ID obtenido para medicamentos:", userId);
      
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:8080/api/recetas/paciente/${userId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("Respuesta de medicamentos:", response.data);
      
      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const medicamentosConTemporizador = response.data.data.map((med: any) => ({
        ...med,
        proximaDosis: calcularProximaDosis(med.frecuencia),
        tiempoRestante: calcularTiempoRestante(med.frecuencia)
      }));
      
      setMedicamentos(medicamentosConTemporizador);
      iniciarTemporizadores(medicamentosConTemporizador);
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
      Alert.alert('Error', 'No se pudieron cargar los medicamentos');
    }
  }, []);

  // 5. Funciones auxiliares para medicamentos
  const calcularProximaDosis = (frecuencia: string): string => {
    const [horas] = frecuencia.split(':').map(Number);
    const ahora = new Date();
    ahora.setHours(ahora.getHours() + horas);
    return ahora.toISOString();
  };

  const calcularTiempoRestante = (frecuencia: string): string => {
    const [horas] = frecuencia.split(':').map(Number);
    const ahora = new Date();
    const proxima = new Date(ahora);
    proxima.setHours(ahora.getHours() + horas);
    
    const diff = proxima.getTime() - ahora.getTime();
    const horasRestantes = Math.floor(diff / (1000 * 60 * 60));
    const minutosRestantes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horasRestantes}h ${minutosRestantes}m`;
  };

  const iniciarTemporizadores = (meds: MedicamentoRecetado[]) => {
    Object.values(timers).forEach(clearInterval);
    
    const nuevosTimers: Record<number, NodeJS.Timeout> = {};
    
    meds.forEach(med => {
      const timer = setInterval(() => {
        setMedicamentos(prev => prev.map(m => 
          m.idMedicamentoEnReceta === med.idMedicamentoEnReceta
            ? { ...m, tiempoRestante: calcularTiempoRestante(m.frecuencia) }
            : m
        ));
      }, 60000);
      
      nuevosTimers[med.idMedicamentoEnReceta] = timer;
    });
    
    setTimers(nuevosTimers);
  };

  // 6. Registrar dosis tomada
  const registrarDosisTomada = async (idMedicamentoRecetado: number) => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.put(
        `http://localhost:8080/api/recetas/${idMedicamentoRecetado}/dosis`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.error) {
        throw new Error(response.data.message);
      }
      
      setMedicamentos(prev => prev.map(med => 
        med.idMedicamentoEnReceta === idMedicamentoRecetado
          ? { 
              ...med, 
              dosisActual: med.dosisActual + 1,
              proximaDosis: calcularProximaDosis(med.frecuencia),
              tiempoRestante: calcularTiempoRestante(med.frecuencia)
            }
          : med
      ));
      
      Alert.alert('Éxito', 'Dosis registrada correctamente');
    } catch (error) {
      console.error('Error al registrar dosis:', error);
      Alert.alert('Error', 'No se pudo registrar la dosis');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. Efecto principal para carga inicial
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUserData();
        await fetchAppointments();
        await fetchMedicamentos();
      } catch (error) {
        console.error('Error en carga inicial:', error);
      }
    };
    
    loadData();

    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, [fetchMedicamentos]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.put(
        `http://localhost:8080/api/pacientes/citas/${appointmentId}/estado`,
        null,
        {
          params: { nuevoEstado: 'CONFIRMADA' }, // Mayúsculas para coincidir con el enum
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === appointmentId 
              ? { ...appointment, estado: 'CONFIRMADA' } 
              : appointment
          )
        );
        Alert.alert('Éxito', 'Cita confirmada correctamente');
      }
    } catch (error: any) { // Especificamos el tipo 'any' para evitar el error
      console.error('Error al confirmar cita:', error);
      const errorMessage = error.response?.data?.message || 'Error al confirmar la cita';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancelAppointment = async (appointmentId: string) => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.put(
        `http://localhost:8080/api/pacientes/citas/${appointmentId}/estado`,
        null,
        {
          params: { nuevoEstado: 'CANCELADA' }, // Mayúsculas para coincidir con el enum
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === appointmentId 
              ? { ...appointment, estado: 'CANCELADA' } 
              : appointment
          )
        );
        Alert.alert('Éxito', 'Cita cancelada correctamente');
      }
    } catch (error: any) { // Especificamos el tipo 'any' para evitar el error
      console.error('Error al cancelar cita:', error);
      const errorMessage = error.response?.data?.message || 'Error al cancelar la cita';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const updateData = async () => {
    if (!user) {
      Alert.alert('Error', 'Intentalo más tarde');
      return;
    }
  
    if (!isEditing) {
      // Entrar en modo edición
      setIsEditing(true);
      setEditedData({
        altura: user.altura || '',
        peso: user.peso || '',
        edad: user.edad || '',
        direccion: user.direccion || ''
      });
      return;
    }
  
    // Enviar datos actualizados
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.put(
        'http://localhost:8080/api/pacientes/actualizar-datos',
        editedData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.error) {
        throw new Error(response.data.message);
      }
  
      // Actualizar el estado del usuario con los nuevos datos
      setUser(prev => prev ? {
        ...prev,
        altura: editedData.altura,
        peso: editedData.peso,
        edad: editedData.edad,
        direccion: editedData.direccion
      } : null);
  
      Alert.alert('Éxito', 'Datos actualizados correctamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      Alert.alert('Error', 'No se pudieron actualizar los datos');
    } finally {
      setIsSubmitting(false);
    }
  };

  //Renderizado de contenido
  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View className="w-full px-6 mt-6">
            {user ? (
              <View className="space-y-4">
                {/* Campo Correo (no editable) */}
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.mail} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Correo:</Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">{user.correo}</Text>
                </View>
      
                {/* Campo Sexo (no editable) */}
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
      
                {/* Campo Altura (editable) */}
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.foot} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Altura (cm):</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      className="text-base font-normal text-gray-300 bg-black-300 px-2 py-1 rounded w-20 text-right"
                      value={editedData.altura}
                      onChangeText={(text: any) => setEditedData({...editedData, altura: text})}
                      placeholder="Ej. 175"
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text className="text-base font-normal text-gray-300">
                      {user.altura ? `${user.altura} cm` : 'No especificado'}
                    </Text>
                  )}
                </View>
      
                {/* Campo Peso (editable) */}
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.weight} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Peso (kg):</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      className="text-base font-normal text-gray-300 bg-black-300 px-2 py-1 rounded w-20 text-right"
                      value={editedData.peso}
                      onChangeText={(text) => setEditedData({...editedData, peso: text})}
                      placeholder="Ej. 70"
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text className="text-base font-normal text-gray-300">
                      {user.peso ? `${user.peso} kg` : 'No especificado'}
                    </Text>
                  )}
                </View>
      
                {/* Campo Edad (editable) */}
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.date} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Edad:</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      className="text-base font-normal text-gray-300 bg-black-300 px-2 py-1 rounded w-20 text-right"
                      value={editedData.edad}
                      onChangeText={(text) => setEditedData({...editedData, edad: text})}
                      placeholder="Ej. 30"
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text className="text-base font-normal text-gray-300">
                      {user.edad ? `${user.edad} años` : 'No especificado'}
                    </Text>
                  )}
                </View>
      
                {/* Campo Dirección (editable) */}
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image source={icons.date} className="w-5 h-5 mr-2" resizeMode="contain" />
                    <Text className="text-base font-medium text-gray-100">Dirección:</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      className="text-base font-normal text-gray-300 bg-black-300 px-2 py-1 rounded flex-1 ml-2"
                      value={editedData.direccion}
                      onChangeText={(text) => setEditedData({...editedData, direccion: text})}
                      placeholder="Ej. Calle Principal 123"
                      multiline
                    />
                  ) : (
                    <Text className="text-base font-normal text-gray-300 flex-1 text-right">
                      {user.direccion || 'No especificado'}
                    </Text>
                  )}
                </View>
      
                {/* Botón de acción */}
                <View className="flex-row justify-center space-x-4 mt-6">
                  {isEditing ? (
                    <>
                      <CustomButton 
                        title="Cancelar"
                        handlePress={() => setIsEditing(false)}
                        containerStyles="w-1/3 bg-gray-500"
                        textStyles="text-white"
                      />
                      <CustomButton 
                        title="Guardar"
                        handlePress={updateData}
                        containerStyles="w-1/3"
                        isLoading={isSubmitting}
                      />
                    </>
                  ) : (
                    <CustomButton 
                      title="Editar datos"
                      handlePress={() => {
                        setIsEditing(true);
                        setEditedData({
                          altura: user.altura || '',
                          peso: user.peso || '',
                          edad: user.edad || '',
                          direccion: user.direccion || ''
                        });
                      }}
                      containerStyles="w-2/4 mx-auto"
                    />
                  )}
                </View>
              </View>
            ) : (
              <Text className="text-lg text-gray-400 text-center mt-8">Cargando información...</Text>
            )}
          </View>
        );

      case 'medicamentos':
        return (
          <View className="w-full px-4 mt-4">
            {medicamentos.length === 0 ? (
              <Text className="text-gray-400 text-center mt-8">No tienes medicamentos recetados</Text>
            ) : (
              <ScrollView className="mb-20">
                {medicamentos.map(med => (
                  <View 
                    key={med.idMedicamentoEnReceta} 
                    className={`bg-black-200 p-4 rounded-lg mb-3 ${activeMedicamento === med.idMedicamentoEnReceta ? 'border-2 border-terciary' : ''}`}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-lg font-semibold text-white">{med.medicamento.nombre}</Text>
                      <Text className="text-gray-300">{med.medicamento.presentacion}</Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-400">Tipo:</Text>
                      <Text className="text-white">{med.medicamento.tipo}</Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-400">Frecuencia:</Text>
                      <Text className="text-white">Cada {med.frecuencia.split(':')[0]} horas</Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-400">Próxima dosis:</Text>
                      <Text className="text-white">{med.tiempoRestante}</Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-400">Progreso:</Text>
                      <Text className="text-white">{med.dosisActual} / {med.numDosis} dosis</Text>
                    </View>
                    
                    <CustomButton
                      title="Registrar dosis tomada"
                      handlePress={() => registrarDosisTomada(med.idMedicamentoEnReceta)}
                      containerStyles="mt-2"
                      isLoading={isSubmitting}
                    />
                    
                    {med.dosisActual >= med.numDosis && (
                      <Text className="text-green-500 text-center mt-2">¡Tratamiento completado!</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        );

      case 'citas':
        return (
          <View className="w-full mt-4">
            {appointments.length === 0 ? (
              <Text className="text-gray-400 text-center mt-8">No tienes citas programadas</Text>
            ) : (
              appointments.map(appointment => (
                <AppointmentCardPac
                  key={appointment.id}
                  appointment={{
                    id: appointment.id,
                    fechaHora: appointment.fechaHora,
                    medico: {
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
            className={`px-6 pb-3 ${activeTab === 'info' ? 'border-b-2 border-terciary' : ''}`}
            onPress={() => setActiveTab('info')}
          >
            <Text className={`text-lg ${activeTab === 'info' ? 'text-terciary font-semibold' : 'text-gray-400'}`}>
              Info.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`px-6 pb-3 ${activeTab === 'medicamentos' ? 'border-b-2 border-terciary' : ''}`}
            onPress={() => setActiveTab('medicamentos')}
          >
            <Text className={`text-lg ${activeTab === 'medicamentos' ? 'text-terciary font-semibold' : 'text-gray-400'}`}>
              Medicamentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={`px-6 pb-3 ${activeTab === 'citas' ? 'border-b-2 border-terciary' : ''}`}
            onPress={() => setActiveTab('citas')}
          >
            <Text className={`text-lg ${activeTab === 'citas' ? 'text-terciary font-semibold' : 'text-gray-400'}`}>
              Citas
            </Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </ScrollView>
      <StatusBar backgroundColor={'#161622'} />
    </SafeAreaView>
  );
};

export default Profile;
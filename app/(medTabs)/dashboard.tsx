import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, TextInput, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { icons } from '@/constants';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PatientCard from '@/components/PatientCard';


type Cita = {
  id: string;
  fechaHora: string;
  paciente: {
    nombre: string;
    sexo: string;
    id: number;
  };
  estado: string;
  motivo?: string;
};

type Horario = {
  idHorario: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
};

type Paciente = {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string;
  sexo: string;
  edad: number
  altura?: number;
  peso?: number;
  imageUrl?: string;
}

const DoctorDashboard = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'citas' | 'pacientes' | 'horarios'>('citas');
  const [citas, setCitas] = useState<Cita[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoHorario, setNuevoHorario] = useState({
    diaSemana: 'LUNES',
    horaInicio: '08:00',
    horaFin: '17:00'
  });
  
  //Lo ponemos en arreglo
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  // Obtener citas del médico
  const fetchCitas = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/medicos/citas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        setCitas(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
    }
  };

  // Obtener horarios del médico
  const fetchHorarios = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/medicos/get/horarios', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        setHorarios(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los horarios');
    }
  };

  const fetchPacientes = async ()=> {
      try{
        const token = await AsyncStorage.getItem('authToken');
        const response = await axios.get('http://localhost:8080/api/medicos/pacientes', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if(response.data.error){
          Alert.alert('Error', response.data.message);
        } else {
          setPacientes(response.data);
        }
      console.log(response.data)
      } catch (error){
        console.log(error);
      }
  };
 
  // Confirmar cita y redirigir a receta médica (Falta esto)
  const confirmarCita = (citaId: string) => {
    //router.push(`/receta-medica?citaId=${citaId}`);
  };

  // Agregar nuevo horario
  const agregarHorario = async () => {
    if (!nuevoHorario.horaInicio || !nuevoHorario.horaFin) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:8080/api/medicos/post/horarios',
        nuevoHorario,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        Alert.alert('Éxito', 'Horario agregado correctamente');
        setShowModal(false);
        setNuevoHorario({ diaSemana: 'LUNES', horaInicio: '08:00', horaFin: '17:00' });
        fetchHorarios();
      }
    } catch (error) {
      console.error('Error al agregar horario:', error);
      Alert.alert('Error', 'No se pudo agregar el horario');
    }
  };

  // Eliminar horario
  const eliminarHorario = async (diaSemana: string) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de eliminar el horario del ${formatearDia(diaSemana)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await axios.delete(
                'http://localhost:8080/api/medicos/delete/horarios',
                {
                  headers: { Authorization: `Bearer ${token}` },
                  data: { diaSemana }
                }
              );

              if (response.data.error) {
                Alert.alert('Error', response.data.message);
              } else {
                Alert.alert('Éxito', response.data.message);
                fetchHorarios();
              }
            } catch (error) {
              console.error('Error al eliminar horario:', error);
              Alert.alert('Error', 'No se pudo eliminar el horario');
            }
          }
        }
      ]
    );
  };

  

  useEffect(() => {
    if (activeSection === 'citas') {
      fetchCitas();
    } else if (activeSection === 'horarios') {
      fetchHorarios();
    } else if(activeSection === 'pacientes'){
      fetchPacientes();
    }
  }, [activeSection]);

  const formatearDia = (dia: string) => {
    const dias: Record<string, string> = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIÉRCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SÁBADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return dias[dia] || dia;
  };

  const formatearFecha = (fechaHora: string) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <StatusBar backgroundColor="#161622" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2 bg-secondary">
        <Text className="text-xl text-white font-bold">Panel Médico</Text>
        <Image source={icons.profile} className="w-8 h-8" />
      </View>

      {/* Menú de navegación */}
      <View className="border-b border-gray-700">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="py-2"
        >
          {['citas', 'horarios', 'pacientes'].map((section) => (
            <TouchableOpacity
              key={section}
              className={`px-4 py-2 mx-1 ${activeSection === section ? 'border-b-2 border-terciary' : ''}`}
              onPress={() => setActiveSection(section as any)}
            >
              <Text className={`text-base ${activeSection === section ? 'text-terciary font-semibold' : 'text-gray-400'}`}>
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenido principal */}
      <ScrollView className="flex-1 px-4 pt-2">
        {activeSection === 'citas' && (
          <View>
            <Text className="text-white text-lg mb-2">Próximas citas</Text>
            {citas.length === 0 ? (
              <Text className="text-gray-400 text-center my-4">No hay citas programadas</Text>
            ) : (
              citas.map((cita) => (
                <View key={cita.id} className="bg-black-200 p-4 rounded-lg mb-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-white font-semibold">
                        {cita.paciente.nombre}
                      </Text>
                      <Text className="text-gray-400">
                        {formatearFecha(cita.fechaHora)}
                      </Text>
                      <Text className="text-gray-400">
                        Motivo: {cita.motivo || 'No especificado'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      className="bg-terciary px-4 py-2 rounded-lg"
                      onPress={() => confirmarCita(cita.id)}
                    >
                      <Text className="text-black font-semibold">Terminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        
        {activeSection === 'horarios' && (
          <View className="mt-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg">Mis Horarios</Text>
              <TouchableOpacity 
                className="bg-terciary px-4 py-2 rounded-lg"
                onPress={() => setShowModal(true)}
              >
                <Text className="text-black">Agregar Horario</Text>
              </TouchableOpacity>
            </View>

            {horarios.length === 0 ? (
              <Text className="text-gray-400 text-center my-4">No hay horarios registrados</Text>
            ) : (
              horarios.map((horario) => (
                <View key={horario.idHorario} className="bg-black-200 p-4 rounded-lg mb-3">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white font-semibold">
                        {formatearDia(horario.diaSemana)}
                      </Text>
                      <Text className="text-gray-400">
                        {horario.horaInicio} - {horario.horaFin}
                      </Text>
                      <Text className={`mt-1 ${horario.disponible ? 'text-terciary' : 'text-error'}`}>
                        {horario.disponible ? 'Disponible' : 'No disponible'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => eliminarHorario(horario.diaSemana)}
                      className="bg-error p-2 rounded-full"
                    >
                      <Image source={icons.close} className="w-4 h-4" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeSection === 'pacientes' && (
  <View className="mt-1">
    <Text className="text-white text-lg font-bold mb-4">Mis Pacientes</Text>
    
    {pacientes.length === 0 ? (
      <Text className="text-gray-400 text-center my-4">No hay pacientes registrados</Text>) : (
        pacientes.map((paciente) => (
        <PatientCard 
          key={paciente.idUsuario}
          patient={paciente}
          //onPress={() => router.push(`/paciente-detalle/${paciente.idUsuario}`)}
        />
      ))
    )}
  </View>
    )}
      </ScrollView>

      {/* Modal para agregar nuevo horario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-primary p-6 rounded-lg w-11/12 border border-gray-600"> 
            <Text className="text-white text-lg font-bold mb-4">Agregar Nuevo Horario</Text>
            
            <Text className="text-gray-200 mb-2">Día de la semana:</Text> 
            <View className="bg-gray-700 rounded-lg mb-4 overflow-hidden"> 
              <Picker
                selectedValue={nuevoHorario.diaSemana}
                onValueChange={(itemValue) => setNuevoHorario({...nuevoHorario, diaSemana: itemValue})}
                style={{ color: 'white' }}
                dropdownIconColor="white"
                mode="dropdown"
              >
                {['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'].map((dia, index) => (
                  <Picker.Item 
                    key={dia}
                    label={['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][index]}
                    value={dia}
                    color="white"
                  />
                ))}
              </Picker>
            </View>

            <Text className="text-gray-200 mb-2">Hora de inicio:</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-4 border border-gray-600"
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF" 
              value={nuevoHorario.horaInicio}
              onChangeText={(text) => setNuevoHorario({...nuevoHorario, horaInicio: text})}
            />

            <Text className="text-gray-200 mb-2">Hora de fin:</Text>
            <TextInput
              className="bg-gray-700 text-white p-3 rounded-lg mb-6 border border-gray-600"
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF"
              value={nuevoHorario.horaFin}
              onChangeText={(text) => setNuevoHorario({...nuevoHorario, horaFin: text})}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-error px-6 py-2 rounded-lg" 
                onPress={() => setShowModal(false)}
              >
                <Text className="text-black font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-terciary px-6 py-2 rounded-lg"
                onPress={agregarHorario}
              >
                <Text className="text-black font-semibold">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DoctorDashboard;
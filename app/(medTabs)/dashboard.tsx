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
  edad: number;
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
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryCitas, setSearchQueryCitas] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  // Función para eliminar pacientes duplicados
  const eliminarDuplicados = (pacientes: Paciente[]): Paciente[] => {
    const pacientesUnicos: Paciente[] = [];
    const idsUnicos = new Set<number>();

    pacientes.forEach(paciente => {
      if (!idsUnicos.has(paciente.idUsuario)) {
        idsUnicos.add(paciente.idUsuario);
        pacientesUnicos.push(paciente);
      }
    });

    return pacientesUnicos;
  };

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

  const fetchAllPacientes = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/medicos/pacientes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        const allPacientes = response.data.data || response.data;
        const pacientesUnicos = eliminarDuplicados(allPacientes);
        
        if (searchQuery.length > 0) {
          const filtered = pacientesUnicos.filter((paciente: Paciente) =>
            paciente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            paciente.telefono.includes(searchQuery)
          );
          setPacientes(filtered);
        } else {
          setPacientes(pacientesUnicos);
        }
      }
    } catch (error) {
      console.error('Error al obtener todos los pacientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
      setPacientes([]);
    }
  };

  const fetchPacientesByMedico = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/medicos/citas/pacientes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.error) {
        Alert.alert('Error', response.data.message);
      } else {
        const pacientesUnicos = eliminarDuplicados(response.data.data);
        setPacientes(pacientesUnicos);
      }
    } catch (error) {
      console.error('Error al obtener pacientes del médico:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
      setPacientes([]);
    }
  };

  // Filtrar citas basado en la búsqueda
  const filteredCitas = citas.filter(cita =>
    cita.paciente.nombre.toLowerCase().includes(searchQueryCitas.toLowerCase()) ||
    cita.motivo?.toLowerCase().includes(searchQueryCitas.toLowerCase()) ||
    cita.estado.toLowerCase().includes(searchQueryCitas.toLowerCase())
  );

  // Confirmar cita y redirigir a receta médica
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
    } else if (activeSection === 'pacientes') {
      if (searchQuery.length > 0) {
        setSearchMode(true);
        fetchAllPacientes();
      } else {
        setSearchMode(false);
        fetchPacientesByMedico();
      }
    }
  }, [activeSection, searchQuery]);

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
          <View className='mt-4'>
            <View className='flex-row items-center justify-between mb-4'>
              <Text className="text-white text-xl font-bold">Próximas citas</Text>
              {/* Search Bar para citas */}
              <View className="bg-white rounded-full flex-1 ml-4 border border-gray-300">
                <View className="flex-row items-center px-4 py-2">
                  <Image 
                    source={icons.search} 
                    className="w-4 h-4 mr-2" 
                    style={{ tintColor: '#6B7280' }}
                  />
                  <TextInput
                    placeholder="Buscar cita..."
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 flex-1"
                    value={searchQueryCitas}
                    onChangeText={setSearchQueryCitas}
                  />
                  {searchQueryCitas && (
                    <TouchableOpacity onPress={() => setSearchQueryCitas('')}>
                      <Image 
                        source={icons.close} 
                        className="w-4 h-4" 
                        style={{ tintColor: '#6B7280' }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            
            {filteredCitas.length === 0 ? (
              <Text className="text-gray-400 text-center my-4">
                {searchQueryCitas ? 'No se encontraron citas' : 'No hay citas programadas'}
              </Text>
            ) : (
              filteredCitas.map((cita) => (
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
                      <Text className={`text-sm ${
                      cita.estado === 'CONFIRMADA' ? 'text-terciary' :
                      cita.estado === 'COMPLETADA' ? 'text-gray-500' :
                      cita.estado === 'CANCELADA' ? 'text-error' : 'text-yellow-500'
                    }`}>
                      Estado: {cita.estado}
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
                onPress={() => {
                  if (horarios.length > 0) {
                    Alert.alert(
                      'Advertencia',
                      'Si agregas un nuevo horario para un día existente, el horario anterior será reemplazado automáticamente.',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Continuar', onPress: () => setShowModal(true) },
                      ]
                    );
                  } else {
                    setShowModal(true);
                  }
                }}
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
          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-xl font-bold">
                {searchMode ? 'Todos' : 'Mis Pacientes'}
              </Text>
              
              {/* Search Bar */}
              <View className="bg-white rounded-full flex-1 ml-4 border border-gray-300">
                <View className="flex-row items-center px-4 py-2">
                  <Image 
                    source={icons.search} 
                    className="w-4 h-4 mr-2" 
                    style={{ tintColor: '#6B7280' }}
                  />
                  <TextInput
                    placeholder="Buscar paciente..."
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-800 flex-1"
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      if (text.length > 0) {
                        setSearchMode(true);
                      } else {
                        setSearchMode(false);
                      }
                    }}
                  />
                  {searchQuery && (
                    <TouchableOpacity onPress={() => {
                      setSearchQuery('');
                      setSearchMode(false);
                      fetchPacientesByMedico();
                    }}>
                      <Image 
                        source={icons.close} 
                        className="w-4 h-4" 
                        style={{ tintColor: '#6B7280' }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Lista de pacientes */}
            {pacientes.length === 0 ? (
              <View className="bg-white rounded-lg p-6 border border-gray-200">
                <Text className="text-gray-500 text-center">
                  {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </Text>
              </View>
            ) : (
              pacientes.map((paciente) => (
                <PatientCard 
                  key={`patient-${paciente.idUsuario}`}
                  patient={{
                    idUsuario: paciente.idUsuario,
                    nombre: paciente.nombre,
                    edad: paciente.edad || 0,
                    sexo: paciente.sexo,
                    telefono: paciente.telefono,
                    altura: paciente.altura,
                    peso: paciente.peso
                  }}
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
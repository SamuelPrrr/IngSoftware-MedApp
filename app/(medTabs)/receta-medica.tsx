import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, Alert, ActivityIndicator, TextInput, TouchableOpacity, BackHandler, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '@/components/CustomButton';
import MedicamentoCard from '@/components/MedicamentoCard';
import { useFocusEffect } from '@react-navigation/native';

type Usuario = {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string;
  sexo: string;
};

type Paciente = Usuario & {
  altura: number | null;
  peso: number | null;
  edad: number | null;
  direccion: string | null;
};

type Medico = Usuario & {
  especialidad: string;
};

type Cita = {
  idCita: number;
  paciente: Paciente;
  medico: Medico;
  fechaHora: string;
  estado: string;
  motivo: string;
  fechaCreacion: string;
  duracion: number;
};

type Receta = {
  idReceta: number;
  anotaciones: string;
  cita: {
    idCita: number;
  };
  medicamentos?: MedicamentoRecetado[];
};

type Medicamento = {
  id: number;
  nombre: string;
  presentacion: string;
  tipo: string;
};

type MedicamentoRecetado = {
  idMedicamentoRecetado: number;
  cantidadDosis: string;
  frecuencia: string;
  numeroDias: number;
  medicamento: {
    idMedicamento: number;
    nombre: string;
    presentacion: string;
    tipo?: string; // Opcional si existe
  };
  // Estos campos son opcionales según tu respuesta
  dosisActual?: number;
  numDosis?: number;
};

const RecetaMedicaScreen = () => {
  const { citaId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [cita, setCita] = useState<Cita | null>(null);
  const [receta, setReceta] = useState<Receta | null>(null);
  const [anotaciones, setAnotaciones] = useState('');
  const [medicamentos, setMedicamentos] = useState<MedicamentoRecetado[]>([]);
  const [medicamentosDisponibles, setMedicamentosDisponibles] = useState<Medicamento[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el modal de medicamentos
  const [isMedModalVisible, setIsMedModalVisible] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<Medicamento | null>(null);
  const [frecuencia, setFrecuencia] = useState("08:00");
  const [numeroDias, setNumeroDias] = useState("7");
  const [cantidadDosis, setCantidadDosis] = useState("1 tableta");

  // Prevenir volver atrás sin guardar receta
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!receta) {
          Alert.alert('Advertencia', 'Debes guardar la receta antes de salir');
          return true;
        }
        return false;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [receta])
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Error', 'Sesión expirada');
          router.replace('/(auth)/sign-in');
          return;
        }
  
        // Obtener datos de la cita
        const citaResponse = await axios.get<{
          error: boolean;
          data: Cita;
        }>(`http://localhost:8080/api/medicos/citas/${citaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setCita(citaResponse.data.data);
  
        // Obtener medicamentos disponibles
        const medsResponse = await axios.get<{
          error: boolean;
          data: Medicamento[];
        }>('http://localhost:8080/api/medicamentos', {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        console.log('Medicamentos recibidos:', medsResponse.data.data);

        
        setMedicamentosDisponibles(medsResponse.data.data || []);
  
      } catch (error) {
        console.error('Error:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            Alert.alert('Error', 'Sesión expirada');
            router.replace('/(auth)/sign-in');
          } else {
            Alert.alert('Error', 'No se pudieron cargar los datos');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [citaId]);

  const crearReceta = async () => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Sesión expirada');
        router.replace('/(auth)/sign-in');
        return;
      }
  
      // Asegurarnos de que citaId es un número
      const idCita = Number(citaId);
      if (isNaN(idCita)) {
        throw new Error('ID de cita inválido');
      }
  
      const response = await axios.post<{
        error: boolean;
        data: {
          idReceta: number;
          idCita: number;
          anotaciones: string;
          cantidadMedicamentos: number;
        };
        message: string;
      }>(
        `http://localhost:8080/api/recetas?idCita=${idCita}&anotaciones=${encodeURIComponent(anotaciones || 'Receta médica')}`,
        {}, // Body vacío ya que todo va en los query params
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
  
      // Crear objeto Receta con la estructura esperada
      const nuevaReceta: Receta = {
        idReceta: response.data.data.idReceta,
        anotaciones: response.data.data.anotaciones,
        cita: {
          idCita: response.data.data.idCita
        },
        medicamentos: []
      };
  
      setReceta(nuevaReceta);
      Alert.alert('Éxito', 'Receta creada exitosamente');
    } catch (error) {
      console.error('Error creando receta:', error);
      
      let errorMessage = 'No se pudo crear la receta';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
  
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const agregarMedicamentoModal = (medicamento: Medicamento) => {
    setSelectedMedicamento(medicamento);
    setIsMedModalVisible(true);
  };

  const agregarMedicamento = async () => {
    if (!selectedMedicamento || !selectedMedicamento.id || !receta?.idReceta) {
      Alert.alert('Error', 'Datos incompletos para agregar medicamento');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Sesión expirada');
        return;
      }
  
      // Validación reforzada
      if (!frecuencia || !numeroDias || !cantidadDosis) {
        throw new Error('Todos los campos son requeridos');
      }
  
      const dias = Number(numeroDias);
      if (isNaN(dias) || dias <= 0) {
        throw new Error('Número de días debe ser mayor a 0');
      }
  
      // Formatear frecuencia (asegurar HH:mm)
      const tiempoFormateado = frecuencia.includes(':') 
        ? frecuencia 
        : `${frecuencia.padStart(4, '0').substring(0, 2)}:${frecuencia.padStart(4, '0').substring(2)}`;
  
      const { data } = await axios.post<{
        error: boolean;
        message: string;
        data: MedicamentoRecetado;
      }>(`http://localhost:8080/api/recetas/${receta.idReceta}/medicamentos`, {
        idMedicamento: selectedMedicamento.id,
        frecuencia: tiempoFormateado,
        numeroDias: dias,
        cantidadDosis
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

  
      // Manejo de respuesta exitosa pero con error en estructura
      if (data.error || !data.data) {
        throw new Error(data.message || 'Error al procesar la respuesta');
      }
  
      // Actualizar estado optimista
      setMedicamentos(prev => [...prev, {
        ...data.data,
        medicamento: {
          ...data.data.medicamento,
          // Asegurar compatibilidad con tu tipo Medicamento
          presentacion: data.data.medicamento.presentacion || selectedMedicamento.presentacion,
          tipo: data.data.medicamento.tipo || selectedMedicamento.tipo
        }
      }]);
  
      Alert.alert('Éxito', data.message || 'Medicamento agregado correctamente');
      
      // Resetear modal
      setIsMedModalVisible(false);
      setFrecuencia("08:00");
      setNumeroDias("7");
      setCantidadDosis("1 tableta");
  
    } catch (error) {
      console.error('Error detallado:', {
        error,
        response: axios.isAxiosError(error) ? error.response?.data : null
      });
  
      // Filtrar mensajes de éxito que vienen como error
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? (error.message.includes('exitosamente') 
            ? 'Medicamento agregado' 
            : error.message)
          : 'Error desconocido';
  
      if (!errorMessage.includes('exitosamente')) {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const eliminarMedicamento = async (id: number) => {
    if (!receta) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      await axios.delete(
        `http://localhost:8080/api/recetas/${receta.idReceta}/medicamentos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMedicamentos(prev => prev.filter(m => m.idMedicamentoRecetado !== id));
    } catch (error) {
      console.error('Error eliminando medicamento:', error);
      Alert.alert('Error', 'No se pudo eliminar el medicamento');
    }
  };

  const guardarReceta = async () => {
    if (!receta || !citaId) {
      Alert.alert('Error', 'Datos incompletos para guardar');
      return;
    }
  
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Sesión expirada');
      }
  
    const response = await axios.put(
      `http://localhost:8080/api/medicos/citas/${citaId}/estado?nuevoEstado=COMPLETADA`,
      {}, // Body vacío
      { 
        headers: { 
          Authorization: `Bearer ${token}`
        }
      }
    );
  
      // 3. Navegar solo después de ambas operaciones exitosas
      Alert.alert('Éxito', 'Receta guardada y cita completada');
      router.replace('/(medTabs)/dashboard');
  
    } catch (error) {
      console.error('Error completo:', {
        error,
        response: axios.isAxiosError(error) ? error.response?.data : null
      });
  
      let errorMessage = 'No se pudo guardar la receta';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <SafeAreaView className="bg-primary h-full">
        <ActivityIndicator size="large" color="#62A8E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4">
        <Text className="text-2xl text-secondary font-bold mt-6 mb-4">RECETA MÉDICA</Text>
        <View className="bg-black-200 p-4 rounded-lg mb-6">
          <Text className="text-white font-semibold text-lg mb-2">Paciente: {cita?.paciente.nombre}</Text>
          <Text className="text-gray-400">Fecha: {cita?.fechaHora ? new Date(cita.fechaHora).toLocaleDateString() : 'N/A'}</Text>
          <Text className="text-gray-400">Motivo: {cita?.motivo || 'No especificado'}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-white font-medium mb-2">Anotaciones:</Text>
          <TextInput
            className="bg-black-200 p-4 rounded-lg border border-gray-700 text-white"
            value={anotaciones}
            onChangeText={setAnotaciones}
            placeholder="Escribe las observaciones médicas..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
            editable={!receta}
          />
        </View>

        {!receta && (
          <CustomButton title="Crear Receta" handlePress={crearReceta} containerStyles="mb-6" />
        )}

        {receta && (
          <>
            <Text className="text-white font-medium mb-2">Medicamentos recetados:</Text>
            {medicamentos.length === 0 ? (
              <Text className="text-gray-400 p-2">No hay medicamentos agregados</Text>
            ) : (
              <View className="space-y-2">
                {medicamentos.map(med => (
                  <MedicamentoCard
                    key={med.idMedicamentoRecetado}
                    medicamento={med}
                    onDelete={() => eliminarMedicamento(med.idMedicamentoRecetado)}
                  />
                ))}
              </View>
            )}

            <Text className="text-white font-medium mt-6 mb-2">Agregar medicamento:</Text>
            <ScrollView className="max-h-64 border border-gray-700 rounded-lg p-2"   showsVerticalScrollIndicator={false}  // ← Esta es la línea clave
            >
                {medicamentosDisponibles.map(med => (
                  <TouchableOpacity
                    key={`medicamento-${med.id}`}
                    className="bg-gray-800 p-4 rounded-lg mb-2"
                    onPress={() => agregarMedicamentoModal(med)}
                  >
                    <Text className="text-white font-medium">{med.nombre}</Text>
                    <Text className="text-gray-400 text-sm">
                      {med.presentacion} - {med.tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <CustomButton
              title={isSubmitting ? "Guardando..." : "Guardar Receta"}
              handlePress={guardarReceta}
              isLoading={isSubmitting}
              containerStyles="mt-6 mb-8"
            />
          </>
        )}
      </ScrollView>

      {/* Modal para agregar medicamento */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMedModalVisible}
        onRequestClose={() => setIsMedModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-black-200 p-6 rounded-lg w-11/12">
            <Text className="text-white text-xl font-bold mb-4">
              Agregar {selectedMedicamento?.nombre}
            </Text>

            <Text className="text-white mb-1">Frecuencia (HH:mm):</Text>
            <TextInput
              className="bg-gray-800 text-white p-3 rounded mb-3"
              value={frecuencia}
              onChangeText={setFrecuencia}
              placeholder="Ej: 08:00"
              keyboardType="numbers-and-punctuation"
            />

            <Text className="text-white mb-1">Número de días:</Text>
            <TextInput
              className="bg-gray-800 text-white p-3 rounded mb-3"
              value={numeroDias}
              onChangeText={setNumeroDias}
              keyboardType="numeric"
            />

            <Text className="text-white mb-1">Cantidad por dosis:</Text>
            <TextInput
              className="bg-gray-800 text-white p-3 rounded mb-6"
              value={cantidadDosis}
              onChangeText={setCantidadDosis}
              placeholder="Ej: 1 tableta, 10ml"
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-600 px-6 py-3 rounded"
                onPress={() => setIsMedModalVisible(false)}
              >
                <Text className="text-white">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-secondary px-6 py-3 rounded"
                onPress={agregarMedicamento}
              >
                <Text className="text-white">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar backgroundColor="#161622" />
    </SafeAreaView>
  );
};

export default RecetaMedicaScreen;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, Image, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../constants';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DoctorCard from '@/components/DoctorCard';

const BookAppointment = () => {
  // Estados
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("Consulta médica");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Tipos
  type Doctor = {
    id: string;
    name: string;
    specialty: string;
    horaInicio: string;
    horaFin: string;
    sexo: 'Masculino' | 'Femenino'; 
  };

  // Formatear fecha para el backend
  const formatForBackend = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };

  // Obtener día de la semana en español
  const getWeekDay = (date: Date): string => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return days[date.getDay()];
  };

  // Generar slots de tiempo
  const generateTimeSlots = (start: string, end: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${currentHour}:${currentMin.toString().padStart(2, '0')}`);
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
    
    return slots;
  };

  const fetchAvailableDoctors = async () => {
    setIsLoadingDoctors(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de sesión');
        router.replace('/(auth)/sign-in');
        return;
      }
  
      // Cambiamos a GET con parámetro query
      const response = await axios.get(
        `http://localhost:8080/api/pacientes/citas/disponibilidad/horarios-medicos?diaSemana=${getWeekDay(date)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
  
      // Verificar si hay datos de doctores
      if (!response.data.data || response.data.data.length === 0) {
        Alert.alert('Información', 'No hay doctores disponibles para este día');
        setDoctors([]);
        return;
      }
  
      // Adaptamos la estructura de respuesta
      const doctorsData = response.data.data.map((item: any) => ({
        id: item.medicoId.toString(),
        name: item.medicoNombre,
        specialty: item.especialidad,
        horaInicio: item.horaInicio,
        horaFin: item.horaFin,
        sexo: item.sexo
      }));

      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          Alert.alert('Sesión expirada', 'Por favor inicia sesión nuevamente');
          router.replace('/(auth)/sign-in');
        } else if (error.response?.status === 404) {
          Alert.alert('Información', 'No hay doctores disponibles para esta fecha');
          setDoctors([]);
        } else {
          Alert.alert('Error', 'No se pudieron cargar los doctores disponibles');
        }
      }
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  // Agendar cita
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedTime) {
      Alert.alert('Error', 'Por favor selecciona doctor y horario');
      return;
    }
  
    setIsSubmitting(true);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No se encontró el token de sesión');
        return;
      }

      const [hours, minutes] = selectedTime.split(':');
      const appointmentDate = new Date(date);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const response = await axios.post(
        `http://localhost:8080/api/pacientes/citas/${selectedDoctor}`,
        {
          fechaHora: formatForBackend(appointmentDate),
          duracion: 30,
          motivo: reason || 'Consulta médica'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.error === false) {
        Alert.alert('Éxito', response.data.message || 'Cita agendada correctamente');
        router.replace("/(tabs)/profile");
      } else {
        Alert.alert('Error', response.data.message || 'Error al agendar la cita');
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          Alert.alert('Error', 'No tienes permiso para esta acción. Por favor inicia sesión nuevamente.');
        } else {
          Alert.alert('Error', error.response?.data?.message || 'Error al agendar la cita');
        }
      } else if (error instanceof Error) {
        Alert.alert('Error', error.message || 'Ocurrió un error inesperado');
      } else {
        Alert.alert('Error', 'Ocurrió un error desconocido');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar doctores al cambiar la fecha
  useEffect(() => {
    fetchAvailableDoctors();
  }, [date]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4">
        <Text className="text-2xl text-secondary font-bold mt-6 mb-8">NUEVA CITA</Text>

        {/* Selector de fecha */}
        <View className="mb-8">
          <Text className="text-lg text-white font-medium mb-4">Selecciona una fecha:</Text>
          <TouchableOpacity
            className="flex-row items-center bg-black-200 p-4 rounded-lg border-2 border-gray-700"
            onPress={() => setShowDatePicker(true)}
          >
            <Image source={icons.calendar} className="w-8 h-8 mr-3" resizeMode="contain" />
            <Text className="text-white">
              {date.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                  setSelectedDoctor(null);
                  setSelectedTime(null);
                }
              }}
            />
          )}
        </View>

        {/* Lista de doctores con ScrollView */}
        <View className="mb-8">
          <Text className="text-lg text-white font-medium mb-4">Selecciona un doctor:</Text>
          
          {isLoadingDoctors ? (
          <ActivityIndicator size="large" color="#62A8E5" />
          ) : doctors.length > 0 ? (
              <ScrollView 
                className="max-h-64 border border-gray-700 rounded-lg p-2"
                showsVerticalScrollIndicator={true}
              >
                {doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={selectedDoctor === doctor.id}
                    onPress={() => {
                      setSelectedDoctor(doctor.id);
                      const slots = generateTimeSlots(doctor.horaInicio, doctor.horaFin);
                      setAvailableSlots(slots);
                      setSelectedTime(null);
                    }}
                  />
                ))}
                </ScrollView>
                ) : (
                <Text className="text-gray-400 p-4">No hay doctores disponibles para esta fecha</Text>
              )}
        </View>

        {/* Horarios disponibles */}
        {selectedDoctor && (
          <View className="mb-8">
            <Text className="text-lg text-white font-medium mb-4">Selecciona un horario:</Text>
            <ScrollView horizontal className="max-h-40 border border-gray-700 rounded-lg p-2">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`p-5 mr-2 rounded-lg ${
                      selectedTime === slot ? 'bg-terciary' : 'bg-gray-700'
                    }`}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text className={`text-white ${selectedTime === slot ? 'font-semibold' : ''}`}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-gray-400">No hay horarios disponibles</Text>
              )}
            </ScrollView>
          </View>
        )}

        {/* Motivo de la consulta */}
        {selectedDoctor && selectedTime && (
          <View className="mb-8">
            <Text className="text-lg text-white font-medium mb-4">Motivo de la consulta:</Text>
            <TextInput
              className="bg-black-200 p-4 rounded-lg border-2 border-gray-700 text-white"
              value={reason}
              onChangeText={setReason}
              placeholder="Describe el motivo de tu consulta"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Botón para agendar */}
        <View className="mb-10">
          <CustomButton
            title={isSubmitting ? "Agendando..." : "Agendar Cita"}
            handlePress={handleBookAppointment}
            isLoading={isSubmitting}
            containerStyles="mt-6"
            //disabled={isSubmitting || !selectedDoctor || !selectedTime}
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" />
    </SafeAreaView>
  );
};

export default BookAppointment;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '../../constants';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Book = () => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // Para guardar el horario seleccionado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; name: string; specialty: string; horarios: string[] }[]>([]);

  useEffect(() => {
    fetchDoctors();
  }, [date]);

  const getDayOfWeek = (date: Date): string => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return days[date.getDay()];
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    const dayOfWeek = getDayOfWeek(date);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:8080/api/pacientes/horarios/citas',
        { diaSemana: dayOfWeek },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const doctorMap = response.data.data.reduce((acc: any, item: any) => {
        const doctorId = item.medico.idUsuario;
        const doctorName = item.medico.nombre;
        const doctorSpecialty = item.medico.especialidad;
        const horario = `${item.horaInicio} - ${item.horaFin}`;

        if (!acc[doctorId]) {
          acc[doctorId] = {
            id: doctorId,
            name: doctorName,
            specialty: doctorSpecialty,
            horarios: [],
          };
        }
        acc[doctorId].horarios.push(horario);
        return acc;
      }, {});

      setDoctors(Object.values(doctorMap));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron obtener los horarios disponibles.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateHorarios = (horaInicio: string, horaFin: string) => {
    const horarios = [];
    let start = new Date(`1970-01-01T${horaInicio}:00`);
    let end = new Date(`1970-01-01T${horaFin}:00`);

    while (start < end) {
      const hours = start.getHours();
      const minutes = start.getMinutes() === 0 ? '00' : '30';
      horarios.push(`${hours}:${minutes}`);
      start.setMinutes(start.getMinutes() + 30);
    }

    return horarios;
  };

  const handleSelectTime = (horario: string) => {
    setSelectedTime(horario === selectedTime ? null : horario); // Deselect if already selected
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4">
        <Text className="text-2xl text-white font-semibold mt-6 mb-8">Agendar Nueva Cita</Text>

        {/* Selección de fecha */}
        <View className="mb-8">
          <Text className="text-lg text-white font-medium mb-4">Selecciona una fecha:</Text>
          <TouchableOpacity
            className="flex-row items-center bg-black-200 p-4 rounded-lg border-2 border-gray-700"
            onPress={() => setShow(true)}
          >
            <Image source={icons.calendar} className="w-5 h-5 mr-3" resizeMode="contain" />
            <Text className="text-white">
              {date.toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              testID="datePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={(event, selectedDate) => {
                setShow(false);
                setDate(selectedDate || date);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Selección de doctor */}
        <View className="mb-8">
          <Text className="text-lg text-white font-medium mb-4">Selecciona un doctor:</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#62A8E5" />
          ) : (
            doctors.map((doctor) => (
              <TouchableOpacity
                key={doctor.id}
                className={`p-4 rounded-lg border-2 ${
                  selectedDoctor === doctor.id ? 'border-secondary bg-black-200' : 'border-gray-700'
                }`}
                onPress={() => {
                  setSelectedDoctor(doctor.id);
                  setSelectedHorarios(doctor.horarios.flatMap((horario) => {
                    const [horaInicio, horaFin] = horario.split(' - ');
                    return generateHorarios(horaInicio, horaFin);
                  }));
                }}
              >
                <Text className="text-white font-semibold text-lg">{doctor.name}</Text>
                <Text className="text-gray-400">{doctor.specialty}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Selección de horario en un ScrollView horizontal */}
        {selectedDoctor && (
          <View className="mb-8">
            <Text className="text-lg text-white font-medium mb-4">Selecciona un horario:</Text>
            <ScrollView horizontal className="max-h-40 border border-gray-700 rounded-lg p-2">
              {selectedHorarios.length > 0 ? (
                selectedHorarios.map((horario, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`p-5 border-b border-gray-600 ${
                      selectedTime === horario ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                    onPress={() => handleSelectTime(horario)}
                  >
                    <Text className={`text-white ${selectedTime === horario ? 'font-semibold' : ''}`}>{horario}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-gray-400">No hay horarios disponibles</Text>
              )}
            </ScrollView>
          </View>
        )}

        {/* Botón para agendar */}
        <View className="mb-10">
          <CustomButton title="Agendar Cita" handlePress={() => Alert.alert('Cita Agendada')} containerStyles="mt-6" />
        </View>
      </ScrollView>
      <StatusBar backgroundColor={'#161622'} />
    </SafeAreaView>
  );
};

export default Book;
